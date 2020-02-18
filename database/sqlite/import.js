const assert = require('assert');
const fs = require('fs');
const path = require('path');
const readline = require('readline');
const sqlite = require('better-sqlite3');
const ranges = require('../data/chromosome_ranges.json');
const libR = require('lib-r-math.js');
const { ChiSquared, R: { numberPrecision } } = libR;
//uses as default: "Inversion" and "Mersenne-Twister"
const precision4 = numberPrecision(4)
const { qchisq } = ChiSquared();

// retrieve arguments
const argv = process.argv.slice(2);
if (argv.length !== 4 || argv.includes('-h')) {
    console.log(`USAGE: node import.js input.meta output.db schema[ewing/mel/rcc] table_suffix[male/female/all]`)
    process.exit(0);
}

// parse arguments and set defaults
const [ inputFilePath, databaseFilePath, schema, tableSuffix ] = argv;
const dbExists =  fs.existsSync(databaseFilePath);

// input file should exist
if (!fs.existsSync(inputFilePath)) {
    console.error(`ERROR: ${inputFilePath} does not exist.`);
    process.exit(1);
}

// maps rows to objects for the default schema
const mapToSchema = {
    ewing: values => {
        const [chr, bp, snp, a1, a2, n, p, p_r, or, or_r, q, i] = values;
        return {chr, bp, snp, a1, a2, n, p, p_r, or, or_r, q, i};
    },
    mel: values => {
        const [chr, bp, snp, a1, a2, n, p, p_r, or, or_r, q, i, case_n, control_n, sample_n, se_fixed, z_fixed, rsid] = values;
        return {chr, bp, snp, a1, a2, n, p, p_r, or, or_r, q, i};
        // return {chr: +chr.replace('chr', ''), r, bp, snp, a1, a2, n, p, p_r, or, or_r, q, i};
    },
    rcc: values => {
        // use this map once we have the original rcc.txt
        // const [snp, chr, loc, group, category, info, num_control, num_case, reference_allele, effect_allele, effect_allele_freq_control, effect_allele_freq_case, or, ci, p, phet, i2] = values;

        const [id, chr, bp, snp, a1, a2, p, or, i2] = values;

        return {
            chr,
            bp,
            snp,
            a1,
            a2,
            n: null,
            p,
            p_r: null,
            or,
            or_r: null,
            q: null,
            i: i2
        };
    },
};

// set up utility functions/constants
const startTime = new Date();
const duration = _ => ((new Date() - startTime) / 1000).toPrecision(4);
const readFile = filepath => fs.readFileSync(path.resolve(__dirname, filepath), 'utf8');

// floors a value to the lowest multiple of the size given (usually a power of 10)
const group = (value, size) =>
    (value === null || value === undefined || isNaN(value)) ? null : +(
        size * Math.floor(value / size)
    ).toPrecision(12);

// parses each line in the file
const parseLine = line => line.trim().split(/,|\s+/).map(value => {
    if (value === 'NA') return null; // nulls are represented as 'NA' values
    else if (!isNaN(value)) return parseFloat(value); // try to parse nums as floats
    return value;
});

// gets the first line in a file
const getFirstLine = filepath => {
    const size = 4096;
    const buffer = Buffer.alloc(size);
    fs.readSync(fs.openSync(filepath, 'r'), buffer, 0, size);
    const contents = buffer.toString();
    return contents.substring(0, contents.indexOf('\n')).trim();
};

// validate headers
const headers = {
    ewing: ['CHR','BP','SNP','A1','A2','N','P','P(R)','OR','OR(R)','Q','I'],
    mel: ['CHR','BP','SNP','A1','A2','N','P','P.R.','OR','OR.R.','Q','I','Case_N','Control_N','Sample_N','SE_fixed','Z_fixed','RSID'],
    // rcc: ['SNP','CHR','LOC','GROUP','CATEGORY','INFO','NUM_CONTROL','NUM_CASE','REFERENCE_ALLELE','EFFECT_ALLELE','EFFECT_ALLELE_FREQ_CONTROL', "EFFECT_ALLELE_FREQ_CASE",'OR','CI','P','Phet','I2'],
}[schema];

if (headers) {
    const firstLine = parseLine(getFirstLine(inputFilePath));
    assert.deepStrictEqual(firstLine, headers, `Headers do not match expected values: ${headers}`, firstLine);
}

// create variant_stage (temp), variant, variant_summary, and variant_lookup
const db = new sqlite(databaseFilePath);

if (!dbExists) {
    // execute schema script for new databases
    console.log(`[${duration()} s] Creating new database...`);
    db.exec(readFile('schema.sql'));
}
else {
    // otherwise, drop indexes to speed up insertion
    console.log(`[${duration()} s] Dropping indexes...`);
    db.exec(readFile('drop-indexes.sql'));
}

const ppoints = (n, limit, a) => {
    var size = limit ? Math.min(n, limit) : n;
    var points = new Array(size);
    for (var i = 0; i < points.length; i ++)
        points[i] = ppoint(n, i, a);
    return points;
};

const ppoint = (n, i, a) => {
    if (!a) {
        a = n <= 10 ? 3/8 : 1/2;
    }
    i ++;
    return parseFloat((Math.abs(Math.log10((i - a) / (n + (1 - a) - a)) * - 1.0)).toFixed(3));
};

const getIntervals = (maxValue, length) => {
    var sqMax = Math.sqrt(maxValue);

    const fx = (x) => {
        return Math.round(maxValue - Math.pow(x - sqMax, 2));
    }

    var intervals = [];
    for (var i = 1; i <= length; i ++) {
        var x = (i / length) * sqMax;
        var interval = fx(x);
        if (interval > 0 && !intervals.includes(interval)) {
            intervals.push(interval);
        }
    }

    return intervals;
}

const insert = db.prepare(`
    INSERT INTO variant_stage VALUES (
        :chr,
        :bp,
        :bp_1000kb,
        :bp_abs,
        :bp_abs_1000kb,
        :snp,
        :a1,
        :a2,
        :n,
        :p,
        :nlog_p,
        :nlog_p2,
        :p_r,
        :or,
        :or_r,
        :q,
        :i,
        :expected_p,
        :plot_qq
    )
`);

// stream the input file line by line
const reader = readline.createInterface({
    input: fs.createReadStream(inputFilePath)
});

let count = 0;
let previousChr = 1;
let bpOffset = 0;

db.exec('BEGIN TRANSACTION');

reader.on('line', line => {
    // trim, split by spaces, and parse 'NA' as null
    const values = parseLine(line);
    const params = mapToSchema[schema](values);
    const {chr, bp, p} = params;

    // validate line (not first line, p value not null or non-numeric, bp within grch38)
    if (++count === 0 || isNaN(p) || p === null || p === undefined || p < 0 || p > 1) {
        return;
    }

    // group base pairs
    params.bp_1000kb = group(bp, 10**6);

    // calculate -log10(p) and group its values
    params.nlog_p = p ? -Math.log10(p) : null;
    params.nlog_p2 = group(params.nlog_p, 10**-2);

    // determine absolute position of variant relative to the start of the genome
    if (chr != previousChr) {
        bpOffset = chr > 1 ? ranges[chr - 2].max_bp_abs : 0;
        previousChr = chr;
    }

    // store the absolute BP and group by megabases
    params.bp_abs = bpOffset + bp;
    params.bp_abs_1000kb = group(params.bp_abs, 10**6);

    // initialize plot_qq to (0) false
    params.plot_qq = 0;

    // initiaize expected_p to 0
    params.expected_p = 0

    insert.run(params);

    // show progress message every 10000 rows
    if (count % 10000 === 0)
        console.log(`[${duration()} s] Read ${count} rows`);
});

reader.on('close', () => {
    // db.exec('COMMIT');

    // store variant table (variant_stage should not be used beyond this point)
    console.log(`[${duration()} s] Storing variants...`);
    db.exec(`
        INSERT INTO variant_${tableSuffix} SELECT
            null, "chr", "bp", "snp", "a1", "a2", "n", "p", "nlog_p", "p_r", "or", "or_r", "q", "i", "expected_p", "plot_qq"
        FROM variant_stage
        ORDER BY p DESC;
    `);

    // store aggregate table for variants
    console.log(`[${duration()} s] Storing summary...`);
    db.exec(`
        INSERT INTO aggregate_${tableSuffix} SELECT DISTINCT
            chr, bp_abs_1000kb, nlog_p2
        FROM variant_stage;
    `);

    // store metadata
    console.log(`[${duration()} s] Storing metadata...`);
    const insertMetadata = db.prepare(`
        INSERT INTO variant_metadata (key, value)
        VALUES (:key, :value)
        ON CONFLICT(key) DO UPDATE
        SET value = excluded.value;
    `);

    // insert chromosome counts (eg: count_female_1)
    const counts = db.prepare(`
        SELECT chr, count(*) as count
        FROM variant_${tableSuffix}
        GROUP BY chr;
    `).all();
    counts.forEach(({chr, count}) => insertMetadata.run({
        key: `count_${tableSuffix}_${chr}`,
        value: count
    }));

    // insert total count (eg: count_male)
    const totalCount = db.prepare(`
        SELECT count(*)
        FROM variant_${tableSuffix}
    `).pluck().get();
    insertMetadata.run({
        key: `count_${tableSuffix}`,
        value: totalCount
    });

    // calculating lambdaGC (eg: lambdagc_male)
    console.log(`[${duration()} s] Calculating lambdaGC value...`);
    const pMedian = db.prepare(`
        SELECT AVG(p) AS "median"
        FROM (
            SELECT "p"
            FROM variant_${tableSuffix}
            ORDER BY "p"
            LIMIT 2 - (SELECT COUNT(*) FROM variant_${tableSuffix}) % 2
            OFFSET (
                SELECT (COUNT(*) - 1) / 2
                FROM variant_${tableSuffix}
            )
        )
    `).pluck().get();
    // console.log("pMedian", pMedian);
    const lambdaGC = precision4((qchisq(1 - pMedian, 1) / qchisq(0.5, 1)));
    // console.log("lambdaGC", lambdaGC);
    insertMetadata.run({
        key: `lambdagc_${tableSuffix}`,
        value: lambdaGC
    });

    // updating variants table with expected nlog_p values
    console.log(`[${duration()} s] Updating expected p-values...`);
    const updateExpectedP = db.prepare(`
        UPDATE variant_${tableSuffix}
        SET expected_p = :expected_p
        WHERE variant_id = :id
    `);
    const expected_p = ppoints(totalCount);
    for (let id = 0; id < totalCount; id++) {
        updateExpectedP.run({
            id: id + 1,
            expected_p: expected_p[totalCount - id - 1]
        });
    }

    // updating variants table with Q-Q plot flag
    console.log(`[${duration()} s] Updating plot_qq values...`);
    const updatePlotQQ = db.prepare(`
        UPDATE variant_${tableSuffix}
        SET plot_qq = 1
        WHERE variant_id = :id
    `);
    const plotQQIntervals = getIntervals(totalCount, 10000);
    for (let id of plotQQIntervals) {
        updatePlotQQ.run({id});
    }

    db.exec('COMMIT');

    // drop staging table
    db.exec(`DELETE FROM variant_stage`);

    // create indexes only if tableSuffix === 'male' (last data inserted)
    if (tableSuffix === 'male') {
        console.log(`[${duration()} s] Indexing...`);
        db.exec(readFile('indexes.sql'));
    }

    // close database
    console.log(`[${duration()} s] Finalizing database...`);
    db.close();
    console.log(`[${duration()} s] Created database`);
});

const assert = require('assert');
const fs = require('fs');
const path = require('path');
const readline = require('readline');
const sqlite = require('better-sqlite3');
const ranges = require('../data/chromosome_ranges.json');

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
    value === null ? null : +(
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
        :i
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
    if (++count === 0 || p === null || isNaN(p) || bp > ranges[chr - 1].bp_max) {
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

    insert.run(params);

    // show progress message every 10000 rows
    if (count % 10000 === 0)
        console.log(`[${duration()} s] Read ${count} rows`);
});

reader.on('close', () => {
    db.exec('COMMIT');

    // store variant table (variant_stage should not be used beyond this point)
    console.log(`[${duration()} s] Storing variants...`);
    db.exec(`
        INSERT INTO variant_${tableSuffix} SELECT
            null, "chr", "bp", "snp", "a1", "a2", "n", "p", "nlog_p", "p_r", "or", "or_r", "q", "i"
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

    // drop staging table
    db.exec(`DELETE FROM variant_stage`);

    // create indexes
    console.log(`[${duration()} s] Indexing...`);
    db.exec(readFile('indexes.sql'));

    // close database
    console.log(`[${duration()} s] Finalizing database...`);
    db.close();
    console.log(`[${duration()} s] Created database`);
});

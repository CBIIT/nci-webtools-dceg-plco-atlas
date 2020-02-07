const assert = require('assert');
const fs = require('fs');
const path = require('path');
const readline = require('readline');
const sqlite = require('better-sqlite3');
const ranges = require('../data/chromosome_ranges.json');

// retrieve arguments
const argv = process.argv.slice(2);
if (argv.length !== 2 || argv.includes('-h')) {
    console.log(`USAGE: node import.js input.meta output.db`)
    process.exit(0);
}

// parse arguments and set defaults
let [ inputFilePath, databaseFilePath ] = argv;
databaseFilePath = databaseFilePath || 'output.db';

// input file should exist
if (!fs.existsSync(inputFilePath)) {
    console.error(`ERROR: ${inputFilePath} does not exist.`)
    process.exit(1);
}

// db file should not already exist
if (fs.existsSync(databaseFilePath)) {
    console.error(`ERROR: ${databaseFilePath} already exists.`)
    process.exit(2);
}

// set up utility functions/constants
const startTime = new Date();
const duration = _ => ((new Date() - startTime) / 1000).toPrecision(4);
const readFile = filepath => fs.readFileSync(path.resolve(__dirname, filepath), 'utf8');

// floors a value to the lowest multiple of the size given (usually a power of 10)
const groupFunc = (value, size) =>
    value === null ? null : +(
        size * Math.floor(value / size)
    ).toPrecision(12);

// parses each line in the file
const parseLine = line => line.trim().split(/\s+/).map(value => {
    if (value === 'NA') return null; // nulls are represented as 'NA' values
    else if (!isNaN(value)) return parseFloat(value); // try to parse nums as floats
    return value;
});

// gets the first line in a file
const getFirstLine = filepath => {
    const size = 2048;
    const buffer = Buffer.alloc(size);
    fs.readSync(fs.openSync(filepath, 'r'), buffer, 0, size);
    const contents = buffer.toString();
    return contents.substring(0, contents.indexOf('\n')).trim();
}
// SNP	CHR	LOC	GROUP	CATEGORY	INFO	NUM_CONTROL	NUM_CASE	REFERENCE_ALLELE	EFFECT_ALLELE	EFFECT_ALLELE_FREQ_CONTROL	EFFECT_ALLELE_FREQ_CASE	OR	CI	P	Phet	I2
// validate headers
const headers = ['SNP','CHR','LOC','GROUP','CATEGORY','INFO','NUM_CONTROL','NUM_CASE','REFERENCE_ALLELE','EFFECT_ALLELE','EFFECT_ALLELE_FREQ_CONTROL', "EFFECT_ALLELE_FREQ_CASE",'OR','CI','P','Phet','I2'];
const firstLine = parseLine(getFirstLine(inputFilePath));
assert.deepStrictEqual(firstLine, headers, `Headers do not match expected values: ${headers}`);

// create variant_stage (temp), variant, variant_summary, and variant_lookup
const db = new sqlite(databaseFilePath);
db.exec(readFile('schema-rcc.sql'));

const insert = db.prepare(`
    INSERT INTO variant_stage VALUES (
        :snp,
        :chr,
        :loc,
        :bp_1000kb,
        :bp_abs,
        :bp_abs_1000kb,
        :reference_allele,
        :effect_allele,
        :p,
        :nlog_p,
        :nlog_p2,
        :or,
        :i2,
        :group,
        :category,
        :info,
        :num_control,
        :num_case,
        :effect_allele_freq_control,
        :effect_allele_freq_case,
        :ci,
        :phet
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
    // skip first line
    if (count++ === 0) return;

    // trim, split by spaces, and parse 'NA' as null
    const values = parseLine(line);
    // const [chr, bp, snp, a1, a2, n, p, p_r, or, or_r, q, i] = values;
    const [snp, chr, loc, group, category, info, num_control, num_case, reference_allele, effect_allele, effect_allele_freq_control, effect_allele_freq_case, or, ci, p, phet, i2] = values;
    const params = {snp, chr, loc, group, category, info, num_control, num_case, reference_allele, effect_allele, effect_allele_freq_control, effect_allele_freq_case, or, ci, p, phet, i2};

    // remove 'chr' prefix from some chromosomes
    let chr_strip = params.chr.toString();
    params.chr = +chr_strip.replace(/chr/i, "");

    // group base pairs
    params.bp_1000kb = groupFunc(params.loc, 10**6);

    // calculate -log10(p) and group its values
    params.nlog_p = params.p ? -Math.log10(params.p) : null;
    params.nlog_p2 = groupFunc(params.nlog_p, 10**-2);

    // determine absolute position of variant relative to the start of the genome
    // if (+params.chr > +previousChr) {

        // bpOffset = ranges[params.chr - 1].max_bp_abs;
        // previousChr = +params.chr;
    // }
    bpOffset = params.chr > 1
        ? ranges[params.chr - 2].max_bp_abs
        : 0;

    // store the absolute BP and group by megabases
    params.bp_abs = bpOffset + loc;
    params.bp_abs_1000kb = groupFunc(params.bp_abs, 10**6);

    insert.run(params);

    // show progress message every 10000 rows
    if (count % 10000 === 0)
        console.log(`[${duration()} s] Inserted ${count} rows`);
});

reader.on('close', () => {
    db.exec('COMMIT');

    // store variant table
    console.log(`[${duration()} s] Storing variants...`);
    db.exec(`
        INSERT INTO variant SELECT
            null, "chr", "bp", "snp", "a1", "a2", "p", "nlog_p", "or", "i2"
        FROM variant_stage;
    `);

    // store summary table for variants
    console.log(`[${duration()} s] Storing summary...`);
    db.exec(`
        INSERT INTO variant_summary SELECT DISTINCT
            chr, bp_abs_1000kb, nlog_p2
        FROM variant_stage;
    `);

    // drop staging table
    db.exec(`DROP TABLE variant_stage`);

    // create indexes
    console.log(`[${duration()} s] Indexing...`);
    db.exec(readFile('indexes.sql'));

    // close database
    console.log(`[${duration()} s] Finalizing database...`);
    db.close();
    console.log(`[${duration()} s] Created database`);
});

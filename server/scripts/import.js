const assert = require('assert');
const fs = require('fs');
const path = require('path');
const readline = require('readline');
const sqlite = require('better-sqlite3');
const ranges = require('./variant_ranges.json');

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
const group = (value, size) =>
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
    fs.readSync(fs.openSync(filepath), buffer, 0, size);
    const contents = buffer.toString();
    return contents.substring(0, contents.indexOf('\n')).trim();
}

// validate headers
const headers = ['CHR','BP','SNP','A1','A2','N','P','P(R)','OR','OR(R)','Q','I'];
const firstLine = parseLine(getFirstLine(inputFilePath));
assert.deepStrictEqual(firstLine, headers, `Headers do not match expected values: ${headers}`);

// create variant_stage (temp), variant, variant_summary, and variant_lookup
const db = new sqlite(databaseFilePath);
db.exec(readFile('schema.sql'));

const insert = db.prepare(`
    INSERT INTO variant_stage VALUES (
        :CHR,
        :BP,
        :BP_1000KB,
        :BP_ABS,
        :BP_ABS_1000KB,
        :SNP,
        :A1,
        :A2,
        :N,
        :P,
        :NLOG_P,
        :NLOG_P2,
        :P_R,
        :OR,
        :OR_R,
        :Q,
        :I
    )
`);

// stream the input file line by line
const reader = readline.createInterface({
    input: fs.createReadStream(inputFilePath)
});

let count = 0;
let bpPrev = 0;
let bpOffset = 0;

db.exec('BEGIN TRANSACTION');

reader.on('line', line => {
    // skip first line
    if (count++ === 0) return;

    // trim, split by spaces, and parse 'NA' as null
    const values = parseLine(line);

    const [CHR, BP, SNP, A1, A2, N, P, P_R, OR, OR_R, Q, I] = values;
    const params = {CHR, BP, SNP, A1, A2, N, P, P_R, OR, OR_R, Q, I};

    // group base pairs
    params.BP_1000KB = group(BP, 10**6);

    // calculate -log10(p) and group its values
    params.NLOG_P = P ? -Math.log10(P) : null;
    params.NLOG_P2 = group(params.NLOG_P, 10**-2);

    // determine absolute position of variant relative to the start of the genome
    if (bpPrev > BP)
        bpOffset += bpPrev;

    bpPrev = BP;

    // store the absolute BP and group by megabases
    params.BP_ABS = bpOffset + BP;
    params.BP_ABS_1000KB = group(params.BP_ABS, 10**6);

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
            NULL, "CHR", "BP", "SNP", "A1", "A2", "N", "P", "NLOG_P", "P_R", "OR", "OR_R", "Q", "I"
        FROM variant_stage;
    `);

    // store summary table for variants
    console.log(`[${duration()} s] Storing summary...`);
    db.exec(`
        INSERT INTO variant_summary SELECT DISTINCT
            CHR, BP_ABS_1000KB, NLOG_P2
        FROM variant_stage;
    `);

    // drop staging table
    db.exec(`DROP variant_stage`);

    // create indexes
    console.log(`[${duration()} s] Indexing...`);
    db.exec(readFile(path.resolve(__dirname, 'indexes.sql')));

    // close database
    console.log(`[${duration()} s] Finalizing database...`);
    db.close();
    console.log(`[${duration()} s] Created database...`);
});

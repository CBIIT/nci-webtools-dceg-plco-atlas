const assert = require('assert');
const fs = require('fs');
const path = require('path');
const readline = require('readline');
const sqlite = require('better-sqlite3');
const ranges = require('../data/chromosome_ranges.json');

// retrieve arguments
const argv = process.argv.slice(2);
if (argv.length !== 2 || argv.includes('-h')) {
    console.log(`USAGE: node import-genes.js genes.csv genes.db`);
    process.exit(0);
}

// parse arguments and set defaults
const [ inputFilePath, databaseFilePath, schema, tableSuffix ] = argv;

// input file should exist
if (!fs.existsSync(inputFilePath)) {
    console.error(`ERROR: ${inputFilePath} does not exist.`);
    process.exit(1);
}

// input file should exist
if (fs.existsSync(databaseFilePath)) {
    console.error(`ERROR: ${databaseFilePath} should not exist.`);
    process.exit(1);
}

// maps rows to objects for the gene schema
const mapToSchema = values => {
    const [name, chr, strand, tx_start, tx_end, cds_start, cds_end, exon_count, exon_starts, exon_ends, protein_id, align_id] = values;
    return  {name, chr, strand, tx_start, tx_end, exon_starts, exon_ends, protein_id, align_id};
}

// set up utility functions/constants
const startTime = new Date();
const duration = _ => ((new Date() - startTime) / 1000).toPrecision(4);
const readFile = filepath => fs.readFileSync(path.resolve(__dirname, filepath), 'utf8');

// parses each line in the file
const parseLine = line => line.trim().split(/,|\s+/).map(value => {
    if (value === '') return null;
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
const headers = ['#name', 'chrom', 'strand', 'txStart', 'txEnd', 'cdsStart', 'cdsEnd', 'exonCount', 'exonStarts', 'exonEnds', 'proteinID', 'alignID'];
const firstLine = parseLine(getFirstLine(inputFilePath));
assert.deepStrictEqual(firstLine, headers, `Headers do not match expected values: ${headers} | actual values: ${firstLine}`);

// create variant_stage (temp), variant, variant_summary, and variant_lookup
const db = new sqlite(databaseFilePath);

// execute schema script for new databases
console.log(`[${duration()} s] Creating new database...`);
db.exec(readFile('gene-schema.sql'));

const insert = db.prepare(`
    INSERT INTO gene VALUES (
        :gene_id,
        :name,
        :chr,
        :strand,
        :tx_start,
        :tx_end,
        :exon_starts,
        :exon_ends,
        :protein_id,
        :align_id
    )
`);

// stream the input file line by line
const reader = readline.createInterface({
    input: fs.createReadStream(inputFilePath)
});

db.exec('BEGIN TRANSACTION');
let count = 0;
reader.on('line', line => {
    // trim, split by spaces, and parse 'NA' as null
    const values = parseLine(line);
    const params = mapToSchema(values);
    params.gene_id = null;
    params.chr = +params.chr.replace('chr', '');

    // validate line (no alt. genes, only autosomes)
    if (++count === 0 || isNaN(params.chr)) return;

    insert.run(params);

    // show progress message every 10000 rows
    if (count % 10000 === 0)
        console.log(`[${duration()} s] Read ${count} rows`);
});

reader.on('close', () => {
    db.exec('COMMIT');

    // create indexes
    console.log(`[${duration()} s] Indexing...`);
    db.exec(readFile('gene-indexes.sql'));

    // close database
    console.log(`[${duration()} s] Finalizing database...`);
    db.close();

    console.log(`[${duration()} s] Created database`);
});

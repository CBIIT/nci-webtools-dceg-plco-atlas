const assert = require('assert');
const fs = require('fs');
const readline = require('readline');
const sqlite = require('sqlite3').verbose();

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

// initialize database
const db = new sqlite.Database(databaseFilePath);
// db.run(`PRAGMA synchronous = OFF`);

// used to calculate duration
const startTime = new Date();
const duration = _ => ((new Date() - startTime) / 1000).toPrecision(4);

// ensure the following db statements are executed in the order they are created
db.serialize(() => {
    const variantTable = 'variant';
    const summaryTable = 'variant_summary';
    const rangeTable = 'variant_range';
    const headers = ['CHR','BP','SNP','A1','A2','N','P','P(R)','OR','OR(R)','Q','I'];

    // variant table stores all variant information
    db.run(`
        CREATE TABLE ${variantTable}
        (
            "CHR"           INTEGER,
            "BP"            INTEGER,
            "BP_100KB"      INTEGER, -- BP floored to the nearest multiple of 10^5 (100 kilobases)
            "BP_1000KB"     INTEGER, -- BP floored to the nearest multiple of 10^6 (1000 kilobases)
            "BP_ABS"        INTEGER, -- The absolute position from the beginning of the genome (used for plotting)
            "BP_ABS_1000KB" INTEGER, -- Absolute BP floored to the nearest multiple of 10^6 (1000 kilobases)
            "SNP"           TEXT,
            "A1"            TEXT,
            "A2"            TEXT,
            "N"             INTEGER,
            "P"             REAL,
            "NLOG_P"        REAL, -- negative log10(P)
            "NLOG_P2"       REAL, -- negative log10(P) floored to the nearest multiple of 10^-2
            "P_R"           REAL,
            "OR"            REAL,
            "OR_R"          REAL,
            "Q"             REAL,
            "I"             REAL
        );
    `);

    // stores a materialized summary view, which contains all variants at the lowest granularity
    db.run(`
        CREATE TABLE ${summaryTable}
        (
            "CHR"       INTEGER,
            "BP_1000KB" INTEGER, -- BP floored to the nearest multiple of 10^6 (1000 kilobases)
            "BP_ABS_1000KB" INTEGER, -- BP floored to the nearest multiple of 10^6 (1000 kilobases)
            "NLOG_P2"   REAL -- negative log10(P) floored to the nearest multiple of 10^-2
        );
    `);

    // stores a materialized range view for each chromosome's min/max bp and nlog_p values
    db.run(`
        CREATE TABLE ${rangeTable}
        (
            "CHR"        INTEGER,
            "MIN_BP"     INTEGER,
            "MAX_BP"     INTEGER,
            "MIN_NLOG_P" REAL,
            "MAX_NLOG_P" REAL
        );
    `);

    // set up transaction and prepare insertion statement
    db.exec('begin transaction');
    const stmt = db.prepare(`
        INSERT INTO ${variantTable} VALUES (
            $CHR,
            $BP,
            $BP_100KB,
            $BP_1000KB,
            $BP_ABS,
            $BP_ABS_1000KB,
            $SNP,
            $A1,
            $A2,
            $N,
            $P,
            $NLOG_P,
            $NLOG_P2,
            $P_R,
            $OR,
            $OR_R,
            $Q,
            $I
        )
    `);

    // stream the input file line by line
    const reader = readline.createInterface({
        input: fs.createReadStream(inputFilePath)
    });

    // floors a value to the lowest multiple of the size given (usually a power of 10)
    const group = (value, size) =>
        value === null ? null : +(
            size * Math.floor(value / size)
        ).toPrecision(12);

    // parses each line in the file
    const parseLine = line => line.trim().split(/\s+/).map(val => {
        // nulls are represented as 'NA' values
        if (val === 'NA') return null;

        // if the value is a number, parse it as a number
        else if (!isNaN(val)) return parseFloat(val);

        // otherwise, return it as-is
        else return val;
    });

    let count = 0;
    let bpOffset = 0;
    let bpPrev = 0;

    reader.on('line', line => {
        // trim, split by spaces, and parse 'NA' as null
        const values = parseLine(line);

        // validate headers
        if (count++ === 0) {
            try {
                return assert.deepEqual(values, headers);
            } catch(e) {
                console.error(`ERROR: Headers do not match expected values:`, headers);
                process.exit(3);
            }
        }

        const [$CHR, $BP, $SNP, $A1, $A2, $N, $P, $P_R, $OR, $OR_R, $Q, $I] = values;
        const params = {$CHR, $BP, $SNP, $A1, $A2, $N, $P, $P_R, $OR, $OR_R, $Q, $I};

        // group base pairs
        params.$BP_1000KB = group($BP, 10**6);
        params.$BP_100KB = group($BP, 10**5);

        // calculate -log10(p) and group its values
        params.$NLOG_P = $P ? -Math.log10($P) : null;
        params.$NLOG_P2 = group(params.$NLOG_P, 10**-2);

        // determine absolute position of variant relative to the start of the genome
        if (bpPrev > $BP)
            bpOffset += bpPrev;

        bpPrev = $BP;

        // store the absolute BP and group by megabases
        params.$BP_ABS = bpOffset + $BP;
        params.$BP_ABS_1000KB = group(params.$BP_ABS, 10**6);

        stmt.run(params);

        // show progress message every 10000 rows
        if (count % 10000 === 0)
            console.log(`[${duration()} s] Inserted ${count} rows`);
    });

    // after reading every line in the file, commit the transaction
    reader.on('close', () => {
        // stmt.finalize(); // no need to finalize statement
        db.exec('commit');

        // create indexes for columns we will be querying off
        console.log(`[${duration()} s] Inserted ${count} rows. Indexing...`);
        db.exec(`
            CREATE INDEX idx_${variantTable}_chr           ON ${variantTable}(CHR);
            CREATE INDEX idx_${variantTable}_bp            ON ${variantTable}(BP);
            CREATE INDEX idx_${variantTable}_bp_100kb      ON ${variantTable}(BP_100KB);
            CREATE INDEX idx_${variantTable}_bp_1000kb     ON ${variantTable}(BP_1000KB);
            CREATE INDEX idx_${variantTable}_bp_abs        ON ${variantTable}(BP_ABS);
            CREATE INDEX idx_${variantTable}_bp_abs_1000kb ON ${variantTable}(BP_ABS_1000KB);
            CREATE INDEX idx_${variantTable}_nlog_p        ON ${variantTable}(NLOG_P);
            CREATE INDEX idx_${variantTable}_nlog_p2       ON ${variantTable}(NLOG_P2);
        `);

        // store summary table for variants
        console.log(`[${duration()} s] Storing summary...`);
        db.exec(`
            INSERT INTO ${summaryTable} SELECT DISTINCT
                CHR, BP_1000KB, BP_ABS_1000KB, NLOG_P2
            FROM ${variantTable}
            ORDER BY CHR, BP_ABS_1000KB, NLOG_P2;

            CREATE INDEX idx_${summaryTable}_chr           ON ${summaryTable}(CHR);
            CREATE INDEX idx_${summaryTable}_bp_1000kb     ON ${summaryTable}(BP_1000KB);
            CREATE INDEX idx_${summaryTable}_bp_abs_1000kb ON ${summaryTable}(BP_ABS_1000KB);
            CREATE INDEX idx_${summaryTable}_nlog_p2       ON ${summaryTable}(NLOG_P2);
        `);

        // store min/max position and nlog_p values for each chromosome
        console.log(`[${duration()} s] Storing ranges...`);
        db.exec(`
            INSERT INTO ${rangeTable} SELECT
                CHR,
                MIN(BP) AS MIN_BP,
                MAX(BP) AS MAX_BP,
                MIN(NLOG_P) AS MIN_NLOG_P,
                MAX(NLOG_P) AS MAX_NLOG_P
            FROM ${variantTable}
            GROUP BY CHR
            ORDER BY CHR, BP;
        `);

        console.log(`[${duration()} s] Finalizing database...`);
        db.close(_ => console.log(`[${duration()} s] Created database`));
    });
});
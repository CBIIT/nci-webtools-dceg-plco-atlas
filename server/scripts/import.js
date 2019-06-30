const fs = require('fs');
const readline = require('readline');
const sqlite = require('sqlite3').verbose();

// retrieve arguments
const args = process.argv.slice(2);
if (args.length == 0) {
    console.log(`USAGE: node import.js input.meta output.db [schema.json]`)
    process.exit(0);
}

// parse arguments and set defaults
let [ inputFilePath, databaseFilePath ] = args;
databaseFilePath = databaseFilePath || 'meta.db';

// input file should exist
if (!fs.existsSync(inputFilePath)) {
    console.error(`ERROR: ${inputFilePath} does not exist.`)
    process.exit(1);
}

// db file should not already exist
if (fs.existsSync(databaseFilePath)) {
    console.error(`ERROR: ${databaseFilePath} already exists.`)
    process.exit(1);
}

// initialize database
const db = new sqlite.Database(databaseFilePath);

// used to calculate duration
const startTime = new Date();

// ensure the following db statements are run in-order
db.serialize(() => {
    const tableName = 'variants';

    db.run(`CREATE TABLE ${tableName} (
        "CHR" INTEGER,
        "BP" INTEGER,
        "BP_GROUP" INTEGER, -- BP to a precision of 10^6
        "SNP" TEXT,
        "A1" TEXT,
        "A2" TEXT,
        "N" INTEGER,
        "P" REAL,
        "NLOG_P" REAL, -- negative log10(P)
        "NLOG_P_GROUP" REAL,  -- negative log10(P) to a precision of 10^-2
        "P_R" REAL,
        "OR" REAL,
        "OR_R" REAL,
        "Q" REAL,
        "I" REAL
    )`);

    // set up transaction and prepare insertion statement
    db.exec('begin transaction');
    const stmt = db.prepare(`INSERT INTO ${tableName} VALUES (
        $CHR,
        $BP,
        $BP_GROUP,
        $SNP,
        $A1,
        $A2,
        $N,
        $P,
        $NLOG_P,
        $NLOG_P_GROUP,
        $P_R,
        $OR,
        $OR_R,
        $Q,
        $I
    )`);

    // stream the input file line by line
    const reader = readline.createInterface({
        input: fs.createReadStream(inputFilePath)
    });
    let count = 0;
    let bpGroupSize = Math.pow(10, 6);  // group base pairs by millionths
    let nlogpGroupSize = Math.pow(10, -2); // group -log(p) by hundredths

    // insert each line into the database
    reader.on('line', line => {
        // skip first line
        if (count++ == 0) return;

        // remove any spaces, and ensure 'NA' values are parsed as null
        const values = line.trim().split(/\s+/).map(e => e === 'NA' ? null : e);
        const [$CHR, $BP, $SNP, $A1, $A2, $N, $P, $P_R, $OR, $OR_R, $Q, $I] = values;
        const params = {$CHR, $BP, $SNP, $A1, $A2, $N, $P, $P_R, $OR, $OR_R, $Q, $I}
        params.$NLOG_P = $P ? -Math.log10($P) : null;
        params.$BP_GROUP = Math.floor($BP / bpGroupSize) * bpGroupSize;
        params.$NLOG_P_GROUP = Math.floor(params.$NLOG_P / nlogpGroupSize) * nlogpGroupSize;

        stmt.run(params);
        // show progress message every 10000 rows
        if (count % 10000 === 0)
            console.log(`PROGRESS: Inserted ${count} rows (${(new Date() - startTime) / 1000} s)`);
    });

    // after reading every line in the file, commit the transaction and create indexes
    reader.on('close', () => {
        // stmt.finalize();
        db.exec('commit');
        console.log(`ALMOST DONE: Inserted ${count} rows in ${(new Date() - startTime) / 1000} s. Please wait while DB is indexed.`)
        db.exec(`
            create index idx_bp on ${tableName}(BP);
            create index idx_nlog_p on ${tableName}(NLOG_P);
        `);
        db.close(_ => console.log(`DONE: Created database in ${(new Date() - startTime) / 1000} s`));
    });
});
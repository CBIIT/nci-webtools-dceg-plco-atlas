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

db.serialize(() => {

    db.run(`CREATE TABLE meta (
        "CHR" INTEGER,
        "BP" INTEGER,
        "SNP" TEXT,
        "A1" TEXT,
        "A2" TEXT,
        "N" INTEGER,
        "P" REAL,
        "P_R" REAL,
        "OR" REAL,
        "OR_R" REAL,
        "Q" REAL,
        "I" REAL
    )`);

    // set up transaction and prepare insertion statement
    db.exec('begin transaction');
    const placeholders = Array(12).fill('?').join();
    const stmt = db.prepare(`INSERT INTO meta VALUES (${placeholders})`);

    // stream the input file line by line
    const reader = readline.createInterface({
        input: fs.createReadStream(inputFilePath)
    });
    let count = 0;

    // insert each line into the database
    reader.on('line', line => {
        // remove any spaces, and ensure 'NA' values are parsed as null
        const values = line.trim().split(/\s+/).map(e => e === 'NA' ? null : e);
        stmt.run(values);

        // show progress message every 10000 rows
        if (++count % 10000 === 0)
            console.log(`PROGRESS: Inserted ${count} rows (${(new Date() - startTime) / 1000} s)`);
    });

    // after reading every line in the file, commit the transaction and create indexes
    reader.on('close', () => {
        // stmt.finalize();
        db.exec('commit');
        console.log(`ALMOST DONE: Inserted ${count} rows in ${(new Date() - startTime) / 1000} s. Please wait while DB is indexed.`)
        db.exec(`
            create index idx_meta_bp on meta(BP);
            create index idx_meta_p on meta(P);
        `);
        db.close(_ => console.log(`DONE: Created database in ${(new Date() - startTime) / 1000} s`));
    });
});
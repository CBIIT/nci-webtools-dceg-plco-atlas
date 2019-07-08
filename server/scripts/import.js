const fs = require('fs');
const readline = require('readline');
const sqlite = require('sqlite3').verbose();

// retrieve arguments
const args = process.argv.slice(2);
if (args.length === 0 || args[0] === '-h') {
    console.log(`USAGE: node import.js input.meta output.db`)
    process.exit(0);
}

// parse arguments and set defaults
let [ inputFilePath, databaseFilePath ] = args;
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

// used to calculate duration
const startTime = new Date();

// ensure the following db statements are executed in the order they are created
db.serialize(() => {
    const tableName = 'variant';

    db.run(`CREATE TABLE ${tableName} (
        "CHR" INTEGER,
        "BP" INTEGER,
        "BP_1000KB" INTEGER, -- BP to a precision of 10^6 (1 megabase)
        "BP_100KB" INTEGER, -- BP to a precision of 10^5 (100 kilobases)
        "SNP" TEXT,
        "A1" TEXT,
        "A2" TEXT,
        "N" INTEGER,
        "P" REAL,
        "NLOG_P" REAL, -- negative log10(P)
        "NLOG_P2" REAL,  -- negative log10(P) to a precision of 10^-2
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
        $BP_1000KB,
        $BP_100KB,
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
    )`);

    // stream the input file line by line
    const reader = readline.createInterface({
        input: fs.createReadStream(inputFilePath)
    });

    // floors a value to the lowest multiple of the size
    const group = (value, size) => (
        size * Math.floor(value / size)
    );

    // insert each line into the database
    let count = 0;
    reader.on('line', line => {
        // skip first line
        if (count++ === 0) return;

        // trim, split by spaces, and parse 'NA' as null
        const values = line.trim().split(/\s+/).map(e => e === 'NA' ? null : e);
        const [$CHR, $BP, $SNP, $A1, $A2, $N, $P, $P_R, $OR, $OR_R, $Q, $I] = values;
        const params = {$CHR, $BP, $SNP, $A1, $A2, $N, $P, $P_R, $OR, $OR_R, $Q, $I}

        // group base pairs
        params.$BP_1000KB = group($BP, 10**6);
        params.$BP_100KB = group($BP, 10**5);

        // calculate -log10(p) and group its values
        params.$NLOG_P = $P ? -Math.log10($P) : null;
        params.$NLOG_P2 = group(params.$NLOG_P, 10**-2);

        stmt.run(params);

        // show progress message every 10000 rows
        if (count % 10000 === 0)
            console.log(`PROGRESS: Inserted ${count} rows (${(new Date() - startTime) / 1000} s)`);
    });

    // after reading every line in the file, commit the transaction and create indexes
    reader.on('close', () => {
        // stmt.finalize();
        db.exec('commit');
        console.log(`ALMOST DONE: Inserted ${count} rows in ${(new Date() - startTime) / 1000} s. DB is being indexed...`)
        db.exec(`
            create index idx_bp on ${tableName}(BP);
            create index idx_bp_1000kb on ${tableName}(BP_1000KB);
            create index idx_bp_100kb on ${tableName}(BP_100KB);
            create index idx_nlog_p on ${tableName}(NLOG_P);
            create index idx_nlog_p2 on ${tableName}(NLOG_P2);
        `);
        db.close(_ => console.log(`DONE: Created database in ${(new Date() - startTime) / 1000} s`));
    });
});
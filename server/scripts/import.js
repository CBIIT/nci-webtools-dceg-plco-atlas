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
let [ metaFilePath, databaseFilePath ] = args;
databaseFilePath = databaseFilePath || 'meta.db';


// meta file should exist
if (!fs.existsSync(metaFilePath)) {
    console.error(`ERROR: ${metaFilePath} does not exist.`)
    process.exit(1);
}

// db file should not already exist
if (fs.existsSync(databaseFilePath)) {
    console.error(`ERROR: ${databaseFilePath} already exists.`)
    process.exit(1);
}

// create database
const db = new sqlite.Database(databaseFilePath);


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

    const reader = readline.createInterface({
        input: fs.createReadStream(metaFilePath)
    });

    reader.on('line', line => {
        console.log(line.trim().split(/\s+/));
    });

});

db.close();

const a = ` CHR          BP            SNP  A1  A2   N           P        P(R)      OR   OR(R)       Q       I
1       10177        1:10177   A  AC   3      0.9755      0.8071  1.0033  1.0433  0.0976   57.03
1       10352        1:10352   T  TA   3      0.2832      0.5357  0.8938  0.9188  0.2012   37.63
1       11008        1:11008   C   G   3      0.9723      0.9723  0.9945  0.9945  0.8376    0.00
1       11012        1:11012   C   G   3      0.9723      0.9723  0.9945  0.9945  0.8376    0.00
1       13110        1:13110   G   A   2      0.9577      0.9577  1.0140  1.0140  0.4764    0.00
1       13116        1:13116   T   G   3     0.00431     0.00431  0.6741  0.6741  0.7313    0.00
1       13118        1:13118   A   G   3     0.00431     0.00431  0.6741  0.6741  0.7313    0.00
1       13273        1:13273   G   C   3      0.4425      0.4425  0.8896  0.8896  0.9087    0.00
1       14464        1:14464   A   T   3      0.8463      0.8463  1.0275  1.0275  0.7856    0.00
1       14599        1:14599   T   A   3      0.7915      0.7915  0.9645  0.9645  0.6629    0.00
1       14604        1:14604   A   G   3      0.7915      0.7915  0.9645  0.9645  0.6629    0.00
1       14930        1:14930   A   G   3       0.276       0.276  0.8939  0.8939  0.9755    0.00
1       15211        1:15211   T   G   3      0.7993      0.7993  0.9723  0.9723  0.4326    0.00
1       15274        1:15274   A   G   3      0.3412      0.3412  1.1092  1.1092  0.6524    0.00
1       15820        1:15820   G   T   3      0.5955      0.5955  0.9407  0.9407  0.5131    0.00
1       15903        1:15903   G  GC   3      0.4746      0.4746  0.9296  0.9296  0.5576    0.00
1       30923        1:30923   G   T   3      0.3013      0.3013  0.8244  0.8244  0.8075    0.00
1       47159        1:47159   T   C   1          NA          NA      NA      NA      NA      NA
1       49298        1:49298   T   C   3       0.136       0.136  0.8106  0.8106  0.4114    0.00
1       49554        1:49554   A   G   3      0.3379      0.3379  1.1976  1.1976  0.5179    0.00
1       51479        1:51479   T   A   3      0.9494      0.9494  0.9923  0.9923  0.6478    0.00`


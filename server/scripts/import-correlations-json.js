const assert = require('assert');
const fs = require('fs');
const path = require('path');
const readline = require('readline');
const sqlite = require('better-sqlite3');

// retrieve arguments
const argv = process.argv.slice(2);
if (argv.length !== 2 || argv.includes('-h')) {
    console.log(`USAGE: node import.js input.meta output.json`)
    process.exit(0);
}

// parse arguments and set defaults
let [ inputFilePath, jsonFilePath ] = argv;
jsonFilePath = jsonFilePath || 'output.json';

// input file should exist
if (!fs.existsSync(inputFilePath)) {
    console.error(`ERROR: ${inputFilePath} does not exist.`)
    process.exit(1);
}

// db file should not already exist
if (fs.existsSync(jsonFilePath)) {
    console.error(`ERROR: ${jsonFilePath} already exists.`)
    process.exit(2);
}

// parses each line in the file
const parseLine = line => line.trim().split(/\t/).map(value => {
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

// validate headers
const headers = ['phenotype1', 'phenotype2', 'r2'];
const firstLine = parseLine(getFirstLine(inputFilePath));
assert.deepStrictEqual(firstLine, headers, `Headers do not match expected values: ${headers}`);

// stream the input file line by line
const reader = readline.createInterface({
    input: fs.createReadStream(inputFilePath)
});

let count = 0;
var out_obj = {};

reader.on('line', line => {
    // skip first line
    if (count++ === 0) return;
    // trim, split by spaces, and parse 'NA' as null
    const values = parseLine(line);
    const [phenotype1, phenotype2, r2] = values;    
    if (!(phenotype1 in out_obj)) {
        let corr = {};
        corr[phenotype2] = r2;
        out_obj[phenotype1] = corr;
    } else {
        out_obj[phenotype1][phenotype2] = r2;
    }
});

reader.on('close', () => {
    
    console.log(out_obj);
    let out_json = JSON.stringify(out_obj, null, 2);
    // save json to file
    fs.writeFile(jsonFilePath, out_json, function(err) {
        if (err) {
            console.log(err);
        }
    });

});

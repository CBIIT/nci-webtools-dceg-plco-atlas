const assert = require('assert');
const fs = require('fs');
const path = require('path');
const readline = require('readline');
const sqlite = require('better-sqlite3');

// retrieve arguments
const argv = process.argv.slice(2);
if (argv.length !== 3 || argv.includes('-h')) {
    console.log(`USAGE: node import.js input.txt phenotypes.json output.json`)
    process.exit(0);
}

// parse arguments and set defaults
let [ inputFilePath, phenotypesFilePath, jsonFilePath ] = argv;
jsonFilePath = jsonFilePath || 'output.json';

// input file should exist
if (!fs.existsSync(inputFilePath)) {
    console.error(`ERROR: ${inputFilePath} does not exist.`)
    process.exit(1);
}

// phenotypes file should exist
if (!fs.existsSync(phenotypesFilePath)) {
    console.error(`ERROR: ${phenotypesFilePath} does not exist.`)
    process.exit(1);
}

// json file should not already exist
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

// stream the correlations input file line by line
const readerCorrelations = readline.createInterface({
    input: fs.createReadStream(inputFilePath)
});

// read phenotypes json and get all phenotype leafs
const phenotypesTreeRaw = fs.readFileSync(phenotypesFilePath);
const phenotypesTree = JSON.parse(phenotypesTreeRaw);
const phenotypes = [];
const populatePhenotypes = node => {
    // only populate alphabetic phenotype list with leaf nodes
    if (node.children === undefined) {
        phenotypes.push({
        title: node.title,
        value: node.value,
        disabled: node.disabled
    });
    }
    if (node.children) node.children.forEach(populatePhenotypes);
};
phenotypesTree.forEach(populatePhenotypes, 0);
console.log("# of phenotypes = ", phenotypes.length);

// var phenotypeCorrelations = { data: [] };
var phenotypeCorrelations = {};

// create phenotype correlations object for all phenotype combinations
for (let x = 0; x < phenotypes.length; x ++) {
    for (let y = 0; y < phenotypes.length; y ++) {
        if (!(phenotypes[x].title in phenotypeCorrelations)) {
            let corr = {};
            corr[phenotypes[y].title] = null;
            phenotypeCorrelations[phenotypes[x].title] = corr;
        } else {
            phenotypeCorrelations[phenotypes[x].title][phenotypes[y].title] = 0;
        }
        // phenotypeCorrelations.data.push([phenotypes[x].title, phenotypes[x].value, phenotypes[y].title, phenotypes[y].value, 0]);
    }
}

// console.log(phenotypeCorrelations);

let count = 0;
// var out_obj = {};

readerCorrelations.on('line', line => {
    // skip first line
    if (count++ === 0) return;
    // trim, split by spaces, and parse 'NA' as null
    const values = parseLine(line);
    const [phenotype1, phenotype2, r2] = values;    

    if (phenotype1 in phenotypeCorrelations || phenotype2 in phenotypeCorrelations) {
        if (phenotype1 in phenotypeCorrelations) {
            phenotypeCorrelations[phenotype1][phenotype2] = r2;
        }
        if (phenotype2 in phenotypeCorrelations) {
            phenotypeCorrelations[phenotype2][phenotype1] = r2;
        }
    } else {
        console.log("No match", line);
    }
    // for (let i = 0; i < phenotypeCorrelations.data.length; i++) {
    //     if (phenotypeCorrelations.data[i][0] === phenotype1 && phenotypeCorrelations.data[i][2] === phenotype2) {
    //         phenotypeCorrelations.data[i][4] = r2
    //     }
    //     if (phenotypeCorrelations.data[i][0] === phenotype2 && phenotypeCorrelations.data[i][2] === phenotype1) {
    //         phenotypeCorrelations.data[i][4] = r2
    //     }
    // }
});

readerCorrelations.on('close', () => {
    let out_json = JSON.stringify(phenotypeCorrelations, null, 2);
    // save json to file
    fs.writeFile(jsonFilePath, out_json, function(err) {
        if (err) {
            console.log(err);
        }
    });
});

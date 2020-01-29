const assert = require('assert');
const fs = require('fs');
const path = require('path');
const readline = require('readline');

// streams a file file line by line
function getFileReader(filepath) {
    return readline.createInterface({
        input: fs.createReadStream(filepath)
    });
}

// reads the contents of a file
function readFile(filepath) {
    return fs.readFileSync(
        path.resolve(__dirname, filepath),
        'utf8'
    );
}

// gets the first line in a file
function readFirstLine(filepath) {
    const size = 4096;
    const buffer = Buffer.alloc(size);
    fs.readSync(fs.openSync(filepath, 'r'), buffer, 0, size);
    const contents = buffer.toString();
    return contents.substring(0, contents.indexOf('\n')).trim();
}

// parses each line in the file
function parseLine(line) {
    return line.trim().split(/,|\s+/).map(value => {
        if (value === 'NA') return null; // nulls are represented as 'NA' values
        else if (!isNaN(value)) return parseFloat(value); // try to parse nums as floats
        return value;
    });
}

function validateHeaders(filepath, headers) {
    if (!headers) return;
    const firstLine = parseLine(getFirstLine(filepath));
    assert.deepStrictEqual(firstLine, headers, `Headers do not match expected values: ${headers}`, firstLine);
}

module.exports = {
    getFileReader,
    parseLine,
    readFile,
    validateHeaders,
};
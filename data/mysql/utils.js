const assert = require('assert');
const fs = require('fs');
const path = require('path');
const fs = require('fs');
const readline = require('readline');

const libR = require('lib-r-math.js');

const { ChiSquared, R: { numberPrecision } } = libR;
//uses as default: "Inversion" and "Mersenne-Twister"
const precision4 = numberPrecision(4)
const { qchisq } = ChiSquared();

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

async function phenotypeExists(connection, phenotype) {
    return pluck(await connection.execute(
        `SELECT COUNT(1) FROM phenotype WHERE name = ?`,
        phenotype
    )) != 0;
}

async function tableExists(connection, databaseName, tableName) {
    return pluck(await connection.execute(
        `SELECT COUNT(*) as count
            FROM information_schema.tables
            WHERE table_schema = :databaseName
            AND table_name = :tableName`,
        {databaseName, tableName}
    )) != 0;
}

// gets a function which returns elapsed time
function timestamp() {
    var startTime = new Date();
    return () => ((new Date() - startTime) / 1000).toPrecision(4);
}

// floors a value to the lowest multiple of the size given (usually a power of 10)
function group (value, size) {
    var isInvalid = value === null || value === undefined || isNaN(value);
    return isInvalid ? null : +(
        size * Math.floor(value / size)
    ).toPrecision(12);
}

// retrieves a single ppoint value
function ppoint(n, i, a) {
    if (!a) {
        a = n <= 10 ? 3/8 : 1/2;
    }
    i ++;
    return parseFloat((Math.abs(Math.log10((i - a) / (n + (1 - a) - a)) * - 1.0)).toFixed(3));
}

// retrieves an array of ppoint values up to the limit
function ppoints(n, limit, a) {
    var size = limit ? Math.min(n, limit) : n;
    var points = new Array(size);
    for (var i = 0; i < points.length; i ++)
        points[i] = ppoint(n, i, a);
    return points;
}

// retrieves indexes of an array, spaced according to the negative square function
function getIntervals(maxValue, length) {
    const sqMax = Math.sqrt(maxValue);
    const fx = x => Math.round(maxValue - Math.pow(x - sqMax, 2));
    const intervals = [];

    for (let i = 1; i <= length; i ++) {
        let x = (i / length) * sqMax;
        let interval = fx(x);
        if (interval > 0 && !intervals.includes(interval)) {
            intervals.push(interval);
        }
    }

    return intervals;
}

// retrieves labmda gc value from median
function getLambdaGC(pMedian) {
    return precision4((qchisq(1 - pMedian, 1) / qchisq(0.5, 1)));
}

function pluck(rows) {
    if (!rows) return null;
    let [firstRow] = rows;
    let [firstKey] = Object.keys(firstRow);
    return firstRow[firstKey];
}

module.exports = {
    readFile,
    parseLine,
    validateHeaders,
    phenotypeExists,
    tableExists,
    ppoints,
    getIntervals,
    getLambdaGC,
    pluck
};
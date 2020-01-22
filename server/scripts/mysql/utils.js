const fs = require('fs');
const path = require('path');
const fs = require('fs');
const readline = require('readline');

const libR = require('lib-r-math.js');

const { ChiSquared, R: { numberPrecision } } = libR;
//uses as default: "Inversion" and "Mersenne-Twister"
const precision4 = numberPrecision(4)
const { qchisq } = ChiSquared();


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

module.exports = {
    readFile,
    readFirstLine,
    parseLine,
    ppoints,
    getIntervals,
    getLambdaGC
};
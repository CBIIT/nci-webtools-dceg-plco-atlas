const fs = require('fs');
const path = require('path');

// gets a function which returns elapsed time

/**
 * 
 * @param {{includePreviousTime: boolean, divisor: number, precision: number}} opts 
 */
function timestamp(opts) {
    opts = {includePreviousTime: false, divisor: 1000, precision: 4, ...opts};
    const {includePreviousTime, precision, divisor} = opts;
    const startTime = new Date();
    let previousTime = new Date();

    return () => {
        const currentTimeStamp = (new Date() - startTime) / divisor;
        if (includePreviousTime) {
            let previousTimeStamp = (new Date() - previousTime) / divisor
            previousTime = new Date();
            return [currentTimeStamp, previousTimeStamp].map(num => num.toPrecision(precision))
        } else {
            return currentTimeStamp.toPrecision(precision);
        }
    };
}

// returns a writable stream for logging to a file
function getLogStream(filepath) {
    return fs.createWriteStream(filepath, {
        flags: 'a'
    });
}

module.exports = { timestamp, getLogStream };
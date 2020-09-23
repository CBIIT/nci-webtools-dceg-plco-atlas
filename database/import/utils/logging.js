const fs = require('fs');
const path = require('path');
const { createLogger, format, transports } = require('winston');

// gets a function which returns elapsed time

/**
 * 
 * @param {{includePreviousTime: boolean, divisor: number, precision: number}} opts 
 */
function timestamp(opts) {
    opts = { includePreviousTime: false, divisor: 1000, precision: 4, ...opts };
    const { includePreviousTime, precision, divisor } = opts;
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

function getLogger(filename, logLabel, opts) {
    const { combine, timestamp, ms, label, printf } = format;

    const initialTime = new Date().getTime();
    const duration = format((info, opts) => {
        info.duration = new Date().getTime() - (opts.initialTime || initialTime);
        return info;
    });
    
    return createLogger({
        format: combine(
            timestamp({
                format: 'YYYY-MM-DD HH:mm:ss'
            }),
            label({label: logLabel}),
            duration(),
            ms(),
            printf(e => `[${e.timestamp}, ${e.duration/1000}s, ${e.ms}] [${e.label}] ${e.message}`)
        ),
        transports: [
            new transports.Console(),
            new transports.File({ filename })
        ],
        ...opts,
    });
}

module.exports = { timestamp, getLogStream, getLogger };
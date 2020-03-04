const fs = require('fs');
const path = require('path');

// gets a function which returns elapsed time
function timestamp() {
    const startTime = new Date();
    return () => ((new Date() - startTime) / 1000).toPrecision(4);
}

// returns a writable stream for logging to a file
function getLogStream(filepath) {
    return fs.createWriteStream(filepath, {
        flags: 'a'
    });
}

module.exports = { timestamp, getLogStream };
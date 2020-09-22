const assert = require('assert');
const fs = require('fs');
const path = require('path');
const { Transform } = require('stream');

// chunks an input stream into lines
function lineStream(options = {}) {
    let currentRow = 0;
    let {
        skipRows = 0,
        skipEmpty = false,
        limit = -1
    } = options;

    return new Transform({
        objectMode: true,
        transform(chunk, encoding, done) {
            let data = chunk.toString();

            // append remainder from previous line
            if (this._lastLineData)
                data = this._lastLineData + data;

            // split into lines, saving the last item which may be a partial line
            const lines = data.split(/\r?\n/);
            this._lastLineData = lines.pop();
            lines.forEach(line => {
                let shouldSkip = currentRow >= skipRows;
                let shouldSkipEmpty = !skipEmpty || skipEmpty && line.length > 0;
                let shouldSkipLimit = limit === -1 || currentRow < limit;

                if (shouldSkip && shouldSkipEmpty && shouldSkipLimit)
                    this.push(line);

                currentRow ++;
            });
            done();
        },
        flush(done) {
            if (this._lastLineData)
                this.push(this._lastLineData);
            this._lastLineData = null;
            done();
        }
    });
}

// transforms an input stream with the specified map function
function mappedStream(map) {
    return new Transform({
        objectMode: true,
        transform(data, encoding, done) {
            this.push(map(data));
            done();
        }
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

function readFirstLineAsync(filePath) {
    return new Promise(function (resolve, reject) {
        let rs = fs.createReadStream(filePath, {encoding: 'utf8'});
        let acc = '';
        let pos = 0;
        let index;
        rs
          .on('data', chunk => {
            index = chunk.indexOf('\n');
            acc += chunk;
            index !== -1 ? rs.close() : pos += chunk.length;
          })
          .on('close', () => resolve(acc.slice(0, pos + index)))
          .on('error', err => reject(err))
      });
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
    const firstLine = parseLine(readFirstLine(filepath));
    assert.deepStrictEqual(firstLine, headers, `Headers do not match expected values: ${headers}`, firstLine);
}

module.exports = {
    lineStream,
    mappedStream,
    parseLine,
    readFile,
    readFirstLineAsync,
    validateHeaders,
};
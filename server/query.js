const sqlite = require('sqlite3').verbose();
const variantTable = 'variant';
const rangeTable = 'variant_range';
const summaryTable = 'variant_summary';

function getRanges(filepath) {
    return new Promise((resolve, reject) => {
        const db = new sqlite.Database(filepath, sqlite.OPEN_READONLY);
        const sql = `SELECT * FROM ${rangeTable}`;
        db.all(sql, [], (err, rows) => err
            ? reject(err)
            : resolve(rows));
    });
}

function getSummary(filepath) {
    return new Promise((resolve, reject) => {
        const db = new sqlite.Database(filepath, sqlite.OPEN_READONLY);
        let sql = `SELECT distinct CHR, BP_ABS_1000KB, NLOG_P2
            FROM ${summaryTable}
            WHERE NLOG_P2 >= 3
            ORDER BY CHR ASC, BP_ABS_1000KB ASC, NLOG_P2 DESC`;
        db.all(sql, [], (err, rows) => err
            ? reject(err)
            : resolve(rows));
    });
}

function getVariants(filepath, {chr, bpMin, bpMax, nlogpMin, nlogpMax}) {
    return new Promise((resolve, reject) => {
        const db = new sqlite.Database(filepath, sqlite.OPEN_READONLY);
        let stmt = db.prepare(`
            SELECT * FROM ${variantTable} WHERE
                CHR = $chr
                AND BP >= $bpMin
                AND BP <= $bpMax
                AND NLOG_P >= $nlogpMin
                AND NLOG_P <= $nlogpMax`);

        stmt.run({
            $chr: chr,
            $bpMin: bpMin,
            $bpMax: bpMax,
            $nlogpMin: nlogpMin,
            $nlogpMax: nlogpMax,
        });

        stmt.all((err, rows) => err
            ? reject(err)
            : resolve(rows));
    });
}

module.exports = {getRanges, getSummary, getVariants};

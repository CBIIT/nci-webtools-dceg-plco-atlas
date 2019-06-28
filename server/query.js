const sqlite = require('sqlite3').verbose();

function query(databaseFilePath, bpMin, bpMax, pMin, pMax) {
    return new Promise((resolve, reject) => {
        const db = new sqlite.Database(databaseFilePath, sqlite.OPEN_READONLY);
        const stmt = db.prepare(`
            SELECT * FROM meta WHERE
                BP >= $bpMin AND
                BP <= $bpMax AND
                P >= $pMin AND
                P <= $pMax;
        `);

        stmt.run({
            $bpMin: bpMin,
            $bpMax: bpMax,
            $pMin: pMin,
            $pMax: pMax
        });

        stmt.all((err, rows) => err
            ? reject(err)
            : resolve(rows));
    });
}

module.exports = query;

const sqlite = require('sqlite3').verbose();

function query(databaseFilePath, minBP, maxBP, minP, maxP) {
    return new Promise((resolve, reject) => {
        const db = new sqlite.Database(databaseFilePath, sqlite.OPEN_READONLY);
        const stmt = db.prepare(`
            SELECT * FROM meta WHERE
                BP >= $minBP AND
                BP <= $maxBP AND
                P >= $minP AND
                P <= $maxP;
        `);


        stmt.run({
            $minBP: minBP,
            $maxBP: maxBP,
            $minP: minP,
            $maxP: maxP
        });

        stmt.all((err, rows) => err
            ? reject(err)
            : resolve(rows));
    });
}

module.exports = query;

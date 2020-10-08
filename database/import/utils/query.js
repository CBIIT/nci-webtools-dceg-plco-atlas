const path = require('path');
const fs = require('fs');

module.exports = {
    getMedian,
    getRecords,
    getPlaceholders,
    pluck,
    tableExists,
    exportInnoDBTable,
    importInnoDBTable,
}

function pluck(rows) {
    if (!rows || !rows.length) return null;
    let [firstRow] = rows;
    let [firstKey] = Object.keys(firstRow);
    return firstRow[firstKey];
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

async function getMedian(connection, tableName, columnName, queryConditions) {
    const conditions = queryConditions
        ? 'WHERE ' + Object.values(queryConditions)
            .map(v => `${v.key} = ${v.value}`)
            .join(' AND ')
        : '';

    return pluck(await connection.execute(`
        SELECT AVG(${columnName}) AS "median"
        FROM (
            SELECT "${columnName}"
            FROM ${tableName}
            ${conditions}
            ORDER BY "${columnName}"
            LIMIT 2 - (SELECT COUNT(*) FROM ${tableName} ${conditions}) % 2
            OFFSET (
                SELECT (COUNT(*) - 1) / 2
                FROM ${tableName}
                ${conditions}
            )
        )
    `));
}

async function getRecords(connection, tableName, query) {
    let queryConditions = Object.entries(query).map(
        ([key, value]) => `${key} = ${connection.escape(value)}`
    );

    const [records] = await connection.query(
        `SELECT * FROM ${tableName}
            WHERE ${queryConditions.join(' AND ')}`,
    );

    return records;
}

function getPlaceholders(array) {
    return new Array(array.length).fill('?').join();
}

async function getDataDirectory(connection) {
    const [rows] = await connection.query(`SELECT @@datadir`);
    return pluck(rows);
}

async function copyInnoDBTable(tableName, sourceDirectory, targetDirectory) {
    // select table files (including partitioned tables) which can be copied
    const filenames = (await fs.promises.readdir(sourceDirectory))
        .filter(name => new RegExp(`${tableName}(#[p|P]#.*)?(\.ibd|\.cfg)$`).test(name));

    for (let filename of filenames) {
        await fs.promises.copyFile(
            path.resolve(sourceDirectory, filename),
            path.resolve(targetDirectory, filename)
        )
    }
}

async function exportInnoDBTable(connection, database, tableName, targetDirectory) {
    const dataDirectory = path.resolve(await getDataDirectory(connection), database);
    await connection.query(`FLUSH TABLES ${tableName} FOR EXPORT`);
    await copyInnoDBTable(tableName, dataDirectory, targetDirectory);
    await connection.query(`UNLOCK TABLES`);
}

async function importInnoDBTable(connection, database, tableName, sourceDirectory) {
    const dataDirectory = path.resolve(await getDataDirectory(connection), database);
    await connection.query(`ALTER TABLE ${tableName} DISCARD TABLESPACE`);
    await copyInnoDBTable(tableName, sourceDirectory, dataDirectory);
    await connection.query(`ALTER TABLE ${tableName} IMPORT TABLESPACE`);
}

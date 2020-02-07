function pluck(rows) {
    if (!rows) return null;
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

module.exports = {
    getMedian,
    getRecords,
    pluck,
    tableExists,
}

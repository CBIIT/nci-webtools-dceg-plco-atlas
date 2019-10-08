const Database = require('better-sqlite3');

function getRawResults(stmt, params) {
    return {
        columns: stmt.columns().map(c => c.name),
        data: stmt.raw().all(params)
    };
}

function getSummary(filepath, params) {
    const validTables = [
        'aggregate_all',
        'aggregate_female',
        'aggregate_male',
    ];

    const table = validTables.includes(params.table)
        ? params.table
        : validTables[0];

    const stmt = new Database(filepath, {readonly: true}).prepare(`
        SELECT chr, bp_abs_1000kb, nlog_p2
            FROM ${table}
            WHERE nlog_p2 >= :nlogpMin;
    `);

    return params.raw
        ? getRawResults(stmt, params)
        : stmt.all(params);
}

/**
 * Params ar
 * @param {*} filepath
 * @param {*} params
 */
function getVariants(filepath, params) {
    const isDefined = value => !(/^(null|undefined)$/).test(value);
    const coalesce = (condition, value) => isDefined(condition) ? value : null;
    const wrapColumnName = name => `"${name}"`;
    const validColumns = [
        'variant_id', 'chr', 'bp', 'snp','a1','a2', 'n',
        'p','nlog_p', 'p_r', 'or', 'or_r', 'q', 'i',
    ];
    const validTables = [
        'variant_all',
        'variant_female',
        'variant_male',
    ];

    const columns = params.columns // given as a comma-separated list
        ? params.columns.split(',').filter(c => validColumns.includes(c))
        : validColumns;

    const table = validTables.includes(params.table)
        ? params.table
        : validTables[0];

    // filter by id, chr, base position, and -log10(p), if provided
    let sql = `
        SELECT ${columns.map(wrapColumnName).join(',')}
        FROM ${table}
        WHERE ` + [
            `p IS NOT NULL`,
            coalesce(params.id, `variant_id = :id`),
            coalesce(params.snp, `snp = :snp`),
            coalesce(params.chr, `chr = :chr`),
            coalesce(params.bpMin, `bp >= :bpMin`),
            coalesce(params.bpMax, `bp <= :bpMax`),
            coalesce(params.nlogpMin, `nlog_p >= :nlogpMin`),
            coalesce(params.nlogpMax, `nlog_p <= :nlogpMax`),
        ].filter(Boolean).join(' AND ');

    // create count sql based on original query
    let countSql = `SELECT COUNT(1) FROM (${sql})`;

    // adds "order by" statement, if both order and orderBy are provided
    let { order, orderBy } = params;
    if (order && orderBy) {
        // by default, sort by p-value ascending
        if (!['asc', 'desc'].includes(order))
            order = 'asc';
        if (!validColumns.includes(orderBy))
            orderBy = 'p';
        sql += ` ORDER BY "${orderBy}" ${order} `;
    }

    // adds limit and offset, if provided
    if (params.limit) sql += ' LIMIT :limit ';
    if (params.offset) sql += ' OFFSET :offset ';

    // query database
    const db = new Database(filepath, {readonly: true});
    const stmt = db.prepare(sql);
    const records = params.raw
        ? getRawResults(stmt, params)
        : {data: stmt.all(params)};

    // add counts if necessary
    if (params.count)
        records.count = db.prepare(countSql).pluck().get(params);

    return records;
}

function exportVariants(filepath, params) {
    params = {...params, raw: true, count: false};
    const { columns, data } = getVariants(filepath, params);
    // todo: stream csv contents
}

function getMetadata(filepath) {
    const db = new Database(filepath, {readonly: true});
    const records = db.prepare(`SELECT * FROM variant_metadata`).all();
    return records.reduce((obj, {key, value}) => {
        obj[key] = value;
        return obj;
    }, {});
}

module.exports = {getSummary, getVariants, getMetadata};

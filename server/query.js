const Database = require('better-sqlite3');

function getRawResults(stmt, params) {
    return {
        columns: stmt.columns().map(c => c.name),
        data: stmt.raw().all(params)
    };
}

function getSummary(filepath, params) {
    const stmt = new Database(filepath, {readonly: true}).prepare(`
        SELECT chr, bp_abs_1000kb, nlog_p2
            FROM variant_summary
            WHERE nlog_p2 >= :nlogpMin;
    `);

    return params.raw
        ? getRawResults(stmt, params)
        : stmt.all(params);
}

function isDefined(e) {
    return !(/^(null|undefined)$/).test(e);
}

function getVariants(filepath, params) {
    const stmt = new Database(filepath, {readonly: true}).prepare(
        `SELECT variant_id, chr, bp, nlog_p FROM variant WHERE
            chr = :chr
            ${isDefined(params.bpMin) ? ' AND bp >= :bpMin' : ' '}
            ${isDefined(params.bpMax) ? ' AND bp <= :bpMax' : ' '}
            ${isDefined(params.nlogpMin) ? ' AND nlog_p >= :nlogpMin' : ' '}
            ${isDefined(params.nlogpMax) ? ' AND nlog_p <= :nlogpMax' : ' '}`);

    return params.raw
        ? getRawResults(stmt, params)
        : stmt.all(params);
}

function getVariantsByPage(filepath, params, config) {
    const coalesce = (condition, value) => isDefined(condition) ? value : '';
    const wrapColumnName = name => `"${name}"`;
    const validColumns = [
        'variant_id', 'chr', 'bp', 'snp','a1','a2', 'n',
        'p','nlog_p', 'p_r', 'or', 'or_r', 'q', 'i',
    ];

    // if column names are provided, check each name and wrap in quotes
    // otherwise, retrieve default columns
    let columnNames = (config && config.columnNames)
        ? config.columnNames.filter(c => validColumns.includes(c))
        : validColumns;

    // filter by id, chr, base position, and -log10(p), if provided
    let sql = `SELECT ${columnNames.map(wrapColumnName).join(',')} FROM variant
        WHERE p IS NOT NULL AND ` + [
            coalesce(params.id, `variant_id = :id`),
            coalesce(params.chr, `chr = :chr`),
            coalesce(params.bpMin, `bp >= :bpMin`),
            coalesce(params.bpMax, `bp <= :bpMax`),
            coalesce(params.nlogpMin, `bp <= :nlogpMin`),
            coalesce(params.nlogpMax, `bp <= :nlogpMax`),
        ].filter(str => str.length).join(' AND ');

    // add counts to results, if required
    let countSql = `SELECT COUNT(*) FROM (${sql})`;

    // adds "order by" to sql, if both order and orderBy are provided
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

    const stmt = new Database(filepath, {readonly: true}).prepare(querySql);
    const records = params.raw
        ? getRawResults(stmt, params)
        : stmt.all(params);

    if (config.count) {
        const countStmt = new Database(filepath, {readonly: true}).prepare(countSql);
        const count = countStmt.all(params);
        if (params.raw)
            records.count = count;
    }

    return records;
}

function getVariantById(filepath, params) {
    const stmt = new Database(filepath, {readonly: true}).prepare(
        `SELECT * FROM variant WHERE variant_id = :id`
    );

    const records = params.raw
        ? getRawResults(stmt, params)
        : stmt.all(params);

    return records;
}


function getVariant(filepath, params) {
    // console.log("filepath", filepath);
    // console.log("params", params);
    const stmt = new Database(filepath, {readonly: true}).prepare(`
        SELECT * FROM variant WHERE
        snp = :snp
        OR (chr = :chr AND bp = :bp)
    `);

    return params.raw
        ? getRawResults(stmt, params)
        : stmt.all(params);
}

module.exports = {getSummary, getVariants, getVariantsByPage, getVariant, getVariantById};

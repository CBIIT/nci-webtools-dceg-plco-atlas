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

function getVariants(filepath, params) {
    const stmt = new Database(filepath, {readonly: true}).prepare(
        `SELECT variant_id, chr, bp, nlog_p FROM variant WHERE
            chr = :chr AND
            bp >= :bpMin AND
            bp <= :bpMax AND
            nlog_p >= :nlogpMin AND
            nlog_p <= :nlogpMax`);

    return params.raw
        ? getRawResults(stmt, params)
        : stmt.all(params);
}

function getVariantsByPage(filepath, params) {
    const isDefined = e => !(/^(null|undefined)$/).test(e);
    const sql = `SELECT * FROM variant
        WHERE p IS NOT NULL
        ${isDefined(params.chr) ? ' AND chr = :chr' : ' '}
        ${isDefined(params.bpMin) ? ' AND bp >= :bpMin' : ' '}
        ${isDefined(params.bpMax) ? ' AND bp <= :bpMax' : ' '}
        ${isDefined(params.nlogpMin) ? ' AND nlog_p >= :nlogpMin' : ' '}
        ${isDefined(params.nlogpMax) ? ' AND nlog_p <= :nlogpMax' : ' '}`;

    if (params.count) {
        const countSql = `SELECT COUNT(*) FROM (${sql})`;
        const countStmt = new Database(filepath, {readonly: true}).prepare(countSql);
        const count = countStmt.all(params);
        return count;
    } else {
        const orderBy = ['chr', 'bp', 'snp', 'p'].includes(params.orderBy)
            ? params.orderBy
            : 'p';
        const order = ['asc', 'desc'].includes(params.order)
            ? params.order
            : 'asc';
        const querySql = `${sql}
            ORDER BY "${orderBy}" ${order}
            LIMIT :limit
            OFFSET :offset`;
        const stmt = new Database(filepath, {readonly: true}).prepare(querySql);
        const records = params.raw
            ? getRawResults(stmt, params)
            : stmt.all(params);
        return records;
    }
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

function getCorrelations(filepath, params) {
    const stmt = new Database(filepath, {readonly: true}).prepare(`
        SELECT * FROM correlations
    `);

    return params.raw
        ? getRawResults(stmt, params)
        : stmt.all(params);
}

module.exports = {getSummary, getVariants, getVariantsByPage, getVariant, getVariantById, getCorrelations};

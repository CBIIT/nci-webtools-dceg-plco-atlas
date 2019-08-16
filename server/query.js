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
    const stmt = new Database(filepath, {readonly: true}).prepare(`
        SELECT chr, bp, nlog_p FROM variant WHERE
        chr = :chr
        AND bp >= :bpMin
        AND bp <= :bpMax
        AND nlog_p >= :nlogpMin
        AND nlog_p <= :nlogpMax
    `);

    return params.raw
        ? getRawResults(stmt, params)
        : stmt.all(params);
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

function getTopVariants(filepath, params) {
    const stmt = new Database(filepath, {readonly: true}).prepare(`
        SELECT * FROM variant WHERE
        ${params.chr ? 'chr = :chr' : ''}
        AND nlog_p > 0
        ORDER BY nlog_p ASC
        LIMIT :limit
        OFFSET :offset
    `);

    return params.raw
        ? getRawResults(stmt, params)
        : stmt.all(params);
}

module.exports = {getSummary, getVariants, getVariant};

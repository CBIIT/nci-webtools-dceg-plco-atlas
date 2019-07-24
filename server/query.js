const Database = require('better-sqlite3');

function getRanges(filepath) {
    return new Database(filepath, {readonly: true}).prepare(`
        SELECT chr, min_bp, max_bp, max_bp_abs, min_nlog_p, max_nlog_p FROM variant_range
    `).all();
}

function getSummary(filepath, params) {
    const stmt = new Database(filepath, {readonly: true}).prepare(`
        SELECT chr, bp_abs_1000kb, nlog_p2
            FROM variant_summary
            WHERE nlog_p2 >= :nlogpMin;
    `);

    if (params.raw)   
        return {
            columns: stmt.columns().map(c => c.name),
            data: stmt.raw().all(params)
        };
    else
        return stmt.all(params);
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

    return {
        columns: stmt.columns().map(c => c.name),
        data: stmt.raw().all(params)
    };
}

module.exports = {getRanges, getSummary, getVariants};

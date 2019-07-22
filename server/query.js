const Database = require('better-sqlite3');

function getRanges(filepath) {
    return new Database(filepath, {readonly: true}).prepare(`
        SELECT * FROM variant_range
    `).all();
}

function getSummary(filepath) {
    const stmt = new Database(filepath, {readonly: true}).prepare(`
        SELECT chr, bp_abs_1000kb, nlog_p2
            FROM variant_summary
            WHERE nlog_p2 >= 3;
    `);

    return {
        columns: stmt.columns().map(c => c.name),
        data: stmt.raw().all()
    };
}

function getVariants(filepath, params) {
    const stmt = new Database(filepath, {readonly: true}).prepare(`
        SELECT chr, bp, nlog_p FROM variant WHERE
        chr = :chr
        AND bp >= :bpMin
        AND bp <= :bpMax
        AND nlog_p >= :nlogpMin
        AND nlog_p <= :nlogpMax
    `).all(params);

    return {
        columns: stmt.columns().map(c => c.name),
        data: stmt.raw().all()
    };
}

module.exports = {getRanges, getSummary, getVariants};

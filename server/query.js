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
    const sql = `SELECT * FROM variant
        ${params.chr ? 'WHERE chr = :chr' : ' '}
        ${params.bpMin ? ' AND bp >= :bpMin' : ' '}
        ${params.bpMax ? ' AND bp <= :bpMax' : ' '}
        ${params.nlogpMin ? ' AND nlog_p >= :nlogpMin' : ' '}
        ${params.nlogpMax ? ' AND nlog_p <= :nlogpMax' : ' '}
        ORDER BY nlog_p DESC
        LIMIT :limit
        OFFSET :offset`;

    if (params.count) {
        const countSql = `SELECT COUNT(*) FROM (${sql})`;
        const countStmt = new Database(filepath, {readonly: true}).prepare(countSql);
        const count = countStmt.all(params);
        return count;
    } else {
        const stmt = new Database(filepath, {readonly: true}).prepare(sql);
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

// function getQQImageMapJSON(name) {
//     let raw = fs.readFileSync('server/data/qq-plots/' + name + '.imagemap.json');
//     let obj = JSON.parse(raw);
//     return {
//         data: obj
//     };
// }

module.exports = {getSummary, getVariants, getVariantsByPage, getVariant, getVariantById};

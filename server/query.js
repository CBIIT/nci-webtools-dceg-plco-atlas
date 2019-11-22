const fs = require('fs');
const path = require('path');
const Database = require('better-sqlite3');
const { dbpath } = require('./config.json');
const logger = require("./logger");
const ranges = require(path.resolve(dbpath, 'chromosome_ranges.json'));

function getRawResults(stmt, params) {
    return {
        columns: stmt.columns().map(c => c.name),
        data: stmt.raw().all(params)
    };
}

function wrapColumnName(name){
    return `"${name}"`;
}

function isDefined(value) {
    return !(/^(null|undefined)$/).test(value);
}
function coalesce(condition, value) {
    return isDefined(condition) ? value : null;
}

function getSummary(filepath, params) {
    const validColumns = [
        'chr', 'bp_abs_1000kb', 'nlog_p2',
    ];
    const validTables = [
        'aggregate_all',
        'aggregate_female',
        'aggregate_male',
    ];

    const columns = params.columns // given as a comma-separated list
        ? params.columns.split(',').filter(c => validColumns.includes(c))
        : validColumns;

    const table = validTables.includes(params.table)
        ? params.table
        : validTables[0];

    const distinct = params.distinct
        ? `DISTINCT  `
        : ``;

    // filter by -log10(p) if provided
    let sql = `
        SELECT ${distinct}${columns.map((name => wrapColumnName(name))).join(',')}
        FROM ${table}
        WHERE ` + [
            `nlog_p2 IS NOT NULL`,
            coalesce(params.nlogpMin, `nlog_p2 >= :nlogpMin`),
            coalesce(params.nlogpMax, `nlog_p2 <= :nlogpMax`),
        ].filter(Boolean).join(' AND ');

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

    logger.debug(`SQL: ${sql}`);

    const stmt = new Database(filepath, {readonly: true}).prepare(sql);

    return params.raw
        ? getRawResults(stmt, params)
        : stmt.all(params);
}

/**
 * Params are as follows:
 *   - id (variant id)
 *   - snp
 *   - chr
 *   - bpMin
 *   - bpMax
 *   - nlogpMin
 *   - nlogpMax
 *   - pMin
 *   - pMax
 *   - mod
 *   - order
 *   - orderBy
 *   - limit
 *   - offset
 *   - count
 * @param {*} filepath
 * @param {*} params
 */
function getVariants(filepath, params) {
    const validColumns = [
        'variant_id', 'chr', 'bp', 'snp','a1','a2', 'n',
        'p','nlog_p', 'p_r', 'or', 'or_r', 'q', 'i', 'expected_p', 'plot_qq',
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

    const groupby = params.groupby
        ? ` GROUP BY "` + params.groupby + `" `
        : ``;

    // validate min/max bp for each chromosome if provided
    if (params.chr) {
        let validRange = ranges.find(e => e.chr === +params.chr);
        if (params.bpMin && +params.bpMin < validRange.bp_min)
            params.bpMin = validRange.bp_min;

        if (params.bpMax && +params.bpMax > validRange.bp_max)
            params.bpMax = validRange.bp_max;
    }

    // filter by id, chr, base position, and -log10(p), if provided
    let sql = `
        SELECT ${columns.map((name => wrapColumnName(name))).join(',')}
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
            coalesce(params.pMin, `p >= :pMin`),
            coalesce(params.pMax, `p <= :pMax`),
            coalesce(params.mod, `(variant_id % :mod) = 0`),
            coalesce(params.plot_qq, `plot_qq = 1`)
        ].filter(Boolean).join(' AND ') + `${groupby}`;

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


    // create count sql based on original query
    let countSql = `SELECT COUNT(1) FROM (${sql})`;

    logger.debug(`SQL: ${sql}`);
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

function getMetadata(filepath, {key}) {
    const db = new Database(filepath, {readonly: true});
    if (key)
        return db.prepare(`SELECT value FROM variant_metadata WHERE key = :key`)
        .pluck()
        .get({key});

    const records = db.prepare(`SELECT * FROM variant_metadata`).all();
    return records.reduce((obj, {key, value}) => {
        obj[key] = value;
        return obj;
    }, {});
}

function getGenes(filepath, params) {
    if (!fs.existsSync(filepath)) return [];

    const db = new Database(filepath, {readonly: true});
    const validColumns = [
        'gene_id',
        'name',
        'chr',
        'strand',
        'tx_start',
        'tx_end',
        'exon_starts',
        'exon_ends',
    ];
    const columns = params.columns
        ? params.columns.split(',').filter(e => validColumns.includes(e))
        : ['gene_id', 'name', 'strand', 'tx_start', 'tx_end', 'exon_starts', 'exon_ends'];

    let records = db.prepare(`
        SELECT ${columns.map(c => `"${c}"`).join(',')}
        FROM gene
        WHERE
            chr = :chr AND
            (
                (tx_start BETWEEN :txStart AND :txEnd) OR
                (tx_end BETWEEN :txStart AND :txEnd)
            )
    `).all(params);

    // since exon_starts/ends are comma-delimited strings, we should parse them as arrays
    if (columns.includes('exon_starts') || columns.includes('exon_ends')) {
        const split = e => (e || '').split(',').filter(e => e !== '').map(e => +e);
        records = records.map(e => {
            e.exon_starts = split(e.exon_starts);
            e.exon_ends = split(e.exon_ends);
            return e;
        });
    }

    return records;
}

module.exports = {getSummary, getVariants, getMetadata, getGenes};

const config = require('./config.json');
const logger = require("./logger");

/**
 * Ensures that identifiers with sql keywords in them do not throw errors
 * @param {string} str - A string which needs to be quoted
 * @returns {string} The quoted string
 */
function quote(str) {
    return `\`${str}\``;
}

/**
 * Returns true if the value is not null or undefined. Includes strings
 * which are also "null" or "undefined"
 * @param {any} value - The value to check
 * @returns {{boolean}} True if the value is defined
 */
function isDefined(value) {
    return !(/^(null|undefined)$/).test(value);
}

/**
 * Returns the value if the condition evaluates to a non-null value
 * @param {any} condition - A value, which may be null or undefined
 * @param {any} value - The value to coalesce to, if the condition is defined
 * @returns - The coalesced value, if the condition is defined
 */
function coalesce(condition, value) {
    return isDefined(condition) ? value : null;
}

/**
 * Retrieves aggregate data for variants, filtered by search criteria
 * @param {string} filepath - Path to the sqlite database file
 * @param {{
     table: string,
     columns: string,
     order: string,
     orderBy: string,
     distinct: string,
     nlogpMin: string,
     nlogpMax: string,
     raw: string,
   }} params - Database query criteria
 * @returns Records in the aggregate summary table which match query criteria
 */
async function getSummary(connection, params) {

    const validTables = [
        'aggregate_all',
        'aggregate_female',
        'aggregate_male',
    ];

    const validColumns = [
        'chr',
        'bp_abs_1000kb',
        'nlog_p2',
    ];

    const table = validTables.includes(params.table)
        ? params.table
        : validTables[0];

    const columns = params.columns // given as a comma-separated list
        ? params.columns.split(',').filter(c => validColumns.includes(c))
        : validColumns;

    const columnNames = columns
        .map(quote)
        .join(',');

    const distinct = params.distinct
        ? `DISTINCT`
        : ``;

        // filter by -log10(p) if provided
    let sql = `
        SELECT ${distinct} ${columnNames}
        FROM ${table}
        WHERE ${[
            `nlog_p2 IS NOT NULL`,
            coalesce(params.nlogpMin, `nlog_p2 >= :nlogpMin`),
            coalesce(params.nlogpMax, `nlog_p2 <= :nlogpMax`),
        ].filter(Boolean).join(' AND ')}`;

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

    const [data, columns] = await connection.query({
        rowsAsArray: params.raw,
        sql,
    }, params);

    return {data, columns};
}

/**
 * Retrieves variant data, filtered by search criteria
 * @param {string} filepath - Path to the sqlite database file
 * @param {{
     table: string,
     columns: string,
     id: string,
     snp: string,
     chr: string,
     bp: string,
     bpMin: string,
     bpMax: string,
     nlogpMin: string,
     nlogpMax: string,
     pMin: string,
     pMax: string,
     mod: string,
     plot_qq: string,
     order: string,
     orderBy: string,
     limit: string,
     offset: string,
     count: string,
     raw: string,
   }} params - Database search criteria
 * @returns Records in the variant table which match query criteria
 */

function getVariantTables() {
    return [
        'ewings_sarcoma_variant',
        'renal_cell_carcinoma_variant',
        'melanoma_variant',
    ];
}

async function getVariants(connection, params) {
    const validTables = getVariantTables();

    const validColumns = [
        'variant_id', 'chr', 'bp', 'snp','a1','a2', 'n',
        'p','nlog_p', 'p_r', 'or', 'or_r', 'q', 'i', 'expected_p', 'plot_qq',
    ];

    const table = validTables.includes(params.table)
        ? params.table
        : validTables[0];

    const columns = params.columns // given as a comma-separated list
        ? params.columns.split(',').filter(c => validColumns.includes(c))
        : validColumns;

    const columnNames = columns
        .map(quote)
        .join(',');

    const groupby = params.groupby
        ? ` GROUP BY "${params.groupby}" `
        : ``;

    // filter by id, chr, base position, and -log10(p), if provided
    let sql = `
        SELECT ${columnNames}
        FROM ${table}
        WHERE ${[
            `p IS NOT NULL`,
            coalesce(params.id, `variant_id = :id`),
            coalesce(params.snp, `snp = :snp`),
            coalesce(params.chr, `chr = :chr`),
            coalesce(params.bp, `bp = :bp`),
            coalesce(params.bpMin, `bp >= :bpMin`),
            coalesce(params.bpMax, `bp <= :bpMax`),
            coalesce(params.nlogpMin, `nlog_p >= :nlogpMin`),
            coalesce(params.nlogpMax, `nlog_p <= :nlogpMax`),
            coalesce(params.pMin, `p >= :pMin`),
            coalesce(params.pMax, `p <= :pMax`),
            coalesce(params.mod, `(variant_id % :mod) = 0`),
            coalesce(params.plot_qq, `plot_qq = 1`)
        ].filter(Boolean).join(' AND ')}
        ${groupby}`;

    // create count sql based on original query
    let countSql = `SELECT COUNT(1) as count FROM (${sql})`;

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

    logger.debug(`SQL: ${sql}`);

    // query database
    let [data, columns] = await connection.query({
        rowsAsArray: params.raw,
        sql,
    }, params);

    const records = {data, columns};

    // add counts if necessary
    if (params.count) {
        let [results] = await connection.query(countSql, params);
        records.count = results[0].count;
    }

    return records;
}

async function exportVariants(filepath, params) {
    params = {...params, raw: true, count: false};
    const { columns, data } = getVariants(filepath, params);
    // todo: stream csv contents
    return [];
}

/**
 * Retrieves metadata for a phenotype's variants
 * @param {string} filepath - Path to the sqlite database file
 * @param {string} key - A specific metadata key to retrieve
 * @returns {any} A specified key and value, or the entire list of
 * metadata properties if the key is not specified
 */
async function getMetadata(connection, key) {
    if (key) {
        let [results] = await connection.query(`SELECT value FROM variant_metadata WHERE key = :key`, key);
        return results[0].value;
    } else {
        let [results]  = await connection.query(`SELECT key, value FROM variant_metadata`)
        return results.reduce((obj, v) => ({...obj, [v.key]: v.value}), {});
    }
}

/**
 * Retrieves genes from a specific chromosome, filtered by search criteria
 * @param {mysql.Connection} connection - Connection to the database
 * @param {{
     columns: string,
     chr: string,
     txStart: string,
     txEnd: string
   }} params - Criteria to filter genes
 * @returns {any[]} Genes matching the search criteria
 */
async function getGenes(connection, params) {
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

    const columnNames = columns
        .map(quote)
        .join(',');

    const splitNumbers = e => (e || '')
        .split(',')
        .filter(e => e !== '')
        .map(e => +e);

    const [results] = await connection.query(`
        SELECT ${columnNames}
        FROM gene
        WHERE chr = :chr AND (
            (tx_start BETWEEN :txStart AND :txEnd) OR
            (tx_end BETWEEN :txStart AND :txEnd))
    `, params);

    return results.map(e => ({
        ...e,
        exon_starts: splitNumbers(e.exon_starts),
        exon_ends: splitNumbers(e.exon_ends)
    }));
}

/**
 * Retrieves a specific configuration key
 * @param {string} key - The key to retrieve
 * @returns {any} The specified key and its value
 */
function getConfig(key) {
    const allowedKeys = ['downloadRoot'];
    return allowedKeys.includes(key)
        ? {[key]: config[key]}
        : null;
}

module.exports = {getSummary, getVariants, getMetadata, getGenes, getConfig};

const mysql = require('mysql2');
const config = require('./config.json');
const logger = require('./logger');
const connection = mysql.createPool({
    host: database.host,
    database: database.name,
    user: database.user,
    password: database.user,
    waitForConnections: true,
    connectionLimit: 20,
    namedPlaceholders: true
  }).promise();

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
 * Returns any values that are in all of the arrays provided
 */
function intersection(...arrays) {
    return arrays[0].filter(value =>
        arrays.every(array => array.includes(value))
    );
}


function getValidColumns(tableName, columns) {
    if (!Array.isArray(columns))
        columns = (columns || '').split(',').filter(e => e.length);

    let validColumns = {
        variant: ['id', 'gender', 'chromosome', 'position', 'snp', 'allele_reference', 'allele_effect', 'p_value', 'p_value_expected', 'p_value_nlog', 'odds_ratio', 'show_qq_plot'],
        aggregate: ['id', 'gender', 'position_abs', 'p_value_nlog'],
        phenotype: ['id', 'parent_id', 'name', 'display_name', 'description', 'color', 'type'],
    }[tableName];

    return columns.length
        ? intersection(columns, validColumns)
        : validColumns;
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
    const [data, columns] = await connection.query({
        rowsAsArray: params.raw,
        values: params,
        sql: `SELECT DISTINCT position_abs, p_value_nlog FROM :table WHERE
            gender = :gender AND
            p_value_nlog BETWEEN :min_p_value_nlog AND :max_p_value_nlog`,
    });

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
     chromosome: string,
     transcription_start: string,
     transcription_end: string
   }} params - Criteria to filter genes
 * @returns {any[]} Genes matching the search criteria
 */
async function getGenes(connection, params) {
    const splitNumbers = e => (e || '')
        .split(',')
        .filter(e => e !== '')
        .map(e => +e);

    const [results] = await connection.query(`
        SELECT *
        FROM gene
        WHERE chromosome = :chromosome AND (
            (transcription_start BETWEEN :transcription_start AND :transcription_end) OR
            (transcription_end BETWEEN :transcription_start AND :transcription_end))
    `, params);

    return results.map(record => ({
        ...record,
        exon_starts: splitNumbers(record.exon_starts),
        exon_ends: splitNumbers(record.exon_ends)
    }));
}

/**
 * Retrieves a specific configuration key
 * @param {string} key - The key to retrieve
 * @returns {any} The specified key and its value
 */
function getCorrelations(connection, {phenotypeA, phenotypeB}) {
    if (phenotypeA && phenotypeB) {
        let [results] = await connection.query(`
            SELECT value FROM phenotype_correlation WHERE
                (phenotype_a = :phenotypeA AND phenotype_b = :phenotypeB) OR
                (phenotype_b = :phenotypeA AND phenotype_a = :phenotypeB)
            LIMIT 1
        `, {phenotypeA, phenotypeB});
        return results[0].value;
    } else {
        let [results]  = await connection.query(`
            SELECT
                phenotype_a as phenotypeA,
                phenotype_b as phenotypeB,
                value
            FROM phenotype_correlation
        `);
        return results;
    }
}

function getPhenotypes(connection, params) {
    let columns = getValidColumns('phenotype', params.columns).join(',').map(quote);
    let [phenotypes] = await connection.execute(`
        SELECT ${columns}
        FROM phenotype
        ${params.id ? 'WHERE id = :id' : ''}
    `, params);

    phenotypes.forEach(phenotype => {
        let parent = phenotypes.find(parent => parent.id === phenotype.parent_id);
        if (parent) parent.children = [...parent.children || [], phenotype];
    });

    return params.flat
        ? phenotypes
        : phenotypes.filter(phenotype => phenotype.parent_id === null);
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

module.exports = {connection, getSummary, getVariants, getMetadata, getGenes, getConfig};

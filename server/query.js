const mysql = require('mysql2');
const config = require('./config.json');
const logger = require('./logger');
const {database} = config;
const connection = mysql.createPool({
    host: database.host,
    database: database.name,
    user: database.user,
    password: database.password,
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
        variant: ['id', 'gender', 'chromosome', 'position', 'snp', 'allele_reference', 'allele_alternate', 'p_value', 'p_value_nlog', 'p_value_nlog_expected', 'odds_ratio', 'show_qq_plot'],
        aggregate: ['id', 'gender', 'position_abs', 'p_value_nlog'],
        phenotype: ['id', 'parent_id', 'name', 'display_name', 'description', 'color', 'type'],
    }[tableName];

    return columns.length
        ? intersection(columns, validColumns)
        : validColumns;
}


function getValidTable(table) {
    // todo: validate table name

    // let validTable = {
    //     ewings_sarcoma_2_variant,
    //     melanoma_3_variant,
    //     renal_cell_carcinoma_4_variant
    // }[tableName];

    // return validTable
    //     ? validTable
    //     : '';

    return table;
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
        values: [params.table, params.gender, params.p_value_nlog_min],
        sql: `
        SELECT
            position_abs, p_value_nlog FROM ??
        WHERE
            gender = ? AND
            p_value_nlog > ?`,
    });

    return {data, columns: columns.map(c => c.name)};
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


async function getVariants(connection, params) {
    let tables = params.table.split(',').map(getValidTable);
    let columnNames = getValidColumns('variant', params.columns).map(quote).join(',')
    // console.log("params.columns", params.columns);
    // let columnNames = params.columns.map(quote).join(',');
    const groupby = params.groupby
        ? ` GROUP BY "${params.groupby}" `
        : ``;

    // const showTableName = (tableName) => {
    //     params.show_table_name ? `, '` + tableName + `' as table_name ` : ``
    // };

    // filter by id, chr, base position, and -log10(p), if provided
    let sql = tables.map(table => `
        SELECT ${columnNames} ${[coalesce(params.show_table_name, `, '${table}' as table_name`)]}
        FROM ${table} as v
        WHERE ${[
            coalesce(params.id, `id = :id`),
            coalesce(params.gender, `gender = :gender`),
            coalesce(params.snp, `snp = :snp`),
            coalesce(params.chromosome, `chromosome = :chromosome`),
            coalesce(params.position, `position = :position`),
            coalesce(params.position_min, `position >= :position_min`),
            coalesce(params.position_max, `position <= :position_max`),
            coalesce(params.p_value_nlog_min, `p_value_nlog >= :p_value_nlog_min`),
            coalesce(params.p_value_nlog_max, `p_value_nlog <= :p_value_nlog_max`),
            coalesce(params.p_value_min, `p_value >= :p_value_min`),
            coalesce(params.p_value_max, `p_value <= :p_value_max`),
            coalesce(params.mod, `(id % :mod) = 0`),
            coalesce(params.show_qq_plot, `show_qq_plot = 1`)
        ].filter(Boolean).join(' AND ')}
        ${groupby}`).join(' UNION ');

    // create count sql based on original query
    let countSql = `SELECT COUNT(*) as count FROM (${sql}) as c`;

    // adds "order by" statement, if both order and orderBy are provided
    let { order, orderBy } = params;
    if (order && orderBy) {
        // by default, sort by p-value ascending
        if (!['asc', 'desc'].includes(order))
            order = 'asc';
        // if (!validColumns.includes(orderBy))
        //     orderBy = 'p_value';
        sql += ` ORDER BY "${orderBy}" ${order} `;
    }

    // adds limit and offset, if provided
    params.limit = params.limit ? Math.min(params.limit, 1e5) : 1e5; // set hard limit to prevent overflow
    params.offset = +params.offset || 0;
    if (params.limit) sql += ' LIMIT :offset, :limit ';

    logger.debug(`SQL: ${sql}`);
    console.log(`SQL: ${sql}`);

    // query database
    let [data, columns] = await connection.query({
        rowsAsArray: params.raw,
        sql,
    }, params);

    const records = {data, columns: columns.map(c => c.name)};

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
async function getMetadata(connection, {phenotype_id, gender, chromosome}) {
    let [results] = await connection.query(
        `
            SELECT 
                *
            FROM 
                phenotype_metadata
            WHERE
                phenotype_id = :phenotype_id AND
                gender = :gender AND
                chromosome = :chromosome
            LIMIT 1
        `,
        {phenotype_id, gender, chromosome}
    );
    return results[0];
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
async function getCorrelations(connection, {a, b}) {
    let sql = `
        SELECT
            phenotype_a, pa.name as phenotype_a_name, pa.display_name as phenotype_a_display_name,
            phenotype_b, pb.name as phenotype_b_name, pb.display_name as phenotype_b_display_name,
            value
        FROM phenotype_correlation pc
        JOIN phenotype pa on pc.phenotype_a = pa.id
        JOIN phenotype pb on pc.phenotype_b = pb.id
    `;

    if (a && b) {
        // warning: ensure that numbers are properly sanitized
        let filterNums = e => e.split(',').filter(e => !isNaN(e)).map(Number).join(',');
        a = filterNums(a);
        b = filterNums(b);
        sql += `WHERE
        (phenotype_a IN (${a}) AND phenotype_b IN (${b})) OR
        (phenotype_b IN (${a}) AND phenotype_a IN (${b}))`;
    }

    console.log(sql);

    let [results] = await connection.query(sql);
    return results;
}

async function getPhenotypes(connection, params) {
    let columns = getValidColumns('phenotype', params.columns).map(quote).join(',');
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


async function getRanges(connection) {
    let [ranges] = await connection.query(`SELECT * FROM chromosome_range`);
    return ranges;
}

async function getCounts(connection, params) {
    let table = getValidTable(params.table);
    let [countRows] = await connection.execute(`
        SELECT COUNT(*) as count
        FROM ${table}
        WHERE gender = :gender
        ${params.chromosome ? 'AND chromosome = :chromosome' : ''}
    `, params);
    return {count: countRows[0].count};
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

module.exports = {
    connection,
    getSummary,
    getVariants,
    getMetadata,
    getCorrelations,
    getPhenotypes,
    getRanges,
    getGenes,
    getCounts,
    getConfig
};


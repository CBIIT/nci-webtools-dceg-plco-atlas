const mysql = require('mysql2');
const config = require('../config.json');
const { exportRowLimit } = config;

/**
 * Returns a function which can be used to get the elapseed
 * duration (in seconds) since the initial function call
 */
function getTimestamp() {
    const startTime = new Date();
    return () => (new Date() - startTime) / 1000;
}

/**
 * Resolves after the specified duration
 * @param {number} ms - The number of milliseconds to sleep
 * @returns upon resolution
 */
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

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

function getPlaceholders(length) {
    return new Array(length).fill('?').join(',')
}

/**
 * Returns any values that are in all of the arrays provided
 */
function intersection(...arrays) {
    return arrays[0].filter(value =>
        arrays.every(array => array.includes(value))
    );
}

/**
 * Retrieves the first value in the first column of a results set
 * @example: let [results] = await query(sql); pluck(results);
 * @param {array} rows - An array of records
 */
function pluck(rows) {
    if (!rows || !rows.length) return null;
    // console.log(typeof rows);
    let [firstRow] = rows;
    let [firstKey] = Object.keys(firstRow);
    return firstRow[firstKey];
}

/**
 * Retrieves valid, publicly accessible column names for a given table
 * @param {*} tableName
 * @param {*} columns
 */
function getValidColumns(tableName, columns) {
    // ensure that columns are provided as an array
    if (!Array.isArray(columns))
        columns = (columns || '').split(',').filter(Boolean);

    // filter column names as valid mysql identifiers
    columns = columns.filter(e => /^\w+$/.test(e));

    let validColumns = {
        variant: ['id', 'chromosome', 'position', 'snp', 'allele_effect', 'allele_non_effect', 'allele_effect_frequency', 'p_value', 'p_value_heterogenous', 'p_value_nlog', 'beta', 'odds_ratio', 'beta_ci_95_low', 'beta_ci_95_high', 'odds_ratio_ci_95_low', 'odds_ratio_ci_95_high', 'n'],
        point: ['id', 'phenotype_id', 'sex', 'chromosome', 'position', 'snp', 'p_value_nlog', 'p_value_nlog_expected'],
        aggregate: ['id', 'phenotype_id', 'sex', 'chromosome', 'position_abs', 'p_value_nlog'],
        phenotype: ['id', 'parent_id', 'name', 'age_name', 'display_name', 'description', 'color', 'type', 'participant_count', 'import_count', 'import_date'],
    }[tableName];

    return columns.length
        ? intersection(columns, validColumns)
        : validColumns;
}

/**
 * Resolves once a connection has been created
 * @param {object} config 
 * @param {object} logger 
 * @returns 
 */
function deferUntilConnected(config, logger) {
    let interval = 1;

    async function tryConnection() {
        try {
            return await mysql
                .createConnection(config)
                .promise()
                .query('select 1');
        } catch(e) {
            logger.error(e.message);
            interval *= 1.5;
            await sleep(1000 * 10 * interval);
            return await tryConnection();
        }
    }

    return tryConnection();
}


async function ping({connection, logger}) {
    let sql = `SELECT "true" as status`;
    logger.debug(`ping sql: ${sql}`);
    const [result] = await connection.query(sql);
    return result[0].status === 'true';
}

/**
 * Returns records given a table name and optionally, conditions and condition joiner (AND/OR)
 * @param {*} connection A mysql connection 
 * @param {*} tableName The name of a table to query
 * @param {*} conditions Conditions, given in the following format: {key: value, key2: value2}
 * @param {*} conditionJoiner An optional joiner for each condition. Defaults to 'AND'
 */
async function query(connection, tableName, conditions, conditionJoiner) {
    let conditionSql = Object.keys(conditions)
        .filter(key => /^\w+$/.test(key))
        .map(key => `${quote(key)} = :${key}`)
        .join(` ${conditionJoiner || 'AND'} `);

    return await connection.execute(
        `SELECT * FROM ${tableName}
            ${conditionSql.length ? `WHERE ${conditionSql}` : ''}`,
        conditions
    );
}

/**
 * Checks if a record exists in a table
 * @param {*} connection A mysql connection 
 * @param {*} tableName The name of a table to query
 * @param {*} conditions Conditions, given in the following format: {key: value, key2: value2}
 * @param {*} conditionJoiner An optional joiner for each condition. Defaults to 'AND'
 */
async function hasRecord(connection, tableName, conditions, conditionJoiner) {
    const [data] = await query(connection, tableName, conditions, conditionJoiner);
    return data.length > 0;
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
async function getSummary({connection, logger}, {phenotype_id, table, sex, ancestry, p_value_nlog_min, limit, offset, raw}) {
    // validate parameters
    if (!phenotype_id || !await hasRecord(connection, 'phenotype', {id: phenotype_id}))
        throw new Error('A valid phenotype id must be provided');

    // validate sex
    if (!sex || !await hasRecord(connection, 'lookup_sex', {value: sex}))
        throw new Error('A valid sex must be provided');

    // validate ancestry
    if (!ancestry || !await hasRecord(connection, 'lookup_ancestry', {value: ancestry}))
        throw new Error('A valid ancestry must be provided');

    // validate p_value_nlog_min
    if (!p_value_nlog_min || isNaN(p_value_nlog_min))
        throw new Error('A valid -log10(p), p_value_nlog_min must be provided');

    // sets limits and offsets (by default, limit to 1,000,000 records to prevent memory overflow)
    const defaultLimit = config.rowLimit || 1e6;
    limit = Math.min(+limit, defaultLimit) || defaultLimit; // set hard limit to prevent overflow
    offset = +offset || 0;

    // determine number of variants
    const sql = `
        SELECT 
            id, 
            phenotype_id, 
            sex, 
            ancestry, 
            CAST(chromosome AS UNSIGNED) as chromosome, 
            position_abs, 
            p_value_nlog
        FROM phenotype_aggregate partition(${quote(phenotype_id)})
        WHERE p_value_nlog > :p_value_nlog_min
        AND sex = :sex
        AND ancestry = :ancestry
        LIMIT ${offset}, ${limit}
    `;

    logger.debug(`getSummary sql: ${sql}`);

    const [data, columns] = await connection.query({
        rowsAsArray: raw === 'true',
        values: {p_value_nlog_min, sex, ancestry},
        sql,
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


async function getVariants({connection, logger}, params) {
    let { sex, ancestry } = params;
    // const connection = await connectionPool.getConnection();
    const phenotypeIds = (params.phenotype_id || '').split(',');
    const phenotypeIdPlaceholders = getPlaceholders(phenotypeIds.length);
    // console.log(params, phenotypeIds,phenotypeIdPlaceholders );

    const [phenotypes] = await connection.query(
        `SELECT id, name FROM phenotype 
        WHERE id IN (${phenotypeIdPlaceholders})`,
        phenotypeIds
    );

    if (!phenotypes.length)
        throw new Error('Valid phenotype ids must be provided');

    // validate sex
    if (!sex || !await hasRecord(connection, 'lookup_sex', {value: sex}))
        throw new Error('A valid sex must be provided');

    // validate ancestry
    if (!ancestry || !await hasRecord(connection, 'lookup_ancestry', {value: ancestry}))
        throw new Error('A valid ancestry must be provided');

    // validate chromosome
    if (params.chromosome === 'X' || params.chromosome === 'x') params.chromosome = "23";
    if (params.chromosome && !await hasRecord(connection, 'chromosome_range', {id: +params.chromosome}))
        throw new Error('A valid chromosome must be provided');

    // validate/sanitize snps
    if (params.snp) {
        params.snp = params.snp.match(/[\w:]+/g).filter((x) => /^[a-z0-9\:]+$/gi.test(x));
    }

    if (params.order_by) {
        params.orderBy = params.order_by;
    }

    const [metadata] = await connection.query(
        `SELECT *  
        FROM phenotype_metadata 
        WHERE 
            ancestry = ? 
            AND sex = ? 
            AND chromosome = ? 
            AND phenotype_id IN (${phenotypeIdPlaceholders})`, 
        [
            ancestry,
            sex,
            +params.chromosome || 'all',
            phenotypeIds,
        ]        
    );

    // use only phenotypes with data, skip check if searching by SNP
    if (!params.snp && (!metadata.length || metadata.some(m => !m.count)))
        throw new Error('The specified phenotype(s) do not have any variants.');

    // determine tables for selected phenotypes
    const [tables] = await connection.query(
        phenotypes.map(p => `
            select 
                TABLE_NAME as table_name, 
                "${p.id}" as phenotype_id,
                "${p.name}" as phenotype_name
            from information_schema.tables 
            where TABLE_NAME = 'var__${p.name}__${sex}__${ancestry}'
        `).join(' UNION ')
    );

    let columns = getValidColumns('variant', params.columns);

    if (!params.columns || params.columns.includes('ancestry'))
        columns.unshift(`"${ancestry}" as ancestry`);

    if (!params.columns || params.columns.includes('sex'))
        columns.unshift(`"${sex}" as sex`);

    if (!tables.length) {
        // throw new Error('No data exists for the selected phenotype(s) stratification(s)');
        console.log("No data exists for the selected phenotype(s)");
        return { columns: columns, data: [] };
    }

    const conditions = [
        coalesce(params.id, `id = :id`),
        coalesce(params.snp, `${(params.snp || []).map(s => /^rs\d+$/i.test(s) ? `(snp = "${s.toLowerCase()}")` : `(chromosome = "${s.split(':')[0].replace(/chr/ig, '').replace(/X/ig, '23').toUpperCase()}" AND position = ${s.split(':')[1]})`).join(' OR ')}`),
        coalesce(params.chromosome, `chromosome = :chromosome`),
        coalesce(params.position, `position = :position`),
        coalesce(params.position_min, `position >= :position_min`),
        coalesce(params.position_max, `position <= :position_max`),
        coalesce(params.p_value_nlog_min, `p_value_nlog >= :p_value_nlog_min`),
        coalesce(params.p_value_nlog_max, `p_value_nlog <= :p_value_nlog_max`),
        coalesce(params.p_value_min, `p_value >= :p_value_min`),
        coalesce(params.p_value_max, `p_value <= :p_value_max`),
        coalesce(params.mod, `(id % :mod) = 0`)
    ].filter(Boolean).join(' AND ');

    // determine valid order and orderBy columns
    const order = ['asc', 'desc'].includes(params.order) 
        ? params.order 
        : 'asc';

    // orderBy is limited to indexed columns and defaults to p_value
    const orderBy = ['id', 'snp', 'chromosome', 'position', 'p_value', 'p_value_nlog'].includes(params.orderBy) 
        ? params.orderBy 
        : 'p_value';

    // sets limits and offsets (by default, limit to 1,000,000 records to prevent memory overflow)
    const defaultLimit = config.rowLimit || 1e6;
    const limit = Math.min(+params.limit, defaultLimit) || defaultLimit; // set hard limit to prevent overflow
    const offset = +params.offset || 0;

    // generate sql to query variants table(s)
    const sql = tables.map(t => {
        // add phenotype_id column if needed
        let queryColumns = columns;
        if (!params.columns || params.columns.includes('phenotype_id'))
            queryColumns = [`${t.phenotype_id} as phenotype_id`, ...columns]
    
        // generate select statement for current table
        return `SELECT ${queryColumns.join(',')} FROM ${t.table_name} 
            ${conditions.length ? `WHERE ${conditions}` : ''}`
    }).join(' UNION ') + `
        ${params.orderBy ? `ORDER BY ${orderBy} ${order}` : ''}
        LIMIT ${offset}, ${limit}
    `;

    logger.debug(`getVariants sql: ${sql}`);

    // query database
    const [data, metaColumns] = await connection.execute({
        sql, rowsAsArray: params.raw === 'true',
    }, params);

    const results = {data, columns: metaColumns.map(c => c.name)};

    // determine counts if needed
    if (params.count) {
        let innerCountSql = tables.map(t => `
            SELECT COUNT(*) as count FROM ${t.table_name}
            ${conditions.length ? `WHERE ${conditions}` : ''}
        `).join(' UNION ');
        const countSql = `SELECT SUM(count) FROM (${innerCountSql}) c`;
        logger.debug(`countSql sql: ${countSql}`);

        const [countRows] = await connection.execute(countSql, params);
        results.count = +pluck(countRows);
    }

    // optionally, determine counts through metadata if the counts query will take a long time
    else if (params.metadataCount || params.metadata_count) {
        results.count = metadata.reduce((a, b) => a + b.count, 0);
    }

    return results;
}

async function exportVariants({connection, logger}, params) {
    let rowLimit = exportRowLimit || 1e5;
    params.limit = params.limit || rowLimit;

    const phenotypeIds = params.phenotype_id.split(',');
    const phenotypeIdPlaceholders = getPlaceholders(phenotypeIds.length);

    console.log(params, phenotypeIds,phenotypeIdPlaceholders );

    const [phenotypes] = await connection.query(
        `SELECT id, name FROM phenotype 
        WHERE id IN (${phenotypeIdPlaceholders})`,
        phenotypeIds
    );

    if (!phenotypes.length)
        throw new Error('Valid phenotype ids must be provided');

    const { data, columns } = await getVariants({connection, logger}, {
        ...params, 
        columns: ['phenotype_id', 'ancestry', 'sex', 'chromosome', 'position', 'snp', 'allele_effect', 'allele_non_effect', 'allele_effect_frequency', 'p_value', 'p_value_heterogenous', 'beta', 'odds_ratio', 'beta_ci_95_high', 'beta_ci_95_low', 'odds_ratio_ci_95_high', 'odds_ratio_ci_95_low', 'n'],
        raw: 'true',
        limit: Math.min(params.limit, rowLimit),
        offset: 0,
    });
    const rows = [columns].concat(data);

    return {
        filename: [
            'plco',
            phenotypes.map(p => p.name).join('_'),
            params.ancestry,
            params.sex,
            params.p_value_min && params.p_value_max && `p_value_${params.p_value_min}_${params.p_value_max}`,
            params.p_value_nlog_min && params.p_value_nlog_max && `p_value_${10 ** -params.p_value_nlog_max}_${10 ** -params.p_value_nlog_min}`,
            params.position_min && params.position_max && `mb_range_${params.position_min / 1e6}_${params.position_max / 1e6}`,
        ].filter(Boolean).join('_') + '.csv',
        contents: rows.map(r => r.join()).join('\r\n'),
    }
}

async function getPoints({connection, logger}, { phenotype_id, sex, ancestry, raw, limit, offset }) {
    // validate phenotype id
    if (!phenotype_id || !await hasRecord(connection, 'phenotype', {id: phenotype_id}))
        throw new Error('A valid phenotype id must be provided');

    // validate sex
    if (!sex || !await hasRecord(connection, 'lookup_sex', {value: sex}))
        throw new Error('A valid sex must be provided');

    // validate ancestry
    if (!ancestry || !await hasRecord(connection, 'lookup_ancestry', {value: ancestry}))
        throw new Error('A valid ancestry must be provided');

    // sets limits and offsets (by default, limit to 1,000,000 records to prevent memory overflow)
    const defaultLimit = config.rowLimit || 1e6;
    limit = Math.min(+limit, defaultLimit) || defaultLimit; // set hard limit to prevent overflow
    offset = +offset || 0;

    // query database
    const [data, columns] = await connection.execute({
        sql: `SELECT id, p_value_nlog_expected, p_value_nlog
            FROM phenotype_point 
            WHERE phenotype_id = :phenotype_id
                AND sex = :sex 
                AND ancestry = :ancestry
            ORDER BY p_value_nlog DESC
            LIMIT ${offset}, ${limit}
            `, 
        rowsAsArray: raw === 'true',
    }, { phenotype_id, sex, ancestry, raw });
    
    return {data, columns: columns.map(c => c.name)};
}

/**
 * Retrieves metadata for a phenotype's variants
 * @param {string} filepath - Path to the sqlite database file
 * @param {string} key - A specific metadata key to retrieve
 * @returns {any} A specified key and value, or the entire list of
 * metadata properties if the key is not specified
 */
async function getMetadata({connection, logger}, params) {
    // parse parameters as arrays
    const phenotype_id = params.phenotype_id ? params.phenotype_id.split(',') : [];
    const sex = params.sex ? params.sex.split(',') : [];
    const ancestry = params.ancestry ? params.ancestry.split(',') : [];
    const chromosome = params.chromosome ? params.chromosome.split(',') : [];
    const conditions = [
        coalesce(params.phenotype_id, `m.phenotype_id IN (${getPlaceholders(phenotype_id.length)})`),
        coalesce(params.sex, `sex IN (${getPlaceholders(sex.length)})`),
        coalesce(params.ancestry, `ancestry IN (${getPlaceholders(ancestry.length)})`),
        coalesce(params.chromosome, `chromosome IN (${getPlaceholders(chromosome.length)})`),
        coalesce(params.countNotNull, `count IS NOT NULL`)
    ].filter(Boolean).join(' AND ');

    const sql = `
        SELECT
            m.id as id,
            m.phenotype_id as phenotype_id,
            p.name as phenotype_name,
            p.display_name as phenotype_display_name,
            m.sex as sex,
            m.ancestry as ancestry,
            m.chromosome as chromosome,
            m.lambda_gc as lambda_gc,
            m.lambda_gc_ld_score as lambda_gc_ld_score,
            m.count as count,
            m.participant_count,
            m.participant_count_case,
            m.participant_count_control
        FROM
            phenotype_metadata m
        JOIN
            phenotype p on m.phenotype_id = p.id
        ${conditions ? `WHERE ${conditions}` : ``}
    `;

    logger.debug(`getMetadata sql: ${sql}`);

    let [metadataRows] = await connection.query(sql, [
        ...phenotype_id,
        ...sex,
        ...ancestry,
        ...chromosome
    ]);
    return metadataRows;
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
async function getGenes({connection, logger}, params) {
    if (!params.transcription_start || !params.transcription_end || !params.chromosome) {
        throw new Error('Chromosome, transcription_start, and transcription_end are required');
    }

    // todo: only use numeric values for genes
    if (+params.chromosome === 23)
      params.chromosome = 'X';

    let sql = `
        SELECT 
            id, 
            name, 
            cast(chromosome as signed) as chromosome, 
            strand, 
            transcription_start, 
            transcription_end, 
            exon_starts, 
            exon_ends
        FROM gene
        WHERE chromosome = :chromosome AND (
            (transcription_start BETWEEN :transcription_start AND :transcription_end) OR
            (transcription_end BETWEEN :transcription_start AND :transcription_end))
    `;

    logger.debug(`getGenes sql: ${sql}`);

    const [results] = await connection.query(sql, params);
    const splitNumbers = e => (e || '').split(',').filter(e => e.length).map(Number);
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
async function getCorrelations({connection, logger}, {a, b}) {
    if (!a || !b) {
        throw new Error('Phenotype ids a and b must be provided');
    }

    let sql = `
        SELECT
            phenotype_a, pa.display_name as phenotype_a_display_name,
            phenotype_b, pb.display_name as phenotype_b_display_name,
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

    // console.log(sql);
    logger.debug(`getCorrelations sql: ${sql}`)

    let [results] = await connection.query(sql);
    return results;
}

async function getPhenotypes({connection, logger}, params = {}) {
    let columns = getValidColumns('phenotype', params.columns).map(quote).join(',')
    if (params.q) {
        columns = ['id', 'name', 'display_name', 'description', 'import_count'];
        params.q = `%${params.q}%`.toLowerCase();
    }

    const conditions = [
        coalesce(params.id, `id = :id`),
        coalesce(params.q, `
            name IS NOT NULL AND (
                LOWER(name) like :q OR
                LOWER(display_name) like :q OR
                LOWER(description) like :q
            )`),
    ].filter(Boolean).join(' OR ');

    let sql = `
        SELECT ${columns}
        FROM phenotype
        ${conditions.length ? `WHERE ${conditions}` : ``}
    `;
    logger.debug(`getPhenotypes sql: ${sql}`);
    let [phenotypes] = await connection.execute(sql, params);

    if (params.q) return phenotypes;

    phenotypes.forEach(phenotype => {
        let parent = phenotypes.find(parent => parent.id === phenotype.parent_id);
        if (parent) parent.children = [...parent.children || [], phenotype];
    });

    return params.flat
        ? phenotypes
        : phenotypes.filter(phenotype => phenotype.parent_id === null);
}

async function getParticipants({connection, logger}, params) {
    let { phenotype_id, columns, raw, precision } = params;

    // validate phenotype_id
    const [phenotypeRows] = await connection.execute(
        `SELECT id, name, type
        FROM phenotype
        WHERE id = :phenotype_id`,
        {phenotype_id}
    );

    if (!phenotypeRows.length) {
        throw new Error('Please provide a valid phenotype_id')
    }

    const { type } = phenotypeRows[0];
    const validColumns = [
        'phenotype_id',
        'value',
        'label',
        'age',
        'sex',
        'ancestry',
        'genetic_ancestry'
    ];

    // sanitize parameters
    raw = raw === 'true'
    precision = (type === 'continuous' && Number(precision)) || 0;
    columns = (columns || '').split(',').filter(c => validColumns.includes(c));
    if (!columns.length) columns = ['value'];

    let sql = `
        select
            ${[
                columns.includes('phenotype_id') ? `pd.phenotype_id as phenotype_id` : ``,
                columns.includes('value') ? `round(pd.value, :precision) as value` : ``,
                columns.includes('label') ? `pdc.label as label` : ``,
                columns.includes('age') ? `pd.age as age` : ``,
                columns.includes('sex') ? `p.sex as sex` : ``,
                columns.includes('ancestry') ? `p.ancestry as ancestry` : ``,
                columns.includes('genetic_ancestry') ? `p.genetic_ancestry as genetic_ancestry` : ``,
                `if(count(*) < 10, "< 10", count(*)) as counts`,    // do not stratify down to individuals
            ].filter(Boolean).join(',')}
        from participant_data pd
        join participant p on pd.participant_id = p.id
        left join participant_data_category pdc on pd.phenotype_id = pdc.phenotype_id and pd.value = pdc.value
        where pd.phenotype_id = :phenotype_id
        group by ${columns.map(c => c === 'value' ? `round(pd.value, :precision)` : c).join(',')}
        order by ${columns.join(',')}
    `;

    logger.debug(`getParticipants sql: ${sql}`);

    const [data, columnMetadata] = await connection.execute({
        sql, 
        values: {phenotype_id, precision}, 
        rowsAsArray: raw
    });

    return {data, columns: columnMetadata.map(c => c.name)};
}

/**
 * Gets statistical data for a specified phenotype
 * @param {*} connection - The connection to the mysql database
 * @param {{phenotype_id: number, type: "frequency"|"frequencyByAge"|"frequencyBySex"|"frequencyByAncestry"|"related"}} params - Type may be a string with the following values:
 */
async function getPhenotypeParticipants({connection, logger}, params) {
    const {id, type} = params;

    if (!type)
        throw new Error('Please specify a valid type:  "frequency"|"frequencyByAge"|"frequencyBySex"|"frequencyByAncestry"|"related"');

    if (!id)
        throw new Error('A phenotype id must be provided');

    // let connection = await connectionPool.getConnection();

    // use less-strict group_by mode
    await connection.query(`SET sql_mode = 'STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION'`);

    // retrieve the specified phenotype
    const [phenotypeRows] = await connection.execute(
        `SELECT id, name, display_name as displayName, age_name as ageName, description, type
        FROM phenotype
        WHERE id = :id`,
        {id}
    );

    if (!phenotypeRows.length)
        throw new Error('No phenotypes with the specified id was found');

    const phenotype = phenotypeRows[0];

    // retrieve average value and standard deviation
    const [metadataRows] = await connection.execute(
        `SELECT average_value, standard_deviation
        FROM phenotype_metadata
        WHERE phenotype_id = :id
        AND sex = "all"
        AND ancestry = "all"
        AND chromosome = "all"`,
        {id}
    );
    const metadata = metadataRows[0];

    if (!metadata) return 'no metadata';

    // determine value cutoff
    const {average_value, standard_deviation} = metadata;
    const [minValue, maxValue] = [
        +average_value - standard_deviation * 4, 
        +average_value + standard_deviation * 4
    ];

    // defined categories for each distribution type
    phenotype.categoryTypes = {
        frequencyByAge: [
            "55-59",
            "60-64",
            "65-69",
            "70-74",
            "75-79"
        ],
        frequencyBySex: [
            "female",
            "male",
        ],
        frequencyByAncestry: [
            "white",
            "black",
            "hispanic",
            "asian",
            "pacific_islander",
            "american_indian",
        ]
    };

    phenotype.frequency = {};
    phenotype.frequencyByAge = {};
    phenotype.frequencyByAncestry = {};
    phenotype.frequencyBySex = {};

    // if binary, assume there are two categories (with/without)
    if (phenotype.type === 'binary') {
        phenotype.categories = [`Without ${phenotype.displayName}`, `With ${phenotype.displayName}`];
        phenotype.distributionCategories = [phenotype.categories[1]];

        // for frequency charts, retrieve the counts for each distinct value
        if (type === 'frequency') {
            let binaryFrequencySql = `
                SELECT value, count(*) as count FROM participant_data pd
                JOIN participant p ON p.id = pd.participant_id
                WHERE
                    pd.phenotype_id = :id AND
                    pd.value is not null AND
                    (pd.age IS NULL OR pd.age >= 55)
                group by value
                order by value
            `;
            logger.debug(`getPhenotype binary frequency sql: ${binaryFrequencySql}`)
            phenotype.frequency = (await connection.execute(
                binaryFrequencySql,
                {id}
            ))[0].map(f => f.count); // [without #, with #]
        } else if (/^frequencyBy(Age|Sex|Ancestry)$/.test(type)) {
            // determine the column to use within the participant table
            const key = {
                frequencyByAge: 'age',
                frequencyBySex: 'sex',
                frequencyByAncestry: 'ancestry',
            }[type];

            // generates an array of values for each key
            const keyValueArrayReducer = (key, value) => ((obj = {}, curr) => ({
                ...obj,
                [curr[key]]: [...(obj[curr[key]] || []), +curr[value]]
            }));

            let keyAlias = (key === 'age' && phenotype.ageName)
                ? `pd.age`
                : `p.${key}`

            let selectParticipants = 
                `SELECT ${keyAlias} AS \`key\`
                    FROM participant_data pd
                    INNER JOIN participant p ON p.id = pd.participant_id
                    WHERE
                        pd.phenotype_id = :id AND
                        pd.value = 1 AND
                        ${keyAlias} IS NOT NULL AND
                        (pd.age IS NULL OR pd.age >= 55)`;

            let selectParticipantCount = (key === 'age' && phenotype.ageName)
                ? `select count(*) as total
                    from participant_data pd
                    where phenotype_id = :id
                    and pd.value = 1`
                : `SELECT p.${key} as value, COUNT(*) AS total
                    FROM participant p 
                    WHERE p.${key} IS NOT NULL
                    GROUP BY p.${key}`;
            

            let binaryDistributionSql = `
                WITH
                participant_selection AS (${selectParticipants}),
                participant_count AS (${selectParticipantCount})
                SELECT
                    \`key\`,
                    count(*) AS counts,
                    100 * count(*) / (SELECT total FROM participant_count pc ${
                        (key === 'age' && phenotype.ageName) ? '' : 
                        'WHERE pc.value = `key`'
                    }) AS percentage
                FROM participant_selection p
                GROUP BY \`key\`
                ORDER BY \`key\`
            `;

            logger.debug(`getPhenotype binary ${key} distribution sql: ${binaryDistributionSql}`)

            // determine the distribution of unique values for the specified key
            const [distribution] = await connection.execute(
                binaryDistributionSql,
                {id}
            );
            phenotype[type] = {
                counts: distribution.reduce(keyValueArrayReducer('key', 'counts'), {}),
                percentage: distribution.reduce(keyValueArrayReducer('key', 'percentage'), {})
            };
        }
    } else {
        // handle continuous and categorical phenotypes

        // keyGroupReducer parses a row of records as an object map
        // and differs for categorical and continuous phenotypes
        let keyGroupReducer;

        if (phenotype.type === 'categorical') {
            // fetch categorical phenotype categories from the participant_data_category table
            // and update the keyValueReducer to include only records within distributionCategories

            let categoricalCategoriesSql = `
                SELECT label, show_distribution, value FROM participant_data_category
                WHERE phenotype_id = :id
                ORDER BY \`order\`, \`value\`;
            `;

            logger.debug(`getPhenotype categorical categories sql: ${categoricalCategoriesSql}`);

            let [categoryRows] = await connection.execute(
                categoricalCategoriesSql,
                {id: params.id}
            )

            phenotype.categories = categoryRows.map(e => e.label);
            phenotype.distributionCategories = categoryRows
                .filter(e => e.show_distribution)
                .map(e => e.label);

            keyGroupReducer = (categories, distributionKey) => (acc, curr) => {
                let categoryName = categoryRows.find(c => c.value == curr.group).label;
                if (!phenotype.distributionCategories.includes(categoryName)) return acc;
                if (!acc[categoryName])
                    acc[categoryName] = new Array(categories.length).fill(0);
                acc[categoryName][categories.indexOf(curr.key)] = +curr[distributionKey];
                return acc;
            }

        } else if (phenotype.type === 'continuous') {
            // otherwise, for continuous phenotypes, do not restrict the allowed keys to categories
            keyGroupReducer = (categories, distributionKey) => (acc, curr) => {
                if (!acc[curr.group]) acc[curr.group] = new Array(categories.length).fill(0);
                acc[curr.group][categories.indexOf(curr.key)] = +curr[distributionKey];
                return acc;
            }
        }

        if (type === 'frequency' && phenotype.type === 'categorical') {
            // fetch frequencies for categorical phenotypes
            let categoricalFrequencySql = `
                SELECT pd.value, count(*) as count
                FROM participant_data pd
                LEFT JOIN participant_data_category pdc on pdc.phenotype_id = pd.phenotype_id and pdc.value = pd.value
                WHERE
                    pd.phenotype_id = :id AND
                    pd.value IS NOT NULL
                GROUP BY \`value\`
                ORDER BY pdc.order, pdc.value;
            `;
            logger.debug(`getPhenotype categorical frequency sql: ${categoricalFrequencySql}`)
            phenotype.frequency = (await connection.execute(
                categoricalFrequencySql,
                {id: params.id}
            ))[0].map(e => e.count);
        } else if (type === 'frequency' && phenotype.type === 'continuous') {
            // fetch frequencies for continuous phenotypes
            let continuousFrequencySql = `
                SELECT
                    FLOOR(value) AS continuous_value,
                    COUNT(*) as count
                FROM participant_data
                WHERE
                    phenotype_id = :id AND
                    value IS NOT NULL AND
                    value BETWEEN ${minValue} AND ${maxValue}
                GROUP BY continuous_value
                ORDER BY continuous_value
            `;
            logger.debug(`getPhenotype continuous frequency sql: ${continuousFrequencySql}`);
            let [frequencyRows] = await connection.query(
                continuousFrequencySql,
                {id: params.id}
            );
            phenotype.frequency = frequencyRows.map(e => e.count);
            phenotype.categories = frequencyRows.map(e => e.continuous_value);
        } else if (/^frequencyBy(Age|Sex|Ancestry)$/.test(type)) {
            // fetch frequency distributions by age, sex, or ancestry

            // determine which column to group results by
            let key = {
                frequencyByAge: 'age',
                frequencyBySex: 'sex',
                frequencyByAncestry: 'ancestry',
            }[type];

            // determine which query to use to fetch distribution counts and percentages
            let distributionSql = key === 'age'
                ? `WITH participant_age AS (
                    SELECT
                        CASE
                            WHEN pd.age BETWEEN 55 and 59 then '55-59'
                            WHEN pd.age BETWEEN 60 AND 64 THEN '60-64'
                            WHEN pd.age BETWEEN 65 AND 69 THEN '65-69'
                            WHEN pd.age BETWEEN 70 AND 74 THEN '70-74'
                            WHEN pd.age BETWEEN 75 AND 79 THEN '75-79'
                        END AS \`age_range\`,
                        COUNT(*) AS \`count\`
                    FROM participant_data pd
                    WHERE pd.phenotype_id = :id
                    AND pd.age BETWEEN 55 AND 79
                    GROUP BY \`age_range\`
                ) 
                    SELECT
                        CASE
                            WHEN pd.age between 55 and 59 then '55-59'
                            WHEN pd.age BETWEEN 60 AND 64 THEN '60-64'
                            WHEN pd.age BETWEEN 65 AND 69 THEN '65-69'
                            WHEN pd.age BETWEEN 70 AND 74 THEN '70-74'
                            WHEN pd.age BETWEEN 75 AND 79 THEN '75-79'
                        END AS \`key\`,
                        FLOOR(pd.value) AS \`group\`,
                        COUNT(*) AS \`counts\`,
                        100 * COUNT(*) / (SELECT pa.count FROM participant_age pa WHERE pa.age_range = \`key\`) AS \`percentage\`
                    FROM participant_data pd
                    WHERE
                        pd.phenotype_id = :id AND
                        pd.value IS NOT NULL AND
                        pd.value BETWEEN ${minValue} AND ${maxValue} AND
                        pd.age BETWEEN 55 AND 79
                    GROUP BY \`key\`, \`group\`
                    ORDER BY \`key\`, \`group\`;`
                : `WITH participant_counts AS (
                    SELECT
                        p.${key} AS \`pc_key\`,
                        COUNT(*) AS \`count\`
                    FROM participant p
                    WHERE p.${key} IS NOT NULL
                    GROUP BY \`pc_key\`
                    ) SELECT
                        p.${key} AS \`key\`,
                        FLOOR(pd.value) as \`group\`,
                        COUNT(*) AS \`counts\`,
                        100 * COUNT(*) / (SELECT count FROM participant_counts WHERE pc_key = \`key\`) as \`percentage\`
                    FROM participant_data pd
                    JOIN participant p ON p.id = pd.participant_id
                    WHERE
                        pd.phenotype_id = :id AND
                        pd.value IS NOT NULL AND
                        pd.value BETWEEN ${minValue} AND ${maxValue} AND
                        (pd.age IS NULL OR pd.age BETWEEN 55 AND 79) AND
                        p.${key} IS NOT NULL
                    GROUP BY \`key\`, \`group\`
                    ORDER BY \`key\`, \`group\`;`;

            const categories = phenotype.categoryTypes[type];

            logger.debug(`getPhenotype categorical ${key} distribution sql: ${distributionSql}`);

            const [distributionRows] = await connection.execute(
                distributionSql,
                {id: params.id}
            );

            phenotype[type] = {
                counts: distributionRows.reduce(keyGroupReducer(categories, 'counts'), {}),
                percentage: distributionRows.reduce(keyGroupReducer(categories, 'percentage'), {})
            };
        }
    }

    if (type === 'related-phenotypes') {
        let sql = `
            WITH related_phenotype AS (
                SELECT phenotype_a AS phenotype_id, value
                FROM phenotype_correlation
                WHERE phenotype_b = :id AND phenotype_a != :id
                UNION
                SELECT phenotype_b AS phenotype_id, value
                FROM phenotype_correlation
                WHERE phenotype_a = :id AND phenotype_b != :id
                ORDER BY value DESC
                LIMIT 5
            )
            SELECT
                rp.phenotype_id AS phenotype_id,
                p.participant_count AS participant_count,
                p.display_name AS display_name,
                rp.value AS correlation
            FROM related_phenotype rp
            JOIN phenotype p ON rp.phenotype_id = p.id;
        `;

        logger.debug(`getPhenotype related phenotypes sql: ${sql}`);
        const [relatedPhenotypeRows] = await connection.execute(sql, {id});
        phenotype.relatedPhenotypes = relatedPhenotypeRows;
    }

    const asTitleCase = str => str
        .replace(/_/g, ' ')
        .replace(/\w+/g, str => str[0].toUpperCase() + str.substr(1).toLowerCase());

    // TitleCase phenotype labels
    for (let key in phenotype.categoryTypes) {
        phenotype.categoryTypes[key] = phenotype.categoryTypes[key].map(asTitleCase);
    }

    // Binary phenotypes have counts/percentages with category keys
    if (phenotype.type === 'binary') {
        for (let type of ['frequencyBySex', 'frequencyByAncestry', 'frequencyByAge']) {
            for (let key of ['counts', 'percentage']) {
                if (phenotype[type][key]) {
                    for (let subkey of Object.keys(phenotype[type][key])) {
                        if (!/[a-z]/.test(subkey)) continue;
                        phenotype[type][key][asTitleCase(subkey)] = phenotype[type][key][subkey];
                        delete phenotype[type][key][subkey];
                    }
                }
            }
        }
    }


    // await connection.release();
    return phenotype;
}


async function getRanges({connection, logger}) {
    let sql = `SELECT * FROM chromosome_range`;

    logger.debug(`getRanges sql: ${sql}`);

    let [ranges] = await connection.query(sql);
    return ranges;
}


/**
 * Retrieves a specific configuration key
 * @param {string} key - The key to retrieve
 * @returns {any} The specified key and its value
 */
function getConfig(key) {
    if (!key)
        throw new Error('A valid configuration key must be provided')

    const allowedKeys = ['downloadRoot', 'exportRowLimit'];
    return allowedKeys.includes(key)
        ? {[key]: config[key]}
        : null;
}

async function getDownloadLink({connection, logger}, {phenotype_id}) {

    if (!phenotype_id) {
        throw new Error('Please provide a phenotype_id.');
    }

    let sql = `
        SELECT name
        FROM phenotype
        WHERE id = :phenotype_id
        AND import_date IS NOT NULL
    `;

    logger.debug(`getDownloadLink sql: ${sql}`);

    let [downloadLinkRows] = await connection.execute(
        sql,
        {phenotype_id}
    );

    if (!downloadLinkRows.length) {
        throw new Error('The provided phenotype_id must have an import date.');
    }
    
    return `${config.downloadRoot}${downloadLinkRows[0].name}.tsv.gz`;
}

async function getShareLink({connection, logger}, {share_id}) {
    if (!share_id) 
        throw new Error('A valid share_id must be provided');

    let sql = `
        SELECT route, parameters
        FROM share_link
        WHERE share_id = :share_id
    `;

    logger.debug(`getShareLink sql: ${sql}`);

    let [shareLinkRows] = await connection.execute(
        sql,
        {share_id}
    );

    return shareLinkRows.length ? shareLinkRows[0] : null;;
}

async function setShareLink({connection, logger}, {route, parameters}) {
    if (!route || !parameters)
        throw new Error('A valid route and parameters object must be provided')

    let sql1 = `
        INSERT INTO share_link (share_id, route, parameters, created_date)
        VALUES (UUID(), :route, :parameters, NOW());
    `;

    logger.debug(`setShareLink generate id sql: ${sql1}`)
    
    let [results] = await connection.execute(
        sql1,
        {route, parameters: JSON.stringify(parameters)}
    );

    let sql2 = `
        SELECT share_id
        FROM share_link
        WHERE id = :id
    `;

    logger.debug(`setShareLink get id sql: ${sql2}`)

    let shareLinkRows = await connection.execute(
        sql2,
        {id: results.insertId}
    );

    return pluck(shareLinkRows);
}

async function getPrincipalComponentAnalysis({connection, logger}, {phenotype_id, platform, pc_x, pc_y, raw, limit}) {


    // validate phenotype id
    if (!phenotype_id || !await hasRecord(connection, 'phenotype', {id: phenotype_id}))
        throw new Error('A valid phenotype id must be provided');

    // validate platforms
    const platforms = ['PLCO_GSA', 'PLCO_Omni5', 'PLCO_Omni25', 'PLCO_Oncoarray', 'PLCO_OmniX'];
    if (!platforms.includes(platform))
        throw new Error(`A valid platform must be provided. Supported platforms include: ${platforms.join(', ')}`)

    if (!pc_x || !pc_y || isNaN(pc_x) || isNaN(pc_y))
        throw new Error('Valid  principal components must be provided as pc_x and pc_y values');

    if (pc_x == pc_y)
        throw new Error('Principal components must be different');
        
    const rowLimit = limit ? `LIMIT ${limit}` : ``;

    const sql = `
        with pca as (
            select 
                participant_id as participant_id,
                max(case when principal_component = :pc_x then value end) as pc_x,
                max(case when principal_component = :pc_y then value end) as pc_y
            from principal_component_analysis
            where platform = :platform
            group by participant_id
        ) select 
            pca.pc_x as pc_x,
            pca.pc_y as pc_y,
            p.genetic_ancestry as ancestry,
            p.sex as sex,
            pd.value as value
        from pca
            join participant p on pca.participant_id = p.id
            join participant_data pd on pca.participant_id = pd.participant_id 
        where
            pd.phenotype_id = :phenotype_id
        ${rowLimit}`

    logger.debug(`getPrincipalComponentAnalysis sql: ${sql}`);

    const [data, columns] = await connection.query({
        rowsAsArray: raw === 'true',
        values: {phenotype_id, platform, pc_x, pc_y},
        sql,
    });

    return {columns: columns.map(c => c.name), data};
}

module.exports = {
    getSummary,
    getVariants,
    getPoints,
    getMetadata,
    getCorrelations,
    getParticipants,
    getPhenotypeParticipants,
    getPhenotypes,
    getRanges,
    getGenes,
    getConfig,
    getDownloadLink,
    getShareLink,
    setShareLink,
    exportVariants,
    getPrincipalComponentAnalysis,
    deferUntilConnected,
    ping,
};

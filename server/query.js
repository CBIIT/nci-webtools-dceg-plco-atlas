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
    namedPlaceholders: true,
    multipleStatements: true,
  }).promise();

/**
 * Returns a function which can be used to get the elapseed
 * duration (in seconds) since the initial function call
 */
function getTimestamp() {
    const startTime = new Date();
    return () => (new Date() - startTime) / 1000;
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
        variant: ['id', 'chromosome', 'position', 'snp', 'allele_reference', 'allele_alternate', 'p_value', 'p_value_nlog', 'p_value_nlog_expected', 'beta', 'odds_ratio', 'ci_95_low', 'ci_95_high', 'show_qq_plot'],
        point: ['id', 'phenotype_id', 'sex', 'chromosome', 'position', 'snp', 'p_value_nlog', 'p_value_nlog_expected'],
        aggregate: ['id', 'phenotype_id', 'sex', 'chromosome', 'position_abs', 'p_value_nlog'],
        phenotype: ['id', 'parent_id', 'name', 'age_name', 'display_name', 'description', 'color', 'type', 'participant_count', 'import_count', 'import_date'],
    }[tableName];

    return columns.length
        ? intersection(columns, validColumns)
        : validColumns;
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
async function getSummary(connection, {phenotype_id, table, sex, p_value_nlog_min, raw}) {
    let timestamp = getTimestamp();

    // validate parameters
    if (!/^(all|female|male)$/.test(sex) ||
        (phenotype_id && !await hasRecord(connection, 'phenotype', {id: phenotype_id})))
        return null;

    // determine id if table name was supplied (remove once table parameter is no longer used)
    if (table) {
        const name = table.replace('aggregate_', '');
        const [phenotypeRows] = await query(connection, 'phenotype', {name});
        if (!phenotypeRows.length) return null;
        phenotype_id = phenotypeRows[0].id;
    }

    const partition = quote(`${phenotype_id}_${sex}`);

    // determine number of variants
    const [maxPValueNlogRows] = await connection.query(`select max(p_value_nlog) from phenotype_aggregate partition (${partition})`);
    const maxPValueNlog = pluck(maxPValueNlogRows)
    const pValueNLogPrecision = maxPValueNlog > 20 ? 1 : 2;

    const sql = `
        SELECT DISTINCT 
            chromosome, 
            position_abs,
            ROUND(p_value_nlog, ${pValueNLogPrecision}) as p_value_nlog
        FROM phenotype_aggregate partition(${partition})
        WHERE p_value_nlog > :p_value_nlog_min
    `;

    logger.debug(`getSummary sql: ${sql}`);

    const [data, columns] = await connection.query({
        rowsAsArray: raw,
        values: {p_value_nlog_min},//[params.table, params.sex, params.p_value_nlog_min],
        sql,
    });

    // logger.info(`[${process.pid}] /summary: ${timestamp()}s in database`);
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


async function getVariants(connectionPool, params) {
    if (!/^\d+(,\d+)*$/.test(params.phenotype_id))
        throw('Phenotype ID must consist of numeric values');

    if (params.sex && !/^(all|female|male)(,(all|female|male))*$/.test(params.sex))
        throw('Sex must be all, male, or female');

    if (params.id && !params.sex) {
        params.sex = [null, 'all', 'female', 'male'][+params.id[0]]
    }

    const connection = await connectionPool.getConnection();
    const [phenotypes] = await connection.query(
        `SELECT * FROM phenotype WHERE id IN (?)`,
        [params.phenotype_id.split(',')]
    );

    if (!phenotypes.length) 
        throw('No phenotypes with the specified id(s) were found');

    if (!phenotypes.filter(p => p.import_date).length)
        throw('The specified phenotype(s) do not have an import date');

    const [tableNameRows] = await connection.query(
        params.phenotype_id.split(',').map(id => `
            select table_name from information_schema.tables where
            table_name like 'phenotype_variant_${id}_%'
        `).join(' UNION ')
    );
    const tableNames = tableNameRows
        .map(row => row.TABLE_NAME)
        .filter(name => !params.sex || (params.sex && name.includes(`_${params.sex}`)))

    const partitionNames = tableNames.map(tableName => {
        let name = tableName.replace('phenotype_variant_', '');
        return params.chromosome ? `\`${name}_${params.chromosome}\`` : ''
    })

    let columnNames = getValidColumns('variant', params.columns).map(quote);
    let includePhenotypeId = !params.columns || params.columns.includes('phenotype_id');
    let includeSex = !params.columns || params.columns.includes('sex');

    const conditions = [
        coalesce(params.id, `id = :id`),
        coalesce(params.snp, `snp = :snp`),
        // coalesce(params.chromosome, `chromosome = :chromosome`),
        coalesce(params.position, `position = :position`),
        coalesce(params.position_min, `position >= :position_min`),
        coalesce(params.position_max, `position <= :position_max`),
        coalesce(params.p_value_nlog_min, `p_value_nlog >= :p_value_nlog_min`),
        coalesce(params.p_value_nlog_max, `p_value_nlog <= :p_value_nlog_max`),
        coalesce(params.p_value_min, `p_value >= :p_value_min`),
        coalesce(params.p_value_max, `p_value <= :p_value_max`),
        coalesce(params.mod, `(id % :mod) = 0`),
        coalesce(params.show_qq_plot, `show_qq_plot = 1`)
    ].filter(Boolean).join(' AND ');

    // determine valid order and orderBy columns
    let order = ['asc', 'desc'].includes(params.order) 
        ? params.order 
        : 'asc';

    // orderBy is limited to indexed columns and defaults to p_value
    let orderBy = ['id', 'snp', 'chromosome', 'position', 'p_value', 'p_value_nlog'].includes(params.orderBy) 
        ? params.orderBy 
        : 'p_value';

    // sets limits and offsets (by default, limit to 100,000 records to prevent memory overflow)
    let limit = params.limit ? Math.min(params.limit, 1e5) : 1e5; // set hard limit to prevent overflow
    let offset = +params.offset || 0;

    // sql_calc_found_rows will eventually be deprecated, so we'll need to fall back using a secondary count(*) query at some point
    let sql = tableNames.map((name, i) => {
        const [phenotype_id, sex] = name.split('_').slice(-2);
        let columns = [...columnNames];
        if (includePhenotypeId) columns.unshift(`${phenotype_id} as phenotype_id`);
        if (includeSex) columns.unshift(`"${sex}" as sex`);
        return `
            SELECT ${columns.join(',')} 
            FROM ${name} 
            ${partitionNames[i] ? `PARTITION(${partitionNames[i]})` : ''}
            ${conditions.length ? `WHERE ${conditions}` : ''}`;
    }).join(' UNION ') + `
        ${params.orderBy ? `ORDER BY ${orderBy} ${order}` : ''}
        ${params.limit ? `LIMIT ${offset}, ${limit}` : ''};
    `;

    logger.debug(`getVariants sql: ${sql}`);

    // query database
    const [data, columns] = await connection.execute({
        sql, rowsAsArray: params.raw,
    }, params);

    const results = {data, columns: columns.map(c => c.name)};

    // determine counts if needed
    if (params.count) {
        let innerCountSql = tableNames.map((name, i) => `
            SELECT COUNT(*) as count FROM ${name}
            ${partitionNames[i] ? `PARTITION(${partitionNames[i]})` : ''}
            ${conditions.length ? `WHERE ${conditions}` : ''}`).join('UNION');
        const countSql = `SELECT SUM(count) FROM (${innerCountSql}) c`;
        logger.debug(`countSql sql: ${countSql}`);

        const [countRows] = await connection.execute(countSql, params);
        results.count = +pluck(countRows);
    }

    // determine counts through metadata
    else if (params.metadataCount) {
        const countRows = await getMetadata(connection, {
            phenotype_id: params.phenotype_id,
            sex: params.sex,
            chromosome: params.chromosome || 'all'
        });
        if (countRows.length) 
            results.count = countRows.reduce((a, b) => a + b.count, 0);
    }

    await connection.release();
    return results;
}

async function getPoints(connectionPool, params) {
    if (!/^\d+(,\d+)*$/.test(params.phenotype_id))
        throw('Phenotype ID must consist of numeric values');
    
    if (params.sex && !/^(all|female|male)(,(all|female|male))*$/.test(params.sex))
        throw('Sex must be all, male, or female');

    const connection = await connectionPool.getConnection();
    const [phenotypes] = await connection.query(
        `SELECT * FROM phenotype WHERE id IN (?)`,
        [params.phenotype_id.split(',')]
    );

    if (!phenotypes.length) 
        throw('No phenotypes with the specified id(s) were found');

    if (!phenotypes.filter(p => p.import_date).length)
        throw('The specified phenotype(s) do not have an import date');

    const columnNames = getValidColumns('point', params.columns).map(quote);
    const partitions = phenotypes.map(p => params.sex 
        ? params.sex.split(',').map(sex => quote(`${p.id}_${sex}`)).join(',')
        : quote(`${p.id}`)
    );

    const conditions = [
        coalesce(params.id, `id = :id`),
        coalesce(params.chromosome, `chromosome = :chromosome`),
        coalesce(params.position, `position = :position`),
        coalesce(params.position_min, `position >= :position_min`),
        coalesce(params.position_max, `position <= :position_max`),
        coalesce(params.p_value_nlog_min, `p_value_nlog >= :p_value_nlog_min`),
        coalesce(params.p_value_nlog_max, `p_value_nlog <= :p_value_nlog_max`)
    ].filter(Boolean).join(' AND ');

    // determine valid order and orderBy columns
    let order = ['asc', 'desc'].includes(params.order) 
        ? params.order 
        : 'asc';

    // orderBy is limited to indexed columns and defaults to p_value
    let orderBy = ['id', 'p_value_nlog'].includes(params.orderBy) 
        ? params.orderBy 
        : 'p_value_nlog';

    // sets limits and offsets (by default, limit to 100,000 records to prevent memory overflow)
    let limit = params.limit ? Math.min(params.limit, 1e5) : 1e5; // set hard limit to prevent overflow
    let offset = +params.offset || 0;

    // sql_calc_found_rows will eventually be deprecated, so we'll need to fall back using a secondary count(*) query at some point
    const sql = `
        SELECT ${columnNames.join(',')} 
        FROM phenotype_point partition(${partitions.join(',')})
        ${conditions.length ? `WHERE ${conditions}` : ''}
        ${params.orderBy ? `ORDER BY ${orderBy} ${order}` : ''}
        ${params.limit ? `LIMIT ${offset}, ${limit}` : ''};
    `;

    logger.debug(`getPoints sql: ${sql}`);

    // query database
    const [data, columns] = await connection.execute({
        sql, rowsAsArray: params.raw,
    }, params);

    const results = {data, columns: columns.map(c => c.name)};

    await connection.release();
    return results;
}


/**
 * Retrieves metadata for a phenotype's variants
 * @param {string} filepath - Path to the sqlite database file
 * @param {string} key - A specific metadata key to retrieve
 * @returns {any} A specified key and value, or the entire list of
 * metadata properties if the key is not specified
 */
async function getMetadata(connection, params) {

    // assign default parameters if needed
    const defaults = {
        // sex: 'all',
        chromosome: 'all'
    };
    params = {...defaults, ...params};

    // validate parameters
    if ((params.phenotype_id && !/^\d+(,\d+)*$/.test(params.phenotype_id)) ||
        (params.sex && !/^(all|female|male)(,(all|female|male))*$/.test(params.sex)) ||
        !/^(all|x|y|\d+)(,(all|x|y|\d+))*$/.test(params.chromosome))
    return null;

    // parse parameters as arrays
    const phenotype_id = params.phenotype_id ? params.phenotype_id.split(',') : [];
    const sex = params.sex ? params.sex.split(',') : [];
    const chromosome = params.chromosome ? params.chromosome.split(',') : [];
    const getPlaceholders = length => new Array(length).fill('?').join(',');

    const conditions = [
        coalesce(params.phenotype_id, `m.phenotype_id IN (${getPlaceholders(phenotype_id.length)})`),
        coalesce(params.sex, `sex IN (${getPlaceholders(sex.length)})`),
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
            m.chromosome as chromosome,
            m.lambda_gc as lambda_gc,
            m.count as count
        FROM
            phenotype_metadata m
        JOIN
            phenotype p on m.phenotype_id = p.id
        WHERE
            ${conditions}
    `;

    logger.debug(`getMetadata sql: ${sql}`);

    let [metadataRows] = await connection.query(sql, [
        ...phenotype_id,
        ...sex,
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
async function getGenes(connection, params) {
    const splitNumbers = e => (e || '')
        .split(',')
        .filter(e => e !== '')
        .map(e => +e);

    let sql = `
        SELECT *
        FROM gene
        WHERE chromosome = :chromosome AND (
            (transcription_start BETWEEN :transcription_start AND :transcription_end) OR
            (transcription_end BETWEEN :transcription_start AND :transcription_end))
    `;

    logger.debug(`getGenes sql: ${sql}`);

    const [results] = await connection.query(sql, params);

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

async function getPhenotypes(connection, params) {
    let columns = getValidColumns('phenotype', params.columns).map(quote).join(',');
    let sql = `
        SELECT ${columns}
        FROM phenotype
        ${params.id ? 'WHERE id = :id' : ''}
    `;
    logger.debug(`getPhenotypes sql: ${sql}`);
    let [phenotypes] = await connection.execute(sql, params);

    phenotypes.forEach(phenotype => {
        let parent = phenotypes.find(parent => parent.id === phenotype.parent_id);
        if (parent) parent.children = [...parent.children || [], phenotype];
    });

    return params.flat
        ? phenotypes
        : phenotypes.filter(phenotype => phenotype.parent_id === null);
}

/**
 * Gets statistical data for a specified phenotype
 * @param {*} connection - The connection to the mysql database
 * @param {{phenotype_id: number, type: "frequency"|"frequencyByAge"|"frequencyBySex"|"frequencyByAncestry"|"related"}} params - Type may be a string with the following values:
 */
async function getPhenotype(connectionPool, params) {
    const {id, type} = params;

    if (!type)
        throw('Please specify a valid type:  "frequency"|"frequencyByAge"|"frequencyBySex"|"frequencyByAncestry"|"related"');

    let connection = await connectionPool.getConnection();

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
        throw('No phenotypes with the specified id was found');

    const phenotype = phenotypeRows[0];

    // retrieve average value and standard deviation
    const [metadataRows] = await connection.execute(
        `SELECT average_value, standard_deviation
        FROM phenotype_metadata
        WHERE phenotype_id = :id
        AND sex = "all"
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

    await connection.release();
    return phenotype;
}


async function getRanges(connection) {
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
    const allowedKeys = ['downloadRoot'];
    return allowedKeys.includes(key)
        ? {[key]: config[key]}
        : null;
}

async function getShareLink(connection, {share_id}) {
    if (!share_id) return null;

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

async function setShareLink(connection, {route, parameters}) {
    if (!route || !parameters) return null;

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

module.exports = {
    connection,
    getSummary,
    getVariants,
    getPoints,
    getMetadata,
    getCorrelations,
    getPhenotype,
    getPhenotypes,
    getRanges,
    getGenes,
    getConfig,
    getShareLink,
    setShareLink
};

const fs = require('fs');
const mysql = require('mysql2');
const args = require('minimist')(process.argv.slice(2));
const ranges = require('../../json/chromosome_ranges.json');
const { database } = require('../../../server/config.json');
const { timestamp } = require('./utils/logging');
const { readFile } = require('./utils/file');
const { getRecords, pluck } = require('./utils/query');
const { getIntervals, getLambdaGC } = require('./utils/math');

/**
lambdagc_ewing|1.036
lambdagc_rcc|1.029
lambdagc_mel|0.83
 */

// display help if needed
if (!(args.file && args.phenotype && args.gender)) {
    console.log(`USAGE: node import-variants.js
            --file "filename"
            --phenotype "phenotype name or id"
            --gender "all" | "female" | "male"
            --reset (if specified, remove all records in phenotype)`);
    process.exit(0);
}

// parse arguments and set defaults
const { file: inputFilePath, phenotype, gender, reset: shouldReset } = args;
//const errorLog = getLogStream(`./failed-variants-${new Date().toISOString()}.txt`);
const errorLog = {write: e => console.log(e)};
const duration = timestamp();
const connection = mysql.createConnection({
    host: database.host,
    database: database.name,
    user: database.user,
    password: database.password,
    namedPlaceholders: true,
    multipleStatements: true,
    // debug: true,
  }).promise();

// input file should exist
if (!fs.existsSync(inputFilePath)) {
    console.error(`ERROR: ${inputFilePath} does not exist.`);
    process.exit(1);
}

// gender should be male, female, or all
if (!/^(all|female|male)$/.test(gender)) {
    console.error(`ERROR: Gender must be all, female, or male`);
    process.exit(1);
}

importVariants().then(e => {
    console.log(`[${duration()} s] Imported variants`);
    process.exit(0);
});

async function importVariants() {
    // find phenotypes either by name or id (if a numeric value was provided)
    const phenotypeKey = /^\d+$/.test(phenotype) ? 'id' : 'name';
    const phenotypes = await getRecords(connection, 'phenotype', {
        [phenotypeKey]: phenotype
    });

    if (phenotypes.length === 0) {
        console.error(`ERROR: Phenotype does not exist`)
        process.exit(1);
    }

    if (phenotypes.length > 1) {
        console.error(`ERROR: More than one phenotype was found with the same name. Please specify the phenotype id instead of the name.`)
        process.exit(1);
    }

    const phenotypeName = phenotypes[0].name;
    const phenotypeId = phenotypes[0].id;
    const phenotypePrefix = `${phenotypeName}_${phenotypeId}`;
    const variantTable = `${phenotypePrefix}_variant`;
    const aggregateTable = `${phenotypePrefix}_aggregate`;
    const schemaSql = readFile('../../schema/tables/variant.sql').replace(/\$PHENOTYPE/g, phenotypePrefix);
    const indexSql = readFile('../../schema/indexes/variant.sql').replace(/\$PHENOTYPE/g, phenotypePrefix);

    // clear variants if needed
    if (shouldReset) {
        console.log(`[${duration()} s] Clearing ${variantTable}, ${aggregateTable}...`);
        await connection.query(`
            DROP TABLE IF EXISTS ${variantTable};
            DROP TABLE IF EXISTS ${aggregateTable};
            ${schemaSql}
            ${indexSql}
        `);
    }

    console.log(`[${duration()} s] Setting up temporary table...`);
    await connection.query(`
        FLUSH TABLES;
        START TRANSACTION;
        SET autocommit = 0;

        -- disable indexes
        ALTER TABLE ${variantTable} DISABLE KEYS;
        ALTER TABLE ${aggregateTable} DISABLE KEYS;

        -- create staging table
        CREATE TEMPORARY TABLE stage (
            chromosome              VARCHAR(2),
            position                BIGINT,
            position_abs_aggregate  BIGINT,
            snp                     VARCHAR(200),
            allele_reference        VARCHAR(200),
            allele_effect           VARCHAR(200),
            p_value                 DOUBLE,
            p_value_nlog            DOUBLE, -- negative log10(P)
            p_value_nlog_aggregate  DOUBLE,
            p_value_r               DOUBLE,
            odds_ratio              DOUBLE,
            odds_ratio_r            DOUBLE,
            n                       BIGINT,
            q                       DOUBLE,
            i                       DOUBLE
        ) ENGINE=MYISAM;
    `);

    console.log(`[${duration()} s] Loading variants into staging table...`);
    await connection.query({
        infileStreamFactory: path => fs.createReadStream(inputFilePath),
        sql: `LOAD DATA LOCAL INFILE "${inputFilePath}"
            INTO TABLE stage
            FIELDS TERMINATED BY ','
            IGNORE 1 LINES
            (@chromosome, @position, snp, allele_reference, allele_effect, @p_value, p_value_r, odds_ratio, odds_ratio_r, n, q, i)
            SET chromosome = @chromosome,
                position = @position,
                p_value = @p_value,
                p_value_nlog = -LOG10(@p_value),
                p_value_nlog_aggregate = 1e-2 * FLOOR(1e2 * -LOG10(@p_value)),
                position_abs_aggregate = 1e6 * FLOOR(1e-6 * (SELECT @position + position_abs_min FROM chromosome_range cr WHERE cr.chromosome = @chromosome))`
    });

    console.log(`[${duration()} s] Finished loading, storing variants...`);

    await connection.execute(`
        INSERT INTO ${variantTable} (
            gender,
            chromosome,
            position,
            snp,
            allele_reference,
            allele_effect,
            p_value,
            p_value_nlog,
            p_value_r,
            odds_ratio,
            odds_ratio_r,
            n,
            q,
            i,
            show_qq_plot
        ) SELECT
            "${gender}",
            chromosome,
            position,
            snp,
            allele_reference,
            allele_effect,
            p_value,
            p_value_nlog,
            p_value_r,
            odds_ratio,
            odds_ratio_r,
            n,
            q,
            i,
            0
        FROM stage
        WHERE p_value BETWEEN 0 AND 1 AND chromosome IS NOT NULL
        ORDER BY chromosome ASC, p_value_nlog DESC;
    `);

    const [totalCountRows] = await connection.query(`SELECT ROW_COUNT()`);
    const totalCount = pluck(totalCountRows);

    // last_insert_id() retrieves the FIRST successfully generated autoincremented id
    const [firstIdRows] = await connection.query(`SELECT LAST_INSERT_ID()`)
    const firstId = pluck(firstIdRows);

    console.log(`[${duration()} s] Storing aggregated variants...`);
    await connection.execute(`
        INSERT INTO ${aggregateTable}
            (gender, position_abs, p_value_nlog)
        SELECT DISTINCT
            "${gender}",
            position_abs_aggregate as position_abs,
            p_value_nlog_aggregate as p_value_nlog
        FROM stage
        WHERE p_value BETWEEN 0 AND 1 AND chromosome IS NOT NULL;
    `);

    // enable indexes to speed up next steps
    console.log(`[${duration()} s] Indexing tables...`);
    await connection.query(`
        ALTER TABLE ${variantTable} ENABLE KEYS;
        ALTER TABLE ${aggregateTable} ENABLE KEYS;
    `);

    // updating variants table with Q-Q plot flag
    console.log(`[${duration()} s] Updating plot_qq values...`);
    const intervals = getIntervals(totalCount, 10000).map(i => i + firstId);
    await connection.query(`
        UPDATE ${variantTable}
        SET show_qq_plot = 1
        WHERE id IN (${intervals})
    `);

    // calculating lambdaGC (eg: lambdagc_male)
    // note: statement needed to be rewritten for mysql
    console.log(`[${duration()} s] Calculating lambdaGC value...`);
    const [medianRows] = await connection.query(`
        CREATE TEMPORARY TABLE variant_median (
            id INTEGER NOT NULL AUTO_INCREMENT PRIMARY KEY,
            p_value double
        )
            SELECT p_value
            FROM ${variantTable}
            WHERE gender = '${gender}'
            ORDER BY p_value;

        set @count = (SELECT count(*) FROM variant_median);
        set @midpoint = (SELECT CEIL(@count / 2));
        set @midpoint_offset = (SELECT @count % 2);

        SELECT AVG(p_value) FROM variant_median
            WHERE id IN (@midpoint, 1 + @midpoint - @midpoint_offset);
    `);
    const pMedian = pluck(medianRows.pop()); // get last result set
    const lambdaGC = getLambdaGC(pMedian);
    await connection.execute(`
        INSERT INTO phenotype_metadata (phenotype_id, gender, lambda_gc)
        VALUES (:phenotypeId, :gender, :lambdaGC)
        ON DUPLICATE KEY UPDATE
            lambda_gc = :lambdaGC
    `, {phenotypeId, gender, lambdaGC});

    // drop staging table
    connection.query(`DROP TEMPORARY TABLE stage`);

    // log imported variants
    connection.execute(`
        UPDATE phenotype SET
            import_count = :totalCount,
            import_date = NOW()
        WHERE
            id = :phenotypeId`,
        {phenotypeId, totalCount}
    );

    await connection.query(`COMMIT`);
    await connection.end();
    return 0;
}

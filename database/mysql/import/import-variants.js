const fs = require('fs');
const mysql = require('mysql2');
const args = require('minimist')(process.argv.slice(2));
const ranges = require('../../json/chromosome_ranges.json');
const { database } = require('../../../server/config.json');
const { timestamp, getLogStream } = require('./utils/logging');
const { getFileReader, parseLine, readFile, validateHeaders, mappedStream, tappedStream, lineStream } = require('./utils/file');
const { getRecords, pluck, getMedian, tableExists } = require('./utils/query');
const { getIntervals, getLambdaGC, group, ppoints } = require('./utils/math');
const { pipeline } = require('stream');

/**
lambdagc_ewing|1.036
lambdagc_rcc|1.029
lambdagc_mel|0.83
 */

args.file = 'D:\\Development\\Work\\nci-webtools-dceg-plco-atlas\\data\\mysql\\import\\raw\\ewings_sarcoma.csv';

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
    password: database.user,
    namedPlaceholders: true,
    multipleStatements: true,
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
    process.exit(0)
});

async function importVariants() {
    // find phenotypes either by name or id (if a numeric value was provided)
    const phenotypeKey = /^\d+$/.test(phenotype) ? 'id' : 'name';
    const phenotypes = await getRecords(connection, 'lu_phenotype', {
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

    // clear variants if needed
    if (shouldReset) {
        console.log(`[${duration()} s] Clearing [${variantTable}, ${aggregateTable}])...`);
        await connection.query(`
            DROP TABLE ${variantTable};
            DROP TABLE ${aggregateTable};
        `);
    }

    await connection.query(`
        START TRANSACTION;
        SET autocommit = 0;

        -- drop indexes on variant table
        CALL drop_index_if_exists('${variantTable}', 'idx_${variantTable}__gender');
        CALL drop_index_if_exists('${variantTable}', 'idx_${variantTable}__chromosome');
        CALL drop_index_if_exists('${variantTable}', 'idx_${variantTable}__position');
        CALL drop_index_if_exists('${variantTable}', 'idx_${variantTable}__p_value_nlog');
        CALL drop_index_if_exists('${variantTable}', 'idx_${variantTable}__snp');
        CALL drop_index_if_exists('${variantTable}', 'idx_${variantTable}__show_qq_plot');

        -- drop indexes on aggregate table
        CALL drop_index_if_exists('${aggregateTable}', 'idx_${aggregateTable}__gender');
        CALL drop_index_if_exists('${aggregateTable}', 'idx_${aggregateTable}__position_abs');
        CALL drop_index_if_exists('${aggregateTable}', 'idx_${aggregateTable}__p_value_nlog');

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
        ) ENGINE = MYISAM;
    ` + readFile('../../schema/tables/variants.sql').replace(/\$PHENOTYPE/g, phenotypePrefix));

    console.log(`[${duration()} s] Importing genes to staging table...`);
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

    console.log(`[${duration()} s] Finished importing, storing variants...`);

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
    console.log(`[${duration()} s] Indexing database...`);
    const indexSql = readFile('../../schema/indexes/variants.sql').replace(/\$PHENOTYPE/g, phenotypePrefix);
    await connection.query(indexSql);

    // updating variants table with Q-Q plot flag
    console.log(`[${duration()} s] Updating plot_qq values...`);
    const intervals = getIntervals(totalCount, 10000).map(i => i + firstId);
    await connection.query(`
        UPDATE ${variantTable}
        SET show_qq_plot = 1
        WHERE id IN (${intervals})
    `);

    // calculating lambdaGC (eg: lambdagc_male)
    console.log(`[${duration()} s] Calculating lambdaGC value...`);
    const [medianRows] = await connection.execute(`
        SELECT x.p_value FROM ${variantTable} x, ${variantTable} y
        GROUP BY x.p_value
        HAVING SUM(SIGN(1-SIGN(y.p_value - x.p_value)))/COUNT(*) > .5
        LIMIT 1
    `);
    const pMedian = pluck(medianRows);
    const lambdaGC = getLambdaGC(pMedian);
    await connection.execute(`
        INSERT INTO phenotype_metadata (phenotype_id, gender, lambda_gc)
        VALUES (:phenotypeId, :gender, :lambdaGC)
        ON DUPLICATE KEY UPDATE
            lambda_gc = :lambdaGC
    `, {phenotypeId, gender, lambdaGC});

    // drop staging table
    connection.query(`TRUNCATE TABLE stage`);

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
    return;
}

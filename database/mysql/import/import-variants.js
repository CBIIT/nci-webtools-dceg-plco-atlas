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
            --reset (if specified, drop the variant/summary tables before importing)
            --index (if specified, build indexes on variant/summary tables after importing)`);
    process.exit(0);
}

// parse arguments and set defaults
const { file: inputFilePath, phenotype, gender, reset: shouldReset, index: shouldIndex } = args;
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
    const variantTable = `${phenotypeName}_variant`;
    const aggregateTable = `${phenotypeName}_aggregate`;
    const stageTable = `${phenotypeName}_stage`;

    const schemaSql = readFile('../../schema/tables/variant.sql').replace(/\$PHENOTYPE/g, phenotypeName);
    const indexSql = readFile('../../schema/indexes/variant.sql').replace(/\$PHENOTYPE/g, phenotypeName);

    // clear variants if needed
    if (shouldReset) {
        console.log(`[${duration()} s] Clearing ${variantTable}, ${aggregateTable}...`);

        // drop existing tables
        await connection.query(`
            DROP TABLE IF EXISTS ${variantTable};
            DROP TABLE IF EXISTS ${aggregateTable};
        `);

        // recreate tables
        await connection.query(schemaSql);
    }

    console.log(`[${duration()} s] Setting up temporary table...`);
    await connection.query(`
        FLUSH TABLES;
        START TRANSACTION;
        SET autocommit = 0;

        -- create staging table (do not use a temporary table for this)
        -- use MyISAM for performance, and for in-place sorting
        DROP TABLE IF EXISTS ${stageTable};
        CREATE TABLE ${stageTable} (
            id                      BIGINT,
            chromosome              VARCHAR(2),
            position                BIGINT,
            position_abs_aggregate  BIGINT,
            snp                     VARCHAR(200),
            allele_reference        VARCHAR(200),
            allele_alternate        VARCHAR(200),
            p_value                 DOUBLE,
            p_value_nlog            DOUBLE, -- negative log10(P)
            p_value_nlog_aggregate  DOUBLE, -- -log10(p) grouped by 1e-2
            p_value_nlog_expected   DOUBLE, -- expected negative log10(P)
            p_value_r               DOUBLE,
            odds_ratio              DOUBLE,
            odds_ratio_r            DOUBLE,
            n                       BIGINT,
            q                       DOUBLE,
            i                       DOUBLE,
            show_qq_plot            BOOLEAN
        ) ENGINE=MYISAM;
    `);

    console.log(`[${duration()} s] Loading variants into staging table...`);
    await connection.query({
        infileStreamFactory: path => fs.createReadStream(inputFilePath),
        sql: `LOAD DATA LOCAL INFILE "${inputFilePath}"
            INTO TABLE ${stageTable}
            FIELDS TERMINATED BY ','
            IGNORE 1 LINES
            (chromosome, position, snp, allele_reference, allele_alternate, p_value, p_value_r, odds_ratio, odds_ratio_r, n, q, i)`
    });

    // index this table to assist in sorting and filtering
    console.log(`[${duration()} s] Finished loading, indexing ${stageTable}...`);
    await connection.query(`
        ALTER TABLE ${stageTable}
            ADD INDEX (p_value),
            ADD INDEX (chromosome);
    `);

    // we need to sort the staging table by p-values in ascending order
    // and associate each row with an index after filtering
    console.log(`[${duration()} s] Finished indexing, filtering and ordering ${stageTable}...`);
    await connection.query(`
        DELETE FROM ${stageTable} WHERE p_value NOT BETWEEN 0 AND 1 OR chromosome NOT IN (SELECT chromosome FROM chromosome_range);
        ALTER TABLE ${stageTable} ORDER BY p_value;

        SET @id = 0;
        UPDATE ${stageTable} SET id = (SELECT @id := @id + 1);
        ALTER TABLE ${stageTable} ADD INDEX (id);
    `);

    // here, we add additional data to the staging table and calculate the median p-value
    console.log(`[${duration()} s] Calculating expected p-values, median p-value, and show_qq_plot flags...`);
    const [medianRows] = await connection.query(`
        SET @count = (SELECT COUNT(*) FROM ${stageTable});
        set @midpoint = (SELECT CEIL(@count / 2));
        set @midpoint_offset = (SELECT @count % 2);

        -- update p_value_nlog and aggregate columns
        UPDATE ${stageTable} s SET
            p_value_nlog = -LOG10(s.p_value),
            p_value_nlog_expected = -LOG10((s.id - 0.5) / @count),
            p_value_nlog_aggregate = 1e-2 * FLOOR(1e2 * -LOG10(s.p_value)),
            position_abs_aggregate = 1e6 * FLOOR(1e-6 * (SELECT s.position + cr.position_abs_min FROM chromosome_range cr WHERE cr.chromosome = s.chromosome LIMIT 1));

        -- calculate the show_qq_plot flag using -x^2, using id as the index parameter
        WITH ids as (
            SELECT @count - ROUND(@count * (1 - POW(id / 10000 - 1, 2)))
            FROM ${stageTable} WHERE id <= 10000
        ) UPDATE ${stageTable} SET
            show_qq_plot = 1
            WHERE id IN (SELECT * FROM ids);

        -- calculate median p-value
        SELECT AVG(p_value) FROM ${stageTable}
            WHERE id IN (@midpoint, 1 + @midpoint - @midpoint_offset);
    `);
    const pMedian = pluck(medianRows.pop()); // get last result set
    const lambdaGC = getLambdaGC(pMedian);
    console.log({pMedian, lambdaGC});

    console.log(`[${duration()} s] Inserting values into variant table...`);
    await connection.execute(`
        INSERT INTO ${variantTable} (
            gender,
            chromosome,
            position,
            snp,
            allele_reference,
            allele_alternate,
            p_value,
            p_value_nlog,
            p_value_nlog_expected,
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
            allele_alternate,
            p_value,
            p_value_nlog,
            p_value_nlog_expected,
            p_value_r,
            odds_ratio,
            odds_ratio_r,
            n,
            q,
            i,
            show_qq_plot
        FROM ${stageTable}
        ORDER BY chromosome, p_value;
    `);

    console.log(`[${duration()} s] Storing aggregated variants...`);
    await connection.execute(`
        INSERT INTO ${aggregateTable}
            (gender, position_abs, p_value_nlog)
        SELECT DISTINCT
            "${gender}",
            position_abs_aggregate as position_abs,
            p_value_nlog_aggregate as p_value_nlog
        FROM ${stageTable}
        ORDER BY position_abs, p_value_nlog
    `);

    if (shouldIndex) {
        console.log(`[${duration()} s] Indexing ${variantTable}, ${aggregateTable}...`);
        await connection.query(indexSql);
    }

    console.log(`[${duration()} s] Storing lambdaGC and counts...`);
    await connection.execute(`
        INSERT INTO phenotype_metadata (phenotype_id, gender, chromosome, lambda_gc, count)
        VALUES (:phenotypeId, :gender, :chromosome, :lambdaGC, (SELECT COUNT(*) AS count FROM ${variantTable}))
        ON DUPLICATE KEY UPDATE
            lambda_gc = VALUES(lambda_gc),
            count = VALUES(count);
    `, {phenotypeId, gender, chromosome: 'all', lambdaGC});

    await connection.query(`
        INSERT INTO phenotype_metadata (phenotype_id, gender, chromosome, count)
        SELECT
            ${phenotypeId} as phenotype_id,
            "${gender}" as gender,
            chromosome,
            count(*) as count
        FROM ${stageTable}
        GROUP BY chromosome
        ON DUPLICATE KEY UPDATE
            count = VALUES(count);
    `);

    // log imported variants
    console.log(`[${duration()} s] Storing import log...`);
    connection.execute(`
        UPDATE phenotype SET
            import_count = (
                SELECT count from phenotype_metadata
                WHERE
                    phenotype_id = :phenotypeId AND
                    gender = :gender AND
                    chromosome = :chromosome
            ),
            import_date = NOW()
        WHERE
            id = :phenotypeId`,
        {phenotypeId, gender, chromosome: 'all'}
    );

    await connection.query(`COMMIT`);
    await connection.end();
    return 0;
}

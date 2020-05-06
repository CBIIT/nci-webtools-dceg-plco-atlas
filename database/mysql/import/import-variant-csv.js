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
if (!(args.file && args.phenotype && args.sex)) {
    console.log(`USAGE: node import-variant-csv.js
            --file "filename"
            --phenotype "phenotype name or id"
            --sex "all" | "female" | "male"
            --reset (if specified, drop the variant/summary partitions before importing)
            --create (if specified, create a new partition)`);
    process.exit(0);
}

// parse arguments and set defaults
const { file: inputFilePath, phenotype, sex, reset: shouldReset, create: shouldCreatePartition } = args;
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

// sex should be male, female, or all
if (!/^(all|female|male)$/.test(sex)) {
    console.error(`ERROR: Sex must be all, female, or male`);
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
    const partition = `\`${phenotypeId}\``; // quote partition identifier
    const subpartition = `\`${phenotypeId}_${sex}\``; // quote subpartition identifier
    const variantTable = `phenotype_variant`;
    const aggregateTable = `phenotype_aggregate`;
    const stageTable = `phenotype_stage_${phenotypeId}_${sex}`;

    // clear variants if needed
    if (shouldReset) {

        // drop existing tables and recreate partitions
        // both variant and aggregate tables have the same partitioning schema
        for (let table of [variantTable, aggregateTable]) {
            console.log(`[${duration()} s] Dropping and recreating partition(${partition}) on ${table}...`);
            await connection.query(`
                ALTER TABLE ${table} DROP PARTITION ${partition};
                ALTER TABLE ${table} ADD PARTITION (PARTITION ${partition} VALUES IN (${phenotypeId}) (
                    subpartition \`${phenotypeId}_all\`,
                    subpartition \`${phenotypeId}_female\`,
                    subpartition \`${phenotypeId}_male\`
                ));
            `);
        }
    }

    if (shouldCreatePartition) {
        for (let table of [variantTable, aggregateTable]) {
            console.log(`[${duration()} s] Creating partition(${partition}) on ${table}...`);
            await connection.query(`
                ALTER TABLE ${table} ADD PARTITION (PARTITION ${partition} VALUES IN (${phenotypeId}) (
                    subpartition \`${phenotypeId}_all\`,
                    subpartition \`${phenotypeId}_female\`,
                    subpartition \`${phenotypeId}_male\`
                ));
            `);
        }
    }

    console.log(`[${duration()} s] Loading variants into table...`);
    await connection.query({
        infileStreamFactory: path => fs.createReadStream(inputVariantFilePath),
        sql: `LOAD DATA LOCAL INFILE "${inputVariantFilePath}"
            INTO TABLE ${variantTable} partition (${partition})
            FIELDS TERMINATED BY ','
            IGNORE 1 LINES`
    });

    console.log(`[${duration()} s] Loading aggregate variants into table...`);
    await connection.query({
        infileStreamFactory: path => fs.createReadStream(inputAggregateFilePath),
        sql: `LOAD DATA LOCAL INFILE "${inputAggregateFilePath}"
            INTO TABLE ${variantTable} partition (${partition})
            FIELDS TERMINATED BY ','
            IGNORE 1 LINES`
    });

    console.log(`[${duration()} s] Loading metadata into table...`);
    await connection.query({
        infileStreamFactory: path => fs.createReadStream(inputAggregateFilePath),
        sql: `LOAD DATA LOCAL INFILE REPLACE "${inputMetadataFilePath}"
            INTO TEMPORARY TABLE metadata_stage
            FIELDS TERMINATED BY ','
            IGNORE 1 LINES`
    });

    // upsert metadata
    await connection.query(`
        INSERT INTO phenotype_metadata (phenotype_id, sex, chromosome, lambda_gc, count)
        SELECT phenotype_id, sex, chromosome, lambda_gc, count FROM metadata_stage
        ON DUPLICATE KEY UPDATE
            lambda_gc = VALUES(lambda_gc),
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
                    sex = :sex AND
                    chromosome = :chromosome
            ),
            import_date = NOW()
        WHERE
            id = :phenotypeId`,
        {phenotypeId, sex, chromosome: 'all'}
    );

    await connection.query(`COMMIT`);
    await connection.end();
    return 0;
}

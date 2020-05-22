const fs = require('fs');
const path = require('path');
const mysql = require('mysql2');
const args = require('minimist')(process.argv.slice(2));
const { getRecords } = require('./utils/query');
const { database } = require('../../server/config.json');
const { timestamp } = require('./utils/logging');

// display help if needed
if (!args.file) {
    console.log(`USAGE: node parallel-import-variant.js
            --file "path to file prefix. eg: phenotype_id.sex"
            --reset (if specified, drop the variant/summary partitions before importing)`);
    process.exit(0);
}

// parse arguments and set defaults
const {file, reset} = args;
const filepath = path.resolve(file);
const [phenotypeId, sex] = path.basename(filepath).split('.');
const exportVariantFilePath = filepath + '.variant.csv';
const exportAggregateFilePath = filepath + '.aggregate.csv';
const exportMetadataFilePath = filepath + '.metadata.csv';

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
if (!fs.existsSync(exportVariantFilePath)) {
    console.error(`ERROR: ${exportVariantFilePath} does not exist.`);
    process.exit(1);
}

// sex should be male, female, or all
if (!/^(all|female|male)$/.test(sex)) {
    console.error(`ERROR: Sex must be all, female, or male`);
    process.exit(1);
}

(async function main() {
    try {
        const {id} = await validatePhenotype(connection, phenotypeId);

        await importVariants({
            connection,
            exportVariantFilePath, 
            exportAggregateFilePath, 
            exportMetadataFilePath,
            phenotypeId: id,
            sex,
            reset,    
        });
    
        console.log(`[${duration()} s] Imported variants`);
        process.exit(0);
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
})();

// validates a phenotype by name or id
async function validatePhenotype(connection, phenotype) {
    const phenotypeKey = /^\d+$/.test(phenotype) ? 'id' : 'name';
    const phenotypes = await getRecords(connection, 'phenotype', {
        [phenotypeKey]: phenotype
    });

    if (phenotypes.length === 0) {
        throw(`Phenotype does not exist`);
    }

    if (phenotypes.length > 1) {
        throw(`More than one phenotype was found with the same name. Please specify the phenotype id instead of the name.`)
    }

    return phenotypes[0];
}

async function importVariants({
    connection,
    exportVariantFilePath, 
    exportAggregateFilePath, 
    exportMetadataFilePath,
    phenotypeId,
    sex,
    reset,
}) {

    const partition = `\`${phenotypeId}\``; // quote partition identifier
    const subpartition = `\`${phenotypeId}_${sex}\``; // quote subpartition identifier
    const variantTable = `phenotype_variant`;
    const aggregateTable = `phenotype_aggregate`;

    // determine if we need to reset/create partitions
    const [partitionRows] = await connection.execute(
        `SELECT * FROM INFORMATION_SCHEMA.PARTITIONS
        WHERE TABLE_NAME IN ('phenotype_variant', 'phenotype_aggregate')
        AND PARTITION_NAME = :phenotypeId`,
        {phenotypeId}
    );

    // There should be 6 subpartitions (3 per table)
    if (reset || partitionRows.length !== 6) {
        // clear variants if needed
        for (let table of [variantTable, aggregateTable]) {
            if (partitionRows.find(p => p.PARTITION_NAME == phenotypeId)) {
                console.log(`[${duration()} s] Dropping partition(${partition}) on ${table}...`);
                // await connection.query(`ALTER TABLE ${table} DROP PARTITION ${partition};`)
                await connection.query(`ALTER TABLE ${table} DROP SUBPARTITION ${subpartition};`);
            }
        }

        for (let table of [variantTable, aggregateTable]) {
            console.log(`[${duration()} s] Creating partition(${partition}) on ${table}...`);
            // await connection.query(`
            //     ALTER TABLE ${table} ADD PARTITION (PARTITION ${partition} VALUES IN (${phenotypeId}) (
            //         subpartition \`${phenotypeId}_all\`,
            //         subpartition \`${phenotypeId}_female\`,
            //         subpartition \`${phenotypeId}_male\`
            //     ));
            // `);
            await connection.query(`
                ALTER TABLE ${table} ADD PARTITION (PARTITION ${partition} VALUES IN (${phenotypeId}) (
                    subpartition \`${subpartition}\`
                ));
            `);
        }
    }

    await connection.query(`
        START TRANSACTION;
        -- SET UNIQUE_CHECKS = 0;
        SET AUTOCOMMIT = 0;
    `);

    console.log(`[${duration()} s] Loading variants into table...`);
    await connection.query({
        infileStreamFactory: path => fs.createReadStream(exportVariantFilePath),
        sql: `LOAD DATA LOCAL INFILE "${exportVariantFilePath}"
            INTO TABLE ${variantTable} partition (${subpartition})
            FIELDS TERMINATED BY ','
            IGNORE 1 LINES
            (
                id,
                phenotype_id,
                sex,
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
            )`
    });

    console.log(`[${duration()} s] Loading aggregate variants into table...`);
    await connection.query({
        infileStreamFactory: path => fs.createReadStream(exportAggregateFilePath),
        sql: `LOAD DATA LOCAL INFILE "${exportAggregateFilePath}"
            INTO TABLE ${aggregateTable} partition (${subpartition})
            FIELDS TERMINATED BY ','
            IGNORE 1 LINES
            (
                id,
                phenotype_id,
                sex,
                chromosome,
                position_abs,
                p_value_nlog
            )`
    });

    console.log(`[${duration()} s] Loading metadata into table...`);
    await connection.query(`CREATE TEMPORARY TABLE metadata_stage LIKE phenotype_metadata`);
    await connection.query({
        infileStreamFactory: path => fs.createReadStream(exportMetadataFilePath),
        sql: `LOAD DATA LOCAL INFILE "${exportMetadataFilePath}"
            INTO TABLE metadata_stage
            FIELDS TERMINATED BY ','
            IGNORE 1 LINES
            (
                phenotype_id, 
                sex, 
                chromosome, 
                lambda_gc, 
                count
            )`
    });

    // upsert metadata
    await connection.query(`
        INSERT INTO phenotype_metadata 
            (phenotype_id, sex, chromosome, lambda_gc, count)
        SELECT 
            phenotype_id, sex, chromosome, lambda_gc, count 
        FROM 
            metadata_stage
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

    console.log(`[${duration()} s] Done importing`);
    return 0;
}
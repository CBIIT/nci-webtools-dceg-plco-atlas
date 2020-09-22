const fs = require('fs');
const path = require('path');
const mysql = require('mysql2');
const args = require('minimist')(process.argv.slice(2));
const { getRecords } = require('./utils/query');
const { readFile } = require('./utils/file');
// const { database } = require('../../server/config.json');
const { timestamp } = require('./utils/logging');

// display help if needed
if (!args.file) {
    console.log(`USAGE: node parallel-import-variant.js
            --file "path to file prefix. eg: phenotype_id.sex"
            --host "MySQL hostname" 
            --port "MySQL port" 
            --db_name "MySQL database name" 
            --user "MySQL username" 
            --password "MySQL password" `);
    process.exit(0);
}

// parse arguments and set defaults
const {file, reset, host, port, db_name, user, password} = args;
const filepath = path.resolve(file);
const [phenotypeName, sex, ancestry] = path.basename(filepath).split('.');
const exportVariantFilePath = filepath + '.variant.csv';
const exportAggregateFilePath = filepath + '.aggregate.csv';
const exportMetadataFilePath = filepath + '.metadata.csv';

//const errorLog = getLogStream(`./failed-variants-${new Date().toISOString()}.txt`);
const errorLog = {write: e => console.log(e)};
const duration = timestamp();
const connection = mysql.createConnection({
    host: host,
    port: port,
    database: db_name,
    user: user,
    password: password,
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
        const phenotype = await validatePhenotype(connection, phenotypeName);

        await importVariants({
            connection,
            exportVariantFilePath, 
            exportAggregateFilePath, 
            exportMetadataFilePath,
            phenotype,
            sex,
            ancestry,
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
    phenotype,
    sex,
    ancestry,
    reset,
}) {

    const partition = `\`${phenotype.id}\``; // quote partition identifier
    const variantTableSuffix = `${phenotype.name}__${sex}__${ancestry}`;
    const variantTable = `phenotype_variant__${variantTableSuffix}`;
    const aggregateTable = `phenotype_aggregate`;

    await connection.query(`
        START TRANSACTION;
        -- SET UNIQUE_CHECKS = 0;
        SET AUTOCOMMIT = 0;
    `);

    if (reset) {

        // create partitions for each phenotype (if they do not exist)
        const [partitionRows] = await connection.execute(
            `SELECT * FROM INFORMATION_SCHEMA.PARTITIONS
            WHERE TABLE_NAME = :aggregateTable
            AND PARTITION_NAME = :phenotypeId`,
            {aggregateTable, phenotypeId: phenotype.id}
        );

        // drop partitions
        if (partitionRows.length) {
            await connection.query(`ALTER TABLE ${aggregateTable} DROP PARTITION ${partition}`);
        }

        await connection.query(`ALTER TABLE ${aggregateTable} ADD PARTITION (PARTITION ${partition} VALUES IN (${phenotype.id}));`);
    }

    // create variant table
    await connection.query(
        readFile('../../schema/tables/variant.sql')
            .replace(/\${table_name}/g, `${variantTable}`)
            .replace(/\${table_name_suffix}/g, `${variantTableSuffix}`)
    );
            
    console.log(`[${duration()} s] Loading variants into table...`);
    await connection.query({
        infileStreamFactory: path => fs.createReadStream(exportVariantFilePath),
        sql: `LOAD DATA LOCAL INFILE "${exportVariantFilePath}"
            INTO TABLE ${variantTable}
            FIELDS TERMINATED BY ','
            IGNORE 1 LINES
            (
                id, 
                chromosome,
                position,
                snp,
                allele_reference,
                allele_alternate,
                allele_reference_frequency,
                p_value,
                p_value_nlog,
                p_value_nlog_expected,
                p_value_heterogenous,
                beta,
                standard_error,
                odds_ratio,
                ci_95_low,
                ci_95_high,
                n,
                show_qq_plot
            )`
    });

    console.log(`[${duration()} s] Indexing variants table (${variantTable})...`);
    // index variant table
    await connection.query(
        readFile('../../schema/indexes/variant.sql').replace(/\${table_name}/g, `${variantTable}`)
    );

    console.log(`[${duration()} s] Loading aggregate variants into table...`);
    await connection.query({
        infileStreamFactory: path => fs.createReadStream(exportAggregateFilePath),
        sql: `LOAD DATA LOCAL INFILE "${exportAggregateFilePath}"
            INTO TABLE ${aggregateTable} partition (${partition})
            FIELDS TERMINATED BY ','
            IGNORE 1 LINES
            (
                phenotype_id,
                sex,
                ancestry, 
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
                ancestry, 
                chromosome, 
                lambda_gc, 
                count
            )`
    });

    // upsert metadata
    await connection.query(`
        INSERT INTO phenotype_metadata 
            (phenotype_id, sex, ancestry, chromosome, lambda_gc, count)
        SELECT 
            phenotype_id, sex, ancestry, chromosome, lambda_gc, count 
        FROM 
            metadata_stage
        ON DUPLICATE KEY UPDATE
            lambda_gc = VALUES(lambda_gc),
            count = VALUES(count);
    `);

    await connection.query(`COMMIT`);

    // log imported variants
    console.log(`[${duration()} s] Storing import log...`);
    connection.execute(`
        UPDATE phenotype SET
            import_count = (
                SELECT count from phenotype_metadata
                WHERE
                    phenotype_id = :phenotypeId AND
                    sex = :sex AND
                    ancestry = :ancestry AND
                    chromosome = :chromosome
            ),
            import_date = NOW()
        WHERE
            id = :phenotypeId`,
        {phenotypeId: phenotype.id, sex, ancestry, chromosome: 'all'}
    );

    await connection.query(`COMMIT`);
    
    await connection.end();

    console.log(`[${duration()} s] Done importing`);
    return 0;
}
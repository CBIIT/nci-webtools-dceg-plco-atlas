const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const mysql = require('mysql2');

const parseCsv = require('csv-parse/lib/sync')
const { getLogger } = require('./utils/logging');
const { getLambdaGC } = require('./utils/math');
const { pluck, getPlaceholders, exportInnoDBTable } = require('./utils/query');
const { readFile, readFirstLineAsync, gunzip } = require('./utils/file');


// display help if needed
const args = require('minimist')(process.argv.slice(2));
let {host, port, db_name: databaseName, user, password, file, phenotype_file: phenotypeFile, phenotype, validate, output, logdir, tmp } = args;

if (!file || !output || !logdir) {
    console.log(`USAGE: node parallel-export-combined-variant-mysql.js 
        --host "MySQL hostname [OPTIONAL, localhost by default]" 
        --port "MySQL port [OPTIONAL, 3306 by default]" 
        --db_name "MySQL database name [OPTIONAL, plcogwas by default]" 
        --user "MySQL username" 
        --password "MySQL password"
        --file "phenotype_name.variants.csv" [REQUIRED]
        --phenotype_file "raw/phenotype.csv" [OPTIONAL, use raw/phenotype.csv by default]
        --phenotype "test_melanoma" or 10002 [OPTIONAL, use filename by default]
        --output "../raw/output" [REQUIRED]
        --logdir "./" [REQUIRED]
        --tmp "/lscratch/\$SLURM_JOB_ID" [OPTIONAL, use output filepath by default]
    `);
    process.exit(0);
}

host = host || 'localhost';
port = port || 3306;
databaseName = databaseName || 'plcogwas';
const connection = mysql.createConnection({
    host: host,
    port: port,
    database: databaseName,
    user: user,
    password: password,
    namedPlaceholders: true,
    multipleStatements: true,
    // debug: true,
}).promise();

// initialize folders
let inputFilePath = path.resolve(file);
let inputFileName = path.basename(inputFilePath);
const outputFolder = path.resolve(output);
const logFolder = path.resolve(logdir);
const tempFolder = tmp ? path.resolve(tmp) : outputFolder;
const phenotypeFilePath = path.resolve(phenotypeFile || '../raw/phenotype.csv');

// set phenotype from filename
if (!phenotype) phenotype = inputFileName.split('.')[0];

// create global logger for initial log messages
const logFilePath = path.resolve(logFolder, `${phenotype}.log`);
const logger = getLogger(logFilePath, 'export');

// input file should exist
if (!fs.existsSync(inputFilePath)) {
    console.error(`ERROR: ${inputFilePath} does not exist.`);
    process.exit(1);
}

// phenotype file should exist
if (!fs.existsSync(phenotypeFilePath)) {
    console.error(`ERROR: ${inputFilePath} does not exist.`);
    process.exit(1);
}

for (let folder of [outputFolder, logFolder, tempFolder]) {
    if (!fs.existsSync(folder))
        fs.mkdirSync(folder);
}

(async function main() {
    
    try {
        if (/\.gz$/i.test(inputFilePath)) {
            logger.info(`Unzipping ${inputFilePath} to ${tempFolder}...`)
            inputFilePath = await unzipFile(inputFilePath, tempFolder);
            inputFileName = path.basename(inputFilePath);
        }

        await exportVariants({
            inputFilePath,
            logFolder,
            tempFolder,
            outputFolder,
            phenotype: getPhenotype(
                phenotypeFilePath, 
                phenotype
            )
        });

        logger.info('Finished export');
        process.exit(0);
    }
    catch (e) {
        logger.error(e);
        process.exit(1);
    }
})();

async function unzipFile(inputFilePath, targetFolder) {
    const inputFileName = path.basename(inputFilePath);
    const unzippedFileName = inputFileName.replace(/\.gz$/i, '');
    const unzippedFilePath = path.resolve(targetFolder, unzippedFileName);

    // synchronously check if unzipped file exists and delete it 
    // (do not use async, as it introduces a race condition between checking for existence and deletion)
    if (fs.existsSync(unzippedFilePath)) {
        logger.warn(`File already exists. ${unzippedFilePath} will be deleted.`);
        fs.unlinkSync(unzippedFilePath);
    }

    // stream gunzip to target folder (does not require copying input file)
    await gunzip(inputFilePath, unzippedFilePath);
    return unzippedFilePath;
}

// validates a phenotype by name or id and returns both if found
function getPhenotype(phenotypeFilePath, phenotype) {
    // if a numeric phenotype was provided, assume we're looking up by id
    // otherwise, look up phenotype by association name
    const phenotypeKey = /^\d+$/.test(phenotype) ? 'id' : 'name';

    // read the phenotypes file and attempt to find the specified phenotype
    const phenotypes = parseCsv(    
        fs.readFileSync(phenotypeFilePath),
        {columns: ['id', 'parent_id', 'display_name', 'name', 'description', 'type', 'age']}
    ).filter(p => p[phenotypeKey] == phenotype.toLowerCase());
    
    if (phenotypes.length === 0) {
        throw(`Phenotype does not exist`);
    }

    if (phenotypes.length > 1) {
        throw(`More than one phenotype was found with the same name. Please specify the phenotype id instead of the name.`)
    }

    return phenotypes[0];
}

function getSql(filepath, args) {
    let sql = readFile(path.resolve(__dirname, filepath));
    for (let key in args)
        // regex for simulating es6-interpolated strings
        sql = sql.replace(new RegExp(`\\\${${key}}`, 'g'), args[key]);
    return sql;
}

async function exportVariants({
    inputFilePath,
    logFolder,
    tempFolder,
    outputFolder,
    phenotype,
}) {
    try {
        // determine ancestry/sex for stratified columns
        const firstLine = await readFirstLineAsync(inputFilePath);
        const stratifiedColumns = firstLine.split(/\s+/g)
            .filter(originalColumName => !['chr', 'pos', 'snp', 'tested_allele', 'other_allele'].includes(originalColumName.toLowerCase()))
            .map(originalColumName => {
                // original column names may or may not contain ancestry and/or sex, parsing rules are brittle and may require changes
                let [columnName, ...ancestrySex] = originalColumName.split('_');
                let sex = ancestrySex[ancestrySex.length - 1];
                let ancestry = ancestrySex.slice(0, ancestrySex.length - 1).join('_');
                if (!/^(all|female|male)$/.test(sex)) {
                    sex = null
                    ancestry = ancestrySex.join('_');
                }
                if (sex) sex = sex.toLowerCase()
                if (ancestry) ancestry = ancestry.toLowerCase();
                const mappedColumnName = [
                    sex, 
                    ancestry, 
                    {
                        freq: `allele_effect_frequency`, 
                        beta: `beta`,
                        se: `standard_error`,
                        p: `p_value`,
                        n: `n`,
                        phet: `p_value_heterogenous`,
                    }[columnName.toLowerCase()]
                ].filter(Boolean).join('_')
                return {originalColumName, columnName, mappedColumnName, ancestry, sex}
            });

        // set up database for import
        logger.info('Setting up database');
        await connection.query([
            `DROP TABLE IF EXISTS 
                participant_data_category,
                participant_data,
                participant,
                phenotype_correlation,
                phenotype_metadata,
                phenotype,
                variant_aggregate, 
                variant_metadata, 
                chromosome_range, 
                lookup_sex, 
                lookup_ancestry;`,
            readFile(path.resolve(__dirname, '../schema/tables/main.sql')),
            readFile(path.resolve(__dirname, 'import-chromosome-range.sql')),
            readFile(path.resolve(__dirname, 'import-lookup-tables.sql')),
            `DROP TABLE IF EXISTS prestage;
            CREATE TABLE prestage (
                chromosome                  VARCHAR(2),
                position                    BIGINT,
                snp                         VARCHAR(200),
                allele_effect               VARCHAR(200),
                allele_non_effect           VARCHAR(200),
                ${stratifiedColumns.map(c => `${c.mappedColumnName} DOUBLE`).join(',')}
            );`
        ].join('\n'));

        logger.info('Loading data into prestage table');
        await connection.query({
            infileStreamFactory: path => fs.createReadStream(inputFilePath),
            sql: `LOAD DATA LOCAL INFILE "${inputFilePath}"
                INTO TABLE prestage
                FIELDS TERMINATED BY '\t'
                IGNORE 1 LINES`
        });

        // determine distinct ancestries and sexes
        const distinct = arr => arr.reduce((acc, curr) => 
            !acc.includes(curr) ? acc.concat([curr]) : acc, []);
        const ancestries = distinct(stratifiedColumns.map(c => c.ancestry)).filter(Boolean);
        const sexes = distinct(stratifiedColumns.map(c => c.sex)).filter(Boolean);

        // iterate through each ancestry/sex
        for (let sex of sexes) {
            for (let ancestry of ancestries) {
                // get columns specific to each ancestry/sex combo
                const additionalColumns = stratifiedColumns.filter(c => c.ancestry === ancestry && (c.sex === sex || c.sex === null));

                // do not continue if we are missing columns
                if (additionalColumns.length < 2) continue;

                // create logger for specific ancestry/sex export
                const importLogFilePath = path.resolve(logFolder, `${phenotype.name}.${sex}.${ancestry}.log`);
                const logger = getLogger(importLogFilePath, `${sex}.${ancestry}`);

                try {
                    // specify table names
                    const tableSuffix = `${phenotype.name}__${sex}__${ancestry}`;
                    const stageTable = `stage__${tableSuffix}`;
                    const variantTable = `phenotype_variant__${tableSuffix}`;
                    const aggregateTable = `phenotype_aggregate__${tableSuffix}`;
                    const pointTable = `phenotype_point__${tableSuffix}`;
                    const metadataTable = `phenotype_metadata__${tableSuffix}`;
                    const useOddsRatio = phenotype.type === 'binary';

                    // create stage, variant, aggregate, and metadata tables
                    logger.info('Creating tables');
                    await connection.query([
                        `DROP TABLE IF EXISTS ${stageTable}, ${variantTable}, ${aggregateTable}, ${pointTable}, ${metadataTable};`,
                        `CREATE TABLE ${stageTable} (
                            id                          BIGINT PRIMARY KEY NOT NULL AUTO_INCREMENT,
                            chromosome                  VARCHAR(2),
                            position                    BIGINT,
                            snp                         VARCHAR(200),
                            allele_effect               VARCHAR(200),
                            allele_non_effect           VARCHAR(200),
                            allele_effect_frequency     DOUBLE,
                            p_value                     DOUBLE,
                            p_value_heterogenous        BIGINT,
                            beta                        DOUBLE,
                            standard_error              DOUBLE,
                            odds_ratio                  DOUBLE,
                            n                           BIGINT
                        );`,
                        // create variant, aggregate, and metadata tables
                        getSql('../schema/tables/variant.sql', {table_name: variantTable}),
                        getSql('../schema/tables/aggregate.sql', {table_name: aggregateTable}),
                        getSql('../schema/tables/point.sql', {table_name: pointTable}),
                        `CREATE TABLE ${metadataTable} LIKE phenotype_metadata;`,
                    ].join('\n'));

                    logger.info('Filtering and ordering data into stage table');
                    await connection.query(`
                        INSERT INTO ${stageTable} (
                            chromosome,
                            position,
                            snp,
                            allele_effect,
                            allele_non_effect,
                            allele_effect_frequency,
                            p_value,
                            p_value_heterogenous,
                            beta,
                            standard_error,
                            odds_ratio,
                            n
                        ) 
                        SELECT 
                            p.chromosome,
                            p.position,
                            IF(p.snp like 'rs%', SUBSTRING_INDEX(p.snp, ':', 1), SUBSTRING_INDEX(p.snp, ':', 2)) as snp,
                            p.allele_effect,
                            p.allele_non_effect,
                            p.${ancestry}_allele_effect_frequency,
                            p.${sex}_${ancestry}_p_value,
                            p.${sex}_${ancestry}_p_value_heterogenous,
                            p.${sex}_${ancestry}_beta,
                            p.${sex}_${ancestry}_standard_error,
                            ${useOddsRatio ? `EXP(p.${sex}_${ancestry}_beta)` : `NULL`} as odds_ratio,
                            p.${sex}_${ancestry}_n
                        FROM prestage p
                        INNER JOIN chromosome_range cr ON cr.chromosome COLLATE utf8mb4_unicode_ci = p.chromosome
                        WHERE p.${sex}_${ancestry}_p_value > 1e-10000
                        AND p.position BETWEEN cr.position_min AND cr.position_max
                        ORDER BY ${sex}_${ancestry}_p_value;
                    `);

                    // determine count
                    const [countRows] = await connection.query(`SELECT COUNT(*) FROM ${stageTable}`);
                    const count = pluck(countRows);
                    logger.info(`Loaded ${count} rows into stage table`)

                    // determine lambdagc
                    logger.info('Calculating lambdaGC')
                    const medianRowIds = count % 2 === 0 
                        ? [Math.floor(count / 2), Math.ceil(count / 2)] 
                        : [Math.ceil(count / 2)];
                    const [medianRows] = await connection.execute(
                        `SELECT AVG(p_value) FROM ${stageTable} WHERE id IN (${getPlaceholders(medianRowIds)})`,
                        medianRowIds
                    );
                    const median = pluck(medianRows);
                    const lambdaGC = getLambdaGC(median);
                    logger.info(`LambdaGC: ${lambdaGC} FROM ${median}`)

                    // determine qq plot points
                    const numPoints = 10000;
                    logger.info(`Determining ids for ${numPoints} qq plot points`);
                    const getQQPoints = (numPoints, maxValue) => new Array(numPoints)
                        .fill(0).map((_, i) => i + 1)
                        .map(x => Math.floor((x * maxValue ** 0.5 / numPoints) ** 2))
                        .reduce((acc, curr) => !acc.includes(curr) ? acc.concat([curr]) : acc, []);
                    const qqRowIds = count ? getQQPoints(numPoints, count) : [];

                    // determine 10,000th smallest p value
                    const [pValueThresholdRows] = await connection.query(
                        `SELECT p_value FROM ${stageTable} ORDER BY p_value ASC LIMIT 10000,1`,
                    );
                    const pValueThreshold = pluck(pValueThresholdRows);

                    // determine max p-value and position 
                    const [maxPositionAbsRows] = await connection.query(`SELECT MAX(position_abs_max) FROM chromosome_range`);
                    const maxPositionAbs = pluck(maxPositionAbsRows);

                    const [maxPValueNlogRows] = await connection.query(`SELECT -LOG10(MIN(p_value)) FROM ${stageTable}`);
                    const maxPValueNlog = pluck(maxPValueNlogRows);
    
                    // get aggregation bin size (800x, 400y)
                    const positionFactor = maxPositionAbs / 800;
                    const pValueNlogFactor = maxPValueNlog / 400;
                    
                    // populate variants table
                    logger.info(`Generating variants table ${variantTable}`);
                    await connection.query(`
                        INSERT INTO ${variantTable} (
                            id,
                            chromosome,
                            position,
                            snp,
                            allele_effect,
                            allele_non_effect,
                            allele_effect_frequency,
                            p_value,
                            p_value_heterogenous,
                            beta,
                            standard_error,
                            odds_ratio,
                            n
                        )
                        SELECT 
                            id,
                            chromosome,
                            position,
                            snp,
                            allele_effect,
                            allele_non_effect,
                            allele_effect_frequency,
                            p_value,
                            p_value_heterogenous,
                            beta,
                            standard_error,
                            odds_ratio,
                            n
                        FROM ${stageTable}
                        ORDER BY chromosome, p_value
                    `);
                    logger.info(`Indexing variants table ${variantTable}`);
                    await connection.query(
                        readFile(path.resolve(__dirname, '../schema/indexes/variant.sql'))
                            .replace(/\${table_name}/g, `${variantTable}`)
                    );

                    logger.info(`Generating aggregate table ${aggregateTable}`);
                    await connection.query(`
                        INSERT INTO ${aggregateTable} (
                            phenotype_id,
                            sex,
                            ancestry,
                            chromosome,
                            position_abs,
                            p_value_nlog
                        )
                        SELECT DISTINCT
                            ${phenotype.id} as phenotype_id, 
                            '${sex}' as sex, 
                            '${ancestry}' as ancestry, 
                            s.chromosome, 
                            ${positionFactor} * FLOOR((s.position + cr.position_abs_min) / ${positionFactor})  as position_abs,
                            ${pValueNlogFactor} * FLOOR(-LOG10(s.p_value) / ${pValueNlogFactor}) as p_value_nlog
                        FROM ${stageTable} s
                        JOIN chromosome_range cr ON s.chromosome COLLATE utf8mb4_unicode_ci = cr.chromosome
                        ORDER BY p_value_nlog DESC
                    `);

                    logger.info(`Generating point table ${pointTable}`);
                    if (pValueThreshold && qqRowIds.length) {
                        await connection.query(`
                            INSERT INTO ${pointTable} (
                                id,
                                phenotype_id,
                                sex,
                                ancestry,
                                p_value_nlog,
                                p_value_nlog_expected
                            )
                            SELECT
                                id,
                                ${phenotype.id} as phenotype_id, 
                                '${sex}' as sex, 
                                '${ancestry}' as ancestry, 
                                -LOG10(p_value),
                                -LOG10((id - 0.5) / ${count}) as p_value_nlog_expected
                            FROM ${stageTable}
                            WHERE id IN (${getPlaceholders(qqRowIds)})
                            OR p_value < ?
                        `, [...qqRowIds, pValueThreshold]);
                    }

                    logger.info(`Generating metadata table ${metadataTable}`);
                    const insertMetadata = `INSERT INTO ${metadataTable} (
                        phenotype_id,
                        sex,
                        ancestry,
                        chromosome,
                        lambda_gc,
                        count
                    )`;

                    // insert variant counts
                    await connection.query(`
                        ${insertMetadata}
                        SELECT 
                            ${phenotype.id} as phenotype_id, 
                            '${sex}' as sex, 
                            '${ancestry}' as ancestry, 
                            'all' as chromosome, 
                            ${lambdaGC} as lambda_gc, 
                            ${count} as count
                    `);

                    // insert chromosome-specific variant counts
                    await connection.query(`
                        ${insertMetadata}
                        SELECT DISTINCT 
                            ${phenotype.id} as phenotype_id, 
                            '${sex}' as sex, 
                            '${ancestry}' as ancestry, 
                            s.chromosome as chromosome, 
                            null as lambda_gc, 
                            count(*) as count 
                        FROM ${stageTable} s 
                        GROUP BY s.chromosome 
                        ORDER BY s.chromosome
                    `);

                    // export tables to output folder
                    logger.info('Exporting tables');
                    await exportInnoDBTable(connection, databaseName, variantTable, outputFolder);
                    await exportInnoDBTable(connection, databaseName, aggregateTable, outputFolder);
                    await exportInnoDBTable(connection, databaseName, pointTable, outputFolder);
                    await exportInnoDBTable(connection, databaseName, metadataTable, outputFolder);

                } catch (e) {
                    console.log(e);
                    logger.error(e);
                }
            } // end ancestry
        } // end sex

    } catch (e) {
        console.log(e);
        logger.error(e);
        process.exit(1);
    }
}
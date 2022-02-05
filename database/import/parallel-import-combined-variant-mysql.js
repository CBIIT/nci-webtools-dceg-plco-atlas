const fs = require('fs');
const path = require('path');
const mysql = require('mysql2');
const args = require('minimist')(process.argv.slice(2));
const { getRecords, importInnoDBTable,deleteInnoDBTableFiles, pluck } = require('./utils/query');
const { readFile } = require('./utils/file');
// const { database } = require('../../server/config.json');
const { timestamp, getLogger } = require('./utils/logging');
const { dirname } = require('path');

// display help if needed
if (!args.folder) {
    console.log(`USAGE: node parallel-import-combined-variant-mysql.js 
            --folder "path to folder"
            --host "MySQL hostname [OPTIONAL, localhost by default]" 
            --port "MySQL port [OPTIONAL, 3306 by default]" 
            --db_name "MySQL database name [OPTIONAL, plcogwas by default]" 
            --user "MySQL username" 
            --password "MySQL password"
            --logdir "./" [REQUIRED]`);
    process.exit(0);
}

// parse arguments and set defaults
let {folder: folderPath, host, port, db_name, user, password, logdir: logFolder} = args;

host = host || 'localhost';
port = port || 3306;
let database = db_name || 'plcogwas';

const logger = getLogger(path.resolve(logFolder || __dirname, 'import.log'), 'import');
const connection = mysql.createConnection({
    host,
    port,
    database,
    user,
    password,
    namedPlaceholders: true,
    multipleStatements: true,
    // debug: true,
}).promise();

(async function main() {
    try {
        // retrieve information on each phenotype in the data folder
        const phenotypes = await getPhenotypes({
            connection, 
            folderPath
        });

        // import each phenotype's variants, aggregated variants, and metadata
        for (const phenotype of phenotypes) {

            const startTime = new Date().getTime();
            logger.info(`Started importing ${phenotype.name}.${phenotype.sex}.${phenotype.ancestry}`);
            await importVariants({
                connection, 
                database, 
                folderPath, 
                phenotype
            });
            const endTime = new Date().getTime();
            const durationSeconds = (endTime - startTime) / 1000;
            const duration = `${Math.floor(durationSeconds / 60)}m ${durationSeconds % 60}s`;

            logger.info(`Finished importing ${phenotype.name}.${phenotype.sex}.${phenotype.ancestry}`);
            logger.info(`=============== Elapsed Time: ${duration} ===============\n\n`);
        }

        await connection.close();

        logger.info(`Imported variants`);
        process.exit(0);
    } catch (e) {
        console.log(e);
        for (let key in e) console.log(e, e[key]);
        console.log(typeof e.stack)
        logger.error(String(e));
        process.exit(1);
    }
})();

async function getPhenotypes({connection, folderPath}) {
    const databaseFiles = await fs.promises.readdir(folderPath);
    const [phenotypeRows] = await connection.query(`SELECT id, name FROM phenotype`);

    return databaseFiles
        .filter(filename => /\.ibd$/i.test(filename))
        .map(filename => filename.replace(/(#.*)?\.ibd$/i, ''))
        .map(filename => filename.split('__').slice(1).join('__'))
        .reduce((acc, curr) => !acc.includes(curr) ? acc.concat([curr]) : acc, [])
        .reduce((phenotypes, tableSuffix) => {
            const [name, sex, ancestry] = tableSuffix.split('__');
            const {id} = phenotypeRows.find(p => p.name === name);
            phenotypes.push({id, name, tableSuffix, sex, ancestry});
            return phenotypes;
        }, []);
}

function getSql(filepath, args) {
    let sql = readFile(path.resolve(__dirname, filepath));
    for (let key in args)
        // regex for simulating es6-interpolated strings
        sql = sql.replace(new RegExp(`\\\${${key}}`, 'g'), args[key]);
    return sql;
}

async function importVariants({connection, database, folderPath, phenotype}) {
    const { tableSuffix, id, sex, ancestry } = phenotype;
    const variantTable = `var__${tableSuffix}`;
    const aggregateTable = `agg__${tableSuffix}`;
    const pointTable = `pnt__${tableSuffix}`;
    const metadataTable = `mta__${tableSuffix}`;

    // remove old tablespace files if they exist
    for (let table of [variantTable, aggregateTable, pointTable, metadataTable]) {
        logger.info(`Deleting tables ${variantTable} ${aggregateTable} ${pointTable} ${metadataTable}`);
        await deleteInnoDBTableFiles(connection, database, table);
    }

    logger.info('Re-creating tables');
    // create variant table
    await connection.query([
        `DROP TABLE IF EXISTS ${variantTable}, ${aggregateTable},  ${pointTable}, ${metadataTable};`,
        getSql('../schema/tables/variant.sql', {table_name: variantTable}),
        getSql('../schema/indexes/variant.sql', {table_name: variantTable}),
        getSql('../schema/tables/aggregate.sql', {table_name: aggregateTable}),
        getSql('../schema/tables/point.sql', {table_name: pointTable}),
        getSql('../schema/tables/metadata.sql', {table_name: metadataTable}),
    ].join('\n'));

    logger.info('Importing variant table');
    await importInnoDBTable(connection, database, variantTable, folderPath);

    logger.info('Importing temporary InnoDB tables');
    await importInnoDBTable(connection, database, aggregateTable, folderPath);
    await importInnoDBTable(connection, database, pointTable, folderPath);
    await importInnoDBTable(connection, database, metadataTable, folderPath);

    logger.info('Inserting aggregate points');
    await connection.query(`
        DELETE FROM phenotype_aggregate 
        WHERE
            phenotype_id = :id 
            AND sex = :sex
            AND ancestry = :ancestry;
    `, {id, sex, ancestry});
    await connection.query(`
        INSERT INTO phenotype_aggregate 
            (phenotype_id, sex, ancestry, chromosome, position_abs, p_value_nlog)
        SELECT
            phenotype_id, sex, ancestry, chromosome, position_abs, p_value_nlog
        FROM ${aggregateTable}
    `);

    // preserve ids from point table
    logger.info('Inserting qq plot points');
    await connection.query(`
        INSERT INTO phenotype_point 
        SELECT * FROM ${pointTable}
        ON DUPLICATE KEY UPDATE
            p_value_nlog = VALUES(p_value_nlog),
            p_value_nlog_expected = VALUES(p_value_nlog_expected);
    `);

    logger.info('Inserting metadata');
    await connection.query(`
        INSERT INTO phenotype_metadata 
            (phenotype_id, sex, ancestry, chromosome, lambda_gc, count)
        SELECT
            phenotype_id, sex, ancestry, chromosome, lambda_gc, count
        FROM ${metadataTable}
        ON DUPLICATE KEY UPDATE
            lambda_gc = VALUES(lambda_gc),
            count = VALUES(count);
    `);

    logger.info('Removing temporary InnoDB tables');
    await connection.query(`DROP TABLE ${aggregateTable}`);
    await connection.query(`DROP TABLE ${metadataTable}`);
    await connection.query(`DROP TABLE ${pointTable}`);

    // log imported variants
    logger.info(`Storing import log`);
    await connection.execute(`
        UPDATE phenotype SET
            import_count = (
                SELECT SUM(count) from phenotype_metadata
                WHERE
                    phenotype_id = :id AND
                    chromosome = 'all'
            ),
            import_date = NOW()
        WHERE
            id = :id`,
        {id}
    );

    // verifying import counts
    const [variantCountRows] = await connection.execute(`SELECT count(*) FROM ${variantTable}`)
    const variantCount = pluck(variantCountRows);

    const [metadataCountRows] = await connection.execute(`
        SELECT count FROM phenotype_metadata
        WHERE 
            phenotype_id = :id AND
            ancestry = :ancestry AND
            sex = :sex
        `, {id, ancestry, sex});
    const metadataCount = pluck(metadataCountRows);

    // do not stop the import process, as we will want to collect warnings for all phenotypes
    if (metadataCount === null || variantCount === 0) {
        logger.warn('WARNING: No variants were imported');
    } else if (variantCount !== metadataCount) {
        logger.warn(`WARNING: Imported variants count (${variantCount}) does not match expected value (${metadataCount})`);
    }

}

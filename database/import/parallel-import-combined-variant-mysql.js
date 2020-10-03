const fs = require('fs');
const path = require('path');
const mysql = require('mysql2');
const args = require('minimist')(process.argv.slice(2));
const { getRecords, importInnoDBTable } = require('./utils/query');
const { readFile } = require('./utils/file');
// const { database } = require('../../server/config.json');
const { timestamp, getLogger } = require('./utils/logging');
const { dirname } = require('path');

// display help if needed
if (!args.folder) {
    console.log(`USAGE: node parallel-import-variant.js
            --folder "path to folder"
            --host "MySQL hostname" 
            --port "MySQL port" 
            --db_name "MySQL database name" 
            --user "MySQL username" 
            --password "MySQL password"
            --logdir "./" [REQUIRED]`);
    process.exit(0);
}

// parse arguments and set defaults
const {folder: folderPath, host, port, db_name: database, user, password, logdir: logFolder} = args;
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
            logger.info(`Started importing ${phenotype.name}.${phenotype.sex}.${phenotype.ancestry}`);
            await importVariants({
                connection, 
                database, 
                folderPath, 
                phenotype
            });
            logger.info(`Finished importing ${phenotype.name}.${phenotype.sex}.${phenotype.ancestry}`);
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
    const variantTable = `phenotype_variant__${tableSuffix}`;
    const aggregateTable = `phenotype_aggregate__${tableSuffix}`;
    const pointTable = `phenotype_point__${tableSuffix}`;
    const metadataTable = `phenotype_metadata__${tableSuffix}`;

    // create variant table
    await connection.query([
        `DROP TABLE IF EXISTS ${variantTable}, ${aggregateTable}, ${metadataTable};`,
        getSql('../schema/tables/variant.sql', {table_name: variantTable}),
        getSql('../schema/indexes/variant.sql', {table_name: variantTable}),
        getSql('../schema/tables/aggregate.sql', {table_name: aggregateTable}),
        getSql('../schema/tables/point.sql', {table_name: pointTable}),
        `CREATE TABLE ${metadataTable} LIKE phenotype_metadata;`,
    ].join('\n'));
   
    logger.info('Importing variant table');
    await importInnoDBTable(connection, database, variantTable, folderPath);

    logger.info('Importing temporary InnoDB tables');
    await importInnoDBTable(connection, database, aggregateTable, folderPath);
    await importInnoDBTable(connection, database, pointTable, folderPath);
    await importInnoDBTable(connection, database, metadataTable, folderPath);

    logger.info('Selecting from temporary InnoDB tables');
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
    await connection.query(`
        INSERT INTO phenotype_point SELECT * FROM ${pointTable}
    `);

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
    logger.info(`Storing import log...`);
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
}

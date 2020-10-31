const mysql = require('mysql2');
const args = require('minimist')(process.argv.slice(2));
// const { database } = require('../../server/config.json');
const { timestamp } = require('./utils/logging');
const { getRecords, pluck } = require('./utils/query');

// display help if needed
if (!(args.user) || !(args.password)) {
    console.log(`USAGE: node update-variant-count.js 
        --host "MySQL hostname" 
        --port "MySQL port" 
        --db_name "MySQL database name" 
        --user "MySQL username" 
        --password "MySQL password" `);
    process.exit(0);
}

let { host, port, db_name, user, password } = args;
host = host || 'localhost';
port = port || 3306;
db_name = db_name || 'plcogwas';

// set defaults
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

updateCounts().then(e => {
    console.log(`[${duration()} s] Updated variant counts`);
    process.exit(0);
});

async function updateCounts() {
    await connection.query(`
        START TRANSACTION;
        SET autocommit = 0;
    `);

    let [phenotypes] = await connection.query(`
        select id, name from phenotype
        where name is not null;
    `);

    let [tableNameRows] = await connection.query(`
        select TABLE_NAME as tableName from information_schema.tables
        where TABLE_NAME like 'phenotype_variant__%' and TABLE_ROWS > 0;
    `);

    for (let {tableName} of tableNameRows) {
        let [, name, sex, ancestry] = tableName.split('__');
        let phenotype = phenotypes.find(p => p.name == name)
        console.log(`Updating counts for ${name}, ${sex}, ${ancestry}`)

        for (let i = 1; i <= 22; i ++) {
            console.log(`Updating counts for ${name}, ${sex}, ${ancestry} - Chromosome ${i}`)
            await connection.query(
                `insert into phenotype_metadata (phenotype_id, sex, ancestry, chromosome, count)
                select 
                    ${phenotype.id}, 
                    '${sex}', 
                    '${ancestry}', 
                    ${i} as chromosome,
                    (select count(*) from ${tableName} partition(\`${i}\`)) as count 
                ON DUPLICATE KEY UPDATE
                count = VALUES(count)`
            );
        }
        
        await connection.execute(
            `insert into phenotype_metadata (phenotype_id, sex, ancestry, chromosome, count)
            select ${phenotype.id}, '${sex}', '${ancestry}', 'all', sum(count) as count
            from phenotype_metadata
            where phenotype_id = :id and sex = :sex and ancestry = :ancestry
            ON DUPLICATE KEY UPDATE
            count = VALUES(count)`,
            {id: phenotype.id, sex, ancestry}
        );

        await connection.execute(
            `update phenotype set 
            import_count = (
                select sum(count) from phenotype_metadata 
                where phenotype_id = :id and chromosome = 'all'
            ),
            import_date = NOW()
            where id = :id`,
            {id: phenotype.id}
        );
    }

    await connection.query(`COMMIT`);
    await connection.end();
    return 0;
}

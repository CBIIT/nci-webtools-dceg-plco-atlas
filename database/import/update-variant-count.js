const mysql = require('mysql2');
const args = require('minimist')(process.argv.slice(2));
// const { database } = require('../../server/config.json');
const { timestamp } = require('./utils/logging');
const { getRecords, pluck } = require('./utils/query');
const { getLambdaGC } = require('./utils/math');

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
    let [phenotypes] = await connection.query(`
        select id, name from phenotype
        where name is not null;
    `);

    let [tableNameRows] = await connection.query(`
        select TABLE_NAME as tableName from information_schema.tables
        where TABLE_NAME like 'phenotype_variant__%' and TABLE_ROWS > 0;
    `);

    for (let {tableName} of tableNameRows) {
        await connection.query(`
            START TRANSACTION;
            SET autocommit = 0;
        `);

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

        const [countRows] = await connection.execute(
            `SELECT count 
            FROM phenotype_metadata
            where 
                phenotype_id = :id and 
                sex = :sex and 
                ancestry = :ancestry and 
                chromosome = 'all'`,
            {id: phenotype.id, sex, ancestry}
        );
        const count = pluck(countRows);

        const [medianRows] = await connection.execute(
            `select avg(p_value) from (
                select p_value from ${tableName} 
                order by p_value 
                limit ${Math.floor(count / 2)}, ${count % 2 ? 1 : 2}
            ) p`
        );
        const median = pluck(medianRows);
        const lambdaGC = getLambdaGC(median);
        console.log(`LambdaGC: ${lambdaGC} FROM ${median}`);

        connection.execute(
            `update phenotype_metadata set lambda_gc = :lambdaGC
            where phenotype_id = :id and sex = :sex and ancestry = :ancestry and chromosome = 'all'`,
            {id: phenotype.id, sex, ancestry, lambdaGC}
        );

        await connection.query(`COMMIT`);
    }

    connection.execute(
        `update phenotype p
        join phenotype_metadata pm on 
            p.id = pm.phenotype_id 
            and pm.chromosome = 'all' 
            and pm.count is not null
        set p.import_count = (select sum(pm.count))`
    );

    connection.execute(
        `update phenotype p
        set p.import_date = NOW()
        where p.import_count is not null
        and p.import_date is null`
    );

    await connection.end();
    return 0;
}

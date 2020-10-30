const fs = require('fs');
const path = require('path');
const mysql = require('mysql2');
const parse = require('csv-parse/lib/sync')
const args = require('minimist')(process.argv.slice(2));
// const { database } = require('../../server/config.json');
const { timestamp } = require('./utils/logging');
const { readFile } = require('./utils/file');
const { getRecords, pluck } = require('./utils/query');
const { getIntervals, getLambdaGC } = require('./utils/math');

// display help if needed
if (!(args.file) || !(args.user) || !(args.password)) {
    console.log(`USAGE: node import-phenotypes.js 
        --file "filename"
        --host "MySQL hostname" 
        --port "MySQL port" 
        --db_name "MySQL database name" 
        --user "MySQL username" 
        --password "MySQL password" `);
    process.exit(0);
}

// parse arguments and set defaults
let { file, host, port, db_name, user, password } = args;
host = host || 'localhost';
port = port || '3306';
db_name = db_name || 'plcogwas';

const inputFilePath = path.resolve(file);
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
if (!fs.existsSync(inputFilePath)) {
    console.error(`ERROR: ${inputFilePath} does not exist.`);
    process.exit(1);
}

importParticipantData().then(numRows => {
    console.log(`[${duration()} s] Imported data for participants, please run the following scripts:
        import-participant-data-category.sql
        import-phenotype-correlation.sql
        update-participant-count.js
        update-variant-count.js
    `);
    process.exit(0);
});

function getFirstLine(filePath) {
    return new Promise(function (resolve, reject) {
        let rs = fs.createReadStream(filePath, {encoding: 'utf8'});
        let acc = '';
        let pos = 0;
        let index;
        rs
          .on('data', chunk => {
            index = chunk.indexOf('\n');
            acc += chunk;
            index !== -1 ? rs.close() : pos += chunk.length;
          })
          .on('close', () => resolve(acc.slice(0, pos + index)))
          .on('error', err => reject(err))
      });
}

async function importParticipantData() {
    const [phenotypes, phenotypeColumns] = await connection.query(
        `SELECT id, name, age_name 
        FROM phenotype WHERE name is NOT NULL
        ORDER BY name`
    );

    const headers = (await getFirstLine(inputFilePath))
        .split(/\s+/)
        .map(str => str.trim().toLowerCase());


    await connection.query(`
        DROP TABLE IF EXISTS participant_data_stage;
        DROP TABLE IF EXISTS participant_data;
        DROP TABLE IF EXISTS participant;

        CREATE TABLE IF NOT EXISTS participant (
            id            INTEGER PRIMARY KEY NOT NULL AUTO_INCREMENT,
            sex           ENUM('female', 'male'),
            ancestry      ENUM('white', 'black', 'hispanic', 'asian', 'pacific_islander', 'american_indian')
        );

        CREATE TABLE IF NOT EXISTS participant_data (
            id BIGINT PRIMARY KEY NOT NULL AUTO_INCREMENT,
            phenotype_id INTEGER NOT NULL,
            participant_id INTEGER,
            value DOUBLE,
            age INTEGER,
            FOREIGN KEY (phenotype_id) REFERENCES phenotype(id),
            FOREIGN KEY (participant_id) REFERENCES participant(id)
        );

        CREATE TABLE participant_data_stage (
            id integer primary key auto_increment,
            ${headers.map(header => `\`${header}\` ${
                header === 'plco_id' ? 'text' : 'double'
            }`).join(',\n')}
        ) ENGINE=MYISAM;
    `);


    console.info('Loading data into prestage table');
    await connection.query({
        infileStreamFactory: path => fs.createReadStream(inputFilePath),
        sql: `LOAD DATA LOCAL INFILE "${inputFilePath}"
            INTO TABLE participant_data_stage
            FIELDS TERMINATED BY '\t'
            IGNORE 1 LINES (${headers.map(header => `@${header}`).join(',\n')})  
            SET ${headers.map(header => `${header} = if(@${header} in('NA', ''), null, @${header})`).join(',\n')}`
    });


    console.info('Loading participants');
    await connection.query(`
        -- import phenotype_sample values
        INSERT INTO participant (id, ancestry, sex)
        SELECT
            id,
            CASE bq_race7_ca
                WHEN 1 THEN 'white'
                WHEN 2 THEN 'black'
                WHEN 3 THEN 'hispanic'
                WHEN 4 THEN 'asian'
                WHEN 5 THEN 'pacific_islander'
                WHEN 6 THEN 'american_indian'
                ELSE NULL
            END AS ancestry,
            CASE sex
            WHEN 1 THEN 'male'
            WHEN 2 THEN 'female'
            ELSE NULL
            END AS sex
        FROM participant_data_stage;
        
        -- remove invalid age_name values 
        -- (non-numeric values which are not columns in the participant data stage table)
        UPDATE phenotype p 
            SET age_name = NULL
            WHERE 0 = (
            SELECT COUNT(*) FROM information_schema.columns
            WHERE
                table_name = 'participant_data_stage' AND 
                column_name = p.age_name)
            AND age_name NOT REGEXP '^[0-9]+$';
    `);

    console.info('Loading participant data');
    for (let {id, name, age_name} of phenotypes) {
        if (!headers.includes(name) || (age_name && !headers.includes(age_name))) {
            console.warn(`WARNING: Phenotype ${name} was not found in the input file`);
        } else if (age_name && !headers.includes(age_name)) {
            console.warn(`WARNING: Age variable ${age_name} was not found in the input file`);
        } else {
            console.info(`Inserting data for: ${name}`);
            await connection.execute(`
                INSERT INTO participant_data (phenotype_id, participant_id, value, age)
                SELECT 
                    ${id}, 
                    pd.id as phenotype_sample_id, 
                    ${name} as value, 
                    ${age_name || 'NULL'} as age
                FROM participant_data_stage pd
            `);
        }
    }

    console.info('Creating indexes and updating metadata');
    await connection.query(`
        -- create indexes on tables
        ALTER TABLE participant_data
            ADD INDEX idx_participant_data__phenotype_id  (phenotype_id);

        -- insert average and standard deviation metadata
        INSERT INTO phenotype_metadata (phenotype_id, sex, ancestry, chromosome, average_value, standard_deviation)
        SELECT
            phenotype_id,
            "all" as sex,
            "all" as ancestry,
            "all" as chromosome,
            avg(value) as average_value,
            std(value) as standard_deviation
        FROM participant_data
        GROUP BY phenotype_id
        ON DUPLICATE KEY UPDATE
            average_value = VALUES(average_value),
            standard_deviation = VALUES(standard_deviation);
    `);
}
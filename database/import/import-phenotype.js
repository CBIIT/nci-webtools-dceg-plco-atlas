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
if (!(args.file) || !(args.host) || !(args.port) || !(args.db_name) || !(args.user) || !(args.password)) {
    console.log(`USAGE: node import-phenotype.js 
        --file "filename"
        --create_partitions_only
        --host "MySQL hostname" 
        --port "MySQL port" 
        --db_name "MySQL database name" 
        --user "MySQL username" 
        --password "MySQL password" `);
    process.exit(0);
}

// parse arguments and set defaults
const { file, create_partitions_only: createPartitionsOnly, host, port, db_name, user, password } = args;
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

importPhenotypes().then(numRows => {
    console.log(`[${duration()} s] Imported ${numRows} phenotypes, please run the following scripts:
        import-participant-data.js
        import-participant-data-category.sql
        import-phenotype-correlation.sql
        update-participant-count.js
        update-variant-count.js
    `);
    process.exit(0);
});

async function importPhenotypes() {
    if (!createPartitionsOnly) {
        console.log(`[${duration()} s] Truncating tables...`);

        // truncate phenotype table and all other associated tables
        await connection.query(`
            SET FOREIGN_KEY_CHECKS=0;
            TRUNCATE TABLE principal_component_analysis;
            TRUNCATE TABLE participant_data_category;
            TRUNCATE TABLE participant_data;
            TRUNCATE TABLE participant;
            TRUNCATE TABLE phenotype_correlation;
            TRUNCATE TABLE phenotype_metadata;
            TRUNCATE TABLE phenotype;
            SET FOREIGN_KEY_CHECKS=1;
        `);
    }

    console.log(`[${duration()} s] Parsing records...`);

    // parse records
    let records = parse(readFile(inputFilePath), {
        bom: true,
        from_line: 2,
        columns: ['id', 'parent_id', 'display_name', 'name', 'description', 'type', 'age_name', 'sex_specific'],
        on_record: (record, context) => {
            // ensure that:
            // id and parent_id are numeric values or null
            // NULL strings are replaced with actual nulls
            // ordinal records are treated as categorical

            // replace NULL records with actual nulls first
            for (let key in record) {
                let value = record[key].trim();
                if (/^NULL$/i.test(value) || !value.length)
                    value = null;
                record[key] = value;
            }

            record.id = +record.id;

            // ensure parent records are parsed as numbers
            if (record.parent_id !== undefined && record.parent_id !== null)
                record.parent_id = +record.parent_id;
            else
                record.parent_id = null;

            if (record.type === 'ordinal')
                record.type = 'categorical';

            return record;
        }
    });

    // reorder records so that parent nodes come before their descendants
    let orderedRecords = [];

    let addParent = (record, records, orderedRecords) => {
        let parentIndex = records.findIndex(e => e.id === record.parent_id);
        if (parentIndex != -1) {
            let [parent] = records.splice(parentIndex, 1);
            if (!orderedRecords.find(e => e.id === parent.parent_id))
                addParent(parent, records, orderedRecords);
            orderedRecords.push(parent);
        } else {
            console.log('could not find all parents for ', record);
        }
    }

    while (records.length) {
        let record = records.shift();
        let hasOrderedParent = orderedRecords.find(e => e.id === record.parent_id);

        if (record.parent_id === null || hasOrderedParent)
            orderedRecords.push(record);

        else if (!hasOrderedParent) {
            addParent(record, records, orderedRecords);
            orderedRecords.push(record);
        }

        else
            console.log('ERROR: Could not find parent for', record);
    }

    console.log(`[${duration()} s] Inserting records...`);

    // insert records
    for (let record of orderedRecords) {
        const aggregateTable = `phenotype_aggregate`;
        const pointTable = `phenotype_point`;
        const phenotypeId = record.id;
        const partition = `\`${phenotypeId}\``;

        if (!createPartitionsOnly)
            await connection.execute(
                `INSERT INTO phenotype (id, parent_id, name, age_name, display_name, description, type, sex_specific)
                    VALUES (:id, :parent_id, :name, :age_name, :display_name, :description, :type, :sex_specific)`,
                record
            );

        for (let table of [aggregateTable, pointTable]) {
            // create partitions for each phenotype (if they do not exist)
            const [partitionRows] = await connection.execute(
                `SELECT * FROM INFORMATION_SCHEMA.PARTITIONS
                WHERE TABLE_NAME = :table
                AND PARTITION_NAME = :phenotypeId`,
                {table, phenotypeId}
            );

            // create partitions
            if (!partitionRows.length) {
                console.log(`[${duration()} s] Adding partition ${partition} to ${table}...`);
                await connection.query(`ALTER TABLE ${table} ADD PARTITION (PARTITION ${partition} VALUES IN (${phenotypeId}));`);
            }
        }
    };

    // add color to phenotype table
    await connection.query(`
        UPDATE phenotype SET color = '#fdcb6e' WHERE id = 200 or display_name = 'Anthropometric measures';
        UPDATE phenotype SET color = '#e84393' WHERE id = 800 or display_name = 'Reproductive factors';
        UPDATE phenotype SET color = '#e17055' WHERE id = 900 or display_name = 'Mortality';
        UPDATE phenotype SET color = '#d63031' WHERE id = 300 or display_name = 'Cancer';
        UPDATE phenotype SET color = '#6c5ce7' WHERE id = 500 or display_name = 'Lifestyle factors';
        UPDATE phenotype SET color = '#00b894' WHERE id = 700 or display_name = 'Non-cancer medical conditions';
        UPDATE phenotype SET color = '#8e44ad' WHERE id = 100 or display_name = 'Biochemical Measurements';
    `);

    return orderedRecords.length;
}

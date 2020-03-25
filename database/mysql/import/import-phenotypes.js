const fs = require('fs');
const path = require('path');
const mysql = require('mysql2');
const parse = require('csv-parse/lib/sync')
const args = require('minimist')(process.argv.slice(2));
const { database } = require('../../../server/config.json');
const { timestamp } = require('./utils/logging');
const { readFile } = require('./utils/file');
const { getRecords, pluck } = require('./utils/query');
const { getIntervals, getLambdaGC } = require('./utils/math');

// display help if needed
if (!(args.file)) {
    console.log(`USAGE: node import-phenotypes.js --file "filename"`);
    process.exit(0);
}

// parse arguments and set defaults
const { file } = args;
const inputFilePath = path.resolve(file);
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


importPhenotypes().then(numRows => {
    console.log(`[${duration()} s] Imported ${numRows} phenotypes, please run the following scripts:
        import-participant-data.sql
        import-participant-data-categories.sql
        import-phenotype-correlations.sql
        update-participant-counts.js
        update-variants-counts.js
    `);
    process.exit(0);
});

async function importPhenotypes() {
    // remove phenotype table and all other associated tables
    await connection.query(`
        DROP TABLE IF EXISTS participant_data_category;
        DROP TABLE IF EXISTS participant_data;
        DROP TABLE IF EXISTS participant;
        DROP TABLE IF EXISTS phenotype_correlation;
        DROP TABLE IF EXISTS phenotype_metadata;
        DROP TABLE IF EXISTS phenotype;
    `);

    // recreate tables
    await connection.query(
        readFile('../../schema/tables/global.sql')
    );

    // parse records
    let records = parse(readFile(inputFilePath), {
        bom: true,
        from_line: 2,
        columns: ['id', 'parent_id', 'display_name', 'name', 'description', 'type', null],
        on_record: (record, context) => {
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



    // add test data (todo: remove once we have data for actual phenotypes)
    let maxId = orderedRecords.reduce((acc, curr) => Math.max(acc, curr.id), 0);
    orderedRecords.push(
        {
            id: maxId + 1,
            parent_id: null,
            display_name: 'Test',
            name: null,
            description: null,
            type: null
        },
        {
            id: maxId + 2,
            parent_id: maxId + 1,
            name: `ewings_sarcoma_2`,
            display_name: `Ewing's Sarcoma`,
            description: `Test Description`,
            type: `binary`
        },
        {
            id: maxId + 3,
            parent_id: maxId + 1,
            name: `melanoma_3`,
            display_name: `Melanoma`,
            description: `Test Description`,
            type: `binary`
        },
        {
            id: maxId + 4,
            parent_id: maxId + 1,
            name: `renal_cell_carcinoma_4`,
            display_name: `Renal Cell Carcinoma`,
            description: `Test Description`,
            type: `binary`
        },
    );

    // insert records
    for (let record of orderedRecords) {
        await connection.execute(
            `INSERT INTO phenotype (id, parent_id, display_name, name, description, type)
                VALUES (:id, :parent_id, :display_name, :name, :description, :type)`,
            record
        );
    };

    return orderedRecords.length;
}

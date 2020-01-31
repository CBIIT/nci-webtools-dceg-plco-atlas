const fs = require('fs');
const mysql = require('mysql2');
const { database } = require('../../../server/config.json');
const { validateHeaders, lineStream, mappedStream } = require('./utils/file');
const { tableExists } = require('./utils/query');
const { timestamp } = require('./utils/logging')

// retrieve arguments
const argv = process.argv.slice(2);
if (argv.length !== 1 || argv.includes('-h')) {
    console.log(`USAGE: node import.js genes.csv`)
    process.exit(0);
}

// parse arguments and set defaults
const [ inputFilePath ] = argv;
const duration = timestamp();
const {columns, mapToSql} = require(`./schema-maps/gene`);
const connection = mysql.createConnection({
    host: database.host,
    port: database.port,
    database: database.name,
    user: database.user,
    password: database.password,
    namedPlaceholders: true
  }).promise();

// input file should exist
if (!fs.existsSync(inputFilePath)) {
    console.error(`ERROR: ${inputFilePath} does not exist.`);
    process.exit(1);
}
validateHeaders(inputFilePath, columns);
importGenes().then(() => {
    console.log(`[${duration()} s] Finished`)
    process.exit(0);
});

async function importGenes() {
    const geneTable = 'gene';
    const geneStageTable = 'gene_stage';

    // if gene table exists, clear all genes and proceed with import
    if (await tableExists(connection, database.name, geneTable)) {
        await connection.query(`TRUNCATE ${geneTable}`);
    } else {
        console.error(`ERROR: ${geneTable} does not exist.`);
        process.exit(1);
    }

    // use transaction and disable indexes to speed up import
    await connection.query(`START TRANSACTION`);
    await connection.query(`SET sql_mode = ''`); // disable only_full_group_by
    await connection.query(`SET autocommit = 0`);
    await connection.query(`ALTER TABLE ${geneTable} DISABLE KEYS`);

    // create temporary staging table (same schema as gene table)
    await connection.query(`
        CREATE TEMPORARY TABLE ${geneStageTable}
        SELECT * FROM ${geneTable}
        LIMIT 0
    `);

    // load input stream from file
    console.log(`[${duration()} s] Importing genes to staging table...`);
    await connection.query({
        sql: `LOAD DATA LOCAL INFILE "${inputFilePath}" INTO TABLE ${geneStageTable}
            FIELDS TERMINATED BY ',' ENCLOSED BY '"'
            (name, chromosome, strand, transcription_start, transcription_end, exon_starts, exon_ends)`,
        infileStreamFactory: path => {
            const inputStream = fs.createReadStream(path);
            const outputStream = mappedStream(mapToSql);
            inputStream
                .pipe(lineStream({skipRows: 1})) // reads line by line
                .pipe(outputStream); // pipe raw lines to mapToSql
            return outputStream;
        }
    });

    // collapse genes in staging table by merging exon starts and ends, and tx_start/tx_end
    console.log(`[${duration()} s] Storing genes...`);
    await connection.query(`
        INSERT INTO ${geneTable}
        SELECT
            null,
            name,
            chromosome,
            strand,
            MIN(transcription_start) as transcription_start,
            MAX(transcription_end) as transcription_end,
            GROUP_CONCAT(exon_starts, '') as exon_starts,
            GROUP_CONCAT(exon_ends, '') as exon_ends
        FROM ${geneStageTable}
        WHERE chromosome != ''
        GROUP BY name
        ORDER BY chromosome, transcription_start, transcription_end
    `);

    // drop staging table
    await connection.query(`DROP TEMPORARY TABLE ${geneStageTable}`);

    // enable indexes
    console.log(`[${duration()} s] Indexing database...`);
    await connection.query(`ALTER TABLE ${geneTable} ENABLE KEYS`);

    // commit transaction and close connection
    await connection.query(`COMMIT`);
    console.log(`[${duration()} s] Created database`);
    await connection.end();
}

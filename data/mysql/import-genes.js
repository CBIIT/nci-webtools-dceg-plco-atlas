const fs = require('fs');
const mysql = require('mysql2');
const ranges = require('../json/chromosome_ranges.json');
const { database } = require('../../server/config.json');
const { getFileReader, parseLine, readFile, validateHeaders } = rquire('./utils/file');
const { getRecords, pluck, getMedian, tableExists } = require('./utils/query');
const { getIntervals, getLambdaGC, group, ppoints, timestamp  } = require('./utils/math');

// retrieve arguments
const argv = process.argv.slice(2);
if (argv.length !== 4 || argv.includes('-h')) {
    console.log(`USAGE: node import.js genes.csv`)
    process.exit(0);
}

// parse arguments and set defaults
const [ inputFilePath ] = argv;
const {columns, mapToSchema} = require(`./schema-maps/gene`);
const getDuration = timestamp();
const connection = mysql.createConnection({
    host: database.host,
    database: database.name,
    user: database.user,
    password: database.user,
    namedPlaceholders: true
  }).promise();

// input file should exist
if (!fs.existsSync(inputFilePath)) {
    console.error(`ERROR: ${inputFilePath} does not exist.`);
    process.exit(1);
}
validateHeaders(inputFilePath, columns);
importGenes();

async function importGenes() {
    const geneTable = 'gene';
    const geneStageTable = 'gene_stage';
    let count = 0;

    // check if gene table exists. if it does, clear all genes
    if (await tableExists(connection, database.name, geneTable)) {
        connection.execute('TRUNCATE ${geneTable');
    } else {
        console.error(`ERROR: ${geneTable} does not exist.`);
        process.exit(1);
    }

    // use transaction and drop indexes to speed up import
    await connection.execute(`START TRANSACTION`);
    await connection.execute(`SET autocommit = 0`);
    await connection.execute(`ALTER TABLE ${geneTable} DISABLE KEYS`);

    // create temporary staging table (same schema as gene table)
    await connection.execute(`
        CREATE TEMPORARY TABLE ${geneStageTable}
        SELECT * FROM ${geneTable}
    `);

    // prepare statement to insert into staging table
    const insert = await connection.prepare(`
        INSERT INTO ${geneStageTable} VALUES (
            :id,
            :name,
            :chromosome,
            :strand,
            :transcription_start,
            :transcription_end,
            :exon_starts,
            :exon_ends
    `);

    reader.on('line', async line => {
        // trim, split by spaces, and parse 'NA' as null
        const values = parseLine(line);
        const params = mapToSchema(values);
        params.id = null;
        params.chromosome = +params.chromosome.replace('chr', '');

        // validate line (no alt. chromosome or genes, only autosomes)
        if (++count === 0 || isNaN(params.chr)) return;

        await insert.execute(params);

        // show progress message every 10000 rows
        if (count % 1000 === 0)
            console.log(`[${duration()} s] Read ${count} rows`);
    });

    reader.on('close', async () => {

        // collapse genes in staging table by merging exon starts and ends, and tx_start/tx_end
        console.log(`[${duration()} s] Storing genes...`);
        connection.execute(`
            INSERT INTO ${geneTable} SELECT
                null,
                name,
                chr,
                strand,
                MIN(tx_start) as tx_start,
                MAX(tx_end) as tx_end,
                GROUP_CONCAT(exon_starts, '') as exon_starts,
                GROUP_CONCAT(exon_ends, '') as exon_ends
            FROM ${geneStageTable}
            GROUP BY name
            ORDER BY chr, tx_start
        `);

        // drop staging table
        connection.execute(`DROP TEMPORARY TABLE ${geneStageTable}`);

        // enable indexes
        console.log(`[${duration()} s] Indexing database...`);
        await connection.execute(`ALTER TABLE ${geneTable} ENABLE KEYS`);
        await connection.execute(`COMMIT`);
        console.log(`[${duration()} s] Created database`);
        await connection.end();
    });
}

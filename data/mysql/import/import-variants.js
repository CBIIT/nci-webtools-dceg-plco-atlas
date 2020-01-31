const fs = require('fs');
const mysql = require('mysql2');
const args = require('minimist')(process.argv.slice(2));
const ranges = require('../../json/chromosome_ranges.json');
const { database } = require('../../server/config.json');
const { timestamp, getLogStream } = require('./utils/logging');
const { getFileReader, parseLine, readFile, validateHeaders } = require('./utils/file');
const { getRecords, pluck, getMedian, tableExists } = require('./utils/query');
const { getIntervals, getLambdaGC, group, ppoints } = require('./utils/math');

// display help if needed
if (!(args.file && args.phenotype && args.schema && args.gender)) {
    console.log(`USAGE: node import-variants.js \
        --file "filename" \
        --phenotype "phenotype name or id" \
        --schema "schema map name, eg: ewings_sarcoma, melanoma, or renal_cell_carcinoma" \
        --gender "all" | "female" | "male" \
        --reset (if specified, remove all records in phenotype)`);
    process.exit(0);
}

// parse arguments and set defaults
const { file: inputFilePath, phenotype, schema, gender, reset: shouldReset } = args;
const { columns, mapToSchema } = require(`./schema-maps/${schema}`);
const reader = getFileReader(inputFilePath);
const errorLog = getLogStream(`failed-variants-${new Date().toISOString()}.txt`);
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

// schema map should exist
if (!mapToSchema) {
    console.error(`ERROR: ${schema} is not a valid schema`);
    process.exit(1);
}

// gender should be male, female, or all
if (!/^(all|female|male)$/.test(gender)) {
    console.error(`ERROR: Gender must be all, female, or male`);
    process.exit(1);
}

validateHeaders(inputFilePath, columns);
importVariants();

async function importVariants() {
    // find phenotypes either by name or id (if a numeric value was provided)
    let phenotypes = await getRecords(connection, 'lu_phenotype', /^\d+$/.test(phenotype)
        ? {id: phenotype}
        : {name: phenotype}
    );

    if (phenotypes.length === 0) {
        console.error(`ERROR: Phenotype does not exist`)
        process.exit(1);
    }

    if (phenotypes.length > 1) {
        console.error(`ERROR: More than one phenotype was found with the same name. Please specify the phenotype id instead of the name.`)
        process.exit(1);
    }

    const phenotype = phenotypes[0].name;
    const phenotypeId = phenotypes[0].id;
    const phenotypeName = `${phenotype}_${phenotypeId}`;
    const stageTable = `${phenotypeName}_stage`;
    const variantTable = `${phenotypeName}_variant`;
    const aggregateTable = `${phenotypeName}_aggregate`;

    await connection.execute(`START TRANSACTION`);
    await connection.execute(`SET autocommit = 0`);
    await connection.execute(`ALTER TABLE ${variantTable} DISABLE KEYS`);
    await connection.execute(`ALTER TABLE ${aggregateTable} DISABLE KEYS`);

    // execute schema script for new databases
    if (!await tableExists(connection, database.name, variantTable)) {
        console.log(`[${getDuration()} s] Creating [${variantTable}, ${aggregateTable}])...`);
        const schemaSql = readFile('../schema/tables/variants.sql')
            .replace(/\$PHENOTYPE/g, phenotypeName);
        await connection.execute(schemaSql);
    }

    // clear variants if needed
    if (shouldReset) {
        console.log(`[${getDuration()} s] Clearing [${variantTable}, ${aggregateTable}])...`);
        await connection.execute(`TRUNCATE TABLE ${variantTable}`);
        await connection.execute(`TRUNCATE TABLE ${aggregateTable}`);
    }

    // load input stream from file
    console.log(`[${duration()} s] Importing genes to staging table...`);
    await connection.query({
        sql: `LOAD DATA LOCAL INFILE "${inputFilePath}" INTO TABLE ${stageTable}
            FIELDS TERMINATED BY ',' ENCLOSED BY '"' (
                chromosome,
                position,
                position_aggregate,
                position_abs_aggregate,
                snp,
                allele_reference,
                allele_effect,
                p_value,
                p_value_aggregate,
                p_value_expected,
                p_value_nlog,
                p_value_r,
                odds_ratio,
                odds_ratio_r,
                n,
                q,
                i,
            )`,
        infileStreamFactory: path => {
            const inputStream = fs.createReadStream(path);
            const outputStream = mappedStream((row, index) => {
                let data = mapToSql(row);
                return data;
            });
            inputStream
                .pipe(lineStream({skipRows: 1})) // reads line by line
                .pipe(outputStream); // pipe raw lines to mapToSql
            return outputStream;
        }
    });

    // set up counters
    // let lineCount = 0;
    // let previousChromosome = 1;
    // let positionOffset = 0;

    // set up validation functions
    const isValidChromosome = chr => !isNaN(chr) && chr >= 1 && chr <= 22;
    const isValidPValue = p => isNaN(p) || p === null || p === undefined || p < 0 || p > 1;
    const isValidRange = (chr, pos) => pos >= 0 && pos < ranges[+chr - 1].bp_max;
    const validateParams = ({ chromosome, position, p_value }, msg) => {
        if (!isValidChromosome(chromosome)) {
            errorLog.write(`[CHROMOSOME ERROR ON LINE ${lineCount}]: ${msg}`);
            return false;
        }
        if (!isValidPValue(p_value)) {
            errorLog.write(`[P-VALUE ERROR ON LINE ${lineCount}]: ${msg}`);
            return false;
        }
        if (!isValidRange(chromosome, position)) {
            errorLog.write(`[RANGE ERROR ON LINE ${lineCount}]: ${msg}`);
            return false;
        }
        return true;
    }

    const results = await connection.execute(`
        INSERT INTO ${variantTable} SELECT
            null,
            "${gender}",
            chromosome,
            position,
            snp,
            allele_reference,
            allele_effect,
            p_value,
            p_value_expected,
            p_value_nlog,
            p_value_r,
            odds_ratio,
            odds_ratio_r,
            n,
            q,
            i,
            show_qq_plot,
        FROM ${stageTable}
        ORDER BY gender, chromosome, p_value_nlog, position;
    `);
    const totalCount = results.affectedRows;
    const lastId = pluck(await connection.execute(`SELECT LAST_INSERT_ID()`));
    const firstId = lastId - totalCount;

    // store aggregate table for variants
    console.log(`[${duration()} s] Storing summary...`);
    await connection.execute(`
        INSERT INTO ${aggregateTable} SELECT DISTINCT
            chromosome,
            position_abs_aggregate as position_abs,
            p_value_nlog_aggregate as p_value_nlog
        FROM ${stageTable};
    `);

    /*

    // calculating lambdaGC (eg: lambdagc_male)
    console.log(`[${duration()} s] Calculating lambdaGC value...`);
    const pMedian  = getMedian(connection, variantTable, 'p_value', {gender});
    const lambdaGC = getLambdaGC(pMedian);
    await connection.execute(`
            INSERT INTO ${variantTable}
                (phenotype_id, lambdaGC)
            VALUES
                (:phenotypeId, :lambdaGC)
            ON DUPLICATE KEY UPDATE
                lambdaGC = :lambdaGC
    `, {phenotypeId, lambdaGC})

    // updating variants table with expected nlog_p values
    console.log(`[${duration()} s] Updating expected p-values...`);
    const updateExpectedPValues = await connection.prepare(`
        UPDATE ${variantTable}
        SET p_value_expected = :expected
        WHERE variant_id = :id
    `);

    const expectedPValues = ppoints(totalCount);
    for (let i = 0; i < totalCount; i++) {
        await updateExpectedPValues.execute({
            id: firstId + i,
            expected: expectedPValues[totalCount - i - 1]
        });
    }
    updateExpectedPValues.close();

    // updating variants table with Q-Q plot flag
    console.log(`[${duration()} s] Updating plot_qq values...`);
    const updateQQPlotIntervals = await connection.prepare(`
        UPDATE ${variantTable}
        SET show_qq_plot = 1
        WHERE id = :id
    `);

    const qqPlotIntervals = getIntervals(totalCount, 10000);
    for (let id of qqPlotIntervals) {
        await updateQQPlotIntervals.execute({
            id: firstId + id
        });
    }
    updateQQPlotIntervals.close();

    */

    // drop staging table
    connection.execute(`DELETE FROM ${stageTable}`);

    // log imported variants
    connection.execute(`
        INSERT INTO import_log
            (phenotype_id, variants_provided, variants_imported, created_date)
        VALUES
            (:phenotypeId, :lineCount, :totalCount, NOW())`,
        {phenotypeId, lineCount, totalCount}
    );

    // enable indexes
    console.log(`[${duration()} s] Indexing database...`);
    await connection.execute(`ALTER TABLE ${variantTable} ENABLE KEYS`);
    await connection.execute(`ALTER TABLE ${aggregateTable} ENABLE KEYS`);
    await connection.execute(`COMMIT`);
    console.log(`[${duration()} s] Created database`);
    await connection.end();

    /*

    reader.on('line', async line => {
        // trim, split by spaces, and parse 'NA' as null
        const values = parseLine(line);
        const params = mapToSchema(values);
        const { chromosome, position, p_value } = params;

        // validate line (chromosome, position, and p-value)
        if (++lineCount === 0 || !validateParams(params, line)) return;

        // group base pairs
        params.position_aggregate = group(position, 10**6);

        // calculate -log10(p) and group its values
        params.p_value_nlog = p_value ? -Math.log10(p_value) : null;
        params.p_value_nlog_aggregate = group(params.p_value_nlog, 10**-2);

        // determine absolute position of variant relative to the start of the genome
        if (chromsome !== previousChromosome) {
            previousChromosome = chromsome;
            positionOffset = chromosome > 1
                ? ranges[chromosome - 1].abs_position_min
                : 0;
        }

        // store the absolute BP and group by megabases
        params.position_abs = positionOffset + position;
        params.position_abs_aggregate = group(params.position_abs, 10**6);

        // initialize plot_qq to false
        params.show_qq_plot = false;

        // initiaize expected_p to 0
        params.p_value_expected = 0;

        await insert.execute(params);

        // show progress message every 10000 rows
        if (lineCount % 10000 === 0)
            console.log(`[${duration()} s] Read ${lineCount} rows`);
    });

*/
    reader.on('close', async () => {
        console.log(`[${duration()} s] Storing variants...`);
    });
}

const fs = require('fs');
const mysql = require('mysql2');
const ranges = require('../json/chromosome_ranges.json');
const { database } = require('../../server/config.json');


// retrieve arguments
const argv = process.argv.slice(2);
if (argv.length !== 4 || argv.includes('-h')) {
    console.log(`USAGE: node import.js input.meta phenotype schema[ewing/melanoma/renal_cell_carcinoma] gender[all/female/male]`)
    process.exit(0);
}

// parse arguments and set defaults
const [ inputFilePath, phenotype, schema, gender ] = argv;
const {columns, mapToSchema} = require(`./schema-maps/${schema}.js`);
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
    const stageTable = `${phenotype}_stage`;
    const variantTable = `${phenotype}_variant`;
    const aggregateTable = `${phenotype}_aggregate`;
    const isValidPValue = p => isNaN(p) || p === null || p === undefined || p < 0 || p > 1;

    await connection.execute(`START TRANSACTION`);
    await connection.execute(`SET autocommit = 0`);

    // execute schema script for new databases
    if (!await tableExists(connection, database.name, variantTable)) {
        console.log(`[${getDuration()} s] Creating [${variantTable}, ${aggregateTable}])...`);
        const ddl = readFile('variant-schema.sql').replace('$PHENOTYPE', phenotype);
        connection.execute(ddl);
    }

    // prepare statement to insert into staging table
    const insert = await connection.prepare(`
        INSERT INTO ${stageTable} VALUES (
            :gender,
            :chromosome,
            :position,
            :snp,
            :allele_reference,
            :allele_effect,
            :n,
            :p_value,
            :p_value_expected,
            :p_value_nlog,
            :p_value_r,
            :odds_ratio,
            :odds_ratio_r,
            :q,
            :i,
            :show_qq_plot
        );
    `);

    let count = 0;
    let previousChromosome = 1;
    let positionOffset = 0;

    reader.on('line', async line => {
        // trim, split by spaces, and parse 'NA' as null
        const values = parseLine(line);
        const params = mapToSchema(values);
        const {chromosome, position, p_value} = params;

        // validate line (not first line, p value not null or non-numeric)
        if (++count === 0 || !isValidPValue(p_value)) return;

        // group base pairs
        params.position_aggregate = group(position, 10**6);

        // calculate -log10(p) and group its values
        params.p_value_nlog = p ? -Math.log10(p_value) : null;
        params.p_value_nlog_aggregate = group(params.p_value_nlog, 10**-2);

        // determine absolute position of variant relative to the start of the genome
        if (chromsome != previousChromosome) {
            positionOffset = chromosome > 1
                ? ranges[chromosome - 2].max_bp_abs
                : 0;
            previousChromosome = chromsome;
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
        if (count % 10000 === 0)
            console.log(`[${duration()} s] Read ${count} rows`);
    });


    reader.on('close', async () => {

        // disable indexes
        await connection.execute(`ALTER TABLE ${variantTable} DISABLE KEYS`);
        await connection.execute(`ALTER TABLE ${aggregateTable} DISABLE KEYS`);

        console.log(`[${duration()} s] Storing variants...`);
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

        // todo: determine phenotype id
        const phenotypeId = 0;

        // store aggregate table for variants
        console.log(`[${duration()} s] Storing summary...`);
        await connection.execute(`
            INSERT INTO ${aggregateTable} SELECT DISTINCT
                chromosome,
                position_abs_aggregate as position_abs,
                p_value_nlog_aggregate as p_value_nlog
            FROM ${stageTable};
        `);

        // calculating lambdaGC (eg: lambdagc_male)
        console.log(`[${duration()} s] Calculating lambdaGC value...`);
        const pMedian = pluck(await connection.execute(`
            SELECT AVG(p) AS "median"
            FROM (
                SELECT "p_value"
                FROM ${variantTable}
                ORDER BY "p_value"
                LIMIT 2 - (SELECT COUNT(*) FROM ${variantTable}) % 2
                OFFSET (
                    SELECT (COUNT(*) - 1) / 2
                    FROM ${variantTable}
                )
            )
        `));
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
        const updateQQPlotIntervals = await db.prepare(`
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

        // drop staging table
        connection.execute(`DELETE FROM ${stageTable}`);

        // enable indexes
        console.log(`[${duration()} s] Indexing database...`);
        await connection.execute(`ALTER TABLE ${variantTable} ENABLE KEYS`);
        await connection.execute(`ALTER TABLE ${aggregateTable} ENABLE KEYS`);
        await connection.execute(`COMMIT`);
        console.log(`[${duration()} s] Created database`);
        await connection.end();
    });
}

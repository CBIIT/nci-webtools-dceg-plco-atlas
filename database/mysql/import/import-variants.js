const mysql = require('mysql2');
const args = require('minimist')(process.argv.slice(2));
const { database } = require('../../../server/config.json');
const { timestamp } = require('./utils/logging');
const { getRecords, pluck } = require('./utils/query');
const { getIntervals, getLambdaGC } = require('./utils/math');

// display help if needed
if (!(args.phenotype && args.gender)) {
    console.log(`USAGE: node import-variants.js
            --phenotype "phenotype name or id"
            --gender "all" | "female" | "male"`);
    process.exit(0);
}

// parse arguments and set defaults
const { phenotype, gender } = args;
//const errorLog = getLogStream(`./failed-variants-${new Date().toISOString()}.txt`);
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

// gender should be male, female, or all
if (!/^(all|female|male)$/.test(gender)) {
    console.error(`ERROR: Gender must be all, female, or male`);
    process.exit(1);
}

importVariants().then(e => {
    console.log(`[${duration()} s] Imported variants`);
    process.exit(0);
});

async function importVariants() {
    // find phenotypes either by name or id (if a numeric value was provided)
    const phenotypeKey = /^\d+$/.test(phenotype) ? 'id' : 'name';
    const phenotypes = await getRecords(connection, 'phenotype', {
        [phenotypeKey]: phenotype
    });

    if (phenotypes.length === 0) {
        console.error(`ERROR: Phenotype does not exist`)
        process.exit(1);
    }

    if (phenotypes.length > 1) {
        console.error(`ERROR: More than one phenotype was found with the same name. Please specify the phenotype id instead of the name.`)
        process.exit(1);
    }

    const phenotypeName = phenotypes[0].name;
    const phenotypeId = phenotypes[0].id;
    const phenotypePrefix = `${phenotypeName}_${phenotypeId}`;
    const variantTable = `${phenotypePrefix}_variant`;

    const [totalCountRows] = await connection.execute(`
        SELECT MIN(id) as firstId,
        COUNT(*) FROM ${variantTable}
        WHERE gender = :gender`,
        {gender}
    );
    const {firstId, totalCount} = totalCountRows[0];

    // updating variants table with Q-Q plot flag
    console.log(`[${duration()} s] Updating plot_qq values...`);
    const intervals = getIntervals(totalCount, 10000).map(i => i + firstId);
    await connection.query(`
        UPDATE ${variantTable}
        SET show_qq_plot = 1
        WHERE id IN (${intervals})
    `);

    // calculating lambdaGC (eg: lambdagc_male)
    // note: statement needed to be rewritten for mysql
    // lambdagc_ewing|1.036
    // lambdagc_rcc|1.029
    // lambdagc_mel|0.83
    console.log(`[${duration()} s] Calculating lambdaGC value...`);
    const [medianRows] = await connection.query(`
        CREATE TEMPORARY TABLE variant_median (
            id INTEGER NOT NULL AUTO_INCREMENT PRIMARY KEY,
            p_value double
        )
            SELECT p_value
            FROM ${variantTable}
            WHERE gender = '${gender}'
            ORDER BY p_value;

        set @count = (SELECT count(*) FROM variant_median);
        set @midpoint = (SELECT CEIL(@count / 2));
        set @midpoint_offset = (SELECT @count % 2);

        SELECT AVG(p_value) FROM variant_median
            WHERE id IN (@midpoint, 1 + @midpoint - @midpoint_offset);
    `);
    const pMedian = pluck(medianRows.pop()); // get last result set
    const lambdaGC = getLambdaGC(pMedian);
    await connection.execute(`
        INSERT INTO phenotype_metadata (phenotype_id, gender, lambda_gc)
        VALUES (:phenotypeId, :gender, :lambdaGC)
        ON DUPLICATE KEY UPDATE
            lambda_gc = :lambdaGC
    `, {phenotypeId, gender, lambdaGC});

    // log imported variants
    connection.execute(`
        UPDATE phenotype SET
            import_count = :totalCount,
            import_date = NOW()
        WHERE
            id = :phenotypeId`,
        {phenotypeId, totalCount}
    );

    return await connection.end();
}

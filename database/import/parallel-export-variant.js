const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const mysql = require('mysql2');
const sqlite = require('better-sqlite3');
const parseCsv = require('csv-parse/lib/sync')
const { database } = require('../../server/config.json');
const { timestamp } = require('./utils/logging');
const { getLambdaGC } = require('./utils/math');
const { getRecords, pluck } = require('./utils/query');
const args = require('minimist')(process.argv.slice(2));

/**
lambdagc_ewing|1.036
lambdagc_rcc|1.029
lambdagc_mel|0.83
*/

// display help if needed
if (!(args.file && args.phenotype && args.sex)) {
    console.log(`USAGE: node export-variants.js 
        --sqlite "./sqlite3"
        --file "filepath"
        --phenotype_file "raw/phenotype.csv"
        --phenotype "test_melanoma" or 10002
        --sex "all"
        --validate`);
    process.exit(0);
}

// parse arguments and set defaults
const {sqlite: sqlite3, file, phenotype_file: phenotypeFile, phenotype, sex, validate } = args;
const sqlitePath = sqlite3 || 'sqlite3';
const phenotypeFilePath = phenotypeFile || 'raw/phenotype.csv';

const inputFilePath = path.resolve(file);
const phenotypePath = path.resolve(phenotypeFilePath);

//const errorLog = getLogStream(`./failed-variants-${new Date().toISOString()}.txt`);
const errorLog = {write: e => console.log(e)};
const getTimestamp = timestamp({includePreviousTime: true});
const processArgs = args => args.map(arg => ` "${arg.replace(/\n/g, ' ')}"`).join(``);
const duration = () => {
    // shows total elapsed time, as well as elapsed time since previous step
    let [current, previous] = getTimestamp();
    return `${current}, +${previous}`
}

// input file should exist
if (!fs.existsSync(inputFilePath)) {
    console.error(`ERROR: ${inputFilePath} does not exist.`);
    process.exit(1);
}

// sex should be male, female, or all
if (!/^(all|female|male)$/.test(sex)) {
    console.error(`ERROR: Sex must be all, female, or male`);
    process.exit(1);
}

if (validate && !fs.existsSync(phenotypePath)) {
    console.error(`ERROR: ${phenotypePath} does not exist.`);
    process.exit(1);
}

if (!validate && !/^\d+$/.test(phenotype)) {
    console.error(`ERROR: Association names must be validated. Please use the --validate flag.`);
    process.exit(1);
}


(function main() {
    try {
        let phenotypeId = validate
            ? validatePhenotype(phenotypePath, phenotype).id
            : phenotype;

        exportVariants({
            sqlitePath,
            inputFilePath,
            phenotypeId,
            sex,
        });

        process.exit(0);
    }
    catch (e) {
        console.error(e);
        process.exit(1);
    }
})();

// validates a phenotype by name or id and returns both if found
function validatePhenotype(phenotypePath, phenotype) {
    // if a numeric phenotype was provided, assume we're looking up by id
    // otherwise, look up phenotype by association name
    const phenotypeKey = /^\d+$/.test(phenotype) ? 'id' : 'name';

    // read the phenotypes file and attempt to find the specified phenotype
    const phenotypes = parseCsv(    
        fs.readFileSync(phenotypePath),
        {columns: ['id', 'parent_id', 'display_name', 'name', 'description', 'type']}
    ).filter(p => p[phenotypeKey] == phenotype);
    
    if (phenotypes.length === 0) {
        throw(`Phenotype does not exist`);
    }

    if (phenotypes.length > 1) {
        throw(`More than one phenotype was found with the same name. Please specify the phenotype id instead of the name.`)
    }

    return phenotypes[0];
}

function exportVariants({
    sqlitePath,
    inputFilePath,
    phenotypeId,
    sex,
}) {
    const inputDirectory = path.dirname(inputFilePath);
    const databaseFilePath = path.resolve(inputDirectory, `${phenotypeId}.${sex}.db`);
    const exportVariantFilePath = path.resolve(inputDirectory, `${phenotypeId}.${sex}.variant.csv`);
    const exportAggregateFilePath = path.resolve(inputDirectory, `${phenotypeId}.${sex}.aggregate.csv`);
    const exportMetadataFilePath = path.resolve(inputDirectory, `${phenotypeId}.${sex}.metadata.csv`);
    const idPrefix = [null, 'all', 'female', 'male'].indexOf(sex) 
        + phenotypeId.toString().padStart(5, '0');

    // delete any existing output filepaths
    for (let filepath of [
        databaseFilePath, 
        exportVariantFilePath,
        exportAggregateFilePath,
        exportMetadataFilePath
    ]) {
        if (fs.existsSync(filepath)) {
            console.warn(`WARNING: ${filepath} will be deleted.`);
            fs.unlinkSync(filepath);
        }
    }

    // add user-defined functions
    const db = new sqlite(databaseFilePath);
    db.function('LOG10', {deterministic: true}, v => Math.log10(v));
    db.function('POW', {deterministic: true}, (base, exp) => Math.pow(base, exp));
    
    db.exec(`
        -- set up chromosome ranges
        CREATE TABLE chromosome_range (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            chromosome VARCHAR(2),
            position_min BIGINT NOT NULL,
            position_max BIGINT NOT NULL,
            position_min_abs BIGINT NOT NULL,
            position_max_abs BIGINT NOT NULL
        );
    
        INSERT INTO chromosome_range (
            chromosome,
            position_min,
            position_max,
            position_min_abs,
            position_max_abs
        ) VALUES
            ('1', 0, 249698942, 0, 249698942),
            ('2', 0, 242508799, 249698942, 492207741),
            ('3', 0, 198450956, 492207741, 690658697),
            ('4', 0, 190424264, 690658697, 881082961),
            ('5', 0, 181630948, 881082961, 1062713909),
            ('6', 0, 170805979, 1062713909, 1233519888),
            ('7', 0, 159345973, 1233519888, 1392865861),
            ('8', 0, 145138636, 1392865861, 1538004497),
            ('9', 0, 138688728, 1538004497, 1676693225),
            ('10', 0, 133797422, 1676693225, 1810490647),
            ('11', 0, 135186938, 1810490647, 1945677585),
            ('12', 0, 133275309, 1945677585, 2078952894),
            ('13', 0, 114364328, 2078952894, 2193317222),
            ('14', 0, 108136338, 2193317222, 2301453560),
            ('15', 0, 102439437, 2301453560, 2403892997),
            ('16', 0, 92211104, 2403892997, 2496104101),
            ('17', 0, 83836422, 2496104101, 2579940523),
            ('18', 0, 80373285, 2579940523, 2660313808),
            ('19', 0, 58617616, 2660313808, 2718931424),
            ('20', 0, 64444167, 2718931424, 2783375591),
            ('21', 0, 46709983, 2783375591, 2830085574),
            ('22', 0, 51857516, 2830085574, 2881943090),
            ('X', 0, 156040895, 2881943090, 3037983985),
            ('Y', 0, 57264655, 3037983985, 3095248640);
        
        -- create prestage table for importing raw variants
        CREATE TABLE prestage (
            chromosome              VARCHAR(2),
            position                BIGINT,
            snp                     VARCHAR(200),
            allele_reference        VARCHAR(200),
            allele_alternate        VARCHAR(200),
            p_value                 DOUBLE,
            p_value_r               DOUBLE,
            odds_ratio              DOUBLE,
            odds_ratio_r            DOUBLE,
            n                       BIGINT,
            q                       DOUBLE,
            i                       DOUBLE 
        );
    
        -- create stage table for sorted/filtered variants
        CREATE TABLE stage (
            chromosome              VARCHAR(2),
            position                BIGINT,
            position_abs_aggregate  BIGINT,
            snp                     VARCHAR(200),
            allele_reference        VARCHAR(200),
            allele_alternate        VARCHAR(200),
            p_value                 DOUBLE,
            p_value_nlog            DOUBLE, -- negative log10(P)
            p_value_nlog_aggregate  DOUBLE, -- -log10(p) grouped by 1e-2
            p_value_nlog_expected   DOUBLE, -- expected negative log10(P)
            p_value_r               DOUBLE,
            odds_ratio              DOUBLE,
            odds_ratio_r            DOUBLE,
            n                       BIGINT,
            q                       DOUBLE,
            i                       DOUBLE,
            show_qq_plot            BOOLEAN
        );
    `);
    
    // load data into prestaging table
    console.log(`.mode csv .import ${inputFilePath} prestage`);
    console.log(`[${duration()} s] Loading data into stage table...`);
    const importStatus = execSync(sqlitePath + processArgs([
        databaseFilePath,
        `.mode csv`,
        `.import '${inputFilePath}' prestage`
    ]));

    // show full import status if needed
    console.log("importStatus", 
        importStatus, 
        importStatus.stdout ? importStatus.stdout.toString() : "Success", 
        importStatus.stderr ? importStatus.stderr.toString() : "Success");
    
    console.log(`[${duration()} s] Beginning transaction...`);
    db.exec(`BEGIN TRANSACTION`);
    
    // filter/sort prestage variants into stage table
    console.log(`[${duration()} s] Filtering and ordering variants...`);
    const results = db.exec(`
        INSERT INTO stage (
            chromosome,
            position,
            position_abs_aggregate,
            snp,
            allele_reference,
            allele_alternate,
            p_value,
            p_value_nlog,
            p_value_nlog_aggregate,
            p_value_r,
            odds_ratio,
            odds_ratio_r,
            n,
            q,
            i  
        ) 
        SELECT 
            p.chromosome,
            p.position,
            1e6 * cast(1e-6 * (p.position + cr.position_min_abs) as int) as position_abs_aggregate,
            p.snp,
            p.allele_reference,
            p.allele_alternate,
            p.p_value,
            -LOG10(p.p_value) AS p_value_nlog,
            1e-2 * cast(1e2 * -LOG10(p.p_value) as int) AS p_value_nlog_aggregate,
            p.p_value_r,
            p.odds_ratio,
            p.odds_ratio_r,
            p.n,
            p.q,
            p.i
        FROM prestage p
        INNER JOIN chromosome_range cr ON cr.chromosome = p.chromosome
        ORDER BY p_value;
    `);
    console.log(`[${duration()} s] Done`);
    
    // determine count
    const count = db.prepare(`SELECT last_insert_rowid()`).pluck().get();
    console.log(`[${duration()} s] Finished loading ${count} records into stage table...`);
    
    // determine median and lambda gc
    console.log(`[${duration()} s] Determining lambdagc...`);
    const medianRowIds = count % 2 === 0 
        ? [Math.floor(count / 2), Math.ceil(count / 2)] 
        : [Math.ceil(count / 2)];
    const placeholders = medianRowIds.map(m => '?').join(',');
    const median = db
        .prepare(`SELECT AVG(p_value) FROM stage WHERE rowid IN (${placeholders})`)
        .pluck()
        .get(medianRowIds);
    
    const lambdaGC = getLambdaGC(median);
    console.log(`[${duration()} s] Done`);
    // console.log(`[${duration()} s] Median/LambdaGC ${{median, lambdaGC}}`);
    
    // calculate the show_qq_plot flag using -x^2, using rowid as the index parameter
    const numPoints = 5000;
    console.log(`[${duration()} s] Determining show_qq_plot flag for ${numPoints} points...`);
    db.prepare(`
        WITH ids as (
            SELECT ${count} - ROUND(${count} * (1 - POW(CAST(rowid as double) / ${numPoints} - 1, 2)))
            FROM stage WHERE rowid <= ${numPoints}
        ) UPDATE stage SET
            show_qq_plot = 1
            WHERE rowid IN (SELECT * FROM ids);
    `).run();
    console.log(`[${duration()} s] Done`);
    
    // updated expected -log10(p) values based on ppoints function
    console.log(`[${duration()} s] Updating expected -log10(p) values...`);
    db.prepare(`UPDATE stage SET p_value_nlog_expected = -LOG10((rowid - 0.5) / ${count})`).run();
    console.log(`[${duration()} s] Done`);
    
    // commit changes and close database
    console.log(`[${duration()} s] Committing changes...`);
    db.exec(`COMMIT`);
    console.log(`[${duration()} s] Done`);
    db.close();
    
    console.log(`[${duration()} s] Finished setting up stage table, exporting variants to ${exportVariantFilePath}...`);
    const exportVariantStatus = execSync(sqlitePath + processArgs([
        databaseFilePath,
        `.mode csv`,
        `.headers on`,
        `.output '${exportVariantFilePath}'`,
        `SELECT 
            ${idPrefix} || ROW_NUMBER () OVER (
                ORDER BY cr.rowid, s.p_value
            ) as id, 
            ${phenotypeId} as phenotype_id, 
            '${sex}' as sex, 
            s.chromosome, 
            s.position, 
            s.snp, 
            s.allele_reference, 
            s.allele_alternate, 
            s.p_value, s.p_value_nlog, 
            s.p_value_nlog_expected, 
            s.p_value_r, 
            s.odds_ratio, 
            s.odds_ratio_r, 
            s.n, s.q, 
            s.i, 
            s.show_qq_plot 
        FROM stage s 
        JOIN chromosome_range cr ON s.chromosome = cr.chromosome 
        ORDER BY cr.rowid, s.p_value`
    ]));

    console.log("exportVariantStatus", exportVariantStatus, 
        exportVariantStatus.stdout ? exportVariantStatus.stdout.toString() : "Success", 
        exportVariantStatus.stderr ? exportVariantStatus.stderr.toString() : "Success");
    
    console.log(`[${duration()} s] Exporting aggregated variants to ${exportAggregateFilePath}...`);
    const exportAggregateStatus = execSync(sqlitePath + processArgs([
        databaseFilePath,
        `.mode csv`,
        `.headers on`,
        `.output '${exportAggregateFilePath}'`,
        `SELECT 
            DISTINCT ${idPrefix} || ROW_NUMBER () OVER (
                ORDER BY cr.rowid, s.p_value_nlog_aggregate
            ) as id, 
            ${phenotypeId} as phenotype_id, 
            '${sex}' as sex, 
            s.chromosome, 
            s.position_abs_aggregate as position_abs, 
            s.p_value_nlog_aggregate as p_value_nlog 
        FROM stage s 
        JOIN chromosome_range cr ON s.chromosome = cr.chromosome 
        ORDER BY cr.rowid, p_value_nlog`
    ]));
    console.log("exportAggregateStatus", exportAggregateStatus, 
        exportAggregateStatus.stdout ? exportAggregateStatus.stdout.toString() : "Success", 
        exportAggregateStatus.stderr ? exportAggregateStatus.stderr.toString() : "Success");
    
    console.log(`[${duration()} s] Exporting variant metadata to ${exportMetadataFilePath}...`);
    const exportMetadataStatus = execSync(sqlitePath + processArgs([
        databaseFilePath,
        `.mode csv`,
        `.output '${exportMetadataFilePath}'`,
        `.headers on`,
        `SELECT 
            ${phenotypeId} as phenotype_id, 
            '${sex}' as sex, 
            'all' as chromosome, 
            ${lambdaGC} as lambda_gc, 
            ${count} as count`,
        `.headers off`,
        `SELECT 
            DISTINCT ${phenotypeId} as phenotype_id, 
            '${sex}' as sex, 
            s.chromosome as chromosome, 
            null as lambda_gc, 
            count(*) as count 
        FROM stage s 
        JOIN chromosome_range cr ON s.chromosome = cr.chromosome 
        GROUP BY s.chromosome 
        ORDER BY cr.rowid`
    ]));
    console.log("exportMetadataStatus", exportMetadataStatus, 
        exportMetadataStatus.stdout ? exportMetadataStatus.stdout.toString() : "Success", 
        exportAggregateStatus.stderr ? exportAggregateStatus.stderr.toString() : "Success");
    
    console.log([
        `[${duration()} s] Finished exporting, generated the following files:`,
        exportVariantFilePath, 
        exportAggregateFilePath, 
        exportMetadataFilePath
    ].join('\n'));

    return {
        exportVariantFilePath, 
        exportAggregateFilePath, 
        exportMetadataFilePath        
    };
}


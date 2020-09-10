const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const sqlite = require('better-sqlite3');
const parseCsv = require('csv-parse/lib/sync')
const { timestamp } = require('./utils/logging');
const { getLambdaGC } = require('./utils/math');
const args = require('minimist')(process.argv.slice(2));
const log4js = require("log4js");


/**
lambdagc_ewing|1.036
lambdagc_rcc|1.029
lambdagc_mel|0.83
*/

// display help if needed
if (!(args.file) || !(args.output) || !(args.logdir)) {
    console.log(`USAGE: node export-variants.js 
        --sqlite "./sqlite3" [OPTIONAL, use PATH by default]
        --file "phenotype.sex.csv" [REQUIRED]
        --phenotype_file "raw/phenotype.csv" [OPTIONAL, use raw/phenotype.csv by default]
        --phenotype "test_melanoma" or 10002 [OPTIONAL, use filename by default]
        --validate [REQUIRED only if phenotype name is used as identifier]
        --output "../raw/output" [REQUIRED]
        --logdir "./" [REQUIRED]
        --tmp "/lscratch/\$SLURM_JOB_ID" [OPTIONAL, use output filepath by default]
    `);
    process.exit(0);
}

// parse arguments and set defaults
let {sqlite: sqlite3, file, phenotype_file: phenotypeFile, phenotype, sex, validate, output, logdir, tmp } = args;
const sqlitePath = sqlite3 || 'sqlite3';
const phenotypeFilePath = phenotypeFile || '../raw/phenotype.csv';

let inputFilePath = path.resolve(file);
const filename = path.basename(inputFilePath);
const outputFilePath = path.resolve(output);
const logpath = path.resolve(logdir);
const tmpFilePath = tmp ? path.resolve(tmp) : outputFilePath;

const phenotypePath = path.resolve(phenotypeFilePath);
let [fileNamePhenotype] = filename.split('.');
if (!phenotype) phenotype = fileNamePhenotype;

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

if (validate && !fs.existsSync(phenotypePath)) {
    console.error(`ERROR: ${phenotypePath} does not exist.`);
    process.exit(1);
}

if (!validate && !/^\d+$/.test(phenotype)) {
    console.error(`ERROR: Association names must be validated. Please use the --validate flag.`);
    process.exit(1);
}

const fileExtension = path.extname(inputFilePath);
// if input file is compressed, copy to tmpFilePath and unzip
// change inputFilePath to unzipped file path
if (/^(.gz)$/.test(fileExtension)) {
    const zippedFileDest = path.resolve(tmpFilePath, filename);
    const unzippedFileDest = zippedFileDest.slice(0, -3);

    if (fs.existsSync(unzippedFileDest)) {
        console.warn(`WARNING: File already exists. ${unzippedFileDest} will be deleted.`);
        fs.unlinkSync(unzippedFileDest);
    }

    console.log(`[${duration()} s] Copying zipped data file to ${zippedFileDest}...`);
    fs.copyFileSync(inputFilePath, zippedFileDest);
    console.log(`[${duration()} s] Done`);

    console.log(`[${duration()} s] Unzipping...`);
    try {
        const decompressStatus = execSync(`gzip -d ${zippedFileDest}`);
        // show full decompress status if needed
        console.log("decompressStatus", 
            decompressStatus, 
            decompressStatus.stdout ? decompressStatus.stdout.toString() : "No STDOUT", 
            decompressStatus.stderr ? decompressStatus.stderr.toString() : "No STDERR");
    } catch (err) {
        console.log(err);
    }

    console.log(`[${duration()} s] Done`);

    inputFilePath = unzippedFileDest;
}

(async function main() {
    
    try {
        await exportVariants({
            sqlitePath,
            inputFilePath,
            outputFilePath,
            logpath,
            tmpFilePath,
            phenotype: validatePhenotype(
                phenotypePath, 
                phenotype
            )
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
        {columns: ['id', 'parent_id', 'display_name', 'name', 'description', 'type', 'age']}
    ).filter(p => p[phenotypeKey] == phenotype.toLowerCase());
    
    if (phenotypes.length === 0) {
        throw(`Phenotype does not exist`);
    }

    if (phenotypes.length > 1) {
        throw(`More than one phenotype was found with the same name. Please specify the phenotype id instead of the name.`)
    }

    return phenotypes[0];
}

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

async function exportVariants({
    sqlitePath,
    inputFilePath,
    outputFilePath,
    logpath,
    tmpFilePath,
    phenotype,
}) {
    // const inputDirectory = path.dirname(inputFilePath);
    // const outputDirectory = path.dirname(outputFilePath);
    const phenotypeId = phenotype.id;
    const databaseFilePath = path.resolve(tmpFilePath, `${phenotypeId}.db`);
    const calculateOddsRatio = phenotype.type === 'binary';

    if (fs.existsSync(databaseFilePath))
        fs.unlinkSync(databaseFilePath)

    // helper function to get distinct values from an array
    const distinct = array => array.reduce((acc, curr) => 
        !acc.includes(curr) ? acc.concat([curr]) : acc, 
        []
    );
    const firstLine = await getFirstLine(inputFilePath);

    // determine ancestry/sex of stratified columns
    const stratifiedColumns = firstLine.split(/\s+/g)
        .filter(originalColumName => !['chr', 'pos', 'snp', 'tested_allele', 'other_allele'].includes(originalColumName.toLowerCase()))
        .map(originalColumName => {
            let [columnName, ...ancestrySex] = originalColumName.split('_');
            let sex = ancestrySex[ancestrySex.length - 1];
            let ancestry = ancestrySex.slice(0, ancestrySex.length - 1).join('_');
            if (!/^(all|female|male)$/.test(sex)) {
                sex = null
                ancestry = ancestrySex.join('_');
            }
            if (sex) sex = sex.toLowerCase()
            if (ancestry) ancestry = ancestry.toLowerCase();
            const mappedColumnName = [
                sex, 
                ancestry, 
                {
                    freq: `allele_reference_frequency`, 
                    beta: `beta`,
                    se: `standard_error`,
                    p: `p_value`,
                    n: `n`,
                    phet: `p_value_heterogenous`,
                }[columnName.toLowerCase()]
            ].filter(Boolean).join('_')
            return {originalColumName, columnName, mappedColumnName, ancestry, sex}
        });

    // define ancestry and sex values
    let ancestries = distinct(stratifiedColumns.map(c => c.ancestry)).filter(Boolean).map(e => e.toLowerCase());
    let sexes = distinct(stratifiedColumns.map(c => c.sex)).filter(Boolean).map(e => e.toLowerCase());

    // add user-defined functions
    const db = new sqlite(databaseFilePath, {verbose: console.log});
    db.function('LOG10', {deterministic: true}, v => Math.log10(v));
    db.function('POW', {deterministic: true}, (base, exp) => Math.pow(base, exp));
    db.function('EXP', {deterministic: true}, (exp) => Math.pow(Math.E, exp));
    
    try {
        db.exec(`
            -- set up chromosome ranges
            DROP TABLE IF EXISTS chromosome_range;
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
            DROP TABLE IF EXISTS prestage;
            CREATE TABLE prestage (
                chromosome                  VARCHAR(2),
                position                    BIGINT,
                snp                         VARCHAR(200),
                allele_reference            VARCHAR(200),
                allele_alternate            VARCHAR(200),
                ${stratifiedColumns.map(c => `${c.mappedColumnName} DOUBLE`).join(',')}
            );
        `);
    } catch (err) {
        console.log(err);
    }

    
    // load data into prestaging table
    // console.log(`.mode csv .import ${inputFilePath} prestage`);
    console.log(`[${duration()} s] Loading data into prestage table...`);
    try {
        const importStatus = execSync(sqlitePath + processArgs([
            databaseFilePath,
            `.mode csv`,
            `.separator '\t'`,
            `.import '${inputFilePath}' prestage`,
            `delete from prestage where chromosome = 'CHR'`
        ]));
    } catch (err) {
        console.log(err);
    }
    

    // create table for each ancestry/sex combo
    for (let sex of sexes) {
        for (let ancestry of ancestries) {
        
            // log4js.configure({
            //     appenders: [
            //         { 
            //             type: "file", 
            //             filename: path.resolve(logpath, `${phenotype.name}.${sex}.${ancestry}.log`),
            //             category: "stratification"
            //         } 
            //     ],
            //     levels: {
            //         "stratification": "debug"
            //     }
            //     // categories: { default: { appenders: ["cheese"], level: "debug" } }
            //   });
            log4js.configure({
                appenders: { 
                    stratification: { 
                        type: "file", 
                        filename: path.resolve(logpath, `${phenotype.name}.${sex}.${ancestry}.log`) 
                    } 
                },
                categories: { 
                    default: { 
                        appenders: ["stratification"], 
                        level: "debug" 
                    } 
                }
            });
              
            const logger = log4js.getLogger("stratification");
            // Overide console.log console.debug
            console.log = (msg) => logger.trace(msg);
            console.debug = (msg) => logger.trace(msg);
            logger.debug("Start script for " + phenotype.name + " - " + sex + " - " + ancestry);

            const additionalColumns = stratifiedColumns.filter(c => c.ancestry === ancestry && (c.sex === sex || c.sex === null));
            // do not continue if we are missing columns
            if (additionalColumns.length < 2) continue;

            const stageTableName = `stage_${sex}_${ancestry}`;
            const exportVariantFilePath = path.resolve(outputFilePath, `${phenotype.name}.${sex}.${ancestry}.variant.csv`);
            const exportAggregateFilePath = path.resolve(outputFilePath, `${phenotype.name}.${sex}.${ancestry}.aggregate.csv`);
            const exportMetadataFilePath = path.resolve(outputFilePath, `${phenotype.name}.${sex}.${ancestry}.metadata.csv`);
            const exportVariantTmpFilePath = path.resolve(tmpFilePath, `${phenotype.name}.${sex}.${ancestry}.variant.csv`);
            const exportAggregateTmpFilePath = path.resolve(tmpFilePath, `${phenotype.name}.${sex}.${ancestry}.aggregate.csv`);
            const exportMetadataTmpFilePath = path.resolve(tmpFilePath, `${phenotype.name}.${sex}.${ancestry}.metadata.csv`);
            const idPrefix = [null, 'all', 'female', 'male'].indexOf(sex) 
                + phenotypeId.toString().padStart(5, '0');

            try {
                db.exec(`
                    DROP TABLE IF EXISTS ${stageTableName};
                    CREATE TABLE ${stageTableName} (
                        chromosome                  VARCHAR(2),
                        position                    BIGINT,
                        position_abs                BIGINT,
                        snp                         VARCHAR(200),
                        allele_reference            VARCHAR(200),
                        allele_alternate            VARCHAR(200),
                        allele_reference_frequency  DOUBLE,
                        p_value                     DOUBLE,
                        p_value_nlog                DOUBLE, -- negative log10(P)
                        p_value_nlog_expected       DOUBLE, -- expected negative log10(P)
                        p_value_heterogenous        BIGINT,
                        beta                        DOUBLE,
                        standard_error              DOUBLE,
                        odds_ratio                  DOUBLE,
                        ci_95_low                   DOUBLE,
                        ci_95_high                  DOUBLE,
                        n                           BIGINT,
                        show_qq_plot                BOOLEAN
                    );
                `);
            } catch (err) {
                logger.error(err);
            }

            console.log(`[${duration()} s] [${sex}, ${ancestry}] Beginning transaction...`);
            try {
                db.exec(`BEGIN TRANSACTION`);
            } catch (err) {
                logger.error(err);
            }
            
            // filter/sort prestage variants into stage table
            console.log(`[${duration()} s] [${sex}, ${ancestry}] Filtering and ordering variants...`);
            try {
                db.exec(`
                    INSERT INTO ${stageTableName} (
                        chromosome,
                        position,
                        snp,
                        allele_reference,
                        allele_alternate,
                        allele_reference_frequency,
                        p_value,
                        p_value_nlog,
                        p_value_heterogenous,
                        beta,
                        standard_error,
                        odds_ratio,
                        ci_95_low,
                        ci_95_high,
                        n
                    ) 
                    SELECT 
                        p.chromosome,
                        p.position,
                        p.snp,
                        p.allele_reference,
                        p.allele_alternate,
                        p.${ancestry}_allele_reference_frequency,
                        p.${sex}_${ancestry}_p_value,
                        -LOG10(p.${sex}_${ancestry}_p_value) AS p_value_nlog,
                        p.${sex}_${ancestry}_p_value_heterogenous,
                        p.${sex}_${ancestry}_beta,
                        p.${sex}_${ancestry}_standard_error,
                        ${calculateOddsRatio ? `EXP(p.${sex}_${ancestry}_beta)` : `NULL` } as odds_ratio,
                        ${calculateOddsRatio ? `EXP(p.${sex}_${ancestry}_beta - 1.96 * p.${sex}_${ancestry}_standard_error)` : `NULL` } as ci_95_low,
                        ${calculateOddsRatio ? `EXP(p.${sex}_${ancestry}_beta + 1.96 * p.${sex}_${ancestry}_standard_error)` : `NULL` } as ci_95_high,
                        p.${sex}_${ancestry}_n
                    FROM prestage p
                    INNER JOIN chromosome_range cr ON cr.chromosome = p.chromosome
                    WHERE p.${sex}_${ancestry}_p_value != 'NA' 
                    AND p.position BETWEEN cr.position_min AND cr.position_max
                    ORDER BY ${sex}_${ancestry}_p_value;
                `);
            } catch (err) {
                logger.error(err);
            }
            
            console.log(`[${duration()} s] [${sex}, ${ancestry}] Done`);

            // ensure p-values that are essentially 0 are set the the correct value
            console.log(`[${duration()} s] [${sex}, ${ancestry}] Correcting for infinite -log10(p)`);
            try {
                db.exec(`
                    UPDATE ${stageTableName} 
                    SET p_value = 0, p_value_nlog = 0
                    WHERE p_value_nlog IN(9e999999, -9e999999)
                `);
            } catch (err) {
                logger.error(err);
            }
            
            // determine count
            let count;
            try {
                count = db.prepare(`SELECT last_insert_rowid()`).pluck().get();
            } catch (err) {
                logger.error(err);
            }
            
            console.log(`[${duration()} s] [${sex}, ${ancestry}] Finished loading ${count} records into stage table...`);
            
            // determine median and lambda gc
            console.log(`[${duration()} s] [${sex}, ${ancestry}] Determining lambdagc...`);
            const medianRowIds = count % 2 === 0 
                ? [Math.floor(count / 2), Math.ceil(count / 2)] 
                : [Math.ceil(count / 2)];
            const placeholders = medianRowIds.map(m => '?').join(',');
            let median;
            try {
                median = db
                .prepare(`SELECT AVG(p_value) FROM ${stageTableName} WHERE rowid IN (${placeholders})`)
                .pluck()
                .get(medianRowIds);
            } catch (err) {
                logger.error(err);
            }
            
            const lambdaGC = getLambdaGC(median);
            console.log(`[${duration()} s] [${sex}, ${ancestry}] Done`);
            // console.log(`[${duration()} s] [${sex}, ${ancestry}] Median/LambdaGC ${{median, lambdaGC}}`);
            
            // calculate the show_qq_plot flag using -x^2, using rowid as the index parameter
            const numPoints = 5000;
            console.log(`[${duration()} s] [${sex}, ${ancestry}] Determining show_qq_plot flag for ${numPoints} points...`);
            try {
                db.prepare(`
                    WITH ids as (
                        SELECT ${count} - ROUND(${count} * (1 - POW(CAST(rowid as double) / ${numPoints} - 1, 2)))
                        FROM ${stageTableName} WHERE rowid <= ${numPoints}
                    ) UPDATE ${stageTableName} SET
                        show_qq_plot = 1
                        WHERE rowid IN (SELECT * FROM ids);
                `).run();
            } catch (err) {
                logger.error(err);
            }
            
            console.log(`[${duration()} s] [${sex}, ${ancestry}] Done`);
            
            // update expected -log10(p) values based on ppoints function
            console.log(`[${duration()} s] [${sex}, ${ancestry}] Updating expected -log10(p) values...`);
            try {
                db.prepare(`UPDATE ${stageTableName} SET p_value_nlog_expected = -LOG10((rowid - 0.5) / ${count})`).run();
            } catch (err) {
                logger.error(err);
            }

            console.log(`[${duration()} s] [${sex}, ${ancestry}] Done`);            

            // get max(-log10(p))
            let maxPValueNlog;
            try {
                maxPValueNlog = db.prepare(`SELECT MAX(p_value_nlog) as max FROM ${stageTableName}`).pluck().get();
            } catch (err) {
                logger.error(err);
            }

            let maxPositionAbs;
            try {
                maxPositionAbs = db.prepare(`SELECT MAX(position_max_abs) as max FROM chromosome_range`).pluck().get();
            } catch (err) {
                logger.error(err);
            }
            
            const pValueNlogFactor = maxPValueNlog / 400;
            const positionFactor = maxPositionAbs / 800;

            // commit changes
            console.log(`[${duration()} s] [${sex}, ${ancestry}] Committing changes...`);
            try {
                db.exec(`COMMIT`);
            } catch (err) {
                logger.error(err);
            }

            console.log(`[${duration()} s] [${sex}, ${ancestry}] Finished setting up stage table, exporting variants to ${exportVariantTmpFilePath}...`);
            try {
                const exportVariantStatus = execSync(sqlitePath + processArgs([
                    databaseFilePath,
                    `.mode csv`,
                    `.headers on`,
                    `.output '${exportVariantTmpFilePath}'`,
                    `SELECT 
                        ${idPrefix} || ROW_NUMBER () OVER (
                            ORDER BY cr.rowid, s.p_value
                        ) as id, 
                        s.chromosome,
                        s.position,
                        s.snp,
                        s.allele_reference,
                        s.allele_alternate,
                        s.allele_reference_frequency,
                        s.p_value,
                        s.p_value_nlog,
                        s.p_value_nlog_expected,
                        s.p_value_heterogenous,
                        s.beta,
                        s.standard_error,
                        s.odds_ratio,
                        s.ci_95_low,
                        s.ci_95_high,
                        s.n,
                        s.show_qq_plot 
                    FROM ${stageTableName} s 
                    JOIN chromosome_range cr ON s.chromosome = cr.chromosome 
                    ORDER BY cr.rowid, s.p_value`
                ]));
                console.log("exportVariantStatus", String(exportVariantStatus), 
                    exportVariantStatus.stdout ? exportVariantStatus.stdout.toString() : "No STDOUT", 
                    exportVariantStatus.stderr ? exportVariantStatus.stderr.toString() : "No STDERR");
            } catch (err) {
                logger.error(err);
            }
            
            console.log(`[${duration()} s] [${sex}, ${ancestry}] Exporting aggregated variants to ${exportAggregateTmpFilePath}...`);
            try {
                const exportAggregateStatus = execSync(sqlitePath + processArgs([
                    databaseFilePath,
                    `.mode csv`,
                    `.headers on`,
                    `.output '${exportAggregateTmpFilePath}'`,
                    `SELECT DISTINCT
                        ${phenotypeId} as phenotype_id, 
                        '${sex}' as sex, 
                        '${ancestry}' as ancestry, 
                        s.chromosome, 
                        ${positionFactor} * cast((s.position + cr.position_min_abs) / ${positionFactor} as int) as position_abs,
                        ${pValueNlogFactor} * cast(s.p_value_nlog / ${pValueNlogFactor} as int) as p_value_nlog
                    FROM ${stageTableName} s 
                    JOIN chromosome_range cr ON s.chromosome = cr.chromosome 
                    ORDER BY p_value_nlog`
                ])); 
                console.log("exportAggregateStatus", String(exportAggregateStatus), 
                    exportAggregateStatus.stdout ? exportAggregateStatus.stdout.toString() : "No STDOUT", 
                    exportAggregateStatus.stderr ? exportAggregateStatus.stderr.toString() : "No STDERR");
            } catch (err) {
                logger.error(err);
            }
            
            console.log(`[${duration()} s] [${sex}, ${ancestry}] Exporting variant metadata to ${exportMetadataTmpFilePath}...`);
            try {
                const exportMetadataStatus = execSync(sqlitePath + processArgs([
                    databaseFilePath,
                    `.mode csv`,
                    `.output '${exportMetadataTmpFilePath}'`,
                    `.headers on`,
                    `SELECT 
                        ${phenotypeId} as phenotype_id, 
                        '${sex}' as sex, 
                        '${ancestry}' as ancestry, 
                        'all' as chromosome, 
                        ${lambdaGC === Infinity ? 999 : lambdaGC} as lambda_gc, 
                        count(*) as count
                    FROM ${stageTableName} s`,
                    `.headers off`,
                    `SELECT 
                        DISTINCT ${phenotypeId} as phenotype_id, 
                        '${sex}' as sex, 
                        '${ancestry}' as ancestry, 
                        s.chromosome as chromosome, 
                        null as lambda_gc, 
                        count(*) as count 
                    FROM ${stageTableName} s 
                    JOIN chromosome_range cr ON s.chromosome = cr.chromosome 
                    GROUP BY s.chromosome 
                    ORDER BY cr.rowid`,
                    // run distinct snp query for stacked sex query once per ancestry
                    sexes.includes('male') && sexes.includes('female') && sex === 'female' ? `
                    SELECT 
                        ${phenotypeId} as phenotype_id, 
                        'stacked' as sex, 
                        '${ancestry}' as ancestry, 
                        'all' as chromosome, 
                        null as lambda_gc, 
                        count(distinct snp) as count
                    FROM prestage p
                    WHERE p.female_${ancestry}_p_value != 'NA' OR p.male_${ancestry}_p_value != 'NA'
                    ` : '',
                ]));
                console.log("exportMetadataStatus", String(exportMetadataStatus), 
                    exportMetadataStatus.stdout ? exportMetadataStatus.stdout.toString() : "No STDOUT", 
                    exportMetadataStatus.stderr ? exportMetadataStatus.stderr.toString() : "No STDERR");
            } catch (err) {
                logger.error(err);
            }
            
            console.log([
                `[${duration()} s] Finished exporting, generated the following files:`,
                exportVariantTmpFilePath, 
                exportAggregateTmpFilePath, 
                exportMetadataTmpFilePath
            ].join('\n'));
        
            if (outputFilePath !== tmpFilePath) {
                console.log(`[${duration()} s] [${sex}, ${ancestry}] Copying ${exportVariantTmpFilePath} to ${exportVariantFilePath}...`);
                fs.copyFileSync(exportVariantTmpFilePath, exportVariantFilePath);
                console.log(`[${duration()} s] [${sex}, ${ancestry}] Done`);
                
                console.log(`[${duration()} s] [${sex}, ${ancestry}] Copying ${exportAggregateTmpFilePath} to ${exportAggregateFilePath}...`);
                fs.copyFileSync(exportAggregateTmpFilePath, exportAggregateFilePath);
                console.log(`[${duration()} s] [${sex}, ${ancestry}] Done`);
            
                console.log(`[${duration()} s] [${sex}, ${ancestry}] Copying ${exportMetadataTmpFilePath} to ${exportMetadataFilePath}...`);
                fs.copyFileSync(exportMetadataTmpFilePath, exportMetadataFilePath);
                console.log(`[${duration()} s] [${sex}, ${ancestry}] Done exporting csv files\n\n`);
            }
        }
    }

    console.log(`[${duration()} s] Done`);
    db.close();

    return;
}


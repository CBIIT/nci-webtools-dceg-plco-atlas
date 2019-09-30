const assert = require('assert');
const fs = require('fs');
const path = require('path');
const readline = require('readline');
const sqlite = require('better-sqlite3');
const ranges = require('../data/chromosome_ranges.json');

// retrieve arguments
const argv = process.argv.slice(2);
if (argv.length !== 4 || argv.includes('-h')) {
    console.log(`USAGE: node import.js RCC.data MEL.data EWING.data  output.db`)
    process.exit(0);
}

// parse arguments and set defaults
let [ RCCInputFilePath, MELInputFilePath, EWINGInputFilePath, databaseFilePath ] = argv;
databaseFilePath = databaseFilePath || 'output.db';

// RCC input file should exist
if (!fs.existsSync(RCCInputFilePath)) {
    console.error(`ERROR: ${RCCInputFilePath} does not exist.`)
    process.exit(1);
}

// MEL input file should exist
if (!fs.existsSync(MELInputFilePath)) {
    console.error(`ERROR: ${MELInputFilePath} does not exist.`)
    process.exit(1);
}

// EWING input file should exist
if (!fs.existsSync(EWINGInputFilePath)) {
    console.error(`ERROR: ${EWINGInputFilePath} does not exist.`)
    process.exit(1);
}

// db file should not already exist
// if (fs.existsSync(databaseFilePath)) {
//     console.error(`ERROR: ${databaseFilePath} already exists.`)
//     process.exit(2);
// }

// set up utility functions/constants
const startTime = new Date();
const duration = _ => ((new Date() - startTime) / 1000).toPrecision(4);
const readFile = filepath => fs.readFileSync(path.resolve(__dirname, filepath), 'utf8');

// floors a value to the lowest multiple of the size given (usually a power of 10)
const group = (value, size) =>
    value === null ? null : +(
        size * Math.floor(value / size)
    ).toPrecision(12);

// floors a value to the lowest multiple of the size given (usually a power of 10)
const groupFunc = (value, size) =>
    value === null ? null : +(
        size * Math.floor(value / size)
    ).toPrecision(12);

// parses each line in the file
const parseLine = line => line.trim().split(/\s+/).map(value => {
    if (value === 'NA') return null; // nulls are represented as 'NA' values
    else if (!isNaN(value)) return parseFloat(value); // try to parse nums as floats
    return value;
});

// gets the first line in a file
const getFirstLine = filepath => {
    const size = 2048;
    const buffer = Buffer.alloc(size);
    fs.readSync(fs.openSync(filepath, 'r'), buffer, 0, size);
    const contents = buffer.toString();
    return contents.substring(0, contents.indexOf('\n')).trim();
}

// validate headers rcc
const headersRCC = ['SNP','CHR','LOC','GROUP','CATEGORY','INFO','NUM_CONTROL','NUM_CASE','REFERENCE_ALLELE','EFFECT_ALLELE','EFFECT_ALLELE_FREQ_CONTROL', "EFFECT_ALLELE_FREQ_CASE",'OR','CI','P','Phet','I2'];
const firstLineRCC = parseLine(getFirstLine(RCCInputFilePath));
assert.deepStrictEqual(firstLineRCC, headersRCC, `Headers do not match expected values: ${headersRCC}`);

// validate headers mel
const headersMEL = ["CHR","BP","SNP","A1","A2","N","P","P.R.","OR","OR.R.","Q","I","Case_N","Control_N","Sample_N","SE_fixed","Z_fixed","RSID"];
const firstLineMEL = parseLine(getFirstLine(MELInputFilePath));
assert.deepStrictEqual(firstLineMEL, headersMEL, `Headers do not match expected values: ${headersMEL}`);

// validate headers ewings
const headersEWING = ['CHR','BP','SNP','A1','A2','N','P','P(R)','OR','OR(R)','Q','I'];
const firstLineEWING = parseLine(getFirstLine(EWINGInputFilePath));
assert.deepStrictEqual(firstLineEWING, headersEWING, `Headers do not match expected values: ${headersEWING}`);


// create variant_stage (temp), variant, variant_summary, and variant_lookup
const db = new sqlite(databaseFilePath);

// db.exec(readFile('schema-sample-genders.sql'));





// // RCC
// const insertRCC = db.prepare(`
//     INSERT INTO variant_RCC_stage VALUES (
//         :snp,
//         :chr,
//         :loc,
//         :bp_1000kb,
//         :bp_abs,
//         :bp_abs_1000kb,
//         :reference_allele,
//         :effect_allele,
//         :p,
//         :nlog_p,
//         :nlog_p2,
//         :or,
//         :i2,
//         :group,
//         :category,
//         :info,
//         :num_control,
//         :num_case,
//         :effect_allele_freq_control,
//         :effect_allele_freq_case,
//         :ci,
//         :phet
//     )
// `);

// // stream the input file line by line
// const readerRCC = readline.createInterface({
//     input: fs.createReadStream(RCCInputFilePath)
// });

// let countRCC = 0;
// let previousChrRCC = 1;
// let bpOffsetRCC = 0;

// db.exec('BEGIN TRANSACTION');

// readerRCC.on('line', line => {
//     // skip first line
//     if (countRCC++ === 0) return;

//     // trim, split by spaces, and parse 'NA' as null
//     const values = parseLine(line);
//     // const [chr, bp, snp, a1, a2, n, p, p_r, or, or_r, q, i] = values;
//     const [snp, chr, loc, group, category, info, num_control, num_case, reference_allele, effect_allele, effect_allele_freq_control, effect_allele_freq_case, or, ci, p, phet, i2] = values;
//     const params = {snp, chr, loc, group, category, info, num_control, num_case, reference_allele, effect_allele, effect_allele_freq_control, effect_allele_freq_case, or, ci, p, phet, i2};

//     // remove 'chr' prefix from some chromosomes
//     if (params.chr) {
//         let chr_strip = params.chr.toString();
//         params.chr = +chr_strip.replace(/chr/i, "");
//     }
    
//     // group base pairs
//     params.bp_1000kb = groupFunc(params.loc, 10**6);

//     // calculate -log10(p) and group its values
//     params.nlog_p = params.p ? -Math.log10(params.p) : null;
//     params.nlog_p2 = groupFunc(params.nlog_p, 10**-2);

//     // determine absolute position of variant relative to the start of the genome
//     // if (+params.chr > +previousChrRCC) {

//         // bpOffsetRCC = ranges[params.chr - 1].max_bp_abs;
//         // previousChrRCC = +params.chr;
//     // }
//     bpOffsetRCC = params.chr > 1
//         ? ranges[params.chr - 2].max_bp_abs
//         : 0;

//     // store the absolute BP and group by megabases
//     params.bp_abs = bpOffsetRCC + loc;
//     params.bp_abs_1000kb = groupFunc(params.bp_abs, 10**6);

//     insertRCC.run(params);

//     // show progress message every 10000 rows
//     if (countRCC % 10000 === 0)
//         console.log(`[${duration()} s] Inserted ${countRCC} RCC rows`);
// });

// readerRCC.on('close', () => {
//     db.exec('COMMIT');

//     // store variant table
//     console.log(`[${duration()} s] Storing RCC variants...`);
//     db.exec(`
//         INSERT INTO variant_RCC SELECT
//             null, "chr", "bp", "snp", "a1", "a2", "p", "nlog_p", "or", "i2"
//         FROM variant_RCC_stage;
//     `);

//     // store summary table for variants
//     console.log(`[${duration()} s] Storing RCC summary...`);
//     db.exec(`
//         INSERT INTO aggregate_RCC SELECT DISTINCT
//             chr, bp_abs_1000kb, nlog_p2
//         FROM variant_RCC_stage;
//     `);

//     // drop staging table
//     db.exec(`DROP TABLE variant_RCC_stage`);

//     // create indexes
//     // console.log(`[${duration()} s] Indexing...`);
//     // db.exec(readFile('indexes-sample-genders.sql'));

//     // close database
//     console.log(`[${duration()} s] Finalizing database...`);
//     db.close();
//     console.log(`[${duration()} s] Created database`);
// });




// // MELAMONA
// const insertMEL = db.prepare(`
//     INSERT INTO variant_MEL_stage VALUES (
//         :chr,
//         :bp,
//         :bp_1000kb,
//         :bp_abs,
//         :bp_abs_1000kb,
//         :snp,
//         :a1,
//         :a2,
//         :n,
//         :p,
//         :nlog_p,
//         :nlog_p2,
//         :pr,
//         :or,
//         :orr,
//         :q,
//         :i,
//         :case_n,
//         :control_n,
//         :sample_n,
//         :se_fixed,
//         :z_fixed,
//         :rsid
//     )
// `);

// // stream the input file line by line
// const readerMEL = readline.createInterface({
//     input: fs.createReadStream(MELInputFilePath)
// });

// let countMEL = 0;
// let previousChrMEL = 1;
// let bpOffsetMEL = 0;

// db.exec('BEGIN TRANSACTION');

// readerMEL.on('line', line => {
//     // skip first line
//     if (countMEL++ === 0) return;

//     // trim, split by spaces, and parse 'NA' as null
//     const values = parseLine(line);
//     // const [chr, bp, snp, a1, a2, n, p, p_r, or, or_r, q, i] = values;
//     const [chr, bp, snp, a1, a2, n, p, pr, or, orr, q, i, case_n, control_n, sample_n, se_fixed, z_fixed, rsid] = values;
//     const params = {chr, bp, snp, a1, a2, n, p, pr, or, orr, q, i, case_n, control_n, sample_n, se_fixed, z_fixed, rsid};

//     // group base pairs
//     params.bp_1000kb = groupFunc(params.bp, 10**6);

//     // calculate -log10(p) and group its values
//     params.nlog_p = params.p ? -Math.log10(params.p) : null;
//     params.nlog_p2 = groupFunc(params.nlog_p, 10**-2);

//     // determine absolute position of variant relative to the start of the genome
//     // if (params.chr > previousChrMEL) {
//     //     bpOffsetMEL = ranges[previousChrMEL - 1].max_bp_abs;
//     //     previousChrMEL = +params.chr;
//     // }
//     bpOffsetMEL = params.chr > 1
//         ? ranges[params.chr - 2].max_bp_abs
//         : 0;

//     // store the absolute BP and group by megabases
//     params.bp_abs = bpOffsetMEL + bp;
//     params.bp_abs_1000kb = groupFunc(params.bp_abs, 10**6);

//     insertMEL.run(params);

//     // show progress message every 10000 rows
//     if (countMEL % 10000 === 0)
//         console.log(`[${duration()} s] Inserted ${countMEL} MEL rows`);
// });

// readerMEL.on('close', () => {
//     db.exec('COMMIT');

//     // store variant table
//     console.log(`[${duration()} s] Storing MEL variants...`);
//     db.exec(`
//         INSERT INTO variant_MEL SELECT
//             null, "chr", "bp", "rsid", "a1", "a2", "n", "p", "nlog_p", "pr", "or", "orr", "q", "i"
//         FROM variant_MEL_stage;
//     `);

//     // store summary table for variants
//     console.log(`[${duration()} s] Storing MEL summary...`);
//     db.exec(`
//         INSERT INTO aggregate_MEL SELECT DISTINCT
//             chr, bp_abs_1000kb, nlog_p2
//         FROM variant_MEL_stage;
//     `);

//     // drop staging table
//     db.exec(`DROP TABLE variant_MEL_stage`);

//     // create indexes
//     // console.log(`[${duration()} s] Indexing...`);
//     // db.exec(readFile('indexes-sample-genders.sql'));

//     // close database
//     console.log(`[${duration()} s] Finalizing database...`);
//     db.close();
//     console.log(`[${duration()} s] Created database`);

// });






// // EWING
// const insertEWING = db.prepare(`
//     INSERT INTO variant_EWING_stage VALUES (
//         :chr,
//         :bp,
//         :bp_1000kb,
//         :bp_abs,
//         :bp_abs_1000kb,
//         :snp,
//         :a1,
//         :a2,
//         :n,
//         :p,
//         :nlog_p,
//         :nlog_p2,
//         :p_r,
//         :or,
//         :or_r,
//         :q,
//         :i
//     )
// `);

// // stream the input file line by line
// const readerEWING = readline.createInterface({
//     input: fs.createReadStream(EWINGInputFilePath)
// });

// let countEWING = 0;
// let previousChrEWING = 1;
// let bpOffsetEWING = 0;

// db.exec('BEGIN TRANSACTION');

// readerEWING.on('line', line => {
//     // skip first line
//     if (countEWING++ === 0) return;

//     // trim, split by spaces, and parse 'NA' as null
//     const values = parseLine(line);

//     const [chr, bp, snp, a1, a2, n, p, p_r, or, or_r, q, i] = values;
//     const params = {chr, bp, snp, a1, a2, n, p, p_r, or, or_r, q, i};

//     // group base pairs
//     params.bp_1000kb = group(params.bp, 10**6);

//     // calculate -log10(p) and group its values
//     params.nlog_p = params.p ? -Math.log10(params.p) : null;
//     params.nlog_p2 = group(params.nlog_p, 10**-2);

//     // determine absolute position of variant relative to the start of the genome
//     if (chr != previousChrEWING) {
//         bpOffsetEWING = chr > 1 ? ranges[chr - 2].max_bp_abs : 0;
//         previousChrEWING = chr;
//     }

//     // store the absolute BP and group by megabases
//     params.bp_abs = bpOffsetEWING + bp;
//     params.bp_abs_1000kb = group(params.bp_abs, 10**6);

//     insertEWING.run(params);

//     // show progress message every 10000 rows
//     if (countEWING % 10000 === 0)
//         console.log(`[${duration()} s] Inserted ${countEWING} EWING rows`);
// });

// readerEWING.on('close', () => {
//     db.exec('COMMIT');

//     // store variant table
//     console.log(`[${duration()} s] Storing EWING variants...`);
//     db.exec(`
//         INSERT INTO variant_EWING SELECT
//             null, "chr", "bp", "snp", "a1", "a2", "n", "p", "nlog_p", "p_r", "or", "or_r", "q", "i"
//         FROM variant_EWING_stage;
//     `);

//     // store summary table for variants
//     console.log(`[${duration()} s] Storing EWING summary...`);
//     db.exec(`
//         INSERT INTO aggregate_EWING SELECT DISTINCT
//             chr, bp_abs_1000kb, nlog_p2
//         FROM variant_EWING_stage;
//     `);

//     // drop staging table
//     db.exec(`DROP TABLE variant_EWING_stage`);

//     // create indexes
//     // console.log(`[${duration()} s] Indexing...`);
//     // db.exec(readFile('indexes-sample-genders.sql'));

//     // close database
//     console.log(`[${duration()} s] Finalizing database...`);
//     db.close();
//     console.log(`[${duration()} s] Created database`);
// });




// create indexes
// console.log(`[${duration()} s] Indexing...`);
// db.exec(readFile('indexes-sample-genders.sql'));

// rename all tables
db.exec(`
    ALTER TABLE 'variant_MEL' RENAME TO 'variant_all';
    ALTER TABLE 'aggregate_MEL' RENAME TO 'aggregate_all';   
    ALTER TABLE 'variant_EWING' RENAME TO 'variant_female';
    ALTER TABLE 'aggregate_EWING' RENAME TO 'aggregate_female';
    ALTER TABLE 'variant_RCC' RENAME TO 'variant_male';
    ALTER TABLE 'aggregate_RCC' RENAME TO 'aggregate_male';
`);

// // close database
db.close();

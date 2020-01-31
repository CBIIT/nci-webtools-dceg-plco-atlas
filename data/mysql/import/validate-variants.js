cconst fs = require('fs');
const args = require('minimist')(process.argv.slice(2));
const ranges = require('../../json/chromosome_ranges.json');
const { timestamp, getLogStream } = require('./utils/logging');
const { getFileReader, parseLine, readFile, validateHeaders } = require('./utils/file');
const { group } = require('./utils/math');

// display help if needed
if (!(args.input && args.output && args.schema)) {
    console.log(`USAGE: node validate-variants.js \
        --input "filename" \
        --output "filename" \
        --schema "schema map name, eg: ewings_sarcoma, melanoma, or renal_cell_carcinoma"`);
    process.exit(0);
}

// parse arguments and set defaults
const { input: inputFilePath, output: outputFilePath, schema } = args;
const { columns, mapToSchema } = require(`./schema-maps/${schema}`);
const reader = getFileReader(inputFilePath);
const writer = getFileWriter(outputFilePath);
const errorLog = getLogStream(`data/failed-variants-${new Date().toISOString()}.txt`);
const duration = timestamp();

// input file should exist
if (!fs.existsSync(inputFilePath)) {
    console.error(`ERROR: ${inputFilePath} does not exist.`);
    process.exit(1);
}

// output file should exist
if (!s.existsSync(outputFilePath)) {
    console.error(`ERROR: ${outputFilePath} does not exist.`);
    process.exit(1);
}

// schema map should exist
if (!mapToSchema) {
    console.error(`ERROR: ${schema} is not a valid schema`);
    process.exit(1);
}

validateHeaders(inputFilePath, columns);
validateVariants();

async function validateVariants() {
    // set up counters
    let lineCount = 0;
    let previousChromosome = 1;
    let positionOffset = 0;

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
        params.show_qq_plot = 0;

        // initiaize expected_p to 0
        params.p_value_expected = 0;

        let row = [
            params.chromosome,
            params.position,
            params.position_aggregate,
            params.position_abs_aggregate,
            params.snp,
            `"${params.allele_reference}"`,
            `"${params.allele_effect}"`,
            params.p_value,
            params.p_value_aggregate,
            params.p_value_expected,
            params.p_value_nlog,
            params.p_value_r,
            params.odds_ratio,
            params.odds_ratio_r,
            params.n,
            params.q,
            params.i,
            params.show_qq_plot,
        ];

        writer.write(row)

        // show progress message every 10000 rows
        if (lineCount % 10000 === 0)
            console.log(`[${duration()} s] Read ${lineCount} rows`);
    });
}

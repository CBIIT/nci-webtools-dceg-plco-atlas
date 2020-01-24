// use this map once we have the original rcc.txt
// const columns = ['SNP','CHR','LOC','GROUP','CATEGORY','INFO','NUM_CONTROL','NUM_CASE','REFERENCE_ALLELE','EFFECT_ALLELE','EFFECT_ALLELE_FREQ_CONTROL', "EFFECT_ALLELE_FREQ_CASE",'OR','CI','P','Phet','I2'];
const columns = null;

export const  mapToSchema = values => {
    const [id, chr, bp, snp, a1, a2, p, or, i2] = values;

    return {
        chromosome: chr,
        position: bp,
        snp: snp,
        allele_reference: a1,
        allele_effect: a2,
        n: null,
        p_value: p,
        p_value_r: null,
        odds_ratio: or,
        odds_ratio_r: null,
        q: null,
        i: i2,
    };
}

module.exports = {columns, mapToSchema};


const columns = ['CHR','BP','SNP','A1','A2','N','P','P(R)','OR','OR(R)','Q','I'];

const mapToSchema = values => {
    const [chr, bp, snp, a1, a2, n, p, p_r, or, or_r, q, i] = values;
    return {
        chromosome: chr,
        position: bp,
        snp: snp,
        allele_reference: a1,
        allele_effect: a2,
        n: n,
        p_value: p,
        p_value_r: p_r,
        odds_ratio: or,
        odds_ratio_r: or_r,
        q: q,
        i: i,
    };
}

module.exports = {columns, mapToSchema};
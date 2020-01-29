const columns = ['CHR','BP','SNP','A1','A2','N','P','P.R.','OR','OR.R.','Q','I','Case_N','Control_N','Sample_N','SE_fixed','Z_fixed','RSID'];

const mapToSchema = values => {
    const [chr, bp, snp, a1, a2, n, p, p_r, or, or_r, q, i, case_n, control_n, sample_n, se_fixed, z_fixed, rsid] = values;
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



export const UPDATE_SUMMARY_RESULTS = 'UPDATE_SUMMARY_RESULTS'
export const UPDATE_VARIANT_LOOKUP = 'UPDATE_VARIANT_LOOKUP'
export const UPDATE_PHENOTYPE_CORRELATIONS = 'UPDATE_PHENOTYPE_CORRELATIONS';
export const UPDATE_PHENOTYPES = 'UPDATE_PHENOTYPES';

export function updatePhenotypes(data) {
    return {type: UPDATE_PHENOTYPES, data};
}

export function updateSummaryResults(data) {
    return {type: UPDATE_SUMMARY_RESULTS, data};
}

export function updateVariantLookup(data) {
    return {type: UPDATE_VARIANT_LOOKUP, data};
}

export function updatePhenotypeCorrelations(data) {
    return {type: UPDATE_PHENOTYPE_CORRELATIONS, data};
}
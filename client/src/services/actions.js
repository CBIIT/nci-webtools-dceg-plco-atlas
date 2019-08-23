import { query } from './query';

export const UPDATE_SUMMARY_RESULTS = 'UPDATE_SUMMARY_RESULTS';
export const UPDATE_VARIANT_LOOKUP = 'UPDATE_VARIANT_LOOKUP';
export const UPDATE_PHENOTYPE_CORRELATIONS = 'UPDATE_PHENOTYPE_CORRELATIONS';
export const UPDATE_PHENOTYPES = 'UPDATE_PHENOTYPES';

export function updatePhenotypes(data) {
  return { type: UPDATE_PHENOTYPES, data };
}

export function updateSummaryResults(data) {
  return { type: UPDATE_SUMMARY_RESULTS, data };
}

export function updateVariantLookup(data) {
  return { type: UPDATE_VARIANT_LOOKUP, data };
}

export function updatePhenotypeCorrelations(data) {
  return { type: UPDATE_PHENOTYPE_CORRELATIONS, data };
}

export function lookupVariants(phenotypes, variant) {
  return async function(dispatch) {
    dispatch(
      updateVariantLookup({
        loading: true,
        results: [],
        message: ''
      })
    );

    var tableList = [];
    for (let i = 0; i < phenotypes.length; i++) {
      const variantData = await query('variant', {
        database: phenotypes[i].value + '.db',
        snp: variant,
        chr: '',
        bp: ''
      });
      console.log(variantData);
      for (let j = 0; j < variantData.length; j++) {
        console.log(variantData[j]);
        variantData[j]['phenotype'] = phenotypes[i].label;
        tableList.push(variantData[j]);
      }
    }
    dispatch(
      updateVariantLookup({
        loading: false,
        results: tableList,
        message:
          tableList.length === 0
            ? 'Variant not found in selected phenotype(s).'
            : ''
      })
    );
  };
}

import { query, rawQuery } from './query';

export const UPDATE_SUMMARY_RESULTS = 'UPDATE_SUMMARY_RESULTS';
export const UPDATE_VARIANT_LOOKUP = 'UPDATE_VARIANT_LOOKUP';
export const UPDATE_PHENOTYPE_CORRELATIONS = 'UPDATE_PHENOTYPE_CORRELATIONS';
export const UPDATE_PHENOTYPES = 'UPDATE_PHENOTYPES';
export const UPDATE_PHENOTYPES_TREE = 'UPDATE_PHENOTYPES_TREE';

export function updatePhenotypes(data) {
  return { type: UPDATE_PHENOTYPES, data };
}

export function updatePhenotypesTree(data) {
  return { type: UPDATE_PHENOTYPES_TREE, data };
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

export function updateSummaryResultsTable(params) {
  return async function (dispatch) {
   dispatch(updateSummaryResults({loading: true}));
    const results = await query('variants-paginated', params);
    console.log(results);
   dispatch(updateSummaryResults({results, loading: false}))
  }
}

export function fetchRanges() {
  return async function (dispatch) {
    const ranges = await query('data/chromosome_ranges.json');
    dispatch(updateSummaryResults({ranges}));
  }
}

/**
 *
 * @param {'summary'|'variants'} plotType
 * @param {object} params - database, chr, bpMin, bpMax, nlogpMin, nlogPmax
 */
export function drawManhattanPlot(plotType, params) {
  return async function (dispatch) {
    dispatch(updateSummaryResults({loading: true}));
    const manhattanPlotData = await rawQuery(plotType, params);
    dispatch(updateSummaryResults({manhattanPlotData, loading: false}));
    return manhattanPlotData;
  }
}

export function drawQQPlot(phenotype) {
  return async function (dispatch) {
    dispatch(updateSummaryResults({loading: true}));
    const imageMapData = await query(
      `data/qq-plots/${phenotype}.imagemap.json`
    );
    if (!imageMapData.error) {
      dispatch(updateSummaryResults({
        ...imageMapData, // lambdaGC, sampleSize, areaItems
        qqplotSrc: `data/qq-plots/${phenotype}.png`,
        loading: false
      }));
    }
  }
};

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

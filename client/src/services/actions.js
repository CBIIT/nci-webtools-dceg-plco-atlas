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

export function fetchRanges() {
  return async function(dispatch) {
    const ranges = await query('data/chromosome_ranges.json');
    dispatch(updateSummaryResults({ ranges }));
  };
}

export function updateSummaryResultsTable(params) {
  return async function(dispatch) {
    dispatch(updateSummaryResults({ loading: true }));
    const results = await query('variants-paginated', params);
    if (!results.error)
      dispatch(updateSummaryResults({ results, loading: false }));
    dispatch(updateSummaryResults({ loading: false }));
    return results;
  };
}

/**
 *
 * @param {'summary'|'variants'} plotType
 * @param {object} params - database, chr, bpMin, bpMax, nlogpMin, nlogPmax
 */
export function drawManhattanPlot(plotType, params) {
  return async function(dispatch) {
    dispatch(updateSummaryResults({ loading: true }));
    const manhattanPlotData = await rawQuery(plotType, params);
    if (!manhattanPlotData.error)
      dispatch(updateSummaryResults({ manhattanPlotData }));
    dispatch(updateSummaryResults({ loading: false }));
    return manhattanPlotData;
  };
}

export function drawQQPlot(phenotype) {
  return async function(dispatch) {
    dispatch(updateSummaryResults({ loading: true }));
    const imageMapData = await query(
      `data/qq-plots/${phenotype}.imagemap.json`
    );
    if (!imageMapData.error) {
      dispatch(
        updateSummaryResults({
          ...imageMapData, // lambdaGC, sampleSize, areaItems
          qqplotSrc: `data/qq-plots/${phenotype}.png`,
          loading: false
        })
      );
    }
  };
}

export function drawHeatmap(phenotypes) {
  return async function(dispatch) {
    const setLoading = loading => {
      dispatch(updateSummaryResults({ loading }));
    };
    const setHeatmapData = heatmapData => {
      dispatch(updatePhenotypeCorrelations({ heatmapData }));
    };
    const stringScore = (stringX, stringY) => {
      var sum = 0;
      for (var x = 0; x < stringX.length; x++) {
        sum += stringX.charCodeAt(x);
      }
      for (var y = 0; y < stringY.length; y++) {
        sum -= stringY.charCodeAt(y);
      }
      return Math.abs(sum);
    };

    setLoading(true);

    console.log('DRAW HEATMAP', phenotypes);

    let n = phenotypes.length;
    let x = [];
    let y = [];
    let z = [];
    for (var i = 1; i <= n; i++) {
      let pheno =
        i +
        ' ' +
        Math.random()
          .toString(36)
          .substring(2, 6);
      x.push(pheno);
      y.unshift(pheno);
    }
    for (var xidx = 0; xidx < n; xidx++) {
      let row = [];
      for (var yidx = 0; yidx < n; yidx++) {
        if (x[xidx] === y[yidx]) {
          row.push(0.0);
        } else {
          row.push(stringScore(x[xidx], y[yidx]));
        }
      }
      z.push(row);
    }
    let randomData = {
      x,
      y,
      z,
      xgap: 1,
      ygap: 1,
      type: 'heatmap',
      colorscale: [
        ['0.0', 'rgb(255,255,255)'],
        ['0.444444444444', 'rgb(255,0,0)'],
        ['0.5', 'rgb(255,255,255)'],
        ['1.0', 'rgb(0,0,255)']
      ],
      showscale: false,
      hoverinfo: 'x+y',
      hovertemplate:
        '<br><b>Phenotype X</b>: %{x}<br>' +
        '<b>Phenotype Y</b>: %{y}<br>' +
        '<b>Correlation</b>: %{z}' +
        '<extra></extra>'
    };
    setHeatmapData([randomData]);

    setLoading(false);
  };
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

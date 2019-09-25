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
    const response = await query('variants', params);
    if (!response.error) {
      let data = {results: response.data};
      if (response.count)
        data.resultsCount = response.count;
      dispatch(updateSummaryResults(data));
    }
    dispatch(updateSummaryResults({ loading: false }));
    return response;
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
    const getZColor = (phenotype1, phenotype2, correlationData) => {
      var r2 = 0.0;
      if (phenotype1 in correlationData && phenotype2 in correlationData) {
        if (phenotype2 in correlationData[phenotype1] || phenotype1 in correlationData[phenotype2]) {
          if (phenotype2 in correlationData[phenotype1]) {
            r2 = correlationData[phenotype1][phenotype2];
          } else {
            r2 = correlationData[phenotype2][phenotype1];
          }
        } else {
          r2 = 0.0;
        }
      } else {
        r2 = 0.0;
      }
      
  
      if (r2 === -1.0 || r2 === 1.0) {
        r2 = 0.0;
      }
  
      return r2;
    };
    const getZText = (phenotype1, phenotype2, correlationData) => {
      var r2 = 0.0;
      if (phenotype1 in correlationData && phenotype2 in correlationData) {
        if (phenotype2 in correlationData[phenotype1] || phenotype1 in correlationData[phenotype2]) {
          if (phenotype2 in correlationData[phenotype1]) {
            r2 = correlationData[phenotype1][phenotype2];
          } else {
            r2 = correlationData[phenotype2][phenotype1];
          }
        } else {
          r2 = 0.0;
        }
      } else {
        r2 = 0.0;
      }
  
      return r2;
    };
    const setLoading = loading => {
      dispatch(updateSummaryResults({ loading }));
    };
    const setHeatmapData = heatmapData => {
      dispatch(updatePhenotypeCorrelations({ heatmapData }));
    };
    const setPopupTooltipData = popupTooltipData => {
      dispatch(updatePhenotypeCorrelations({ popupTooltipData }));
    };
    const setPlottedPhenotypes = plottedPhenotypes => {
      dispatch(updatePhenotypeCorrelations({ plottedPhenotypes }));
    }
    setLoading(true);
    setPopupTooltipData(null);

    setHeatmapData([]);
    setPlottedPhenotypes([]);

    const correlationData = await query(`data/sample_correlations_sanitized.json`);
    
    var uniquePhenotypes = phenotypes.map(phenotype => phenotype.title ? phenotype.title : phenotype.label);
    setPlottedPhenotypes(uniquePhenotypes);
    let n = uniquePhenotypes.length;
    let x = uniquePhenotypes;
    let y = uniquePhenotypes;
    let zColor = [];
    let zText = [];

    for (var xidx = 0; xidx < n; xidx++) {
      let rowColor = [];
      let rowText = [];
      for (var yidx = 0; yidx < n; yidx++) {
        rowColor.push(getZColor(x[xidx], y[yidx], correlationData));
        rowText.push(getZText(x[xidx], y[yidx], correlationData));
      }
      zColor.push(rowColor);
      zText.push(rowText);
    }

    let sampleData = {
      x,
      y,
      z: zColor,
      zmin: -1.0,
      zmax: 1.0,
      text: zText,
      xgap: 1,
      ygap: 1,
      type: 'heatmap',
      colorscale: [
        ['0.0', 'rgb(0,0,255)'],
        ['0.49999999', 'rgb(255,255,255)'],
        ['0.5', 'rgb(204,204,204)'],
        ['0.50000001', 'rgb(255,255,255)'],
        ['1.0', 'rgb(255,0,0)']
      ],
      showscale: false,
      hoverinfo: 'x+y',
      hovertemplate:
        '<br><b>Phenotype X</b>: %{x}<br>' +
        '<b>Phenotype Y</b>: %{y}<br>' +
        '<b>Correlation</b>: %{text}' +
        '<extra></extra>'
    };
    setHeatmapData([sampleData]);
    setLoading(false);
  }
};

export function lookupVariants(phenotypes, variant) {
  return async function(dispatch) {
    dispatch(
      updateVariantLookup({
        loading: true,
        results: [],
        message: '',
        submitted: new Date()
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
        variantData[j]['phenotype'] = phenotypes[i].title ? phenotypes[i].title : phenotypes[i].label;
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

import { query, rawQuery } from './query';


export const UPDATE_SUMMARY_RESULTS = 'UPDATE_SUMMARY_RESULTS';
export const UPDATE_SUMMARY_TABLE = 'UPDATE_SUMMARY_TABLE'
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

export function updateSummaryTable(data, index) {
  return { type: UPDATE_SUMMARY_TABLE, data, index };
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

export function fetchSummaryTable(params, countKey, tableIndex) {
  return async function(dispatch) {
    dispatch(updateSummaryResults({ loadingManhattanTable: true }));
    const response = await query('variants', params);
    if (!response.error) {
      let data = {results: response.data};
      if (response.count)
        data.resultsCount = response.count;
      else if (countKey)
        data.resultsCount = +await query('metadata', {...params, key: countKey});
      dispatch(updateSummaryTable({
        ...data,
        page: params.page,
        pageSize: params.pageSize
      }, tableIndex));
    }
    dispatch(updateSummaryResults({ loadingManhattanTable: false }));
    return response;
  };
}

/**
 *
 * @param {'summary'|'variants'} plotType
 * @param {object} params - database, chr, bpMin, bpMax, nlogpMin, nlogPmax
 */
export function drawManhattanPlot(plotType, params) {
  console.log('drawing plot', plotType, params);
  return async function(dispatch) {
    dispatch(updateSummaryResults({ loadingManhattanPlot: true }));
    if (params.table.length == 2) {
      // if 2 tables are provided, this is a mirrored plot
      const manhattanPlotData = await rawQuery(plotType, {
        ...params,
        table: params.table[0]
      });

      const manhattanPlotMirroredData = await rawQuery(plotType, {
        ...params,
        table: params.table[1]
      });

      dispatch(updateSummaryResults({
        manhattanPlotData,
        manhattanPlotMirroredData,
      }));
    } else {
      const manhattanPlotData = await rawQuery(plotType, params);
      dispatch(updateSummaryResults({
        manhattanPlotData,
        manhattanPlotMirroredData: {}
      }));
    }

    dispatch(updateSummaryResults({ loadingManhattanPlot: false }));
  };
}

export function drawQQPlot(phenotype) {
  return async function(dispatch) {
    console.log("drawQQPlot", phenotype);

    const setQQPlotLoading = loadingQQPlot => {
      dispatch(updateSummaryResults({ loadingQQPlot }));
    };
    const setQQPlotData = qqplotData => {
      dispatch(updateSummaryResults({ qqplotData }));
    };
    const setQQPlotLayout = qqplotLayout => {
      dispatch(updateSummaryResults({ qqplotLayout }));
    };
    setQQPlotLoading(true);
    setQQPlotLayout({});
    setQQPlotData([]);

    const getIntervals = (maxValue, length) => {
      var sqMax = Math.sqrt(maxValue);

      const fx = (x) => {
        return Math.round(maxValue - Math.pow(x - sqMax, 2));
      }
     
      var intervals = [];
      for (var i = 1; i <= length; i ++) {
        var x = (i / length) * sqMax;
        var interval = fx(x);
        if (interval > 0 && !intervals.includes(interval)) {
            intervals.push(interval);
        } 
      }
    
      return intervals;
    }

    const metadata = await query('metadata', {
      database: 'meta_fixed_assoc_new_keep' + '.db',
    });
    const metadata_count = parseInt(metadata['count_all']);
    const lambdaGC = metadata['lambdagc_all'] ? metadata['lambdagc_all'] : 'TBD';

    // const subsetVariantDataMod1 = 1000; 
    // const subsetVariantDataMod2 = 10000; 
    // const subsetVariantDataMod3 = 100000; 
    const pCutOffValue = 0.001;
    // const pCutOffValue2 = 0.01;
    // const pCutOffValue3 = 0.1;

    const topVariantData = await query('variants', {
      database: 'meta_fixed_assoc_new' + '.db',
      table: "variant_all",
      columns: ['chr', 'bp', 'snp', 'p', 'nlog_p', 'expected_p'],
      // columns: ['nlog_p'],
//      pMin: 0.001,
      pMax: pCutOffValue,
      orderBy: 'p',
      order: 'asc',
      raw: true
    });
    let topObservedVariants = [];
    let topExpectedVariants = [];
    topVariantData.data.map((row) => {
      topObservedVariants.push(row[4]);
      topExpectedVariants.push(row[5]);
    });
    const topObservedVariantsText = [];
    topVariantData.data.map(row => 
      topObservedVariantsText.push({
        chr: row[0],
        bp: row[1],
        snp: row[2],
        p: row[3]
    }))
    console.log("topObservedVariants.length", topObservedVariants.length);
    
    let subsetMarkerColor = '#002a47';
    let topMarkerColor = '#006bb8';

    let qqplotTopData = {
      x: topExpectedVariants,
      y: topObservedVariants,
      text: topObservedVariantsText,
      hovertemplate: 
        '<b>position:</b> %{text.chr}:%{text.bp}<br>' +
        '<b>p-value:</b> %{text.p}<br>' +
        '<b>snp:</b> %{text.snp}' +
        '<extra></extra>',
      hoverinfo: 'text',
      mode: 'markers',
      type: 'scattergl',
      marker: {
        color: topMarkerColor,
        size: 8,
        opacity: 0.65
      },
      showlegend: false
    };

    // let qqplotSubsetData1 = {
    //   x: subsetExpectedVariants1,
    //   y: subsetObservedVariants1,
    //   hoverinfo: 'none',
    //   mode: 'markers',
    //   type: 'scattergl',
    //   marker: {
    //     color: subsetMarkerColor,
    //     size: 8,
    //     // opacity: 0.65
    //   },
    //   showlegend: false
    // };

    let qqplotLineData = {
      x: [0.0, qqplotTopData.x[0]],
      y: [0.0, qqplotTopData.x[0]],
      hoverinfo: 'none',
      mode: 'lines',
      type: 'scattergl',
      line: {
        color: 'gray',
        width: 1
      },
      opacity: 0.5,
      showlegend: false
    };

    let qqplotLayout = {
      dragmode: 'pan',
      clickmode: 'event',
      hovermode: 'closest',
      width: 800,
      height: 800,
      title: {
        text: '<b>\u03BB</b> = ' + lambdaGC + '        <b>Sample Size</b> = ' + metadata_count,
        font: {
          family: 'Arial',
          size: 14,
          color: 'black'
        },
      },
      xaxis: {
        automargin: true,
        rangemode: 'tozero', // only show positive
        showgrid: false, // disable grid lines
        fixedrange: true, // disable zoom
        title: {
          text: '<b>Expected -log<sub>10</sub>(p)</b>',
          font: {
            family: 'Arial',
            size: 14,
            color: 'black'
          },
        },
        tick0: 0,
        ticklen: 10,
        tickfont: {
          family: 'Arial',
          size: 10,
          color: 'black'
        },
      },
      yaxis: {
        automargin: true,
        rangemode: 'tozero', // only show positive
        showgrid: false, // disable grid lines
        fixedrange: true, // disable zoom
        title: {
          text: '<b>Observed -log<sub>10</sub>(p)</b>',
          font: {
            family: 'Arial',
            size: 14,
            color: 'black'
          },
        },
        tick0: 0,
        ticklen: 10,
        tickfont: {
          family: 'Arial',
          size: 10,
          color: 'black'
        },
      }
    };
    setQQPlotLayout(qqplotLayout);
    // setQQPlotData([qqplotTopData, qqplotSubsetData1, qqplotSubsetData2, qqplotSubsetData3, qqplotLineData]);
    // setQQPlotData([qqplotTopData, qqplotSubsetDataTest, qqplotLineData]);
    setQQPlotData([qqplotTopData, qqplotLineData]);
    setQQPlotLoading(false);
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
    const setHeatmapLayout = heatmapLayout => {
      dispatch(updatePhenotypeCorrelations({ heatmapLayout }));
    }
    const setPopupTooltipStyle = popupTooltipStyle => {
      dispatch(updatePhenotypeCorrelations({ popupTooltipStyle }));
    };
    const setPopupTooltipData = popupTooltipData => {
      dispatch(updatePhenotypeCorrelations({ popupTooltipData }));
    };

    setLoading(true);
    setPopupTooltipStyle({display: 'none'});
    setPopupTooltipData(null);

    setHeatmapLayout({});
    setHeatmapData([]);

    const correlationData = await query(`data/sample_correlations_sanitized.json`);

    var uniquePhenotypes = phenotypes.map(phenotype => phenotype.title ? phenotype.title : phenotype.label);
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

    let heatmapData = {
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
      hoverinfo: 'text',
      hovertemplate:
        '%{x}<br>' +
        '%{y}<br>' +
        '<b>Correlation:</b> %{text}' +
        '<extra></extra>'
    };
    let heatmapLayout = {
      width: 1000,
      height: 1000,
      margin: {
        t: 120
      },
      // title: 'Example Heatmap',
      xaxis: {
        automargin: true,
        // autorange: 'reversed',
        side: 'top',
        tickangle: -45,
        tickfont: {
          family: 'Arial',
          size: 10,
          color: 'black'
        },
        tickvals: uniquePhenotypes,
        ticktext: uniquePhenotypes.map(phenotype => phenotype.length > 20 ? phenotype.substring(0, 20) + "..." : phenotype),
        // dtick: 5,
      },
      yaxis: {
        automargin: true,
        autorange: 'reversed',
        tickangle: 'auto',
        tickfont: {
          family: 'Arial',
          size: 10,
          color: 'black'
        },
        tickvals: uniquePhenotypes,
        ticktext: uniquePhenotypes.map(phenotype => phenotype.length > 20 ? phenotype.substring(0, 20) + "..." : phenotype),
        // dtick: 5
      }
    };
    setHeatmapLayout(heatmapLayout);
    setHeatmapData([heatmapData]);
    setLoading(false);
  };
}

export function lookupVariants(phenotypes, variant) {
  return async function(dispatch) {
    dispatch(
      updateVariantLookup({
        loading: true,
        results: [],
        submitted: new Date()
      })
    );

    var tableList = [];
    for (let i = 0; i < phenotypes.length; i++) {
      const { data } = await query('variants', {
        database: phenotypes[i].value + '.db',
        snp: variant,
      });
      if (!data || data.length === 0) {
        tableList.push({
          phenotype: phenotypes[i].title ? phenotypes[i].title : phenotypes[i].label,
          a1: '-',
          a2: '-',
          bp: '-',
          chr: '-',
          or: '-',
          p: '-',
          variant_id: '-'
        });
      } else {
        for (let j = 0; j < data.length; j++) {
          data[j]['phenotype'] = phenotypes[i].title ? phenotypes[i].title : phenotypes[i].label;
          tableList.push(data[j]);
        }
      }
    }
    dispatch(
      updateVariantLookup({
        loading: false,
        results: tableList
      })
    );
  };
}

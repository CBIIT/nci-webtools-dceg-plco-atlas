import { query, rawQuery } from './query';

export const UPDATE_SUMMARY_RESULTS = 'UPDATE_SUMMARY_RESULTS';
export const UPDATE_SUMMARY_TABLE = 'UPDATE_SUMMARY_TABLE';
export const UPDATE_VARIANT_LOOKUP = 'UPDATE_VARIANT_LOOKUP';
export const UPDATE_PHENOTYPE_CORRELATIONS = 'UPDATE_PHENOTYPE_CORRELATIONS';
export const UPDATE_PHENOTYPES = 'UPDATE_PHENOTYPES';
export const UPDATE_PHENOTYPE_CATEGORIES = 'UPDATE_PHENOTYPE_CATEGORIES'
export const UPDATE_PHENOTYPES_TREE = 'UPDATE_PHENOTYPES_TREE';

export function updatePhenotypes(data) {
  return { type: UPDATE_PHENOTYPES, data };
}

export function updatePhenotypeCategories(data) {
  return { type: UPDATE_PHENOTYPE_CATEGORIES, data }
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
      let data = { results: response.data };
      if (response.count) data.resultsCount = response.count;
      else if (countKey)
        data.resultsCount = +(await query('metadata', {
          ...params,
          key: countKey
        }));
      dispatch(
        updateSummaryTable(
          {
            ...data,
            page: params.page,
            pageSize: params.pageSize
          },
          tableIndex
        )
      );
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

      dispatch(
        updateSummaryResults({
          manhattanPlotData,
          manhattanPlotMirroredData
        })
      );
    } else {
      const manhattanPlotData = await rawQuery(plotType, params);
      dispatch(
        updateSummaryResults({
          manhattanPlotData,
          manhattanPlotMirroredData: {}
        })
      );
    }

    dispatch(updateSummaryResults({ loadingManhattanPlot: false }));
  };
}

export function drawQQPlot(phenotype, variantTable) {
  return async function(dispatch) {
    console.log('drawQQPlot', phenotype);
    console.log('variantTable', variantTable);

    const setQQPlotLoading = loadingQQPlot => {
      dispatch(updateSummaryResults({ loadingQQPlot }));
    };
    const setQQPlotData = qqplotData => {
      dispatch(updateSummaryResults({ qqplotData }));
    };
    const setQQPlotLayout = qqplotLayout => {
      dispatch(updateSummaryResults({ qqplotLayout }));
    };
    const setQQPlotStacked = qqplotStacked => {
      dispatch(updateSummaryResults({ qqplotStacked }));
    };
    const setSampleSize = sampleSize => {
      dispatch(updateSummaryResults({ sampleSize }));
    };
    setQQPlotLoading(true);
    setQQPlotLayout({});
    setQQPlotData([]);
    setQQPlotStacked(false);
    setSampleSize(null);

    const table = variantTable.length === 1 ? variantTable[0] : 'stacked';

    if (table === 'stacked') {
      setQQPlotStacked(true);
    }

    const metadata = await query('metadata', {
      database: phenotype + '.db'
    });

    const countKey = plotType =>
      ({
        variant_all: 'count_all',
        stacked: ['count_female', 'count_male'],
        variant_female: 'count_female',
        variant_male: 'count_male'
      }[plotType]);

    const lambdaGCKey = plotType =>
      ({
        variant_all: 'lambdagc_all',
        stacked: ['lambdagc_female', 'lambdagc_male'],
        variant_female: 'lambdagc_female',
        variant_male: 'lambdagc_male'
      }[plotType]);

    if (table !== 'stacked') {
      const metadata_count = parseInt(metadata[countKey(table)]);
      setSampleSize(metadata_count);
      const metadata_lambdaGC = metadata[lambdaGCKey(table)]
        ? metadata[lambdaGCKey(table)]
        : 'TBD';

      const pCutOffValue = 0.001;

      const topVariantData = await query('variants', {
        database: phenotype + '.db',
        table,
        columns: ['chr', 'bp', 'snp', 'p', 'nlog_p', 'expected_p'],
        pMax: pCutOffValue,
        orderBy: 'p',
        order: 'asc',
        raw: true
      });
      let topObservedVariants = [];
      let topExpectedVariants = [];
      topVariantData.data.map(row => {
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
        })
      );
      console.log('topObservedVariants.length', topObservedVariants.length);

      const subsetVariantData = await query('variants', {
        database: phenotype + '.db',
        table,
        columns: ['nlog_p', 'expected_p'],
        pMin: pCutOffValue,
        orderBy: 'p',
        order: 'asc',
        plot_qq: true,
        raw: true
      });
      let subsetObservedVariants = [];
      let subsetExpectedVariants = [];
      subsetVariantData.data.map(row => {
        subsetObservedVariants.push(row[0]);
        subsetExpectedVariants.push(row[1]);
      });
      console.log(
        'subsetObservedVariants.length',
        subsetObservedVariants.length
      );

      const subsetMarkerColor = '#002a47';
      const topMarkerColor = '#006bb8';

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

      let qqplotSubsetData = {
        x: subsetExpectedVariants,
        y: subsetObservedVariants,
        hoverinfo: 'none',
        mode: 'markers',
        type: 'scattergl',
        marker: {
          color: subsetMarkerColor,
          size: 8
          // opacity: 0.65
        },
        showlegend: false
      };

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
          text:
            '<b>\u03BB</b> = ' +
            metadata_lambdaGC +
            '        <b>Sample Size</b> = ' +
            metadata_count.toLocaleString(),
          font: {
            family: 'Arial',
            size: 14,
            color: 'black'
          }
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
            }
          },
          tick0: 0,
          ticklen: 10,
          tickfont: {
            family: 'Arial',
            size: 10,
            color: 'black'
          }
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
            }
          },
          tick0: 0,
          ticklen: 10,
          tickfont: {
            family: 'Arial',
            size: 10,
            color: 'black'
          }
        }
      };
      setQQPlotLayout(qqplotLayout);
      setQQPlotData([qqplotTopData, qqplotSubsetData, qqplotLineData]);
    } else {
      const metadata_count_female = parseInt(metadata[countKey(table)[0]]);
      const metadata_count_male = parseInt(metadata[countKey(table)[1]]);
      setSampleSize(metadata_count_female + metadata_count_male);
      const metadata_lambdaGC_female = metadata[lambdaGCKey(table)[0]]
        ? metadata[lambdaGCKey(table)[0]]
        : 'TBD';
      const metadata_lambdaGC_male = metadata[lambdaGCKey(table)[1]]
        ? metadata[lambdaGCKey(table)[1]]
        : 'TBD';

      const pCutOffValue = 0.001;

      const topVariantDataFemale = await query('variants', {
        database: phenotype + '.db',
        table: 'variant_female',
        columns: ['chr', 'bp', 'snp', 'p', 'nlog_p', 'expected_p'],
        pMax: pCutOffValue,
        orderBy: 'p',
        order: 'asc',
        raw: true
      });
      let topObservedVariantsFemale = [];
      let topExpectedVariantsFemale = [];
      topVariantDataFemale.data.map(row => {
        topObservedVariantsFemale.push(row[4]);
        topExpectedVariantsFemale.push(row[5]);
      });
      const topObservedVariantsTextFemale = [];
      topVariantDataFemale.data.map(row =>
        topObservedVariantsTextFemale.push({
          chr: row[0],
          bp: row[1],
          snp: row[2],
          p: row[3]
        })
      );
      console.log(
        'topObservedVariantsFemale.length',
        topObservedVariantsFemale.length
      );

      const subsetVariantDataFemale = await query('variants', {
        database: phenotype + '.db',
        table: 'variant_female',
        columns: ['nlog_p', 'expected_p'],
        pMin: pCutOffValue,
        orderBy: 'p',
        order: 'asc',
        plot_qq: true,
        raw: true
      });
      let subsetObservedVariantsFemale = [];
      let subsetExpectedVariantsFemale = [];
      subsetVariantDataFemale.data.map(row => {
        subsetObservedVariantsFemale.push(row[0]);
        subsetExpectedVariantsFemale.push(row[1]);
      });
      console.log(
        'subsetObservedVariantsFemale.length',
        subsetObservedVariantsFemale.length
      );

      const topVariantDataMale = await query('variants', {
        database: phenotype + '.db',
        table: 'variant_male',
        columns: ['chr', 'bp', 'snp', 'p', 'nlog_p', 'expected_p'],
        pMax: pCutOffValue,
        orderBy: 'p',
        order: 'asc',
        raw: true
      });
      let topObservedVariantsMale = [];
      let topExpectedVariantsMale = [];
      topVariantDataMale.data.map(row => {
        topObservedVariantsMale.push(row[4]);
        topExpectedVariantsMale.push(row[5]);
      });
      const topObservedVariantsTextMale = [];
      topVariantDataMale.data.map(row =>
        topObservedVariantsTextMale.push({
          chr: row[0],
          bp: row[1],
          snp: row[2],
          p: row[3]
        })
      );
      console.log(
        'topObservedVariantsMale.length',
        topObservedVariantsMale.length
      );

      const subsetVariantDataMale = await query('variants', {
        database: phenotype + '.db',
        table: 'variant_male',
        columns: ['nlog_p', 'expected_p'],
        pMin: pCutOffValue,
        orderBy: 'p',
        order: 'asc',
        plot_qq: true,
        raw: true
      });
      let subsetObservedVariantsMale = [];
      let subsetExpectedVariantsMale = [];
      subsetVariantDataMale.data.map(row => {
        subsetObservedVariantsMale.push(row[0]);
        subsetExpectedVariantsMale.push(row[1]);
      });
      console.log(
        'subsetObservedVariantsMale.length',
        subsetObservedVariantsMale.length
      );

      const subsetMarkerColorFemale = '#b55117';
      const topMarkerColorFemale = '#e47618';
      const subsetMarkerColorMale = '#002a47';
      const topMarkerColorMale = '#006bb8';

      let qqplotTopDataFemale = {
        x: topExpectedVariantsFemale,
        y: topObservedVariantsFemale,
        text: topObservedVariantsTextFemale,
        hovertemplate:
          '<b>position:</b> %{text.chr}:%{text.bp}<br>' +
          '<b>p-value:</b> %{text.p}<br>' +
          '<b>snp:</b> %{text.snp}' +
          '<extra></extra>',
        hoverinfo: 'text',
        mode: 'markers',
        type: 'scattergl',
        marker: {
          color: topMarkerColorFemale,
          size: 8,
          opacity: 0.65
        },
        showlegend: false
      };

      let qqplotSubsetDataFemale = {
        x: subsetExpectedVariantsFemale,
        y: subsetObservedVariantsFemale,
        hoverinfo: 'none',
        mode: 'markers',
        type: 'scattergl',
        marker: {
          color: subsetMarkerColorFemale,
          size: 8
          // opacity: 0.65
        },
        showlegend: false
      };

      let qqplotLineDataFemale = {
        x: [0.0, qqplotTopDataFemale.x[0]],
        y: [0.0, qqplotTopDataFemale.x[0]],
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

      let qqplotTopDataMale = {
        x: topExpectedVariantsMale,
        y: topObservedVariantsMale,
        text: topObservedVariantsTextMale,
        hovertemplate:
          '<b>position:</b> %{text.chr}:%{text.bp}<br>' +
          '<b>p-value:</b> %{text.p}<br>' +
          '<b>snp:</b> %{text.snp}' +
          '<extra></extra>',
        hoverinfo: 'text',
        mode: 'markers',
        type: 'scattergl',
        marker: {
          color: topMarkerColorMale,
          size: 8,
          opacity: 0.65
        },
        showlegend: false
      };

      let qqplotSubsetDataMale = {
        x: subsetExpectedVariantsMale,
        y: subsetObservedVariantsMale,
        hoverinfo: 'none',
        mode: 'markers',
        type: 'scattergl',
        marker: {
          color: subsetMarkerColorMale,
          size: 8
          // opacity: 0.65
        },
        showlegend: false
      };

      let qqplotLineDataMale = {
        x: [0.0, qqplotTopDataMale.x[0]],
        y: [0.0, qqplotTopDataMale.x[0]],
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

      let qqplotLayoutFemale = {
        dragmode: 'pan',
        clickmode: 'event',
        hovermode: 'closest',
        width: 800,
        height: 800,
        title: {
          text:
            '<b>Female \u03BB</b> = ' +
            metadata_lambdaGC_female +
            '        <b>Female Sample Size</b> = ' +
            metadata_count_female.toLocaleString(),
          font: {
            family: 'Arial',
            size: 14,
            color: 'black'
          }
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
            }
          },
          tick0: 0,
          ticklen: 10,
          tickfont: {
            family: 'Arial',
            size: 10,
            color: 'black'
          }
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
            }
          },
          tick0: 0,
          ticklen: 10,
          tickfont: {
            family: 'Arial',
            size: 10,
            color: 'black'
          }
        }
      };
      let qqplotLayoutMale = {
        dragmode: 'pan',
        clickmode: 'event',
        hovermode: 'closest',
        width: 800,
        height: 800,
        title: {
          text:
            '<b>Male \u03BB</b> = ' +
            metadata_lambdaGC_male +
            '        <b>Male Sample Size</b> = ' +
            metadata_count_male.toLocaleString(),
          font: {
            family: 'Arial',
            size: 14,
            color: 'black'
          }
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
            }
          },
          tick0: 0,
          ticklen: 10,
          tickfont: {
            family: 'Arial',
            size: 10,
            color: 'black'
          }
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
            }
          },
          tick0: 0,
          ticklen: 10,
          tickfont: {
            family: 'Arial',
            size: 10,
            color: 'black'
          }
        }
      };
      setQQPlotLayout([qqplotLayoutFemale, qqplotLayoutMale]);
      setQQPlotData([
        [qqplotTopDataFemale, qqplotSubsetDataFemale, qqplotLineDataFemale],
        [qqplotTopDataMale, qqplotSubsetDataMale, qqplotLineDataMale]
      ]);
    }

    setQQPlotLoading(false);
  };
}

export function drawHeatmap(phenotypes) {
  return async function(dispatch) {
    const getZColor = (phenotype1, phenotype2, correlationData) => {
      var r2 = 0.0;
      if (phenotype1 in correlationData && phenotype2 in correlationData) {
        if (
          phenotype2 in correlationData[phenotype1] ||
          phenotype1 in correlationData[phenotype2]
        ) {
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
        if (
          phenotype2 in correlationData[phenotype1] ||
          phenotype1 in correlationData[phenotype2]
        ) {
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
    };
    const setPopupTooltipStyle = popupTooltipStyle => {
      dispatch(updatePhenotypeCorrelations({ popupTooltipStyle }));
    };
    const setPopupTooltipData = popupTooltipData => {
      dispatch(updatePhenotypeCorrelations({ popupTooltipData }));
    };

    setLoading(true);
    setPopupTooltipStyle({ display: 'none' });
    setPopupTooltipData(null);

    setHeatmapLayout({});
    setHeatmapData([]);

    const correlationData = await query(
      `data/sample_correlations_sanitized.json`
    );

    var uniquePhenotypes = phenotypes.map(phenotype =>
      phenotype.title ? phenotype.title : phenotype.label
    );
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
        ticktext: uniquePhenotypes.map(phenotype =>
          phenotype.length > 20 ? phenotype.substring(0, 20) + '...' : phenotype
        )
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
        ticktext: uniquePhenotypes.map(phenotype =>
          phenotype.length > 20 ? phenotype.substring(0, 20) + '...' : phenotype
        )
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
    var tableListNull = [];
    for (let i = 0; i < phenotypes.length; i++) {
      const { data } = await query('variants', {
        database: phenotypes[i].value + '.db',
        snp: variant
      });
      if (!data || data.length === 0) {
        tableListNull.push({
          phenotype: phenotypes[i].title
            ? phenotypes[i].title
            : phenotypes[i].label,
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
          data[j]['phenotype'] = phenotypes[i].title
            ? phenotypes[i].title
            : phenotypes[i].label;
          tableList.push(data[j]);
        }
      }
    }
    const numResults = tableList.length;
    tableList = tableList.concat(tableListNull);
    console.log("tableList", tableList);
    dispatch(
      updateVariantLookup({
        loading: false,
        results: tableList,
        numResults
      })
    );
  };
}

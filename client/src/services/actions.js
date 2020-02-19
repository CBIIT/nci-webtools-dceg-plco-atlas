import { query, rawQuery } from './query';

export const UPDATE_KEY = 'UPDATE_KEY';
export const UPDATE_SUMMARY_RESULTS = 'UPDATE_SUMMARY_RESULTS';
export const UPDATE_SUMMARY_TABLE = 'UPDATE_SUMMARY_TABLE';
export const UPDATE_SUMMARY_SNP_TABLE = 'UPDATE_SUMMARY_SNP_TABLE';
export const UPDATE_SUMMARY_SNP = 'UPDATE_SUMMARY_SNP';
export const UPDATE_VARIANT_LOOKUP = 'UPDATE_VARIANT_LOOKUP';
export const UPDATE_PHENOTYPE_CORRELATIONS = 'UPDATE_PHENOTYPE_CORRELATIONS';
export const UPDATE_PHENOTYPES = 'UPDATE_PHENOTYPES';
export const UPDATE_TMP_PHENOTYPES = 'UPDATE_TMP_PHENOTYPES';
export const UPDATE_BROWSE_PHENOTYPES = 'UPDATE_BROWSE_PHENOTYPES';
export const UPDATE_DOWNLOADS = 'UPDATE_DOWNLOADS';

export function updateKey(key, data) {
  return { type: UPDATE_KEY, key, data };
}

export function updatePhenotypes(data) {
  return { type: UPDATE_PHENOTYPES, data };
}

export function updateTmpPhenotypes(data) {
  return { type: UPDATE_TMP_PHENOTYPES, data };
}

export function updateSummaryResults(data) {
  return { type: UPDATE_SUMMARY_RESULTS, data };
}

export function updateSummaryTable(key, data) {
  return { type: UPDATE_SUMMARY_TABLE, key, data };
}

export function setSummaryTableLoading(loading) {
  return updateSummaryTable('loading', loading);
}

export function updateSummarySnp(key, data) {
  return { type: UPDATE_SUMMARY_SNP, key, data };
}

export function updateSummarySnpTable(key, data) {
  return { type: UPDATE_SUMMARY_SNP_TABLE, key, data };
}

export function setSummarySnpLoading(loading) {
  return updateSummarySnp('loading', loading);
}

export function updateVariantLookup(data) {
  return { type: UPDATE_VARIANT_LOOKUP, data };
}

export function updatePhenotypeCorrelations(data) {
  return { type: UPDATE_PHENOTYPE_CORRELATIONS, data };
}

export function updateBrowsePhenotypes(data) {
  return { type: UPDATE_BROWSE_PHENOTYPES, data };
}

export function updateDownloads(data) {
  return { type: UPDATE_DOWNLOADS, data };
}

export function initialize() {
  return async function(dispatch) {
    // update ranges
    const ranges = await query('ranges')
    dispatch(updateSummaryResults({ranges}));

    // update download root
    const { downloadRoot } = await query('config', {key: 'downloadRoot'})
    dispatch(updateDownloads({downloadRoot}));

    // update phenotypes
    const data = await query('phenotypes');
    const records = [];
    const categories = [];
    const populateRecords = node => {
      node.title = node.display_name;
      node.value = node.name;

      // only populate alphabetic phenotype list with leaf nodes
      if (node.children === undefined) {
        records.push({
          ...node
          // title: node.title,
          // value: node.value
        });
      } else {
        categories.push({
          ...node
          // title: node.title,
          // value: node.value,
          // color: node.color || '#444',
          // children: node.children
        });
      }
      if (node.children) {
        node.children.forEach(populateRecords);
      }
    };

    if (data && data.statusCode !== 500 ) {
      data.forEach(populateRecords, 0);
      const alphabetizedRecords = [...records].sort((a, b) =>
        a.title.localeCompare(b.title)
      );

      dispatch(updatePhenotypes({
        flat: alphabetizedRecords,
        categories: categories,
        tree: data
      }));
    }

    // update tmp_phenotypes
    const tmpData = await query('data/phenotypes.json');
    const tmpRecords = [];
    const tmpCategories = [];
    const tmpPopulateRecords = node => {
      // only populate alphabetic phenotype list with leaf nodes
      if (node.children === undefined) {
        tmpRecords.push({
          title: node.title,
          value: node.value
        });
      } else {
        tmpCategories.push({
          title: node.title,
          value: node.value,
          color: node.color || '#444',
          children: node.children
        });
      }
      if (node.children) {
        node.children.forEach(tmpPopulateRecords);
      }
    };
    tmpData.forEach(tmpPopulateRecords, 0);

    const tmpAlphabetizedRecords = [...tmpRecords].sort((a, b) =>
      a.title.localeCompare(b.title)
    );

    dispatch(updateTmpPhenotypes({
      flat: tmpAlphabetizedRecords,
      categories: tmpCategories,
      tree: tmpData
    }));
  }
}

export function fetchRanges() {
  return async function(dispatch) {
    const ranges = await query('ranges');
    dispatch(updateSummaryResults({ ranges }));
  };
}

export function fetchSummaryTable(tableKey, params) {
  return async function(dispatch) {
    dispatch(setSummaryTableLoading(true));

    // fetch variants given parameters
    const response = await query('variants', params);
    if (response.error) return;

    let results = response.data;

    // fetch results count (use key if supplied as parameter)
    let resultsCount = response.count || + await query('metadata', {
      database: params.database,
      key: params.key
    });

    dispatch(
      updateSummaryTable(tableKey, {
        results: results,
        resultsCount: resultsCount,
        page: 1 + Math.floor(params.offset / params.limit),
        pageSize: params.limit
      })
    );

    dispatch(setSummaryTableLoading(false));
  }
}

export function fetchSummarySnpTable(tableKey, params) {
  return async function(dispatch) {
    dispatch(setSummarySnpLoading(true));

    const response = await query('variants', params);
    if (response.error) return;

    dispatch(
      updateSummarySnpTable(tableKey, {
        results: response.data,
        resultsCount: response.count || response.data.length,
        page: 1 + Math.floor(params.offset / params.limit),
        pageSize: params.limit
      })
    );

    dispatch(setSummarySnpLoading(false));
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
    if (params.table.length === 2) {
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
    const setSampleSize = sampleSize => {
      dispatch(updateSummaryResults({ sampleSize }));
    };
    setQQPlotLoading(true);
    setQQPlotLayout({});
    setQQPlotData([]);
    setSampleSize(null);

    const table = variantTable.length === 1 ? variantTable[0] : 'stacked';

    const metadata = await query('metadata', {
      // database: phenotype + '.db'
      // phenotype_id,
      // gender,
      // chromosome
    });

    // const countKey = plotType =>
    //   ({
    //     variant_all: 'count_all',
    //     stacked: ['count_female', 'count_male'],
    //     variant_female: 'count_female',
    //     variant_male: 'count_male'
    //   }[plotType]);

    // const lambdaGCKey = plotType =>
    //   ({
    //     variant_all: 'lambdagc_all',
    //     stacked: ['lambdagc_female', 'lambdagc_male'],
    //     variant_female: 'lambdagc_female',
    //     variant_male: 'lambdagc_male'
    //   }[plotType]);

    // if (table !== 'stacked') {
      // const metadata_count = parseInt(metadata[countKey(table)]);
      const metadata_count = 100;
      setSampleSize(metadata_count);
      // const metadata_lambdaGC = metadata[lambdaGCKey(table)]
      //   ? metadata[lambdaGCKey(table)]
      //   : 'TBD';
      const metadata_lambdaGC = 1.0;

      const pCutOffValue = 0.001;

      const topVariantData = await query('variants', {
        // database: phenotype + '.db',
        table: 'ewings_sarcoma_2_variant',
        // gender:,
        columns: ['chr', 'bp', 'snp', 'p', 'nlog_p', 'expected_p'],
        p_value_max: pCutOffValue,
        orderBy: 'p_value',
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
        // database: phenotype + '.db',
        table: 'ewings_sarcoma_2_variant',
        // gender:,
        columns: ['nlog_p', 'expected_p'],
        p_value_min: pCutOffValue,
        orderBy: 'p_value',
        order: 'asc',
        show_qq_plot: true,
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

      const markerColor = {
        variant_all: '#F2990D',
        variant_female: '#f41c52',
        variant_male: '#006bb8'
      }[table];

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
          color: markerColor,
          size: 8,
          opacity: 0.65
        },
        // showlegend: false
      };

      let qqplotSubsetData = {
        x: subsetExpectedVariants,
        y: subsetObservedVariants,
        hoverinfo: 'none',
        mode: 'markers',
        type: 'scattergl',
        marker: {
          color: markerColor,
          size: 8
          // opacity: 0.65
        },
        // showlegend: false
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
        // showlegend: false
      };

      let qqplotLayout = {
        dragmode: 'pan',
        clickmode: 'event',
        hovermode: 'closest',
        // width: 800,
        // height: 800,
        autosize: true,
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
        },
        showlegend: false
      };
      setQQPlotLayout(qqplotLayout);
      setQQPlotData([qqplotTopData, qqplotSubsetData, qqplotLineData]);
    // } else {
    //   const metadata_count_female = parseInt(metadata[countKey(table)[0]]);
    //   const metadata_count_male = parseInt(metadata[countKey(table)[1]]);
    //   // set sampleSize to whichever gender has more variants
    //   setSampleSize(Math.max(metadata_count_female, metadata_count_male));
    //   const metadata_lambdaGC_female = metadata[lambdaGCKey(table)[0]]
    //     ? metadata[lambdaGCKey(table)[0]]
    //     : 'TBD';
    //   const metadata_lambdaGC_male = metadata[lambdaGCKey(table)[1]]
    //     ? metadata[lambdaGCKey(table)[1]]
    //     : 'TBD';

    //   const pCutOffValue = 0.001;

    //   const topVariantDataFemale = await query('variants', {
    //     database: phenotype + '.db',
    //     table: 'variant_female',
    //     columns: ['chr', 'bp', 'snp', 'p', 'nlog_p', 'expected_p'],
    //     pMax: pCutOffValue,
    //     orderBy: 'p',
    //     order: 'asc',
    //     raw: true
    //   });
    //   let topObservedVariantsFemale = [];
    //   let topExpectedVariantsFemale = [];
    //   topVariantDataFemale.data.map(row => {
    //     topObservedVariantsFemale.push(row[4]);
    //     topExpectedVariantsFemale.push(row[5]);
    //   });
    //   const topObservedVariantsTextFemale = [];
    //   topVariantDataFemale.data.map(row =>
    //     topObservedVariantsTextFemale.push({
    //       chr: row[0],
    //       bp: row[1],
    //       snp: row[2],
    //       p: row[3]
    //     })
    //   );
    //   console.log(
    //     'topObservedVariantsFemale.length',
    //     topObservedVariantsFemale.length
    //   );

    //   const subsetVariantDataFemale = await query('variants', {
    //     database: phenotype + '.db',
    //     table: 'variant_female',
    //     columns: ['nlog_p', 'expected_p'],
    //     pMin: pCutOffValue,
    //     orderBy: 'p',
    //     order: 'asc',
    //     plot_qq: true,
    //     raw: true
    //   });
    //   let subsetObservedVariantsFemale = [];
    //   let subsetExpectedVariantsFemale = [];
    //   subsetVariantDataFemale.data.map(row => {
    //     subsetObservedVariantsFemale.push(row[0]);
    //     subsetExpectedVariantsFemale.push(row[1]);
    //   });
    //   console.log(
    //     'subsetObservedVariantsFemale.length',
    //     subsetObservedVariantsFemale.length
    //   );

    //   const topVariantDataMale = await query('variants', {
    //     database: phenotype + '.db',
    //     table: 'variant_male',
    //     columns: ['chr', 'bp', 'snp', 'p', 'nlog_p', 'expected_p'],
    //     pMax: pCutOffValue,
    //     orderBy: 'p',
    //     order: 'asc',
    //     raw: true
    //   });
    //   let topObservedVariantsMale = [];
    //   let topExpectedVariantsMale = [];
    //   topVariantDataMale.data.map(row => {
    //     topObservedVariantsMale.push(row[4]);
    //     topExpectedVariantsMale.push(row[5]);
    //   });
    //   const topObservedVariantsTextMale = [];
    //   topVariantDataMale.data.map(row =>
    //     topObservedVariantsTextMale.push({
    //       chr: row[0],
    //       bp: row[1],
    //       snp: row[2],
    //       p: row[3]
    //     })
    //   );
    //   console.log(
    //     'topObservedVariantsMale.length',
    //     topObservedVariantsMale.length
    //   );

    //   const subsetVariantDataMale = await query('variants', {
    //     database: phenotype + '.db',
    //     table: 'variant_male',
    //     columns: ['nlog_p', 'expected_p'],
    //     pMin: pCutOffValue,
    //     orderBy: 'p',
    //     order: 'asc',
    //     plot_qq: true,
    //     raw: true
    //   });
    //   let subsetObservedVariantsMale = [];
    //   let subsetExpectedVariantsMale = [];
    //   subsetVariantDataMale.data.map(row => {
    //     subsetObservedVariantsMale.push(row[0]);
    //     subsetExpectedVariantsMale.push(row[1]);
    //   });
    //   console.log(
    //     'subsetObservedVariantsMale.length',
    //     subsetObservedVariantsMale.length
    //   );

    //   const markerColorFemale = '#f41c52';
    //   const markerColorMale = '#006bb8';

    //   let qqplotTopDataFemale = {
    //     x: topExpectedVariantsFemale,
    //     y: topObservedVariantsFemale,
    //     name: 'Female: <b>\u03BB</b> = ' + metadata_lambdaGC_female + '    <b>Sample Size</b> = ' + metadata_count_female.toLocaleString(),
    //     text: topObservedVariantsTextFemale,
    //     hovertemplate:
    //       '<b>position:</b> %{text.chr}:%{text.bp}<br>' +
    //       '<b>p-value:</b> %{text.p}<br>' +
    //       '<b>snp:</b> %{text.snp}' +
    //       '<extra></extra>',
    //     hoverinfo: 'text',
    //     mode: 'markers',
    //     type: 'scattergl',
    //     marker: {
    //       color: markerColorFemale,
    //       size: 8,
    //       opacity: 0.65
    //     },
    //     showlegend: false
    //   };

    //   let qqplotSubsetDataFemale = {
    //     x: subsetExpectedVariantsFemale,
    //     y: subsetObservedVariantsFemale,
    //     name: 'Female: <b>\u03BB</b> = ' + metadata_lambdaGC_female + '    <b>Sample Size</b> = ' + metadata_count_female.toLocaleString(),
    //     hoverinfo: 'none',
    //     mode: 'markers',
    //     type: 'scattergl',
    //     marker: {
    //       color: markerColorFemale,
    //       size: 8
    //       // opacity: 0.65
    //     },
    //     // showlegend: false
    //   };

    //   let qqplotLineDataFemale = {
    //     x: [0.0, qqplotTopDataFemale.x[0]],
    //     y: [0.0, qqplotTopDataFemale.x[0]],
    //     hoverinfo: 'none',
    //     mode: 'lines',
    //     type: 'scattergl',
    //     line: {
    //       color: 'gray',
    //       width: 1
    //     },
    //     opacity: 0.5,
    //     showlegend: false
    //   };

    //   let qqplotTopDataMale = {
    //     x: topExpectedVariantsMale,
    //     y: topObservedVariantsMale,
    //     name: 'Male:     <b>\u03BB</b> = ' + metadata_lambdaGC_male + '    <b>Sample Size</b> = ' + metadata_count_male.toLocaleString(),
    //     text: topObservedVariantsTextMale,
    //     hovertemplate:
    //       '<b>position:</b> %{text.chr}:%{text.bp}<br>' +
    //       '<b>p-value:</b> %{text.p}<br>' +
    //       '<b>snp:</b> %{text.snp}' +
    //       '<extra></extra>',
    //     hoverinfo: 'text',
    //     mode: 'markers',
    //     type: 'scattergl',
    //     marker: {
    //       color: markerColorMale,
    //       size: 8,
    //       opacity: 0.65
    //     },
    //     showlegend: false
    //   };

    //   let qqplotSubsetDataMale = {
    //     x: subsetExpectedVariantsMale,
    //     y: subsetObservedVariantsMale,
    //     name: 'Male:     <b>\u03BB</b> = ' + metadata_lambdaGC_male + '    <b>Sample Size</b> = ' + metadata_count_male.toLocaleString(),
    //     hoverinfo: 'none',
    //     mode: 'markers',
    //     type: 'scattergl',
    //     marker: {
    //       color: markerColorMale,
    //       size: 8
    //       // opacity: 0.65
    //     },
    //     // showlegend: false
    //   };

    //   let qqplotLineDataMale = {
    //     x: [0.0, qqplotTopDataMale.x[0]],
    //     y: [0.0, qqplotTopDataMale.x[0]],
    //     hoverinfo: 'none',
    //     mode: 'lines',
    //     type: 'scattergl',
    //     line: {
    //       color: 'gray',
    //       width: 1
    //     },
    //     opacity: 0.5,
    //     showlegend: false
    //   };

    //   let qqplotLayout = {
    //     dragmode: 'pan',
    //     clickmode: 'event',
    //     hovermode: 'closest',
    //     // width: 800,
    //     // height: 800,
    //     autosize: true,
    //     xaxis: {
    //       automargin: true,
    //       rangemode: 'tozero', // only show positive
    //       showgrid: false, // disable grid lines
    //       fixedrange: true, // disable zoom
    //       title: {
    //         text: '<b>Expected -log<sub>10</sub>(p)</b>',
    //         font: {
    //           family: 'Arial',
    //           size: 14,
    //           color: 'black'
    //         }
    //       },
    //       tick0: 0,
    //       ticklen: 10,
    //       tickfont: {
    //         family: 'Arial',
    //         size: 10,
    //         color: 'black'
    //       }
    //     },
    //     yaxis: {
    //       automargin: true,
    //       rangemode: 'tozero', // only show positive
    //       showgrid: false, // disable grid lines
    //       fixedrange: true, // disable zoom
    //       title: {
    //         text: '<b>Observed -log<sub>10</sub>(p)</b>',
    //         font: {
    //           family: 'Arial',
    //           size: 14,
    //           color: 'black'
    //         }
    //       },
    //       tick0: 0,
    //       ticklen: 10,
    //       tickfont: {
    //         family: 'Arial',
    //         size: 10,
    //         color: 'black'
    //       }
    //     },
    //     showlegend: true,
    //     legend: {
    //       x: 0.2,
    //       y: 1.1,
    //       orientation: 'v',
    //       itemclick: false,
    //       itemdoubleclick: false
    //     }
    //   };

    //   setQQPlotLayout(qqplotLayout);
    //   setQQPlotData([
    //     qqplotTopDataFemale,
    //     qqplotSubsetDataFemale,
    //     qqplotLineDataFemale,
    //     qqplotTopDataMale,
    //     qqplotSubsetDataMale,
    //     qqplotLineDataMale
    //   ]);
    // }

    setQQPlotLoading(false);
  };
}

export function drawHeatmap(phenotypes) {
  return async function(dispatch) {

    const filterCorrelationData = (phenotype1, phenotype2, correlationData) => {
      // console.log("filterCorrelationData", phenotype1, phenotype2);
      return correlationData.filter((data) => {
        return (data.phenotype_a === phenotype1.id && data.phenotype_b === phenotype2.id) || 
          (data.phenotype_a === phenotype2.id && data.phenotype_b === phenotype1.id);
      });
    };

    const getZ = (phenotype1, phenotype2, correlationData) => {
      var r2 = 0.0;
      var results = filterCorrelationData(phenotype1, phenotype2, correlationData);
      if (results.length > 0) {
        r2 = results[0].value;
      } else {
        r2 = 0.0;
      }
      var r2Color;
      if (r2 === -1.0 || r2 === 1.0) {
        r2Color = 0.0;
      } else {
        r2Color = r2;
      }

      return {
        r2Color,
        r2Text: {
          x: phenotype2.display_name,
          y: phenotype1.display_name,
          z: r2
        }
      };
    };

    const setHeatmapData = heatmapData => {
      dispatch(updatePhenotypeCorrelations({ heatmapData }));
    };
    const setHeatmapLayout = heatmapLayout => {
      dispatch(updatePhenotypeCorrelations({ heatmapLayout }));
    };

    setHeatmapLayout({});
    setHeatmapData([]);

    var phenotypesID = phenotypes.map((phenotype) =>
      phenotype.id
    );

    const correlationData = await query('correlations', {
      a: phenotypesID,
      b: phenotypesID
    });

    // const correlationData = await query('correlations');

    let n = phenotypes.length;
    let x = phenotypes;
    let y = phenotypes;
    let z = {
      zColor: [],
      zText: []
    };

    for (var xidx = 0; xidx < n; xidx++) {
      let rowColor = [];
      let rowText = [];
      for (var yidx = 0; yidx < n; yidx++) {
        let zData = getZ(x[xidx], y[yidx], correlationData)
        rowColor.push(zData['r2Color']);
        rowText.push(zData['r2Text']);
      }
      z.zColor.push(rowColor);
      z.zText.push(rowText);
    }

    let heatmapData = {
      x: phenotypes.map(phenotype => phenotype.name),
      y: phenotypes.map(phenotype => phenotype.name),
      z: z.zColor,
      zmin: -1.0,
      zmax: 1.0,
      text: z.zText,
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
      colorbar: {
        tickvals: [-1, -0.75, -0.5, -0.25, 0, 0.25, 0.5, 0.75, 1],
        tickmode: "array",
        thickness: 15,
        title: {
          text: 'Correlation',
          side: 'right'
        }
      },
      showscale: true,
      hoverinfo: 'text',
      hovertemplate:
        '%{text.x}<br>' +
        '%{text.y}<br>' +
        '<b>Correlation:</b> %{text.z}' +
        '<extra></extra>'
    };
    let heatmapLayout = {
      // width: 1000,
      // height: 1000,
      autosize: true,
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
        tickvals: phenotypes.map(phenotype => phenotype.name),
        ticktext: phenotypes.map(phenotype =>
          phenotype.display_name.length > 20 ? phenotype.display_name.substring(0, 20) + '...' : phenotype.display_name
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
        tickvals: phenotypes.map(phenotype => phenotype.name),
        ticktext: phenotypes.map(phenotype =>
          phenotype.display_name.length > 20 ? phenotype.display_name.substring(0, 20) + '...' : phenotype.display_name
        )
        // dtick: 5
      }
    };
    setHeatmapLayout(heatmapLayout);
    setHeatmapData([heatmapData]);
  };
}

export function lookupVariants(phenotypes, variant, gender) {
  return async function(dispatch) {
    dispatch(
      updateVariantLookup({
        results: [],
        submitted: new Date()
      })
    );

    const gender_table = {
      all: 'variant_all',
      combined: 'variant_all',
      female: 'variant_female',
      male: 'variant_male',
      undefined: 'variant_all'
    }[gender];

    var tableList = [];
    var tableListNull = [];
    var chr = null;
    var bp = null;
    if (variant.substring(0,3).toLowerCase() === "chr") {
      variant = variant.toLowerCase().replace("chr", "");
      var coord = variant.split(":");
      chr = coord[0];
      bp = coord[1];
    }
    for (let i = 0; i < phenotypes.length; i++) {
      var { data } = await query('variants', {
        database: phenotypes[i].value + '.db',
        table: gender_table,
        snp: chr && bp ? null : variant,
        chr: chr ? chr : null,
        bp: bp ? bp : null
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
          variant_id: 'not-found-' + phenotypes[i].title ? phenotypes[i].title : phenotypes[i].label,
          gender: gender,
        });
      } else {
        for (let j = 0; j < data.length; j++) {
          data[j]['phenotype'] = phenotypes[i].title
            ? phenotypes[i].title
            : phenotypes[i].label;
          data[j]['gender'] = gender;
          tableList.push(data[j]);
        }
      }
    }
    const numResults = tableList.length;
    tableList = tableList.concat(tableListNull);
    dispatch(
      updateVariantLookup({
        results: tableList,
        numResults
      })
    );
  };
}

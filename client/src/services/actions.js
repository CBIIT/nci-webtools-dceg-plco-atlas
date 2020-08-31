import { query, rawQuery, post } from './query';
import { systemFont } from '../components/plots/custom/text';
import { getInitialState } from './store';

export const UPDATE_KEY = 'UPDATE_KEY';
export const UPDATE_SUMMARY_RESULTS = 'UPDATE_SUMMARY_RESULTS';
export const UPDATE_QQ_PLOT = 'UPDATE_QQ_PLOT';
export const UPDATE_MANHATTAN_PLOT = 'UPDATE_MANHATTAN_PLOT';
export const UPDATE_SUMMARY_TABLE = 'UPDATE_SUMMARY_TABLE';
export const UPDATE_SUMMARY_SNP_TABLE = 'UPDATE_SUMMARY_SNP_TABLE';
export const UPDATE_SUMMARY_SNP = 'UPDATE_SUMMARY_SNP';
export const UPDATE_VARIANT_LOOKUP = 'UPDATE_VARIANT_LOOKUP';
export const UPDATE_VARIANT_LOOKUP_TABLE = 'UPDATE_VARIANT_LOOKUP_TABLE';
export const UPDATE_PHENOTYPE_CORRELATIONS = 'UPDATE_PHENOTYPE_CORRELATIONS';
export const UPDATE_HEATMAP = 'UPDATE_HEATMAP';
export const UPDATE_PHENOTYPES = 'UPDATE_PHENOTYPES';
export const UPDATE_BROWSE_PHENOTYPES = 'UPDATE_BROWSE_PHENOTYPES';
export const UPDATE_BROWSE_PHENOTYPES_PLOTS = 'UPDATE_BROWSE_PHENOTYPES_PLOTS';
export const UPDATE_DOWNLOADS = 'UPDATE_DOWNLOADS';
export const UPDATE_SHARED_STATE = 'UPDATE_SHARED_STATE';
export const UPDATE_ERROR = 'UPDATE_ERROR';

export function updateKey(key, data) {
  return { type: UPDATE_KEY, key, data };
}

export function updatePhenotypes(data) {
  return { type: UPDATE_PHENOTYPES, data };
}

export function updateSummaryResults(data) {
  return { type: UPDATE_SUMMARY_RESULTS, data };
}

export function updateManhattanPlot(data) {
  return { type: UPDATE_MANHATTAN_PLOT, data };
}

export function updateQQPlot(data) {
  return { type: UPDATE_QQ_PLOT, data };
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

export function updateVariantLookupTable(data) {
  return { type: UPDATE_VARIANT_LOOKUP_TABLE, data };
}

export function updatePhenotypeCorrelations(data) {
  return { type: UPDATE_PHENOTYPE_CORRELATIONS, data };
}

export function updateHeatmap(data) {
  return { type: UPDATE_HEATMAP, data };
}

export function updateBrowsePhenotypes(data) {
  return { type: UPDATE_BROWSE_PHENOTYPES, data };
}

export function updateBrowsePhenotypesPlots(data) {
  return { type: UPDATE_BROWSE_PHENOTYPES_PLOTS, data };
}

export function updateDownloads(data) {
  return { type: UPDATE_DOWNLOADS, data };
}

export function updateError(data) {
  return { type: UPDATE_ERROR, data };
}

export function initialize() {
  return async function initializeAction(dispatch) {
    try {
      // update ranges
      const ranges = await query('ranges')
      dispatch(updateSummaryResults({ranges}));

      const metadata = await query('metadata', {
        chromosome: 'all',
        countNotNull: true
      });

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
          tree: data,
          metadata: metadata
        }));
      }
    } catch (e) {
      dispatch(updateError({visible: true}))
    }
  }
}

export function fetchSummaryTable(tableKey, params) {
  return async function(dispatch, getState) {
    try {
      dispatch(setSummaryTableLoading(true));

      // previousCount is used when paginating or sorting existing results
      const previousCount = getState(state => state.summaryTables[tableKey]).resultsCount;
      const response = await query('variants', params);
      if (response.error) throw(response);

      dispatch(
        updateSummaryTable(tableKey, {
          results: response.data,
          // response.count is populated if params.count or params.metadataCount is set
          resultsCount: response.count || previousCount || response.data.length,
          page: 1 + Math.floor(params.offset / params.limit),
          pageSize: params.limit,
          offset: params.offset,
          limit: params.limit,
          orderBy: params.orderBy,
          order: params.order,
          chromosome: params.chromosome,
        })
      );
  
      dispatch(setSummaryTableLoading(false));
    } catch (e) {
      dispatch(updateError({visible: true}))
      dispatch(setSummaryTableLoading(false));
    }
  }
}

export function fetchSummarySnpTable(tableKey, params) {
  return async function(dispatch) {
    try {
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
    } catch (e) {
      dispatch(updateError({visible: true}))
      dispatch(setSummarySnpLoading(false));
    }
  };
}

/**
 *
 * @param {'summary'|'variants'} plotType
 * @param {object} params - database, chr, bpMin, bpMax, nlogpMin, nlogPmax
 */
export function drawManhattanPlot(plotType, params) {
  // console.log('drawing plot', plotType, params);
  return async function(dispatch) {
    try {  
      // retrieve metadata for all sexes provided
      const metadata = await query('metadata', {
        phenotype_id: params.phenotype_id,
        chromosome: 'all',
        sex: params.sex,
      });
      dispatch(updateQQPlot({ 
        sampleSize: metadata.reduce((a, b) => a + b.count, 0),
      }));

      dispatch(updateManhattanPlot({ loadingManhattanPlot: true }));
      if (params.sex.length === 2) {
        // if 2 tables are provided, this is a mirrored plot
        const manhattanPlotData = await rawQuery(plotType, {
          ...params,
          sex: params.sex[0]
        });
  
        const manhattanPlotMirroredData = await rawQuery(plotType, {
          ...params,
          sex: params.sex[1]
        });
  
        dispatch(
          updateManhattanPlot({
            manhattanPlotData,
            manhattanPlotMirroredData
          })
        );
      } else {
        const manhattanPlotData = await rawQuery(plotType, params);
        dispatch(
          updateManhattanPlot({
            manhattanPlotData,
            manhattanPlotMirroredData: {}
          })
        );
      }
  
      dispatch(updateManhattanPlot({ loadingManhattanPlot: false }));
    } catch (e) {
      dispatch(updateError({visible: true}))
      dispatch(updateManhattanPlot({ loadingManhattanPlot: false }));
    }
  };
}

export function drawQQPlot(phenotype, sex, ancestry) {
  return async function(dispatch) {
    try {
      dispatch(updateQQPlot({ 
        loadingQQPlot: true,
        qqplotData: [],
        qqplotLayout: {},
      }));
  
      const sexes = sex === 'stacked' ? ['female', 'male'] : [sex];
  
      // retrieve metadata for all sexes provided
      const metadata = await query('metadata', {
        phenotype_id: phenotype.id,
        chromosome: 'all',
        sex: sexes,
      });

      // the title property is only used for non-stacked plots
      // stacked plots use the legend instead as the title
      const title = sex === 'stacked' ? undefined : [
        `<b>\u03BB</b> = ${metadata[0].lambda_gc}`,
        `<b>Number of Variants</b> = ${metadata[0].count.toLocaleString()}`,
      ].join(' '.repeat(5));
  
      const layout = {
        hoverlabel: {
          bgcolor: "#fff",
          bordercolor: '#bbb',
          font: {
            size: 14,
            color: '#212529',
            family: systemFont
          },
        },
        dragmode: 'pan',
        clickmode: 'event',
        hovermode: 'closest',
        // width: 800,
        // height: 800,
        autosize: true,
        title: {
          text: title,
          font: {
            family: systemFont,
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
            family: systemFont,
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
              family: systemFont,
              size: 14,
              color: 'black'
            }
          },
          tick0: 0,
          ticklen: 10,
          tickfont: {
            family: systemFont,
            size: 10,
            color: 'black'
          }
        },
        showlegend: sex === 'stacked',
        legend: {
          itemclick: false,
          itemdoubleclick: false,
          orientation: "v",
          x: 0.2,
          y: 1.1
        }
      };

      dispatch(updateQQPlot({ 
        // loadingQQPlot: false,
        // qqplotData: data.flat(),
        qqplotLayout: layout,
        sampleSize: metadata.reduce((a, b) => a + b.count, 0),
      }));
      
      let data = [];

      await Promise.all(sexes.map(async sex => {
  
        // retrieve a subset of variants where show_qq_plot is true, and nlog_p is <= 3
        const subsetVariants = await query('points', {
          phenotype_id: phenotype.id,
          columns: ['p_value_nlog_expected', 'p_value_nlog'],
          sex,
          p_value_nlog_max: 3,
          // show_qq_plot: true,
          raw: true,
        });
  
        console.log(
          `${sex}.subsetVariants.length`,
          subsetVariants.data.length
        );
  
        // retrieve all variants where nlog_p >= 3
        const topVariants = await query('variants', {
          phenotype_id: phenotype.id,
          columns: [
            'p_value_nlog_expected', 
            'p_value_nlog', 
            'id'
          ],
          sex,
          p_value_nlog_min: 3,
          raw: true,
        });
  
        console.log(
          `${sex}.topVariants.length`,
          topVariants.data.length
        );
  
        const {lambda_gc, count} = metadata.find(m => m.sex === sex);
        const variants = subsetVariants.data.concat(topVariants.data);
        const maxExpectedNLogP = variants.reduce((a, b) => Math.max(a, b[0]), 0);
        const titleCase = str => str[0].toUpperCase() + str.substring(1, str.length).toLowerCase();
        const markerColor = {
          all: '#f2990d',
          female: '#f41c52',
          male: '#006bb8'
        }[sex];
  
        const newData =  [
          {
            x: [0, maxExpectedNLogP], // expected -log10(p)
            y: [0, maxExpectedNLogP], // expected -log10(p)
            hoverinfo: 'none',
            mode: 'lines',
            type: 'scattergl',
            line: {
              color: 'gray',
              width: 1
            },
            opacity: 0.5,
            showlegend: false
          },
          {
            x: variants.map(d => d[0]), // expected -log10(p)
            y: variants.map(d => d[1]), // observed -log10(p)
            customdata: variants.map(d => ({
              phenotype_id: phenotype.id,
              sex,
              ancestry,
              // properties below will be undefined for subsetVariants.data
              // we can use this to differentiate between these two datasets in each trace
              p: Math.pow(10, -d[1]),
              variantId: d[2]
              // expected_p: Math.pow(10, -d[0])
            })),
            name: `${titleCase(sex)}     <b>\u03BB</b> = ${lambda_gc}     <b>Number of Variants</b> = ${count.toLocaleString()}`,
            mode: 'markers',
            type: 'scattergl',
            hoverinfo: 'none',
            text: null,
            marker: {
              color: markerColor,
              size: 8,
              opacity: 0.65
            },
          }
        ];
        data.push(newData);
        dispatch(updateQQPlot({ 
          qqplotData: data.flat()
        }));
      }));

      dispatch(updateQQPlot({ 
        loadingQQPlot: false,
      }));
    } catch (e) {
      dispatch(updateError({visible: true}))
      dispatch(updateQQPlot({ 
        loadingQQPlot: true,
        qqplotData: [],
        qqplotLayout: {},
        sampleSize: null,
      }));
    }
  };
}

export function drawHeatmap({phenotypes, sex}) {
  return async function(dispatch) {
    try {
      const truncate = (str, limit = 20) => str.substring(0, limit) + (str.length > limit ? '...' : '');
      const ids = phenotypes.map(p => p.id);
      const heatmapIds = ids.map(id => `_${id}`); // needed for categorical x and y axes
      const names = phenotypes.map(p => p.display_name);
      const response = await query('correlations', {a: ids, b: ids});
  
      // match ids to correlation values
      const zData = ids.map(a => ids.map(b => response.find(p => 
        (p.phenotype_a == a && p.phenotype_b === b) ||
        (p.phenotype_a == b && p.phenotype_b === a)
      )));
  
      const heatmapData = {
        x: heatmapIds,
        y: heatmapIds,
        z: zData.map(row => row.map(correlation => {
          // ternary is a bit harder to read
          if (!correlation || [1, -1].includes(correlation.value)) 
            return 0;
          return correlation.value;
        })),
        customdata: zData,
        zmin: -1.0,
        zmax: 1.0,
        // text: z.zText,
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
        hoverinfo: 'none',
        // use custom tooltips instead of plotly defaults
        // hoverinfo: 'text',
        // hovertemplate:
        //   '%{text.x}<br>' +
        //   '%{text.y}<br>' +
        //   '<b>Correlation:</b> %{text.z}' +
        //   '<extra></extra>'
      };
      let heatmapLayout = {
        hoverlabel: {
          bgcolor: "#fff",
          bordercolor: '#bbb',
          font: {
            size: 14,
            color: '#212529',
            family: systemFont
          },
        },
        // width: 1000,
        // height: 1000,
        // autosize: true,
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
            family: systemFont,
            size: 10,
            color: 'black'
          },
          tickvals: heatmapIds, // use id to uniquely identify phenotype
          ticktext: names.map(name => truncate(name, 20)),
          // dtick: 5,
        },
        yaxis: {
          automargin: true,
          autorange: 'reversed',
          tickangle: 'auto',
          tickfont: {
            family: systemFont,
            size: 10,
            color: 'black'
          },
          tickvals: heatmapIds,
          ticktext: names.map(name => truncate(name, 20)),
          // dtick: 5
        }
      };
      dispatch(updateHeatmap({
        heatmapData: [heatmapData],
        heatmapLayout
      }));
  
      /*
  
      const filterCorrelationData = (phenotype1, phenotype2, correlationData) => {
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
  
      const initialState = getInitialState();
      dispatch(updateHeatmap(initialState.heatmap));
  
      var phenotypesID = phenotypes.map((phenotype) =>
        phenotype.id
      );
  
      const correlationData = await query('correlations', {
        a: phenotypesID,
        b: phenotypesID
      });
  
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
        x: phenotypes.map(phenotype => JSON.stringify(phenotype)),
        y: phenotypes.map(phenotype => JSON.stringify(phenotype)),
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
        hoverlabel: {
          bgcolor: "#fff",
          bordercolor: '#bbb',
          font: {
            size: 14,
            color: '#212529',
            family: systemFont
          },
        },
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
          tickvals: phenotypes.map(phenotype => JSON.stringify(phenotype)),
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
          tickvals: phenotypes.map(phenotype => JSON.stringify(phenotype)),
          ticktext: phenotypes.map(phenotype =>
            phenotype.display_name.length > 20 ? phenotype.display_name.substring(0, 20) + '...' : phenotype.display_name
          )
          // dtick: 5
        }
      };
      dispatch(updateHeatmap({
        heatmapData: [heatmapData],
        heatmapLayout
      }));
      */
    } catch (e) {
      dispatch(updateError({visible: true}))
    }
  };
}

export function lookupVariants({phenotypes, variant, sex, ancestry}) {
  return async function(dispatch) {
    try {
      const {variantLookupTable} = getInitialState();
      dispatch(
        updateVariantLookupTable(variantLookupTable)
      );
//      dispatch(updateVariantLookup())
//      dispatch(updateHeatmap(variantLookupTable));
      
      let chromosome = null;
      let position = null;
      let snp = null;
  
      // determine if we should query by snp or chromosome/position
      const coordinates = variant.match(/^chr(x|y|\d+):(\d+)$/i);
      if (coordinates) {
        [, chromosome, position] = coordinates;
      } else {
        snp = variant;
      }
  
      // null properties are not included in query
      const {data} = await query('variants', {
        phenotype_id: phenotypes.map(p => p.id),
        sex: sex === 'combined' ? ['female', 'male'] : sex,
        ancestry,
        chromosome,
        position,
        snp
      });
  
      // populate results
      const results = data.map(record => ({
        phenotype: phenotypes.find(p => p.id === record.phenotype_id).title,
        variant,
        ...record
      }));
  
      // populate empty results
      const emptyResults = phenotypes
        .filter(p => !data.find(r => r.phenotype_id === p.id))
        .map(p => ({
          phenotype: p.title || p.label,
          allele_reference: '-',
          allele_alternate: '-',
          position: '-',
          chromosome: '-',
          beta: '-',
          odds_ratio: '-',
          ci_95_low: null,
          ci_95_high: null,
          p_value: '-',
          variant_id: `not-found-${p.title || p.label}`,
          sex,
          ancestry,
          variant
        }));
  
      dispatch(
        updateVariantLookupTable({
          results: results.concat(emptyResults),
          numResults: results.length
        })
      );
    } catch (e) {
      dispatch(updateError({visible: true}))
      dispatch(
        updateVariantLookupTable({
          results: [],
          numResults: 0
        })
      );
    }
  }
}

// upload user's input parameters to db table share_link
// return share reference ID
export function generateShareLink(params) {
  return async function(dispatch) {
    try {
      // figure which store key to update by params route
      const updateStore = {
        "/gwas/summary": updateSummaryResults,
        "/gwas/lookup": updateVariantLookup,
        "/gwas/correlations": updatePhenotypeCorrelations,
        "/phenotypes": updateBrowsePhenotypes
      }[params.route];
      dispatch(
        updateStore({
          shareID: null
        })
      );
      const response = await post('share-link', params);
      dispatch(
        updateStore({
          shareID: response.share_id
        })
      );
    } catch (e) {
      dispatch(updateError({visible: true}))
    }
  };
}


import { query, rawQuery, post } from './query';
import { systemFont } from '../components/plots/custom/text';
import { getInitialState } from './store';

export const UPDATE_KEY = 'UPDATE_KEY';
export const UPDATE_SUMMARY_RESULTS = 'UPDATE_SUMMARY_RESULTS';
export const UPDATE_QQ_PLOT = 'UPDATE_QQ_PLOT';
export const UPDATE_MANHATTAN_PLOT = 'UPDATE_MANHATTAN_PLOT';
export const UPDATE_SUMMARY_TABLE = 'UPDATE_SUMMARY_TABLE';
export const UPDATE_SUMMARY_TABLE_INDEX = 'UPDATE_SUMMARY_TABLE_INDEX';
export const UPDATE_SUMMARY_SNP_TABLE = 'UPDATE_SUMMARY_SNP_TABLE';
export const UPDATE_SUMMARY_SNP_TABLE_INDEX = 'UPDATE_SUMMARY_SNP_TABLE_INDEX';
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

export function updateSummaryTableByIndex(key, data) {
  return { type: UPDATE_SUMMARY_TABLE_INDEX, key, data };
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

export function updateSummarySnpTableByIndex(key, data) {
  return { type: UPDATE_SUMMARY_SNP_TABLE_INDEX, key, data };
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


async function getInitialPhenotypes() {
  return {
    tree: await query('phenotypes'),
    metadata: await query('metadata', {chromosome: 'all'}),
  }
}

async function getInitialSummaryResults() {
  return {
    ranges: await query('ranges'),
    ...await query('config', { key: 'exportRowLimit' }),
  }
}

export function initialize() {
  return async function initializeAction(dispatch) {
    try {
      dispatch(updatePhenotypes(await getInitialPhenotypes()));
      dispatch(updateSummaryResults(await getInitialSummaryResults()));
      dispatch(updateDownloads(await query('config', { key: 'downloadRoot' })));
    } catch (e) {
      dispatch(updateError({ visible: true }));
    }
  };
}

export function fetchSummaryTable(tableKey, params) {
  return async function(dispatch, getState) {
    try {
      dispatch(setSummaryTableLoading(true));

      // previousCount is used when paginating or sorting existing results
      const previousCount = getState(state => state.summaryTables[tableKey])
        .resultsCount;
      const response = await query('variants', params);
      if (response.error) throw response;

      dispatch(
        updateSummaryTableByIndex(tableKey, {
          results: response.data,
          // response.count is populated if params.count or params.metadataCount is set
          resultsCount: response.count || previousCount || response.data.length,
          page: 1 + Math.floor(params.offset / params.limit),
          pageSize: params.limit,
          offset: params.offset,
          limit: params.limit,
          orderBy: params.orderBy,
          order: params.order,
          chromosome: params.chromosome
        })
      );

      dispatch(setSummaryTableLoading(false));
    } catch (e) {
      console.log('ERROR fetchSummaryTable', e);
      dispatch(updateError({ visible: true }));
      dispatch(setSummaryTableLoading(false));
    }
  };
}

export function fetchSummarySnpTable(tableKey, params) {
  return async function(dispatch) {
    try {
      dispatch(setSummarySnpLoading(true));

      const response = await query('variants', params);
      if (response.error) return;

      dispatch(
        updateSummarySnpTableByIndex(tableKey, {
          results: response.data,
          resultsCount: response.count || response.data.length,
          page: 1 + Math.floor(params.offset / params.limit),
          pageSize: params.limit
        })
      );

      dispatch(setSummarySnpLoading(false));
    } catch (e) {
      console.log('ERROR fetchSummarySnpTable', e);
      dispatch(updateError({ visible: true }));
      dispatch(setSummarySnpLoading(false));
    }
  };
}

export function submitSummaryResultsQuery({
  phenotypes,
  stratifications,
  isPairwise
}) {
  return async function(dispatch) {
    const initialState = getInitialState();
    for (let key of [
      'manhattanPlot',
      'qqPlot',
      'summaryTables',
      'summarySnpTables'
    ])
      dispatch(updateKey(key, initialState[key]));

    dispatch(drawQQPlot({ phenotypes, stratifications, isPairwise }));
    dispatch(
      drawManhattanPlot('summary', {
        phenotypes,
        stratifications,
        isPairwise,
        p_value_nlog_min: 2
      })
    );

    // fetch both summary results tables
    stratifications
      .filter(s => s.sex && s.ancestry)
      .forEach((stratification, i) => {
        const { sex, ancestry } = stratification;
        const phenotype = phenotypes[i] || phenotypes[0];
        dispatch(
          fetchSummaryTable(i, {
            phenotype_id: phenotype.id,
            sex,
            ancestry,
            offset: 0,
            limit: 10,
            orderBy: 'p_value',
            order: 'asc',
            metadataCount: true
          })
        );
      });

    // update summary results filters
    dispatch(
      updateSummaryResults({
        selectedPhenotypes: phenotypes,
        selectedStratifications: stratifications,
        manhattanPlotView: 'summary',
        selectedChromosome: null,
        isPairwise,
        nlogpMin: null,
        nlogpMax: null,
        bpMin: null,
        bpMax: null,
        submitted: new Date().getTime()
      })
    );
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
      const { phenotypes, stratifications, isPairwise } = params;

      dispatch(updateManhattanPlot({ loadingManhattanPlot: true }));

      const appendIndex = (index, record) => {
        record.columns.push('index');
        record.data.forEach(e => e.push(index));
      };

      if (isPairwise) {
        const manhattanPlotData = await rawQuery(plotType, {
          ...params,
          phenotype_id: phenotypes[0].id,
          sex: stratifications[0].sex,
          ancestry: stratifications[0].ancestry
        });
        appendIndex(0, manhattanPlotData);

        const manhattanPlotMirroredData = await rawQuery(plotType, {
          ...params,
          phenotype_id: (phenotypes[1] || phenotypes[0]).id,
          sex: stratifications[1].sex,
          ancestry: stratifications[1].ancestry
        });
        appendIndex(1, manhattanPlotMirroredData);

        dispatch(
          updateManhattanPlot({
            manhattanPlotData,
            manhattanPlotMirroredData
          })
        );
      } else {
        const manhattanPlotData = await rawQuery(plotType, {
          ...params,
          phenotype_id: phenotypes[0].id,
          sex: stratifications[0].sex,
          ancestry: stratifications[0].ancestry
        });
        appendIndex(0, manhattanPlotData);

        dispatch(
          updateManhattanPlot({
            manhattanPlotData,
            manhattanPlotMirroredData: {}
          })
        );
      }

      dispatch(updateManhattanPlot({ loadingManhattanPlot: false }));
    } catch (e) {
      console.log('ERROR drawManhattanPlot', e);
      dispatch(updateError({ visible: true }));
      dispatch(updateManhattanPlot({ loadingManhattanPlot: false }));
    }
  };
}

export function drawQQPlot({ phenotypes, stratifications, isPairwise }) {
  return async function(dispatch) {
    try {
      dispatch(
        updateQQPlot({
          loadingQQPlot: true,
          qqplotData: [],
          qqplotLayout: {}
        })
      );

      // retrieve metadata for all sexes provided
      const metadata = await query('metadata', {
        phenotype_id: phenotypes.map(p => p.id),
        chromosome: 'all'
      });

      stratifications = stratifications.map((s, i) => ({
        ...s,
        metadata: metadata.find(
          m =>
            m.phenotype_id === (phenotypes[i] || phenotypes[0]).id &&
            m.sex === s.sex &&
            m.ancestry === s.ancestry
        )
      }));

      // console.log(metadata, stratifications, phenotypes);

      // the title property is only used for non-stacked plots
      // stacked plots use the legend instead as the title
      const title = isPairwise
        ? undefined
        : [
            `<b>\u03BB</b> = ${stratifications[0].metadata.lambda_gc}`,
            `<b>Number of Variants</b> = ${stratifications[0].metadata.count.toLocaleString()}`
          ].join(' '.repeat(5));

      const layout = {
        hoverlabel: {
          bgcolor: '#fff',
          bordercolor: '#bbb',
          font: {
            size: 14,
            color: '#212529',
            family: systemFont
          }
        },
        dragmode: 'pan',
        clickmode: 'event',
        hovermode: 'closest',
        width: 800,
        height: 800,
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
        showlegend: isPairwise,
        legend: {
          itemclick: false,
          itemdoubleclick: false,
          orientation: 'v',
          x: 0.2,
          y: 1.1
        }
      };

      dispatch(
        updateQQPlot({
          qqplotLayout: layout,
          sampleSize: 0
        })
      );

      let qqplotData = [];

      await Promise.all(
        stratifications.map(async ({ sex, ancestry, metadata }, i) => {
          const { lambda_gc, count } = metadata;

          const { data, columns } = await query('points', {
            phenotype_id: (phenotypes[i] || phenotypes[0]).id,
            sex,
            ancestry,
            raw: true
          });

          const expectedValues = data.map(
            d => d[columns.indexOf('p_value_nlog_expected')]
          );
          const observedValues = data.map(
            d => d[columns.indexOf('p_value_nlog')]
          );
          const ids = data.map(d => d[columns.indexOf('id')]);
          const maxExpectedValue = expectedValues.reduce((a, b) =>
            b > a ? b : a
          );
          const titleCase = str =>
            str.replace(
              /\w+/g,
              str =>
                str[0].toUpperCase() +
                str.substring(1, str.length).toLowerCase()
            );
          const markerColor = isPairwise
            ? ['#f41c52', '#006bb8'][i]
            : '#f2990d';
          const titlePrefix =
            isPairwise && phenotypes[1]
              ? `${phenotypes[i].display_name} - `
              : '';

          qqplotData = qqplotData.concat([
            {
              x: [0, maxExpectedValue], // expected -log10(p)
              y: [0, maxExpectedValue], // expected -log10(p)
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
              x: expectedValues, // expected -log10(p)
              y: observedValues, // observed -log10(p)
              customdata: data.map((d, i) => ({
                phenotypeId: (phenotypes[i] || phenotypes[0]).id,
                sex,
                ancestry,
                variantId: ids[i],
                p: Math.pow(10, -observedValues[i]),
                showData: i <= 10000,
                color: markerColor
              })),
              name: `${titlePrefix +
                titleCase(
                  `${ancestry} - ${sex}`
                )}     <b>\u03BB</b> = ${lambda_gc}     <b>Number of Variants</b> = ${count.toLocaleString()}`,
              mode: 'markers',
              type: 'scattergl',
              hoverinfo: 'none',
              text: null,
              marker: {
                color: markerColor,
                size: 8,
                opacity: 0.65
              }
            }
          ]);

          dispatch(updateQQPlot({ qqplotData }));
        })
      );

      dispatch(
        updateQQPlot({
          loadingQQPlot: false
        })
      );
    } catch (e) {
      dispatch(updateError({ visible: true }));
      dispatch(
        updateQQPlot({
          loadingQQPlot: true,
          qqplotData: [],
          qqplotLayout: {},
          sampleSize: null
        })
      );
    }
  };
}

export function drawHeatmap({ phenotypes, sex }) {
  return async function(dispatch) {
    try {
      const truncate = (str, limit = 20) =>
        str.substring(0, limit) + (str.length > limit ? '...' : '');
      const ids = phenotypes.map(p => p.id);
      const heatmapIds = ids.map(id => `_${id}`); // needed for categorical x and y axes
      const names = phenotypes.map(p => p.display_name);
      const response = await query('correlations', { a: ids, b: ids });

      // match ids to correlation values
      const zData = ids.map(a =>
        ids.map(b =>
          response.find(
            p =>
              (p.phenotype_a == a && p.phenotype_b === b) ||
              (p.phenotype_a == b && p.phenotype_b === a)
          )
        )
      );

      const heatmapData = {
        x: heatmapIds,
        y: heatmapIds,
        z: zData.map(row =>
          row.map(correlation => {
            // ternary is a bit harder to read
            if (!correlation || [1, -1].includes(correlation.value)) return 0;
            return correlation.value;
          })
        ),
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
          tickmode: 'array',
          thickness: 15,
          title: {
            text: 'Correlation',
            side: 'right'
          }
        },
        showscale: true,
        hoverinfo: 'none'
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
          bgcolor: '#fff',
          bordercolor: '#bbb',
          font: {
            size: 14,
            color: '#212529',
            family: systemFont
          }
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
          ticktext: names.map(name => truncate(name, 20))
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
          ticktext: names.map(name => truncate(name, 20))
          // dtick: 5
        }
      };
      dispatch(
        updateHeatmap({
          heatmapData: [heatmapData],
          heatmapLayout
        })
      );
    } catch (e) {
      dispatch(updateError({ visible: true }));
    }
  };
}

export function lookupVariants({ phenotypes, variant, sex, ancestry }) {
  return async function(dispatch) {
    try {
      const { variantLookupTable } = getInitialState();
      dispatch(updateVariantLookupTable(variantLookupTable));
      //      dispatch(updateVariantLookup())
      //      dispatch(updateHeatmap(variantLookupTable));

      let chromosome = null;
      let position = null;
      let snp = variant;

      // // determine if we should query by snp or chromosome/position
      // const coordinates = variant.match(/^chr(x|y|\d+):\d+$/i);
      // if (coordinates) {
      //   [, chromosome, position] = coordinates;
      // } else {
      //   snp = variant;
      // }

      // null properties are not included in query
      const { data } = await query('variants', {
        phenotype_id: phenotypes.map(p => p.id),
        sex,
        ancestry,
        chromosome,
        position,
        snp
      });

      // populate results
      const results = data.map(record => ({
        phenotype: phenotypes.find(p => p.id === record.phenotype_id).title,
        type: phenotypes.find(p => p.id === record.phenotype_id).type,
        variant,
        ancestry,
        sex,
        ...record
      }));
  
      // populate empty results
      const emptyResults = phenotypes
        .filter(p => !data.find(r => r.phenotype_id === p.id))
        .map(p => ({
          phenotype: p.title || p.label,
          sex,
          ancestry,
          variant,
          variant_id: `not-found-${p.title || p.label}`,
          chromosome: null,
          position: null,
          allele_effect: null,
          allele_non_effect: null,
          beta: null,
          odds_ratio: null,
          p_value: null,
          p_value_heterogenous: null,
          n: null,
        }));

      dispatch(
        updateVariantLookupTable({
          results: results.concat(emptyResults),
          numResults: results.length
        })
      );
    } catch (e) {
      dispatch(updateError({ visible: true }));
      dispatch(
        updateVariantLookupTable({
          results: [],
          numResults: 0
        })
      );
    }
  };
}

// upload user's input parameters to db table share_link
// return share reference ID
export function generateShareLink(params) {
  return async function(dispatch) {
    try {
      // figure which store key to update by params route
      const updateStore = {
        '/gwas/summary': updateSummaryResults,
        '/gwas/lookup': updateVariantLookup,
        '/gwas/correlations': updatePhenotypeCorrelations,
        '/phenotypes': updateBrowsePhenotypes
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
      dispatch(updateError({ visible: true }));
    }
  };
}

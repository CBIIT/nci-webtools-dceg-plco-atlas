import React, { useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import LoadingOverlay from 'react-loading-overlay';
import { plotOverlayConfig } from '../../../controls/table/table';
import { query } from '../../../../services/query';
import { ManhattanPlot as Plot } from '../../../plots/custom/manhattan-plot/manhattan-plot';
import { Icon } from '../../../controls/icon/icon';
import {
  createElement as h,
  extent
} from '../../../plots/custom/utils';
import { systemFont } from '../../../plots/custom/text';
import {
  updateSummaryResults,
  updateManhattanPlot
} from '../../../../services/actions';

export function ManhattanPlot({
  onAllChromosomeSelected,
  onChromosomeSelected,
  onVariantLookup,
  onZoom,
  loading,
  panelCollapsed
}) {
  const dispatch = useDispatch();
  const [genePlotCollapsed, setGenePlotCollapsed] = useState(false);
  const plotContainer = useRef(null);
  const plotPlaceholderContainer = useRef(null);
  const plot = useRef(null);

  const {
    selectedPhenotypes,
    selectedStratifications,
    selectedChromosome,
    selectedPlot,
    manhattanPlotView,
    isPairwise,
    ranges,
    bpMin,
    bpMax,
    nlogpMin,
    nlogpMax,
  } = useSelector(state => state.summaryResults);

  const {
    manhattanPlotData,
    manhattanPlotMirroredData,
    manhattanPlotConfig,
    restoredZoomLevel,
    zoomStack,
    genes,
    restore
  } = useSelector(state => state.manhattanPlot);

  const hasData = () =>
    manhattanPlotData &&
    manhattanPlotData.data &&
    manhattanPlotData.data.length &&
    (!isPairwise ||
      (isPairwise &&
        manhattanPlotMirroredData &&
        manhattanPlotMirroredData.data &&
        manhattanPlotMirroredData.data.length));

  const setManhattanPlotConfig = manhattanPlotConfig => {
    dispatch(updateManhattanPlot({ manhattanPlotConfig }));
  };

  const setZoomStack = zoomStack => {
    dispatch(updateManhattanPlot({ zoomStack }));
  };

  const setGenes = genes => {
    dispatch(updateManhattanPlot({ genes }));
  };

  const colors = {
    single: {
      light: '#F2990D',
      dark: '#A76909'
    },
    bottom: {
      light: '#006bb8',
      dark: '#002a47'
    },
    top: {
      light: '#f41c52',
      dark: '#a2173a'
    }
  };

  const asTitleCase = snakeCase =>
    snakeCase
      .replace(/_+/g, ' ')
      .replace(
        /\w+/g,
        word => word[0].toUpperCase() + word.substr(1).toLowerCase()
      );

  const getTitle = bounds => {
    const phenotypes = selectedPhenotypes
      .map(
        (p, i) =>
          (isPairwise && selectedPhenotypes[1]
            ? ['Top: ', 'Bottom: '][i]
            : '') + p.display_name
      )
      .join(' / ');

    return `${phenotypes} ${
      selectedChromosome ? `- Chromosome ${selectedChromosome == 23 ? 'X' : selectedChromosome}` : ``
    } ${
      !bounds
        ? ''
        : ' - ' +
          [bounds.xMin, bounds.xMax]
            .map(n => `${(n / 1e6).toPrecision(4)} MB`)
            .join(' - ')
    }`;
  };

  const getPairwiseTitles = () => {
    return selectedStratifications.map(s =>
      asTitleCase(`${s.ancestry} - ${s.sex}`)
    );
  };

  useEffect(() => {
    if (selectedPlot !== 'manhattan-plot' || !hasData()) return;
    (async () => {

      // removeChildren(plotContainer.current);
      plotContainer.current.innerHTML = '';

      let params;
      if (isPairwise) {
        params =
          manhattanPlotView === 'summary'
            ? getMirroredSummaryPlot(manhattanPlotData, manhattanPlotMirroredData)
            : getMirroredChromosomePlot(
                manhattanPlotData,
                manhattanPlotMirroredData
              );
      } else {
        params =
          manhattanPlotView === 'summary'
            ? getSummaryPlot(manhattanPlotData)
            : getChromosomePlot(manhattanPlotData);
      }
      let config = { ...params };
      config.genes = genes;
      config.zoomStack = zoomStack;

      // add pan limits based on currently selected chromosome
      if (selectedChromosome) {
        let xRange = ranges.find(r => +r.chromosome === +selectedChromosome);
        config.windowLimits = {
          xMin: xRange.position_min,
          xMax: xRange.position_max,
          yMin: 2,
        };
      }

      if (manhattanPlotConfig) {
        if (manhattanPlotConfig.title) config.title = manhattanPlotConfig.title;

        if (manhattanPlotConfig.zoomWindow)
          config.zoomWindow = manhattanPlotConfig.zoomWindow;

        if (manhattanPlotConfig.xAxis) {
          config.xAxis.extent = manhattanPlotConfig.xAxis.extent;
          config.xAxis.defaultExtent = manhattanPlotConfig.xAxis.defaultExtent;
        }

        if (manhattanPlotConfig.yAxis) {
          config.yAxis.extent = manhattanPlotConfig.yAxis.extent;
          config.yAxis.defaultExtent = manhattanPlotConfig.yAxis.defaultExtent;
        }

        if (manhattanPlotConfig.yAxis2) {
          config.yAxis2.extent = manhattanPlotConfig.yAxis2.extent;
          config.yAxis2.defaultExtent = manhattanPlotConfig.yAxis2.defaultExtent;
        }
      }

      if (restore) {
        dispatch(updateManhattanPlot({restore: false}));
        if (bpMin && bpMax &&  nlogpMin && nlogpMax) {
          config.xAxis.extent = [bpMin, bpMax];
          config.yAxis.extent = [nlogpMin, nlogpMax];
          config.title = [
            {
              text: getTitle({xMin: bpMin, xMax: bpMax, yMin: nlogpMin, yMax: nlogpMax}),
              font: `600 16px ${systemFont}`
            }
          ];
          config.zoomWindow = {bounds: {
            xMin: bpMin,
            xMax: bpMax,
            yMin: nlogpMin,
            yMax: nlogpMax
          }}
        }
      }

      plot.current = new Plot(plotContainer.current, config);
      if (genes && genes.length) {
        plot.current.drawGenes(genes);
      }
      else plot.current.clearGenes();
      // setZoomStack([]);
    })();

    return () => {
      // plot.current.destroy();
    };
  }, [
    manhattanPlotData,
    manhattanPlotMirroredData,
    selectedPlot,
    selectedChromosome,
  ]);

  useEffect(() => {
    plot.current && plot.current.redraw();
  }, [panelCollapsed]);

  useEffect(() => {
    let plot;
    // Create placeholder plot for when we have no data
    if (loading && !hasData()) {
      let config = {
        data: [{ x: 0, y: 0 }, { x: 1, y: 1 }],
        title: [
          {
            text: getTitle(),
            font: `600 16px ${systemFont}`
          }
        ],
        xAxis: {
          title: [],
          key: 'x',
          ticks: []
        },
        yAxis: {
          key: 'y',
          ticks: [],
          title: [
            { text: `-log`, font: `600 14px ${systemFont}` },
            {
              text: '10',
              textBaseline: 'middle',
              font: `600 10px ${systemFont}`
            },
            { text: `(p)`, font: `600 14px ${systemFont}` }
          ]
        },
        lines: [{ y: -Math.log10(5e-8), style: 'dashed' }],
        point: {
          size: 1,
          interactiveSize: 1,
          opacity: 0
        }
      };

      let stackedConfig = {
        mirrored: true,
        data: [{ x: 0, y: 0 }, { x: 1, y: 1 }],
        data2: [{ x: 0, y: 0 }, { x: 1, y: 1 }],
        title: [
          {
            text: getTitle(),
            font: `600 16px ${systemFont}`
          }
        ],
        xAxis: {
          key: 'x',
          ticks: [],
          title: []
        },
        yAxis: {
          key: 'y',
          ticks: [],
          title: [
            { text: `-log`, font: `600 14px ${systemFont}` },
            {
              text: '10',
              textBaseline: 'middle',
              font: `600 10px ${systemFont}`
            },
            { text: `(p)`, font: `600 14px ${systemFont}` }
          ],
          secondaryTitle: [
            { text: getPairwiseTitles()[0], font: `600 11px ${systemFont}` }
          ]
        },
        yAxis2: {
          key: 'x',
          ticks: [],
          secondaryTitle: [
            {
              text: getPairwiseTitles()[1],
              font: `600 11px ${systemFont}`
            }
          ]
        },
        lines: [{ y: 0, style: 'dashed' }],
        point: {
          size: 1,
          interactiveSize: 1,
          opacity: 0
        }
      };

      let plotConfig = isPairwise ? stackedConfig : config;

      plot = new Plot(plotPlaceholderContainer.current, plotConfig);
    }
    return () => plot && plot.destroy();
  }, [loading]);

  function getMirroredSummaryPlot(plotData, mirroredPlotData) {
    let columnIndexes = {
      chr: plotData.columns.indexOf('chromosome'),
      bp: plotData.columns.indexOf('position_abs'),
      nLogP: plotData.columns.indexOf('p_value_nlog')
    };

    let yExtent = extent(
      [...plotData.data, ...mirroredPlotData.data].map(
        d => d[columnIndexes.nLogP]
      )
    );
    yExtent[1] *= 1.1;

    return {
      mirrored: true,
      data: plotData.data,
      data2: mirroredPlotData.data,
      genes: plotData.genes,
      title: [
        {
          text: getTitle(),
          font: `600 16px ${systemFont}`
        }
      ],
      xAxis: {
        title: null,
        key: columnIndexes.bp,
        tickFormat: tick => (tick / 1e6).toPrecision(3) + ' MB',
        ticks: ranges
          .filter(r => r.id <= 23)
          .map(r => +r.position_abs_max),
        tickFormat: (tick, i) => +ranges[i].chromosome,
        labelsBetweenTicks: true,
        allowSelection: true,
        onSelected: (range, i) => {
          onChromosomeSelected(ranges[i].id);
        }
      },
      yAxis: {
        title: [
          { text: `-log`, font: `600 14px ${systemFont}` },
          {
            text: '10',
            textBaseline: 'middle',
            font: `600 10px ${systemFont}`
          },
          { text: `(p)`, font: `600 14px ${systemFont}` }
        ],
        secondaryTitle: [
          { text: getPairwiseTitles()[0], font: `600 11px ${systemFont}` }
        ],
        key: columnIndexes.nLogP,
        tickFormat: tick => tick.toPrecision(3),
        extent: yExtent
      },
      yAxis2: {
        secondaryTitle: [
          { text: getPairwiseTitles()[1], font: `600 11px ${systemFont}` }
        ]
      },
      point: {
        size: 2,
        opacity: 1,
        color: (d, i) =>
          +d[columnIndexes.chr] % 2 ? colors.top.light : colors.top.dark
      },
      point2: {
        color: (d, i) =>
          +d[columnIndexes.chr] % 2 ? colors.bottom.light : colors.bottom.dark
      },
      lines: [{ y: -Math.log10(5e-8), style: 'dashed' }]
    };
  }

  function getMirroredChromosomePlot(plotData, mirroredPlotData) {
    let columnIndexes = {
      variantId: plotData.columns.indexOf('id'),
      chr: plotData.columns.indexOf('chromosome'),
      bp: plotData.columns.indexOf('position'),
      nLogP: plotData.columns.indexOf('p_value_nlog'),
      index: plotData.columns.indexOf('index')
    };

    let withKeys = data => ({
      variantId: data[columnIndexes.variantId],
      chr: data[columnIndexes.chr],
      bp: data[columnIndexes.bp],
      nLogP: data[columnIndexes.nLogP],
      index: data[columnIndexes.index]
    });

    let title = getTitle();
    let range = ranges.find(r => r.chromosome == selectedChromosome);

    let yExtent = extent(
      [...plotData.data, ...mirroredPlotData.data].map(
        d => d[columnIndexes.nLogP]
      )
    );
    yExtent[1] *= 1.1;

    return {
      mirrored: true,
      data: plotData.data,
      data2: mirroredPlotData.data,
      genes: plotData.genes,
      allowZoom: true,
      allowPan: true,

      onPan: bounds => {
        plot.current.setTitle([
          {
            text: getTitle(bounds),
            font: `600 16px ${systemFont}`
          }
        ]);
      },

      onZoom: async e => {
        let config = plot.current.config;
        let { xAxis, zoomStack } = config;
        let stack = [...zoomStack]; // need new reference, since zoomStack updates
        let zoomRange = Math.abs(xAxis.extent[1] - xAxis.extent[0]);
        setManhattanPlotConfig({ ...config });
        setZoomStack(stack);
        onZoom(e);

        let bounds =
          zoomStack.length > 0 ? zoomStack[zoomStack.length - 1].bounds : null;

        // console.log(bounds, getTitle(bounds));
        plot.current.setTitle([
          {
            text: getTitle(bounds),
            font: `600 16px ${systemFont}`
          }
        ]);

        // draw genes if zoom is at less than 50 MB
        setGenes([]);
        plot.current.drawGenes([]);
        if (zoomRange <= 2e6) {
          let genes = await query('genes', {
            chromosome: selectedChromosome,
            transcription_start: xAxis.extent[0],
            transcription_end: xAxis.extent[1]
          });
          plot.current.drawGenes(genes);
          setGenes(genes);
        }
      },
      title: [{ text: title, font: `600 16px ${systemFont}` }],
      xAxis: {
        title: null,
        key: columnIndexes.bp,
        tickFormat: tick => (tick / 1e6).toPrecision(4) + ' MB',
        extent: [range.position_min, range.position_max]
      },
      yAxis: {
        title: [
          { text: `-log`, font: `600 14px ${systemFont}` },
          {
            text: '10',
            textBaseline: 'middle',
            font: `600 10px ${systemFont}`
          },
          { text: `(p)`, font: `600 14px ${systemFont}` }
        ],
        secondaryTitle: [
          { text: getPairwiseTitles()[0], font: `600 11px ${systemFont}` }
        ],
        key: columnIndexes.nLogP,
        tickFormat: tick => tick.toPrecision(3),
        extent: yExtent
      },
      yAxis2: {
        secondaryTitle: [
          { text: getPairwiseTitles()[1], font: `600 11px ${systemFont}` }
        ]
      },
      point: {
        size: 2,
        interactiveSize: 3,
        opacity: 1,
        color: selectedChromosome % 2 ? colors.top.light : colors.top.dark,
        tooltip: {
          trigger: 'hover',
          class: 'custom-tooltip',
          style: 'width: 300px;',
          content: async (data, index) => {
            let point = withKeys(data);
            // console.log(point);
            const response = await query('variants', {
              phenotype_id: (
                selectedPhenotypes[point.index] || selectedPhenotypes[0]
              ).id,
              id: point.variantId,
              ancestry: selectedStratifications[point.index].ancestry,
              sex: selectedStratifications[point.index].sex
            });
            const record = response.data[0];
            return h('div', { className: '' }, [
              h('div', null, [
                h('b', null, 'position: '),
                // `${(record.bp / 1e6).toFixed(4)} MB`
                `${record.chromosome}:${record.position}`
              ]),
              h('div', null, [h('b', null, 'p-value: '), `${record.p_value}`]),
              h('div', null, [h('b', null, 'snp: '), `${record.snp}`]),
              h('div', null, [
                h(
                  'a',
                  {
                    className: 'font-weight-bold',
                    href: '#/gwas/lookup',
                    onclick: () => onVariantLookup && onVariantLookup(record)
                  },
                  'Go to Variant Lookup'
                )
              ]),
              h('div', null, [
                h(
                  'a',
                  {
                    className: 'font-weight-bold',
                    href: `https://www.ebi.ac.uk/gwas/search?query=${record.snp}`,
                    target: '_blank'
                  },
                  'Go to GWAS Catalog'
                )
              ])
            ]);
          }
        }
      },
      point2: {
        color: selectedChromosome % 2 ? colors.bottom.light : colors.bottom.dark
      },
      lines: [{ y: -Math.log10(5e-8), style: 'dashed' }],
      zoomStack: (plot.current && plot.current.zoomStack) || [],
      geneTooltipContent: gene => {
        return h('div', { className: '' }, [
          h('div', null, [h('b', null, 'gene: '), `${gene.originalName}`]),
          h('div', null, [
            h('b', null, 'position: '),
            `chr${selectedChromosome}:${gene.transcription_start}-${gene.transcription_end}`
          ]),
          h('div', null, [
            h(
              'a',
              {
                className: 'font-weight-bold',
                href: `https://www.ncbi.nlm.nih.gov/gene/?term=(${gene.originalName}%5BGene+Name%5D)+AND+homo+sapiens%5BOrganism%5D`,
                target: '_blank'
              },
              'Go to NCBI Gene'
            )
          ])
        ]);
      },      
    };
  }

  function getSummaryPlot(plotData) {
    let columnIndexes = {
      chr: plotData.columns.indexOf('chromosome'),
      bp: plotData.columns.indexOf('position_abs'),
      nLogP: plotData.columns.indexOf('p_value_nlog')
    };

    let yExtent = extent([...plotData.data].map(d => d[columnIndexes.nLogP]));
    yExtent[1] *= 1.1;

    return {
      data: plotData.data,
      genes: plotData.genes,
      title: [
        {
          text: getTitle(),
          font: `600 16px ${systemFont}`
        }
      ],
      xAxis: {
        title: null,
        key: columnIndexes.bp,
        tickFormat: tick => (tick / 1e6).toPrecision(3) + ' MB',
        ticks: ranges
          .filter(r => !isNaN(r.chromosome))
          .map(r => r.position_abs_max),
        tickFormat: (tick, i) => +ranges[i].chromosome,
        labelsBetweenTicks: true,
        allowSelection: true,
        onSelected: (range, i) => {
          onChromosomeSelected(ranges[i].chromosome);
        }
      },
      yAxis: {
        title: [
          { text: `-log`, font: `600 14px ${systemFont}` },
          {
            text: '10',
            textBaseline: 'middle',
            font: `600 10px ${systemFont}`
          },
          { text: `(p)`, font: `600 14px ${systemFont}` }
        ],
        key: columnIndexes.nLogP,
        extent: yExtent,
        tickFormat: tick => tick.toPrecision(3)
      },
      point: {
        size: 2,
        opacity: 1,
        color: (d, i) =>
          d[columnIndexes.chr] % 2 ? colors.single.light : colors.single.dark //#e47833')
      },
      lines: [{ y: -Math.log10(5e-8), style: 'dashed' }]
    };
  }

  function getChromosomePlot(plotData) {
    let columnIndexes = {
      variantId: plotData.columns.indexOf('id'),
      chr: plotData.columns.indexOf('chromosome'),
      bp: plotData.columns.indexOf('position'),
      nLogP: plotData.columns.indexOf('p_value_nlog'),
      index: plotData.columns.indexOf('index')
    };

    let withKeys = data => ({
      variantId: data[columnIndexes.variantId],
      chr: data[columnIndexes.chr],
      bp: data[columnIndexes.bp],
      nLogP: data[columnIndexes.nLogP],
      index: data[columnIndexes.index]
    });

    let title = getTitle();
    let range = ranges.find(r => r.chromosome == selectedChromosome);
    let yExtent = extent([...plotData.data].map(d => d[columnIndexes.nLogP]));
    yExtent[1] *= 1.1;

    return {
      data: plotData.data,
      genes: plotData.genes,
      allowZoom: true,
      allowPan: true,

      onPan: bounds => {
        plot.current.setTitle([
          {
            text: getTitle(bounds),
            font: `600 16px ${systemFont}`
          }
        ]);
      },

      onZoom: async e => {
        let config = plot.current.config;
        let { xAxis, zoomStack } = config;
        let stack = [...zoomStack]; // need new reference, since zoomStack updates
        let zoomRange = Math.abs(xAxis.extent[1] - xAxis.extent[0]);
        setManhattanPlotConfig({ ...config });
        setZoomStack(stack);
        onZoom(e);

        let bounds =
          zoomStack.length > 0 ? zoomStack[zoomStack.length - 1].bounds : null;

        plot.current.setTitle([
          {
            text: getTitle(bounds),
            font: `600 16px ${systemFont}`
          }
        ]);

        // draw genes if zoom is at less than 50 MB
        setGenes([]);
        plot.current.drawGenes([]);
        if (zoomRange <= 2e6) {
          let genes = await query('genes', {
            chromosome: selectedChromosome,
            transcription_start: xAxis.extent[0],
            transcription_end: xAxis.extent[1]
          });
          setGenes(genes);
          plot.current.drawGenes(genes);
        }
      },
      title: [{ text: title, font: `600 16px ${systemFont}` }],
      xAxis: {
        title: null,
        key: columnIndexes.bp,
        tickFormat: tick => (tick / 1e6).toPrecision(4) + ' MB',
        extent: [range.position_min, range.position_max]
      },
      yAxis: {
        title: [
          { text: `-log`, font: `600 14px ${systemFont}` },
          {
            text: '10',
            textBaseline: 'middle',
            font: `600 10px ${systemFont}`
          },
          { text: `(p)`, font: `600 14px ${systemFont}` }
        ],
        key: columnIndexes.nLogP,
        extent: yExtent,
        tickFormat: tick => tick.toPrecision(3)
      },
      point: {
        size: 2,
        interactiveSize: 3,
        opacity: 1,
        color:
          selectedChromosome % 2 ? colors.single.light : colors.single.dark,
        tooltip: {
          trigger: 'hover',
          class: 'custom-tooltip',
          style: 'width: 300px;',
          content: async (data, index) => {
            let point = withKeys(data);
            const response = await query('variants', {
              phenotype_id: (
                selectedPhenotypes[point.index] || selectedPhenotypes[0]
              ).id,
              id: point.variantId,
              ancestry: selectedStratifications[point.index].ancestry,
              sex: selectedStratifications[point.index].sex
            });
            const record = response.data[0];
            return h('div', { className: '' }, [
              h('div', null, [
                h('b', null, 'position: '),
                // `${(record.bp / 1e6).toFixed(4)} MB`
                `${record.chromosome}:${record.position}`
              ]),
              h('div', null, [h('b', null, 'p-value: '), `${record.p_value}`]),
              h('div', null, [h('b', null, 'snp: '), `${record.snp}`]),
              h('div', null, [
                h(
                  'a',
                  {
                    className: 'font-weight-bold',
                    href: '#/gwas/lookup',
                    onclick: () => onVariantLookup && onVariantLookup(record)
                  },
                  'Go to Variant Lookup'
                )
              ]),
              h('div', null, [
                h(
                  'a',
                  {
                    className: 'font-weight-bold',
                    href: `https://www.ebi.ac.uk/gwas/search?query=${record.snp}`,
                    target: '_blank'
                  },
                  'Go to GWAS Catalog'
                )
              ])
            ]);
          }
        }
      },
      geneTooltipContent: gene => {
        return h('div', { className: '' }, [
          h('div', null, [h('b', null, 'gene: '), `${gene.originalName}`]),
          h('div', null, [
            h('b', null, 'position: '),
            `chr${selectedChromosome}:${gene.transcription_start}-${gene.transcription_end}`
          ]),
          h('div', null, [
            h(
              'a',
              {
                className: 'font-weight-bold',
                href: `https://www.ncbi.nlm.nih.gov/gene/?term=(${gene.originalName}%5BGene+Name%5D)+AND+homo+sapiens%5BOrganism%5D`,
                target: '_blank'
              },
              'Go to NCBI Gene'
            )
          ])
        ]);
      },
      lines: [{ y: -Math.log10(5e-8), style: 'dashed' }],
      zoomStack: (plot.current && plot.current.zoomStack) || []
    };
  }

  function resetZoom() {
    if (plot.current && plot.current.config.resetZoom) {
      let config = plot.current.config;
      config.resetZoom();
      config.zoomStack = [];
      setManhattanPlotConfig({ ...config });
      setZoomStack([]);
    }
  }

  function zoomOut() {
    if (plot.current) {
      // console.log('ZOOMSTACK', plot.current.config, zoomStack);
      if (zoomStack.length < 2) {
        this.resetZoom();
      } else {
        zoomStack.pop();
        let window = zoomStack[zoomStack.length - 1];
        plot.current.config.zoomStack = [...zoomStack];
        plot.current.config.setZoomWindow({ ...window });
        setZoomStack([...zoomStack]);
        // plot.current.config.zoomOut();
      }
    }
  }

  function getXRange() {
    if (!zoomStack || !zoomStack.length) return Number.MAX_VALUE;
    let { xMax, xMin } = zoomStack[zoomStack.length - 1].bounds;
    return xMax - xMin;
  }

  function getXRangeTitle() {
    if (zoomStack.length > 0) {
      let bounds = zoomStack[zoomStack.length - 1].bounds;
      return `${(bounds.xMin / 1e6).toPrecision(4)}MB-${(
        bounds.xMax / 1e6
      ).toPrecision(4)}MB`;
    }
    return '';
  }

  function getFilename() {
    const titlecase = str =>
      str[0].toUpperCase() + str.substring(1, str.length);
    const formatTitle = str =>
      str
        .split(' ')
        .map(titlecase)
        .join('-');
    let title = formatTitle(selectedPhenotypes.map(p => p.display_name).join(', '));
    // let plotType = formatTitle(selectedSex);
    let chr = selectedChromosome ? formatTitle(`Chr${selectedChromosome}`) : '';
    let range = getXRangeTitle();

    return [title, chr, range].filter(Boolean).join('-') + '.png';
  }

  useEffect(() => {
    if (plot.current && restoredZoomLevel) {
      plot.current.config.setZoomWindow({ bounds: restoredZoomLevel });
      dispatch(
        updateManhattanPlot({
          restoredZoomLevel: null
        })
      );
    }
  }, [restoredZoomLevel, plot.current]);

  if (loading && !hasData()) {
    return (
      <div
        style={{
          minHeight: '600px',
          position: 'relative',
          marginTop: '2.5rem'
        }}>
        {loading && <LoadingOverlay active={loading} {...plotOverlayConfig} />}
        <div className="manhattan-plot" ref={plotPlaceholderContainer} />
      </div>
    );
  }

  return (
    <div
      style={{ display: hasData() ? 'block' : 'none', position: 'relative', minWidth: '800px' }}>
      {loading && <LoadingOverlay active={loading} {...plotOverlayConfig} />}

      <div className="d-flex align-items-center justify-content-between mx-4 mt-3">
        <div
          className="d-flex align-items-center"
          style={{ visibility: selectedChromosome ? 'visible' : 'hidden' }}>
          <a
            href="javascript:void(0)"
            onClick={e => onAllChromosomeSelected && onAllChromosomeSelected()}>
            All Chromosomes
          </a>

          {zoomStack.length ? (
            <>
              <Icon name="arrow-left" className="mx-2 opacity-50" width="10" />
              <a href="javascript:void(0)" onClick={e => {
                resetZoom();
                onChromosomeSelected && onChromosomeSelected(selectedChromosome)
              }}>
                Chromosome {selectedChromosome}
              </a>
            </>
          ) : null}

          {zoomStack.length > 1 ? (
            <>
              <Icon name="arrow-left" className="mx-2 opacity-50" width="10" />
              <a href="javascript:void(0)" onClick={zoomOut}>
                Previous Zoom
                {(() => {
                  let bounds = zoomStack[zoomStack.length - 2].bounds;
                  return ` (${(bounds.xMin / 1e6).toPrecision(4)} MB - ${(
                    bounds.xMax / 1e6
                  ).toPrecision(4)} MB)`;
                })()}
              </a>
            </>
          ) : null}
          <Icon name="arrow-left" className="mx-2 opacity-50" width="10" />
        </div>

        <a
          rel="tooltip"
          href="javascript:void(0)"
          onClick={e => plot.current.exportPng(2000, 3000, getFilename())}>
          Export
        </a>
      </div>

      <div
        style={{
          overflowX: 'hidden'
          // overflowY: 'auto',
          // height: '600px',
        }}>
        <div
          ref={plotContainer}
          className={[
            `manhattan-plot`,
            (genePlotCollapsed || getXRange() > 2e6 || !genes.length) &&
              'gene-plot-collapsed'
          ].join(' ')}
        />
        {/* <button onClick={e => plot.current.redraw()}>Redraw</button> */}

        {manhattanPlotView !== 'summary' && (
          <div className="text-center px-5">
            {(() => {
              if (genePlotCollapsed) return null;
              let zoomMessage = (
                <div
                  className="p-4 mb-0 text-muted small"
                  style={{ border: '1px solid #eee' }}>
                  Gene plot is not available at the current zoom level. Please
                  zoom in to a 2MB range to see genes.
                </div>
              );
              if (!zoomStack || !zoomStack.length) return zoomMessage;
              let { xMax, xMin } = zoomStack[zoomStack.length - 1].bounds;
              let xRange = xMax - xMin;
              if (xRange > 2e6) {
                return zoomMessage;
              } else if (!genes.length) {
                return (
                  <div
                    className="p-4 mb-0 text-muted small"
                    style={{ border: '1px solid #eee' }}>
                    No genes are available within the current bp range.
                  </div>
                );
              }
            })()}
            <button
              className="btn-collapse"
              onClick={e => setGenePlotCollapsed(!genePlotCollapsed)}>
              {genePlotCollapsed ? (
                <a
                  href="javascript:void(0)"
                  className="d-flex-inline align-items-center mr-5">
                  Show Gene Plot
                </a>
              ) : (
                <Icon name="angle-up" width="10" title="Hide Gene Plot" />
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

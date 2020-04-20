import React, { useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Spinner } from 'react-bootstrap';
import LoadingOverlay from 'react-loading-overlay';
import * as merge from 'lodash.merge';
import * as isEqual from 'lodash.isequal';
import { plotOverlayConfig } from '../../../controls/table/table';
import { rawQuery, query } from '../../../../services/query';
import { ManhattanPlot as Plot } from '../../../plots/custom/manhattan-plot/manhattan-plot';
import { Icon } from '../../../controls/icon';
import { createElement as h, removeChildren } from '../../../plots/custom/utils';
import { systemFont } from '../../../plots/custom/text';
import { updateSummaryResults, updateManhattanPlot } from '../../../../services/actions';

export function ManhattanPlot({
  onAllChromosomeSelected,
  onChromosomeSelected,
  onVariantLookup,
  onZoom,
  loading,
  panelCollapsed,
}) {
  const dispatch = useDispatch();
  const [genePlotCollapsed, setGenePlotCollapsed] = useState(false);
  const plotContainer = useRef(null);
  const plot = useRef(null);

  const {
    selectedPlot,
    manhattanPlotView,
    selectedSex,
    selectedPhenotype,
    selectedChromosome,
    ranges,
  } = useSelector(state => state.summaryResults);

  const {
    manhattanPlotData,
    manhattanPlotMirroredData,
    manhattanPlotConfig,
    restoredZoomLevel,
    zoomStack,
    genes,
  } = useSelector(state => state.manhattanPlot);

  const hasData = () =>
    manhattanPlotData &&
    manhattanPlotData.data &&
    manhattanPlotData.data.length;

  const setManhattanPlotConfig = manhattanPlotConfig => {
    dispatch(updateManhattanPlot({manhattanPlotConfig}))
  }

  const setZoomStack = zoomStack => {
    dispatch(updateManhattanPlot({zoomStack}))
  }

  const setGenes = genes => {
    dispatch(updateManhattanPlot({genes}))
  }

  const colors = {
    all: {
      light: '#F2990D',
      dark: '#A76909',
    },
    male: {
      light: '#006bb8',
      dark: '#002a47'
    },
    female: {
      light: '#f41c52',
      dark: '#a2173a'
    }
  }


  const getTitle = bounds => {
    if (!bounds)
      return `${selectedPhenotype.title} - Chromosome ${selectedChromosome}`;
    let boundsText = `(${(bounds.xMin / 1e6).toPrecision(4)} MB - ${(
      bounds.xMax / 1e6
    ).toPrecision(4)} MB)`;
    return `${selectedPhenotype.title} - Chromosome ${selectedChromosome} ${boundsText}`;
  }

  useEffect(() => {
    if (selectedPlot != 'manhattan-plot' || !hasData()) return;
    // removeChildren(plotContainer.current);
    plotContainer.current.innerHTML = '';

    let params;
    if (selectedSex === 'stacked') {
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
    let config = {...params};
    config.genes = genes;
    config.zoomStack = zoomStack;

    if (manhattanPlotConfig) {
      if (manhattanPlotConfig.title)
        config.title = manhattanPlotConfig.title;

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

    plot.current = new Plot(plotContainer.current, config);
    if (genes && genes.length)
      plot.current.drawGenes(genes);
    else
      plot.current.clearGenes();
    // setZoomStack([]);
    return () => {
      // plot.current.destroy();
    };
  }, [manhattanPlotData, manhattanPlotMirroredData, selectedPlot, selectedChromosome]);

  useEffect(() => {
    plot.current && plot.current.redraw();
  }, [panelCollapsed]);

  function getMirroredSummaryPlot(plotData, mirroredPlotData) {
    let columnIndexes = {
      chr: plotData.columns.indexOf('chromosome'),
      bp: plotData.columns.indexOf('position_abs'),
      nLogP: plotData.columns.indexOf('p_value_nlog')
    };

    return {
      mirrored: true,
      data: plotData.data,
      data2: mirroredPlotData.data,
      genes: plotData.genes,
      title: [
        {
          text: selectedPhenotype.title,
          font: `600 16px ${systemFont}`
        }
      ],
      xAxis: {
        title: null,
        key: columnIndexes.bp,
        tickFormat: tick => (tick / 1e6).toPrecision(3) + ' MB',
        ticks: ranges.filter(r => !isNaN(r.chromosome)).map(r => +r.position_abs_max),
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
        secondaryTitle: [{ text: `Female`, font: `600 11px ${systemFont}` }],
        key: columnIndexes.nLogP,
        tickFormat: tick => tick.toPrecision(3)
      },
      yAxis2: {
        secondaryTitle: [{ text: `Male`, font: `600 11px ${systemFont}` }]
      },
      point: {
        size: 2,
        opacity: 1,
        color: (d, i) => (+d[columnIndexes.chr] % 2 ? colors.female.light : colors.female.dark)
      },
      point2: {
        color: (d, i) => (+d[columnIndexes.chr] % 2 ? colors.male.light : colors.male.dark) //#e47833')
      },
      lines: [{ y: -Math.log10(5e-8), style: 'dashed' }]
    };
  }

  function getMirroredChromosomePlot(plotData, mirroredPlotData) {
    let columnIndexes = {
      variantId: plotData.columns.indexOf('id'),
      chr: plotData.columns.indexOf('chromosome'),
      bp: plotData.columns.indexOf('position'),
      nLogP: plotData.columns.indexOf('p_value_nlog')
    };

    let withKeys = data => ({
      variantId: data[columnIndexes.variantId],
      chr: data[columnIndexes.chr],
      bp: data[columnIndexes.bp],
      nLogP: data[columnIndexes.nLogP]
    });

    let title = `${selectedPhenotype.title} - Chromosome ${selectedChromosome}`;

    let range = ranges.find(r => r.chromosome == selectedChromosome);

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
        setManhattanPlotConfig({...config});
        setZoomStack(stack);
        onZoom(e);

        let bounds = zoomStack.length > 0
          ? zoomStack[zoomStack.length - 1].bounds
          : null

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
        secondaryTitle: [{ text: `Female`, font: `600 11px ${systemFont}` }],
        key: columnIndexes.nLogP,
        tickFormat: tick => tick.toPrecision(3)
      },
      yAxis2: {
        secondaryTitle: [{ text: `Male`, font: `600 11px ${systemFont}` }]
      },
      point: {
        size: 2,
        interactiveSize: 3,
        opacity: 1,
        color: selectedChromosome % 2 ? colors.female.light : colors.female.dark,
        tooltip: {
          trigger: 'hover',
          class: 'custom-tooltip',
          style: 'width: 300px;',
          content: async data => {
            let point = withKeys(data);
            const response = await query('variants', {
              phenotype_id: selectedPhenotype.id,
              id: point.variantId
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
              ])
            ]);
          }
        }
      },
      point2: {
        color: selectedChromosome % 2 ? colors.male.light : colors.male.dark
      },
      lines: [{ y: -Math.log10(5e-8), style: 'dashed' }],
      zoomStack: (plot.current && plot.current.zoomStack) || []
    };
  }

  function getSummaryPlot(plotData) {

    let columnIndexes = {
      chr: plotData.columns.indexOf('chromosome'),
      bp: plotData.columns.indexOf('position_abs'),
      nLogP: plotData.columns.indexOf('p_value_nlog')
    };

    return {
      data: plotData.data,
      genes: plotData.genes,
      title: [
        {
          text: selectedPhenotype.title,
          font: `600 16px ${systemFont}`
        }
      ],
      xAxis: {
        title: null,
        key: columnIndexes.bp,
        tickFormat: tick => (tick / 1e6).toPrecision(3) + ' MB',
        ticks: ranges.filter(r => !isNaN(r.chromosome)).map(r => r.position_abs_max),
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
        tickFormat: tick => tick.toPrecision(3)
      },
      point: {
        size: 2,
        opacity: 1,
        color: (d, i) => (d[columnIndexes.chr] % 2
            ? colors[selectedSex].light
            : colors[selectedSex].dark) //#e47833')
      },
      lines: [{ y: -Math.log10(5e-8) }]
    };
  }

  function getChromosomePlot(plotData) {
    let columnIndexes = {
      variantId: plotData.columns.indexOf('id'),
      chr: plotData.columns.indexOf('chromosome'),
      bp: plotData.columns.indexOf('position'),
      nLogP: plotData.columns.indexOf('p_value_nlog')
    };

    let withKeys = data => ({
      variantId: data[columnIndexes.variantId],
      chr: data[columnIndexes.chr],
      bp: data[columnIndexes.bp],
      nLogP: data[columnIndexes.nLogP]
    });

    let title = `${selectedPhenotype.title} - Chromosome ${selectedChromosome}`;
    let range = ranges.find(r => r.chromosome == selectedChromosome);

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
        setManhattanPlotConfig({...config});
        setZoomStack(stack);
        onZoom(e);

        let bounds = zoomStack.length > 0
          ? zoomStack[zoomStack.length - 1].bounds
          : null;

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
        tickFormat: tick => tick.toPrecision(3)
      },
      point: {
        size: 2,
        interactiveSize: 3,
        opacity: 1,
        color: selectedChromosome % 2
          ? colors[selectedSex].light
          : colors[selectedSex].dark,
        tooltip: {
          trigger: 'hover',
          class: 'custom-tooltip',
          style: 'width: 300px;',
          content: async data => {
            let point = withKeys(data);
            const response = await query('variants', {
              phenotype_id: selectedPhenotype.id,
              id: point.variantId
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
              ])
            ]);
          }
        }
      },
      geneTooltipContent: gene => {
        return h('div', { className: '' }, [
          h('div', null, [
            h('b', null, 'gene: '),
            `${gene.originalName}`
          ]),
          h('div', null, [
            h('b', null, 'position: '),
            `chr${selectedChromosome}:${gene.transcription_start}-${gene.transcription_end}`
          ]),
          h('div', null, [
            h('a', {
              className: 'font-weight-bold',
              href: `https://www.ncbi.nlm.nih.gov/gene/?term=${gene.originalName}`,
              target: '_blank'
            }, 'Go to RefSeq'),
          ]),

        ]);
      },
      lines: [{ y: -Math.log10(5e-8), style: 'dashed' }],
      zoomStack: (plot.current && plot.current.zoomStack) || []
    };
  }

  function resetZoom() {
    if (plot.current && plot.current.config.resetZoom) {
      plot.current.config.resetZoom();
    }
  }

  function zoomOut() {
    if (plot.current) {
      console.log('ZOOMSTACK', plot.current.config, zoomStack);
      if (zoomStack.length < 2) {
        this.resetZoom();
      } else {
        zoomStack.pop();
        let window = zoomStack[zoomStack.length - 1];
        plot.current.config.setZoomWindow({...window})
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
    const titlecase = str => str[0].toUpperCase() + str.substring(1, str.length)
    const formatTitle = str => str.split(' ').map(titlecase).join('-');
    let title = formatTitle(selectedPhenotype.title);
    let plotType = formatTitle(selectedSex);
    let chr = selectedChromosome ? formatTitle(`Chr${selectedChromosome}`) : '';
    let range = getXRangeTitle();

    return [
      title,
      plotType,
      chr,
      range
    ].filter(Boolean).join('-') + '.png'
  }


  useEffect(() => {
    if (plot.current && restoredZoomLevel) {
      plot.current.config.setZoomWindow({bounds: restoredZoomLevel})
      dispatch(updateManhattanPlot({
        restoredZoomLevel: null
      }))
    }

  }, [restoredZoomLevel, plot.current])

  return (
    <div
      style={{ display: hasData() ? 'block' : 'none', position: 'relative' }}>
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
              <Icon
                name="arrow-left"
                className="mx-2 opacity-50"
                width="10"
              />
              <a
                href="javascript:void(0)"
                onClick={resetZoom}>
                Chromosome {selectedChromosome}
              </a>
            </>
          ) : null}

          {zoomStack.length > 1 ? (
            <>
              <Icon name="arrow-left" className="mx-2 opacity-50" width="10" />
              <a
                href="javascript:void(0)"
                onClick={zoomOut}>
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
            (genePlotCollapsed || getXRange() > 2e6 || !genes.length) && 'gene-plot-collapsed'
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
                  Gene plot is not available at the current zoom level. Please zoom in to a 2MB range
                  to see genes.
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
                )
              }
            })()}
            <button
              className="btn-collapse"
              onClick={e => setGenePlotCollapsed(!genePlotCollapsed)}>
              {genePlotCollapsed
                ? <a
                      href="javascript:void(0)"
                      className="d-flex-inline align-items-center mr-5">
                    Show Gene Plot
                  </a>
                : <Icon name="angle-up" width="10" title="Hide Gene Plot" />
              }
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

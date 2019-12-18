import React, { useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Spinner } from 'react-bootstrap';
import LoadingOverlay from 'react-loading-overlay';
import { plotOverlayConfig } from '../controls/table';
import { rawQuery, query } from '../../services/query';
import { ManhattanPlot as Plot } from '../../services/plots/manhattan-plot';
import { Icon } from '../controls/icon';
import { createElement as h } from '../../services/plots/utils';
import { systemFont } from '../../services/plots/text';
import { updateSummaryResults } from '../../services/actions';

export function ManhattanPlot({
  onAllChromosomeSelected,
  onChromosomeSelected,
  onVariantLookup,
  onZoom,
  loading,
  panelCollapsed,
}) {
  const [zoomStack, setZoomStack] = useState([]);
  const [genes, setGenes] = useState([]);
  const [genePlotCollapsed, setGenePlotCollapsed] = useState(false);
  const plotContainer = useRef(null);
  const plot = useRef(null);
  const {
    selectedPlot,
    manhattanPlotData,
    manhattanPlotMirroredData,
    manhattanPlotView,
    selectedManhattanPlotType,
    selectedPhenotype,
    selectedChromosome,
    ranges
  } = useSelector(state => state.summaryResults);
  const hasData = () =>
    manhattanPlotData &&
    manhattanPlotData.data &&
    manhattanPlotData.data.length;

  const colors = {
    primary: {
      light: '#006bb8',
      dark: '#002a47'
    },
    secondary: {
      light: '#F2990D',
      dark: '#A76909'
    }
  }

  useEffect(() => {
    if (selectedPlot != 'manhattan-plot' || !hasData()) return;

    let params;
    if (selectedManhattanPlotType === 'stacked') {
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
    plot.current = new Plot(plotContainer.current, params);
    setZoomStack([]);
    return () => {
      plot.current.destroy();
    };
  }, [manhattanPlotData, manhattanPlotMirroredData, selectedPlot]);

  useEffect(() => {
    plot.current && plot.current.redraw();
  }, [panelCollapsed]);

  function getMirroredSummaryPlot(plotData, mirroredPlotData) {
    let columnIndexes = {
      chr: plotData.columns.indexOf('chr'),
      bp: plotData.columns.indexOf('bp_abs_1000kb'),
      nLogP: plotData.columns.indexOf('nlog_p2')
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
        ticks: ranges.filter(r => r.chr <= 22).map(r => r.max_bp_abs),
        tickFormat: (tick, i) => ranges[i].chr,
        labelsBetweenTicks: true,
        allowSelection: true,
        onSelected: (range, i) => {
          onChromosomeSelected(ranges[i].chr);
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
        color: (d, i) => (d[columnIndexes.chr] % 2 ? colors.primary.light : colors.primary.dark)
      },
      point2: {
        color: (d, i) => (d[columnIndexes.chr] % 2 ? colors.secondary.light : colors.secondary.dark) //#e47833')
      },
      lines: [{ y: -Math.log10(5e-8), style: 'dashed' }]
    };
  }

  function getMirroredChromosomePlot(plotData, mirroredPlotData) {
    let columnIndexes = {
      variantId: plotData.columns.indexOf('variant_id'),
      chr: plotData.columns.indexOf('chr'),
      bp: plotData.columns.indexOf('bp'),
      nLogP: plotData.columns.indexOf('nlog_p')
    };

    let withKeys = data => ({
      variantId: data[columnIndexes.variantId],
      chr: data[columnIndexes.chr],
      bp: data[columnIndexes.bp],
      nLogP: data[columnIndexes.nLogP]
    });

    let title = `${selectedPhenotype.title} - Chromosome ${selectedChromosome}`;

    let range = ranges.find(r => r.chr === selectedChromosome);

    return {
      mirrored: true,
      data: plotData.data,
      data2: mirroredPlotData.data,
      genes: plotData.genes,
      allowZoom: true,
      onZoom: async e => {
        let config = plot.current.config;
        let { xAxis, zoomStack } = config;
        let stack = [...zoomStack]; // need new reference, since zoomStack updates
        let zoomRange = Math.abs(xAxis.extent[1] - xAxis.extent[0]);
        setZoomStack(stack);
        onZoom(e);

        let title = '';
        if (zoomStack.length > 0) {
          let bounds = zoomStack[zoomStack.length - 1].bounds;
          let boundsText = `(${(bounds.xMin / 1e6).toPrecision(4)} MB - ${(
            bounds.xMax / 1e6
          ).toPrecision(4)} MB)`;
          title = `${selectedPhenotype.title} - Chromosome ${selectedChromosome} ${boundsText}`;
        } else {
          title = `${selectedPhenotype.title} - Chromosome ${selectedChromosome}`;
        }

        plot.current.setTitle([
          {
            text: title,
            font: `600 16px ${systemFont}`
          }
        ]);


        // draw genes if zoom is at less than 50 MB
        setGenes([]);
        plot.current.drawGenes([]);
        if (zoomRange <= 2e6) {
          let genes = await query('genes', {
            database: 'gene.db',
            chr: selectedChromosome,
            txStart: xAxis.extent[0],
            txEnd: xAxis.extent[1]
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
        extent: [range.bp_min, range.bp_max]
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
        color: selectedChromosome % 2 ? colors.primary.light : colors.primary.dark,
        tooltip: {
          trigger: 'hover',
          class: 'custom-tooltip',
          style: 'width: 300px;',
          content: async data => {
            let point = withKeys(data);
            const response = await query('variants', {
              database: selectedPhenotype.value + '.db',
              id: point.variantId
            });
            const record = response.data[0];
            return h('div', { className: '' }, [
              h('div', null, [
                h('b', null, 'position: '),
                // `${(record.bp / 1e6).toFixed(4)} MB`
                `${record.chr}:${record.bp}`
              ]),
              h('div', null, [h('b', null, 'p-value: '), `${record.p}`]),
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
        color: selectedChromosome % 2 ? colors.secondary.light : colors.secondary.dark
      },
      lines: [{ y: -Math.log10(5e-8), style: 'dashed' }],
      zoomStack: (plot.current && plot.current.zoomStack) || []
    };
  }

  function getSummaryPlot(plotData) {
    let columnIndexes = {
      chr: plotData.columns.indexOf('chr'),
      bp: plotData.columns.indexOf('bp_abs_1000kb'),
      nLogP: plotData.columns.indexOf('nlog_p2')
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
        ticks: ranges.filter(r => r.chr <= 22).map(r => r.max_bp_abs),
        tickFormat: (tick, i) => ranges[i].chr,
        labelsBetweenTicks: true,
        allowSelection: true,
        onSelected: (range, i) => {
          onChromosomeSelected(ranges[i].chr);
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
        color: (d, i) => (d[columnIndexes.chr] % 2 ? colors.primary.light : colors.primary.dark) //#e47833')
      },
      lines: [{ y: -Math.log10(5e-8) }]
    };
  }

  function getChromosomePlot(plotData) {
    let columnIndexes = {
      variantId: plotData.columns.indexOf('variant_id'),
      chr: plotData.columns.indexOf('chr'),
      bp: plotData.columns.indexOf('bp'),
      nLogP: plotData.columns.indexOf('nlog_p')
    };

    let withKeys = data => ({
      variantId: data[columnIndexes.variantId],
      chr: data[columnIndexes.chr],
      bp: data[columnIndexes.bp],
      nLogP: data[columnIndexes.nLogP]
    });

    let title = `${selectedPhenotype.title} - Chromosome ${selectedChromosome}`;
    let range = ranges.find(r => r.chr === selectedChromosome);

    return {
      data: plotData.data,
      genes: plotData.genes,
      allowZoom: true,
      onZoom: async e => {
        let config = plot.current.config;
        let { xAxis, zoomStack } = config;
        let stack = [...zoomStack]; // need new reference, since zoomStack updates
        let zoomRange = Math.abs(xAxis.extent[1] - xAxis.extent[0]);
        setZoomStack(stack);
        onZoom(e);

        let title = '';
        if (zoomStack.length > 0) {
          let bounds = zoomStack[zoomStack.length - 1].bounds;
          let boundsText = `(${(bounds.xMin / 1e6).toPrecision(4)} MB - ${(
            bounds.xMax / 1e6
          ).toPrecision(4)} MB)`;
          title = `${selectedPhenotype.title} - Chromosome ${selectedChromosome} ${boundsText}`;
        } else {
          title = `${selectedPhenotype.title} - Chromosome ${selectedChromosome}`;
        }

        plot.current.setTitle([
          {
            text: title,
            font: `600 16px ${systemFont}`
          }
        ]);

        // draw genes if zoom is at less than 50 MB
        setGenes([]);
        plot.current.drawGenes([]);
        if (zoomRange <= 2e6) {
          let genes = await query('genes', {
            database: 'gene.db',
            chr: selectedChromosome,
            txStart: xAxis.extent[0],
            txEnd: xAxis.extent[1]
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
        extent: [range.bp_min, range.bp_max]
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
        color: selectedChromosome % 2 ? colors.primary.light : colors.primary.dark,
        tooltip: {
          trigger: 'hover',
          class: 'custom-tooltip',
          style: 'width: 300px;',
          content: async data => {
            let point = withKeys(data);
            const response = await query('variants', {
              database: selectedPhenotype.value + '.db',
              id: point.variantId
            });
            const record = response.data[0];
            return h('div', { className: '' }, [
              h('div', null, [
                h('b', null, 'position: '),
                // `${(record.bp / 1e6).toFixed(4)} MB`
                `${record.chr}:${record.bp}`
              ]),
              h('div', null, [h('b', null, 'p-value: '), `${record.p}`]),
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
            `chr${selectedChromosome}:${gene.tx_start}-${gene.tx_end}`
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
    if (plot.current && plot.current.config.zoomOut) {
      plot.current.config.zoomOut();
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
    let plotType = formatTitle(selectedManhattanPlotType);
    let chr = selectedChromosome ? formatTitle(`Chr${selectedChromosome}`) : '';
    let range = getXRangeTitle();

    return [
      title,
      plotType,
      chr,
      range
    ].filter(Boolean).join('-') + '.png'
  }

  return (
    <div
      style={{ display: hasData() ? 'block' : 'none', position: 'relative' }}>
      {loading && <LoadingOverlay active={loading} {...plotOverlayConfig} />}

      <div
        className="mx-2 mt-3 small d-flex align-items-center"
        style={{ visibility: selectedChromosome ? 'visible' : 'hidden' }}>
        <a
          className="link"
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
            <a className="link" onClick={resetZoom}>
              Chromosome {selectedChromosome}
            </a>
          </>
        ) : null}

        {zoomStack.length > 1 ? (
          <>
            <Icon name="arrow-left" className="mx-2 opacity-50" width="10" />
            <a className="link" onClick={zoomOut}>
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

      <div className="text-right">
        <a
          rel="tooltip"
          href="javascript:void(0)"
          className="d-flex-inline align-items-center mr-5"
          style={{color: 'rgb(0, 140, 186)'}}
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
                      className="d-flex-inline align-items-center mr-5"
                      style={{color: 'rgb(0, 140, 186)'}}>
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

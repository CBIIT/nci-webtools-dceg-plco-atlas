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
}) {
  const [zoomStack, setZoomStack] = useState([]);
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
    ranges,
  } = useSelector(state => state.summaryResults);
  const hasData = () =>
    manhattanPlotData &&
    manhattanPlotData.data &&
    manhattanPlotData.data.length;

  useEffect(() => {
    if (selectedPlot != 'manhattan-plot' || !hasData()) return;

    let params;
    if (selectedManhattanPlotType === 'stacked') {
      params =
        manhattanPlotView === 'summary'
          ? getMirroredSummaryPlot(manhattanPlotData, manhattanPlotMirroredData)
          : getMirroredChromosomePlot(manhattanPlotData, manhattanPlotMirroredData)
    } else {
      params =
        manhattanPlotView === 'summary'
          ? getSummaryPlot(manhattanPlotData)
          : getChromosomePlot(manhattanPlotData)
    }
    plot.current = new Plot(plotContainer.current, params);
    setZoomStack([])
    return () => {
      plot.current.destroy();
    };
  }, [manhattanPlotData, manhattanPlotMirroredData, selectedPlot]);


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
      xAxis: {
        title: [
          {
            text: selectedPhenotype.title,
            font: `600 14px ${systemFont}`
          }
        ],
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
        secondaryTitle: [{ text: `Male`, font: `600 11px ${systemFont}` }],
      },
      point: {
        size: 2,
        opacity: 0.6,
        color: (d, i) => (d[columnIndexes.chr] % 2 ? '#e47618' : '#b55117')
      },
      point2: {
        color: (d, i) => (d[columnIndexes.chr] % 2 ? '#006bb8' : '#002a47')//#e47833')
      },
      lines: [
        { y: -Math.log10(5e-8), style: 'dashed' },
      ]
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
      onZoom: async (e) => {
        let config = plot.current.config;
        let { xAxis, zoomStack } = config;
        let stack = [...zoomStack]; // need new reference, since zoomStack updates
        let zoomRange = Math.abs(xAxis.extent[1] - xAxis.extent[0]);
        setZoomStack(stack);
        onZoom(e);

        // draw genes if zoom is at less than 50 MB
        if (zoomRange <= 5e7) {
          let genes = await query('genes', {
            database: 'gene2.db',
            chr: selectedChromosome,
            txStart: xAxis.extent[0],
            txEnd: xAxis.extent[1],
          });
          plot.current.drawGenes(genes.filter(e => e.strand === '+'));
        }
      },
      xAxis: {
        title: [{ text: title, font: `600 14px ${systemFont}` }],
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
        opacity: 0.6,
        color: selectedChromosome % 2 ? '#e47618' : '#b55117',
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
        color: selectedChromosome % 2 ? '#006bb8' : '#002a47'
      },
      lines: [
        { y: -Math.log10(5e-8), style: 'dashed' },
      ],
      zoomStack: plot.current && plot.current.zoomStack || []
    }
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
      xAxis: {
        title: [
          {
            text: selectedPhenotype.title,
            font: `600 14px ${systemFont}`
          }
        ],
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
        opacity: 0.6,
        color: (d, i) => (d[columnIndexes.chr] % 2 ? '#006bb8' : '#002a47')//#e47833')
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
      onZoom: async (e) => {
        let config = plot.current.config;
        let { xAxis, zoomStack } = config;
        let stack = [...zoomStack]; // need new reference, since zoomStack updates
        let zoomRange = Math.abs(xAxis.extent[1] - xAxis.extent[0]);
        setZoomStack(stack);
        onZoom(e);

        // draw genes if zoom is at less than 50 MB
        if (zoomRange <= 5e7) {
          let genes = await query('genes', {
            database: 'gene2.db',
            chr: selectedChromosome,
            txStart: xAxis.extent[0],
            txEnd: xAxis.extent[1],
          });
          plot.current.drawGenes(genes.filter(e => e.strand === '+'));
        }
      },
      xAxis: {
        title: [{ text: title, font: `600 14px ${systemFont}` }],
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
        opacity: 0.6,
        color: (selectedChromosome % 2 ? '#006bb8' : '#002a47'),
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
      lines: [{ y: -Math.log10(5e-8), style: 'dashed' }],
      zoomStack: plot.current && plot.current.zoomStack || []
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

  return (
    <div style={{display: hasData() ? 'block' : 'none', position: 'relative'}}>
      <LoadingOverlay active={loading} {...plotOverlayConfig} />
      <div
        className="mx-2 mt-3 small d-flex align-items-center"
        style={{visibility: selectedChromosome ? 'visible' : 'hidden'}}>
        <a className="link" onClick={e => onAllChromosomeSelected && onAllChromosomeSelected()}>All Chromosomes</a>

        {zoomStack.length ? <>
            <Icon name="arrow-left" className="mx-2 opacit


            y-50" width="10" />
            <a className="link" onClick={resetZoom}>
              Chromosome {selectedChromosome}
            </a>
          </> : null}

        {zoomStack.length > 1 ? <>
          <Icon name="arrow-left" className="mx-2 opacity-50" width="10" />
          <a className="link" onClick={zoomOut}>
            Previous Zoom
            {(() => {
              let bounds = zoomStack[zoomStack.length - 2].bounds;
              return ` (${(bounds.xMin / 1e6).toPrecision(4)} MB - ${(bounds.xMax / 1e6).toPrecision(4)} MB)`;
            })()}
          </a>
          </> : null}
          <Icon name="arrow-left" className="mx-2 opacity-50" width="10" />
      </div>
      <div
        style={{
          overflowX: 'auto',
          overflowY: 'hidden',
          height: '600px',
        }}>
        <div ref={plotContainer} className="manhattan-plot" />
      </div>
    </div>
  );
}

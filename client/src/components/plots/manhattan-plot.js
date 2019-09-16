import React, { useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Spinner } from 'react-bootstrap';
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
}) {
  const [zoomStack, setZoomStack] = useState([]);
  const plotContainer = useRef(null);
  const plot = useRef(null);
  const {
    selectedPlot,
    manhattanPlotData,
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

  useEffect(() => {
    if (selectedPlot != 'manhattan-plot' || !hasData()) return;
    let params =
      manhattanPlotView === 'summary'
        ? getSummaryPlot(manhattanPlotData)
        : getChromosomePlot(manhattanPlotData);
    plot.current = new Plot(plotContainer.current, params);
    setZoomStack([])
    return () => {
      plot.current.destroy()
    };
  }, [manhattanPlotData, selectedPlot]);

  function getSummaryPlot(plotData) {
    let columnIndexes = {
      chr: plotData.columns.indexOf('chr'),
      bp: plotData.columns.indexOf('bp_abs_1000kb'),
      nLogP: plotData.columns.indexOf('nlog_p2')
    };

    return {
      data: plotData.data,
      xAxis: {
        title: [
          {
            text: selectedPhenotype.label,
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
        color: (d, i) => (d[columnIndexes.chr] % 2 ? '#005ea2' : '#e47833')
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

    let title = `${selectedPhenotype.label} - Chr ${selectedChromosome}`;
    let range = ranges.find(r => r.chr === selectedChromosome);

    return {
      data: plotData.data,
      allowZoom: true,
      onZoom: (e) => {
        let stack = [...plot.current.config.zoomStack];
        setZoomStack(stack);
        onZoom(e);
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
        color: '#005ea2',
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
                `${(record.bp / 1e6).toFixed(4)} MB`
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
      lines: [{ y: -Math.log10(5e-8) }],
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
    <div style={{display: hasData() ? 'block' : 'none'}}>
      <div
        className="px-2 pt-3 small"
        style={{visibility: selectedChromosome ? 'visible' : 'hidden'}}>
        <a className="link" onClick={e => onAllChromosomeSelected && onAllChromosomeSelected()}>All Chromosomes</a>
        <Icon name="angle-right" className="mx-1" width="4" />
        <a className="link" onClick={resetZoom}>
          Chromosome {selectedChromosome}
        </a>

        {zoomStack.length ? <>
            <Icon name="angle-right" className="mx-1" width="4" />
            <a className="link" onClick={zoomOut}>Previous Zoom</a>
          </> : null}
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

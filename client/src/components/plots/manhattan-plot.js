import React, { useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { rawQuery, query } from '../../services/query';
import { scatterPlot } from '../../services/plots/scatter-plot';
import { axisBottom, axisLeft } from '../../services/plots/axis';
import { getScale } from '../../services/plots/scale';
import {
  range,
  indexToColor,
  viewportToLocalCoordinates,
  colorToIndex,
  createElement as h
} from '../../services/plots/utils';
import { systemFont } from '../../services/plots/text';
import { updateSummaryResults } from '../../services/actions';
import { Spinner } from 'react-bootstrap';
import * as d3 from 'd3';

export function ManhattanPlot({ drawFunctionRef, onChromosomeChanged, onVariantLookup, onZoom }) {
  const dispatch = useDispatch();
  const plotContainer = useRef(null);
  const summaryResults = useSelector(state => state.summaryResults);
  const { selectedChromosome, phenotype, ranges, loading } = summaryResults;

  const setRanges = ranges => {
    dispatch(updateSummaryResults({ ranges }));
  };

  const setSelectedChromosome = selectedChromosome => {
    dispatch(updateSummaryResults({ selectedChromosome }));
  };

  const setLoading = loading => {
    dispatch(updateSummaryResults({ loading }));
  };

  useEffect(() => {
    rawQuery('data/chromosome_ranges.json').then(e => setRanges(e));
  }, []);

  useEffect(() => {
    if (drawFunctionRef) drawFunctionRef(drawSummaryPlot);
  }, [drawFunctionRef]);

  const drawSummaryPlot = async phenotype => {
    let rangeSubset = ranges.slice(0, 22);
    setLoading(true);
    const results = await rawQuery('summary', {
      database: phenotype + '.db',
      nlogpMin: 3
    });

    if (results.error) return;

    const data = results.data;
    const columnKeys = {
      chr: results.columns.indexOf('chr'),
      x: results.columns.indexOf('bp_abs_1000kb'),
      y: results.columns.indexOf('nlog_p2')
    };

    const config = {
      data: data,
      canvas: {
        width: 1000,
        height: 600
      },
      margins: {
        top: 20,
        left: 40,
        right: 20,
        bottom: 40
      },
      point: {
        // fast: true,
        opacity: 0.8,
        size: 2,
        color: d => (d[columnKeys.chr] % 2 == 0 ? '#005ea2' : '#e47833')
      },
      x: {
        key: columnKeys.x,
        min: 0,
        max: rangeSubset[rangeSubset.length - 1].max_bp_abs
      },
      y: {
        key: columnKeys.y,
        min: 3,
        max: 20
      }
    };
    const canvas = scatterPlot(config);
    const { margins, canvas: canvasSize } = config;

    const width = canvasSize.width - margins.left - margins.right;
    const height = canvasSize.height - margins.top - margins.bottom;

    const scaleY = d3
      .scaleLinear()
      .domain([config.y.min, config.y.max])
      .range([height, 0])
      .nice();

    const thresholdScale = d3
      .scaleLinear()
      .domain([config.y.min, config.y.max])
      .range([height, 0]);

    // add a dotted line at -log10(p) = 5*10^-8
    const threshold = -Math.log10(5 * 10 ** -8);

    let context = canvas.getContext('2d');
    context.beginPath();
    context.globalAlpha = 0.6;
    context.strokeStyle = '#888';
    context.lineWidth = 1;
    context.setLineDash([6, 4]);
    context.moveTo(margins.left, thresholdScale(threshold));
    context.lineTo(width, thresholdScale(threshold));
    context.stroke();

    let defaultDef = {
      textBaseline: 'middle',
      font: `600 14px ${systemFont}`
    };

    let subscriptDef = {
      textBaseline: 'top',
      font: `600 10px ${systemFont}`
    };

    axisLeft(canvas, {
      title: [
        { ...defaultDef, text: '-log' },
        { ...subscriptDef, text: '10' },
        { ...defaultDef, text: '(p)' }
      ],
      xOffset: margins.left,
      yOffset: margins.top,
      scale: scaleY,
      tickValues: range(config.y.min, config.y.max)
    });

    const scaleX = d3
      .scaleLinear()
      .domain([config.x.min, config.x.max])
      .range([0, width])
      .nice();
    axisBottom(canvas, {
      scale: scaleX,
      title: 'Chromosome',
      xOffset: margins.left,
      yOffset: margins.top + scaleY(config.y.min),
      ticks: rangeSubset.length,
      tickSize: 8,
      tickValues: rangeSubset.map(d => d.max_bp_abs),
      tickFormat: (d, i) => rangeSubset[i].chr,
      labelsBetweenTicks: true
    });

    // todo: instead of replacing the canvas, reuse the context
    plotContainer.current.innerHTML = '';
    plotContainer.current.appendChild(canvas);

    // create overlay to select variants for individual chromosomes
    rangeSubset
      .map(d => d.max_bp_abs)
      .forEach((bp, idx, arr) => {
        const overlay = document.createElement('div');
        overlay.className = 'overlay';
        overlay.style.position = 'absolute';
        overlay.style.top = config.margins.top + 'px';
        overlay.style.left =
          config.margins.left + (idx > 0 ? scaleX(arr[idx - 1]) : 0) + 'px';
        overlay.style.height = scaleY(3) + 'px';
        overlay.style.width =
          scaleX(arr[idx] - (idx > 0 ? arr[idx - 1] : 0)) + 'px';

        overlay.onclick = () => {
          const chromosome = rangeSubset[idx].chr;
          const args = {
            database: phenotype + '.db',
            chr: chromosome,
            nlogpMin: 2, //Math.max(2, Math.floor(rangeSubset[idx].MIN_NLOG_P)),
            nlogpMax: 20, //Math.ceil(rangeSubset[idx].MAX_NLOG_P),
            bpMin: rangeSubset[idx].bp_min,
            bpMax: rangeSubset[idx].bp_max
          };

          drawVariantsPlot(args);
          setSelectedChromosome(chromosome);
          if (onChromosomeChanged) onChromosomeChanged(chromosome);
        };

        plotContainer.current.appendChild(overlay);
      });

    setLoading(false);
  };

  const drawVariantsPlot = async(params, results) => {
    setLoading(true);
    if (!results)
      results = await rawQuery('variants', params);
    const data = results.data;
    const columnIndexes = {
      variant_id: results.columns.indexOf('variant_id'),
      chr: results.columns.indexOf('chr'),
      bp: results.columns.indexOf('bp'),
      nlog_p: results.columns.indexOf('nlog_p')
    };
    const config = {
      data: data,
      canvas: {
        width: 1000,
        height: 600
      },
      margins: {
        top: 20,
        left: 40,
        right: 20,
        bottom: 40
      },
      point: {
        opacity: 0.6,
        size: 3,
        color: '#005ea2'
      },
      x: {
        key: columnIndexes.bp,
        min: params.bpMin || 0,
        max: params.bpMax || ranges[params.chr - 1].bp_max
      },

      y: {
        key: columnIndexes.nlog_p,
        min: params.nlogpMin,
        max: params.nlogpMax
      }
    };

    const canvas = scatterPlot(config);
    const backingCanvas = scatterPlot({
      ...config,
      point: {
        opacity: 1,
        size: 3,
        color: (d, i) => indexToColor(i)
      }
    });

    const interactiveCanvas = document.createElement('canvas');
    interactiveCanvas.className = 'interactive-overlay';
    interactiveCanvas.width = canvas.width;
    interactiveCanvas.height = canvas.height;

    const interactiveCtx = interactiveCanvas.getContext('2d');
    interactiveCtx.globalAlpha = 0.4;
   interactiveCtx.globalCompositeOperation = 'copy';

    let isMouseDown = false;
    let selectedArea = false;
    let overlayPosition = {x1: 0, y1: 0, x2: 0, y2: 0};
    const isWithinScatterplot = (x, y, config) => {
      const { margins } = config;
      const { width, height } = config.canvas;
      return x >= margins.left && x <= (width - margins.right) &&
        y >= margins.top && y <= (height - margins.bottom);
    };

    canvas.addEventListener('mousemove', e => {
      const {x, y} = viewportToLocalCoordinates(e.clientX, e.clientY, canvas);

      const ctx = backingCanvas.getContext('2d');
      const [r, g, b, a] = ctx.getImageData(x, y, 1, 1).data;
      if (!a) {
        const withinScatterplot = isWithinScatterplot(x, y, config);
        canvas.style.cursor = withinScatterplot
          ? 'crosshair' : 'default';
        return;
      }
      const index = colorToIndex(r, g, b);
      const pointData = data[index];
      if (pointData) {
        canvas.style.cursor = 'pointer';
      }
    });

    canvas.addEventListener('mousedown', e => {
      const {x, y} = viewportToLocalCoordinates(e.clientX, e.clientY, canvas);
      const withinScatterplot = isWithinScatterplot(x, y, config);
      if (withinScatterplot) {
        clearSelectionOverlay();
        selectedArea = false;
        isMouseDown = true;
        overlayPosition.x1 = x;
        overlayPosition.y1 = y;
        overlayPosition.x2 = x;
        overlayPosition.y2 = y;
      }
    });

    canvas.addEventListener('mousemove', e => {
      if (isMouseDown) {
        const {x, y} = viewportToLocalCoordinates(e.clientX, e.clientY, canvas);
        // const withinScatterplot = isWithinScatterplot(x, y, config);
        overlayPosition.x2 = x;
        overlayPosition.y2 = y;
        updateSelectionOverlay();
        selectedArea = true;
      }
    });

    canvas.addEventListener('mouseup', e => {
      isMouseDown = false;
      const {x1, y1, x2, y2} = overlayPosition;
      if ((Math.abs(y2 - y1) + Math.abs(x2 - x1)) > 50) {
        finalizeSelectionOverlay();
      }
    });

    canvas.addEventListener('click', async e => {
      const ctx = backingCanvas.getContext('2d');
      const { x, y } = viewportToLocalCoordinates(e.clientX, e.clientY, canvas);
      const [r, g, b, a] = ctx.getImageData(x, y, 1, 1).data;
      if (!a) {
        clearTooltip();
        return;
      }

      const index = colorToIndex(r, g, b);
      console.log(index);
      const pointData = data[index];
      const point = {
        variant_id: pointData[columnIndexes.variant_id],
        chr: pointData[columnIndexes.chr],
        bp: pointData[columnIndexes.bp],
        nlog_p: pointData[columnIndexes.nlog_p]
      };

      const response = await query('variant-by-id', {
        database: params.database,
        id: point.variant_id
      });

      const record = response[0];

      setTooltip(
        x,
        y,
        h('div', { className: '' }, [
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
        ])
      );
      console.log(point);
    });

    const { margins, canvas: canvasSize } = config;

    const width = canvasSize.width - margins.left - margins.right;
    const height = canvasSize.height - margins.top - margins.bottom;

    const scaleY = d3
      .scaleLinear()
      .domain([config.y.min, config.y.max])
      .range([height, 0])
      .nice();

    const thresholdScale = d3
      .scaleLinear()
      .domain([config.y.min, config.y.max])
      .range([height, 0]);

    // add a dotted line at -log10(p) = 5*10^-8
    const threshold = -Math.log10(5 * 10 ** -8);

    let context = canvas.getContext('2d');
    context.beginPath();
    context.globalAlpha = 0.6;
    context.strokeStyle = '#888';
    context.lineWidth = 1;
    context.setLineDash([6, 4]);
    context.moveTo(margins.left, margins.top + thresholdScale(threshold));
    context.lineTo(margins.left + width, margins.top + thresholdScale(threshold));
    context.stroke();

    let defaultDef = {
      textBaseline: 'middle',
      font: `600 14px ${systemFont}`
    };

    let subscriptDef = {
      textBaseline: 'top',
      font: `600 10px ${systemFont}`
    };

    axisLeft(canvas, {
      title: [
        { ...defaultDef, text: '-log' },
        { ...subscriptDef, text: '10' },
        { ...defaultDef, text: '(p)' }
      ],
      xOffset: margins.left,
      yOffset: margins.top,
      scale: scaleY,
      tickValues: scaleY.ticks()//range(config.y.min, config.y.max)
    });

    const scaleX = d3
      .scaleLinear()
      .domain([config.x.min, config.x.max])
      .range([0, width])
      .nice();

    axisBottom(canvas, {
      scale: scaleX,
      title: `Chromosome ${params.chr} Position (MB)`,
      xOffset: margins.left,
      yOffset: margins.top + scaleY(config.y.min),
      tickSize: 8,
      tickFormat: (d, i) => d / 10 ** 6 + ' MB'
    });

    plotContainer.current.innerHTML = '';
    //    plotContainer.current.appendChild(backingCanvas);
    plotContainer.current.appendChild(canvas);
    plotContainer.current.appendChild(interactiveCanvas);

    const tooltip = document.createElement('div');
    tooltip.className = 'custom-tooltip';
    plotContainer.current.appendChild(tooltip);

    const selectionOverlay = document.createElement('div');
    selectionOverlay.className = 'selection-overlay';
    plotContainer.current.appendChild(selectionOverlay);

    function clearTooltip() {
      tooltip.style.display = 'none';
      tooltip.innerHTML = '';
    }

    function setTooltip(x, y, node) {
      tooltip.style.display = 'inline-block';
      tooltip.style.left = x + 'px';
      tooltip.style.top = y + 'px';
      tooltip.innerHTML = '';
      tooltip.appendChild(node);
    }

    function clearSelectionOverlay() {
      interactiveCtx.clearRect(
        config.margins.left,
        config.margins.top,
        interactiveCanvas.width - config.margins.left - config.margins.right,
        interactiveCanvas.height  - config.margins.top - config.margins.bottom
      );
    }

    function updateSelectionOverlay() {
      const {x1, y1, x2, y2} = overlayPosition;
      interactiveCtx.fillStyle = '#000';
      interactiveCtx.fillRect(
        config.margins.left,
        config.margins.top,
        interactiveCanvas.width - config.margins.left - config.margins.right,
        interactiveCanvas.height  - config.margins.top - config.margins.bottom
      );

      interactiveCtx.clearRect(
        Math.min(x1, x2),
        Math.min(y1, y2),
        Math.abs(x2 - x1),
        Math.abs(y2 - y1)
      );
    }

    const selectionScaleX = getScale(
      [0, width],
      [config.x.min, scaleX.ticks()[scaleX.ticks().length - 1]]
    )

    const selectionScaleY = getScale(
      [height, 0],
      [config.y.min, config.y.max]
    )


    function finalizeSelectionOverlay() {
      const {x1, y1, x2, y2} = overlayPosition;

      const bpMin = selectionScaleX(Math.min(x1, x2) - margins.left);
      const bpMax = selectionScaleX(Math.max(x1, x2) - margins.left);
      const nlogpMin = selectionScaleY(Math.max(y1, y2) - margins.top);
      const nlogpMax = selectionScaleY(Math.min(y1, y2) - margins.top);

      const zoomParams = {
        database: params.database,
        chr: params.chr,
        nlogpMin,
        nlogpMax,
        bpMin,
        bpMax
      };

      onZoom && onZoom(zoomParams);
      drawVariantsPlot(zoomParams, {
        columns: results.columns,
        data: results.data.filter(e =>
          +e[columnIndexes.bp] >= Math.floor(+bpMin - 1e-6) &&
          +e[columnIndexes.bp] <= Math.ceil(+bpMax + 1e6) &&
          +e[columnIndexes.nlog_p] >= (+nlogpMin - 1e-6) &&
          +e[columnIndexes.nlog_p] <= (+nlogpMax + 1e6)
        )
      });
    }

    setLoading(false);
  };

  return (
    <>
      <div
        ref={plotContainer}
        className="manhattan-plot"
        style={{ display: loading ? 'none' : 'block' }}
      />
      <div
        className="text-center"
        style={{ display: loading ? 'block' : 'none' }}>
        <Spinner animation="border" variant="primary" role="status">
          <span className="sr-only">Loading...</span>
        </Spinner>
      </div>
    </>
  );
}

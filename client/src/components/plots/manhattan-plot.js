import React, { useEffect, useState, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { rawQuery as query } from '../../services/query';
import { scatterPlot } from '../../services/plots/scatter-plot';
import { axisBottom, axisLeft } from '../../services/plots/axis';
import { range } from '../../services/plots/utils';
import { systemFont } from '../../services/plots/text';
import { updateSummaryResults } from '../../services/actions';
import * as d3 from 'd3';

export function ManhattanPlot({ drawFunctionRef }) {
  const dispatch = useDispatch();
  const plotContainer = useRef(null);
  const summaryResults = useSelector(state => state.summaryResults);
  const { selectedChromosome, phenotype, ranges, loading } = summaryResults;

  const setRanges = ranges => {
    dispatch(updateSummaryResults({ranges}));
  }

  const setSelectedChromosome = selectedChromosome => {
    dispatch(updateSummaryResults({selectedChromosome}));
  }

  const setLoading = loading => {
    dispatch(updateSummaryResults({loading}));
  }

  useEffect(() => {
    query('data/chromosome_ranges.json').then(e => setRanges(e));
  }, [])

  useEffect(() => {
    if (drawFunctionRef)
      drawFunctionRef(drawSummaryPlot);
  }, [drawFunctionRef]);

  const drawSummaryPlot = async database => {
    let rangeSubset = ranges.slice(0, 22);
    console.log(rangeSubset);
    setLoading(true);
    const results = await query('summary', {
      database: database,
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
    console.log(threshold, scaleY(threshold))

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
          console.log(rangeSubset[idx]);
          const chromosome = rangeSubset[idx].chr;
          const args = {
            database: database,
            chr: chromosome,
            nlogpMin: 2,//Math.max(2, Math.floor(rangeSubset[idx].MIN_NLOG_P)),
            nlogpMax: 20,//Math.ceil(rangeSubset[idx].MAX_NLOG_P),
            bpMin: rangeSubset[idx].bp_min,
            bpMax: rangeSubset[idx].bp_max
          };

         drawVariantsPlot(args);
         setSelectedChromosome(chromosome);
        };

        plotContainer.current.appendChild(overlay);
      });

    setLoading(false);
  }

  const drawVariantsPlot = async(params) => {
    setLoading(true);

    const results = await query('variants', params);
    const data = results.data;

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
        color: '#005ea2'
      },
      x: {
        key: results.columns.indexOf('bp'),
        min: 0,
        max: ranges[params.chr - 1].bp_max
      },

      y: {
        key: results.columns.indexOf('nlog_p'),
        min: params.nlogpMin,
        max: params.nlogpMax
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
      title: `Chromosome ${params.chr} Position (MB)`,
      xOffset: margins.left,
      yOffset: margins.top + scaleY(config.y.min),
      tickSize: 8,
      tickFormat: (d, i) => d / 10 ** 6 + ' MB'
    });

    plotContainer.current.innerHTML = '';
    plotContainer.current.appendChild(canvas);

    setLoading(false);
  }

  return (
    <div className="row">
      <div className="col-md-12">
        <div ref={plotContainer} className="manhattan-plot" />
        {/* <pre>{ JSON.stringify(params, null, 2) }</pre> */}
      </div>
      {/* <div class="col-md-12" style={{opacity: 0.5}}> */}
        <div class="btn-group" role="group" aria-label="Basic example">
          {/* <button
            className="btn btn-primary btn-sm"
            onClick={e => drawSummaryPlot(phenotype.value)}
            disabled={loading}>
            Reset
          </button> */}
        </div>
        {/* {timestamp ? <span class="mx-2">{timestamp} s</span> : null} */}
      </div>

    // </div>
  );

}

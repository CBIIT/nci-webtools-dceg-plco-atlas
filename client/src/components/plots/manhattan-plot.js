import React, { useEffect, useState, useRef } from 'react';
import { rawQuery as query } from '../../services/query';
import * as d3 from 'd3';

export function ManhattanPlot(props) {
  const plotContainer = useRef(null);
  const [timestamp, setTimestamp] = useState(0);
  const [loading, setLoading] = useState(false);
  const [ranges, setRanges] = useState([]);
  const [params, setParams] = useState({
    database: 'example',
    chr: 10,
    nlogpMin: 2,
    nlogpMax: 20,
    bpMin: 0,
    bpMax: 10e7
  });

  useEffect(() => {
    query('ranges', { database: 'example' }).then(e => setRanges(e));
  }, []);

  return (
    <div className="row">
      <div class="col-md-12 text-right">
      {timestamp ? <strong class="mx-2">{timestamp} s</strong> : null}
        <div class="btn-group" role="group" aria-label="Basic example">
          <button
            className="btn btn-primary btn-sm"
            onClick={e => drawSummaryPlot(params)}
            disabled={loading}>
            Reset
          </button>
        </div>
      </div>

      <div className="col-md-12">
        <div ref={plotContainer} className="manhattan-plot" />
        {/* <pre>{ JSON.stringify(params, null, 2) }</pre> */}
      </div>

      {/* <div className="col-md-2">
        <Form.Group controlId="chromosome" className="mb-4">
          <Form.Label>
            <b>Chromosome</b>
          </Form.Label>
          <select
            className="form-control"
            onChange={e => setParams({ ...params, chr: e.target.value })}
            value={params.chr}>
            {(() => {
              const options = [];
              for (let i = 1; i <= 22; i++)
                options.push(<option value={i}>{i}</option>);
              return options;
            })()}
          </select>
        </Form.Group>

        <Form.Group className="mb-4">
          <Form.Label>
            <b>Min BP</b>
          </Form.Label>
          <FormControl
            type="number"
            value={params.bpMin}
            onChange={e => setParams({ ...params, bpMin: e.target.value })}
          />
        </Form.Group>

        <Form.Group className="mb-4">
          <Form.Label>
            <b>Max BP</b>
          </Form.Label>
          <FormControl
            type="number"
            value={params.bpMax}
            onChange={e => setParams({ ...params, bpMax: e.target.value })}
          />
        </Form.Group>

        <Form.Group className="mb-4">
          <Form.Label>
            <b>Min -log10(P)</b>
          </Form.Label>
          <FormControl
            type="number"
            min="2"
            value={params.nlogpMin}
            onChange={e => setParams({ ...params, nlogpMin: e.target.value })}
          />
        </Form.Group>

        <Form.Group className="mb-4">
          <Form.Label>
            <b>Max -log10(P)</b>
          </Form.Label>
          <FormControl
            type="number"
            value={params.nlogpMax}
            onChange={e => setParams({ ...params, nlogpMax: e.target.value })}
          />
        </Form.Group>

        <Button
          variant="primary"
          className="my-2 w-100"
          onClick={e => loadRangesPlot()}
          disabled={loading}>
          Plot Ranges
        </Button>
      </div> */}
    </div>
  );

  function exportPlot(params) {

  }

  function scatterPlot(config) {
    const data = config.data;
    const margins = config.margins || {
      top: 20,
      left: 20,
      right: 20,
      bottom: 20
    };

    const outerWidth = config.outerWidth || 700;
    const outerHeight = config.outerHeight || 600;
    const width = outerWidth - margins.left - margins.right;
    const height = outerHeight - margins.top - margins.bottom;

    const canvas = document.createElement('canvas');
    canvas.width = outerWidth;
    canvas.height = outerHeight;

    const context = canvas.getContext('2d');
    context.translate(margins.left, margins.top);

    const scaleX = d3
      .scaleLinear()
      .domain([config.x.min, config.x.max])
      .range([0, width])
      .nice();

    const scaleY = d3
      .scaleLinear()
      .domain([config.y.min, config.y.max])
      .range([height, 0])
      .nice();

    // initialize styles
    let pointSize = config.pointSize || 4;
    context.fillStyle = config.pointColor || 'black';
    context.globalAlpha = 0.5;

    // do not check config.fast inside loop
    if (config.fast) {
      for (let i = 0; i < data.length; i++) {
        let cx = scaleX(data[i][config.x.key]);
        let cy = scaleY(data[i][config.y.key]);
        context.fillRect(cx, cy, pointSize, pointSize);
      }
    } else {
      for (let i = 0; i < data.length; i++) {
        context.fillStyle =
          config.pointColorKey !== undefined && config.pointColorAlt
            ? data[i][config.pointColorKey] % 2
              ? config.pointColorAlt
              : config.pointColor
            : config.pointColor;

        let cx = scaleX(data[i][config.x.key]);
        let cy = scaleY(data[i][config.y.key]);
        context.beginPath();
        context.arc(cx, cy, pointSize, 0, 2 * Math.PI, true);
        context.fill();
      }
    }

    context.setTransform(1, 0, 0, 1, 0, 0);
    return canvas;
  }

  async function drawSummaryPlot(params) {
    let start = new Date();
    let getTimestamp = e => (new Date() - start) / 1000;
    setLoading(true);
    setTimestamp(0);

    const results = await query('summary', {
      database: params.database,
      nlogpMin: 3
    });
    const data = results.data;
    const config = {
      title: 'Ewing Sarcoma',
      data: data,
      outerWidth: 1000,
      outerHeight: 600,
      margins: { top: 20, left: 40, right: 20, bottom: 40 },
      pointSize: 3,
      pointColor: '#005ea2',
      pointColorAlt: '#e47833',
      pointColorKey: results.columns.indexOf('CHR'),
      x: {
        key: results.columns.indexOf('BP_ABS_1000KB'),
        min: 0,
        max: ranges[ranges.length - 1].MAX_BP_ABS
      },
      y: {
        key: results.columns.indexOf('NLOG_P2'),
        min: 3,
        max: 20,
        title: '-LOG10(P)'
      }
    };
    const canvas = scatterPlot(config);
    const width =
      config.outerWidth - config.margins.left - config.margins.right;
    const height =
      config.outerHeight - config.margins.top - config.margins.bottom;

    const scaleY = d3
      .scaleLinear()
      .domain([config.y.min, config.y.max])
      .range([height, 0])
      .nice();

    axisLeft(canvas, {
      title: '-Log10(P)',
      xOffset: config.margins.left,
      yOffset: config.margins.top,
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
      xOffset: config.margins.left,
      yOffset: config.margins.top + scaleY(config.y.min),
      ticks: ranges.length,
      tickSize: 8,
      tickValues: ranges.map(d => d.MAX_BP_ABS),
      tickFormat: (d, i) => ranges[i].CHR,
      labelsBetweenTicks: true
    });

    plotContainer.current.innerHTML = '';
    plotContainer.current.appendChild(canvas);

    ranges
      .map(d => d.MAX_BP_ABS)
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
          console.log(ranges[idx]);

          const args = {
            database: 'example',
            chr: ranges[idx].CHR,
            nlogpMin: Math.max(2, Math.floor(ranges[idx].MIN_NLOG_P)),
            nlogpMax: Math.ceil(ranges[idx].MAX_NLOG_P),
            bpMin: ranges[idx].MIN_BP,
            bpMax: ranges[idx].MAX_BP
          };

          drawVariantsPlot(args);
          setParams(args);
        };

        plotContainer.current.appendChild(overlay);
      });

    setLoading(false);
    setTimestamp(getTimestamp());
  }

  async function drawVariantsPlot(params) {
    let start = new Date();
    let getTimestamp = e => (new Date() - start) / 1000;
    setLoading(true);
    setTimestamp(0);

    const results = await query('variants', params);
    const data = results.data;

    const config = {
      title: 'Ewing Sarcoma',
      data: data,
      outerWidth: 1000,
      outerHeight: 600,
      margins: { top: 20, left: 40, right: 20, bottom: 40 },
      pointSize: 3,
      pointColor: '#005ea2',
      x: {
        key: results.columns.indexOf('BP'),
        min: 0,
        max: ranges[params.chr - 1].MAX_BP
      },

      y: {
        key: results.columns.indexOf('NLOG_P'),
        min: params.nlogpMin,
        max: params.nlogpMax
      }
    };

    const canvas = scatterPlot(config);
    const width =
      config.outerWidth - config.margins.left - config.margins.right;
    const height =
      config.outerHeight - config.margins.top - config.margins.bottom;

    const scaleY = d3
      .scaleLinear()
      .domain([config.y.min, config.y.max])
      .range([height, 0])
      .nice();

    axisLeft(canvas, {
      title: '-Log10(P)',
      xOffset: config.margins.left,
      yOffset: config.margins.top,
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
      title: 'BP',
      xOffset: config.margins.left,
      yOffset: config.margins.top + scaleY(config.y.min),
      tickSize: 8,
      tickFormat: (d, i) => d / 10 ** 6 + ' MB'
    });

    plotContainer.current.innerHTML = '';
    plotContainer.current.appendChild(canvas);

    setLoading(false);
    setTimestamp(getTimestamp());
  }

  function range(min, max) {
    var nums = [];
    for (let i = min; i <= max; i++) nums.push(i);
    return nums;
  }

  /**
   *
   * @param {HTMLCanvasElement} canvas
   * @param {*} config
   */
  function axisLeft(canvas, config) {
    const font = `-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto,
    'Helvetica Neue', Arial, 'Noto Sans', sans-serif, 'Apple Color Emoji',
    'Segoe UI Emoji', 'Segoe UI Symbol', 'Noto Color Emoji'`;

    let { xOffset, yOffset, scale, tickValues, tickSize } = config;
    tickSize = tickSize || 6;
    tickValues = tickValues || scale.ticks();
    let interpolatedTickValues = tickValues.map(
      (val, idx, arr) => (val + (idx > 0 ? arr[idx - 1] : 0)) / 2
    );

    let yCoords = tickValues.map(scale);
    let padding = 2;

    const context = canvas.getContext('2d');
    context.translate((xOffset || 0) - tickSize - padding, yOffset || 0);
    context.fillStyle = 'black';
    context.font = '600 12px ' + font;
    context.textAlign = 'right';
    context.textBaseline = 'middle';
    context.globalAlpha = 1;

    context.fillRect(tickSize, 0, 2, scale(tickValues[0]));
    yCoords.forEach((yCoord, i) => {
      context.fillRect(0, yCoord, tickSize, 2);
      context.fillText(tickValues[i], -padding, yCoord + 2);
    });

    context.save();

    const midpoint = scale((d3.min(tickValues) + d3.max(tickValues)) / 2);
    context.rotate((90 * Math.PI) / 180);
    context.font = '600 14px ' + font;
    context.translate(midpoint, 25);
    context.textAlign = 'center';
    context.fillText(config.title || 'Y Axis', 0, 0);

    context.restore();
    context.setTransform(1, 0, 0, 1, 0, 0);
  }

  function axisBottom(canvas, config) {
    const font = `-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto,
    'Helvetica Neue', Arial, 'Noto Sans', sans-serif, 'Apple Color Emoji',
    'Segoe UI Emoji', 'Segoe UI Symbol', 'Noto Color Emoji'`;

    let { xOffset, yOffset, scale, tickValues, tickSize, tickFormat } = config;
    tickSize = tickSize || 6;
    tickValues = tickValues || scale.ticks();
    let interpolatedTickValues = tickValues.map(
      (val, idx, arr) => (val + (idx > 0 ? arr[idx - 1] : 0)) / 2
    );

    let coords = tickValues.map(scale);
    let padding = 2;

    const context = canvas.getContext('2d');
    context.translate(xOffset || 0, yOffset || 0);
    context.fillStyle = 'black';
    context.font = '600 12px ' + font;
    context.textAlign = 'center';
    context.textBaseline = 'top';
    context.globalAlpha = 1;

    context.fillRect(0, 0, scale(d3.max(tickValues)), 2);
    coords.forEach((coord, i) => {
      context.fillRect(coord, 0, 2, tickSize);
      const label = tickFormat ? tickFormat(tickValues[i], i) : tickValues[i];
      const labelOffset = config.labelsBetweenTicks
        ? scale(interpolatedTickValues[i])
        : coord;
      context.fillText(label, labelOffset + 1, padding + tickSize);
    });

    const midpoint = scale(d3.max(tickValues) / 2);

    context.font = '600 14px ' + font;
    context.fillText(config.title || 'X Axis', midpoint, padding + 25);

    context.setTransform(1, 0, 0, 1, 0, 0);
  }
}

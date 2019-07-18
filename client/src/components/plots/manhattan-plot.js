import React, { useState, useRef } from 'react';
import { query } from '../../services/query';
import { Button, Form, FormControl } from 'react-bootstrap';
import * as d3 from 'd3';

export function ManhattanPlot(props) {
  const plotContainer = useRef(null);
  const [timestamp, setTimestamp] = useState(0);
  const [loading, setLoading] = useState(false);
  const [params, setParams] = useState({
    database: 'example',
    chr: 10,
    nlogpMin: 2,
    nlogpMax: 20,
    bpMin: 0,
    bpMax: 10e7
  });

  return (
    <div className="row">

      <div class="col-md-12">
        <Button
          variant="primary"
          className="my-2"
          onClick={e => loadSummaryPlot()}
          disabled={loading}>
          Show Summary
        </Button>
        {timestamp
          ? <strong class="ml-2">{timestamp} s</strong>
          : null}
      </div>


      <div className="col-md-12">
        <div ref={plotContainer} />
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

  function canvasScatterPlot(data, config) {
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    const margin = config.margin || {
      top: 20,
      right: 20,
      bottom: 30,
      left: 40
    };
    const outerWidth = config.width || 960;
    const outerHeight = config.height || 500;
    const width = outerWidth - margin.left - margin.right;
    const height = outerHeight - margin.top - margin.bottom;
  }

  function scatterPlot(el, data, config) {
    const margin = config.margin || {
      top: 20,
      right: 20,
      bottom: 30,
      left: 40
    };
    const outerWidth = config.width || 960;
    const outerHeight = config.height || 500;
    const width = outerWidth - margin.left - margin.right;
    const height = outerHeight - margin.top - margin.bottom;

    let x = d3.scaleLinear().range([0, width]);
    let y = d3.scaleLinear().range([height, 0]);
    x.domain(d3.extent(data, d => d[config.xAxis.key])).nice();
    y.domain(d3.extent(data, d => d[config.yAxis.key])).nice();

    let xAxis = d3.axisBottom(x);
    if (config.xAxis.callback) xAxis = config.xAxis.callback(xAxis);

    let yAxis = d3.axisLeft(y);

    d3.select(el).selectAll('*').remove().empty();

    let svg = d3
      .select(el)
      .append('svg')
      .attr('width', '100%')
      .attr('viewBox', `0 0 ${outerWidth} ${outerHeight}`)
      .append('g')
      .attr('class', 'manhattan-plot')
      .attr('transform', `translate(${margin.left}, ${margin.top})`);

    let xAxisGroup = svg
      .append('g')
      .attr('class', 'x-axis')
      .attr('transform', `translate(0, ${height})`)
      .call(xAxis)
      .append('text')
      .attr('class', 'label')
      .attr('x', width)
      .attr('y', -6)
      .style('text-anchor', 'end')
      .style('fill', 'black')
      .text(config.xAxis.title);

    let yAxisGroup = svg
      .append('g')
      .attr('class', 'y-axis')
      .call(yAxis)
      .append('text')
      .attr('class', 'label')
      .attr('transform', 'rotate(-90)')
      .attr('y', 6)
      .attr('dy', '.71em')
      .style('text-anchor', 'end')
      .style('fill', 'black')
      .text(config.yAxis.title);

    let pointGroup = svg
      .selectAll('.dot')
      .data(data)
      .enter()
      .append('circle')
      .attr('class', 'dot')
      .attr('r', 3)

      .attr('cx', d => x(d[config.xAxis.key]))
      .attr('cy', d => y(d[config.yAxis.key]))
      // .style('opacity', 0.5)
      .attr('fill', (d, i) =>
        d[config.colorKey] % 2 == 0 ? '#005ea2' : '#162e51'
      ) // color(d[config.colorKey]));
      .attr('fill-opacity', 0.7);

    return svg;
  }

  async function loadRangesPlot(args) {
    setLoading(true);
    setTimestamp(0);

    let start = new Date();
    let getTimestamp = e => (new Date() - start) / 1000;

    const el = plotContainer.current;


    const data = await query('variants', args || params);

    scatterPlot(el, data, {
      margin: { top: 20, right: 40, bottom: 30, left: 40 },
      width: 960,
      height: 500,
      xAxis: { key: 'BP', title: 'bp' },
      yAxis: { key: 'NLOG_P', title: '-log10(p)' },
      colorKey: 'CHR',
      onDragSelection: (x, y) => {
        console.log(x, y);
      }
    });

    setLoading(false);
    setTimestamp(getTimestamp());
  }

  async function loadSummaryPlot() {
    setLoading(true);
    setTimestamp(0);

    let start = new Date();
    let getTimestamp = e => (new Date() - start) / 1000;

    const el = plotContainer.current;

    const data = await query('summary', params);
    const ranges = await query('ranges', params);
    const config = {
      margin: { top: 20, right: 40, bottom: 30, left: 40 },
      width: 960,
      height: 500,
      xAxis: {
        key: 'BP_ABS_1000KB',
        title: 'chr',
        callback: axis =>
          axis
            .ticks(ranges.length)
            .tickValues(ranges.map(d => d.MAX_BP_ABS))
            .tickFormat('')
      },
      yAxis: { key: 'NLOG_P2', title: '-log10(p)' },
      colorKey: 'CHR'
    };
    const width = config.width - config.margin.left - config.margin.right;
    const height = config.height - config.margin.top - config.margin.bottom;

    let xOverlayScale = d3
      .scaleLinear()
      .domain(d3.extent(ranges.concat({ MAX_BP_ABS: 0 }), d => d.MAX_BP_ABS))
      .nice()
      .range([0, width]);

    let xAxis = d3
      .axisBottom(xOverlayScale)
      .ticks(ranges.length)
      .tickValues(
        ranges.map(
          (d, idx) =>
            (d.MAX_BP_ABS + (idx > 0 ? ranges[idx - 1].MAX_BP_ABS : 0)) / 2
        )
      )
      .tickFormat((d, i) => ranges[i].CHR)
      .tickSize(0);

    const svg = scatterPlot(el, data, config);

    let xAxisEl = svg
      .append('g')
      .attr('class', 'hide-paths')
      .attr('transform', `translate(0, ${height})`)
      .call(xAxis)
      .selectAll('text')
      .attr('transform', `translate(0, 4)`);

    let overlayGroup = svg
      .selectAll('.manhattan-overlay')
      .data(ranges)
      .enter()
      .append('rect')
      .attr('class', 'manhattan-overlay')
      .attr('width', (d, i) =>
        xOverlayScale(
          ranges[i].MAX_BP_ABS - (i > 0 ? ranges[i - 1].MAX_BP_ABS : 0)
        )
      )
      .attr('height', height + 2)
      .attr('x', (d, i) =>
        i > 0 ? xOverlayScale(ranges[i - 1].MAX_BP_ABS) : 0
      )
      .attr('y', 0)
      .attr('fill', (d, i) => (i % 2 ? '#888' : '#fff'))
      .on('click', d => {
        const args = {
          database: 'example',
          chr: d.CHR,
          nlogpMin: Math.max(3, Math.floor(d.MIN_NLOG_P)),
          nlogpMax: Math.ceil(d.MAX_NLOG_P),
          bpMin: d.MIN_BP,
          bpMax: d.MAX_BP
        };

        loadRangesPlot(args);
        setParams(args);
//        console.log('clicked', d)
      });

    setLoading(false);
    setTimestamp(getTimestamp());
  }
}

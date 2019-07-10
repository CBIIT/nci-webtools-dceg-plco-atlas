import React, { useState, useRef } from 'react';
import { query } from '../../services/query';
import { Button, Card, Nav, Tab } from 'react-bootstrap';
import * as d3 from 'd3';

export function ManhattanPlot(props) {
  const plotContainer = useRef(null);
  const [loading, setLoading] = useState(false);
  const [params, setParams] = useState({
    database: 'example',
    chr: 1,
    nlogpMin: 4,
    nlogpMax: 7,
    bpMin: 0,
    bpMax: 10e7
  });

  return (
    <div>
      <Button
        variant="primary"
        className="m-2"
        onClick={e => loadPlot(false)}
        disabled={loading}>
        Generate Plot
      </Button>

      <div ref={plotContainer}/>

    </div>
  );

  function scatterPlot(el, data, xAxisConfig, yAxisConfig) {
    el.innerHTML = '';

    const margin = { top: 20, right: 20, bottom: 30, left: 40 };
    const outerWidth = 960;
    const outerHeight = 500;
    const width = outerWidth - margin.left - margin.right;
    const height = outerHeight - margin.top - margin.bottom;

    let x = d3.scaleLinear().range([0, width]);
    let y = d3.scaleLinear().range([height, 0]);
    x.domain(d3.extent(data, d => d[xAxisConfig.key])).nice();
    y.domain(d3.extent(data, d => d[yAxisConfig.key])).nice();

    let color = d3.scaleOrdinal(d3.schemeCategory10);

    let xAxis = d3.axisBottom(x);
//    if (xAxisConfig.configureFn)
//      xAxis = xAxisConfig.configureFn(xAxis);

    let yAxis = d3.axisLeft(y);


    let svg = d3
      .select(el)
      .append('svg')
      .attr('height', '100%')
      .attr('viewBox', `0 0 ${outerWidth} ${outerHeight}`)
      .append('g')
      .attr('transform', `translate(${margin.left}, ${margin.top})`);

    svg
      .append('g')
      .attr('class', 'x axis')
      .attr('transform', `translate(0, ${height})`)
      .call(xAxis)
      .append('text')
      .attr('class', 'label')
      .attr('x', width)
      .attr('y', -6)
      .style('text-anchor', 'end')
      .style('fill', 'black')
      .text(xAxisConfig.title);


    svg
      .append('g')
      .attr('class', 'y axis')
      .call(yAxis)
      .append('text')
      .attr('class', 'label')
      .attr('transform', 'rotate(-90)')
      .attr('y', 6)
      .attr('dy', '.71em')
      .style('text-anchor', 'end')
      .style('fill', 'black')
      .text(yAxisConfig.title);

    svg
      .selectAll('.dot')
      .data(data)
      .enter()
      .append('circle')
      .attr('class', 'dot')
      .attr('r', 2)
      .attr('opacity', 0.8)
      .attr('cx', d => x(d[xAxisConfig.key]))
      .attr('cy', d => y(d[yAxisConfig.key]))
      .style('fill', 'steelblue');
  }

  async function loadPlot() {
    setLoading(true);

    const el = plotContainer.current;
    el.innerHTML = '';
    const data = await query('summary', params);
    const ranges = await query('ranges', params);
    console.log(data, ranges);

    scatterPlot(
      el,
      data,
      {
        key: 'BP_ABS_1000KB',
        title: 'Chr',
        configureFn: axis => axis
          .ticks(ranges.length)
          .tickValues(d3.set(ranges.map(d => d.MAX_BP_ABS)).values())
          .tickFormat(d => d.CHR)
    //    .tickSize(-(height), 0, 0);
      },
      {key: 'NLOG_P2', title: '-log10(p)'}
    );

    setLoading(false);
  };


  /*
  return (
    <div>
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
        className="m-2"
        onClick={e => loadPlot(false)}
        disabled={loading}>
        Generate Plot
      </Button>
      <Button
        variant="primary"
        className="m-2"
        onClick={e => loadPlot(true)}
        disabled={loading}>
        Generate Plot (Aggregate)
      </Button>
    </div>
  );
  */
}

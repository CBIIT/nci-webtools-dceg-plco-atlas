import React from 'react';
import * as d3 from 'd3';

export function ManhattanPlot(props) {
    const plotContainer = useRef(null);
    const [params, setParams] = useState({
        database: 'example',
        chr: 1,
        nlogpMin: 4,
        nlogpMax: 7,
        bpMin: 0,
        bpMax: 10e7,
      });



    return (
        <Form.Group controlId="chromosome" className="mb-4">
        <Form.Label>
          <b>Chromosome</b>
        </Form.Label>
          <select className="form-control" onChange={e => setParams({...params, chr: e.target.value})} value={params.chr}>
            {
              (() => {
                const options = [];
                for (let i = 1; i <= 22; i++)
                  options.push(<option value={i}>{i}</option>)
                return options;
              })()
            }
          </select>
      </Form.Group>

      <Form.Group className="mb-4">
        <Form.Label>
          <b>Min BP</b>
        </Form.Label>
        <FormControl type="number" value={params.bpMin} onChange={e => setParams({...params, bpMin: e.target.value})} />
      </Form.Group>

      <Form.Group className="mb-4">
        <Form.Label>
          <b>Max BP</b>
        </Form.Label>
        <FormControl type="number" value={params.bpMax} onChange={e => setParams({...params, bpMax: e.target.value})} />
      </Form.Group>

      <Form.Group className="mb-4">
        <Form.Label>
          <b>Min -log10(P)</b>
        </Form.Label>
        <FormControl type="number" value={params.nlogpMin} onChange={e => setParams({...params, nlogpMin: e.target.value})} />
      </Form.Group>

      <Form.Group className="mb-4">
        <Form.Label>
          <b>Max -log10(P)</b>
        </Form.Label>
        <FormControl type="number" value={params.nlogpMax} onChange={e => setParams({...params, nlogpMax: e.target.value})} />
      </Form.Group>

      <Button variant="primary" className="m-2" onClick={e => loadPlot(false)} disabled={loading}>Generate Plot</Button>
      <Button variant="primary" className="m-2" onClick={e => loadPlot(true)} disabled={loading}>Generate Plot (Aggregate)</Button>
    )
}


  const loadPlot = async (aggregate) => {
    setLoading(true);
    let results = [];

    if (!aggregate)
      results = await query('query', params);

    else {
      results = await query('summary', params);
      results = results.filter(v => v.CHR == params.chr)
    }

    let data = results
    setLoading(false);
    const el = plotContainer.current;

    var margin = { top: 20, right: 20, bottom: 30, left: 40 },
      width = 960 - margin.left - margin.right,
      height = 500 - margin.top - margin.bottom;

    var x = d3.scaleLinear()
      .range([0, width]);

    var y = d3.scaleLinear()
      .range([height, 0]);

    var color = d3.scaleOrdinal(d3.schemeCategory10);

    var xAxis = d3.axisBottom(x);

    var yAxis = d3.axisLeft(y);
    el.innerHTML = '';

    var svg = d3.select(el).append("svg")
      .attr("height", '100%')
      .attr("viewBox", `0 0 960 500`)
      .append("g")
      .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    x.domain(d3.extent(data, function (d) { return !aggregate ? d.BP : d.BP_GROUP; })).nice();
    y.domain(d3.extent(data, function (d) { return !aggregate ? d.NLOG_P : d.NLOG_P_GROUP; })).nice();

    svg.append("g")
      .attr("class", "x axis")
      .attr("transform", "translate(0," + height + ")")
      .call(xAxis)
      .append("text")
      .attr("class", "label")
      .attr("x", width)
      .attr("y", -6)
      .style("text-anchor", "end")
      .style("fill", "black")
      .text("BP");

    svg.append("g")
      .attr("class", "y axis")
      .call(yAxis)
      .append("text")
      .attr("class", "label")
      .attr("transform", "rotate(-90)")
      .attr("y", 6)
      .attr("dy", ".71em")
      .style("text-anchor", "end")
      .style("fill", "black")
      .text("-log10(P)")

    svg.selectAll(".dot")
      .data(data)
      .enter().append("circle")
      .attr("class", "dot")
      .attr("r", 2)
      .attr("opacity", 0.8)
      .attr("cx", function (d) { return x(d.BP_GROUP); })
      .attr("cy", function (d) { return y(d.NLOG_P_GROUP); })
      .style("fill", 'steelblue');

    console.log(el, d3);
  }

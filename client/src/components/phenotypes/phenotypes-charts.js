import React from "react";
import Plot from "react-plotly.js";

export const BarChart = ({ data, categories, xTitle, yTitle }) => (
<Plot
    className="w-100"
    style={{ minHeight: "600px", width: "600px" }}
    data={categories.map((name, i) => {
      let x = [];
      let y = [];
      for (let key in data) {
          x.push(key);
          y.push(data[key][i]);
      }
      let plotData = { x, y, name, type: "bar"};

      if (x.length <= 2 && categories.length <= 2) {
        plotData.width = x.map(e => 0.2);
      }

      return plotData;
    })}

    layout={{
      xaxis: {
          automargin: true,
          title: xTitle,
      },
      yaxis: {
          automargin: true,
          title: yTitle,
          zeroline: true,
      },
      autosize: true
    }}
    config={{
      displayModeBar: false,
      responsive: true
    }}
/>
);

export const HorizontalBarChart = ({ data, categories }) => (
  <Plot
    className="w-100"
    style={{ minHeight: "600px" }}
    data={categories.map((name, i) => {
      let x = [],
        y = [];
      for (let key in data) {
        x.push(data[key][i]);
        y.push(key);
      }
      return { x, y, name, type: "bar", orientation: "h" };
    })}
    layout={{
      xaxis: { automargin: true },
      yaxis: { automargin: true, zeroline: true},
      // barmode: 'stack',
      autosize: true
    }}
    config={{
      displayModeBar: false,
      responsive: true
    }}
    // onLegendClick={_ => false}
  />
);

export const AreaChart = ({data, categories, xTitle, yTitle}) => {
  console.log(data, categories);

  let items = categories.map((name, i) => {
    let x = [];
    let y = [];
    for (let key in data) {
        x.push(key);
        y.push(data[key][i]);
    }
    return {x, y}
  });

  return <Plot
      className="w-100"
      style={{ minHeight: "600px" }}
      data={[{
        x: categories, //data.map((e, i) => i + 1),
        y: data,
        text: categories,
        type: 'scatter',
        line: {shape: 'spline', smoothing: 100},
      }]}
      config={{
        displayModeBar: false,
        responsive: true
      }}
  />
}

export const PieChart = ({ data, categories }) => (
  <Plot
    className="w-100"
    style={{minHeight: "600px"}}
    data={[
      {
        values: data,
        labels: categories,
        hoverinfo: "label+percent",
        hole: 0.4,
        type: "pie"
      }
    ]}
    layout={{
      showlegend: true,
      autosize: true
    }}
    config={{
      displayModeBar: false,
      responsive: true
    }}
  />
);

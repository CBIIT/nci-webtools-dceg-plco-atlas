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
      let plotData = {
        x,
        y,
        name,
        type: "bar",
        hoverinfo: i === 0 ? 'y' : 'skip',
        hovertemplate: i === 0 ? '%{text}<extra></extra>' : null,
        text: i > 0 ? '' : Object.entries(data).map(([key, value]) => {
          return [
            xTitle + `: <b>${key}</b>`,
            categories.map((name, i) => `${name}: <b>${value[i].toLocaleString()}</b>`).join('<br>')
          ].join('<br>');
        })
      };

      if (x.length <= 2 && categories.length <= 2) {
        plotData.width = x.map(e => 0.2);
      }

      return plotData;
    })}
    layout={{
      hovermode: 'x',
      xaxis: {
          automargin: true,
          title: xTitle,
          separatethousands: true,
      },
      yaxis: {
          automargin: true,
          title: yTitle,
          zeroline: true,
          showline: true,
          separatethousands: true,
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
        hovertemplate: '%{text}<extra></extra>',
        text: categories.map((name, i) => [
          `${xTitle}: <b>${name}</b>`,
          `${yTitle}: <b>${data[i].toLocaleString()}</b>`
        ].join('<br>')),
        type: 'scatter',
        line: {shape: 'spline', smoothing: 100},
      }]}
      layout={{
        xaxis: {
            automargin: true,
            title: xTitle,
        },
        yaxis: {
            automargin: true,
            title: yTitle,
            zeroline: true,
            showline: true,
        },
        autosize: true
      }}
      config={{
        displayModeBar: false,
        responsive: true
      }}
  />
}

export const PieChart = ({ data, categories }) => (
  <Plot
    style={{minHeight: "600px", maxWidth: "600px", margin: "0 auto"}}
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

import React from "react";
import { PlotlyWrapper as Plot } from '../../plots/plotly/plotly-wrapper';
import { systemFont } from '../../plots/custom/text';


export const hoverLayout = {
  hoverlabel: {
    bgcolor: "#fff",
    bordercolor: '#bbb',
    font: {
      size: 14,
      color: '#212529',
      family: systemFont
    },
  },
}

export const colors = [
  `rgba(23, 118, 182, 0.2)`,
  `rgba(36, 162, 33, 0.2)`,
  `rgba(216, 36, 31, 0.2)`,
  `rgba(149, 100, 191, 0.2)`,
  `rgba(141, 86, 73, 0.2)`,
  `rgba(229, 116, 195, 0.2)`,
  `rgba(127, 127, 127, 0.2)`,
  `rgba(188, 191, 0, 0.2)`,
  `rgba(0, 190, 209, 0.2)`,
];

const percentFormatter = (value, decimals = 2) => {
  let percent = value.toFixed(decimals).toLocaleString();
  let cutoff = Math.pow(10, -decimals);
  let label = value >= cutoff ? percent : `<${cutoff}`;
  return `${label}%`;
}

export const BarChart = ({ data, categories, xTitle, yTitle, yMax, formatPercent }) => (
<Plot
    className="w-100 disable-x-axis-tooltip override-cursor"
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
        fillcolor: colors[colors.length % i],
        line: {
          color: colors[colors.length % i]
        },
        hoverinfo: i === 0 ? 'y' : 'skip',
        hovertemplate: i === 0 ? '%{text}<extra></extra>' : null,
        text: i > 0 ? '' : Object.entries(data).map(([key, value]) => {
          return [
            `<b>${xTitle}</b>: ${key}`,
            categories.map((name, i) =>  `<b>${name}</b>: ${
              formatPercent ? percentFormatter(value[i]) : value[i].toLocaleString()
            }`).join('<br>')
          ].join('<br>');
        })
      };

      if (x.length <= 2 && categories.length <= 2) {
        plotData.width = x.map(e => 0.2);
      }

      return plotData;
    })}
    layout={{
      ...hoverLayout,
      hovermode: 'x',
      xaxis: {
          fixedrange: true,
          automargin: true,
          title: xTitle,
          separatethousands: true,
      },
      yaxis: {
          [yMax ? 'range' : '']: [0, yMax],
          fixedrange: true,
          automargin: true,
          title: {
            text: yTitle,
            standoff: 20,
          },
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
    className="w-100  disable-x-axis-tooltip"
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

export const AreaChart = ({data, categories, xTitle, yTitle, formatPercent}) => {
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
      className="w-100 disable-x-axis-tooltip override-cursor"
      style={{ minHeight: "600px" }}
      data={[{
        x: categories, //data.map((e, i) => i + 1),
        y: data,
        hovertemplate: '%{text}<extra></extra>',
        text: categories.map((name, i) => {
          let label = formatPercent ? percentFormatter(data[i]) : data[i].toLocaleString()
          return [
            `<b>${xTitle}</b>: ${name}`,
            `<b>${yTitle}</b>: ${label}`
          ].join('<br>')
        }),
        type: 'scatter',
        fill: 'tonexty',
        line: {shape: 'spline'},
      }]}
      layout={{
        ...hoverLayout,
        xaxis: {
            fixedrange: true,
            automargin: true,
            title: xTitle,
        },
        yaxis: {
            fixedrange: true,
            automargin: true,
            title: {
              text: yTitle,
              standoff: 20,
            },
            zeroline: true,
            showline: true,
        },
        autosize: true
      }}
      config={{
        displayModeBar: false,
        responsive: true,
      }}
  />
}

export const GroupedAreaChart = ({data, categories, xTitle, yTitle, fill, yMax, formatPercent}) => {
  let items = categories.map((name, i) => {
    let x = [];
    let y = [];
    for (let key in data) {
        x.push(key);
        y.push(data[key][i]);
    }
    return {x, y}
  });

  if (!yMax) {
    for (let key in data) {
      yMax = Math.max(
        yMax,
        data[key].reduce((acc, curr) => acc > curr ? acc : curr)
      );
    }
  }

  return <Plot
    className="w-100 disable-x-axis-tooltip override-cursor"
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
        type: 'scatter',
        mode: 'none',
        fill: fill ? 'tozeroy' : '',
        fillcolor: colors[i],
        line: {shape: 'spline'},
        hoverinfo: i === 0 ? 'y' : 'skip',
        hovertemplate: i === 0 ? '%{text}<extra></extra>' : null,
        text: i > 0 ? '' : Object.entries(data).map(([key, value]) => {
          return [
            `<b>${xTitle}</b>: ${key}`,
            categories.map((name, i) => `<b>${name}</b>: ${
              formatPercent ? percentFormatter(value[i]) : value[i].toLocaleString()
            }`).join('<br>')
          ].join('<br>');
        })
      };

      return plotData;
    })}
    layout={{
      ...hoverLayout,
      hovermode: 'x',
      xaxis: {
          fixedrange: true,
          automargin: true,
          title: xTitle,
          separatethousands: true,
      },
      yaxis: {
          range: [0, yMax],
          fixedrange: true,
          automargin: true,
          title: {
            text: yTitle,
            standoff: 20,
          },
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
      ...hoverLayout,
      showlegend: true,
      autosize: true
    }}
    config={{
      displayModeBar: false,
      responsive: true
    }}
  />
);

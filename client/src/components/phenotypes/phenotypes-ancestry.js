import React from 'react';
import Plot from 'react-plotly.js';

export function PhenotypesAncestry({
  selectedPhenotype,
  phenotypeType,
  option,
  data,
}) {

  let colors = ["#1f77b4","#ff7f0e","#2ca02c","#d62728","#9467bd","#8c564b","#e377c2","#7f7f7f","#bcbd22","#17becf"];

  // create traces for stacked bar chart
  const plotData = data.distributionCategories.map((name, i) => {
    let ancestryData = data.distribution.ancestry;
    let x = [];
    let y = [];

    for (let key in ancestryData) {
      x.push(ancestryData[key][i]);
      y.push(key);
    }

    return {x, y, name, type: 'bar', orientation: 'h', marker: {color: colors[i]}};
  })

  const plotLayout = {
    // title: `Distribution of ${selectedPhenotype.title} by Ancestry`,
    xaxis: {automargin: true},
    yaxis: {automargin: true},
    barmode: 'stack',
    autosize: true,
  };

  const plotConfig = {
    displayModeBar: false,
    responsive: true
  };
  return (
      <Plot
        style={{ width: "100%", height: "600px" }}
        data={plotData}
        layout={plotLayout}
        config={plotConfig}
        onLegendClick={_ => false}
      />
  );
}

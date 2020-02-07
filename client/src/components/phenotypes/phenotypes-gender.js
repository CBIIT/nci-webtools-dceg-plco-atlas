import React from 'react';
import Plot from 'react-plotly.js';

export function PhenotypesGender({
  selectedPhenotype,
  phenotypeType,
  data,
}) {

  let colors = ["#1f77b4","#ff7f0e","#2ca02c","#d62728","#9467bd","#8c564b","#e377c2","#7f7f7f","#bcbd22","#17becf"];

  // create traces for stacked bar chart
  const plotData = data.distributionCategories.map((name, i) => {
    let genderData = data.distribution.gender;
    let x = [];
    let y = [];

    for (let key in genderData) {
      x.push(key);
      y.push(genderData[key][i]);
    }

    return {x, y, name, type: 'bar', marker: {color: colors[i]}};
  });

  const plotLayout = {
    // title: `Distribution of ${selectedPhenotype.title} by Gender`,
    showlegend: true,
    barmode: 'stack',
  };

  const plotConfig = {
    displayModeBar: false,
    // responsive: true,
  };

  return (
    <div className="m-2 text-center">
        <Plot
            // className="w-100"
            data={plotData}
            layout={plotLayout}
            config={plotConfig}
            onLegendClick={_ => false}
            />
    </div>
  );
}

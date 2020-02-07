import React from 'react';
import Plot from 'react-plotly.js';

export function PhenotypesAge({
  selectedPhenotype,
  phenotypeType,
  option,
  data,
  distributionType,
}) {
  let colors = ["#1f77b4","#ff7f0e","#2ca02c","#d62728","#9467bd","#8c564b","#e377c2","#7f7f7f","#bcbd22","#17becf"];

  // create traces for stacked bar chart
  const plotData = data.distributionCategories.map((name, i) => {
    let ageData = data.distribution.age;
    let x = [];
    let y = [];

    for (let key in ageData) {
      x.push(key);
      y.push(ageData[key][i]);
    }

    return {x, y, name, type: 'bar', marker: {color: colors[i]}};
  })

  const plotLayout = {
    // title: `Distribution of ${selectedPhenotype.title} by Age`,
    barmode: 'stack',
  };

  const plotConfig = {
    // responsive: true,
    displayModeBar: false,
  }

  return (
    <div className="m-2  text-center">
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

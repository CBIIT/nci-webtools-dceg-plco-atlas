import React from 'react';
import Plot from 'react-plotly.js';

export function PhenotypesAncestry({
  selectedPhenotype,
  phenotypeType,
  option,
  ancestryData,
}) {

  let x = [];
  let y = [];

  for (let key in ancestryData) {
    x.push(ancestryData[key]);
    y.push(key);
  }


  const data = [{
    x, y,
    type: 'bar',
    orientation: 'h',
  }];

  const layout = {
    title: `Distribution of ${selectedPhenotype.title} by Ancestry`,
    autosize: true,
  };

  return (
    <div className="m-2 text-center">
        <Plot
            data={data}
            layout={layout}
            onLegendClick={_ => false}
        />
    </div>
  );
}

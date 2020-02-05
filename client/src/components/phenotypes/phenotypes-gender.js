import React from 'react';
import Plot from 'react-plotly.js';

export function PhenotypesGender({
  selectedPhenotype,
  phenotypeType,
  sexData,
}) {
  const data = [{
    values: [sexData.female, sexData.male],
    labels: ['Female', 'Male'],
    hoverinfo: 'label+percent',
    hole: .4,
    type: 'pie'
  },];

  const layout = {
    title: `Distribution of ${selectedPhenotype.title} by Gender`,
    showlegend: true,
  };

  const config = {
    // responsive: true,
  };

  return (
    <div className="m-2 text-center">
        <Plot
            // className="w-100"
            data={data}
            layout={layout}
            config={config}
            onLegendClick={_ => false}
            />
    </div>
  );
}

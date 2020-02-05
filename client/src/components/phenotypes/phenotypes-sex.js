import React from 'react';
import Plot from 'react-plotly.js';

export function PhenotypesSex({
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
    title: `Distribution of ${selectedPhenotype.title} by Sex`,
    showlegend: true,
    width: 1000,
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

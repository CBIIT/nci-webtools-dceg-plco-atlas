import React from 'react';
import Plot from 'react-plotly.js';

export function PhenotypesFrequency({
  selectedPhenotype,
  phenotypeType,
  frequencyData,
}) {
  const data = [{
    values: [frequencyData.positive, frequencyData.negative],
    labels: ['% With', '% Without'],
    hoverinfo: 'label+percent',
    hole: .4,
    type: 'pie'
  },];

  const layout = {
    title: `Frequency of ${selectedPhenotype.title}`,
    showlegend: true
  };

  return (
    <div className="row m-2">
      <div className="col-md-6">
        <h4>Description</h4>
        <pre>{JSON.stringify(selectedPhenotype, null, 2)}</pre>
        <pre>{JSON.stringify(phenotypeType, null, 2)}</pre>
      </div>
      <div className="col-md-6">
        <Plot
          data={data}
          layout={layout}
          onLegendClick={_ => false}
          />
      </div>
    </div>
  );
}

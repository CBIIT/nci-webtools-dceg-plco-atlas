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
    type: 'pie',
  },];

  const layout = {
    // title: `Frequency of ${selectedPhenotype.title}`,
    showlegend: true
  };

  const config = {
    displayModeBar: false,
    // responsive: true,
  }

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

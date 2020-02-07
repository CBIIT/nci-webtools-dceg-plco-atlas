import React from 'react';
import Plot from 'react-plotly.js';

export function PhenotypesFrequency({
  selectedPhenotype,
  phenotypeType,
  data,
}) {

  const plotData = [{
    values: data.frequency,
    labels: data.categories,
    hoverinfo: 'label+percent',
    hole: .4,
    type: 'pie',
  }];

  const plotLayout = {
    // title: `Frequency of ${selectedPhenotype.title}`,
    showlegend: true,
    autosize: true,
  };

  const plotConfig = {
    displayModeBar: false,
    responsive: true,
  }

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

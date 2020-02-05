import React from 'react';
import Plot from 'react-plotly.js';

export function PhenotypesRelated({
  selectedPhenotype,
  phenotypeType,
  relatedData
}) {

  relatedData = relatedData.sort((a, b) => b.correlation - a.correlation);


  const data = [{
    x: relatedData.map((e, i) => i + 1),
    y: relatedData.map(e => e.correlation),
    text: relatedData.map(e => [
      e.name,
      `Correlation: <b>${e.correlation}</b>`,
      `Sample Size: <b>${e.sampleSize.toLocaleString()}</b>`,
    ].join('<br>')),
    hoverinfo: 'text',
    mode: 'markers',
    marker: {
      size: relatedData.map(e => 10 * Math.log(e.sampleSize)),
      color: ['rgb(93, 164, 214)', 'rgb(255, 144, 14)',  'rgb(44, 160, 101)', 'rgb(255, 65, 54)'],
    }
  },];

  const layout = {
    title: `Phenotypes Related to ${selectedPhenotype.title}`,
    showlegend: false,
    xaxis: {
      showticklabels: false,
      showline: false,
      zeroline: false,
    },
    yaxis: {
      title: 'Correlation',
      zeroline: false,
    },

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

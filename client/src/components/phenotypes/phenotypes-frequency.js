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
    title: `Frequency of ${selectedPhenotype.title}`,
    showlegend: true
  };

  const config = {
    // responsive: true,
  }

  return (
    <div className="row m-2">
      <div className="col-md-6">
        <h4>Description</h4>
          <p>
          Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed et venenatis mauris. Etiam aliquam accumsan enim, in sodales urna ultrices sed. Duis et vehicula ante, tempor semper nisl. Suspendisse in tempor erat, at tincidunt elit. Etiam scelerisque venenatis nulla eu maximus. Ut sit amet ipsum odio. Orci varius natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus. Suspendisse potenti. Suspendisse ullamcorper ex vel ipsum lacinia dapibus. Vivamus condimentum consectetur urna, ut eleifend ex varius rutrum. Nunc blandit ut lectus a tempor. Maecenas vitae vestibulum est, non venenatis arcu. Donec quis laoreet ex. In hac habitasse platea dictumst. Vivamus facilisis risus id elementum vestibulum. Morbi eu vestibulum dolor, sit amet dignissim diam.
          </p>
          <p>
          Vivamus tempus libero ut ex blandit, sit amet sodales nisl finibus. Interdum et malesuada fames ac ante ipsum primis in faucibus. Praesent tristique interdum hendrerit. Pellentesque faucibus fermentum commodo. Morbi molestie lorem vel leo lobortis, at pulvinar metus fermentum. Mauris accumsan quam in nisi placerat, non finibus nunc pretium. Sed tincidunt quis tellus vel egestas. Praesent ultricies tincidunt ipsum malesuada tincidunt. Nulla vel iaculis arcu, et vehicula lectus. Sed porta massa metus, vel placerat lorem tincidunt eget. Duis dictum lobortis nulla, sodales porttitor nulla facilisis non. Etiam tempus vitae metus sit amet tincidunt. Proin purus libero, ultricies non mattis sit amet, sollicitudin in metus. Nam sed lectus vestibulum eros vehicula euismod.
          </p>
      </div>
      <div className="col-md-6 text-center">
        <Plot
          // className="w-100"
          data={data}
          layout={layout}
          config={config}
          onLegendClick={_ => false}
          />
      </div>
    </div>
  );
}

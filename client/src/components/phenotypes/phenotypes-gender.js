import React, {useRef} from 'react';
import Plot from 'react-plotly.js';

export function PhenotypesGender({
  selectedPhenotype,
  phenotypeType,
  data,
}) {
  const colors = ["#1f77b4","#ff7f0e","#2ca02c","#d62728","#9467bd","#8c564b","#e377c2","#7f7f7f","#bcbd22","#17becf"];
  const genderData = data.distribution.gender;

  /**
   *
   * @param {object} data ({female: [300, 300, 400], male: [400, 300, 300]})
   * @param {string[]} categories ['superficial', 'nodular', 'metastatic']
   */

  const getSunburst = (data, categories) => {
    const getSum = items => items.reduce((a, b) => a + b);
    const rootKeys = Object.keys(data);

    let ids = [...rootKeys];
    let labels = [...rootKeys];
    let parents = rootKeys.map(key => '');
    let values = rootKeys.map(key => getSum(data[key]));

    if (categories.length > 1) {
      for (let key in data) {
        data[key].forEach((value, i) => {
          ids.push(`${key} - ${categories[i]}`)
          labels.push(categories[i]);
          parents.push(key);
          values.push(value);
        });
      }
    }

    return [{
      type: 'sunburst',
      branchvalues: 'total',
      ids,
      labels,
      parents,
      values
    }];
  }

  const plotData = getSunburst(genderData, data.distributionCategories);

  console.log('sunburst plot data', plotData);

  const plotLayout = {
    // title: `Distribution of ${selectedPhenotype.title} by Gender`,
    // showlegend: true,
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
            config={plotConfig}
        />
    </div>
  );
}

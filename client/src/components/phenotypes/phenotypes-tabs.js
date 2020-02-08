import React, {useState} from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Tab, Tabs } from 'react-bootstrap';
import Plot from 'react-plotly.js';
import { updateBrowsePhenotypes } from '../../services/actions';
import { PhenotypesRelated } from './phenotypes-related'
import { PieChart, HorizontalBarChart } from './phenotypes-charts';

export function PhenotypesTabs() {
  const dispatch = useDispatch();
  const {
    selectedPhenotype,
    // submitted,
    selectedPlot,
    phenotypeType,
    phenotypeData,
  } = useSelector(state => state.browsePhenotypes);

  const [
    selectedDistribution,
    setSelectedDistribution
  ] = useState('age');

  const setSelectedPlot = selectedPlot => {
    dispatch(updateBrowsePhenotypes({ selectedPlot }));
  };


  return (
    <Tabs
      className="mt-2"
      defaultActiveKey={selectedPlot}
      onSelect={setSelectedPlot}>

      <Tab
        eventKey="frequency"
        title="Frequency"
        className="p-2 bg-white tab-pane-bordered rounded-0"
        style={{ minHeight: '600px', textAlign: 'center' }}>
        <PieChart
                data={phenotypeData.frequency}
                categories={phenotypeData.categories} />
      </Tab>

      <Tab
        eventKey="distribution"
        title="Distribution"
        className="p-2 bg-white tab-pane-bordered rounded-0"
        style={{ minHeight: '50vh' }}>
          <div className="m-2">{[
            {label: 'Age', value: 'age'},
            {label: 'Gender', value: 'gender'},
            {label: 'Ancestry', value: 'ancestry'},
          ].map((e, i) =>
            <label className="mr-3 font-weight-normal" key={`${i}-${e.value}`}>
              <input
                type="radio"
                value={e.value}
                onChange={e => setSelectedDistribution(e.target.value)}
                checked={selectedDistribution == e.value}
                className="mr-1" />
              {e.label}
            </label>
          )}</div>

          <HorizontalBarChart
              data={phenotypeData.distribution[selectedDistribution]}
              categories={phenotypeData.distributionCategories} />
      </Tab>
      <Tab
        eventKey="related-phenotypes"
        title="Related Phenotypes"
        className="p-2 bg-white tab-pane-bordered rounded-0"
        style={{ minHeight: '50vh' }}>
        <PhenotypesRelated
          selectedPhenotype={selectedPhenotype}
          phenotypeType={phenotypeType}
          relatedData={phenotypeData.related}
        />
      </Tab>

    </Tabs>
  );
}

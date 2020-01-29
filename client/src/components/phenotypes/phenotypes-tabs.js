import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Tab, Tabs } from 'react-bootstrap';
import { updateBrowsePhenotypes } from '../../services/actions';
import { PhenotypesFrequency } from './phenotypes-frequency'
import { PhenotypesDistribution } from './phenotypes-distribution'
import { PhenotypesRelated } from './phenotypes-related'

export function PhenotypesTabs() {
  const dispatch = useDispatch();
  const {
    selectedPhenotype,
    // submitted,
    selectedPlot,
    phenotypeType
  } = useSelector(state => state.browsePhenotypes);

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
        style={{ minHeight: '50vh' }}>
        <PhenotypesFrequency 
          selectedPhenotype={selectedPhenotype}
          phenotypeType={phenotypeType}
        />
      </Tab>

      <Tab
        eventKey="distribution"
        title="Distribution"
        className=""
        style={{ minHeight: '50vh' }}>

        <Tabs
          className="bg-white border border-bottom-0"
          defaultActiveKey="age">

          <Tab
            eventKey="age"
            title="Age"
            className="p-2 bg-white border rounded-0"
            style={{ minHeight: '50vh' }}>
              <PhenotypesDistribution 
                selectedPhenotype={selectedPhenotype}
                phenotypeType={phenotypeType}
              />
          </Tab>

          <Tab
            eventKey="sex"
            title="Sex"
            className="p-2 bg-white border rounded-0"
            style={{ minHeight: '50vh' }}>
              <PhenotypesDistribution 
                selectedPhenotype={selectedPhenotype}
                phenotypeType={phenotypeType}
              />
          </Tab>

          <Tab
            eventKey="ancestry"
            title="Ancestry"
            className="p-2 bg-white border rounded-0"
            style={{ minHeight: '50vh' }}>
              <PhenotypesDistribution 
                selectedPhenotype={selectedPhenotype}
                phenotypeType={phenotypeType}
              />
          </Tab>

        </Tabs>

      </Tab>

      <Tab
        eventKey="related-phenotypes"
        title="Related Phenotypes"
        className="p-2 bg-white tab-pane-bordered rounded-0"
        style={{ minHeight: '50vh' }}>
        <PhenotypesRelated 
          selectedPhenotype={selectedPhenotype}
          phenotypeType={phenotypeType}
        />
      </Tab>

    </Tabs>
  );
}

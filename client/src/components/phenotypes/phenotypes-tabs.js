import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Tab, Tabs } from 'react-bootstrap';
import { updateBrowsePhenotypes } from '../../services/actions';
import { PhenotypesFrequency } from './phenotypes-frequency'
import { PhenotypesRelated } from './phenotypes-related'
import { PhenotypesAge } from './phenotypes-age';
import { PhenotypesSex } from './phenotypes-sex';
import { PhenotypesAncestry } from './phenotypes-ancestry';

export function PhenotypesTabs() {
  const dispatch = useDispatch();
  const {
    selectedPhenotype,
    // submitted,
    selectedPlot,
    phenotypeType,
    phenotypeData
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
          frequencyData={phenotypeData.frequency}
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
              <PhenotypesAge
                selectedPhenotype={selectedPhenotype}
                phenotypeType={phenotypeType}
                ageData={phenotypeData.distribution.age}
                option="age"
              />
          </Tab>

          <Tab
            eventKey="sex"
            title="Sex"
            className="p-2 bg-white border rounded-0"
            style={{ minHeight: '50vh' }}>
              <PhenotypesSex
                selectedPhenotype={selectedPhenotype}
                phenotypeType={phenotypeType}
                sexData={phenotypeData.distribution.sex}
                option="sex"
              />
          </Tab>

          <Tab
            eventKey="ancestry"
            title="Ancestry"
            className="p-2 bg-white border rounded-0"
            style={{ minHeight: '50vh' }}>
              <PhenotypesAncestry
                selectedPhenotype={selectedPhenotype}
                phenotypeType={phenotypeType}
                ancestryData={phenotypeData.distribution.ancestry}
                option="ancestry"
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
          data={phenotypeData.related}
        />
      </Tab>

    </Tabs>
  );
}

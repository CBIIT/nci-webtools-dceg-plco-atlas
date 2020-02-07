import React, {useState} from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Tab, Tabs } from 'react-bootstrap';
import { updateBrowsePhenotypes } from '../../services/actions';
import { PhenotypesFrequency } from './phenotypes-frequency'
import { PhenotypesRelated } from './phenotypes-related'
import { PhenotypesAge } from './phenotypes-age';
import { PhenotypesGender } from './phenotypes-gender';
import { PhenotypesAncestry } from './phenotypes-ancestry';

export function PhenotypesTabs() {
  const dispatch = useDispatch();
  const {
    selectedPhenotype,
    // submitted,
    selectedPlot,
    phenotypeType,
    phenotypeData,
  } = useSelector(state => state.browsePhenotypes);

  const setSelectedPlot = selectedPlot => {
    dispatch(updateBrowsePhenotypes({ selectedPlot }));
  };

  const [selectedDistribution, setSelectedDistribution] = useState('age');

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
          data={phenotypeData}
        />
      </Tab>

      <Tab
        eventKey="distribution"
        title="Distribution"
        className="p-2 bg-white tab-pane-bordered rounded-0"
        style={{ minHeight: '50vh' }}>
          <div className="m-2">
            <label className="mr-3 font-weight-normal">
              <input
                type="radio"
                value="age"
                onChange={e => setSelectedDistribution(e.target.value)}
                checked={selectedDistribution == 'age'}
                className="mr-1" />
              Age
            </label>

            <label className="mr-3 font-weight-normal">
              <input
                type="radio"
                value="gender"
                onChange={e => setSelectedDistribution(e.target.value)}
                checked={selectedDistribution == 'gender'}
                className="mr-1" />
              Gender
            </label>

            <label className="mr-3 font-weight-normal">
              <input
                type="radio"
                value="ancestry"
                onChange={e => setSelectedDistribution(e.target.value)}
                checked={selectedDistribution == 'ancestry'}
                className="mr-1"/>
              Ancestry
            </label>
          </div>

          {selectedDistribution === 'age' &&
            <PhenotypesAge
              selectedPhenotype={selectedPhenotype}
              phenotypeType={phenotypeType}
              data={phenotypeData}
            />
          }

          {selectedDistribution === 'gender' &&
            <PhenotypesGender
                selectedPhenotype={selectedPhenotype}
                phenotypeType={phenotypeType}
                data={phenotypeData}
            />
          }

          {selectedDistribution === 'ancestry' &&
            <PhenotypesAncestry
              selectedPhenotype={selectedPhenotype}
              data={phenotypeData}
              option="ancestry"
            />
          }
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

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

  const [distributionType, setDistributionType] = useState('age');

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
        className="p-2 bg-white tab-pane-bordered rounded-0"
        style={{ minHeight: '50vh' }}>
          <div className="m-2">
            <label className="mr-3 font-weight-normal">
              <input
                type="radio"
                value="age"
                onChange={e => setDistributionType(e.target.value)}
                checked={distributionType == 'age'}/>
              Age
            </label>

            <label className="mr-3 font-weight-normal">
              <input
                type="radio"
                value="gender"
                onChange={e => setDistributionType(e.target.value)}
                checked={distributionType == 'gender'} />
              Gender
            </label>

            <label className="mr-3 font-weight-normal">
              <input
                type="radio"
                value="ancestry"
                onChange={e => setDistributionType(e.target.value)}
                checked={distributionType == 'ancestry'} />
              Ancestry
            </label>
          </div>

          {distributionType === 'age' &&
            <PhenotypesAge
              selectedPhenotype={selectedPhenotype}
              phenotypeType={phenotypeType}
              ageData={phenotypeData.distribution.age}
              option="age"
            />
          }

          {distributionType === 'gender' &&
            <PhenotypesGender
                selectedPhenotype={selectedPhenotype}
                phenotypeType={phenotypeType}
                sexData={phenotypeData.distribution.sex}
                option="gender"
            />
          }

          {distributionType === 'ancestry' &&
            <PhenotypesAncestry
              selectedPhenotype={selectedPhenotype}
              phenotypeType={phenotypeType}
              ancestryData={phenotypeData.distribution.ancestry}
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

import React, {useState} from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Tab, Tabs, Form } from 'react-bootstrap';
import { updateBrowsePhenotypes } from '../../services/actions';
import { PhenotypesRelated } from './phenotypes-related'
import { BarChart, AreaChart, GroupedAreaChart, PieChart, HorizontalBarChart } from './phenotypes-charts';

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

  const titleCase = str => str.split(/[_\s]+/g)
    .map(word => word[0].toUpperCase() + word.substr(1).toLowerCase())
    .join(' ');

  return (
    <Tabs
      transition={false}
      className="mt-2"
      defaultActiveKey={selectedPlot}
      onSelect={setSelectedPlot}>

      <Tab
        eventKey="frequency"
        title="Frequency"
        className="p-4 bg-white tab-pane-bordered rounded-0"
        style={{ minHeight: '600px', textAlign: 'center' }}>
        {phenotypeData && phenotypeData.frequency && phenotypeData.categories && phenotypeData.type !== 'continuous' && <PieChart
                data={phenotypeData.frequency}
                categories={phenotypeData.categories} />}

        {phenotypeData && phenotypeData.frequency && phenotypeData.categories && phenotypeData.type == 'continuous' && <AreaChart
                data={phenotypeData.frequency}
                categories={phenotypeData.categories}
                xTitle={phenotypeData.display_name}
                yTitle="Number of Participants" />}

      </Tab>

      <Tab
        eventKey="distribution"
        title="Distribution"
        className="p-4 bg-white tab-pane-bordered rounded-0"
        style={{ minHeight: '50vh' }}>
          <div className="m-2">{[
            {label: 'Age', value: 'age'},
            phenotypeData.type !== 'binary' && {label: 'Age (Inverted)', value: 'ageInverted'},
            {label: 'Gender', value: 'gender'},
            phenotypeData.type !== 'binary' && {label: 'Gender (Inverted)', value: 'genderInverted'},
            {label: 'Ancestry', value: 'ancestry'},
            phenotypeData.type !== 'binary' && {label: 'Ancestry (Inverted)', value: 'ancestryInverted'},
          ].filter(Boolean).map((e, i) =>
            <Form.Check
              custom
              inline
              label={e.label}
              className="font-weight-normal cursor-pointer mr-4"
              onChange={e => setSelectedDistribution(e.target.value)}
              checked={selectedDistribution == e.value}
              value={e.value}
              type="radio"
              id={`select-distribution-${e.value}`}
            />
          )}</div>

          {phenotypeData && phenotypeData.distribution && /^(gender|ancestry)$/.test(selectedDistribution) && <BarChart
                data={phenotypeData.distribution[selectedDistribution]}
                categories={phenotypeData.distributionCategories.map(titleCase)}
                xTitle={titleCase(selectedDistribution)}
                yTitle="Number of Participants"
          />}

          {phenotypeData && phenotypeData.distribution && phenotypeData.type === 'categorical' && /^(age|gender|ancestry)Inverted$/.test(selectedDistribution) && <BarChart
                data={phenotypeData.distribution[selectedDistribution]}
                categories={phenotypeData[{
                  ageInverted: 'ageCategories',
                  genderInverted: 'genderCategories',
                  ancestryInverted: 'ancestryCategories'
                }[selectedDistribution]]}
                xTitle={phenotypeData.display_name}
                yTitle="Number of Participants"
          />}


          {phenotypeData && phenotypeData.distribution && phenotypeData.type === 'continuous' && /^(age|gender|ancestry)Inverted$/.test(selectedDistribution) && <GroupedAreaChart
                data={phenotypeData.distribution[selectedDistribution]}
                categories={phenotypeData[{
                  ageInverted: 'ageCategories',
                  genderInverted: 'genderCategories',
                  ancestryInverted: 'ancestryCategories'
                }[selectedDistribution]]}
                xTitle={phenotypeData.display_name}
                yTitle="Number of Participants"
                fill={true}
          />}

          {phenotypeData && phenotypeData.distribution && /^(age)$/.test(selectedDistribution)  && <GroupedAreaChart
            data={phenotypeData.distribution[selectedDistribution]}
            categories={phenotypeData.distributionCategories.map(titleCase)}
            xTitle={titleCase(selectedDistribution)}
            yTitle="Number of Participants"
            fill={true}
          />}

      </Tab>
      <Tab
        eventKey="related-phenotypes"
        title="Related Phenotypes"
        className="p-4 bg-white tab-pane-bordered rounded-0"
        style={{ minHeight: '50vh' }}>
        {phenotypeData && phenotypeData.related && <PhenotypesRelated
          selectedPhenotype={selectedPhenotype}
          phenotypeType={phenotypeType}
          relatedData={phenotypeData.related}
        />}
      </Tab>

    </Tabs>
  );
}

import React, {useState} from 'react';
import { useDispatch, useSelector } from 'react-redux';
import * as merge from 'lodash.merge';
import * as clone from 'lodash.clonedeep';
import { Tab, Tabs, Form } from 'react-bootstrap';
import { updateBrowsePhenotypes } from '../../services/actions';
import { query } from '../../services/query';
import { PhenotypesRelated } from './phenotypes-related'
import { BarChart, AreaChart, GroupedAreaChart, PieChart, HorizontalBarChart } from './phenotypes-charts';
import { LoadingOverlay } from '../controls/loading-overlay';

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

  const [
    selectedDistributionInverted,
    setSelectedDistributionInverted
  ] = useState('ageInverted');

  const [
    loading,
    setLoading
  ] = useState(false);



  const setSelectedPlot = async (selectedPlot) => {
    dispatch(updateBrowsePhenotypes({ selectedPlot }));

    // fetch items if they do not exist yet
    if (
      (selectedPlot === 'frequency' && !phenotypeData.frequency) ||
      (selectedPlot === 'distribution' && (!phenotypeData.distribution || !phenotypeData.distribution.age)) ||
      (selectedPlot === 'distribution-inverted' && (!phenotypeData.distribution || !phenotypeData.distribution.ageInverted)) ||
      (selectedPlot === 'related-phenotypes' && !phenotypeData.related)
    ) {
      setLoading(true);
      const data = await query('phenotype', {
        id: phenotypeData.id,
        type: {
          'frequency': 'frequency',
          'distribution': 'distribution',
          'distribution-inverted': 'distributionInverted',
          'related-phenotypes': 'related',
        }[selectedPlot] || 'all'
      });
      setLoading(false);
      dispatch(updateBrowsePhenotypes({
        phenotypeData: clone(merge(phenotypeData, data)),
      }));
    }
  };

  const titleCase = str => str.split(/[_\s]+/g)
    .map(word => word[0].toUpperCase() + word.substr(1).toLowerCase())
    .join(' ');

  return (
    <div style={{ minHeight: '600px'}}>
      <LoadingOverlay active={loading} />
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
          {phenotypeData  && selectedPlot === 'frequency' && phenotypeData.frequency && phenotypeData.categories && phenotypeData.type !== 'continuous' && <PieChart
                  data={phenotypeData.frequency}
                  categories={phenotypeData.categories} />}

          {phenotypeData   && selectedPlot === 'frequency' && phenotypeData.frequency && phenotypeData.categories && phenotypeData.type == 'continuous' && <AreaChart
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
              {label: 'Gender', value: 'gender'},
              {label: 'Ancestry', value: 'ancestry'},
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

            {!loading && selectedPlot === 'distribution'  && phenotypeData && phenotypeData.distribution && phenotypeData.distribution.age &&
            <div>
              {/^(age)$/.test(selectedDistribution)  && <GroupedAreaChart
                data={phenotypeData.distribution[selectedDistribution]}
                categories={phenotypeData.distributionCategories.map(titleCase)}
                xTitle={titleCase(selectedDistribution)}
                yTitle="Number of Participants"
                fill={true}
              />}
              {/^(gender|ancestry)$/.test(selectedDistribution) && <BarChart
                  data={phenotypeData.distribution[selectedDistribution]}
                  categories={phenotypeData.distributionCategories.map(titleCase)}
                  xTitle={titleCase(selectedDistribution)}
                  yTitle="Number of Participants"
              />}
            </div>}
        </Tab>

        {phenotypeData.type !== 'binary' && <Tab
          eventKey="distribution-inverted"
          title="Distribution (Inverted)"
          className="p-4 bg-white tab-pane-bordered rounded-0"
          style={{ minHeight: '50vh' }}>
            <div className="m-2">{[
              {label: 'Age', value: 'ageInverted'},
              {label: 'Gender', value: 'genderInverted'},
              {label: 'Ancestry', value: 'ancestryInverted'},
            ].filter(Boolean).map((e, i) =>
              <Form.Check
                custom
                inline
                label={e.label}
                className="font-weight-normal cursor-pointer mr-4"
                onChange={e => setSelectedDistributionInverted(e.target.value)}
                checked={selectedDistributionInverted == e.value}
                value={e.value}
                type="radio"
                id={`select-distribution-${e.value}`}
              />
            )}</div>

            {!loading && selectedPlot === 'distribution-inverted' && phenotypeData && phenotypeData.distribution && phenotypeData.distribution.ageInverted && phenotypeData.type === 'categorical' && /^(age|gender|ancestry)Inverted$/.test(selectedDistributionInverted) && <BarChart
                  data={phenotypeData.distribution[selectedDistributionInverted]}
                  categories={phenotypeData[{
                    ageInverted: 'ageCategories',
                    genderInverted: 'genderCategories',
                    ancestryInverted: 'ancestryCategories'
                  }[selectedDistributionInverted]]}
                  xTitle={phenotypeData.display_name}
                  yTitle="Number of Participants"
            />}

            {!loading && selectedPlot === 'distribution-inverted'  && phenotypeData && phenotypeData.distribution && phenotypeData.distribution.ageInverted && phenotypeData.type === 'continuous' && /^(age|gender|ancestry)Inverted$/.test(selectedDistributionInverted) && <GroupedAreaChart
                  data={phenotypeData.distribution[selectedDistributionInverted]}
                  categories={phenotypeData[{
                    ageInverted: 'ageCategories',
                    genderInverted: 'genderCategories',
                    ancestryInverted: 'ancestryCategories'
                  }[selectedDistributionInverted]]}
                  xTitle={phenotypeData.display_name}
                  yTitle="Number of Participants"
                  fill={true}
            />}
        </Tab>}

        <Tab
          eventKey="related-phenotypes"
          title="Related Phenotypes"
          className="p-4 bg-white tab-pane-bordered rounded-0"
          style={{ minHeight: '50vh' }}>
          {!loading && selectedPlot === 'related-phenotypes' && phenotypeData && phenotypeData.related && <PhenotypesRelated
            selectedPhenotype={selectedPhenotype}
            phenotypeType={phenotypeType}
            relatedData={phenotypeData.related}
          />}
        </Tab>

      </Tabs>


    </div>

  );
}

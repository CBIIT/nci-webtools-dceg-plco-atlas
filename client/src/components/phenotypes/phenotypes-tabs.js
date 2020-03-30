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
    loading,
  } = useSelector(state => state.browsePhenotypes);

  const [frequencyType, setFrequencyType] = useState({
    frequencyByAge: 'counts',
    frequencyBySex: 'counts',
    frequencyByAncestry: 'counts',
  })

  const setSelectedPlot = async (selectedPlot) => {
    dispatch(updateBrowsePhenotypes({ selectedPlot }));

    // fetch items if they do not exist yet
    if (!phenotypeData[selectedPlot]) {
      dispatch(updateBrowsePhenotypes({
        loading: true,
      }));
      dispatch(updateBrowsePhenotypes({
        loading: false,
        phenotypeData: {
          ...phenotypeData,
          ...await query('phenotype', {
            id: phenotypeData.id,
            type: selectedPlot || 'all'
          })
        }
      }));
    }
  };

  const titleCase = str => str.split(/[_\s]+/g)
    .map(word => word[0].toUpperCase() + word.substr(1).toLowerCase())
    .join(' ');

  const getPlotComponent = (phenotypeDataType, plotKey) => {
    if (/continuous/.test(phenotypeDataType) || (/binary/.test(phenotypeDataType) && plotKey === 'frequencyByAge'))
      return GroupedAreaChart;
    else if (/categorical|binary/.test(phenotypeData.type))
      return BarChart;
  }

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
          title="Frequency (All)"
          className="p-4 bg-white tab-pane-bordered rounded-0"
          style={{ minHeight: '600px', textAlign: 'center' }}>
          {phenotypeData && phenotypeData.frequency && phenotypeData.categories && <>
            {phenotypeData.type !== 'continuous' && <PieChart
                  data={phenotypeData.frequency}
                  categories={phenotypeData.categories} />}

            {phenotypeData.type === 'continuous' && <AreaChart
                  data={phenotypeData.frequency}
                  categories={phenotypeData.categories}
                  xTitle={phenotypeData.displayName}
                  yTitle="Number of Participants" />}
          </>}
        </Tab>

        {[
          {key: 'frequencyByAge', title: 'Frequency By Age'},
          {key: 'frequencyBySex', title: 'Frequency By Sex'},
          {key: 'frequencyByAncestry', title: 'Frequency By Ancestry'},
        ].map(t =>
          <Tab
            key={t.key}
            eventKey={t.key}
            title={t.title}
            className="p-4 bg-white tab-pane-bordered rounded-0"
            style={{ minHeight: '600px'}}>

            <div className="m-2 text-left">{[
              {label: 'Counts', value: 'counts'},
              {label: 'Percentage', value: 'percentage'},
            ].filter(Boolean).map((e, i) =>
              <Form.Check
                custom
                inline
                label={e.label}
                className="font-weight-normal cursor-pointer mr-4"
                onChange={e => setFrequencyType({...frequencyType, [t.key]: e.target.value})}
                checked={frequencyType[t.key] == e.value}
                value={e.value}
                type="radio"
                id={`select-${t.key}-${e.value}`}
                key={`${t.key}-${e.value}-${e.id}`}
              />
            )}</div>

            <div className="text-center">

            {phenotypeData && phenotypeData[t.key] && <>
              {((/continuous/.test(phenotypeData.type) || (/binary/.test(phenotypeData.type) && t.key === 'frequencyByAge')) ? GroupedAreaChart : BarChart)({
                data: phenotypeData[t.key][frequencyType[t.key]],
                categories: (phenotypeData.type === 'binary')
                  ? phenotypeData.distributionCategories
                  : phenotypeData.categoryTypes[t.key],
                xTitle: phenotypeData.displayName,
                yTitle: frequencyType[t.key] === 'counts' ? 'Number of Participants' : '% of Participants',
                fill: true,
                yMax: frequencyType[t.key] === 'counts' ? null : 100,
              })}
            </>}
            </div>
          </Tab>
        )}

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

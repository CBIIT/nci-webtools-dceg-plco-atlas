import React, {useState, useEffect} from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Tab, Tabs, Form } from 'react-bootstrap';

import { updateBrowsePhenotypes, updateBrowsePhenotypesPlots } from '../../../services/actions';
import { query } from '../../../services/query';
import { BarChart, AreaChart, GroupedAreaChart, PieChart, PhenotypesRelated } from './phenotypes-charts';
import { LoadingOverlay } from '../../controls/loading-overlay';

import paginationFactory from 'react-bootstrap-table2-paginator';
import { Table, paginationSizeSelector, paginationText, paginationButton } from '../../controls/table/table';


export function PhenotypesTabs(props) {
  const dispatch = useDispatch();
  const {
    selectedPhenotype,
    selectedPlot,
    sharedState
  } = useSelector(state => state.browsePhenotypes);
  const {
    phenotypeType,
    phenotypeData,
    loading
  } = useSelector(state => state.browsePhenotypesPlots);
  const phenotypes = useSelector(state => state.phenotypes);

  const [frequencyType, setFrequencyType] = useState({
    frequencyByAge: 'counts',
    frequencyBySex: 'counts',
    frequencyByAncestry: 'counts',
  });

  const [displayType, setDisplayType] = useState({
    frequency: 'plot',
    frequencyByAge: 'plot',
    frequencyBySex: 'plot',
    frequencyByAncestry: 'plot',
  });

  const setSelectedPlot = async (selectedPlot) => {
    dispatch(updateBrowsePhenotypes({ selectedPlot }));

    // fetch items if they do not exist yet
    if (!phenotypeData[selectedPlot]) {
      dispatch(updateBrowsePhenotypesPlots({
        loading: true,
      }));
      dispatch(updateBrowsePhenotypesPlots({
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

  const FrequencyTable = ({phenotypeData}) => {
    const data = phenotypeData.categories.map((category, i) => ({
      id: category, 
      value: phenotypeData.frequency[i]
    }))

    const columns = [
      {dataField: 'id', text: phenotypeData.displayName, sort: true}, 
      {dataField: 'value', text: 'Frequency', sort: true, formatter: e => e.toLocaleString()}
    ];

    return <Table
      keyField="id"
      data={data}
      columns={columns}
      pagination={paginationFactory({
        showTotal: phenotypeData.frequency ? phenotypeData.frequency.length > 0 : false,
        sizePerPageList: [25, 50, 100],
        paginationTotalRenderer: paginationText('record', 'records'),
        sizePerPageRenderer: paginationSizeSelector,
        pageButtonRenderer: paginationButton
      })}
    />    
  }

  const DistributionTable = ({phenotypeData, distributionKey, distributionCategory}) => {
    console.log(phenotypeData, distributionKey, distributionCategory);
    const {counts, percentage} = phenotypeData[distributionKey];
    let columns = [];
    let data = [];

    if (phenotypeData.type === 'categorical' || phenotypeData.type === 'continuous') {
      columns = [
        {dataField: 'value', text: phenotypeData.displayName, sort: true}, // participant value, mapped to data categories
        {dataField: 'type', text: distributionCategory, sort: true},  // distribution category (age, sex, ancestry)
        {dataField: 'counts', text: 'Counts', sort: true, formatter: e => e.toLocaleString()}, // participant count
        {dataField: 'percentage', text: 'Percentage', sort: true, formatter: e => e + '%'}, // participant percentages
      ]
      
      let values = phenotypeData.distributionCategories || phenotypeData.categories;
      for (let value of values) {
        let categories = phenotypeData.categoryTypes[distributionKey]
        for (let type of categories) {
          let index = categories.indexOf(type);
          data.push({
            value, 
            type, 
            counts: counts[value][index],
            percentage: percentage[value][index]
          })
        }
      }
    } else {
      columns = [
        // {dataField: 'value', text: phenotypeData.displayName, sort: true}, // participant value, mapped to data categories
        {dataField: 'type', text: distributionCategory, sort: true},  // distribution category (age, sex, ancestry)
        {dataField: 'counts', text: 'Counts', sort: true, formatter: e => e.toLocaleString()}, // participant count
        {dataField: 'percentage', text: 'Percentage', sort: true, formatter: e => e + '%'}, // participant percentages
      ];

      data = Object.keys(counts).map(type => ({
        type, 
        counts: counts[type], 
        percentage: percentage[type]
      }));
    }

    return <Table
      keyField="id"
      data={data}
      columns={columns}
      pagination={paginationFactory({
        showTotal: data ? data.length > 0 : false,
        sizePerPageList: [25, 50, 100],
        paginationTotalRenderer: paginationText('record', 'records'),
        sizePerPageRenderer: paginationSizeSelector,
        pageButtonRenderer: paginationButton
      })}
    />;
  }

  useEffect(() => {
    if (!selectedPlot || (selectedPlot && selectedPlot === 'frequency')) return ;
    setSelectedPlot(selectedPlot);
  }, [sharedState]);

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
          style={{ minHeight: '600px'}}>

          <div className="m-2 text-right">
            <button 
              className="btn btn-silver"
              onClick={e => setDisplayType({
                ...displayType, 
                frequency: displayType.frequency === 'plot' ? 'table' : 'plot'
              })}>
              {displayType.frequency === 'plot' ?  'Show Table' : 'Show Plot'}
            </button>
          </div>

          {phenotypeData && phenotypeData.frequency && phenotypeData.categories && <>

            {displayType.frequency === 'plot' && <div className="text-center">
              {phenotypeData.type !== 'continuous' && <PieChart
                    data={phenotypeData.frequency}
                    categories={phenotypeData.categories} />}

              {phenotypeData.type === 'continuous' && <AreaChart
                    data={phenotypeData.frequency}
                    categories={phenotypeData.categories}
                    xTitle={phenotypeData.displayName}
                    yTitle="Number of Participants" />}
            </div>}

            {displayType.frequency === 'table' && 
              <FrequencyTable phenotypeData={phenotypeData} />}
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


            <div className="d-flex align-items-center justify-content-between">
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
                  disabled={displayType[t.key] === 'table'}
                />
              )}</div>

              {t.key === 'frequencyByAge' && <button 
                className="btn btn-silver"
                onClick={e => setDisplayType({
                  ...displayType, 
                  [t.key]: displayType[t.key] === 'plot' ? 'table' : 'plot'
                })}>
                {displayType[t.key] === 'plot' ?  'Show Table' : 'Show Plot'}
              </button>}

              {t.key === 'frequencyByAncestry' && <div className="m-2 text-left">{[
                {label: 'Show Plot', value: 'plot'},
                {label: 'Show Table', value: 'table'},
              ].filter(Boolean).map((e, i) =>
                <Form.Check
                  custom
                  inline
                  label={e.label}
                  className="font-weight-normal cursor-pointer mr-4"
                  onChange={e => setDisplayType({...displayType, [t.key]: e.target.value})}
                  checked={displayType[t.key] == e.value}
                  value={e.value}
                  type="radio"
                  id={`select-${t.key}-${e.value}`}
                  key={`${t.key}-${e.value}-${e.id}`}
                />
            )}</div>}          

           </div>

           {t.key === 'frequencyBySex' && <div class="text-center">
            <button 
                  className="btn btn-link font-weight-bold"
                  onClick={e => setDisplayType({
                    ...displayType, 
                    [t.key]: displayType[t.key] === 'plot' ? 'table' : 'plot'
                  })}>
                  {displayType[t.key] === 'plot' ?  'Show Table' : 'Show Plot'}
              </button>
            </div>}

            {phenotypeData && phenotypeData[t.key] && <>
              {displayType[t.key] === 'plot' && <div className="text-center">
                {((/continuous/.test(phenotypeData.type) || (/binary/.test(phenotypeData.type) && t.key === 'frequencyByAge')) ? GroupedAreaChart : BarChart)({
                    data: phenotypeData[t.key][frequencyType[t.key]],
                    categoryPrefix: t.key.match(/frequencyBy(Age|Sex|Ancestry)/)[1],
                    type: phenotypeData.type,
                    categories: (phenotypeData.type === 'binary')
                      ? phenotypeData.distributionCategories
                      : phenotypeData.categoryTypes[t.key],
                    xTitle: phenotypeData.displayName,
                    yTitle: frequencyType[t.key] === 'counts' ? 'Number of Participants' : '% of Participants',
                    fill: true,
                    formatPercent: frequencyType[t.key] === 'percentage',
                  })}
              </div>}

              {displayType[t.key] === 'table' && 
                <DistributionTable
                  phenotypeData={phenotypeData}
                  distributionKey={t.key}
                  distributionCategory={t.title.split(' ').pop()} />}
            </>}
          </Tab>
        )}

        <Tab
          eventKey="related-phenotypes"
          title="Related Phenotypes"
          className="p-4 bg-white tab-pane-bordered rounded-0"
          style={{ minHeight: '50vh' }}>
          {!loading && selectedPlot === 'related-phenotypes' && phenotypeData && phenotypeData.relatedPhenotypes && 
            <PhenotypesRelated 
                  relatedData={phenotypeData.relatedPhenotypes}
                  onClick={e => {
                    if (props.onSubmit) {
                      let id = e.points[0].customdata.phenotype_id;
                      let phenotype = phenotypes.flat.find(p => p.id == id);
                      props.onSubmit(phenotype);
                    }
                  }}
          />}
        </Tab>
      </Tabs>


    </div>

  );
}

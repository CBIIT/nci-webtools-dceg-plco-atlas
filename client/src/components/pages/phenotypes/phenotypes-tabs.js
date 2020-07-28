import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Tab, Tabs, Form } from 'react-bootstrap';
import paginationFactory from 'react-bootstrap-table2-paginator';

import { updateBrowsePhenotypes, updateBrowsePhenotypesPlots } from '../../../services/actions';
import { query } from '../../../services/query';
import { BarChart, AreaChart, GroupedAreaChart, PieChart, PhenotypesRelated } from './phenotypes-charts';
import { Table, paginationSizeSelector, paginationText, paginationButton } from '../../controls/table/table';
import { LoadingOverlay } from '../../controls/loading-overlay/loading-overlay';
import { ButtonGroup } from '../../controls/button-group/button-group';

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
    if (!phenotypeData[selectedPlot] || !Object.keys(phenotypeData[selectedPlot]).length) {
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

  useEffect(() => {
    if (!selectedPlot || (selectedPlot && selectedPlot === 'frequency')) return;
    setSelectedPlot(selectedPlot);
  }, [sharedState]);

  const titleCase = str => str.split(/[_\s]+/g)
    .map(word => word[0].toUpperCase() + word.substr(1).toLowerCase())
    .join(' ');

  const FrequencyTable = ({ phenotypeData }) => {
    const data = phenotypeData.categories.map((category, i) => ({
      id: category,
      value: phenotypeData.frequency[i]
    }))

    const columns = [
      { dataField: 'id', text: phenotypeData.displayName, sort: true },
      { dataField: 'value', text: 'Frequency', sort: true, 
        formatter: e => {
          if (e) {
            return e.toLocaleString();
          } else {
            return '-';
          }
        }
      }
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

  const DistributionTable = ({ phenotypeData, distributionKey, distributionCategory }) => {
    console.log(phenotypeData, distributionKey, distributionCategory);
    const { counts, percentage } = phenotypeData[distributionKey];
    let columns = [];
    let data = [];

    if (phenotypeData.type === 'categorical' || phenotypeData.type === 'continuous') {
      columns = [
        { dataField: 'value', text: phenotypeData.displayName, sort: true }, // participant value, mapped to data categories
        { dataField: 'type', text: distributionCategory, sort: true },  // distribution category (age, sex, ancestry)
        { dataField: 'counts', text: 'Counts', sort: true, 
          formatter: e => {
            if (e) {
              return e.toLocaleString();
            } else {
              return '-';
            }
          }
        }, // participant count
        { dataField: 'percentage', text: 'Percentage', sort: true, 
          formatter: e => {
            if (e) {
              return e + '%';
            } else {
              return '-';
            }
          }
        }, // participant percentages
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
        { dataField: 'type', text: distributionCategory, sort: true },  // distribution category (age, sex, ancestry)
        { dataField: 'counts', text: 'Counts', sort: true, 
          formatter: e => {
            if (e) {
              return e.toLocaleString();
            } else {
              return '-';
            }
          }
        }, // participant count
        { dataField: 'percentage', text: 'Percentage', sort: true, 
          formatter: e => {
            if (e) {
              return e + '%';
            } else {
              return '-';
            }
          }
        }, // participant percentages
      ];

      data = Object.keys(counts).map(type => ({
        type,
        counts: counts[type],
        percentage: percentage[type]
      }));
    }

    return <div className="mt-4">
      <Table
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
      />
    </div>;
  }

  const NoDataPlaceholder = ({ visible }) => <>
    <div style={{ display: visible ? 'none' : 'block' }}>
      <p className="h4 text-center text-secondary my-5">
        No data exists for the selected plot
      </p>
    </div>
  </>

  return (
    <div style={{ minHeight: '600px' }}>
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
          style={{ minHeight: '600px' }}>

          {phenotypeData && phenotypeData.frequency && phenotypeData.categories && phenotypeData.frequency.length ? <>
            <div className="m-2 text-right">
              <ButtonGroup
                size="sm"
                options={[
                  { label: 'Plot', value: 'plot' },
                  { label: 'Table', value: 'table' },
                ]}
                value={displayType.frequency}
                onChange={value => setDisplayType({
                  ...displayType,
                  frequency: value
                })}
              />
            </div>


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
          </> : <NoDataPlaceholder visible={loading} />}
        </Tab>

        {[
          phenotypeData.ageName && { key: 'frequencyByAge', title: 'Frequency By Age' },
          { key: 'frequencyBySex', title: 'Frequency By Sex' },
          { key: 'frequencyByAncestry', title: 'Frequency By Ancestry' },
        ].filter(Boolean).map(t =>
          <Tab
            key={t.key}
            eventKey={t.key}
            title={t.title}
            className="p-4 bg-white tab-pane-bordered rounded-0"
            style={{ minHeight: '600px' }}>

            {/* <pre>{JSON.stringify(phenotypeData, null, 2)}</pre> */}

            {!loading && phenotypeData[t.key] && phenotypeData[t.key].counts && Object.keys(phenotypeData[t.key].counts).length ? <>
              <div className="d-flex align-items-center justify-content-between">
                <ButtonGroup
                  size="sm"
                  disabled={displayType[t.key] === 'table'}
                  options={[
                    { label: 'Counts', value: 'counts' },
                    { label: 'Percentage', value: 'percentage' },
                  ]}
                  value={frequencyType[t.key]}
                  onChange={value => setFrequencyType({
                    ...frequencyType,
                    [t.key]: value
                  })}
                />

                <ButtonGroup
                  size="sm"
                  options={[
                    { label: 'Plot', value: 'plot' },
                    { label: 'Table', value: 'table' },
                  ]}
                  value={displayType[t.key]}
                  onChange={value => setDisplayType({
                    ...displayType,
                    [t.key]: value
                  })}
                />
              </div>

              {phenotypeData && phenotypeData[t.key] && <>
                {displayType[t.key] === 'plot' && <div className="text-center">
                  {((/continuous/.test(phenotypeData.type) || (/binary/.test(phenotypeData.type) && t.key === 'frequencyByAge')) ? GroupedAreaChart : BarChart)({
                    data: phenotypeData[t.key][frequencyType[t.key]],
                    categoryPrefix: t.key.match(/frequencyBy(Age|Sex|Ancestry)/)[1],
                    type: phenotypeData.type,
                    categories: (phenotypeData.type === 'binary')
                      ? phenotypeData.distributionCategories
                      : phenotypeData.categoryTypes[t.key],
                    distributionCategories: phenotypeData.distributionCategories,
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
            </> : <NoDataPlaceholder visible={loading} />}
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

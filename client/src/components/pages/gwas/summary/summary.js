import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { store } from '../../../../services/store';
import { Alert, Tab, Tabs } from 'react-bootstrap';
import { SummaryResultsForm } from './summary-form';
import { ManhattanPlot } from './manhattan-plot';
import { QQPlot } from './qq-plot';
import { SummaryResultsTable } from './summary-table';
import { SummaryResultsSearchCriteria } from './summary-search-criteria';
import {
  SidebarContainer,
  SidebarPanel,
  MainPanel,
} from '../../../controls/sidebar-container/sidebar-container';
import {
  updateSummaryResults,
  updateVariantLookup,
  updateManhattanPlot,
  updateQQPlot,
  lookupVariants,
  drawQQPlot,
  drawManhattanPlot,
  fetchSummaryTable,
  updateSummaryTable,
  updateKey,
  updateSummarySnpTable,
} from '../../../../services/actions';
import { getInitialState } from '../../../../services/store';
import './summary.scss'


export function SummaryResults() {
  const dispatch = useDispatch();
  const {
    selectedChromosome,
    selectedPhenotype,
    selectedPlot,
    submitted,
    ranges,
    messages,
    selectedSex,
    selectedAncestry,
    sharedState,
    // existingSexes,
    // existingAncestries
  } = useSelector(state => state.summaryResults);
  const stackedSex = useSelector(state => state.summaryTables.stackedSex);
  const loadingManhattanPlot = useSelector(state => state.manhattanPlot.loadingManhattanPlot);
  const qqplotData = useSelector(state => state.qqPlot.qqplotData);

  const [openSidebar, setOpenSidebar] = useState(true);

  // selected tab
  const setSelectedPlot = selectedPlot => {
    dispatch(updateSummaryResults({ selectedPlot }));
    if (submitted && selectedPlot === 'qq-plot' && qqplotData.length === 0) {
      dispatch(drawQQPlot(selectedPhenotype, selectedSex, selectedAncestry));
    }
  };

  // search criteria summary bar data
  const setSearchCriteriaSummaryResults = searchCriteriaSummaryResults => {
    dispatch(updateSummaryResults({ searchCriteriaSummaryResults }));
  };

  // alerts and warnings
  const setMessages = messages => {
    dispatch(updateSummaryResults({ messages }));
  };

  const clearMessages = e => {
    setMessages([]);
  };

  // const handleChange = () => {
  //   clearMessages();
  // };

  /**
   * Fetches initial results for variant tables
   * @param {object} phenotype selected tree item (should contain id/value property)
   * @param {'all'|'stacked'|'female'|'male'} plotType the selected plot type (under treeview)
   * @param {object} params additional parameters to include in the fetch request
   */
  const fetchVariantTables = (selectedPhenotype, selectedSex, selectedAncestry, params = {}) => {
    let sexes = {
      all: ['all'],
      stacked: [stackedSex],
      female: ['female'],
      male: ['male'],
    }[selectedSex];

    if (selectedSex === 'stacked') {
      ['male', 'female'].forEach(sex => {
        dispatch(updateSummaryTable(sex, {
          results: [],
        }))
      });
    }

    // fetch variant results tables
    sexes.forEach(sex => {
      dispatch(
        fetchSummaryTable(sex, {
          ...params,
          phenotype_id: selectedPhenotype.id,
          sex: sex,
          ancestry: selectedAncestry,
          offset: 0,
          limit: 10,
          columns: ['chromosome', 'position', 'snp', 'allele_reference', 'allele_alternate', 'beta', 'odds_ratio', 'ci_95_low', 'ci_95_high', 'p_value'],
          orderBy: 'p_value',
          order: 'asc',
          // key: params.count ? null : countKey, // metadata key for counts
        })
      );
    });
  }

  // when submitting:
  // 1. Fetch aggregate data for displaying manhattan plot(s)
  // 2. Fetch variant data for each selected sex
  const handleSubmit = ({phenotype, sex, ancestry}) => {
    if (!phenotype) {
      return setMessages([
        {
          type: 'danger',
          content: 'Please select a phenotype.'
        }
      ]);
    }

    // reset results
    const initialState = getInitialState();
    dispatch(
      updateManhattanPlot(initialState.manhattanPlot)
    );
    dispatch(
      updateQQPlot(initialState.qqPlot)
    );
    dispatch(
      updateKey('summaryTables', initialState.summaryTables)
    );
    dispatch(
      updateKey('summarySnpTables', initialState.summarySnpTables)
    );    

    if (selectedPlot === 'qq-plot'){
      dispatch(drawQQPlot(phenotype, sex, ancestry));
    }

    drawSummaryManhattanPlots({phenotype, sex, ancestry});

    setSearchCriteriaSummaryResults({
      phenotype: [...phenotype.title],
      sex: sex,
      ancestry: ancestry
    });
  };

  const drawSummaryManhattanPlots = ({phenotype, sex, ancestry}) => {
    let sexes = sex === 'stacked' 
      ? ['female', 'male'] 
      : [sex];

    // update summary results filters
    dispatch(
      updateSummaryResults({
        selectedPhenotype: phenotype,
        selectedSex: sex,
        selectedAncestry: ancestry,
        manhattanPlotView: 'summary',
        selectedChromosome: null,
        nlogpMin: null,
        nlogpMax: null,
        bpMin: null,
        bpMax: null,
        submitted: new Date().getTime(),
        disableSubmit: true
      })
    );

    // draw summary plot using aggregate data
    dispatch(
      drawManhattanPlot('summary', {
        phenotype_id: phenotype.id,
        sex: sexes,
        ancestry,
        p_value_nlog_min: 2,
      })
    );

    let summarySex = sex === 'stacked' 
      ? stackedSex 
      : sex

      // fetch variant results table(s)
    dispatch(
      fetchSummaryTable(summarySex, {
        phenotype_id: phenotype.id,
        sex: summarySex,
        ancestry,
        columns: ['chromosome', 'position', 'snp', 'allele_reference', 'allele_alternate', 'beta', 'odds_ratio', 'ci_95_low', 'ci_95_high', 'p_value'],
        offset: 0,
        limit: 10,
        orderBy: 'p_value',
        order: 'asc',
        metadataCount: true,
      })
    );

  }

  const clearSummaryTables = () => {
    const initialState = getInitialState();
    for (let key of ['all', 'female', 'male']) {
      dispatch(updateSummaryTable(key, initialState.summaryTables[key]));
      dispatch(updateSummarySnpTable(key, initialState.summarySnpTables[key]));
    }
  }

  const handleReset = () => {
    const initialState = getInitialState();
    dispatch(
      updateSummaryResults(initialState.summaryResults)
    );
    dispatch(
      updateManhattanPlot(initialState.manhattanPlot)
    );
    dispatch(
      updateQQPlot(initialState.qqPlot)
    );
    dispatch(
      updateKey('summaryTables', initialState.summaryTables)
    );
    dispatch(
      updateKey('summarySnpTables', initialState.summarySnpTables)
    );    
  };


  // resubmit summary results
  const onAllChromosomeSelected = () => {
    const initialState = getInitialState();
    dispatch(updateManhattanPlot(initialState.manhattanPlot));
    clearSummaryTables();
    drawSummaryManhattanPlots({phenotype: selectedPhenotype, sex: selectedSex, ancestry: selectedAncestry});
  };

  // redraw plot and update table(s) for single chromosome selection
  const onChromosomeSelected = (chromosome)=> {
    // useSelector does not pick up stackedSex, since it is referring to a property of an object
    let stackedSex = store.getState().summaryTables.stackedSex;
    const range = ranges.find(r => r.chromosome === chromosome);
    // update form parameters
    dispatch(
      updateSummaryResults({
        manhattanPlotView: 'variants',
        selectedChromosome: chromosome,
        bpMin: null,
        bpMax: null,
        nlogpMin: null,
        nlogpMax: null
      })
    );

    // fetch variants for both sexes if stacked
    const plotSexes = selectedSex === 'stacked' 
      ? ['female', 'male'] 
      : [selectedSex]

    dispatch(
      drawManhattanPlot('variants', {
        phenotype_id: selectedPhenotype.id,
        sex: plotSexes,
        ancestry: selectedAncestry,
        chromosome: chromosome,
        p_value_nlog_min: 2,
        p_value_nlog_max: null,
        columns: ['id', 'chromosome', 'position', 'p_value_nlog'],
      })
    );

    // fetch single table for variant results (lazy load non-visible tables)
    let summarySex = selectedSex === 'stacked' 
      ? stackedSex 
      : selectedSex;

    clearSummaryTables();
    dispatch(
      fetchSummaryTable(summarySex, {
        phenotype_id: selectedPhenotype.id,
        sex: summarySex,
        ancestry: selectedAncestry,
        chromosome,
        offset: 0,
        limit: 10,
        columns: ['chromosome', 'position', 'snp', 'allele_reference', 'allele_alternate', 'beta', 'odds_ratio', 'ci_95_low', 'ci_95_high', 'p_value'],
        orderBy: 'p_value',
        order: 'asc',
        metadataCount: true,
      })
    );
  };

  // zoom is only initiated from the chromosome view
  const handleZoom = ({ bounds }) => {
    // useSelector does not pick up stackedSex, since it is referring to a property of an object
    let stackedSex = store.getState().summaryTables.stackedSex;

    // update zoom params
    dispatch(updateSummaryResults({
      bpMin: bounds.xMin,
      bpMax: bounds.xMax,
      nlogpMin: bounds.yMin,
      nlogpMax: bounds.yMax
    }));

    // fetch single table for variant results (lazy load non-visible tables)
    let summarySex = selectedSex === 'stacked'
      ? stackedSex
      : selectedSex;

    // clear both tables before fetching data for variant table
    clearSummaryTables();
    dispatch(
      fetchSummaryTable(summarySex, {
        phenotype_id: selectedPhenotype.id,
        sex: summarySex,
        ancestry: selectedAncestry,
        chromosome: selectedChromosome,
        offset: 0,
        limit: 10,
        columns: ['chromosome', 'position', 'snp', 'allele_reference', 'allele_alternate', 'beta', 'odds_ratio', 'ci_95_low', 'ci_95_high', 'p_value'],
        orderBy: 'p_value',
        order: 'asc',
        position_min: bounds.xMin,
        position_max: bounds.xMax,
        p_value_nlog_min: bounds.yMin,
        p_value_nlog_max: bounds.yMax,
        count: true,
      })
    );
  };

  const handleVariantLookup = ({snp, sex, ancestry}) => {
    if (!ancestry) 
      ancestry = selectedAncestry;

    dispatch(
      updateVariantLookup({
        selectedPhenotypes: [selectedPhenotype],
        selectedVariant: snp,
        selectedSex: sex,
        selectedAncestry: ancestry,
        searchCriteriaVariantLookup: {
          phenotypes: [selectedPhenotype].map(item => item.title),
          variant: snp,
          sex: sex,
          ancestry: ancestry
        },
        submitted: new Date().getTime(),
        disableSubmit: true
      })
    );

    dispatch(lookupVariants({
      phenotypes: [selectedPhenotype], 
      variant: snp, 
      sex,
      ancestry
    }));    
  };

  const loadState = state => {
    if (!state || !Object.keys(state).length) return;
    dispatch(updateSummaryResults({...state, submitted: new Date()}));
    const {
      bpMax,
      bpMin,
      manhattanPlotView,
      nlogpMax,
      nlogpMin,
      selectedChromosome,
      selectedPhenotype,
      selectedPlot,
      selectedSex,
      selectedAncestry
    } = state;

    const sexes = {
      all: ['all'],
      stacked: ['female', 'male'],
      female: ['female'],
      male: ['male'],
    }[selectedSex];

    if (!bpMax || !bpMax || !nlogpMin || !nlogpMin || !selectedChromosome) {
      if (!selectedChromosome) {
        // handle default submission
        handleSubmit({phenotype: selectedPhenotype, sex: selectedSex, ancestry: selectedAncestry})
        if (selectedPlot === 'qq-plot') {
          dispatch(drawQQPlot(selectedPhenotype, selectedSex, selectedAncestry));
        }
      } else {
        // handle chromosome submission
        const range = ranges.find(r => r.chromosome === selectedChromosome);

        if (selectedPlot === 'qq-plot') {
          dispatch(drawQQPlot(selectedPhenotype, selectedSex, selectedAncestry));
        }

        dispatch(
          drawManhattanPlot('variants', {
            phenotype_id: selectedPhenotype.id,
            sex: sexes,
            chromosome: selectedChromosome,
            ancestry: selectedAncestry,
            position_min: range.position_min,
            position_max: range.position_max,
            p_value_nlog_min: 2,
            p_value_nlog_max: null,
            columns: ['id', 'chromosome', 'position', 'p_value_nlog'],
          })
        );

        // dispatch(updateManhattanPlot({
        //   restoredZoomLevel: {xMin: range.position_min, xMax: range.position_max, yMin: 2, yMax: nlogpMax},
        // }))

        // fetch variant results tables
        fetchVariantTables(
          selectedPhenotype,
          selectedSex,
          {chromosome: selectedChromosome, metadataCount: true, phenotype_id: selectedPhenotype.id}
        );
      }
    } else {
      // handle zoomed in view submission
      const range = ranges.find(r => r.chromosome === selectedChromosome);

      if (selectedPlot === 'qq-plot') {
        dispatch(drawQQPlot(selectedPhenotype, selectedSex, selectedAncestry));
      }

      dispatch(
        drawManhattanPlot('variants', {
          phenotype_id: selectedPhenotype.id,
          sex: sexes,
          ancestry: selectedAncestry,
          chromosome: selectedChromosome,
          position_min: range.position_min,
          position_max: range.position_max,
          p_value_nlog_min: 2,
          p_value_nlog_max: null,
          columns: ['id', 'chromosome', 'position', 'p_value_nlog'],
        })
      );

      let restoredZoomLevel = {xMin: bpMin, xMax: bpMax, yMin: nlogpMin, yMax: nlogpMax};
      dispatch(updateManhattanPlot({
        restoredZoomLevel,
        zoomStack: [
          {bounds: {xMin: bpMin, xMax: bpMax, yMin: nlogpMin, yMax: nlogpMax}},
//          {bounds: restoredZoomLevel}
        ]
      }))

      // fetch variant results tables
      fetchVariantTables(
        selectedPhenotype,
        selectedSex,
        {
          chromosome: selectedChromosome,
          position_min: bpMin,
          position_max: bpMax,
          p_value_nlog_min: nlogpMin,
          p_value_nlog_max: nlogpMax,
          count: true
        }
      );

    }
  }

  useEffect(() => {
    if (sharedState && sharedState.parameters && sharedState.parameters.params) {
      loadState(sharedState.parameters.params)
    }
  }, [sharedState]);

  const placeholder = (
    <div style={{ display: submitted ? 'none' : 'block' }}>
      <p className="h4 text-center text-secondary my-5">
        Please select a phenotype to view this plot
      </p>
    </div>
  );

  const sexStratificationLabels = {
    all: {
      value: 'all',
      name: 'All'
    },
    stacked: {
      value: 'stacked',
      name: 'Female/Male (Stacked)'
    },
    female: {
      value: 'female',
      name: 'Female'
    },
    male: {
      value: 'male',
      name: 'Male'
    }
  };

  const ancestryStratificationLabels = {
    european: {
      value: 'european',
      name: 'European'
    },
    east_asian: {
      value: 'east_asian',
      name: 'East Asian'
    }
  };
  
  return (
    <div className="position-relative">
      <h1 className="sr-only">GWAS Results - Visualize summary results</h1>

      <SidebarContainer
        className="mx-3"
        collapsed={!openSidebar}
        onCollapsed={collapsed => setOpenSidebar(!collapsed)}>
        <SidebarPanel className="col-lg-3">
          <div className="px-2 pt-2 pb-3 bg-white tab-pane-bordered rounded-0">
            <SummaryResultsForm
              phenotype={selectedPhenotype}
              // sex={selectedSex}
              // ancestry={selectedAncestry}
              stratification={{
                label: selectedSex ? `${ancestryStratificationLabels[selectedAncestry].name} - ${sexStratificationLabels[selectedSex].name}` : selectedSex,
                value: `${selectedAncestry}__${selectedSex}`
              }}
              onSubmit={handleSubmit}
              onReset={handleReset}
            />
            {messages &&
              messages.map(({ type, content }) => (
                <Alert className="mt-3" variant={type} onClose={clearMessages} dismissible>
                  {content}
                </Alert>
              ))}
          </div>
        </SidebarPanel>

        <MainPanel className="col-lg-9">
          <SummaryResultsSearchCriteria />
          <Tabs
            transition={false}
            className="mt-2"
            defaultActiveKey={selectedPlot}
            activeKey={selectedPlot}
            onSelect={setSelectedPlot}>
            <Tab
              eventKey="manhattan-plot"
              title="Manhattan Plot"
              className={
                selectedPlot === 'manhattan-plot' ?
                "p-2 bg-white tab-pane-bordered rounded-0 d-flex justify-content-center align-items-center" :
                "p-2 bg-white tab-pane-bordered rounded-0"
              }
              style={{ minHeight: '365px' }}>
              <div style={{ display: submitted ? 'block' : 'none' }}>
                <div style={{minHeight: '635px'}}>
                  <ManhattanPlot
                    onChromosomeSelected={onChromosomeSelected}
                    onAllChromosomeSelected={onAllChromosomeSelected}
                    onVariantLookup={handleVariantLookup}
                    onZoom={handleZoom}
                    loading={loadingManhattanPlot}
                    panelCollapsed={openSidebar}
                  />
                </div>
                <div className="mw-100 my-4 px-5">
                  <SummaryResultsTable />
                </div>
              </div>
              {placeholder}
            </Tab>
            <Tab
              eventKey="qq-plot"
              title="Q-Q Plot"
              className={
                selectedPlot === 'qq-plot' ?
                "p-2 bg-white tab-pane-bordered rounded-0 d-flex justify-content-center align-items-center" :
                "p-2 bg-white tab-pane-bordered rounded-0"
              }
              style={{ minHeight: '365px' }}>
              <div
                className="mw-100 my-4"
                style={{ display: submitted ? 'block' : 'none' }}>
                <QQPlot onVariantLookup={handleVariantLookup} />
              </div>
              {placeholder}
            </Tab>
          </Tabs>
        </MainPanel>
      </SidebarContainer>
    </div>
  );
}

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
  updateSummaryTableByIndex, 
  updateSummarySnpTableByIndex
} from '../../../../services/actions';
import { getInitialState } from '../../../../services/store';
import { query } from '../../../../services/query';
import './summary.scss'


export function SummaryResults() {
  const dispatch = useDispatch();
  const {
    selectedPhenotypes,
    selectedStratifications,
    isPairwise,
    selectedChromosome,
    selectedPhenotype,
    selectedPlot,
    submitted,
    messages,
    sharedState,
  } = useSelector(state => state.summaryResults);
  const loadingManhattanPlot = useSelector(state => state.manhattanPlot.loadingManhattanPlot);
  const selectedTable = useSelector(state => state.summaryTables.selectedTable);
  const qqplotData = useSelector(state => state.qqPlot.qqplotData);
  const [openSidebar, setOpenSidebar] = useState(true);

  // selected tab
  const setSelectedPlot = selectedPlot => {
    dispatch(updateSummaryResults({ selectedPlot }));
    if (submitted && selectedPlot === 'qq-plot' && qqplotData.length === 0) {
      dispatch(drawQQPlot({phenotypes: selectedPhenotypes, stratifications: selectedStratifications, isPairwise}));
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

  const handleSubmit = ({phenotypes, stratifications, isPairwise}) => {
    
    if (!phenotypes.length) {
      return setMessages([
        {
          type: 'danger',
          content: 'Please select a phenotype.'
        }
      ]);
    }

    const initialState = getInitialState();
    for (let key of ['manhattanPlot', 'qqPlot', 'summaryTables', 'summarySnpTables'])
      dispatch(updateKey(key, initialState[key]));

    if (selectedPlot === 'qq-plot'){
      dispatch(drawQQPlot({phenotypes, stratifications, isPairwise}));
    }

    drawSummaryManhattanPlot({phenotypes, stratifications, isPairwise});

    // update summary results filters
    dispatch(
      updateSummaryResults({
        selectedPhenotypes: phenotypes,
        selectedStratifications: stratifications,
        manhattanPlotView: 'summary',
        selectedChromosome: null,
        isPairwise,
        nlogpMin: null,
        nlogpMax: null,
        bpMin: null,
        bpMax: null,
        submitted: new Date().getTime(),
      })
    );
  };

  const drawSummaryManhattanPlot = ({phenotypes, stratifications, isPairwise}) => {
    // draw summary plot using aggregate data
    dispatch(
      drawManhattanPlot('summary', {
        phenotypes,
        stratifications,
        isPairwise,
        p_value_nlog_min: 2,
      })
    );

    // fetch both summary results tables
    stratifications.filter(s => s.sex && s.ancestry).forEach((stratification, i) => {
      const {sex, ancestry} = stratification;
      const phenotype = phenotypes[i] || phenotypes[0];
      dispatch(
        fetchSummaryTable(i, {
          phenotype_id: phenotype.id,
          sex,
          ancestry,
          offset: 0,
          limit: 10,
          orderBy: 'p_value',
          order: 'asc',
          metadataCount: true,
        })
      );
    });
  }

  const updateVariants = ({phenotypes, stratifications, chromosome, bounds, selectedTable, isPairwise, count, metadataCount, updatePlot}) => {
    let queryBounds = {
      p_value_nlog_min: 2,
      p_value_nlog_max: null,
    };

    // determine if we should zoom in to a specific region
    const isInvalidBound = n => n === null || n === undefined || isNaN(n);
    if (!bounds || [bounds.bpMin, bounds.bpMax, bounds.nlogpMin, bounds.nlogpMax].some(isInvalidBound)) {
      bounds = {
          bpMin: null,
          bpMax: null,
          nlogpMin: null,
          nlogpMax: null,
      };
    } else {
      queryBounds = {
        position_min: bounds.bpMin,
        position_max: bounds.bpMax,
        p_value_nlog_min: bounds.nlogpMin,
        p_value_nlog_max: bounds.nlogpMax,
      };
    }

    // update parameters
    dispatch(
      updateSummaryResults({
        manhattanPlotView: 'variants',
        selectedPhenotypes: phenotypes,
        selectedStratifications: stratifications,
        selectedChromosome: chromosome,
        ...bounds,
      })
    );

    // draw variants plot
    if (updatePlot) {
      dispatch(
        drawManhattanPlot('variants', {
          columns: ['id', 'chromosome', 'position', 'p_value_nlog'],
          phenotypes,
          stratifications,
          chromosome,
          isPairwise,
          ...queryBounds,
        })
      );
    }

    // fetch both summary results tables
    clearSummaryTables();
    selectedStratifications.filter(s => s.sex && s.ancestry).forEach((stratification, i) => {
      const {sex, ancestry} = stratification;
      const phenotype = selectedPhenotypes[i] || selectedPhenotypes[0];
      dispatch(
        fetchSummaryTable(i, {
          phenotype_id: phenotype.id,
          sex,
          ancestry,
          chromosome,
          offset: 0,
          limit: 10,
          orderBy: 'p_value',
          order: 'asc',
          count,
          metadataCount,
          ...queryBounds,
        })
      );
    });
  }

  const clearSummaryTables = () => {
    const initialState = getInitialState();
    for (let key of [0, 1]) {
      dispatch(updateSummaryTableByIndex(key, initialState.summaryTables.tables[key]));
      dispatch(updateSummarySnpTableByIndex(key, initialState.summarySnpTables.tables[key]));
    }
  }

  const handleReset = async () => {
    const initialState = getInitialState();
    for (let key of ['summaryResults', 'manhattanPlot', 'qqPlot', 'summaryTables', 'summarySnpTables'])
      dispatch(updateKey(key, initialState[key]));
    const ranges = await query('ranges')
      dispatch(updateSummaryResults({ranges}));
  };

  // resubmit summary results
  const onAllChromosomeSelected = () => {
    const initialState = getInitialState();
    dispatch(updateManhattanPlot(initialState.manhattanPlot));
    
    clearSummaryTables();
    drawSummaryManhattanPlot({phenotypes: selectedPhenotypes, stratifications: selectedStratifications, isPairwise});

    dispatch(
      updateSummaryResults({
        manhattanPlotView: 'summary',
        selectedChromosome: null,
        nlogpMin: null,
        nlogpMax: null,
        bpMin: null,
        bpMax: null,
      })
    );
  };

  // redraw plot and update table(s) for single chromosome selection
  const onChromosomeSelected = chromosome => {
    updateVariants({
      phenotypes: selectedPhenotypes,
      stratifications: selectedStratifications,
      chromosome,
      metadataCount: true,
      updatePlot: true,
      isPairwise,
    });
  };

  // zoom is only initiated from the chromosome view
  const handleZoom = ({ bounds }) => {
    updateVariants({
      phenotypes: selectedPhenotypes,
      stratifications: selectedStratifications,
      chromosome: selectedChromosome,
      bounds: {
        bpMin: bounds.xMin,
        bpMax: bounds.xMax,
        nlogpMin: bounds.yMin,
        nlogpMax: bounds.yMax
      },
      count: true,
      updatePlot: false,
      isPairwise,
    });
  };

  const handleVariantLookup = ({snp, sex, ancestry}) => {
    dispatch(
      updateVariantLookup({
        selectedPhenotypes,
        selectedVariant: snp,
        selectedSex: sex,
        selectedAncestry: ancestry,
        searchCriteriaVariantLookup: {
          phenotypes: selectedPhenotypes.map(p => p.display_name),
          variant: snp,
          sex: sex,
          ancestry: ancestry
        },
        submitted: new Date().getTime(),
        disableSubmit: true
      })
    );

    dispatch(lookupVariants({
      phenotypes: selectedPhenotypes, 
      variant: snp, 
      sex,
      ancestry
    }));
  };

  const loadState = state => {
    if (!state || !Object.keys(state).length) return;
    dispatch(updateSummaryResults({...state, submitted: new Date()}));
    const {
      selectedPhenotypes,
      selectedStratifications,
      selectedChromosome,
      selectedPlot,
      manhattanPlotView,
      bpMax,
      bpMin,
      nlogpMax,
      nlogpMin,
    } = state;

    if (manhattanPlotView === 'summary') {
      handleSubmit({phenotypes: selectedPhenotypes, stratifications: selectedStratifications})
    } else {
      if (selectedPlot === 'qq-plot') {
        dispatch(drawQQPlot({phenotypes: selectedPhenotypes, stratifications: selectedStratifications, isPairwise}));
      }

      setTimeout(() => {
        const isZoomed = bpMax && bpMax && nlogpMin && nlogpMax;
        updateVariants({
          phenotype: selectedPhenotypes, 
          stratifications: selectedStratifications,
          chromosome: selectedChromosome,
          bounds: {
            bpMax,
            bpMin,
            nlogpMax,
            nlogpMin,          
          },
          updatePlot: true,
          metadataCount: !isZoomed,
          count: isZoomed,
        })
      }, 100);

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
              selectedPhenotypes={selectedPhenotypes}
              selectedStratifications={selectedStratifications}
              isPairwise={isPairwise}
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
              className="p-2 bg-white tab-pane-bordered rounded-0"
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

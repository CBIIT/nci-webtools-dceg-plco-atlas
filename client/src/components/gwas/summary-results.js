import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Alert, Tab, Tabs, Button } from 'react-bootstrap';
import { SummaryResultsForm } from '../forms/summary-results-form';
import { ManhattanPlot } from '../plots/manhattan-plot';
import { QQPlot } from '../plots/qq-plot';
import { SummaryResultsTable } from './summary-results-table';
import { SummaryResultsSearchCriteria } from '../controls/summary-results-search-criteria';
import {
  SidebarContainer,
  SidebarPanel,
  MainPanel,
} from '../controls/sidebar-container';
import {
  updateSummaryResults,
  updateVariantLookup,
  lookupVariants,
  drawQQPlot,
  drawManhattanPlot,
  fetchSummaryTable
} from '../../services/actions';

export function SummaryResults() {
  const dispatch = useDispatch();
  const {
    selectedChromosome,
    selectedPhenotype,
    selectedPlot,
    submitted,
    ranges,
    messages,
    selectedManhattanPlotType,
    loadingManhattanPlot,
  } = useSelector(state => state.summaryResults);

  const [openSidebar, setOpenSidebar] = useState(true);

  const setPopupTooltipData = popupTooltipData => {
    dispatch(updateSummaryResults({ popupTooltipData }));
  };

  const setSelectedPlot = selectedPlot => {
    dispatch(updateSummaryResults({ selectedPlot }));
  };

  const setMessages = messages => {
    dispatch(updateSummaryResults({ messages }));
  };

  const setSearchCriteriaSummaryResults = searchCriteriaSummaryResults => {
    dispatch(updateSummaryResults({ searchCriteriaSummaryResults }));
  };

  const clearMessages = e => {
    setMessages([]);
  };

  // const handleChange = () => {
  //   clearMessages();
  // };


  const hideQQTooltips = () => {
    // if tooltip already exists, destroy
    const elem = document.getElementsByClassName('qq-plot-tooltip');
    if (elem && elem.length > 0) {
      elem[0].remove();
    }
  };

  // phenotype is selected phenotype's value
  // plotType is all, stacked, female, or male
  const fetchVariantTables = (phenotype, plotType, params) => {
    params = params || {};
    let genders = {
      all: ['all'],
      stacked: ['female', 'male'],
      female: ['female'],
      male: ['male'],
    }[plotType];

    // fetch variant results tables
    genders.forEach((gender, i) => {
      let key = gender;

      dispatch(
        fetchSummaryTable(gender, {
          ...params,
          table: phenotype + '_variant',
          gender: gender,
          offset: 0,
          limit: 10,
          columns: ['chromosome', 'position', 'snp', 'reference_allele', 'effect_allele', 'odds_ratio', 'p_value'],
          orderBy: 'p_value',
          order: 'asc',
          // key: params.count ? null : countKey, // metadata key for counts
        })
      );
    });
  }


  // when submitting:
  // 1. Fetch aggregate data for displaying manhattan plot(s)
  // 2. Fetch variant data for each selected gender
  const handleSubmit = (phenotype, manhattanPlotType) => {
    if (!phenotype) {
      return setMessages([
        {
          type: 'danger',
          content: 'Please select a phenotype.'
        }
      ]);
    }
    let genders = {
      all: ['all'],
      stacked: ['female', 'male'],
      female: ['female'],
      male: ['male'],
    }[manhattanPlotType];

    // determine which tables to use for manhattan plot
    // const aggregateTable = getAggregateTable(manhattanPlotType);

    // close sidebar on submit
    // setOpenSidebar(false);
    setPopupTooltipData(null);
    dispatch(drawQQPlot(phenotype, manhattanPlotType));

    // update summary results filters
    dispatch(
      updateSummaryResults({
        selectedPhenotype: phenotype,
        selectedManhattanPlotType: manhattanPlotType,
        manhattanPlotView: 'summary',
        selectedTable: phenotype.value + '_aggregate',
        selectedChromosome: null,
        selectedManhattanPlotType: manhattanPlotType,
        nlogpMin: null,
        nlogpMax: null,
        bpMin: null,
        bpMax: null,
        submitted: true,
        manhattanPlotConfig: {},
      })
    );

    // draw summary plot using aggregate data
    dispatch(
      drawManhattanPlot('summary', {
        table: phenotype.value + '_aggregate',
        gender: genders,
        p_value_nlog_min: 3
      })
    );

    // // fetch variant results tables
    fetchVariantTables(
      phenotype.value,
      manhattanPlotType
    );

    setSearchCriteriaSummaryResults({
      phenotype: [...phenotype.title],
      gender: manhattanPlotType
    });
    // if any Q-Q plot tooltips exist, destory
    hideQQTooltips();
  };

  const handleReset = params => {
    dispatch(
      updateSummaryResults({
        selectedListType: 'categorical',
        selectedPhenotype: null,
        selectedChromosome: null,
        selectedPlot: 'manhattan-plot',
        selectedManhattanPlotType: 'all',
        manhattanPlotData: {},
        manhattanPlotMirroredData: {},
        manhattanPlotView: '',
        ranges: [],
        messages: [],
        qqplotSrc: '',
        areaItems: [],
        lambdaGC: '',
        submitted: null,
        loadingManhattanTable: false,
        loadingManhattanPlot: false,
        loadingQQPlot: false,
        drawManhattanPlot: null,
        updateResultsTable: null,
        popupTooltipData: null,
        showSnpResults: false,
        snp: '',
        searchCriteriaSummaryResults: {},
        sampleSize: null,
        manhattanPlotConfig: {},
      })
    );

    // reset summary results tables
/*
    for (let i = 0; i < 2; i++) {
      dispatch(
        updateSummaryTable(
          {
            results: [],
            resultsCount: 0,
            page: 1,
            pageSize: 10
          },
          i
        )
      );
    }
*/
    // if any Q-Q plot tooltips exist, destory
    hideQQTooltips();
  };

  // resubmit summary results
  const onAllChromosomeSelected = () => {
    handleSubmit(selectedPhenotype, selectedManhattanPlotType);
  };

  // redraw plot and update table(s) for single chromosome selection
  const onChromosomeSelected = chromosome => {
    const database = selectedPhenotype.value + '.db';
    const range = ranges.find(r => r.chromosome === chromosome);
    const genders = {
      all: ['all'],
      stacked: ['female', 'male'],
      female: ['female'],
      male: ['male'],
    }[selectedManhattanPlotType];

    // update form parameters
    dispatch(
      updateSummaryResults({
        manhattanPlotView: 'variants',
        selectedTable: selectedPhenotype.value + '_variant',
        selectedChromosome: chromosome,
        selectedManhattanPlotType,
        // bpMin: range.bp_min,
        // bpMax: range.bp_max,
        // nlogpMin: 2,
        // nlogpMax: null
      })
    );

    dispatch(
      drawManhattanPlot('variants', {
        table: selectedPhenotype.value + '_variant',
        gender: genders,
        chromosome: chromosome,
        position_min: range.position_min,
        position_max: range.position_max,
        p_value_nlog_min: 2,
        p_value_nlog_max: null,
        columns: ['id', 'chromosome', 'position', 'p_value_nlog']
      })
    );

    // fetch variant results tables
    fetchVariantTables(
      selectedPhenotype.value,
      selectedManhattanPlotType,
      {chromosome}
    );
  };

  // zoom is only initiated from the chromosome view
  const handleZoom = ({ bounds }) => {
    const zoomParams = {
      position_min: bounds.xMin,
      position_max: bounds.xMax,
      p_value_nlog_min: bounds.yMin,
      p_value_nlog_max: bounds.yMax
    };

    // update zoom params
    dispatch(updateSummaryResults({...zoomParams}));

    // fetch variant results tables
    fetchVariantTables(
      selectedPhenotype.value,
      selectedManhattanPlotType,
      {
        ...zoomParams,
        chromosome: selectedChromosome,
        count: true
      }
    );
  };

  const handleVariantLookup = ({ snp }, gender) => {
    const genderSanitized = gender ? (gender.includes('Male') ? 'male' : 'female') : selectedManhattanPlotType === 'male' || selectedManhattanPlotType === 'female' ? selectedManhattanPlotType : 'all';
    console.log("genderSanitized", genderSanitized);
    dispatch(
      updateVariantLookup({
        selectedPhenotypes: [selectedPhenotype],
        selectedVariant: snp,
        selectedGender: genderSanitized,
        searchCriteriaVariantLookup: {
          phenotypes: [selectedPhenotype].map(item => item.title),
          variant: snp,
          gender: genderSanitized
        }
      })
    );
    dispatch(lookupVariants([selectedPhenotype], snp, genderSanitized));
  };

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
          <div className="px-2 pt-2 pb-3 bg-white border rounded-0">
            <SummaryResultsForm
              phenotype={selectedPhenotype}
              gender={selectedManhattanPlotType}
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
              style={{ minHeight: '366px' }}>
              <div>
                <ManhattanPlot
                  onChromosomeSelected={onChromosomeSelected}
                  onAllChromosomeSelected={onAllChromosomeSelected}
                  onVariantLookup={handleVariantLookup}
                  onZoom={handleZoom}
                  loading={loadingManhattanPlot}
                  panelCollapsed={openSidebar}
                />
                <div
                  className="mw-100 my-4 px-5"
                  style={{ display: submitted ? 'block' : 'none' }}>
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
              style={{ minHeight: '366px' }}>
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

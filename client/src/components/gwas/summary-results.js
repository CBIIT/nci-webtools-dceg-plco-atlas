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

  const handleChange = () => {
    clearMessages();
  };

  // determine which aggregate tables correspond to the selected plot type
  const getAggregateTable = plotType =>
    ({
      all: ['aggregate_all'],
      stacked: ['aggregate_male', 'aggregate_female'],
      female: ['aggregate_female'],
      male: ['aggregate_male']
    }[plotType]);

  // determine which variant tables correspond to the selected plot type
  const getVariantTable = plotType =>
    ({
      all: ['variant_all'],
      stacked: ['variant_male', 'variant_female'],
      female: ['variant_female'],
      male: ['variant_male']
    }[plotType]);

  const hideQQTooltips = () => {
    // if tooltip already exists, destroy
    const elem = document.getElementsByClassName('qq-plot-tooltip');
    if (elem && elem.length > 0) {
      elem[0].remove();
    }
    // tooltip.style.display = 'none';
  };

  // phenotype is selected phenotype's value
  // plotType is all, stacked, female, or male
  const fetchVariantTables = (phenotype, plotType, params) => {
    params = params || {};
    let storeKeys = {
      all: ['all'],
      stacked: ['female', 'male'],
      female: ['female'],
      male: ['male'],
    }[plotType];

    // fetch variant results tables
    getVariantTable(plotType).forEach((table, i) => {
      let key = storeKeys[i];

      // if a chromosome is supplied, append the chromosome to the
      // metadata key used to retrieve counts
      let countKey = params.chr
        ? `count_${key}_${params.chr}`
        : `count_${key}`;

      dispatch(
        fetchSummaryTable(key, {
          database: phenotype + '.db',
          table: table,
          offset: 0,
          limit: 10,
          columns: ['chr', 'bp', 'snp', 'a1', 'a2', 'or', 'p'],
          orderBy: 'p',
          order: 'asc',
          key: params.count ? null : countKey, // metadata key for counts
          ...params
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

    // determine which tables to use for manhattan plot
    const aggregateTable = getAggregateTable(manhattanPlotType);

    // determine which tables to use for summary results
    const variantTable = getVariantTable(manhattanPlotType);

    // close sidebar on submit
    // setOpenSidebar(false);
    setPopupTooltipData(null);
    dispatch(drawQQPlot(phenotype.value, variantTable));

    // update summary results filters
    dispatch(
      updateSummaryResults({
        selectedPhenotype: phenotype,
        selectedManhattanPlotType: manhattanPlotType,
        manhattanPlotView: 'summary',
        selectedTable: aggregateTable,
        selectedChromosome: null,
        selectedManhattanPlotType: manhattanPlotType,
        nlogpMin: null,
        nlogpMax: null,
        bpMin: null,
        bpMax: null,
        submitted: true
      })
    );

    // draw summary plot using aggregate data
    dispatch(
      drawManhattanPlot('summary', {
        database: phenotype.value + '.db',
        table: aggregateTable,
        nlogpMin: 3
      })
    );

    // fetch variant results tables
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
        sampleSize: null
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
  const onChromosomeSelected = chr => {
    const database = selectedPhenotype.value + '.db';
    const range = ranges.find(r => r.chr === chr);
    const variantTable = getVariantTable(selectedManhattanPlotType);

    // update form parameters
    dispatch(
      updateSummaryResults({
        manhattanPlotView: 'variants',
        selectedTable: variantTable,
        selectedChromosome: chr,
        selectedManhattanPlotType,
        // bpMin: range.bp_min,
        // bpMax: range.bp_max,
        // nlogpMin: 2,
        // nlogpMax: null
      })
    );

    dispatch(
      drawManhattanPlot('variants', {
        database,
        table: variantTable,
        chr,
        bpMin: range.bp_min,
        bpMax: range.bp_max,
        nlogpMin: 2,
        nlogpMax: null,
        columns: ['variant_id', 'chr', 'bp', 'nlog_p']
      })
    );

    // fetch variant results tables
    fetchVariantTables(
      selectedPhenotype.value,
      selectedManhattanPlotType,
      {chr}
    );
  };

  // zoom is only initiated from the chromosome view
  const handleZoom = ({ bounds }) => {
    const zoomParams = {
      bpMin: bounds.xMin,
      bpMax: bounds.xMax,
      nlogpMin: bounds.yMin,
      nlogpMax: bounds.yMax
    };

    // update zoom params
    dispatch(updateSummaryResults({...zoomParams}));

    // fetch variant results tables
    fetchVariantTables(
      selectedPhenotype.value,
      selectedManhattanPlotType,
      {
        ...zoomParams,
        chr: selectedChromosome,
        count: true
      }
    );
  };

  const handleVariantLookup = ({ snp }, gender) => {
    console.log("gender", gender);
    dispatch(
      updateVariantLookup({
        selectedPhenotypes: [selectedPhenotype],
        selectedVariant: snp,
        selectedGender:
          gender ? (gender === 'Male' ? 'male' : 'female') :
          selectedManhattanPlotType === 'male' ||
          selectedManhattanPlotType === 'female'
            ? selectedManhattanPlotType
            : 'combined',
        searchCriteriaVariantLookup: {
          phenotypes: [selectedPhenotype].map(item => item.title),
          variant: snp,
          gender:
            gender ? (gender === 'Male' ? 'male' : 'female') :
            selectedManhattanPlotType === 'male' ||
            selectedManhattanPlotType === 'female'
              ? selectedManhattanPlotType
              : 'combined'
        }
      })
    );
    dispatch(lookupVariants([selectedPhenotype], snp));
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
      <h1 className="sr-only">Explore GWAS data - Visualize summary results</h1>

      <SidebarContainer
        className="mx-3"
        collapsed={!openSidebar}
        onCollapsed={collapsed => setOpenSidebar(!collapsed)}>
        <SidebarPanel className="col-lg-3">
          <div className="p-2 bg-white border rounded-0">
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
            className="mt-2"
            defaultActiveKey={selectedPlot}
            onSelect={setSelectedPlot}>
            <Tab
              eventKey="manhattan-plot"
              title="Manhattan Plot"
              className="p-2 bg-white tab-pane-bordered rounded-0"
              style={{ minHeight: '50vh' }}>
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
              {placeholder}
            </Tab>
            <Tab
              eventKey="qq-plot"
              title="Q-Q Plot"
              className="p-2 bg-white tab-pane-bordered rounded-0"
              style={{ minHeight: '50vh' }}>
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

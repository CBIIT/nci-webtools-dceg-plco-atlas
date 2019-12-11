import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Alert, Tab, Tabs, Button } from 'react-bootstrap';
import { SummaryResultsForm } from '../forms/summary-results-form';
import { SnpSearchForm } from '../forms/snp-search-form';
import { ManhattanPlot } from '../plots/manhattan-plot';
import { QQPlot } from '../plots/qq-plot';
import { SummaryResultsTable } from './summary-results-table';
import { SummaryResultsSearchCriteria } from '../controls/summary-results-search-criteria';
import {
  updateSummaryResults,
  updateVariantLookup,
  lookupVariants,
  drawQQPlot,
  drawManhattanPlot,
  fetchSummaryTable,
  updateSummaryTable
} from '../../services/actions';
import { query } from '../../services/query';


export function SummaryResults() {
  const dispatch = useDispatch();
  const {
    selectedChromosome,
    selectedPhenotype,
    selectedPlot,
    submitted,
    ranges,
    messages,
    page,
    pageSize,
    resultsCount,
    selectedGender,
    selectedManhattanPlotType,
    loadingManhattanPlot,
    showSnpResults
  } = useSelector(state => state.summaryResults);

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

  const handleSubmit = (phenotype, manhattanPlotType) => {
    phenotype = phenotype ? phenotype.value : null;

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
    setOpenSidebar(false);
    setPopupTooltipData(null);
    dispatch(drawQQPlot(phenotype, variantTable));

    // update summary results filters
    dispatch(
      updateSummaryResults({
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
        database: phenotype + '.db',
        table: aggregateTable,
        nlogpMin: 3
      })
    );

    // fetch variant results tables
    variantTable.forEach((table, tableIndex) => {
      // gender is specified by manhattan plot type (all, stacked, male, female)
      let gender = manhattanPlotType;

      // if stacked, gender will be female first, then male
      if (manhattanPlotType === 'stacked')
        gender = [`female`, `male`][tableIndex];

      // metadata key for counts
      let countKey = `count_${gender}`;

      dispatch(
        fetchSummaryTable(
          {
            database: phenotype + '.db',
            table: table,
            gender: gender,
            offset: 0,
            limit: 10,
            columns: ['chr', 'bp', 'snp', 'a1', 'a2', 'or', 'p'],
            orderBy: 'p',
            order: 'asc'
          },
          countKey,
          tableIndex
        )
      );
    });

    setSearchCriteriaSummaryResults({
      phenotype: [...selectedPhenotype.title],
      gender: selectedManhattanPlotType
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
        bpMin: range.bp_min,
        bpMax: range.bp_max,
        nlogpMin: 2,
        nlogpMax: null
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

    // fetch the table(s) for the selected chromosome
    variantTable.forEach((table, tableIndex) => {
      // gender is specified by manhattan plot type (all, stacked, male, female)
      let gender = selectedManhattanPlotType;

      // if stacked, gender will be female first, then male
      if (selectedManhattanPlotType === 'stacked')
        gender = [`female`, `male`][tableIndex];

      dispatch(
        fetchSummaryTable(
          {
            database,
            table,
            chr,
            gender,
            offset: 0,
            limit: 10,
            columns: ['chr', 'bp', 'snp', 'a1', 'a2', 'or', 'p'],
            orderBy: 'p',
            order: 'asc'
          },
          `count_${gender}_${chr}`,
          tableIndex
        )
      );
    });
  };

  // zoom is only initiated from the chromosome view
  const handleZoom = ({ bounds }) => {
    const database = selectedPhenotype.value + '.db';
    const chr = selectedChromosome;
    const page = 1;
    const pageSize = 10;
    const variantTable = getVariantTable(selectedManhattanPlotType);
    const zoomParams = {
      bpMin: bounds.xMin,
      bpMax: bounds.xMax,
      nlogpMin: bounds.yMin,
      nlogpMax: bounds.yMax
    };

    // reset page/pageSize, and update zoom params
    dispatch(
      updateSummaryResults({
        page,
        pageSize,
        ...zoomParams
      })
    );

    // handle zoom for each table
    variantTable.forEach((table, tableIndex) => {
      // gender is specified by manhattan plot type (all, stacked, male, female)
      let gender = selectedManhattanPlotType;

      // if stacked, gender will be female first, then male
      if (selectedManhattanPlotType === 'stacked')
        gender = [`female`, `male`][tableIndex];

      dispatch(
        fetchSummaryTable(
          {
            database,
            table,
            chr,
            gender,
            offset: (page - 1) * pageSize,
            limit: pageSize,
            columns: ['chr', 'bp', 'snp', 'a1', 'a2', 'or', 'p'],
            orderBy: 'p',
            order: 'asc',
            count: true,
            ...zoomParams
          },
          null,
          tableIndex
        )
      );
    });
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

  const [openSidebar, setOpenSidebar] = useState(true);

  return (
    <div style={{ position: 'relative' }}>
      <h1 className="d-none">Explore GWAS data - Visualize summary results</h1>
      <div className={openSidebar ? 'row mx-3' : 'mx-3'}>
        <div className="col-lg-3">
          {/* {openSidebar && ( */}
          <Tabs defaultActiveKey="summary-results-form"
            style={{display: openSidebar ? 'block' : 'none'}}>
            <Tab
              eventKey="summary-results-form"
              className="p-2 bg-white tab-pane-bordered rounded-0"
              style={{ minHeight: '100%', display: openSidebar ? 'block' : 'none' }}>
              <SummaryResultsForm
                onSubmit={handleSubmit}
                onChange={handleChange}
                onReset={handleReset}
                style={{display: openSidebar ? 'block' : 'none'}}
              />
              {messages &&
                messages.map(({ type, content }) => (
                  <Alert className="mt-3" variant={type} onClose={clearMessages} dismissible>
                    {content}
                  </Alert>
                ))}
            </Tab>
          </Tabs>
          {/* )} */}
          <Button
            className="pt-0 border-0"
            title={openSidebar ? "Hide search panel" : "Show search panel"}
            variant="link"
            style={{
              color: '#008CBA',
              position: 'absolute',
              zIndex: 100,
              top: '0px',
              [openSidebar ? 'right' : 'left']: '-15px'
            }}
            onClick={() => setOpenSidebar(!openSidebar)}
            aria-controls="summary-results-collapse-input-panel"
            aria-expanded={openSidebar}>
            {openSidebar ? (
              <i className="fas fa-caret-left fa-lg"></i>
            ) : (
              <i className="fas fa-caret-right fa-lg"></i>
            )}
          </Button>
        </div>

        <div className="d-lg-none p-2"></div>

        <div className={openSidebar ? 'col-lg-9' : 'col-lg-12'}>
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
                <SnpSearchForm />

                <div style={{ display: showSnpResults ? 'none' : 'block' }}>
                  <SummaryResultsTable />
                </div>
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
        </div>
      </div>
    </div>
  );
}

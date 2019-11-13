import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Alert, Tab, Tabs, Button } from 'react-bootstrap';
import { SummaryResultsForm } from '../forms/summary-results-form';
import { SnpSearchForm } from '../forms/snp-search-form';
import { ManhattanPlot } from '../plots/manhattan-plot';
import { QQPlot } from '../plots/qq-plot';
import { SummaryResultsTable } from './summary-results-table';
import {
  updateSummaryResults,
  updateVariantLookup,
  lookupVariants,
  drawQQPlot,
  drawQQPlotPlotly,
  drawManhattanPlot,
  fetchSummaryTable,
  updateSummaryTable,
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
    page,
    pageSize,
    resultsCount,
    selectedGender,
    selectedManhattanPlotType,
    loadingManhattanPlot,
    showSnpResults,

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

  const clearMessages = e => {
    setMessages([]);
  };

  const handleChange = () => {
    clearMessages();
  };

  // determine which aggregate tables correspond to the selected plot type
  const getAggregateTable = plotType => ({
    all: ['aggregate_all'],
    stacked: ['aggregate_male', 'aggregate_female'],
    female: ['aggregate_female'],
    male: ['aggregate_male'],
  }[plotType]);

  // determine which variant tables correspond to the selected plot type
  const getVariantTable = plotType => ({
    all: ['variant_all'],
    stacked: ['variant_male', 'variant_female'],
    female: ['variant_female'],
    male: ['variant_male'],
  }[plotType])

  const handleSubmit = (phenotype, manhattanPlotType) => {
    phenotype = phenotype ? phenotype.value : null;

    if (!phenotype) {
      return setMessages([{
        type: 'danger',
        content: 'Please select a phenotype.'
      }]);
    }

    // determine which tables to use for manhattan plot
    const aggregateTable = getAggregateTable(manhattanPlotType);

    // determine which tables to use for summary results
    const variantTable = getVariantTable(manhattanPlotType);

    setPopupTooltipData(null);
    dispatch(drawQQPlot(phenotype));
    dispatch(drawQQPlotPlotly(phenotype));

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
        submitted: true,
      })
    );

    // draw summary plot using aggregate data
    dispatch(
      drawManhattanPlot('summary', {
        database: phenotype + '.db',
        table: aggregateTable,
        nlogpMin: 3,
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
        fetchSummaryTable({
          database: phenotype + '.db',
          table: table,
          gender: gender,
          offset: 0,
          limit: 10,
          columns: ['chr', 'bp', 'snp', 'a1', 'a2', 'or', 'p'],
          orderBy: 'p',
          order: 'asc',
        }, countKey, tableIndex)
      );
    });
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
        sampleSize: '',
        submitted: null,
        loading: false,
        loadingManhattanPlot: false,
        drawManhattanPlot: null,
        updateResultsTable: null,
        popupTooltipData: null,
        showSnpResults: false,
        snp: '',
      })
    );

    // reset summary results tables
    for (let i = 0; i < 2; i ++) {
      dispatch(
        updateSummaryTable({
          results: [],
          resultsCount: 0,
          page: 1,
          pageSize: 10,
        }, i)
      );
    }
  };

  // resubmit summary results
  const onAllChromosomeSelected = () => {
    handleSubmit(selectedPhenotype, selectedManhattanPlotType)
  }

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
        nlogpMax: null,
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
        fetchSummaryTable({
          database,
          table,
          chr,
          gender,
          offset: 0,
          limit: 10,
          columns: ['chr', 'bp', 'snp', 'a1', 'a2', 'or', 'p'],
          orderBy: 'p',
          order: 'asc',
        }, `count_${gender}_${chr}`, tableIndex)
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
      nlogpMax: bounds.yMax,
    };

    // reset page/pageSize, and update zoom params
    dispatch(
      updateSummaryResults({
        page,
        pageSize,
        ...zoomParams,
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
        fetchSummaryTable({
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
          ...zoomParams,
        }, null, tableIndex)
      );
    });
  };

  const handleVariantLookup = ({ snp }) => {
    dispatch(
      updateVariantLookup({
        selectedPhenotypes: [selectedPhenotype],
        selectedVariant: snp,
        selectedGender: selectedManhattanPlotType === 'male' || selectedManhattanPlotType === 'female' ? selectedManhattanPlotType : 'combined'
      })
    );
    dispatch(lookupVariants([selectedPhenotype], snp));
  };
  const placeholder = (
    <div style={{ display: submitted ? 'none' : 'block' }}>
      <p className="h4 text-center my-5">
        Please select a phenotype to view this plot.
      </p>
    </div>
  );

  const [openSidebar, setOpenSidebar] = useState(true);

  return (
    <>
      <Button
        variant="link"
        style={{position: 'absolute', zIndex: 100}}
        onClick={() => setOpenSidebar(!openSidebar)}
        aria-controls="summary-results-collapse-input-panel"
        aria-expanded={openSidebar}>
        { openSidebar ? <span>&#171;</span> : <span>&#187;</span>}
      </Button>
      
      <div className={openSidebar ? "row mx-3" : "mx-3"}>
        {openSidebar && (
          <div className="col-md-3">
            <Tabs defaultActiveKey="summary-results-form">
              <Tab
                eventKey="summary-results-form"
                // title="Table"
                className="p-2 bg-white tab-pane-bordered rounded-0"
                style={{minHeight: '100%'}}>
                <SummaryResultsForm onSubmit={handleSubmit} onChange={handleChange} onReset={handleReset} />
                {messages &&
                  messages.map(({ type, content }) => (
                    <Alert variant={type} onClose={clearMessages} dismissible>
                      {content}
                    </Alert>
                  ))}
              </Tab>
            </Tabs>
          </div>
        )}

        <div class="d-md-none p-2"></div>
      
        <div className={openSidebar ? "col-md-9" : "col-md-12"}>
          <Tabs className="" defaultActiveKey={selectedPlot} onSelect={setSelectedPlot}>
            <Tab
              eventKey="manhattan-plot"
              title="Manhattan Plot"
              className="p-2 bg-white tab-pane-bordered rounded-0" style={{minHeight: '50vh'}}>
              <ManhattanPlot
                onChromosomeSelected={onChromosomeSelected}
                onAllChromosomeSelected={onAllChromosomeSelected}
                onVariantLookup={handleVariantLookup}
                onZoom={handleZoom}
                loading={loadingManhattanPlot}
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
              className="p-2 bg-white tab-pane-bordered" style={{minHeight: '50vh'}}>
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
    </>
  );
}

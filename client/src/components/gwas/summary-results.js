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
  updateSummaryResultsTable
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

  const setSubmitted = submitted => {
    dispatch(updateSummaryResults({ submitted }));
  };

  const setSelectedChromosome = selectedChromosome => {
    dispatch(updateSummaryResults({ selectedChromosome }));
  };

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
    // setSubmitted(null);
  };

  const handleSubmit = (phenotype, manhattanPlotType) => {
    phenotype = phenotype ? phenotype.value : null;

    if (!phenotype) {
      setMessages([
        {
          type: 'danger',
          content:
            'Please select a phenotype.'
        }
      ]);
      console.log('not selected');
      return;
    }

    const aggregateTable = {
      all: 'aggregate_all',
      stacked: ['aggregate_male', 'aggregate_female'],
      female: 'aggregate_female',
      male: 'aggregate_male',
    }[manhattanPlotType];

    const variantTable = {
      all: 'variant_all',
      stacked: ['variant_male', 'variant_female'],
      female: 'variant_female',
      male: 'variant_male',
    }[manhattanPlotType];

    setSubmitted(new Date());
    setSelectedChromosome(null);
    setPopupTooltipData(null);
    dispatch(updateSummaryResults({
      selectedTable: aggregateTable
    }))

    dispatch(drawQQPlot(phenotype));
    dispatch(drawQQPlotPlotly(phenotype));
    dispatch(
      updateSummaryResults({
        manhattanPlotView: 'summary',
        selectedChromosome: null,
        nlogpMin: null,
        nlogpMax: null,
        bpMin: null,
        bpMax: null,
        results: [],
        resultsCount: null,
      })
    );
    dispatch(
      drawManhattanPlot('summary', {
        database: phenotype + '.db',
        table: aggregateTable,
        nlogpMin: 3,
      })
    );
    dispatch(
      updateSummaryResultsTable({
        database: phenotype + '.db',
        table: Array.isArray(variantTable) ? variantTable[0] : variantTable,
        gender: manhattanPlotType,
        offset: (page - 1) * pageSize,
        limit: pageSize,
        columns: ['chr', 'bp', 'snp', 'a1', 'a2', 'or', 'p'],
        orderBy: 'p',
        order: 'asc',
      }, true)
    );
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
        results: [],
        resultsCount: 0,
        page: 1,
        pageSize: 10,
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
  };

  const onAllChromosomeSelected = () => {
    handleSubmit(selectedPhenotype, selectedManhattanPlotType)
  }

  const onChromosomeSelected = chr => {
    const database = selectedPhenotype.value + '.db';
    const page = 1;
    const pageSize = 10;
    const range = ranges.find(r => r.chr === chr);
    const bpRange = {
      bpMin: range.bp_min,
      bpMax: range.bp_max,
    };

    const table = {
      all: 'variant_all',
      stacked: ['variant_male', 'variant_female'],
      female: 'variant_female',
      male: 'variant_male',
    }[selectedManhattanPlotType];

    console.log('selected table', table);

    dispatch(
      updateSummaryResults({
        manhattanPlotView: 'variants',
        selectedChromosome: chr,
        table,
        page,
        pageSize,
        nlogpMin: 2,
        nlogpMax: null,
        ...bpRange,
      })
    );

    dispatch(
      drawManhattanPlot('variants', {
        database,
        table,
        chr,
        nlogpMin: 2,
        ...bpRange,
        columns: ['variant_id', 'chr', 'bp', 'nlog_p']
      })
    );

    dispatch(
      updateSummaryResultsTable({
        database,
        table,
        chr,
        ...bpRange,
        offset: (page - 1) * pageSize,
        limit: pageSize,
        orderBy: 'p',
        order: 'asc',
        nlogpMin: 2,
        count: true,
      })
    );
  };

  const handleZoom = ({ bounds }) => {
    const database = selectedPhenotype.value + '.db';
    const chr = selectedChromosome;
    const page = 1;
    const pageSize = 10;

    const table = {
      all: 'variant_all',
      stacked: ['variant_male', 'variant_female'],
      female: 'variant_female',
      male: 'variant_male',
    }[selectedManhattanPlotType];

    let params = {
      bpMin: bounds.xMin,
      bpMax: bounds.xMax,
      nlogpMin: bounds.yMin,
      nlogpMax: bounds.yMax,
    };

    dispatch(
      updateSummaryResults({
        page,
        pageSize,
        ...params,
      })
    );

    dispatch(
      updateSummaryResultsTable({
        database,
        table,
        chr,
        offset: (page - 1) * pageSize,
        limit: pageSize,
        orderBy: 'p',
        order: 'asc',
        count: true,
        ...params
      })
    );
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

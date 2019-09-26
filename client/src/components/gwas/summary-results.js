import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Alert, Nav, Tab, Tabs, Card } from 'react-bootstrap';
import { SearchFormTrait } from '../forms/search-form-trait';
import { ManhattanPlot } from '../plots/manhattan-plot';
import { QQPlot } from '../plots/qq-plot';
import { SummaryResultsTable } from './summary-results-table';
import {
  updateSummaryResults,
  updateVariantLookup,
  lookupVariants,
  drawQQPlot,
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
    selectedManhattanPlotType
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

  const handleSubmit = params => {
    const phenotype = params ? params.value : null;
    
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

    setSubmitted(new Date());
    setSelectedChromosome(null);
    setPopupTooltipData(null);

    dispatch(drawQQPlot(phenotype));
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
        nlogpMin: 3,
      })
    );
    dispatch(
      updateSummaryResultsTable({
        database: phenotype + '.db',
        offset: (page - 1) * pageSize,
        limit: pageSize,
        columns: ['chr', 'bp', 'snp', 'a1', 'a2', 'or', 'p'],
        count: true,
        orderBy: 'p',
        order: 'asc',
      })
    );
  };

  const handleReset = params => {
    dispatch(
      updateSummaryResults({
        selectedListType: 'categorical',
        selectedPhenotype: null,
        selectedChromosome: null,
        selectedPlot: 'manhattan-plot',
        selectedManhattanPlotType: 'aggregate',
        manhattanPlotData: {},
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
        drawManhattanPlot: null,
        updateResultsTable: null,
        popupTooltipData: null
      })
    );
  };

  const onAllChromosomeSelected = () => {
    handleSubmit(selectedPhenotype)
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

    dispatch(
      updateSummaryResults({
        manhattanPlotView: 'variants',
        selectedChromosome: chr,
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
        chr,
        nlogpMin: 2,
        ...bpRange,
        columns: ['variant_id', 'chr', 'bp', 'nlog_p']
      })
    );

    dispatch(
      updateSummaryResultsTable({
        database,
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

  return (
    <>
      <SearchFormTrait onSubmit={handleSubmit} onChange={handleChange} onReset={handleReset} />
      {messages &&
        messages.map(({ type, content }) => (
          <Alert variant={type} onClose={clearMessages} dismissible>
            {content}
          </Alert>
        ))}

      <Tabs defaultActiveKey={selectedPlot} onSelect={setSelectedPlot}>
        <Tab
          eventKey="manhattan-plot"
          title="Manhattan Plot"
          className="p-2 bg-white tab-pane-bordered" style={{minHeight: '50vh'}}>
          <ManhattanPlot
            onChromosomeSelected={onChromosomeSelected}
            onAllChromosomeSelected={onAllChromosomeSelected}
            onVariantLookup={handleVariantLookup}
            onZoom={handleZoom}
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
          className="p-2 bg-white tab-pane-bordered" style={{minHeight: '50vh'}}>
          <div
            className="mw-100 my-4"
            style={{ display: submitted ? 'block' : 'none' }}>
            <QQPlot onVariantLookup={handleVariantLookup} />
          </div>
          {placeholder}
        </Tab>
      </Tabs>
    </>
  );
}

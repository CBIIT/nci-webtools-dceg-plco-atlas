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
    pageSize
  } = useSelector(state => state.summaryResults);

  const setSubmitted = submitted => {
    dispatch(updateSummaryResults({ submitted }));
  };

  const setSelectedChromosome = selectedChromosome => {
    dispatch(updateSummaryResults({ selectedChromosome }));
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
    setSubmitted(null);
  };

  const handleSubmit = params => {
    const phenotype = params ? params.value : null;
    setSubmitted(new Date());
    setSelectedChromosome(null);

    if (!phenotype) {
      setMessages([
        {
          type: 'danger',
          content:
            'Please select a phenotype which has data associated with it.'
        }
      ]);
      console.log('not selected');
      return;
    }

    dispatch(
      updateSummaryResults({
        manhattanPlotView: 'summary',
        selectedChromosome: null
      })
    );
    dispatch(drawQQPlot(phenotype));
    dispatch(
      drawManhattanPlot('summary', {
        database: phenotype + '.db',
        nlogpMin: 3
      })
    );
    dispatch(
      updateSummaryResultsTable({
        database: phenotype + '.db',
        offset: (page - 1) * pageSize,
        limit: pageSize
      })
    );
  };

  const handleReset = params => {};

  const onChromosomeSelected = chr => {
    const database = selectedPhenotype.value + '.db';
    const range = ranges.find(r => r.chr === chr);
    const page = 1;
    const pageSize = 10;

    dispatch(
      updateSummaryResults({
        manhattanPlotView: 'variants',
        selectedChromosome: chr
      })
    );

    dispatch(
      drawManhattanPlot('variants', {
        database,
        chr,
        nlogpMin: 2,
        bpMin: range.bp_min,
        bpMax: range.bp_max
      })
    );

    dispatch(
      updateSummaryResults({
        selectedChromsome: chr,
        page,
        pageSize
      })
    );

    dispatch(
      updateSummaryResultsTable({
        database,
        chr,
        offset: (page - 1) * pageSize,
        limit: pageSize,
        orderBy: 'p',
        order: 'asc'
      })
    );
  };

  const handleZoom = ({ bounds }) => {
    const database = selectedPhenotype.value + '.db';
    const chr = selectedChromosome;
    const page = 1;
    const pageSize = 10;

    dispatch(
      updateSummaryResultsTable({
        database,
        chr,
        offset: (page - 1) * pageSize,
        limit: pageSize,
        bpMin: bounds.xMin,
        bpMax: bounds.xMax,
        nlogpMin: bounds.yMin,
        nlogpMax: bounds.yMax
      })
    );
  };

  const handleVariantLookup = ({ snp }) => {
    dispatch(
      updateVariantLookup({
        selectedPhenotypes: [selectedPhenotype],
        selectedVariant: snp
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
      <SearchFormTrait onSubmit={handleSubmit} onChange={handleChange} />
      {submitted &&
        messages.map(({ type, content }) => (
          <Alert variant={type} onClose={clearMessages} dismissible>
            {content}
          </Alert>
        ))}

      <Tabs defaultActiveKey={selectedPlot} onSelect={setSelectedPlot}>
        <Tab
          eventKey="manhattan-plot"
          title="Manhattan Plot"
          className="p-2 bg-white tab-pane-bordered">
          <ManhattanPlot
            onChromosomeSelected={onChromosomeSelected}
            onVariantLookup={handleVariantLookup}
            onZoom={handleZoom}
          />
          <div
            className="mw-100 my-4"
            style={{ display: submitted ? 'block' : 'none' }}>
            <SummaryResultsTable />
          </div>
          {placeholder}
        </Tab>
        <Tab
          eventKey="qq-plot"
          title="Q-Q Plot"
          className="p-2 bg-white tab-pane-bordered">
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

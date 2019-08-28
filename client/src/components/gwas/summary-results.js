import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Alert, Nav, Tab } from 'react-bootstrap';
import { SearchFormTrait } from '../forms/search-form-trait';
import { ManhattanPlot } from '../plots/manhattan-plot';
import { QQPlot } from '../plots/qq-plot';
import { SummaryResultsTable } from './summary-results-table';
import {
  updateSummaryResults,
  updateVariantLookup,
  lookupVariants
} from '../../services/actions';

export function SummaryResults() {
  const dispatch = useDispatch();
  const {
    selectedPhenotype,
    selectedPlot,
    submitted,
    messages,
    drawManhattanPlot,
    drawQQPlot,
    updateResultsTable,
    page,
    pageSize,
  } = useSelector(state => state.summaryResults);

  const setSubmitted = submitted => {
    dispatch(updateSummaryResults({ submitted }));
  };

  // registers a function we can use to draw the manhattan plot
  const setDrawManhattanPlot = drawManhattanPlot => {
    dispatch(updateSummaryResults({ drawManhattanPlot }));
  };

  // registers a function we can use to draw the qq plot
  const setDrawQQPlot = drawQQPlot => {
    dispatch(updateSummaryResults({ drawQQPlot }));
  };

  const setUpdateResultsTable = updateResultsTable => {
    dispatch(updateSummaryResults({ updateResultsTable }));
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
    setSubmitted(new Date());
    setSelectedChromosome(null);
    console.log(params);

    if (!params || !params.value) {
      setMessages([{
        type: 'danger',
        content: 'Please select a phenotype which has data associated with it.'
      }]);
      return;
    }

    if (drawManhattanPlot) drawManhattanPlot(params.value);

    if (drawQQPlot) drawQQPlot(params.value);

    if (updateResultsTable)
      updateResultsTable({page, pageSize, database: params.value + '.db'});
  }

  const handleChromosomeChanged = chromosome => {
    if (updateResultsTable) {
      updateResultsTable({
        page: 1,
        pageSize: 10,
        database: selectedPhenotype.value + '.db',
        chr: chromosome,
        orderBy: 'p',
        order: 'asc',
      })
    }
  }

  const handleZoom = zoomParams => {
    updateResultsTable({
      page: 1,
      pageSize: 10,
      ...zoomParams,
    })
    console.log('zoomed', zoomParams);
  }

  const handleVariantLookup = ({snp}) => {
    dispatch(updateVariantLookup({
      selectedPhenotypes: [selectedPhenotype],
      selectedVariant: snp,
    }));
    dispatch(lookupVariants([selectedPhenotype], snp));
  };

  return (
    <>
      <div className="card shadow-sm mb-4">
        <div className="card-body">
          <SearchFormTrait onSubmit={handleSubmit} onChange={handleChange} />
          {submitted &&
            messages.map(({ type, content }) => (
              <Alert variant={type} onClose={clearMessages} dismissible>
                {content}
              </Alert>
            ))}
        </div>
      </div>

      <div className="card shadow-sm mb-4">
        <Tab.Container defaultActiveKey={selectedPlot} onSelect={setSelectedPlot}>
          <div className="card-header bg-white font-weight-bolder border-bottom-0">
            <Nav variant="pills" className="nav-pills-custom">
              <Nav.Item className="mr-2">
                <Nav.Link eventKey="manhattan-plot">Manhattan Plots</Nav.Link>
              </Nav.Item>

              <Nav.Item>
                <Nav.Link eventKey="qq-plot">Q-Q Plot</Nav.Link>
              </Nav.Item>
            </Nav>
          </div>

          <div className="card-body">
            <Tab.Content>
              <Tab.Pane eventKey="manhattan-plot">
                <div>
                  <label class="mr-3">
                    <input
                      type="radio"
                      name="plot-type"
                      value="combined"
                      defaultChecked
                    />
                    Combined
                  </label>
                  <label class="mr-3">
                    <input type="radio" name="plot-type" value="mirrored" />
                    Mirrored
                  </label>
                  <label class="mr-3">
                    <input type="radio" name="plot-type" value="male" />
                    Male
                  </label>
                  <label class="mr-3">
                    <input type="radio" name="plot-type" value="female" />
                    Female
                  </label>
                </div>
                  <ManhattanPlot
                    drawFunctionRef={setDrawManhattanPlot}
                    onChromosomeChanged={handleChromosomeChanged}
                    onVariantLookup={handleVariantLookup}
                    onZoom={handleZoom} />
                    <div className="my-4" style={{display: submitted ? 'block' : 'none'}}>
                      <SummaryResultsTable
                        className="mw-100"
                        updateFunctionRef={setUpdateResultsTable} />
                    </div>
              </Tab.Pane>

              <Tab.Pane eventKey="qq-plot">
                <QQPlot
                  drawFunctionRef={setDrawQQPlot}
                  onVariantLookup={handleVariantLookup}
                />
              </Tab.Pane>
            </Tab.Content>
          </div>
        </Tab.Container>
      </div>
    </>
  );
}

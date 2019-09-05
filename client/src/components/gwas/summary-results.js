import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Alert, Nav, Tab, Card } from 'react-bootstrap';
import { SearchFormTrait } from '../forms/search-form-trait';
import { ManhattanPlot } from '../plots/manhattan-plot';
import { QQPlot } from '../plots/qq-plot';
import { SummaryResultsTable } from './summary-results-table';
import {
  updateSummaryResults,
  updateVariantLookup,
  lookupVariants,
  drawQQPlot,
} from '../../services/actions';

export function SummaryResults() {
  const dispatch = useDispatch();
  const {
    selectedPhenotype,
    selectedPlot,
    submitted,
    messages,
    drawManhattanPlot,
    updateResultsTable,
    page,
    pageSize,
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
    setSubmitted(new Date());
    setSelectedChromosome(null);
    if (!params || !params.value) {
      setMessages([{
        type: 'danger',
        content: 'Please select a phenotype which has data associated with it.'
      }]);
      return;
    }

    dispatch(drawManhattanPlot(params.value));
    dispatch(drawQQPlot(params.value));
    dispatch(updateResultsTable({page, pageSize, database: params.value + '.db'}));
  }

  const onChromosomeSelected = chromosome => {
      dispatch(updateResultsTable({
        page: 1,
        pageSize: 10,
        database: selectedPhenotype.value + '.db',
        chr: chromosome,
        orderBy: 'p',
        order: 'asc',
      }));
  }

  const handleZoom = zoomParams => {
    console.log('zoomed', zoomParams);
    dispatch(updateResultsTable({
      page: 1,
      pageSize: 10,
      ...zoomParams,
    }));
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
      <Card className="mb-4 border-0">
        <Card.Body>
          <SearchFormTrait onSubmit={handleSubmit} onChange={handleChange} />
          {submitted &&
            messages.map(({ type, content }) => (
              <Alert variant={type} onClose={clearMessages} dismissible>
                {content}
              </Alert>
            ))}
        </Card.Body>
      </Card>

      <Card className="mb-4 border-left-0 border-right-0 border-bottom-0 rounded-0">
        <Tab.Container defaultActiveKey={selectedPlot} onSelect={setSelectedPlot}>
          <Card.Header className="font-weight-bolder">
            <Nav variant="tabs" className="nav-pills-custom nav-justified px-2">
              <Nav.Item>
                <Nav.Link eventKey="manhattan-plot">Manhattan Plots</Nav.Link>
              </Nav.Item>

              <Nav.Item>
                <Nav.Link eventKey="qq-plot">Q-Q Plot</Nav.Link>
              </Nav.Item>
            </Nav>
          </Card.Header>

          <Card.Body>
            <Tab.Content>
              <Tab.Pane eventKey="manhattan-plot">
                  <ManhattanPlot
                    onChromosomeSelected={onChromosomeSelected}
                    onVariantLookup={handleVariantLookup}
                    onZoom={handleZoom} />
                    <div className="my-4" style={{display: submitted ? 'block' : 'none'}}>
                      <SummaryResultsTable className="mw-100" />
                    </div>
              </Tab.Pane>

              <Tab.Pane eventKey="qq-plot">
                <QQPlot onVariantLookup={handleVariantLookup} />
              </Tab.Pane>
            </Tab.Content>
          </Card.Body>
        </Tab.Container>
      </Card>
    </>
  );
}

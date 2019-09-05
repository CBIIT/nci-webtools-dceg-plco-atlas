import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { Alert, Nav, Tab, Tabs } from "react-bootstrap";
import { SearchFormTrait } from "../forms/search-form-trait";
import { ManhattanPlot } from "../plots/manhattan-plot";
import { QQPlot } from "../plots/qq-plot";
import { SummaryResultsTable } from "./summary-results-table";
import {
  updateSummaryResults,
  updateVariantLookup,
  lookupVariants,
  drawQQPlot
} from "../../services/actions";

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
    setSubmitted(new Date());
    setSelectedChromosome(null);
    if (!params || !params.value) {
      setMessages([
        {
          type: "danger",
          content:
            "Please select a phenotype which has data associated with it."
        }
      ]);
      return;
    }

    dispatch(drawManhattanPlot(params.value));
    dispatch(drawQQPlot(params.value));
    dispatch(
      updateResultsTable({ page, pageSize, database: params.value + ".db" })
    );
  };

  const onChromosomeSelected = chromosome => {
    dispatch(
      updateResultsTable({
        page: 1,
        pageSize: 10,
        database: selectedPhenotype.value + ".db",
        chr: chromosome,
        orderBy: "p",
        order: "asc"
      })
    );
  };

  const handleZoom = zoomParams => {
    console.log("zoomed", zoomParams);
    dispatch(
      updateResultsTable({
        page: 1,
        pageSize: 10,
        ...zoomParams
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

  return (
    <div>
      <SearchFormTrait onSubmit={handleSubmit} onChange={handleChange} />
      {submitted &&
        messages.map(({ type, content }) => (
          <Alert variant={type} onClose={clearMessages} dismissible>
            {content}
          </Alert>
        ))}

      <Tabs defaultActiveKey={selectedPlot} onSelect={setSelectedPlot}>
        <Tab eventKey="manhattan-plot" title="Manhattan Plot">
          <ManhattanPlot
            onChromosomeSelected={onChromosomeSelected}
            onVariantLookup={handleVariantLookup}
            onZoom={handleZoom}
          />
          <div
            className="my-4"
            style={{ display: submitted ? "block" : "none" }}
          >
            <SummaryResultsTable className="mw-100" />
          </div>
        </Tab>

        <Tab eventKey="qq-plot" title="Q-Q Plot">
          <QQPlot onVariantLookup={handleVariantLookup} />
        </Tab>
      </Tabs>
    </div>
  );
}

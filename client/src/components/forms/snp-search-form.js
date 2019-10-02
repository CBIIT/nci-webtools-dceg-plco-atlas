import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { updateSummaryResults } from "../../services/actions";
import { query } from "../../services/query";
import { Table } from "../controls/table";

export const SnpSearchForm = () => {
  const dispatch = useDispatch();
  const {
    snp,
    snpResults,
    showSnpResults,
    selectedPhenotype,
    selectedChromosome,
    selectedManhattanPlotType
  } = useSelector(
    state => state.summaryResults
  );

  const columns = [
    {
      dataField: "chr",
      text: "Chromosome"
    },
    {
      dataField: "bp",
      text: "Position"
    },
    {
      dataField: "snp",
      text: "SNP"
    },
    {
      dataField: "a1",
      text: "Reference Allele"
    },
    {
      dataField: "a2",
      text: "Alternate Allele"
    },
    {
      dataField: "or",
      text: "Odds Ratio"
    },
    {
      dataField: "p",
      text: "P-Value"
    }
  ];

  const setSnp = snp => {
    dispatch(updateSummaryResults({ snp }));
  };

  const handleSnpLookup = async () => {
    if (!snp) return;
    const table = {
      all: 'variant_all',
      stacked: 'variant_all',
      female: 'variant_female',
      male: 'variant_male',
    }[selectedManhattanPlotType];

    const { data } = await query('variants', {
      database: selectedPhenotype.value + '.db',
      table: table,
      snp: snp,
    })
    dispatch(
      updateSummaryResults({
        snpResults: data,
        showSnpResults: true
      })
    );
  };

  const handleSnpReset = () => {
    dispatch(
      updateSummaryResults({
        snp: '',
        snpResults: [],
        showSnpResults: false
      })
    );
  };

  return (
    <div>
      <div className="d-flex mb-5">
        <input
          type="text"
          className="form-control"
          placeholder="Search for a SNP"
          value={snp}
          onChange={e => setSnp(e.target.value)}
        />
        <button
          className="btn btn-silver flex-shrink-auto mx-2"
          onClick={handleSnpLookup}
        >
          Search
        </button>
        <button
          className="btn btn-silver flex-shrink-auto"
          onClick={handleSnpReset}
        >
          Reset
        </button>
      </div>

      {showSnpResults && (
        <Table keyField="variant_id" data={snpResults} columns={columns} />
      )}
    </div>
  );
};
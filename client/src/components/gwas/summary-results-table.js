import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  updateSummaryResults,
  updateSummaryTable,
  fetchSummaryTable
} from "../../services/actions";
import { query } from "../../services/query";
import {
  Table,
  paginationText,
  paginationSizeSelector,
  paginationButton,
  loadingOverlay
} from "../controls/table";
import paginationFactory from "react-bootstrap-table2-paginator";

export function SummaryResultsTable() {
  const dispatch = useDispatch();
  const summaryTables = useSelector(state => state.summaryTables);
  const {
    loading,
    selectedPhenotype,
    selectedChromosome,
    selectedTable,
    selectedManhattanPlotType,
    nlogpMin,
    nlogpMax,
    bpMin,
    bpMax
  } = useSelector(state => state.summaryResults);

  const columns = [
    {
      dataField: "chr",
      text: "Chromosome",
      sort: true
    },
    {
      dataField: "bp",
      text: "Position",
      sort: true
    },
    {
      dataField: "snp",
      text: "SNP",
      sort: true
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
      text: "P-Value",
      sort: true
    }
  ];

  const handleTableChange = async (
    type,
    { page, sizePerPage: limit, sortField: orderBy, sortOrder: order },
    index
  ) => {
    if (!selectedPhenotype || !selectedPhenotype.value) return;

    console.log({ order, orderBy, limit, page, bpMin, bpMax });


    dispatch(
      fetchSummaryTable({
        database: selectedPhenotype.value + ".db",
        offset: limit * (page - 1),
        table: selectedTable,
        chr: selectedChromosome,
        count: true,
        limit,
        orderBy,
        order,
        nlogpMin,
        nlogpMax,
        bpMin,
        bpMax
      }, null, index)
    );

  };

  return (
    <div>
      {summaryTables.map(({ results, resultsCount, page, pageSize }, index) => {
        if (index > 0 && selectedManhattanPlotType != 'stacked') return null;
        return (
          <Table
            remote
            keyField="variant_id"
            loading={loading}
            data={results}
            columns={columns}
            onTableChange={(type, ev) => handleTableChange(type, ev, index)}
            overlay={loadingOverlay}
            pagination={paginationFactory({
              page,
              sizePerPage: pageSize,
              totalSize: resultsCount,
              showTotal: results.length > 0,
              sizePerPageList: [10, 25, 50, 100],
              paginationTotalRenderer: paginationText,
              sizePerPageRenderer: paginationSizeSelector,
              pageButtonRenderer: paginationButton
            })}
            defaultSorted={[{ dataField: "p", order: "asc" }]}
          />
        );
      })}
    </div>
  );
}

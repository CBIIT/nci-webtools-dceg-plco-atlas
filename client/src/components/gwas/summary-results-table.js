import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { updateSummaryResults, updateSummaryResultsTable } from '../../services/actions';
import { query } from '../../services/query';
import { Table, paginationText, paginationSizeSelector, paginationButton, loadingOverlay } from '../controls/table';
import paginationFactory from 'react-bootstrap-table2-paginator';

export function SummaryResultsTable() {
  const dispatch = useDispatch();
  const {
    loadingManhattanTable,
    selectedPhenotype,
    selectedChromosome,
    selectedTable,
    results,
    resultsCount,
    page,
    pageSize,
    nlogpMin,
    nlogpMax,
    bpMin,
    bpMax,
  } = useSelector(state => state.summaryResults);

  const columns = [
    {
      dataField: 'chr',
      text: 'Chromosome',
      sort: true
    },
    {
      dataField: 'bp',
      text: 'Position',
      sort: true
    },
    {
      dataField: 'snp',
      text: 'SNP',
      sort: true
    },
    {
      dataField: 'a1',
      text: 'Reference Allele'
    },
    {
      dataField: 'a2',
      text: 'Alternate Allele'
    },
    {
      dataField: 'or',
      text: 'Odds Ratio'
    },
    {
      dataField: 'p',
      text: 'P-Value',
      sort: true
    }
  ];

  const handleTableChange = async (
    type,
    { page, sizePerPage: limit, sortField: orderBy, sortOrder: order }
  ) => {
    if (!selectedPhenotype || !selectedPhenotype.value)
      return;

    console.log({order, orderBy, limit, page, bpMin, bpMax})

    dispatch(updateSummaryResultsTable({
      database: selectedPhenotype.value + '.db',
      offset: limit * (page - 1),
      table: selectedTable,
      chr: selectedChromosome,
      limit,
      orderBy,
      order,
      nlogpMin,
      nlogpMax,
      bpMin,
      bpMax,
    }));

    dispatch(updateSummaryResults({pageSize: limit, page}));
  };

  return (
    <Table
      remote
      keyField="variant_id"
      loading={loadingManhattanTable}
      data={results}
      columns={columns}
      onTableChange={handleTableChange}
      overlay={loadingOverlay}
      pagination={paginationFactory({
        page,
        sizePerPage: pageSize,
        totalSize: resultsCount,
        showTotal: results.length > 0,
        sizePerPageList: [10, 25, 50, 100],
        paginationTotalRenderer: paginationText,
        sizePerPageRenderer: paginationSizeSelector,
        pageButtonRenderer: paginationButton,
      })}
      defaultSorted={[
        {dataField: 'p', order: 'asc'}
      ]}
    />
  );
}

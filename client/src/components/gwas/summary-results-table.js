import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { updateSummaryResults } from '../../services/actions';
import { query } from '../../services/query';
import { Table } from '../controls/table';
import paginationFactory from 'react-bootstrap-table2-paginator';

export function SummaryResultsTable({ updateFunctionRef }) {
  const dispatch = useDispatch();
  const {
    selectedPhenotype,
    selectedChromosome,
    results,
    resultsCount,
    page,
    pageSize
  } = useSelector(state => state.summaryResults);
  const [currentParams, setCurrentParams] = useState({
    bpMin: undefined,
    bpMax: undefined,
    nlogpMin: undefined,
    nlogpMax: undefined,
    orderBy: 'p',
    order: 'asc'
  });

  const updateResults = results => {
    dispatch(updateSummaryResults({ results }));
  };

  const updateResultsCount = resultsCount => {
    dispatch(updateSummaryResults({ resultsCount }));
  };

  const updatePage = page => {
    dispatch(updateSummaryResults({ page }));
  };

  const updatePageSize = pageSize => {
    dispatch(updateSummaryResults({ pageSize }));
  };

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

  const updateTable = async params => {
    console.log('called update', params);
    const { page, pageSize } = params;
    params.offset = (page - 1) * pageSize;
    params.limit = pageSize;
    const response = await query('variants-paginated', params);
    setCurrentParams({
      ...currentParams,
      bpMin: undefined,
      bpMax: undefined,
      nlogpMin: undefined,
      nlogpMax: undefined,
      ...params
    });
    updatePage(page);
    updatePageSize(pageSize);
    updateResults(response);
    updateResultsCount(70000000);
  };

  const handleTableChange = async (
    type,
    { page, sizePerPage, sortField, sortOrder }
  ) => {
    if (!selectedPhenotype || !selectedPhenotype.value)
      return;

    updateTable({
      ...currentParams,
      page,
      pageSize: sizePerPage,
      database: selectedPhenotype.value + '.db',
      chr: selectedChromosome,
      orderBy: sortField,
      order: sortOrder
    });
  };

  useEffect(() => {
    if (updateFunctionRef) updateFunctionRef(updateTable);
  }, [updateFunctionRef, updateTable]);

  return (
    <Table
      remote
      keyField="variant_id"
      data={results}
      columns={columns}
      onTableChange={handleTableChange}
      pagination={paginationFactory({
        page,
        sizePerPage: pageSize,
        totalSize: resultsCount
      })}
      defaultSorted={[
        {dataField: 'p', order: 'asc'}
      ]}
    />
  );
}

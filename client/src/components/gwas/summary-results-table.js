import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  updateKey,
  updateSummarySnp,
  fetchSummaryTable,
  fetchSummarySnpTable,
} from '../../services/actions';
import { Icon } from '../controls/icon';
import { query } from '../../services/query';
import { getInitialState } from '../../services/store';
import {
  Table,
  paginationText,
  paginationSizeSelector,
  paginationButton,
  loadingOverlay
} from '../controls/table';
import paginationFactory from 'react-bootstrap-table2-paginator';

export function SummaryResultsTable() {
  const dispatch = useDispatch();
  const summaryTables = useSelector(state => state.summaryTables);
  const summarySnpTables = useSelector(state => state.summarySnpTables);
  const {
    selectedPhenotype,
    selectedChromosome,
    selectedTable,
    selectedManhattanPlotType,
    nlogpMin,
    nlogpMax,
    bpMin,
    bpMax,
    snp,
  } = useSelector(state => state.summaryResults);

  let [gender, setGender] = useState('female');

  const defaultSorted = [{
    dataField: 'p',
    order: 'asc'
  }];

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
    key,
    type,
    { page, sizePerPage: limit, sortField: orderBy, sortOrder: order },
  ) => {
    if (!selectedPhenotype || !selectedPhenotype.value) return;
    // console.log({ order, orderBy, limit, page, bpMin, bpMax });

    // run a count query against the results only if results have been filtered
    let shouldCount = !!(nlogpMin || nlogpMax || bpMin || bpMax);

    // otherwise, determine the metadata key we should use to retrieve aggregate counts
    let countKey = selectedChromosome
        ? `count_${key}_${selectedChromosome}`
        : `count_${key}`;

    let table = Array.isArray(selectedTable)
      ? selectedTable.find(e => e.includes(`_${gender}`))
      : selectedTable

    dispatch(
      fetchSummaryTable(key, {
          database: selectedPhenotype.value + '.db',
          offset: limit * (page - 1),
          table: table,
          chr: selectedChromosome,
          count: shouldCount,
          key: shouldCount ? null : countKey,
          limit,
          orderBy,
          order,
          nlogpMin,
          nlogpMax,
          bpMin,
          bpMax
      })
    );
  };

  const setSnp = snp => {
    dispatch(updateSummarySnp('snp', snp));
  };

  const handleSnpLookup = async () => {
    if (!summarySnpTables.snp) return;
    dispatch(updateSummarySnp('visible', true));

    const storeKeys = {
      all: ['all'],
      stacked: ['female', 'male'],
      female: ['female'],
      male: ['male']
    }[selectedManhattanPlotType];

    const tables = {
      all: ['variant_all'],
      stacked: ['variant_female', 'variant_male'],
      female: ['variant_female'],
      male: ['variant_male']
    }[selectedManhattanPlotType];

    console.log('handling', storeKeys, tables);

    storeKeys.forEach((storeKey, tableIndex) => {
      dispatch(fetchSummarySnpTable(storeKey, {
        database: selectedPhenotype.value + '.db',
        table: tables[tableIndex],
        snp: summarySnpTables.snp
      }))
    })
  };

  const handleSnpReset = () => {
    const {summarySnpTables} = getInitialState();
    dispatch(
      updateKey('summarySnpTables', summarySnpTables)
    );
  };

  const getVariantTableProps = (key) => ({
    remote: true,
    keyField: 'variant_id',
    loading: summaryTables.loading,
    data: summaryTables[key].results,
    columns: columns,
    onTableChange: (type, ev) => handleTableChange(key, type, ev),
    overlay: loadingOverlay,
    defaultSorted,
    pagination: paginationFactory({
      page: summaryTables[key].page,
      sizePerPage: summaryTables[key].pageSize,
      totalSize: summaryTables[key].resultsCount,
      showTotal: summaryTables[key].results.length > 0,
      sizePerPageList: [10, 25, 50, 100],
      paginationTotalRenderer: paginationText,
      sizePerPageRenderer: paginationSizeSelector,
      pageButtonRenderer: paginationButton
    })
  });

  return (
    <div className="mt-3">

      <div className="d-flex align-items-center justify-content-between">
        <div className="d-flex align-items-center">
          {selectedManhattanPlotType === 'stacked' &&
            <div class="btn-group" role="group">
              <button
                className={`btn btn-sm ${gender === 'female' ? 'btn-primary btn-primary-gradient active' : 'btn-silver'}`}
                onClick={e => setGender('female')}>
                Female
              </button>
              <button
                className={`btn btn-sm ${gender === 'male' ? 'btn-primary btn-primary-gradient active' : 'btn-silver'}`}
                onClick={e => setGender('male')}>
                Male
              </button>
            </div>}
        </div>

        <div className="d-flex mb-2">
          <input
            style={{ maxWidth: '400px' }}
            className="form-control form-control-sm"
            placeholder="Search for a SNP"
            value={summarySnpTables.snp}
            onChange={e => setSnp(e.target.value)}
          />
          <button
            className="btn btn-sm btn-silver flex-shrink-auto d-flex"
            onClick={handleSnpReset}>
            <Icon className="opacity-50" name="times" width="12" />
            <span className="sr-only">Clear</span>
          </button>
          <button
            className="btn btn-sm btn-silver flex-shrink-auto mx-2"
            onClick={handleSnpLookup}>
            Search
          </button>
        </div>
      </div>

      {!summarySnpTables.visible && <>
        {/^(all|male|female)$/.test(selectedManhattanPlotType) &&
          <Table {...getVariantTableProps(selectedManhattanPlotType)} />}

        {/^stacked$/.test(selectedManhattanPlotType) &&
          <Table {...getVariantTableProps(gender)} />}
      </>}

      {summarySnpTables.visible && <>
        {/^(all|male|female)$/.test(selectedManhattanPlotType) &&
          <Table
            keyField="variant_id"
            data={summarySnpTables[selectedManhattanPlotType].results}
            columns={columns} />}

        {/^stacked$/.test(selectedManhattanPlotType) &&
          <Table
            keyField="variant_id"
            data={summarySnpTables[gender].results}
            columns={columns} />}

      </>}
    </div>
  );
}

import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  updateKey,
  updateSummarySnp,
  fetchSummaryTable,
  fetchSummarySnpTable,
} from '../../../../services/actions';
import { Icon } from '../../../controls/icon';
import { query } from '../../../../services/query';
import { getInitialState } from '../../../../services/store';
import {
  Table,
  paginationText,
  paginationSizeSelector,
  paginationButton,
  loadingOverlay
} from '../../../controls/table/table';
import paginationFactory from 'react-bootstrap-table2-paginator';

export function SummaryResultsTable() {
  const dispatch = useDispatch();
  const summaryTables = useSelector(state => state.summaryTables);
  const summarySnpTables = useSelector(state => state.summarySnpTables);
  const {
    selectedPhenotype,
    selectedChromosome,
    selectedSex,
    nlogpMin,
    nlogpMax,
    bpMin,
    bpMax,
    snp,
  } = useSelector(state => state.summaryResults);

  let [sex, setSex] = useState('female');

  const defaultSorted = [{
    dataField: 'p',
    order: 'asc'
  }];

  const columns = [
    {
      dataField: 'chromosome',
      text: 'Chromosome',
      sort: true
    },
    {
      dataField: 'position',
      text: 'Position',
      sort: true
    },
    {
      dataField: 'snp',
      text: 'SNP',
      sort: true
    },
    {
      dataField: 'allele_reference',
      text: 'Reference Allele'
    },
    {
      dataField: 'allele_alternate',
      text: 'Alternate Allele'
    },
    {
      dataField: 'odds_ratio',
      text: 'Odds Ratio'
    },
    {
      dataField: 'p_value',
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
    // let countKey = selectedChromosome
    //     ? `count_${key}_${selectedChromosome}`
    //     : `count_${key}`;

    console.log('counts', {...summaryTables[key]})

    dispatch(
      fetchSummaryTable(key, {
          offset: limit * (page - 1),
          phenotype_id: selectedPhenotype.id,
          sex: selectedSex == 'stacked' ? sex : selectedSex,
          chromosome: selectedChromosome,
          count: shouldCount,
          // key: shouldCount ? null : countKey,
          limit,
          orderBy,
          order,
          p_value_nlog_min: nlogpMin,
          p_value_nlog_max: nlogpMax,
          position_min: bpMin,
          position_max: bpMax
        },
        shouldCount ? {} : {resultsCount: summaryTables[key].resultsCount}
      )
    );
  };

  const setSnp = snp => {
    dispatch(updateSummarySnp('snp', snp));
  };

  const handleSnpLookup = async () => {
    if (!summarySnpTables.snp) return;
    dispatch(updateSummarySnp('visible', true));

    const sexs = {
      all: ['all'],
      stacked: ['female', 'male'],
      female: ['female'],
      male: ['male']
    }[selectedSex];

    sexs.forEach(sex => {
      dispatch(fetchSummarySnpTable(sex, {
        phenotype_id: selectedPhenotype.id,
        snp: summarySnpTables.snp,
        sex: sex,
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
    keyField: 'id',
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
          {selectedSex === 'stacked' &&
            <div className="btn-group" role="group">
              <button
                className={`btn btn-sm ${sex === 'female' ? 'btn-primary btn-primary-gradient active' : 'btn-silver'}`}
                onClick={e => setSex('female')}>
                Female
              </button>
              <button
                className={`btn btn-sm ${sex === 'male' ? 'btn-primary btn-primary-gradient active' : 'btn-silver'}`}
                onClick={e => setSex('male')}>
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
        {/^(all|male|female)$/.test(selectedSex) &&
          <Table {...getVariantTableProps(selectedSex)} />}

        {/^stacked$/.test(selectedSex) &&
          <Table {...getVariantTableProps(sex)} />}
      </>}

      {summarySnpTables.visible && <>
        {/^(all|male|female)$/.test(selectedSex) &&
          <Table
            keyField="variant_id"
            data={summarySnpTables[selectedSex].results}
            columns={columns} />}

        {/^stacked$/.test(selectedSex) &&
          <Table
            keyField="variant_id"
            data={summarySnpTables[sex].results}
            columns={columns} />}

      </>}
    </div>
  );
}

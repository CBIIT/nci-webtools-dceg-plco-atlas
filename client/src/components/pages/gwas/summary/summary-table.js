import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  updateKey,
  updateSummaryTable,
  updateSummarySnp,
  fetchSummaryTable,
  fetchSummarySnpTable,
} from '../../../../services/actions';
import { Icon } from '../../../controls/icon/icon';
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
    selectedAncestry,
    selectedSex,
    selectedChromosome,
    nlogpMin,
    nlogpMax,
    bpMin,
    bpMax,
  } = useSelector(state => state.summaryResults);
  const stackedSex = useSelector(state => state.summaryTables.stackedSex);

  const defaultSorted = [{
    dataField: 'p_value',
    order: 'asc'
  }];

  const snpFormatter = (cell, row) => {
    if (cell.split(':')[0].substring(0,2) === 'rs') {
      return (
        <span>
          <a 
            href={'https://www.ncbi.nlm.nih.gov/snp/' + cell.split(':')[0]}
            target="_blank"
            style={{
              textDecoration: 'underline',
            }}>
            { cell }
          </a>
        </span>
      );
    } else {
      return (
        <span>{ cell }</span>
      );
    }
  }

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
      sort: true,
      formatter: snpFormatter
    },
    {
      dataField: 'allele_reference',
      text: 'Eff. Allele',
      headerTitle: _ => 'Effect Allele [Frequency]',
      formatter: (cell, row) => {
        return `${cell} [${row.allele_frequency}]`
      }
    },
    {
      dataField: 'allele_alternate',
      text: 'Non-Eff. Allele',
      headerTitle: _ => 'Non-Effect Allele [Frequency]',
      formatter: (cell, row) => {
        return `${cell} [${(1 - row.allele_frequency).toPrecision(4)}]`;
      }
    },
    selectedPhenotype && selectedPhenotype.type === 'continuous' && {
      dataField: 'beta',
      text: 'Beta'
    },
    selectedPhenotype && selectedPhenotype.type === 'binary' && {
      dataField: 'odds_ratio',
      text: 'OR [95% CI]',
      headerTitle: _ => 'Odds Ratio [95% Confidence Interval]',
      formatter: (cell, row, rowIndex) => {
        const isUndefined = value => !value || isNaN(value);
        if (isUndefined(cell)) return '-';
        return (+cell).toFixed(3) + (isUndefined(row.ci_95_low) || isUndefined(row.ci_95_high)
          ? ''
          : ` [${+row.ci_95_low.toFixed(3)} - ${+row.ci_95_high.toFixed(3)}]`);
      },
      headerStyle: {
        width: '200px'
      }
    },
    {
      dataField: 'p_value',
      text: 'P-Value',
      sort: true
    },
    {
      dataField: 'p_value_heterogenous',
      text: 'P-Value Het.',
      headerTitle: _ => 'P-Value Heterogenous',
    },
    {
      dataField: 'n',
      text: 'N',
      headerTitle: _ => 'Sample Size',
    },

  ].filter(Boolean);

  const updateSummaryTableData = (key, params) => {
    if (!selectedPhenotype || !selectedPhenotype.value) return;
    // console.log({ order, orderBy, limit, page, bpMin, bpMax });
    let hasRangeFilter = Boolean(nlogpMin && nlogpMax && bpMin && bpMax);
    let summaryParams = {
      phenotype_id: selectedPhenotype.id,
      sex: key,
      ancestry: selectedAncestry,
      chromosome: selectedChromosome,
      offset: 0,
      limit: 10,
      orderBy: 'p_value',
      order: 'asc',
      p_value_nlog_min: nlogpMin,
      p_value_nlog_max: nlogpMax,
      position_min: bpMin,
      position_max: bpMax,
      ...params
    };

    // determine if we should use regular counts (for small datasets) or metadata counts (large datasets)
    if (selectedChromosome && hasRangeFilter) {
      summaryParams.count = true;
    } else {
      summaryParams.metadataCount = true;
    }

    // console.log('summary table params', key, summaryParams)

    dispatch(fetchSummaryTable(key, summaryParams));
  }

  const handleTableChange = async (
    key,
    type,
    pagination,
  ) => {
    if (!selectedPhenotype || !selectedPhenotype.value) return;
    const { page, sizePerPage, sortField, sortOrder } = pagination;
    const cachedTable = summaryTables[key];
    const paginationParams = {
      offset: sizePerPage * (page - 1),
      limit: sizePerPage,
      orderBy: sortField,
      order: sortOrder,
    };

    // only update table data if cached parameters do not match 
    if (
      cachedTable.offset != paginationParams.offset ||
      cachedTable.limit != paginationParams.limit ||
      cachedTable.orderBy != paginationParams.orderBy ||
      cachedTable.order != paginationParams.order || 
      cachedTable.chromosome != selectedChromosome
    ) {
      updateSummaryTableData(key, paginationParams);
    }
  };

  const setSnp = snp => {
    dispatch(updateSummarySnp('snp', snp));
  };

  const handleSnpLookup = async () => {
    if (!summarySnpTables.snp) return;
    dispatch(updateSummarySnp('visible', true));

    const sexes = {
      all: ['all'],
      stacked: ['female', 'male'],
      female: ['female'],
      male: ['male']
    }[selectedSex];

    sexes.forEach(sex => {
      dispatch(fetchSummarySnpTable(sex, {
        phenotype_id: selectedPhenotype.id,
        snp: summarySnpTables.snp,
        sex: sex,
        ancestry: selectedAncestry,
      }))
    })
  };

  const updateStackedSex = (sex) => {
    // updating stacked sex
    dispatch(updateSummaryTable('stackedSex', sex));
  }

  const handleSnpReset = () => {
    const { summarySnpTables } = getInitialState();
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
      paginationTotalRenderer: paginationText('variant', 'variants'),
      sizePerPageRenderer: paginationSizeSelector,
      pageButtonRenderer: paginationButton
    })
  });



  return (
    <div className="mt-3">

      <div key="controls" className="d-flex align-items-center justify-content-between">
        <div className="d-flex align-items-center">
          {selectedSex === 'stacked' &&
            <div className="btn-group" role="group">
              <button
                className={`btn btn-sm ${stackedSex === 'female' ? 'btn-primary btn-primary-gradient active' : 'btn-silver'}`}
                onClick={e => updateStackedSex('female')}>
                Female
              </button>
              <button
                className={`btn btn-sm ${stackedSex === 'male' ? 'btn-primary btn-primary-gradient active' : 'btn-silver'}`}
                onClick={e => updateStackedSex('male')}>
                Male
              </button>
            </div>}
        </div>

        <div key="snpSearch" className="d-flex mb-2">
          <input
            style={{ maxWidth: '400px' }}
            className="form-control form-control-sm"
            placeholder="Search for a SNP"
            value={summarySnpTables.snp}
            onChange={e => setSnp(e.target.value)}
            aria-label="Filter SNP"
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
          <Table key={`single-variant-table${selectedSex}`} {...getVariantTableProps(selectedSex)} />}

        {/^stacked$/.test(selectedSex) &&
          <Table key={`stacked-variant-table${stackedSex}`} {...getVariantTableProps(stackedSex)} />}
      </>}

      {summarySnpTables.visible && <>
        {/^(all|male|female)$/.test(selectedSex) &&
          <Table
            key={`single-snp-table${selectedSex}`}
            keyField="variant_id"
            data={summarySnpTables[selectedSex].results}
            columns={columns} />}

        {/^stacked$/.test(selectedSex) &&
          <Table
            key={`stacked-snp-table${stackedSex}`}
            keyField="variant_id"
            data={summarySnpTables[stackedSex].results}
            columns={columns} />}

      </>}
    </div>
  );
}

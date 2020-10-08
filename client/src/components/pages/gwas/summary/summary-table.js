import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Overlay, OverlayTrigger, Tooltip } from 'react-bootstrap'
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
import { asTitleCase } from './utils';
import { asQueryString, query } from '../../../../services/query';

export function SummaryResultsTable() {
  const dispatch = useDispatch();
  const summaryTables = useSelector(state => state.summaryTables);
  const summarySnpTables = useSelector(state => state.summarySnpTables);
  const {
    selectedPhenotypes,
    selectedStratifications,
    selectedChromosome,
    isPairwise,
    nlogpMin,
    nlogpMax,
    bpMin,
    bpMax,
  } = useSelector(state => state.summaryResults);
  const selectedTable = useSelector(state => state.summaryTables.selectedTable);
  const setSelectedTable = selectedTable => dispatch(updateSummaryTable('selectedTable', selectedTable));
  const [exportRowLimit, setExportRowLimit] = useState(1e5);

  useEffect(() => {
    query('config', { key: 'exportRowLimit' })
      .then(({ exportRowLimit }) => setExportRowLimit(exportRowLimit))
  })

  const defaultSorted = [{
    dataField: 'p_value',
    order: 'asc'
  }];

  const columns = [
    {
      dataField: 'chromosome',
      text: 'Chr.',
      headerTitle: _ => 'Chromosome',
      sort: true,
      headerStyle: { width: '90px' },
    },
    {
      dataField: 'position',
      text: 'Pos.',
      headerTitle: _ => 'Position',
      sort: true
    },
    {
      dataField: 'snp',
      text: 'SNP',
      sort: true,
      formatter: cell => !/^rs\d+:/.test(cell) ?
        (!/^chr[\d+|x|X|y|Y]:\d+/.test(cell) ? cell :
          cell.split(':')[0] + ':' + cell.split(':')[1]) :
        <a href={`https://www.ncbi.nlm.nih.gov/snp/${cell.split(':')[0]}`} target="_blank">{cell.split(':')[0]}</a>,
      headerStyle: { width: '180px' },
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
    {
      dataField: 'beta',
      text: 'Beta'
    },
    {
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
      text: 'Assoc. P-Value',
      headerTitle: _ => 'Association P-Values',
      sort: true
    },
    {
      dataField: 'p_value_heterogenous',
      text: ' Het. P-Value',
      headerTitle: _ => 'Heterogenous P-Values',
    },
    {
      dataField: 'n',
      text: 'N',
      headerTitle: _ => 'Sample Size',
    },
  ].filter(Boolean);

  const updateSummaryTableData = (key, params) => {
    const phenotype = selectedPhenotypes[key] || selectedPhenotypes[0];
    const { ancestry, sex } = selectedStratifications[key] || selectedStratifications[0];
    if (!phenotype || !phenotype.value) return;
    // console.log({ order, orderBy, limit, page, bpMin, bpMax });
    let hasRangeFilter = Boolean(nlogpMin && nlogpMax && bpMin && bpMax);
    let summaryParams = {
      phenotype_id: phenotype.id,
      sex,
      ancestry,
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
    if (!selectedPhenotypes || !selectedPhenotypes.length) return;
    // console.log('handleTableChange', key, type, pagination);
    const { page, sizePerPage, sortField, sortOrder } = pagination;
    const cachedTable = summaryTables.tables[key];
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

    selectedStratifications.forEach((s, i) => {
      const phenotype = selectedPhenotypes[i] || selectedPhenotypes[0];
      dispatch(fetchSummarySnpTable(i, {
        phenotype_id: phenotype.id,
        snp: summarySnpTables.snp,
        ancestry: s.ancestry,
        sex: s.sex,
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

  const getExportLink = () => {
    if (!selectedStratifications.length || !selectedPhenotypes.length)
      return null;

    const phenotype = isPairwise && selectedPhenotypes[1]
      ? selectedPhenotypes[selectedTable]
      : selectedPhenotypes[0];

    const { sex, ancestry } = isPairwise
      ? selectedStratifications[selectedTable]
      : selectedStratifications[0]

    const exportParams = {
      phenotype_id: phenotype.id,
      sex,
      ancestry,
      chromosome: selectedChromosome,
      orderBy: 'p_value',
      order: 'asc',
      p_value_nlog_min: nlogpMin,
      p_value_nlog_max: nlogpMax,
      position_min: bpMin,
      position_max: bpMax,
    }

    return `${process.env.REACT_APP_API_ROOT}/export-variants${asQueryString(exportParams)}`;
  }

  const getVariantTableProps = (key) => ({
    remote: true,
    keyField: 'id',
    loading: summaryTables.loading,
    data: summaryTables.tables[key].results,
    columns: columns,
    onTableChange: (type, ev) => handleTableChange(key, type, ev),
    overlay: loadingOverlay,
    defaultSorted,
    pagination: paginationFactory({
      page: summaryTables.tables[key].page,
      sizePerPage: summaryTables.tables[key].pageSize,
      totalSize: summaryTables.tables[key].resultsCount,
      showTotal: summaryTables.tables[key].results.length > 0,
      sizePerPageList: [10, 25, 50, 100],
      paginationTotalRenderer: paginationText('variant', 'variants'),
      sizePerPageRenderer: paginationSizeSelector,
      pageButtonRenderer: paginationButton
    })
  });

  const showPhenotypeNames = isPairwise && selectedPhenotypes.length == 2;
  const aboveExportLimit = summaryTables.tables[selectedTable].resultsCount > exportRowLimit;

  return (
    <div className="mt-3">

      <div key="controls" className="d-flex align-items-center justify-content-between">
        <div className="d-flex align-items-center">
          {isPairwise && <div className="btn-group" role="group">
            {selectedStratifications.map((s, i) =>
              <button
                key={`select-table-${i}`}
                className={`btn btn-sm ${selectedTable == i ? 'btn-primary btn-primary-gradient active' : 'btn-silver'}`}
                onClick={e => setSelectedTable(i)}>
                {[
                  showPhenotypeNames && selectedPhenotypes[i].display_name,
                  asTitleCase(s.ancestry),
                  asTitleCase(s.sex),
                ].filter(Boolean).join(' - ')}
              </button>
            )}
          </div>}


          <OverlayTrigger
            overlay={!aboveExportLimit ? <span /> : <Tooltip id="submit-summary-results">
              Please select under {exportRowLimit} rows to export variants.
            </Tooltip>}>
            <span>
              <a
                disabled={aboveExportLimit}
                // target="_blank"
                className="btn btn-sm btn-silver flex-shrink-auto mx-2"
                href={getExportLink()}>
                Export
                </a>
            </span>
          </OverlayTrigger>
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

      {/* Do not filter beforehand, as that resets indexes  */}
      {selectedStratifications.map((s, i) =>
        selectedTable === i && (!summarySnpTables.visible
          ? <Table key={`variant-table-${i}`} {...getVariantTableProps(i)} />
          : <Table
            key={`snp-table-${i}`}
            keyField="variant_id"
            data={summarySnpTables.tables[i].results}
            columns={columns} />
        )
      )}
    </div>
  );
}

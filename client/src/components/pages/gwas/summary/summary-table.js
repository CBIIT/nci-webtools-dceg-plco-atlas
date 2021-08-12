import React, { useState, useEffect, useContext } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Overlay, OverlayTrigger, Tooltip } from 'react-bootstrap';
import {
  updateKey,
  updateSummaryTable,
  updateSummarySnp,
  fetchSummaryTable,
  fetchSummarySnpTable
} from '../../../../services/actions';
import { Icon } from '../../../controls/icon/icon';
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
import { RootContext } from '../../../..';

export function SummaryResultsTable() {
  const dispatch = useDispatch();
  const { getInitialState } = useContext(RootContext);
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
    exportRowLimit
  } = useSelector(state => state.summaryResults);
  const { downloadRoot } = useSelector(
    state => state.downloads
  );
  const selectedTable = useSelector(state => state.summaryTables.selectedTable);
  const setSelectedTable = selectedTable =>
    dispatch(updateSummaryTable('selectedTable', selectedTable));

  const columns = [
    {
      dataField: 'chromosome',
      text: 'Chr.',
      headerTitle: _ => 'Chromosome',
      title: true,
      sort: true,
      headerStyle: { width: '65px', minWidth: '65px' },
      headerClasses: 'overflow-ellipsis',
      classes: 'overflow-ellipsis',
      formatter: cell => cell == 23 ? 'X' : cell,
    },
    {
      dataField: 'position',
      text: 'Pos.',
      headerTitle: _ => 'Position',
      title: true,
      sort: true,
      headerStyle: { width: '100px' },
      headerClasses: 'overflow-ellipsis',
      classes: 'overflow-ellipsis'
    },
    {
      dataField: 'snp',
      text: 'SNP',
      sort: true,
      formatter: cell => !/^rs\d+/.test(cell) ? cell : <a
        className="overflow-ellipsis"
        href={`https://www.ncbi.nlm.nih.gov/snp/${cell}`}
        target="_blank">
        {cell}
      </a>,
      title: true,
      headerStyle: { width: '180px' },
      headerClasses: 'overflow-ellipsis',
      classes: 'overflow-ellipsis  text-nowrap'
    },
    {
      dataField: 'allele_effect',
      text: 'Eff. Allele [Freq.]',
      headerTitle: _ => 'Effect Allele [Frequency]',
      formatter: (cell, row) => `${cell} [${row.allele_effect_frequency.toPrecision(4)}]`,
      title: (cell, row) => `${cell} [${row.allele_effect_frequency.toPrecision(4)}]`,
      headerStyle: { width: '200px' },
      headerClasses: 'overflow-ellipsis',
      classes: 'overflow-ellipsis text-nowrap'
    },
    {
      dataField: 'allele_non_effect',
      text: 'Non-Eff. Allele [Freq.]',
      headerTitle: _ => 'Non-Effect Allele [Frequency]',
      formatter: (cell, row) => `${cell} [${(1 - row.allele_effect_frequency).toPrecision(4)}]`,
      title: (cell, row) => `${cell} [${(1 - row.allele_effect_frequency).toPrecision(4)}]`,
      headerStyle: { width: '200px' },
      headerClasses: 'overflow-ellipsis',
      classes: 'overflow-ellipsis  text-nowrap'
    },
    {
      dataField: 'beta',
      text: 'Beta [95% CI]',
      headerTitle: _ => 'Beta [95% Confidence Interval]',
      title: true,
      formatter: (cell, row) => (!cell || isNaN(cell)) ? '-' :
        `${(+cell).toFixed(3)} [${row.beta_ci_95_low.toFixed(3)}, ${+row.beta_ci_95_high.toFixed(3)}]`,
      title: (cell, row) => (!cell || isNaN(cell)) ? '-' :
        `${(+cell).toFixed(3)} [${row.beta_ci_95_low.toFixed(3)}, ${+row.beta_ci_95_high.toFixed(3)}]`,
      headerStyle: { minWidth: '200px', width: '200px' },
      headerClasses: 'overflow-ellipsis',
      classes: 'overflow-ellipsis',
    },
    {
      dataField: 'odds_ratio',
      text: 'OR [95% CI]',
      headerTitle: _ => 'Odds Ratio [95% Confidence Interval]',
      formatter: (cell, row) => (!cell || isNaN(cell)) ? '-' :
        `${(+cell).toFixed(3)} [${row.odds_ratio_ci_95_low.toFixed(3)}, ${+row.odds_ratio_ci_95_high.toFixed(3)}]`,
      title: (cell, row) => (!cell || isNaN(cell)) ? '-' :
        `${(+cell).toFixed(3)} [${row.odds_ratio_ci_95_low.toFixed(3)}, ${+row.odds_ratio_ci_95_high.toFixed(3)}]`,
      headerStyle: { minWidth: '200px', width: '200px' },
      classes: 'overflow-ellipsis',
      headerClasses: 'overflow-ellipsis'
    },
    {
      dataField: 'p_value',
      text: (
        <span>
          Assoc. <span className="text-nowrap">P-Value</span>
        </span>
      ),
      headerTitle: _ => 'Association P-Values',
      formatter: cell => (cell < 1e-2 ? (+cell).toExponential() : cell),
      title: true,
      sort: true,
      headerStyle: { width: '110px', minWidth: '110px' },
      headerClasses: 'overflow-ellipsis',
      classes: 'overflow-ellipsis'
    },
    {
      dataField: 'p_value_heterogenous',
      text: (
        <span>
          Het. <span className="text-nowrap">P-Value</span>
        </span>
      ),
      headerTitle: _ => 'Heterogenous P-Values',
      title: true,
      headerStyle: { width: '100px', minWidth: '100px' },
      headerClasses: 'overflow-ellipsis',
      classes: 'overflow-ellipsis'
    },
    {
      dataField: 'n',
      text: 'N',
      headerTitle: _ => 'Sample Size',
      title: true,
      headerStyle: { width: '80px' },
      headerClasses: 'overflow-ellipsis',
      classes: 'overflow-ellipsis',
    },
  ];

  const updateSummaryTableData = (key, params) => {
    const phenotype = selectedPhenotypes[key] || selectedPhenotypes[0];
    const { ancestry, sex } =
      selectedStratifications[key] || selectedStratifications[0];
    if (!phenotype) return;
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
    dispatch(fetchSummaryTable(key, summaryParams));
  };

  const handleTableChange = (key, type, pagination) => {
    if (!selectedPhenotypes || !selectedPhenotypes.length || !summaryTables.tables[key].results.length) return;
    const { page, sizePerPage, sortField, sortOrder } = pagination;
    const cachedTable = summaryTables.tables[key];
    const paginationParams = {
      offset: sizePerPage * (page - 1),
      limit: sizePerPage,
      orderBy: sortField,
      order: sortOrder
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
      dispatch(
        fetchSummarySnpTable(i, {
          phenotype_id: phenotype.id,
          snp: summarySnpTables.snp,
          ancestry: s.ancestry,
          sex: s.sex
        })
      );
    });
  };

  const updateStackedSex = sex => {
    // updating stacked sex
    dispatch(updateSummaryTable('stackedSex', sex));
  };
  const handleSnpReset = async () => {

    const { summarySnpTables } = getInitialState();
    dispatch(updateKey('summarySnpTables', summarySnpTables));
  };

  const getDownloadLink = () => {
    if (!selectedStratifications || !selectedPhenotypes ||      
      !selectedStratifications.length || !selectedPhenotypes.length)
      return null;

    const phenotype =
      isPairwise && selectedPhenotypes[1]
        ? selectedPhenotypes[selectedTable]
        : selectedPhenotypes[0];
    
    return `${downloadRoot}${phenotype.name}.tsv.gz`;
  }

  const getExportLink = () => {
    if (!selectedStratifications || !selectedPhenotypes ||      
      !selectedStratifications.length || !selectedPhenotypes.length)
      return null;

    const phenotype =
      isPairwise && selectedPhenotypes[1]
        ? selectedPhenotypes[selectedTable]
        : selectedPhenotypes[0];

    const { sex, ancestry } = isPairwise
      ? selectedStratifications[selectedTable]
      : selectedStratifications[0];

    let exportParams = summarySnpTables.visible
      ? {
        phenotype_id: phenotype.id,
        sex,
        ancestry,
        snp: summarySnpTables.snp
      }
      : {
        phenotype_id: phenotype.id,
        sex,
        ancestry,
        chromosome: selectedChromosome,
        orderBy: summaryTables.tables[selectedTable].orderBy || 'p_value',
        order: summaryTables.tables[selectedTable].order || 'asc',
        p_value_nlog_min: nlogpMin,
        p_value_nlog_max: nlogpMax,
        position_min: bpMin,
        position_max: bpMax
      };

    return `${process.env.REACT_APP_API_ROOT}/export-variants${asQueryString(
      exportParams
    )}`;
  };

  const columnFilter = (c, key) => {
    const phenotype = (selectedPhenotypes[+key] || selectedPhenotypes[0]);
    if (c.dataField === 'odds_ratio')
      return phenotype.type === 'binary';
    else if (c.dataField === 'beta')
      return phenotype.type === 'continuous';
    return true;
  }

  const getVariantTableProps = (key) => ({
    remote: true,
    keyField: 'id',
    loading: summaryTables.loading,
    data: summaryTables.tables[key].results,
    columns: columns.filter(c => columnFilter(c, key)),
    onTableChange: (type, ev) => handleTableChange(key, type, ev),
    overlay: loadingOverlay,
    defaultSorted: [{
      dataField: summaryTables.tables[key].orderBy || 'p_value',
      order: summaryTables.tables[key].order || 'asc'
    }],
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

  return (
    <div className="mt-3" 
      style={{ minWidth: '800px' }}>
      <div
        key="controls"
        className="d-flex align-items-center justify-content-between">
        <div className="d-flex align-items-center">
          {isPairwise && <div className="btn-group" role="group">
            {selectedStratifications.map((s, i) =>
              <button
                key={`select-table-${i}`}
                className={`btn btn-sm ${selectedTable == i ? 'btn-primary btn-primary-gradient active' : 'btn-silver'}`}
                onClick={e => setSelectedTable(i)}>
                {[
                  showPhenotypeNames && selectedPhenotypes[i].display_name,
                  !showPhenotypeNames && asTitleCase(s.ancestry),
                  !showPhenotypeNames && asTitleCase(s.sex),
                ].filter(Boolean).join(' - ')}
              </button>
            )}
          </div>}

        </div>

        <div key="snpSearch" className="d-flex align-items-center">
          <input
            style={{ minWidth: '280px' }}
            className="form-control form-control-sm"
            placeholder="Search for a SNP or SNPs (ex/ rs3 rs4)"
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

          <OverlayTrigger overlay={
            <Tooltip id="export-info-tooltip" className={summaryTables.tables[selectedTable].resultsCount > exportRowLimit ? 'visible' : 'invisible'}>
              Download top {exportRowLimit.toLocaleString()} variants based on the current sort order.
            </Tooltip>}>
            <a
              className="btn btn-sm btn-link text-nowrap"
              target="_blank"
              href={getExportLink()}>
              Export Variants
            </a>
          </OverlayTrigger>


          <OverlayTrigger overlay={
            <Tooltip id="download-dataset-tooltip">
              Download the original dataset for this phenotype.
            </Tooltip>}>
            <a
              className="btn btn-sm btn-link text-nowrap"
              target="_blank"
              href={getDownloadLink()}>
              Download Dataset
            </a>
          </OverlayTrigger>

        </div>
      </div>

      {/* Do not filter beforehand, as that resets indexes  */}

      {selectedStratifications.map((s, i) =>
        selectedTable === i && (!summarySnpTables.visible
          ? <Table
            wrapperClasses="table-responsive"
            key={`variant-table-${i}`}
            {...getVariantTableProps(i)} />
          : <Table
            wrapperClasses="table-responsive"
            key={`snp-table-${i}`}
            keyField="variant_id"
            data={summarySnpTables.tables[i].results}
            columns={columns.filter(c => columnFilter(c, i))} />
        )
      )}
    </div>
  );
}

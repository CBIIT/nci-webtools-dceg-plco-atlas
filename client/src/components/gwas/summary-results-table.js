import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Tabs, Tab } from 'react-bootstrap';
import {
  updateSummaryResults,
  updateSummaryTable,
  fetchSummaryTable
} from '../../services/actions';
import { query } from '../../services/query';
import { Icon } from '../controls/icon';
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
  const {
    loadingManhattanTable,
    selectedPhenotype,
    selectedChromosome,
    selectedTable,
    selectedManhattanPlotType,
    nlogpMin,
    nlogpMax,
    bpMin,
    bpMax,
    snp,
    snpResults,
    showSnpResults,
  } = useSelector(state => state.summaryResults);
  let [gender, setGender] = useState('female');

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

  let snpColumns = [
    {
      dataField: 'chr',
      text: 'Chromosome'
    },
    {
      dataField: 'bp',
      text: 'Position'
    },
    {
      dataField: 'snp',
      text: 'SNP'
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
      text: 'P-Value'
    }
  ];

  const handleTableChange = async (
    type,
    { page, sizePerPage: limit, sortField: orderBy, sortOrder: order },
    index
  ) => {
    console.log('handling table change');
    if (!selectedPhenotype || !selectedPhenotype.value) return;

    console.log({ order, orderBy, limit, page, bpMin, bpMax });

    dispatch(
      fetchSummaryTable(
        {
          database: selectedPhenotype.value + '.db',
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
        },
        null,
        index
      )
    );
  };

  const setSnp = snp => {
    dispatch(updateSummaryResults({ snp }));
  };

  const handleSnpLookup = async () => {
    if (!snp) return;
    const table = {
      all: 'variant_all',
      stacked: ['variant_female', 'variant_male'],
      female: 'variant_female',
      male: 'variant_male'
    }[selectedManhattanPlotType];

    const { data } = await query('variants', {
      database: selectedPhenotype.value + '.db',
      table: table,
      snp: snp
    });
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

  let showTabs = selectedManhattanPlotType === 'stacked';
  let tabs = showTabs
    ? [
        { title: 'Female', key: 'female', index: 0 },
        { title: 'Male', key: 'male', index: 1 }
      ]
    : [];

  return (
    <div className="mt-3">
      <div className="d-flex align-items-center justify-content-between">
        <div className="d-flex align-items-center">
          {showTabs && <div class="btn-group" role="group" aria-label="Basic example">
            <button
              className={`btn btn-primary ${gender === 'female' && 'active'}`}
              onClick={e => setGender('female')}>
              Female
            </button>
            <button
              className={`btn btn-primary ${gender === 'male' && 'active'}`}
              onClick={e => setGender('male')}>
              Male
            </button>
          </div>}
        </div>

        <div className="d-flex mb-2">
            <input
              type="text"
              style={{ maxWidth: '400px' }}
              className="form-control"
              placeholder="Search for a SNP"
              value={snp}
              onChange={e => setSnp(e.target.value)}
            />
            <button
              className="btn btn-silver flex-shrink-auto d-flex"
              onClick={handleSnpReset}>
              <Icon className="opacity-50" name="times" width="12" />
              <span className="sr-only">Clear</span>
            </button>
            <button
              className="btn btn-silver flex-shrink-auto mx-2"
              onClick={handleSnpLookup}>
              Search
            </button>
          </div>
      </div>

      <div style={{display: showSnpResults ? 'none' : 'block'}}>
        {(!showTabs || gender === 'female') && (
          <Table
            remote
            keyField="variant_id"
            loading={loadingManhattanTable}
            data={summaryTables[0].results}
            columns={columns}
            onTableChange={(type, ev) => handleTableChange(type, ev, 0)}
            overlay={loadingOverlay}
            pagination={paginationFactory({
              page: summaryTables[0].page,
              sizePerPage: summaryTables[0].pageSize,
              totalSize: summaryTables[0].resultsCount,
              showTotal: summaryTables[0].results.length > 0,
              sizePerPageList: [10, 25, 50, 100],
              paginationTotalRenderer: paginationText,
              sizePerPageRenderer: paginationSizeSelector,
              pageButtonRenderer: paginationButton
            })}
            defaultSorted={[{ dataField: 'p', order: 'asc' }]}
          />
        )}

        {showTabs &&
          <div style={{display: gender === 'male' ? 'block' : 'none'}}>
          <Table
            remote
            keyField="variant_id"
            loading={loadingManhattanTable}
            data={summaryTables[1].results}
            columns={columns}
            onTableChange={(type, ev) => handleTableChange(type, ev, 1)}
            overlay={loadingOverlay}
            pagination={paginationFactory({
              page: summaryTables[1].page,
              sizePerPage: summaryTables[1].pageSize,
              totalSize: summaryTables[1].resultsCount,
              showTotal: summaryTables[1].results.length > 0,
              sizePerPageList: [10, 25, 50, 100],
              paginationTotalRenderer: paginationText,
              sizePerPageRenderer: paginationSizeSelector,
              pageButtonRenderer: paginationButton
            })}
            defaultSorted={[{ dataField: 'p', order: 'asc' }]}
          />
          </div>
        }
        </div>

      <div>
        {showSnpResults && (
          <Table keyField="variant_id" data={snpResults} columns={columns} />
        )}
      </div>

    </div>
  );
}

import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { updateSummaryResults } from '../../services/actions';
import { query } from '../../services/query';
import BootstrapTable from 'react-bootstrap-table-next';
import paginationFactory from 'react-bootstrap-table2-paginator';

export function SummaryResultsTable({updateFunctionRef}) {
    const dispatch = useDispatch();
    const {
        selectedPhenotype,
        selectedChromosome,
        results,
        resultsCount,
        page,
        pageSize,
    } = useSelector(state => state.summaryResults);
    const [currentParams, setCurrentParams] = useState({
        bpMin: 0,
        bpMax: 0,
        nlogpMin: 0,
        nlogpMax: 0,
    })

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
        },
        {
            dataField: 'bp',
            text: 'Position',
        },
        {
            dataField: 'snp',
            text: 'SNP',
        },
        {
            dataField: 'a1',
            text: 'Reference Allele',
        },
        {
            dataField: 'a2',
            text: 'Alternate Allele',
        },
        {
            dataField: 'or',
            text: 'Odds Ratio',
        },
        {
            dataField: 'p',
            text: 'P-Value',
            headerFormatter: (column) => {
                return (
                  <div>
                    {column.text}<span className="summary-results-table"><span className="caret-4-asc"></span></span>
                  </div>
                );
              }
        },
    ];

    const updateTable = async params => {
      console.log('called update', params);
        const {page, pageSize} = params;
        params.offset = (page - 1) * pageSize;
        params.limit = pageSize;
        const response = await query('variants-paginated', params);
        setCurrentParams({
            ...currentParams,
            ...params
        });
        updatePage(page);
        updatePageSize(pageSize);
        updateResults(response);
        updateResultsCount(70000000);
    }

    const handleTableChange = async (type, { page, sizePerPage }) => {
        updateTable({
            ...currentParams,
            page,
            pageSize: sizePerPage,
            database: selectedPhenotype.value + '.db',
            chr: selectedChromosome,
        });
    }

    useEffect(() => {
        if (updateFunctionRef)
            updateFunctionRef(updateTable);
    }, [updateFunctionRef, updateTable]);

    return (
        <BootstrapTable
            bootstrap4
            remote
            keyField="variant_id"
            data={results}
            columns={columns}
            onTableChange={handleTableChange}
            pagination={paginationFactory({ page, sizePerPage: pageSize, totalSize: resultsCount })}
        />
    );
}

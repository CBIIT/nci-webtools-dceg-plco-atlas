import React, { useEffect } from 'react';
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

    const updateResults = results => {
        dispatch(updateSummaryResults({results}));
    };

    const updateResultsCount = resultsCount => {
        dispatch(updateSummaryResults({resultsCount}));
    }

    const updatePage = page => {
        dispatch(updateSummaryResults({page}));
    }

    const updatePageSize = pageSize => {
        dispatch(updateSummaryResults({pageSize}));
    }

    useEffect(() => {
        if (updateFunctionRef)
            updateFunctionRef(updateTable);
    }, [updateFunctionRef]);

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
            text: 'Ref. Allele',
        },
        {
            dataField: 'a2',
            text: 'Alt. Allele',
        },
        {
            dataField: 'p',
            text: 'P-Value'
        },
    ];

    const updateTable = async (page, pageSize, database, chromosome) => {
        const params = {
            offset: (page - 1) * pageSize,
            limit: pageSize,
            database: database + '.db'
        };
        if (chromosome)
            params.chr = chromosome;
        const response = await query('variants-paginated', params);

        updatePage(page);
        updatePageSize(pageSize);
        updateResults(response);
        updateResultsCount(70000000);
    }

    const handleTableChange = async (type, { page, sizePerPage }) => {
        updateTable(page, sizePerPage, selectedPhenotype.value, selectedChromosome);
    }

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
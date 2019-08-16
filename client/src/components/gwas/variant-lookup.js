import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { SearchFormTraitsVariant } from '../forms/search-form-traits-variant';
import { query } from '../../services/query';
import { updateVariantLookup } from '../../services/actions';
import BootstrapTable from 'react-bootstrap-table-next';
import paginationFactory from 'react-bootstrap-table2-paginator';
import filterFactory, { textFilter } from 'react-bootstrap-table2-filter';

export function VariantLookup() {
    const dispatch = useDispatch();
    const variantLookup = useSelector(state => state.variantLookup);
    const { selectedPhenotypes, selectedVariant, results, message } = variantLookup;

    const setResults = results => {
        dispatch(updateVariantLookup({results}));
    }

    const setMessage = message => {
        dispatch(updateVariantLookup({message}));
    }

    const columns = [
        {
            dataField: 'trait',
            text: 'Trait',
            filter: textFilter(),
            sort: true,
        },
        {
            dataField: 'snp',
            text: 'SNP',
            filter: textFilter()
        },
        {
            dataField: 'chr',
            text: 'Chromosome',
            filter: textFilter()
        },
        {
            dataField: 'bp',
            text: 'Position',
            filter: textFilter()
        },
        {
            dataField: 'a1',
            text: 'Ref. Allele',
            filter: textFilter()
        },
        {
            dataField: 'a2',
            text: 'Alt. Allele',
            filter: textFilter()
        },
        {
            dataField: 'p',
            text: 'P-value',
            filter: textFilter(),
            sort: true,
        },
    ];

    const lookup = async () => {
        var tableList = [];
        // console.log("Sample query!", selectedPhenotyes);
        for (var i = 0; i < selectedPhenotypes.length; i++) {
            const variantData = await query('variant', {
                database: selectedPhenotypes[i].value,
                snp: selectedVariant,
                chr: '',
                bp: ''
            });
            for (var j = 0; j < variantData.length; j++) {
                variantData[i]['trait'] = selectedPhenotypes[i].label;
                tableList.push(variantData[i]);
            }
        }
        setResults(tableList);
        setMessage('');
        if (tableList.length === 0)
            setMessage("Variant not found in any selected trait(s).");
    }

    return (
        <>
            <div className="card shadow-sm mb-4">
                <div className="card-body">
                    <SearchFormTraitsVariant onSubmit={lookup} />
                </div>
            </div>

            <div className="card shadow-sm mb-4">
                <div className="card-header bg-white font-weight-bolder border-bottom-0">
                    display selected phenotype(s) and variant details in each phenotype
                </div>

                <div className="card-body">
                    <div className="row">
                        <div class="col-md-12 text-left">
                            <pre>{JSON.stringify(variantLookup, null, 2)}</pre>
                        </div>
                        <div class="col-md-12 text-left">
                            <h4>{message}</h4>
                        </div>
                    </div>

                    <BootstrapTable
                        bootstrap4
                        keyField='id'
                        data={ results }
                        columns={ columns }
                        pagination={ paginationFactory() }
                        filter={ filterFactory() }
                    />

                    {/* <div className="row mt-3">
                        <div className="col-md-12 text-left mt-3">
                            <pre>{JSON.stringify(phenotypes, null, 2)}</pre>
                        </div>
                    </div> */}
                </div>
            </div>
        </>
    );
}

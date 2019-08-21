import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { SearchFormTraitsVariant } from '../forms/search-form-traits-variant';
import { updateVariantLookup, lookupVariants } from '../../services/actions';
import BootstrapTable from 'react-bootstrap-table-next';
import paginationFactory from 'react-bootstrap-table2-paginator';
import filterFactory, { textFilter } from 'react-bootstrap-table2-filter';
import { Spinner } from 'react-bootstrap';


export function VariantLookup() {
    const dispatch = useDispatch();
    const variantLookup = useSelector(state => state.variantLookup);
    const { selectedPhenotypes, selectedVariant, results, message, loading } = variantLookup;

    const columns = [
        {
            dataField: 'phenotype',
            text: 'Phenotype',
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

    return (
        <>
            <div className="card shadow-sm mb-4">
                <div className="card-body">
                    <SearchFormTraitsVariant onSubmit={e => dispatch(lookupVariants(selectedPhenotypes, selectedVariant))} />
                </div>
            </div>

            <div className="card shadow-sm mb-4">
                {/* <div className="card-header bg-white font-weight-bolder border-bottom-0">
                    display selected phenotype(s) and variant details in each phenotype
                </div> */}

                <div className="card-body">
                    <div className="row text-center">
                        {/* <div class="col-md-12 text-left">
                            <pre>{JSON.stringify(variantLookup, null, 2)}</pre>
                        </div> */}
                        <div className="col-md-12">
                            <h4>{message}</h4>
                        </div>
                        <div className="col-md-12" style={{display: results.length === 0 && message.length === 0 && !loading ? 'block' : 'none'}}>
                            <h4>No Results</h4>
                        </div>
                    </div>

                    <div style={{display: results.length > 0 ? 'block' : 'none'}}>
                        <BootstrapTable
                            bootstrap4
                            keyField='id'
                            data={ results }
                            columns={ columns }
                            pagination={ paginationFactory() }
                            filter={ filterFactory() }
                        />
                    </div>
                    
                    <div className="text-center" style={{display: loading ? 'block' : 'none'}}>
                        <Spinner animation="border" variant="primary"  role="status">
                            <span className="sr-only">Loading...</span>
                        </Spinner>
                    </div>

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

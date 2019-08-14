import React, { useState } from 'react';
import { SearchFormTraitsVariant } from '../forms/search-form-traits-variant';
import { query } from '../../services/query';

import 'react-bootstrap-table-next/dist/react-bootstrap-table2.min.css';
import BootstrapTable from 'react-bootstrap-table-next';
import 'react-bootstrap-table2-paginator/dist/react-bootstrap-table2-paginator.min.css';
import paginationFactory from 'react-bootstrap-table2-paginator';
import 'react-bootstrap-table2-filter/dist/react-bootstrap-table2-filter.min.css';
import filterFactory, { textFilter } from 'react-bootstrap-table2-filter';

export function VariantLookup({ params, setParams }) {
    const [debugSearchInput, setDebugSearchInput] = useState(null);
    const [phenotypes, setPhenotypes] = useState([{}]);

    const columns = [
        {
            dataField: 'TRAIT',
            text: 'Trait',
            sort: true,
            filter: textFilter()
        }, 
        {
            dataField: 'SNP',
            text: 'SNP',
        }, 
        {
            dataField: 'CHR',
            text: 'Chromosome',
        },
        {
            dataField: 'BP',
            text: 'Position',
        },
        {
            dataField: 'A1',
            text: 'Ref. Allele',
            filter: textFilter()
        },
        {
            dataField: 'A2',
            text: 'Alt. Allele',
            filter: textFilter()
        },
        {
            dataField: 'P',
            text: 'P-value',
            sort: true,
        },
    ];

    return (
        <>
            <div className="card shadow-sm mb-4"> 
                <div className="card-body">
                    <SearchFormTraitsVariant
                        params={params}
                        onChange={e => {
                            setParams(e);
                        }}
                        onSubmit={lookup}
                    />
                </div>
            </div>

            <div className="card shadow-sm mb-4">
                <div className="card-header bg-white font-weight-bolder border-bottom-0">
                    display selected phenotype(s) and variant details in each phenotype
                </div>

                <div className="card-body">
                    show variant details and info in each found trait
                    {/* <div className="row mt-3">
                        <div class="col-md-12 text-left">
                            <pre>{JSON.stringify(debugSearchInput, null, 2)}</pre>
                        </div>
                    </div> */}

                    <BootstrapTable 
                        bootstrap4={ true } 
                        keyField='id' 
                        data={ phenotypes } 
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

    async function lookup(searchInput) {
        var tableList = [];
        setDebugSearchInput(searchInput);
        // console.log("Sample query!", searchInput);
        for (var i = 0; i < searchInput.selectedOption.length; i++) {
            const newParams = {
                database: searchInput.selectedOption[i].value,
                snp: searchInput.selectedVariant,
                chr: '',
                bp: ''
            }
            setParams(newParams);
            const variantData = await query('variant', newParams);
            for (var j = 0; j < variantData.length; j++) {
                variantData[i]['TRAIT'] = searchInput.selectedOption[i].label;
                tableList.push(variantData[i]);
            }
        }
        setPhenotypes(tableList);
    }
}

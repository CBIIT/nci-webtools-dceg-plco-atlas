import React, { useState } from 'react';
// import { Nav, Tab } from 'react-bootstrap';
import { SearchFormTraitsVariant } from '../forms/search-form-traits-variant';

import 'react-bootstrap-table-next/dist/react-bootstrap-table2.min.css';
import BootstrapTable from 'react-bootstrap-table-next';
import 'react-bootstrap-table2-paginator/dist/react-bootstrap-table2-paginator.min.css';
import paginationFactory from 'react-bootstrap-table2-paginator';
import 'react-bootstrap-table2-filter/dist/react-bootstrap-table2-filter.min.css';
import filterFactory, { textFilter } from 'react-bootstrap-table2-filter';

export function VariantLookup({ params, setParams }) {
    const [trait, setTrait] = useState(null);

    const phenotypes = [
        {
            trait: "Ewing's Sarcoma",
            snp: "rs12345",
            chr: 1,
            pos: 246810,
            ref: 'A',
            alt: 'T'
        },
        {
            trait: "Lung Cancer",
            snp: "rs12345",
            chr: 1,
            pos: 246810,
            ref: 'C',
            alt: 'G'
        },
        {
            trait: "Hair Loss",
            snp: "rs12345",
            chr: 1,
            pos: 246810,
            ref: 'ATT',
            alt: 'A'
        },
        {
            trait: "Freckles",
            snp: "rs12345",
            chr: 1,
            pos: 246810,
            ref: 'C',
            alt: 'G'
        },
        {
            trait: "Arthritis",
            snp: "rs12345",
            chr: 1,
            pos: 246810,
            ref: 'ATTATTA',
            alt: 'TTA'
        }
    ];

    const columns = [
        {
            dataField: 'trait',
            text: 'Trait',
            sort: true,
            filter: textFilter()
        }, 
        {
            dataField: 'snp',
            text: 'Product SNP',
        }, 
        {
            dataField: 'chr',
            text: 'Product Chromosome',
        },
        {
            dataField: 'pos',
            text: 'Product Position',
        },
        {
            dataField: 'ref',
            text: 'Product Ref. Allele',
            filter: textFilter()
        },
        {
            dataField: 'alt',
            text: 'Product Alt. Allele',
            filter: textFilter()
        },
    ];

    return (
        <>
            <div className="card shadow-sm mb-4"> 
                <div className="card-body">
                    <SearchFormTraitsVariant
                        params={params}
                        onChange={setParams}
                        onSubmit={setTrait}
                    />
                </div>
            </div>

            <div className="card shadow-sm mb-4">
                <div className="card-header bg-white font-weight-bolder border-bottom-0">
                    display selected phenotype(s) and variant details in each phenotype
                </div>

                <div className="card-body">
                    show variant details and info in each found trait
                    <div className="row mt-3">
                        <div class="col-md-12 text-left">
                            <pre>{JSON.stringify(trait, null, 2)}</pre>
                        </div>
                    </div>

                    <BootstrapTable 
                        bootstrap4={ true } 
                        keyField='id' 
                        data={ phenotypes } 
                        columns={ columns } 
                        pagination={ paginationFactory() }
                        filter={ filterFactory() }
                    />

                </div>
            </div>
        </>
    );
}

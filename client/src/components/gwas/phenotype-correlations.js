import React, { useState } from 'react';
import { useSelector, useDispatch} from 'react-redux';
import { updatePhenotypeCorrelations } from '../../services/actions';
import { SearchFormTraits } from '../forms/search-form-traits';

export function PhenotypeCorrelations() {
    const phenotypeCorrelations = useSelector(state => state.phenotypeCorrelations);

    async function handleSubmit(params) {
        console.log('submitted', params);
        // let results = await query(...)
    }

    return (
        <>
            <div className="card shadow-sm mb-4">
                <div className="card-body">
                    <SearchFormTraits onSubmit={handleSubmit} />
                </div>
            </div>

            <div className="card shadow-sm mb-4">
                <div className="card-header bg-white font-weight-bolder border-bottom-0">
                    display selected phenotypes
                </div>

                <div className="card-body">
                    show heatmap with traits selected
                    <div className="row mt-3">
                        <div class="col-md-12 text-left">
                            <pre>{JSON.stringify(phenotypeCorrelations, null, 2)}</pre>
                        </div>
                    </div>

                </div>
            </div>
        </>
    );
}

import React, { useState } from 'react';
// import { Nav, Tab } from 'react-bootstrap';
import { SearchFormTraitsVariant } from '../forms/search-form-traits-variant';

export function VariantLookup({ params, setParams }) {
  const [trait, setTrait] = useState(null);

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
            </div>
        </div>
    </>
  );
}

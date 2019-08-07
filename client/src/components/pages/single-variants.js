import React, { useState } from 'react';
// import { Nav, Tab } from 'react-bootstrap';
import { SearchFormTraitsVariant } from '../search-form-traits-variant';

export function SingleVariants({ params, setParams }) {
  const [trait, setTrait] = useState(null);

  return (
    <>
        <div className="card shadow-sm mb-4"> 
            <div className="card-body">
                <SearchFormTraitsVariant
                    params={params}
                    onChange={setParams}
                    onSubmit={e => setTrait(params.trait)}
                />
            </div>
        </div>

        <div className="card shadow-sm mb-4">
            <div className="card-header bg-white font-weight-bolder border-bottom-0">
                display selected trait(s) and single variant
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

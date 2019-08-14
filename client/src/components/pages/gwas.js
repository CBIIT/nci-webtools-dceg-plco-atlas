import React, { useState } from 'react';
import { Route, NavLink, Redirect } from 'react-router-dom';
import { ButtonGroup, Button } from 'react-bootstrap';
import { SummaryResults } from '../gwas/summary-results';
import { VariantLookup } from '../gwas/variant-lookup';
import { PhenotypeCorrelations } from '../gwas/phenotype-correlations';

export function Gwas({ params, setParams }) {
  const [trait, setTrait] = useState(null);

  const gwasLinks = [
    {
      pathId: 'summary',
      name: 'Summary Results'
    },
    {
      pathId: 'lookup',
      name: 'Variant Lookup'
    },
    {
      pathId: 'correlations',
      name: 'Phenotype Correlations'
    },
  ];

  return (
    <div className="container my-4">
      <ButtonGroup className="mb-4">
        {gwasLinks.map(({ name, pathId }) => (
          <NavLink 
            className="mr-2" 
            activeClassName="active-navlinks"
            exact={true}
            to={`/gwas/${pathId}`}>
            <Button>{name}</Button>
          </NavLink>
        ))}
      </ButtonGroup>

      <Route
        exact
        path={`/gwas`}
        render={() => <Redirect to="/gwas/summary" />}
      />

      <Route
        path="/gwas/summary"
        render={_ => <SummaryResults params={params} setParams={setParams} />}
      />

      <Route
        path="/gwas/lookup"
        render={_ => <VariantLookup params={params} setParams={setParams} />}
      />

      <Route
        path="/gwas/correlations"
        render={_ => <PhenotypeCorrelations params={params} setParams={setParams} />}
      />
      
    </div>
  );
}

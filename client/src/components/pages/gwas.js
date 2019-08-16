import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Route, NavLink, Redirect } from 'react-router-dom';
import { ButtonGroup, Button } from 'react-bootstrap';
import { SummaryResults } from '../gwas/summary-results';
import { VariantLookup } from '../gwas/variant-lookup';
import { PhenotypeCorrelations } from '../gwas/phenotype-correlations';
import { updatePhenotypes } from '../../services/actions';
import { query } from '../../services/query';

export function Gwas() {
  const dispatch = useDispatch();

  useEffect(() => {
    const records = [];
    const populateRecords = node => {
      records.push(node);
      if (node.children)
        node.children.forEach(populateRecords);
    }

    query('data/phenotypes.json').then(data => {
      data.forEach(populateRecords, 0);
      dispatch(updatePhenotypes(records));
    });
  }, []);

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
        component={SummaryResults}
      />

      <Route
        path="/gwas/lookup"
        component={VariantLookup}
      />

      <Route
        path="/gwas/correlations"
        component={PhenotypeCorrelations}
      />

    </div>
  );
}

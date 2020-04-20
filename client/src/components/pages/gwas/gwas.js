import React from 'react';
import { Route, NavLink, Redirect } from 'react-router-dom';
import { Nav } from 'react-bootstrap';
import { SummaryResults } from './summary/summary';
import { VariantLookup } from './lookup/lookup';
import { PhenotypeCorrelations } from './correlations/correlations';
import './gwas.scss'


export function Gwas() {
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
    }
  ];

  return (
    <div className="px-0">
      <div className="mx-3">
        <div
          className="mx-3 bg-white border border-top-0">
          <div className="">
            <Nav defaultActiveKey="summary">
              {gwasLinks.map(({ name, pathId }) => (
                <div
                  key={pathId}
                  className="d-inline-block">
                  <NavLink
                    // key={pathId}
                    className="secondary-navlinks px-3 py-1 d-inline-block"
                    activeClassName="active-secondary-navlinks"
                    style={{
                      textDecoration: 'none',
                      fontSize: '11pt',
                      color: 'black',
                      fontWeight: '500'
                    }}
                    exact={true}
                    to={`/gwas/${pathId}`}>
                    {name}
                  </NavLink>
                  <div className="d-md-none w-100"></div>
                </div>
              ))}
            </Nav>
          </div>
        </div>
      </div>

      <h1 className="d-none">Explore GWAS data</h1>

      <div className="my-3">
        <Route
          exact
          path={`/gwas`}
          render={() => <Redirect to="/gwas/summary" />}
        />
        <Route path="/gwas/summary" component={SummaryResults} />
        <Route path="/gwas/lookup" component={VariantLookup} />
        <Route path="/gwas/correlations" component={PhenotypeCorrelations} />
      </div>
    </div>
  );
}

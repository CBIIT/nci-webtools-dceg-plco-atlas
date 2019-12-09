import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Route, NavLink, Redirect } from 'react-router-dom';
import { ButtonGroup, Button, Card, Nav, NavItem } from 'react-bootstrap';
import { SummaryResults } from '../gwas/summary-results';
import { VariantLookup } from '../gwas/variant-lookup';
import { PhenotypeCorrelations } from '../gwas/phenotype-correlations';
import {
  updatePhenotypes,
  updatePhenotypeCategories,
  updatePhenotypesTree
} from '../../services/actions';
import { query } from '../../services/query';

export function Gwas() {
  const dispatch = useDispatch();

  useEffect(() => {
    const records = [];
    const categories = [];
    const populateRecords = node => {
      // only populate alphabetic phenotype list with leaf nodes
      if (node.children === undefined) {
        records.push({
          title: node.title,
          value: node.value,
          disabled: node.disabled
        });
      } else {
        categories.push({
          title: node.title,
          value: node.value
        });
      }
      if (node.children) node.children.forEach(populateRecords);
    };

    query('data/phenotypes.json').then(data => {
      data.forEach(populateRecords, 0);
      dispatch(updatePhenotypes(records));
      dispatch(updatePhenotypeCategories(categories));
      dispatch(updatePhenotypesTree(data));
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
    }
  ];

  return (
    <div className="container px-0">
      <div className="mx-3">
        <div
          className="mx-3 bg-white border border-top-0">
          <div className="">
            <Nav defaultActiveKey="summary">
              {gwasLinks.map(({ name, pathId }) => (
                <>
                  <NavLink
                    key={pathId}
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
                </>
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

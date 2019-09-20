import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Route, NavLink, Redirect } from 'react-router-dom';
import { ButtonGroup, Button, Card, Nav, NavItem } from 'react-bootstrap';
import { SummaryResults } from '../gwas/summary-results';
import { VariantLookup } from '../gwas/variant-lookup';
import { PhenotypeCorrelations } from '../gwas/phenotype-correlations';
import { updatePhenotypes, updatePhenotypesTree, updatePhenotypesHeatmapTree } from '../../services/actions';
import { query } from '../../services/query';

export function Gwas() {
  const dispatch = useDispatch();

  useEffect(() => {
    const records = [];
    const populateRecords = node => {
      // only populate alphabetic phenotype list with leaf nodes
      if (node.children === undefined) {
        records.push({
          label: node.label,
          value: node.value,
          disabled: node.disabled
        });
      }
      if (node.children) node.children.forEach(populateRecords);
    };

    query('data/phenotypes.json').then(data => {
      data.forEach(populateRecords, 0);
      dispatch(updatePhenotypes(records));
      dispatch(updatePhenotypesTree(data));
    });

    query('data/phenotypes-heatmap.json').then(data => {
      dispatch(updatePhenotypesHeatmapTree(data));
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
    <>
      <div class="container">
        <div
          // className="border-top-0"
          // style={{borderRadius: '0 0 0.25em 0.25em'}}
          className="bg-white shadow-sm"
          style={{ borderRadius: '0 0 0 0' }}>
          <div className="container">
            <Nav defaultActiveKey="summary">
              {gwasLinks.map(({ name, pathId }) => (
                <>
                  {/* <NavItem className="mr-2"> */}
                  <NavLink
                    key={pathId}
                    className="text-secondary px-3 py-1 d-inline-block"
                    activeClassName="active-secondary-navlinks border-primary border-bottom text-secondary"
                    style={{
                      textDecoration: 'none',
                      fontSize: '11pt',
                      // fontWeight: '300'
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
      <div className="container mt-2 mb-4">
        <Route
          exact
          path={`/gwas`}
          render={() => <Redirect to="/gwas/summary" />}
        />
        <Route path="/gwas/summary" component={SummaryResults} />
        <Route path="/gwas/lookup" component={VariantLookup} />
        <Route path="/gwas/correlations" component={PhenotypeCorrelations} />
      </div>
    </>
  );
}

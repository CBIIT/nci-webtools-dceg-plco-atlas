import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Route, NavLink, Redirect } from 'react-router-dom';
import { ButtonGroup, Button, Card, Nav, NavItem } from 'react-bootstrap';
import { SummaryResults } from '../gwas/summary-results';
import { VariantLookup } from '../gwas/variant-lookup';
import { PhenotypeCorrelations } from '../gwas/phenotype-correlations';
import { updatePhenotypes, updatePhenotypesTree } from '../../services/actions';
import { query } from '../../services/query';

export function Gwas() {
  const dispatch = useDispatch();

  useEffect(() => {
    const records = [];
    const populateRecords = node => {
      records.push(node);
      if (node.children) node.children.forEach(populateRecords);
    };

    query('data/phenotypes.json').then(data => {
      data.forEach(populateRecords, 0);
      dispatch(updatePhenotypes(records));
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
    <div className="container my-4">
      <Card>
        <Card.Header className="bg-egg">
          <Nav variant="tabs" defaultActiveKey="summary">
            {gwasLinks.map(({ name, pathId }) => (
              <NavItem className="mr-2">
                <NavLink
                  key={pathId}
                  className="navlinks-card d-inline-block px-3 py-2 border border-bottom-0"
                  activeClassName="active-navlinks-card bg-white border border-bottom-0"
                  style={{textDecoration: 'none'}}
                  exact={true}
                  to={`/gwas/${pathId}`}>
                  <b>{name}</b>
                </NavLink>
              </NavItem>
            ))}
          </Nav>
        </Card.Header>
        <Card.Body className="px-0">
          <Route
            exact
            path={`/gwas`}
            render={() => <Redirect to="/gwas/summary" />}
          />
          <Route path="/gwas/summary" component={SummaryResults} />
          <Route path="/gwas/lookup" component={VariantLookup} />
          <Route path="/gwas/correlations" component={PhenotypeCorrelations} />
        </Card.Body>
      </Card>
    </div>
    // <div className="container my-4">
    //   <ButtonGroup className="mb-4">
    //     {gwasLinks.map(({ name, pathId }) => (
    //       <NavLink
    //         key={pathId}
    //         className="mr-2"
    //         activeClassName="active-navlinks"
    //         exact={true}
    //         to={`/gwas/${pathId}`}>
    //         <Button>{name}</Button>
    //       </NavLink>
    //     ))}
    //   </ButtonGroup>

    //   <Route
    //     exact
    //     path={`/gwas`}
    //     render={() => <Redirect to="/gwas/summary" />}
    //   />

    //   <Route path="/gwas/summary" component={SummaryResults} />

    //   <Route path="/gwas/lookup" component={VariantLookup} />

    //   <Route path="/gwas/correlations" component={PhenotypeCorrelations} />
    // </div>
  );
}

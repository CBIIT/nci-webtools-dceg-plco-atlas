import React, { useState } from 'react';
import { Route } from 'react-router-dom';

import { Nav, Tab } from 'react-bootstrap';
// import { SearchFormTrait } from '../search-form-trait';
import { SummaryResults } from '../gwas/summary-results';
import { VariantLookup } from '../gwas/variant-lookup'
// import { ManhattanPlot } from '../plots/manhattan-plot';
// import { QQPlot } from '../plots/qq-plot';

export function Gwas({ params, setParams }) {
  const [trait, setTrait] = useState(null);

  // const gwasLinks = [
  //   {
  //     id: 'summary',
  //     name: 'Summary Results'
  //   },
  //   {
  //     id: 'lookup',
  //     name: 'Variant Lookup'
  //   },
  //   {
  //     id: 'correlations',
  //     name: 'Phenotype Correlations'
  //   },
  // ];

  return (
    <div className="container my-4">

      {/* <Nav variant="pills" className="nav-pills-custom mb-4">
        {gwasLinks.map(({ name, id }) => (
          <Nav.Item className="mr-2">
            <Nav.Link to={`/gwas/${id}`}>{name}</Nav.Link>
          </Nav.Item>
        ))}
      </Nav> */}


      {/* <Route path={`/gwas/:gwasId`} component={path}/> */}


      <Tab.Container defaultActiveKey="summary-results">

       <Nav variant="pills" className="nav-pills-custom mb-4">
          <Nav.Item className="mr-2">
            <Nav.Link eventKey="summary-results">Summary Results</Nav.Link>
          </Nav.Item>

          <Nav.Item className="mr-2">
            <Nav.Link eventKey="variant-lookup">Variant Lookup</Nav.Link>
          </Nav.Item>

          <Nav.Item>
            <Nav.Link eventKey="phenotype-correlations">Phenotype Correlations</Nav.Link>
          </Nav.Item>
        </Nav>

        <Tab.Content>
          <Tab.Pane eventKey="summary-results">
            <SummaryResults params={params} setParams={setParams} />
          </Tab.Pane>

          <Tab.Pane eventKey="variant-lookup">
            <VariantLookup params={params} setParams={setParams} />
          </Tab.Pane>

          <Tab.Pane eventKey="phenotype-correlations">
            phenotype-correlations
          </Tab.Pane>
        </Tab.Content>

      </Tab.Container>
    </div>
  );
}

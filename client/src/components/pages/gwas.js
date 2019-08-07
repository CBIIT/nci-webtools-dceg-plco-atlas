import React, { useState } from 'react';
import { Nav, Tab } from 'react-bootstrap';
// import { SearchFormTrait } from '../search-form-trait';
import { ManhattanPlots } from './manhattan-plots';
import { SingleVariants } from './single-variants'
// import { ManhattanPlot } from '../plots/manhattan-plot';
// import { QQPlot } from '../plots/qq-plot';

export function Gwas({ params, setParams }) {
  const [trait, setTrait] = useState(null);

  return (
    <div className="container my-4">
      <Tab.Container defaultActiveKey="manhattan-plots">

       <Nav variant="pills" className="nav-pills-custom mb-4">
          <Nav.Item className="mr-2">
            <Nav.Link eventKey="manhattan-plots">Manhattan Plots</Nav.Link>
          </Nav.Item>

          <Nav.Item className="mr-2">
            <Nav.Link eventKey="single-variants">Single Variants</Nav.Link>
          </Nav.Item>

          <Nav.Item>
            <Nav.Link eventKey="phenotype-correlations">Phenotype Correlations</Nav.Link>
          </Nav.Item>
        </Nav>

        <Tab.Content>
          <Tab.Pane eventKey="manhattan-plots">
            <ManhattanPlots params={params} setParams={setParams} />
          </Tab.Pane>

          <Tab.Pane eventKey="single-variants">
            <SingleVariants params={params} setParams={setParams} />
          </Tab.Pane>

          <Tab.Pane eventKey="phenotype-correlations">
            phenotype-correlations
          </Tab.Pane>
        </Tab.Content>

      </Tab.Container>
    </div>
  );
}

import React from 'react';
import { Nav, Tab } from 'react-bootstrap';
import { SearchForm } from '../search-form';
import { ManhattanPlot } from '../plots/manhattan-plot';

export function Gwas({ params, setParams }) {
  return (
    <div className="container my-4">
      <h1 className="font-weight-light">GWAS</h1>
      <hr />

      <div className="card shadow-lg mb-4">
        <div className="card-header bg-primary text-white font-weight-bolder">
          Select Trait
        </div>
        <div className="card-body">
          <SearchForm params={params} onChange={setParams} />
        </div>
      </div>

      <div className="card shadow-lg mb-4">
        <Tab.Container defaultActiveKey="manhattan-plot">
          <div className="card-header bg-primary font-weight-bolder">
            <Nav variant="pills" className="nav-pills-inverse">
              <Nav.Item>
                <Nav.Link eventKey="manhattan-plot">Manhattan Plots</Nav.Link>
              </Nav.Item>

              <Nav.Item>
                <Nav.Link eventKey="qq-plot">Q-Q Plot</Nav.Link>
              </Nav.Item>
            </Nav>
          </div>

          <div class="card-body">
            <Tab.Content>
              <Tab.Pane eventKey="manhattan-plot">
                <h2 className="font-weight-light">Manhattan Plots</h2>
                <hr />
                <ManhattanPlot />
              </Tab.Pane>

              <Tab.Pane eventKey="qq-plot">
                <h2 className="font-weight-light">Quantile-Quantile Plot</h2>
                <hr />
                Placeholder
              </Tab.Pane>
            </Tab.Content>
          </div>
        </Tab.Container>
      </div>
    </div>
  );
}

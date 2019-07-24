import React, { useState } from 'react';
import { Nav, Tab } from 'react-bootstrap';
import { SearchForm } from '../search-form';
import { ManhattanPlot } from '../plots/manhattan-plot';
import { QQPlot } from '../plots/qq-plot';

export function Gwas({ params, setParams }) {
  const [trait, setTrait] = useState(null);

  return (
    <div className="container my-4">
      <div className="card shadow-sm mb-4">
        <div className="card-body">
          <SearchForm params={params} onChange={setParams} onSubmit={e => setTrait(params.trait)}/>
        </div>
      </div>

      <div className="card shadow-sm mb-4">
        <Tab.Container defaultActiveKey="manhattan-plot">
          <div className="card-header bg-white font-weight-bolder border-bottom-0">
            <Nav variant="pills" className="nav-pills-custom">
              <Nav.Item className="mr-2">
                <Nav.Link eventKey="manhattan-plot">Manhattan Plots</Nav.Link>
              </Nav.Item>

              <Nav.Item>
                <Nav.Link eventKey="qq-plot">Q-Q Plot</Nav.Link>
              </Nav.Item>
            </Nav>
          </div>

          <div className="card-body">
            <Tab.Content>
              <Tab.Pane eventKey="manhattan-plot">
                <ManhattanPlot trait={trait} />
              </Tab.Pane>

              <Tab.Pane eventKey="qq-plot">
                <QQPlot />
              </Tab.Pane>
            </Tab.Content>
          </div>
        </Tab.Container>
      </div>
    </div>
  );
}

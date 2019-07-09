import React, { useState, useRef } from 'react';
import { Button, Card, Nav, Tab } from 'react-bootstrap';
import { query } from '../../services/query';

export function Search({ match }) {
  const searchType = match.params.searchType;
  const [tab, setTab] = useState(searchType);
  const [loading, setLoading] = useState(false);
  return (
    <div className="container">
      <h1 className="font-weight-light">Search</h1>
      <hr />

      <Card className="shadow-lg mb-4">
        <Card.Header className="bg-primary text-white font-weight-bolder">
          Enter Parameters
        </Card.Header>
        <Card.Body>
          <SearchForm />
        </Card.Body>
      </Card>

      <Card className="shadow-lg mb-4">
        <Tab.Container defaultActiveKey={tab}>
          <Card.Header className="bg-primary font-weight-bolder">
            <Nav variant="pills" className="nav-pills-inverse">
              <Nav.Item>
                <Nav.Link eventKey="gwas">GWAS</Nav.Link>
              </Nav.Item>
              <Nav.Item>
                <Nav.Link eventKey="phenotypes">Phenotypes</Nav.Link>
              </Nav.Item>
            </Nav>
          </Card.Header>
          <Card.Body>
            <Tab.Content>
              <Tab.Pane eventKey="gwas">
                <h2 class="font-weight-light">GWAS Results</h2>

                <hr />

                <ManhattanPlot data={records} />

                <img
                  class="img-fluid"
                  src={'assets/images/samples/manhattan_plot.png'}
                  alt="Manhattan Plot"
                />

                <hr />

                <img
                  class="img-fluid"
                  src={'assets/images/samples/mirrored_manhattan_plot.png'}
                  alt="Mirrored Manhattan Plot"
                />

                <hr />

                <div class="row">
                  <div class="col-md-6">
                    <img
                      class="img-fluid"
                      src={'assets/images/samples/qq_plot.svg'}
                      alt="QQ Plot"
                    />
                  </div>
                  <div class="col-md-6">
                    <img
                      class="img-fluid"
                      src={'assets/images/samples/heatmap.jpg'}
                      alt="Heatmap"
                    />
                  </div>
                </div>
              </Tab.Pane>

              <Tab.Pane eventKey="phenotypes">
                <h2 class="font-weight-light">Phenotypes</h2>

                <hr />

                <h3 class="h5">Phenotype Definition</h3>
                <p>Sample Text</p>

                <h3 class="h5">Summary</h3>
                <p>Sample Text</p>

                <img
                  class="img-fluid"
                  src={'assets/images/samples/phenotype_figure.png'}
                  alt="Phenotype Figure 1"
                />
              </Tab.Pane>
            </Tab.Content>
          </Card.Body>
        </Tab.Container>
      </Card>
    </div>
  );
}

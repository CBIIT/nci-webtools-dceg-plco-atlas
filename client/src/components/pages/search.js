import React from 'react';
import { Card, Nav, Tab } from 'react-bootstrap';
import { ManhattanPlot } from '../plots/manhattan-plot';
import { SearchForm } from '../search-form';

export function Search({ match }) {
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
        <Tab.Container defaultActiveKey={match.params.searchType}>
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
                <h2 className="font-weight-light">Results</h2>

                <hr />

                <ManhattanPlot />

                <hr />

                <img
                  className="img-fluid"
                  src={'assets/images/samples/mirrored_manhattan_plot.png'}
                  alt="Mirrored Manhattan Plot"
                />

                <hr />

                <div className="row">
                  <div className="col-md-6">
                    <img
                      className="img-fluid"
                      src={'assets/images/samples/qq_plot.svg'}
                      alt="QQ Plot"
                    />
                  </div>
                  <div className="col-md-6">
                    <img
                      className="img-fluid"
                      src={'assets/images/samples/heatmap.jpg'}
                      alt="Heatmap"
                    />
                  </div>
                </div>
              </Tab.Pane>

              <Tab.Pane eventKey="phenotypes">
                <h2 className="font-weight-light">Phenotypes</h2>

                <hr />

                <h3 className="h5">Phenotype Definition</h3>
                <p>Sample Text</p>

                <h3 className="h5">Summary</h3>
                <p>Sample Text</p>

                <img
                  className="img-fluid"
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

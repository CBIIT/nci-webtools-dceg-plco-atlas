import React from 'react';
import { Card, Nav, Tab } from 'react-bootstrap';
import { ManhattanPlot } from '../plots/manhattan-plot';
import { SearchForm } from '../search-form';

export function Search({ match }) {
  return (
    <div className="container">
      {/* <h1 className="font-weight-light">Search</h1>
      <hr />

      <Card className="shadow-lg mb-4">
        <Card.Header className="bg-primary text-white font-weight-bolder">
          Enter Parameters
        </Card.Header>
        <Card.Body>
          <SearchForm />
        </Card.Body>
      </Card> */}

      <Card className="shadow-lg mb-4">
        <Tab.Container defaultActiveKey={match.params.searchType}>
          <Card.Header className="bg-primary font-weight-bolder">
            <Nav variant="pills" className="nav-pills-inverse">
              <Nav.Item>
                <Nav.Link eventKey="gwas">GWAS</Nav.Link>
              </Nav.Item>
              {/* <Nav.Item>
                <Nav.Link eventKey="phenotype">Phenotype</Nav.Link>
              </Nav.Item> */}
            </Nav>
          </Card.Header>
          <Card.Body>
            <Tab.Content>
              <Tab.Pane eventKey="gwas">
                <h2 className="font-weight-light">Plots</h2>
                <hr />
                <ManhattanPlot />
              </Tab.Pane>

              {/* <Tab.Pane eventKey="phenotype">
                <h2 className="font-weight-light">Phenotype</h2>

                <hr />

                <h3 className="h5">Phenotype Definition</h3>
                <p>Sample Text</p>

                <h3 className="h5">Summary</h3>
                <p>Sample Text</p>

              </Tab.Pane> */}
            </Tab.Content>
          </Card.Body>
        </Tab.Container>
      </Card>
    </div>
  );
}

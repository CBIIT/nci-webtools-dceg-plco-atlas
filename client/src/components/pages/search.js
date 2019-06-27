import React, { useState } from 'react';
import {
  Form,
  Card,
  Nav,
  Tab,
  Button,
  InputGroup,
  FormControl
} from 'react-bootstrap';

export function Search({ match }) {
  const searchType = match.params.searchType;
  const [tab, setTab] = useState(searchType);

  return (
    <div className="container">
      <h1 className="font-weight-light">Search</h1>
      <hr />

      <Card className="shadow-lg mb-4">
        <Card.Header className="bg-primary text-white font-weight-bolder">
          Enter Parameters
        </Card.Header>
        <Card.Body>
          <Form>
            <Form.Group controlId="trait-search" className="mb-4">
              <Form.Label>
                <b>Trait Search</b>
              </Form.Label>
              <InputGroup>
                <FormControl placeholder="Enter Trait" />
                <InputGroup.Append>
                  <Button variant="primary">Search</Button>
                </InputGroup.Append>
              </InputGroup>
            </Form.Group>

            <Form.Group controlId="trait-list">
              <Form.Label>
                <b>Trait List</b>
              </Form.Label>
              <InputGroup>
                <InputGroup.Prepend>
                  <Form.Control as="select">
                    <option>Categorical</option>
                    <option>Alphabetic</option>
                  </Form.Control>
                </InputGroup.Prepend>
                <Form.Control as="select">
                  <option hidden>Select a trait</option>
                  <optgroup label="Group A">
                    <option>Sample Trait A1</option>
                    <option>Sample Trait A2</option>
                  </optgroup>
                  <optgroup label="Group B">
                    <option>Sample Trait B1</option>
                    <option>Sample Trait B2</option>
                  </optgroup>
                </Form.Control>
                <InputGroup.Append>
                  <Button variant="primary">Go</Button>
                </InputGroup.Append>
              </InputGroup>
            </Form.Group>
          </Form>
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

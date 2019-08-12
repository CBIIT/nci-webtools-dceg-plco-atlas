import React, { useState } from 'react';
import { Nav, Tab } from 'react-bootstrap';
import { SearchFormTrait } from '../forms/search-form-trait';
import { ManhattanPlot } from '../plots/manhattan-plot';
import { QQPlot } from '../plots/qq-plot';

export function SummaryResults({ params, setParams }) {
  const [submitted, setSubmitted] = useState(false);
  const [trait, setTrait] = useState(null);
  const [messages, setMessages] = useState([]);

  return (
    <>
        <div className="card shadow-sm mb-4">
            <div className="card-body">
                <SearchFormTrait
                    params={params}
                    onChange={e => {
                      setSubmitted(false);
                      setParams(e);
                    }}
                    onSubmit={phenotype => {
                      setSubmitted(true);
                      setTrait(phenotype);

                      setMessages([]);
                      // currently, only the example phenotype is supported
                      if (!phenotype) {
                        setMessages([{
                          type: 'alert-danger',
                          content: 'Please select a phenotype.'
                        }])
                      } else if (phenotype != 'example') {
                        setMessages([{
                          type: 'alert-danger',
                          content: 'No data are available for the selected phenotype.'
                        }])
                      }
                    }}
                />

                {
                  submitted && messages.map(({type, content}, index) => (
                    <div className={`alert ${type}`}>
                      { content }

                      <button type="button" class="close" onClick={e => setMessages([])} aria-label="Close">
                        <span aria-hidden="true">&times;</span>
                      </button>
                    </div>
                  ))
                }
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
                            <QQPlot trait={trait} />
                        </Tab.Pane>
                    </Tab.Content>
                </div>
            </Tab.Container>
        </div>
    </>
  );
}

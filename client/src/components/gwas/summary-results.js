import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Alert, Nav, Tab } from 'react-bootstrap';
import { SearchFormTrait } from '../forms/search-form-trait';
import { ManhattanPlot } from '../plots/manhattan-plot';
import { QQPlot } from '../plots/qq-plot';
import { updateSummaryResults } from '../../services/actions';

export function SummaryResults() {
  const dispatch = useDispatch();
  const summaryResults = useSelector(state => state.summaryResults);
  const { submitted, messages, drawManhattanPlot, drawQQPlot } = summaryResults;

  const setSubmitted = submitted => {
    dispatch(updateSummaryResults({submitted}));
  }

  // registers a function we can use to draw the manhattan plot
  const setDrawManhattanPlot = drawManhattanPlot => {
    dispatch(updateSummaryResults({drawManhattanPlot}));
  }

  // registers a function we can use to draw the qq plot
  const setDrawQQPlot = drawQQPlot => {
    dispatch(updateSummaryResults({drawQQPlot}));
  }

  const setMessages = messages => {
    dispatch(updateSummaryResults({messages}));
  }

  const clearMessages = e => {
    setMessages([]);
  }

  const handleSubmit = params => {
    setSubmitted(new Date());
    console.log(params);

    if (!params || !params.value) {
      setMessages([{
        type: 'danger',
        content: 'The selected phenotype has no data.'
      }]);
      return;
    }

    if (drawManhattanPlot)
      drawManhattanPlot(params.value);

    if (drawQQPlot)
      drawQQPlot(params.value);
  }

  return (
    <>
        <div className="card shadow-sm mb-4">
            <div className="card-body">
                <SearchFormTrait onSubmit={handleSubmit} onChange={clearMessages} />
                {submitted && messages.map(({type, content}, index) => (
                    <Alert variant={type} onClose={clearMessages} dismissible>
                      { content }
                    </Alert>
                  ))}
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
                            <ManhattanPlot drawFunctionRef={setDrawManhattanPlot} />
                        </Tab.Pane>

                        <Tab.Pane eventKey="qq-plot">
                            <QQPlot drawFunctionRef={setDrawQQPlot} />
                        </Tab.Pane>
                    </Tab.Content>
                </div>
            </Tab.Container>
        </div>
    </>
  );
}

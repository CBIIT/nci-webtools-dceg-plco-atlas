import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { SearchFormTraits } from '../forms/search-form-traits';
import { Heatmap } from '../plots/heatmap-plot';
import { Card } from 'react-bootstrap';
import {
  updatePhenotypeCorrelations,
  drawHeatmap
} from '../../services/actions';

export function PhenotypeCorrelations() {
  const dispatch = useDispatch();
  const phenotypeCorrelations = useSelector(
    state => state.phenotypeCorrelations
  );
  const { submitted, messages } = phenotypeCorrelations;

  const setSubmitted = submitted => {
    dispatch(updatePhenotypeCorrelations({ submitted }));
  };

  const setMessages = messages => {
    dispatch(updatePhenotypeCorrelations({ messages }));
  };

  const clearMessages = e => {
    setMessages([]);
  };

  const handleChange = () => {
    clearMessages();
    setSubmitted(null);
  };

  const handleSubmit = params => {
    setSubmitted(new Date());
    console.log('submit');

    if (!params) {
      setMessages([
        {
          type: 'danger',
          content: 'The selected phenotypes have no data.'
        }
      ]);
      return;
    }

    dispatch(drawHeatmap(params));
  };

  return (
    <>
      <SearchFormTraits onSubmit={handleSubmit} onChange={handleChange} />

      <Card className="mb-4">
        <Card.Header className="bg-egg font-weight-bolder text-center">
          Heatmap
        </Card.Header>
        <Card.Body>
          <div className="row">
            <Heatmap />
            {/* <div className="col-md-12 text-left">
              <pre>{JSON.stringify(phenotypeCorrelations, null, 2)}</pre>
            </div> */}
          </div>
        </Card.Body>
      </Card>
    </>
  );
}

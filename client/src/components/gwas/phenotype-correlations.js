import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { updatePhenotypeCorrelations } from '../../services/actions';
import { SearchFormTraits } from '../forms/search-form-traits';
import { Heatmap } from '../plots/heatmap-plot';
import { Card } from 'react-bootstrap';

export function PhenotypeCorrelations() {
  const dispatch = useDispatch();
  const phenotypeCorrelations = useSelector(
    state => state.phenotypeCorrelations
  );
  const { submitted, messages, drawHeatmap } = phenotypeCorrelations;

  const setSubmitted = submitted => {
    dispatch(updatePhenotypeCorrelations({ submitted }));
  };

  // registers a function we can use to draw the qq plot
  const setDrawHeatmap = drawHeatmap => {
    dispatch(updatePhenotypeCorrelations({ drawHeatmap }));
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
    // setSelectedChromosome(null);
    console.log(params);

    if (!params || !params.value) {
      setMessages([
        {
          type: 'danger',
          content: 'The selected phenotype has no data.'
        }
      ]);
      return;
    }

    if (drawHeatmap) drawHeatmap(params.value);
  };

  return (
    <>
      <Card className="mb-4">
        <Card.Body>
          <SearchFormTraits onSubmit={handleSubmit} onChange={handleChange} />
        </Card.Body>
      </Card>

      <Card className="mb-4">
        <Card.Body>
          <div className="row">
            <Heatmap drawFunctionRef={setDrawHeatmap} />
            {/* <div className="col-md-12 text-left">
              <pre>{JSON.stringify(phenotypeCorrelations, null, 2)}</pre>
            </div> */}
          </div>
        </Card.Body>
      </Card>
    </>
  );
}

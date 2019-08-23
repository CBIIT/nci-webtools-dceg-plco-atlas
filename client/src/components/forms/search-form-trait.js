import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Form, FormControl, InputGroup } from 'react-bootstrap';
import { updateSummaryResults } from '../../services/actions';
import Select, { components } from 'react-select';

export function SearchFormTrait({ onChange, onSubmit }) {
  const dispatch = useDispatch();
  const summaryResults = useSelector(state => state.summaryResults);
  const phenotypes = useSelector(state => state.phenotypes);
  const { selectedListType, selectedPhenotype } = summaryResults;

  const setSelectedPhenotype = selectedPhenotype => {
    dispatch(updateSummaryResults({ selectedPhenotype }));
  };

  const setSelectedListType = selectedListType => {
    dispatch(updateSummaryResults({ selectedListType }));
  };

  const handleChange = params => {
    setSelectedPhenotype(params);
    onChange(params);
  };

  const alphabetizedPhenotypes = [...phenotypes].sort((a, b) =>
    a.label.localeCompare(b.label)
  );

  const categorizedPhenotypes = phenotypes.map(e => {
    const spaces = String.fromCharCode(160).repeat(e.level * 2);
    let label = spaces + e.label;
    return { ...e, label };
  });

  const SingleValue = props => (
    <components.SingleValue {...props}>
      {props.data.label.trim()}
    </components.SingleValue>
  );

  return (
    <Form>
      <Form.Group controlId="phenotype-list">
        <Form.Label>
          <b>Select Phenotype</b>
        </Form.Label>
        <InputGroup>
          <InputGroup.Prepend>
            <select
              class="form-control"
              value={selectedListType}
              onChange={e => setSelectedListType(e.target.value)}>
              <option value="alphabetic">Alphabetic</option>
              <option value="categorical">Categorical</option>
            </select>
          </InputGroup.Prepend>

          <div style={{ width: '60%' }}>
            <Select
              placeholder="(Select a phenotype)"
              value={selectedPhenotype}
              onChange={handleChange}
              isOptionDisabled={option => option.value === null}
              options={
                selectedListType === 'categorical'
                  ? categorizedPhenotypes
                  : alphabetizedPhenotypes
              }
              components={{ SingleValue }}
            />
          </div>

          <InputGroup.Append>
            <button
              className="btn btn-primary"
              onClick={e => {
                e.preventDefault();
                onSubmit(selectedPhenotype);
              }}>
              Submit
            </button>
          </InputGroup.Append>
        </InputGroup>
      </Form.Group>
    </Form>
  );
}

import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Form, Button, Row, Col } from 'react-bootstrap';
import { query } from '../../services/query';
import Select, { components } from 'react-select';
import { updatePhenotypeCorrelations } from '../../services/actions';

export function SearchFormTraits({ onChange, onSubmit }) {
  const dispatch = useDispatch();
  const phenotypes = useSelector(state => state.phenotypes);
  const phenotypeCorrelations = useSelector(
    state => state.phenotypeCorrelations
  );
  const { selectedListType, selectedPhenotypes } = phenotypeCorrelations;

  const setSelectedPhenotypes = selectedPhenotypes => {
    dispatch(updatePhenotypeCorrelations({ selectedPhenotypes }));
  };

  const setSelectedListType = selectedListType => {
    dispatch(updatePhenotypeCorrelations({ selectedListType }));
  };

  const handleChange = params => {
    setSelectedPhenotypes(params);
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

  const MultiValue = props => (
    <components.MultiValue {...props}>
      {props.data.label.trim()}
    </components.MultiValue>
  );

  return (
    <Form>
      <Row controlId="phenotype-list">
        <Form.Label column sm={3}>
          Sort phenotypes by
        </Form.Label>
        <Col sm={2}>
          <select
            className="form-control"
            value={selectedListType}
            onChange={e => setSelectedListType(e.target.value)}>
            <option value="alphabetic">Alphabetic</option>
            <option value="categorical">Categorical</option>
          </select>
        </Col>
      </Row>

      <Row className="mt-3" controlId="phenotype-list">
        <Form.Label column sm={3}>
          Choose phenotypes
        </Form.Label>
        <Col sm={9}>
          <Select
            placeholder="Select two or more phenotypes"
            value={selectedPhenotypes}
            onChange={handleChange}
            // isOptionDisabled={option => option.value === null}
            options={
              selectedListType === 'categorical'
                ? categorizedPhenotypes
                : alphabetizedPhenotypes
            }
            isMulti
            components={{ MultiValue }}
          />
        </Col>
      </Row>

      <Row className="mt-3" controlId="phenotype-list">
        <Col sm={{ span: 9, offset: 3 }}>
          <Button
            variant="primary"
            disabled={!(selectedPhenotypes && selectedPhenotypes.length >= 2)}
            onClick={e => {
              e.preventDefault();
              onSubmit(selectedPhenotypes);
            }}>
            Submit
          </Button>
        </Col>
      </Row>
    </Form>
  );
}

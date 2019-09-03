import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Form, InputGroup, Button, Row, Col } from 'react-bootstrap';
import { updateSummaryResults } from '../../services/actions';
import Select, { components } from 'react-select';
import DropdownTreeSelect from 'react-dropdown-tree-select';
import 'react-dropdown-tree-select/dist/styles.css';


export function SearchFormTrait({ onChange, onSubmit }) {
  const dispatch = useDispatch();
  const summaryResults = useSelector(state => state.summaryResults);
  const phenotypes = useSelector(state => state.phenotypes);
  const phenotypesTree = useSelector(state => state.phenotypesTree);
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
          Choose phenotype
        </Form.Label>
        <Col sm={9}>
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
        </Col>
      </Row>

      <Row className="mt-3" controlId="phenotype-list">
        <Form.Label column sm={3}>
          Choose phenotype x2
        </Form.Label>
        <Col sm={9}>
          <DropdownTreeSelect 
            className="dropdown-tree"
            data={phenotypesTree} 
            mode="radioSelect"
            />
        </Col>
      </Row>

      <Row className="mt-2" controlId="phenotype-list">
        <Col sm={{ span: 9, offset: 3 }}>
          <Button
            variant="primary"
            onClick={e => {
              e.preventDefault();
              onSubmit(selectedPhenotype);
            }}>
            Submit
          </Button>
        </Col>
      </Row>




      {/* <div className="row">
        <div className="col-md-12">
          <Form.Group controlId="phenotype-list">
            <Form.Label>
              Choose phenotype:
            </Form.Label>
           
              <select
                className="form-control"
                value={selectedListType}
                onChange={e => setSelectedListType(e.target.value)}>
                <option value="alphabetic">Alphabetic</option>
                <option value="categorical">Categorical</option>
              </select>

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
          
          </Form.Group>
        </div>

        <div className="col-md-12">
          <DropdownTreeSelect 
            className="dropdown-tree"
            data={phenotypesTree} 
            mode="radioSelect"
            />
        </div>

        <div className="col-md-12">
          <Button
            variant="primary"
            onClick={e => {
              e.preventDefault();
              onSubmit(selectedPhenotype);
            }}>
            Submit
          </Button>
        </div>
      </div> */}




      
    </Form>
  );
}

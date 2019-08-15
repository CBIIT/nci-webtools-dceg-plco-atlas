import React, { useState, useEffect } from 'react';
import { Form, InputGroup } from 'react-bootstrap';
import { query } from '../../services/query';
import Select from 'react-select';


export function SearchFormTraits({ params, onChange, onSubmit }) {
  const [listType, setListType] = useState('alphabetic');
  const [phenotypes, setPhenotypes] = useState([]);
  const [phenotypesCat, setPhenotypesCat] = useState([]);
  const [selectedPhenotypes, setSelectedPhenotypes] = useState(null);

  useEffect(() => {
    let records = [];
    function populateRecords(node) {
      records.push(node);
      if (node.children)
        node.children.forEach(populateRecords);
    }

    query('data/phenotypes.json').then(data => {
      data.forEach(populateRecords, 0);
      setPhenotypes(records);
      // clone array for categorical display
      let recordsCat = JSON.parse(JSON.stringify(records));
      recordsCat.map(e => (
        e.label = String.fromCharCode(160).repeat(e.level * 8) + e.label
      ))
      setPhenotypesCat(recordsCat);
    })

  }, [])

  return (
    <Form>
      <Form.Group controlId="trait-list">
        <Form.Label>
          <b>Select Phenotypes</b>
        </Form.Label>
        <InputGroup>
          {/* alpha/categorical select */}
          <InputGroup.Prepend>
            <select
              class="form-control"
              value={listType}
              onChange={e => setListType(e.target.value)}>
              <option value="alphabetic">Alphabetic</option>
              <option value="categorical">Categorical</option>
            </select>
          </InputGroup.Prepend>

          {/* trait multi-select */}
          <div style={{width: '60%'}}>
            <Select
              placeholder="(Select two or more traits) *"
              value={selectedPhenotypes}
              onChange={(value) => handleChange(value)}
              options={listType === 'categorical' ? phenotypesCat : phenotypes}
              isOptionDisabled={(option) => option.value === null}
              isMulti
            />            
          </div>
          {/* submit button */}
          {/* disable submit button if required fields are empty */}
          <InputGroup.Append>
            <button 
              className="btn btn-primary" 
              // onClick={e => onSubmit({selectedOption, selectedVariant})} 
              onClick={e => onSubmit({selectedPhenotypes})}
              disabled={!((selectedPhenotypes && selectedPhenotypes.length >= 2))}>
              Submit
            </button>
          </InputGroup.Append>
        </InputGroup>
      </Form.Group>
    </Form>
  );

  function handleChange(value) {
    setSelectedPhenotypes(value);
  };
}

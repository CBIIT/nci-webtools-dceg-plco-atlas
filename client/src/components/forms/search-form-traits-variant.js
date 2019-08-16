import React, { useState, useEffect } from 'react';
import { Form, FormControl, InputGroup } from 'react-bootstrap';
import { query } from '../../services/query';
import Select from 'react-select';


export function SearchFormTraitsVariant({ params, onChange, onSubmit }) {
  const [listType, setListType] = useState('alphabetic');
  const [phenotypes, setPhenotypes] = useState([]);
  const [phenotypesCat, setPhenotypesCat] = useState([]);
  const [selectedPhenotypes, setSelectedPhenotypes] = useState(null);
  const [selectedVariant, setSelectedVariant] = useState(null);

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
          <b>Select Phenotype(s) and Input Variant</b>
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
              placeholder="(Select one or more traits) *"
              value={selectedPhenotypes}
              onChange={(value) => handleChange(value)}
              options={listType === 'categorical' ? phenotypesCat : phenotypes}
              isOptionDisabled={(option) => option.value === null}
              isMulti
            />            
          </div>
          {/* variant input */}
          <FormControl
            class="form-control"
            placeholder="(Variant) *"
            aria-label="Variant (required)"
            onChange={e => setSelectedVariant(e.target.value)}
            // onChange={e => validateVariantInput(e.target.value)}
            type="text"
            required
          />
          {/* submit button */}
          {/* disable submit button if required fields are empty */}
          <InputGroup.Append>
            <button 
              className="btn btn-primary" 
              // onClick={e => onSubmit({selectedPhenotypes, selectedVariant})} 
              onClick={e => validateVariantInput(selectedPhenotypes, selectedVariant)}
              disabled={!((selectedPhenotypes && selectedPhenotypes.length > 0) && (selectedVariant && selectedVariant.length > 0))}>
              Submit
            </button>
          </InputGroup.Append>
        </InputGroup>
      </Form.Group>
    </Form>
  );

  function validateVariantInput(selectedPhenotypes, selectedVariant) {
    // console.log(selectedVariant);
    if (selectedVariant.match(/^[r|R][s|S][0-9]+$/) != null || selectedVariant.match(/^([c|C][h|H][r|R])?(([1-9]|[1][0-9]|[2][0-2])|[x|X|y|Y]):[0-9]+$/) != null) {
      // console.log("valid");
      onSubmit({
        selectedPhenotypes, 
        selectedVariant
      })
    } else {
      // console.log("invalid");
      onSubmit({
        selectedPhenotypes, 
        selectedVariant,
        error: "Invalid variant input."
      })
    }
  }

  function handleChange(value) {
    setSelectedPhenotypes(value);
    // console.log(`Option selected:`, selectedPhenotypes);
  };
}

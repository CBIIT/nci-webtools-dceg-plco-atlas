import React, { useState, useEffect } from 'react';
import { Form, InputGroup } from 'react-bootstrap';
import { query } from '../../services/query';

export function SearchFormTrait({ params, onChange, onSubmit }) {
  const [listType, setListType] = useState('alphabetic');
  const [phenotype, setPhenotype] = useState(null);
  const [phenotypes, setPhenotypes] = useState([]);

  useEffect(() => {
    let records = [];
    function populateRecords(node) {
      records.push(node);
      if (node.children)
        node.children.forEach(populateRecords);
    }

    query('data/phenotypes.json').then(data => {
      data.forEach(populateRecords, 0);
      console.log(records);
      setPhenotypes(records);
    })

  }, [])

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
              value={listType}
              onChange={e => setListType(e.target.value)}>
              <option value="alphabetic">Alphabetic</option>
              <option value="categorical">Categorical</option>
            </select>
          </InputGroup.Prepend>

          <select
            class="form-control"
            value={params.phenotype}
            onChange={e => {
              const value = e.target.value;
              onChange({ ...params, phenotype: value });
              setPhenotype(value);
            }}>
            <option hidden value="">(Select a phenotype)</option>
            {listType === 'alphabetic' && phenotypes.map(e => (
              <option value={e.value} disabled={e.value === null}>
                {e.label}
              </option>
            ))}

            {listType === 'categorical' && phenotypes.map(e => (
              <option value={e.value} disabled={e.value === null}>
                {String.fromCharCode(160).repeat(e.level * 8)}{e.label}
              </option>
            ))}



          </select>
          <InputGroup.Append>
            <button className="btn btn-primary" onClick={e => { e.preventDefault(); onSubmit(phenotype); }}>
              Submit
            </button>
          </InputGroup.Append>
        </InputGroup>
      </Form.Group>
    </Form>
  );
}

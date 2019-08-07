import React, { useState } from 'react';
import { Form, FormControl, InputGroup } from 'react-bootstrap';

export function SearchForm({ params, onChange, onSubmit }) {
  const [listType, setListType] = useState('alphabetic');

  const categories = [
    'Sample Category A',
    'Sample Category B',
    'Sample Category C'
  ];

  const phenotypes = [
    {
      value: `example`,
      label: `Ewing's Sarcoma`,
      category: 'Sample Category A'
    },
    {
      value: `example_2a`,
      label: `Sample phenotype 2A`,
      category: 'Sample Category A'
    },
    {
      value: `example_1b`,
      label: `Sample phenotype 2A`,
      category: 'Sample Category B'
    },
    {
      value: `example_2b`,
      label: `Sample phenotype 2A`,
      category: 'Sample Category B'
    },
    {
      value: `example_1c`,
      label: `Sample phenotype 2A`,
      category: 'Sample Category C'
    },
    {
      value: `example_2c`,
      label: `Sample phenotype 2A`,
      category: 'Sample Category C'
    }
  ];

  return (
    <Form>
      <Form.Group controlId="phenotype-list">
        <Form.Label>
          <b>Phenotype List</b>
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
            onChange={e => onChange({ ...params, phenotype: e.target.value })}>
            <option hidden>Select a phenotype</option>

            {listType === 'categorical' &&
              categories.map(category => (
                <optgroup label={category}>
                  {phenotypes
                    .filter(t => t.category === category)
                    .map(t => (
                      <option value={t.value}>{t.label}</option>
                    ))}
                </optgroup>
              ))}

            {listType == 'alphabetic' &&
              phenotypes.map(t => <option value={t.value}>{t.label}</option>)}
          </select>
          <InputGroup.Append>
            <button className="btn btn-primary" onClick={onSubmit}>
              Submit
            </button>
          </InputGroup.Append>
        </InputGroup>
      </Form.Group>
    </Form>
  );
}

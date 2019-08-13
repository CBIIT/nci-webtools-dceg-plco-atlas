import React, { useState } from 'react';
import { Form, InputGroup } from 'react-bootstrap';
import Select from 'react-select';


export function SearchFormTraits({ params, onChange, onSubmit }) {
  const [listType, setListType] = useState('alphabetic');

  const categories = [
    'Sample Category A',
    'Sample Category B',
    'Sample Category C'
  ];

  const traits = [
    {
      value: `example`,
      label: `Ewing's Sarcoma`,
      category: 'Sample Category A'
    },
    {
      value: `example_2a`,
      label: `Sample trait 2A`,
      category: 'Sample Category A'
    },
    {
      value: `example_1b`,
      label: `Sample trait 2A`,
      category: 'Sample Category B'
    },
    {
      value: `example_2b`,
      label: `Sample trait 2A`,
      category: 'Sample Category B'
    },
    {
      value: `example_1c`,
      label: `Sample trait 2A`,
      category: 'Sample Category C'
    },
    {
      value: `example_2c`,
      label: `Sample trait 2A`,
      category: 'Sample Category C'
    }
  ];
  
  const [selectedOption, setSelectedOption] = useState(null);

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
              value={selectedOption}
              onChange={(value) => handleChange(value)}
              options={listType === 'categorical' ? categorizeTraits(traits) : traits}
              isMulti
            />            
          </div>
          {/* submit button */}
          {/* disable submit button if required fields are empty */}
          <InputGroup.Append>
            <button 
              className="btn btn-primary" 
              // onClick={e => onSubmit({selectedOption, selectedVariant})} 
              onClick={e => onSubmit({selectedOption})}
              disabled={!((selectedOption && selectedOption.length >= 2))}>
              Submit
            </button>
          </InputGroup.Append>
        </InputGroup>
      </Form.Group>
    </Form>
  );

  function categorizeTraits(traits) {
    var categorized = categories.map(function(category) {
        return {
          label: category,
          options: traits.filter(t => t.category === category).map(t => (
              {
                label: t.label,
                value: t.value
              }
            )
          )
        }
      }
    );
    return categorized;
  }

  function handleChange(selectedOption) {
    setSelectedOption(selectedOption);
    console.log(`Option selected:`, selectedOption);
  };
}

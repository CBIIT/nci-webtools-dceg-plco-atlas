import React, { useState } from 'react';
import { Form, FormControl, InputGroup } from 'react-bootstrap';
import Select from 'react-select';


export function SearchFormTraitsVariant({ params, onChange, onSubmit }) {
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
  const [selectedVariant, setSelectedVariant] = useState(null);

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
              value={selectedOption}
              onChange={(value) => handleChange(value)}
              options={listType === 'categorical' ? categorizeTraits(traits) : traits}
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
              // onClick={e => onSubmit({selectedOption, selectedVariant})} 
              onClick={e => validateVariantInput(selectedOption, selectedVariant)}
              disabled={!((selectedOption && selectedOption.length > 0) && (selectedVariant && selectedVariant.length > 0))}>
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

  function validateVariantInput(selectedOption, selectedVariant) {
    console.log(selectedVariant);
    if (selectedVariant.match(/^[r|R][s|S][0-9]+$/) != null || selectedVariant.match(/^[c|C][h|H][r|R](([1-9]|[1][0-9]|[2][0-2])|[x|X|y|Y]):[0-9]+$/) != null) {
      // console.log("valid");
      onSubmit({
        selectedOption, 
        selectedVariant
      })
    } else {
      // console.log("invalid");
      onSubmit({
        selectedOption, 
        selectedVariant,
        error: "Invalid variant input."
      })
    }
  }

  // function validateVariantInput(selectedVariant) {
  //   console.log(selectedVariant);
  //   if (selectedVariant.match(/^[r|R][s|S][0-9]+$/) != null || selectedVariant.match(/^[c|C][h|H][r|R](([1-9]|[1][0-9]|[2][0-2])|[x|X|y|Y]):[0-9]+$/) != null) {
  //     console.log("valid");
  //     setSelectedVariant(selectedVariant);
  //   } else {
  //     console.log("invalid");
  //     setSelectedVariant(selectedVariant);
  //   }
  // }

  function handleChange(selectedOption) {
    setSelectedOption(selectedOption);
    console.log(`Option selected:`, selectedOption);
  };
}

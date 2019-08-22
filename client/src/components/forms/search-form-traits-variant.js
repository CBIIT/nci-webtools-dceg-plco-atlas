import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Form, FormControl, InputGroup } from 'react-bootstrap';
import { updateVariantLookup } from '../../services/actions';
import Select, { components } from 'react-select';

export function SearchFormTraitsVariant({ onSubmit }) {
  const dispatch = useDispatch();
  const phenotypes = useSelector(state => state.phenotypes);
  const variantLookup = useSelector(state => state.variantLookup);
  const { selectedListType, selectedPhenotypes, selectedVariant, selectedGender } = variantLookup;

  const setSelectedListType = selectedListType => {
    dispatch(updateVariantLookup({ selectedListType }));
  }

  const setSelectedPhenotypes = selectedPhenotypes => {
    dispatch(updateVariantLookup({selectedPhenotypes}));
  }

  const setSelectedVariant = selectedVariant => {
    dispatch(updateVariantLookup({selectedVariant}));
  }

  const setSelectedGender = selectedGender => {
    dispatch(updateVariantLookup({selectedGender}));
  }

  const alphabetizedPhenotypes = [...phenotypes]
    .sort((a, b) => a.label.localeCompare(b.label))

  const categorizedPhenotypes = phenotypes.map(e => {
    const spaces = String.fromCharCode(160).repeat(e.level * 2);
    let label = spaces + e.label;
    return {...e, label};
  });

  const canSubmit = (selectedPhenotypes && selectedPhenotypes.length > 0) &&
    (selectedVariant && selectedVariant.length > 0)

  const validateVariantInput = e=> {
    e.preventDefault();
    // console.log(selectedVariant);
    // (/^rs\d+/i).test(selectedVariant)

    if (
      selectedVariant.match(/^[r|R][s|S][0-9]+$/) != null ||
      selectedVariant.match(/^([c|C][h|H][r|R])?(([1-9]|[1][0-9]|[2][0-2])|[x|X|y|Y]):[0-9]+$/) != null
    ) {
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

  const MultiValue = props => (
    <components.MultiValue {...props}>
      {props.data.label.trim()}
    </components.MultiValue>
  );

  return (
    <Form>
      <Form.Group controlId="trait-list">
        <Form.Label>
          <b>Select Phenotype(s) and Input Variant</b>
        </Form.Label>
        <InputGroup>
          {/* gender select */}
          <InputGroup.Prepend>
            <select
              class="form-control"
              value={selectedGender}
              onChange={e => setSelectedGender(e.target.value)}>
              <option value="combined">Combined</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
            </select>
          </InputGroup.Prepend>

          {/* alpha/categorical select */}
          <InputGroup.Prepend>
            <select
              class="form-control"
              value={selectedListType}
              onChange={e => setSelectedListType(e.target.value)}>
              <option value="alphabetic">Alphabetic</option>
              <option value="categorical">Categorical</option>
            </select>
          </InputGroup.Prepend>

          {/* trait multi-select */}
          <div style={{width: '50%'}}>
            <Select
              placeholder="(Select one or more phenotypes) *"
              value={selectedPhenotypes}
              onChange={setSelectedPhenotypes}
              isOptionDisabled={(option) => option.value === null}
              options={selectedListType === 'categorical'
                ? categorizedPhenotypes
                : alphabetizedPhenotypes}
              isMulti
              components={{ MultiValue }}
            />
          </div>
          {/* variant input */}
          <FormControl
            class="form-control"
            placeholder="(Variant rsid or coordinate) *"
            aria-label="Variant (required)"
            value={selectedVariant}
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
              onClick={validateVariantInput}
              disabled={!canSubmit}>
              Submit
            </button>
          </InputGroup.Append>
        </InputGroup>
      </Form.Group>
    </Form>
  );
}

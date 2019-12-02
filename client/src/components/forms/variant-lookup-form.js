import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Button } from 'react-bootstrap';
import { updateVariantLookup } from '../../services/actions';
import { TreeSelectCustom } from '../controls/tree-select-custom';

export function VariantLookupForm({ onChange, onSubmit, onReset }) {
  const dispatch = useDispatch();
  const phenotypes = useSelector(state => state.phenotypes);
  const phenotypeCategories = useSelector(state => state.phenotypeCategories);
  const phenotypesTree = useSelector(state => state.phenotypesTree);
  const variantLookup = useSelector(state => state.variantLookup);
  const {
    selectedPhenotypes,
    selectedVariant,
    selectedGender
  } = variantLookup;

  const setSelectedPhenotypes = selectedPhenotypes => {
    dispatch(updateVariantLookup({ selectedPhenotypes }));
  };

  const setSelectedVariant = selectedVariant => {
    dispatch(updateVariantLookup({ selectedVariant }));
  };

  const setSelectedGender = selectedGender => {
    dispatch(updateVariantLookup({ selectedGender }));
  };

  const alphabetizedPhenotypes = [...phenotypes].sort((a, b) =>
    a.title.localeCompare(b.title)
  );

  const handleChangeCustom = items => {
    setSelectedPhenotypes(items);
  };

  return (
    <>
      <b>Phenotypes</b><span style={{color: 'red'}}>*</span>
      <TreeSelectCustom
        data={phenotypesTree}
        dataAlphabetical={alphabetizedPhenotypes}
        dataCategories={phenotypeCategories}
        value={selectedPhenotypes}
        onChange={handleChangeCustom}
      />

      <br></br>

      <b>Variant</b><span style={{color: 'red'}}>*</span>
      <input
        className="form-control"
        // style={{ width: '470px' }}
        placeholder="Enter RS Number or Coordinate"
        aria-label="Variant (required)"
        value={selectedVariant}
        onChange={e => {
          setSelectedVariant(e.target.value);
          onChange(e.target.value);
        }}
        type="text"
        required
      />

      <br></br>

      <b>Gender</b>
      <select
        className="form-control"
        value={selectedGender}
        onChange={e => setSelectedGender(e.target.value)}>
        <option value="combined">All</option>
        <option value="female">Female</option>
        <option value="male">Male</option>
      </select>

      <br></br>

      <Button
        className=""
        style={{ maxHeight: '38px' }}
        variant="silver"
        // disabled={!canSubmit}
        onClick={e => {
          e.preventDefault();
          onSubmit({ selectedPhenotypes, selectedVariant });
        }}>
        Submit
      </Button>

      <Button
        className="ml-2"
        style={{ maxHeight: '38px' }}
        variant="silver"
        onClick={e => {
          e.preventDefault();
          onReset(e);
        }}>
        Reset
      </Button>
    </>
  );
}

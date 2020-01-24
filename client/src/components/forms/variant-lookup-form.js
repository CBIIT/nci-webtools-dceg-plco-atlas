import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Button, OverlayTrigger, Tooltip } from 'react-bootstrap';
import { updateVariantLookup } from '../../services/actions';
import { TreeSelectCustom } from '../controls/tree-select-custom';

export function VariantLookupForm({ onChange, onSubmit, onReset }) {
  const dispatch = useDispatch();
  const phenotypes = useSelector(state => state.phenotypes);
  const phenotypeCategories = useSelector(state => state.phenotypeCategories);
  const phenotypesTree = useSelector(state => state.phenotypesTree);
  const variantLookup = useSelector(state => state.variantLookup);
  const { selectedPhenotypes, selectedVariant, selectedGender } = variantLookup;

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

  const handleKeyPress = e => {
    if(e.key ==='Enter') {
      onSubmit({ selectedPhenotypes, selectedVariant });
    }
  };

  return (
    <> 
      <div className="mb-2">
        <b>Phenotypes</b>
        <span style={{ color: 'red' }}>*</span>
        <TreeSelectCustom
          data={phenotypesTree}
          dataAlphabetical={alphabetizedPhenotypes}
          dataCategories={phenotypeCategories}
          value={selectedPhenotypes}
          onChange={handleChangeCustom}
        />
      </div>

      <div className="mb-2">
        <b>Variant</b>
        <span style={{ color: 'red' }}>*</span>
        <input
          className="form-control"
          placeholder="Enter RS Number or Coordinate"
          aria-label="Variant (required)"
          value={selectedVariant}
          onChange={e => {
            setSelectedVariant(e.target.value);
            onChange(e.target.value);
          }}
          onKeyPress={e => handleKeyPress(e)}
          type="text"
          required
        />
      </div>

      <div className="mb-3">
        <b>Gender</b>
        <select
          className="form-control"
          value={selectedGender}
          onChange={e => setSelectedGender(e.target.value)}>
          <option value="combined">All</option>
          <option value="female">Female</option>
          <option value="male">Male</option>
        </select>
      </div>

      <div>
        <OverlayTrigger overlay={
            <Tooltip id="tooltip-disabled" 
              style={{
                display: 
                  (!selectedPhenotypes || selectedPhenotypes.length < 1) ||
                  (!selectedVariant || selectedVariant.length < 1) 
                  ? 'block' 
                  : 'none'
                }}>
              {
                (!selectedPhenotypes || selectedPhenotypes.length < 1) &&
                (!selectedVariant || selectedVariant.length < 1) && (
                  <>Please select one or more phenotypes and input a search variant.</>
                )
              }
              {
                (!selectedPhenotypes || selectedPhenotypes.length < 1) &&
                (selectedVariant && selectedVariant.length > 0) && (
                  <>Please select one or more phenotypes.</>
                )
              }
              {
                (selectedPhenotypes && selectedPhenotypes.length >= 1) &&
                (!selectedVariant || selectedVariant.length < 1) && (
                  <>Please input a search variant.</>
                )
              }
            </Tooltip>
          }>
          <span className="d-inline-block">
            <Button
              className=""
              style={{ 
                maxHeight: '38px', 
                pointerEvents: 
                  (!selectedPhenotypes || selectedPhenotypes.length < 1) ||
                  (!selectedVariant || selectedVariant.length < 1)
                  ? 'none' 
                  : 'auto' 
                }}
              variant="silver"
              // disabled={!canSubmit}
              onClick={e => {
                e.preventDefault();
                onSubmit({ selectedPhenotypes, selectedVariant });
              }}
              disabled={
                (!selectedPhenotypes || selectedPhenotypes.length < 1) ||
                (!selectedVariant || selectedVariant.length < 1)
              }>
              Submit
            </Button>
          </span>
        </OverlayTrigger>

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
      </div>
    </>
  );
}

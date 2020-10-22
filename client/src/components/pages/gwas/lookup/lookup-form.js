import React, { useState, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Button, OverlayTrigger, Tooltip } from 'react-bootstrap';
import { updateVariantLookup } from '../../../../services/actions';
import { TreeSelect } from '../../../controls/tree-select/tree-select';

export function VariantLookupForm({ onChange, onSubmit, onReset }) {
  const dispatch = useDispatch();
  const phenotypes = useSelector(state => state.phenotypes);
  const variantLookup = useSelector(state => state.variantLookup);
  const { 
    selectedPhenotypes, 
    selectedVariant, 
    selectedSex, 
    selectedAncestry,
    submitted, 
    disableSubmit
  } = variantLookup;

  const handleChangeCustom = items => {
    dispatch(updateVariantLookup({ 
      selectedPhenotypes: items,
      disableSubmit: false
    }));
  };

  const handleKeyPress = e => {
    if(e.key ==='Enter') {
      onSubmit({ 
        phenotypes: selectedPhenotypes, 
        variant: selectedVariant,
        sex: selectedSex,
        ancestry: selectedAncestry
      });
    }
  };

  const treeRef = useRef();

  return (
    <>
      <div className="mb-2">
        <label className="required">Phenotypes</label>
        <TreeSelect
          id="lookup-form-tree-select"
          data={phenotypes}
          value={selectedPhenotypes}
          onChange={handleChangeCustom}
          ref={treeRef}
          enabled={item => item.import_date}
        />
      </div>

      <div className="mb-2">
        <label className="required">Variant</label>
        <textarea
          className="form-control"
          placeholder="Enter RS Numbers or Coordinates"
          aria-label="Variant (required)"
          value={selectedVariant}
          onChange={e => {
            dispatch(updateVariantLookup({ 
              selectedVariant: e.target.value,
              disableSubmit: false
            }));
            onChange(e.target.value);
          }}
          onKeyPress={e => handleKeyPress(e)}
          type="text"
          required
        />
      </div>

      <div className="mb-3">
        <label className="required">Sex</label>
        <select
          className="form-control"
          value={selectedSex}
          onChange={e => {
            // if (e.target.value === 'all') {
            dispatch(updateVariantLookup({ 
              selectedSex: e.target.value,
              disableSubmit: false
            }));
            // } else {
            //   dispatch(updateVariantLookup({ 
            //     selectedSex: e.target.value,
            //     selectedAncestry: 'european',
            //     disableSubmit: false
            //    }));
            // }
          }}
          aria-label="Select sex">
          <option value="all">All</option>
          <option value="female">Female</option>
          <option value="male">Male</option>
        </select>
      </div>

      <div className="mb-3">
        <label className="required">Ancestry</label>
        <select
          className="form-control"
          value={selectedAncestry}
          onChange={e => {
            // if (e.target.value === 'european') {
            dispatch(updateVariantLookup({ 
              selectedAncestry: e.target.value,
              disableSubmit: false
            }));
            // } else {
            //   dispatch(updateVariantLookup({ 
            //     selectedSex: 'all',
            //     selectedAncestry: e.target.value,
            //     disableSubmit: false
            //    }));
            // }
          }}
          aria-label="Select ancestry">
          <option value="european">European</option>
          <option value="east_asian">East Asian</option>
          {/* <option value="white">White</option>
          <option value="black">Black</option>
          <option value="hispanic">Hispanic</option>
          <option value="asian">Asian</option>
          <option value="pacific_islander">Pacific Islander</option>
          <option value="american_indian">American Indian</option> */}
        </select>
      </div>

      <div>
        <OverlayTrigger overlay={
            <Tooltip id="tooltip-disabled"
              style={{
                display: (!selectedPhenotypes || selectedPhenotypes.length < 1) ||
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
              onClick={e => {
                e.preventDefault();
                onSubmit({
                  phenotypes: selectedPhenotypes, 
                  variant: selectedVariant,
                  sex: selectedSex,
                  ancestry: selectedAncestry
                });
              }}
              disabled={
                (!selectedPhenotypes || selectedPhenotypes.length < 1) ||
                (!selectedVariant || selectedVariant.length < 1) ||
                disableSubmit
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
            treeRef.current.resetSearchFilter();
          }}>
          Reset
        </Button>
      </div>
    </>
  );
}

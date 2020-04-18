import React, { useState, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Button, OverlayTrigger, Tooltip } from 'react-bootstrap';
import { updateVariantLookup } from '../../services/actions';
import { TreeSelect } from '../controls/tree-select';

export function VariantLookupForm({ onChange, onSubmit, onReset }) {
  const dispatch = useDispatch();
  const phenotypes = useSelector(state => state.phenotypes);
  const variantLookup = useSelector(state => state.variantLookup);
  const { selectedPhenotypes, selectedVariant, selectedSex, submitted } = variantLookup;

  const setSelectedPhenotypes = selectedPhenotypes => {
    dispatch(updateVariantLookup({ selectedPhenotypes }));
  };

  const setSelectedVariant = selectedVariant => {
    dispatch(updateVariantLookup({ selectedVariant }));
  };

  const setSelectedSex = selectedSex => {
    dispatch(updateVariantLookup({ selectedSex }));
  };

  const handleChangeCustom = items => {
    setSelectedPhenotypes(items);
  };

  const handleKeyPress = e => {
    if(e.key ==='Enter') {
      onSubmit({ 
        phenotypes: selectedPhenotypes, 
        variant: selectedVariant,
        sex: selectedSex
      });
    }
  };

  const treeRef = useRef();

  return (
    <>
      <div className="mb-2">
        <label className="required">Phenotypes</label>
        <TreeSelect
          data={phenotypes}
          value={selectedPhenotypes}
          onChange={handleChangeCustom}
          ref={treeRef}
          submitted={submitted}
        />
      </div>

      <div className="mb-2">
        <label className="required">Variant</label>
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
          disabled={submitted}
          required
        />
      </div>

      <div className="mb-3">
        <label className="required">Sex</label>
        <select
          className="form-control"
          value={selectedSex}
          onChange={e => setSelectedSex(e.target.value)}
          disabled={submitted}>
          <option value="all">All</option>
          <option value="female">Female</option>
          <option value="male">Male</option>
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
                  sex: selectedSex
                });
              }}
              disabled={
                (!selectedPhenotypes || selectedPhenotypes.length < 1) ||
                (!selectedVariant || selectedVariant.length < 1) ||
                submitted
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

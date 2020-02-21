import React, { useState, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Button, OverlayTrigger, Tooltip } from 'react-bootstrap';
import { updatePhenotypeCorrelations } from '../../services/actions';
import { TreeSelect } from '../controls/tree-select';

export function PhenotypeCorrelationsForm({ onChange, onSubmit, onReset }) {
  const dispatch = useDispatch();
  const phenotypes = useSelector(state => state.phenotypes);

  const phenotypeCorrelations = useSelector(
    state => state.phenotypeCorrelations
  );
  const { selectedPhenotypes, selectedGender, submitted } = phenotypeCorrelations;

  const treeRef = useRef();

  const setSelectedPhenotypes = selectedPhenotypes => {
    dispatch(updatePhenotypeCorrelations({ selectedPhenotypes }));
  };

  const setSelectedGender = selectedGender => {
    dispatch(updatePhenotypeCorrelations({ selectedGender }));
  };

  const handleChangeCustom = items => {
    setSelectedPhenotypes(items);
  };

  return (
    <>
      <div className="mb-2">
        <b>Phenotypes</b>
        <span style={{ color: 'red' }}>*</span>
        <TreeSelect
          data={phenotypes}
          value={selectedPhenotypes}
          onChange={handleChangeCustom}
          ref={treeRef}
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
            <Tooltip 
              id="tooltip-disabled" 
              style={{
                display: (!selectedPhenotypes || selectedPhenotypes.length < 2) ? 
                  'block' : 
                  'none'
              }}>
              Please select two or more phenotypes.
            </Tooltip>
          }>
          <span className="d-inline-block">
            <Button
              // ref={target}
              className=""
              style={{ maxHeight: '38px', pointerEvents: (!selectedPhenotypes || selectedPhenotypes.length < 2) ? 'none' : 'auto' }}
              variant="silver"
              onClick={e => {
                e.preventDefault();
                onSubmit(selectedPhenotypes);
              }}
              disabled={(!selectedPhenotypes || selectedPhenotypes.length < 2) || submitted}
              >
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

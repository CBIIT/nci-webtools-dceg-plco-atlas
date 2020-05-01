import React, { useState, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Button, OverlayTrigger, Tooltip } from 'react-bootstrap';
import { updatePhenotypeCorrelations } from '../../../../services/actions';
import { TreeSelect } from '../../../controls/tree-select/tree-select';

export function PhenotypeCorrelationsForm({ onChange, onSubmit, onReset }) {
  const dispatch = useDispatch();
  const phenotypes = useSelector(state => state.phenotypes);

  const { 
    selectedPhenotypes, 
    selectedSex, 
    submitted,
    disableSubmit
  } = useSelector(state => state.phenotypeCorrelations);

  const treeRef = useRef();


  const handleChangeCustom = items => {
    dispatch(updatePhenotypeCorrelations({ 
      selectedPhenotypes: items,
      disableSubmit: false 
    }));
  };

  return (
    <>
      <div className="mb-2">
        <label className="required">Phenotypes</label>
        <TreeSelect
          data={phenotypes}
          value={selectedPhenotypes}
          onChange={handleChangeCustom}
          ref={treeRef}
        />
        <small className="text-muted"><i>Up to 120 phenotypes may be selected.</i></small>
      </div>

      <div className="mb-3">
        <label className="required">Sex</label>
        <select
          className="form-control"
          value={selectedSex}
          onChange={e => {
            dispatch(updatePhenotypeCorrelations({ 
              selectedSex: e.target.value,
              disableSubmit: false 
            }));
          }}
          aria-label="Select sex">
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
                display: !selectedPhenotypes || selectedPhenotypes.length < 2 || selectedPhenotypes.length > 120 ?
                  'block' :
                  'none'
              }}>
              {
                (!selectedPhenotypes || selectedPhenotypes.length < 2) &&
                  <>Please select 2 or more phenotypes.</>
              }
              {
                (selectedPhenotypes && selectedPhenotypes.length > 120) &&
                  <>Please select 120 or less phenotypes.</>
              }

            </Tooltip>
          }>
          <span className="d-inline-block">
            <Button
              // ref={target}
              className=""
              style={{ maxHeight: '38px', pointerEvents: (!selectedPhenotypes || selectedPhenotypes.length < 2 || selectedPhenotypes.length > 120) ? 'none' : 'auto' }}
              variant="silver"
              onClick={e => {
                e.preventDefault();
                onSubmit({
                  phenotypes: selectedPhenotypes, 
                  sex: selectedSex
                });
              }}
              disabled={(!selectedPhenotypes || selectedPhenotypes.length < 2 || selectedPhenotypes.length > 120) || disableSubmit}
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

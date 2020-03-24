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
  const { selectedPhenotypes, selectedSex, submitted } = phenotypeCorrelations;

  const treeRef = useRef();

  const setSelectedPhenotypes = selectedPhenotypes => {
    dispatch(updatePhenotypeCorrelations({ selectedPhenotypes }));
  };

  const setSelectedSex = selectedSex => {
    dispatch(updatePhenotypeCorrelations({ selectedSex }));
  };

  const handleChangeCustom = items => {
    setSelectedPhenotypes(items);
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
          submitted={submitted}
        />
        <small className="text-muted"><i>Up to 120 phenotypes may be selected.</i></small>
      </div>

      <div className="mb-3">
        <label className="required">Sex</label>
        <select
          className="form-control"
          value={selectedSex}
          onChange={e => setSelectedSex(e.target.value)}
          disabled={submitted}>
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
                onSubmit(selectedPhenotypes);
              }}
              disabled={(!selectedPhenotypes || selectedPhenotypes.length < 2 || selectedPhenotypes.length > 120) || submitted}
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

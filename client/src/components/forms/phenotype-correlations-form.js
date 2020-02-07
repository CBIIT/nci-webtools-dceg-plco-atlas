import React, { useState, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Button, OverlayTrigger, Tooltip } from 'react-bootstrap';
import { updatePhenotypeCorrelations } from '../../services/actions';
import { TreeSelect } from '../controls/tree-select';

export function PhenotypeCorrelationsForm({ onChange, onSubmit, onReset }) {
  const dispatch = useDispatch();
  const phenotypes = useSelector(state => state.phenotypes);
  const phenotypeCategories = useSelector(state => state.phenotypeCategories);
  const phenotypesTree = useSelector(state => state.phenotypesTree);

  const phenotypeCorrelations = useSelector(
    state => state.phenotypeCorrelations
  );
  const { selectedPhenotypes, selectedGender } = phenotypeCorrelations;

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

  // const removeTreeDisabled = phenoTree => {
  //   let phenoTreeAllEnabled = [...phenoTree];
  //   let phenoTreeAllEnabledString = JSON.stringify(phenoTreeAllEnabled);
  //   phenoTreeAllEnabledString = phenoTreeAllEnabledString.replace(
  //     /\"disabled\":true/g,
  //     `\"disabled\":false`
  //   );
  //   phenoTreeAllEnabled = JSON.parse(phenoTreeAllEnabledString);
  //   return phenoTreeAllEnabled;
  // };

  // const removeFlatDisabled = phenoList =>
  //   phenoList.map(node => {
  //     return {
  //       value: node.value,
  //       title: node.title
  //     };
  //   });

  const alphabetizedPhenotypes = [...phenotypes].sort((a, b) =>
    a.title.localeCompare(b.title)
  );

  return (
    <>
      <div className="mb-2">
        <b>Phenotypes</b>
        <span style={{ color: 'red' }}>*</span>
        <TreeSelect
          data={phenotypesTree}
          dataAlphabetical={alphabetizedPhenotypes}
          dataCategories={phenotypeCategories}
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
            <Tooltip id="tooltip-disabled" style={{display: (!selectedPhenotypes || selectedPhenotypes.length < 2) ? 'block' : 'none'}}>
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
              disabled={(!selectedPhenotypes || selectedPhenotypes.length < 2)}
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
            treeRef.current.clearSearchFilter();
          }}>
          Reset
        </Button>
      </div>
    </>
  );
}

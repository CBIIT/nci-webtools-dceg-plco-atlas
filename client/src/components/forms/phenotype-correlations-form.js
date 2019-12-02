import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Button } from 'react-bootstrap';
import { updatePhenotypeCorrelations } from '../../services/actions';
import { TreeSelectCustom } from '../controls/tree-select-custom';

export function PhenotypeCorrelationsForm({ onChange, onSubmit, onReset }) {
  const dispatch = useDispatch();
  const phenotypes = useSelector(state => state.phenotypes);
  const phenotypeCategories = useSelector(state => state.phenotypeCategories);
  const phenotypesTree = useSelector(state => state.phenotypesTree);

  const phenotypeCorrelations = useSelector(
    state => state.phenotypeCorrelations
  );
  const {
    selectedPhenotypes,
    selectedGender
  } = phenotypeCorrelations;

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
      <b>Phenotypes</b><span style={{color: 'red'}}>*</span>
      <TreeSelectCustom
        data={phenotypesTree}
        dataAlphabetical={alphabetizedPhenotypes}
        dataCategories={phenotypeCategories}
        value={selectedPhenotypes}
        onChange={handleChangeCustom}
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
        // disabled={!(selectedPhenotypes && selectedPhenotypes.length >= 2)}
        onClick={e => {
          e.preventDefault();
          onSubmit(selectedPhenotypes);
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
      {/* <pre>{JSON.stringify(selectedPhenotypes, null, 2)}</pre> */}
    </>
  );
}

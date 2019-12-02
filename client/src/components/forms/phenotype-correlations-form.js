import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Form, Button, Row, Col } from 'react-bootstrap';
import { updatePhenotypeCorrelations } from '../../services/actions';
import {
  containsVal,
  containsAllVals,
  removeVal,
  removeAllVals,
  getAllLeafs
} from '../controls/tree-select';
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
    selectedListType,
    selectedPhenotypes,
    selectedGender
  } = phenotypeCorrelations;

  const setSelectedPhenotypes = selectedPhenotypes => {
    dispatch(updatePhenotypeCorrelations({ selectedPhenotypes }));
  };

  const setSelectedListType = selectedListType => {
    dispatch(updatePhenotypeCorrelations({ selectedListType }));
  };

  const setSelectedGender = selectedGender => {
    dispatch(updatePhenotypeCorrelations({ selectedGender }));
  };

  const handleChange = (value, label, extra) => {
    let values = extra.preValue;
    let newValues = getAllLeafs(extra);
    if (
      containsAllVals(values, newValues) &&
      values.length >= newValues.length
    ) {
      // remove all leafs if parent is clicked and all leafs were already selected
      values = removeAllVals(values, newValues);
    } else {
      for (var i = 0; i < newValues.length; i++) {
        if (!containsVal(values, newValues[i].value)) {
          // only add if value did not exist before
          values.push(newValues[i]);
        } else {
          // remove if new selected leaf was already selected
          if (newValues.length === 1) {
            values = removeVal(values, newValues[i].value);
          }
        }
      }
    }
    setSelectedPhenotypes(values);
    onChange(values);
  };

  const handleChangeCustom = items => {
    setSelectedPhenotypes(items);
    // console.log("selected", items);
    // conatselectedPhenotypes
  };

  const removeTreeDisabled = phenoTree => {
    let phenoTreeAllEnabled = [...phenoTree];
    let phenoTreeAllEnabledString = JSON.stringify(phenoTreeAllEnabled);
    phenoTreeAllEnabledString = phenoTreeAllEnabledString.replace(
      /\"disabled\":true/g,
      `\"disabled\":false`
    );
    phenoTreeAllEnabled = JSON.parse(phenoTreeAllEnabledString);
    return phenoTreeAllEnabled;
  };

  const removeFlatDisabled = phenoList =>
    phenoList.map(node => {
      return {
        value: node.value,
        title: node.title
      };
    });

  const alphabetizedPhenotypes = [...phenotypes].sort((a, b) =>
    a.title.localeCompare(b.title)
  );

  // const handleListTypeChange = value => {
  //   setSelectedListType(value);
  // };

  return (
    <>
      {/* <form className="sortByToggle">
        <div className="row">
          <div className="col-md-auto pr-0">
            <b>Phenotypes</b>
          </div>
          <div className="col-md-auto radio pr-0">
            <label>
              <input
                className="mr-1"
                type="radio"
                value="categorical"
                checked={selectedListType === 'categorical' ? true : false}
                onChange={e => handleListTypeChange(e.target.value)}
              />
              By Category
            </label>
          </div>
          <div className="col-md-auto radio pr-0">
            <label>
              <input
                className="mr-1"
                type="radio"
                value="alphabetic"
                checked={selectedListType === 'alphabetic' ? true : false}
                onChange={e => handleListTypeChange(e.target.value)}
              />
              By Name
            </label>
          </div>
        </div>
      </form> */}

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

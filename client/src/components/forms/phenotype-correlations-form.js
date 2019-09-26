import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Form, Button, Row, Col } from 'react-bootstrap';
import { updatePhenotypeCorrelations } from '../../services/actions';
import {
  containsVal,
  containsAllVals,
  removeVal,
  removeAllVals,
  getAllLeafs } from '../controls/tree-select';
import TreeSelect, { TreeNode } from 'rc-tree-select';
import 'rc-tree-select/assets/index.css';

export function PhenotypeCorrelationsForm({ onChange, onSubmit, onReset }) {
  const dispatch = useDispatch();
  const phenotypes = useSelector(state => state.phenotypes);
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
    if (containsAllVals(values, newValues) && values.length >= newValues.length) {
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

  const removeTreeDisabled = (phenoTree) => {
    let phenoTreeAllEnabled = [...phenoTree];
    let phenoTreeAllEnabledString = JSON.stringify(phenoTreeAllEnabled)
    phenoTreeAllEnabledString = phenoTreeAllEnabledString.replace(/\"disabled\":true/g, `\"disabled\":false`);
    phenoTreeAllEnabled = JSON.parse(phenoTreeAllEnabledString);
    return phenoTreeAllEnabled;
  }

  const removeFlatDisabled = (phenoList) => phenoList.map(node => {
    return {
      value: node.value,
      title: node.title
    };
  });

  const alphabetizedPhenotypes = [...phenotypes].sort((a, b) =>
    a.title.localeCompare(b.title)
  );

  return (
    <>
      <div className="d-flex mb-2">
        <select
          className="form-control flex-shrink-auto"
          value={selectedListType}
          onChange={e => setSelectedListType(e.target.value)}>
          <option value="alphabetic">Alphabetic</option>
          <option value="categorical">Categorical</option>
        </select>

        <TreeSelect
          className="form-control flex-shrink-auto h-100 p-0"
          dropdownClassName="phenotype-correlations"
          style={{ width: '100%', maxHeight: 76, overflow: 'auto' }}
          dropdownStyle={{ maxHeight: 500, overflow: 'auto' }}
          treeData={
            selectedListType === 'alphabetic'
              ? removeFlatDisabled(alphabetizedPhenotypes)
              : removeTreeDisabled(phenotypesTree)
          }
          value={selectedPhenotypes}
          onChange={handleChange}
          treeNodeFilterProp="title"
          dropdownMatchSelectWidth
          autoClearSearchValue
          // treeDefaultExpandAll
          treeLine
          multiple
          allowClear
          labelInValue
          placeholder="(Select Phenotypes)"
        />

        <select
          className="form-control flex-shrink-auto ml-2"
          value={selectedGender}
          onChange={e => setSelectedGender(e.target.value)}>
          <option value="combined">All</option>
          <option value="female">Female</option>
          <option value="male">Male</option>
        </select>

        <Button
          className="ml-2"
          style={{ maxHeight: '38px' }}
          variant="primary"
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
          variant="secondary"
          onClick={e => {
            e.preventDefault();
            onReset(e);
          }}>
          Reset
        </Button>
      </div>
      {/* <pre>{JSON.stringify(selectedPhenotypes, null, 2)}</pre> */}
    </>
  );
}

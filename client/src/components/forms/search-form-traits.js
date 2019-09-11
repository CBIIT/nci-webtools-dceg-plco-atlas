import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Form, Button, Row, Col } from 'react-bootstrap';
import { updatePhenotypeCorrelations } from '../../services/actions';
import TreeSelect, { TreeNode } from 'rc-tree-select';
import 'rc-tree-select/assets/index.css';

export function SearchFormTraits({ onChange, onSubmit }) {
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

  const handleChange = params => {
    setSelectedPhenotypes(params);
    onChange(params);
  };

  const handleReset = params => {
    dispatch(
      updatePhenotypeCorrelations({
        selectedListType: 'alphabetic',
        selectedPhenotypes: [],
        selectedGender: 'combined',
        heatmapData: [],
        results: [],
        loading: false,
        submitted: null,
        messages: []
      })
    );
  };

  const alphabetizedPhenotypes = [...phenotypes].sort((a, b) =>
    a.label.localeCompare(b.label)
  );

  return (
    <div className="d-flex mb-4">
      <select
        className="form-control flex-shrink-auto"
        value={selectedListType}
        onChange={e => setSelectedListType(e.target.value)}>
        <option value="alphabetic">Alphabetic</option>
        <option value="categorical">Categorical</option>
      </select>

      <TreeSelect
        className="form-control flex-shrink-auto h-100 p-0"
        style={{ width: '100%', maxHeight: 76, overflow: 'auto' }}
        dropdownStyle={{ maxHeight: 500, overflow: 'auto' }}
        treeData={
          selectedListType === 'alphabetic'
            ? alphabetizedPhenotypes
            : phenotypesTree
        }
        value={selectedPhenotypes}
        onChange={handleChange}
        treeNodeFilterProp="label"
        dropdownMatchSelectWidth
        autoClearSearchValue
        treeCheckable
        treeLine
        multiple
        allowClear
        labelInValue
      />

      <select
        className="form-control flex-shrink-auto ml-2"
        value={selectedGender}
        onChange={e => setSelectedGender(e.target.value)}>
        <option value="combined">Combined</option>
        <option value="male">Male</option>
        <option value="female">Female</option>
      </select>

      <Button
        className="ml-2"
        style={{ maxHeight: '38px' }}
        variant="primary"
        disabled={!(selectedPhenotypes && selectedPhenotypes.length >= 2)}
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
          handleReset(e);
        }}>
        Reset
      </Button>
    </div>
  );
}

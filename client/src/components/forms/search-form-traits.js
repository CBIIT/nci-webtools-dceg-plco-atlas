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

  const containsVal = (arr, val) => {
    let result = false;
    for (var i = 0; i < arr.length; i++) {
      if (arr[i].value === val) {
        result = true;
      }
    }

    return result;
  }

  const containsAllVals = (arr, vals) => {
    let result = true;
    for (var i = 0; i < vals.length; i++) {
      if (!containsVal(arr, vals[i].value)) {
        result = false;
      } 
    }
    return result;
  }

  const removeVal = (arr, val) => {
    for (var i = 0; i < arr.length; i++) {
      if (arr[i].value === val) {
        arr.splice(i, 1);
      }
    }
    return arr;
  }

  const removeAllVals = (arr, vals) => {
    for (var i = 0; i < vals.length; i++) {
      removeVal(arr, vals[i].value);
    }
    return arr;
  }

  const getLeafs = (extra, node, allLeafs = []) => {
    if(node.children.length === 0){
      allLeafs.push(node);
    }else{
      for (var i = 0; i < node.children.length; i++) {
        allLeafs = getLeafs(extra, node.children[i].props, allLeafs);
      }
    }
    return allLeafs;
  }

  const getAllLeafs = (extra) => {
    let allLeafs = [];
    let children = extra.triggerNode.props.children.map(child => child.props);
    if (children.length > 0) {
      for (var i = 0; i < children.length; i++) {
        let child = children[i];
        allLeafs = allLeafs.concat(getLeafs(extra, child));
      }
    } else {
      allLeafs.push(extra.triggerNode.props);
    }

    return allLeafs;
  }

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
            console.log("REMOVE ONE", newValues[i]);
            values = removeVal(values, newValues[i].value);
          } 
        }
      }
    }
    setSelectedPhenotypes(values);
    onChange(values);
  };

  const handleReset = params => {
    dispatch(
      updatePhenotypeCorrelations({
        selectedListType: 'categorical',
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
    <>
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
          // treeCheckable={selectedListType === 'categorical' ? true : false}
          // treeCheckStrictly
          treeDefaultExpandAll
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
      {/* <pre>{JSON.stringify(selectedPhenotypes, null, 2)}</pre> */}
    </>
  );
}

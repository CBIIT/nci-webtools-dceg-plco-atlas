import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Form, Button, Row, Col } from 'react-bootstrap';
// import { query } from '../../services/query';
// import Select, { components } from 'react-select';
import { updatePhenotypeCorrelations } from '../../services/actions';
import TreeSelect, { TreeNode, SHOW_PARENT } from 'rc-tree-select';
import 'rc-tree-select/assets/index.css';


export function SearchFormTraits({ onChange, onSubmit }) {
  const dispatch = useDispatch();
  const phenotypes = useSelector(state => state.phenotypes);
  const phenotypesTree = useSelector(state => state.phenotypesTree);


  const phenotypeCorrelations = useSelector(
    state => state.phenotypeCorrelations
  );
  const { selectedListType, selectedPhenotypes } = phenotypeCorrelations;

  const setSelectedPhenotypes = selectedPhenotypes => {
    dispatch(updatePhenotypeCorrelations({ selectedPhenotypes }));
  };

  const setSelectedListType = selectedListType => {
    dispatch(updatePhenotypeCorrelations({ selectedListType }));
  };

  const handleChange = params => {
    setSelectedPhenotypes(params);
    onChange(params);
  };

  const alphabetizedPhenotypes = [...phenotypes].sort((a, b) =>
    a.label.localeCompare(b.label)
  );

  // const categorizedPhenotypes = phenotypes.map(e => {
  //   const spaces = String.fromCharCode(160).repeat(e.level * 2);
  //   let label = spaces + e.label;
  //   return { ...e, label };
  // });

  // const MultiValue = props => (
  //   <components.MultiValue {...props}>
  //     {props.data.label.trim()}
  //   </components.MultiValue>
  // );

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
        style={{ width: '100%' }}
        dropdownStyle={{ maxHeight: 500, overflow: 'auto' }}
        treeData={selectedListType === 'alphabetic' ? alphabetizedPhenotypes : phenotypesTree}
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

      <Button
        className="ml-2"
        variant="primary"
        disabled={!(selectedPhenotypes && selectedPhenotypes.length >= 2)}
        onClick={e => {
          e.preventDefault();
          onSubmit(selectedPhenotypes);
        }}>
        Submit
      </Button>

    </div>
  );
}

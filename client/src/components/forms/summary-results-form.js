import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { FormControl, InputGroup, Button, Row, Col } from 'react-bootstrap';
import { updateSummaryResults } from '../../services/actions';
import { TreeSelectCustom } from '../controls/tree-select-custom';
// import TreeSelect, { TreeNode } from 'rc-tree-select';
// import 'rc-tree-select/assets/index.css';

export function SummaryResultsForm({ onChange, onSubmit, onReset }) {
  const dispatch = useDispatch();
  const phenotypes = useSelector(state => state.phenotypes);
  const phenotypesTree = useSelector(state => state.phenotypesTree);

  const {
    selectedListType,
    selectedPhenotype,
    selectedManhattanPlotType
  } = useSelector(state => state.summaryResults);

  const setSelectedPhenotype = selectedPhenotype => {
    dispatch(updateSummaryResults({ selectedPhenotype }));
  };

  const setSelectedListType = selectedListType => {
    dispatch(updateSummaryResults({ selectedListType }));
  };

  const setSelectedManhattanPlotType = selectedManhattanPlotType => {
    dispatch(updateSummaryResults({ selectedManhattanPlotType }));
  };

  const handleChangeCustom = (item) => {
    console.log("ITEM", item);
    setSelectedPhenotype(item);
    // console.log("selected", items);
    // conatselectedPhenotypes
  }

  const handleChange = params => {
    // only clear selection
    if (params.length === 0) {
      setSelectedPhenotype(params);
    }
  };

  // const handleSelect = (value, node, extra) => {
  //   // can only select leaf nodes
  //   if (node.props.children.length === 0 && !node.props.parent) {
  //     setSelectedPhenotype({value: value.value, title: value.label});
  //     onChange({value: value.value, title: value.label});
  //   }
  // };

  const alphabetizedPhenotypes = [...phenotypes].sort((a, b) =>
    a.title.localeCompare(b.title)
  );

  return (
    <>
      <select
        className="form-control"
        value={selectedListType}
        onChange={e => setSelectedListType(e.target.value)}>
        <option value="categorical">Categorical</option>
        <option value="alphabetic">Alphabetic</option>
      </select>

      {/* <TreeSelect
        className="form-control h-100 p-0"
        dropdownClassName="summary-results"
        style={{ width: '100%' }}
        dropdownStyle={{ maxHeight: 500, overflow: 'auto' }}
        treeData={
          selectedListType === 'alphabetic'
            ? alphabetizedPhenotypes
            : phenotypesTree
        }
        value={selectedPhenotype}
        onChange={handleChange}
        onSelect={handleSelect}
        treeNodeFilterProp="title"
        dropdownMatchSelectWidth
        autoClearSearchValue
        // treeDefaultExpandAll
        treeLine
        allowClear
        labelInValue
        multiple
        placeholder="(Select one phenotype)"
      /> */}

      <TreeSelectCustom
        data={phenotypesTree}
        value={selectedPhenotype}
        onChange={handleChangeCustom}
        singleSelect={true}
      />

      <br></br>

      <select
        className="form-control"
        value={selectedManhattanPlotType}
        onChange={e => setSelectedManhattanPlotType(e.target.value)}
        aria-label="Select the type of data you wish to plot">
        <option value="all">All</option>
        <option value="stacked">Female/Male (Stacked)</option>
        <option value="female">Female</option>
        <option value="male">Male</option>
      </select>

      <br></br>

      <Button
        className=""
        variant="silver"
        onClick={e => {
          e.preventDefault();
          onSubmit(selectedPhenotype, selectedManhattanPlotType);
        }}>
        Submit
      </Button>

      <Button
        className="ml-2"
        variant="silver"
        onClick={e => {
          e.preventDefault();
          onReset(e);
        }}>
        Reset
      </Button>
    </>
  );
}

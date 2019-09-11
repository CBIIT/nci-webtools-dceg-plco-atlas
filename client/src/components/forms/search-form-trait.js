import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Form, InputGroup, Button, Row, Col } from "react-bootstrap";
import { updateSummaryResults } from "../../services/actions";
import TreeSelect, { TreeNode, SHOW_PARENT } from 'rc-tree-select';
import 'rc-tree-select/assets/index.css';

export function SearchFormTrait({ onChange, onSubmit }) {
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

  const handleChange = params => {
    if (params.length === 0) {
      setSelectedPhenotype(params);
    }
  };

  const handleSelect = params => {
    setSelectedPhenotype(params);
    onChange(params);
  }

  const handleReset = params => {
    dispatch(updateSummaryResults({ 
      selectedListType: 'alphabetic',
      selectedPhenotype: null,
      selectedChromosome: null,
      selectedPlot: 'manhattan-plot',
      selectedManhattanPlotType: 'aggregate',
      manhattanPlotData: {},
      manhattanPlotView: '',
      ranges: [],
      results: [],
      resultsCount: 0,
      page: 1,
      pageSize: 10,
      messages: [],
      qqplotSrc: '',
      areaItems: [],
      lambdaGC: '',
      sampleSize: '',
      submitted: null,
      loading: false,
      drawManhattanPlot: null,
      updateResultsTable: null
    }));
  }

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
        style={{ width: '100%' }}
        dropdownStyle={{ maxHeight: 500, overflow: 'auto' }}
        treeData={selectedListType === 'alphabetic' ? alphabetizedPhenotypes : phenotypesTree}
        value={selectedPhenotype}
        onChange={handleChange}
        onSelect={handleSelect}
        treeNodeFilterProp="label"
        dropdownMatchSelectWidth
        autoClearSearchValue
        treeLine
        allowClear
        labelInValue
        // treeCheckable
        multiple
      />

      <select
        className="form-control flex-shrink-auto ml-2"
        value={selectedManhattanPlotType}
        onChange={e => setSelectedManhattanPlotType(e.target.value)}
        aria-label="Select the type of data you wish to plot">
        <option value="aggregate">Combined (Aggregate)</option>
        <option value="stacked">Combined (Stacked)</option>
        <option value="male">Male</option>
        <option value="female">Female</option>
      </select>

      <Button
        className="ml-2"
        variant="primary"
        onClick={e => {
          e.preventDefault();
          onSubmit(selectedPhenotype);
        }}>
        Submit
      </Button>

      <Button
        className="ml-2"
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

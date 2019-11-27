import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Button } from 'react-bootstrap';
import { updateSummaryResults } from '../../services/actions';
import { TreeSelectCustom } from '../controls/tree-select-custom';


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
    if (item && item[0]) {
      setSelectedPhenotype(item[0]);
    }
  }

  const alphabetizedPhenotypes = [...phenotypes].sort((a, b) =>
    a.title.localeCompare(b.title)
  );

  const handleListTypeChange = (value) => {
    setSelectedListType(value);
  };

  return (
    <>
      <form className="sortByToggle">
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
                checked={selectedListType === "categorical" ? true : false} 
                onChange={e => handleListTypeChange(e.target.value)}/>
              By Category
            </label>
          </div>
          <div className="col-md-auto radio pr-0">
            <label>
              <input 
                className="mr-1" 
                type="radio" 
                value="alphabetic" 
                checked={selectedListType === "alphabetic" ? true : false} 
                onChange={e => handleListTypeChange(e.target.value)}/>
              By Name
            </label>
          </div>
        </div>
      </form>

      <TreeSelectCustom
        data={phenotypesTree}
        value={selectedPhenotype}
        onChange={handleChangeCustom}
        singleSelect={true}
      />

      <br></br>

      <b>Gender</b>
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

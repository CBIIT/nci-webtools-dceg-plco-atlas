import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Button } from 'react-bootstrap';
import { updateSummaryResults } from '../../services/actions';
import { TreeSelectCustom } from '../controls/tree-select-custom';

export function SummaryResultsForm({ onChange, onSubmit, onReset }) {
  const dispatch = useDispatch();
  const phenotypes = useSelector(state => state.phenotypes);
  const phenotypeCategories = useSelector(state => state.phenotypeCategories);
  const phenotypesTree = useSelector(state => state.phenotypesTree);

  const { selectedPhenotype, selectedManhattanPlotType } = useSelector(
    state => state.summaryResults
  );

  const setSelectedPhenotype = selectedPhenotype => {
    dispatch(updateSummaryResults({ selectedPhenotype }));
  };

  const setSelectedManhattanPlotType = selectedManhattanPlotType => {
    dispatch(updateSummaryResults({ selectedManhattanPlotType }));
  };

  const handleChangeCustom = item => {
    if (item && item[0]) {
      setSelectedPhenotype(item[0]);
    }
  };

  const alphabetizedPhenotypes = [...phenotypes].sort((a, b) =>
    a.title.localeCompare(b.title)
  );

  return (
    <>
      <b>Phenotypes</b>
      <span style={{ color: 'red' }}>*</span>
      <TreeSelectCustom
        data={phenotypesTree}
        dataAlphabetical={alphabetizedPhenotypes}
        dataCategories={phenotypeCategories}
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

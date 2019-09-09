import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Form, InputGroup, Button, Row, Col } from "react-bootstrap";
import { updateSummaryResults } from "../../services/actions";
import Select, { components } from "react-select";

export function SearchFormTrait({ onChange, onSubmit }) {
  const dispatch = useDispatch();
  const phenotypes = useSelector(state => state.phenotypes);
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
    setSelectedPhenotype(params);
    onChange(params);
  };

  const alphabetizedPhenotypes = [...phenotypes].sort((a, b) =>
    a.label.localeCompare(b.label)
  );

  const categorizedPhenotypes = phenotypes.map(e => {
    const spaces = String.fromCharCode(160).repeat(e.level * 2);
    let label = spaces + e.label;
    return { ...e, label };
  });

  const SingleValue = props => (
    <components.SingleValue {...props}>
      {props.data.label.trim()}
    </components.SingleValue>
  );

  return (
    <div className="d-flex mb-4">
      <select
        className="form-control flex-shrink-auto mx-2"
        value={selectedListType}
        onChange={e => setSelectedListType(e.target.value)}
      >
        <option value="alphabetic">Alphabetic</option>
        <option value="categorical">Categorical</option>
      </select>

      <Select
        className="flex-grow-auto mx-2"
        placeholder="(Select a phenotype)"
        value={selectedPhenotype}
        onChange={handleChange}
        isOptionDisabled={option => option.value === null}
        options={
          selectedListType === "categorical"
            ? categorizedPhenotypes
            : alphabetizedPhenotypes
        }
        components={{ SingleValue }}
        aria-label="Select the phenotype "
      />

      <select
        className="form-control flex-shrink-auto mx-2"
        value={selectedManhattanPlotType}
        onChange={e => setSelectedManhattanPlotType(e.target.value)}
        aria-label="Select the type of data you wish to plot">
        <option value="aggregate">Combined (Aggregate)</option>
        <option value="stacked">Combined (Stacked)</option>
        <option value="male">Male</option>
        <option value="female">Female</option>
      </select>

      <button
        className="btn btn-primary mx-2"
        onClick={e => {
          e.preventDefault();
          onSubmit(selectedPhenotype);
        }}>
        Submit
      </button>
    </div>
  );
}

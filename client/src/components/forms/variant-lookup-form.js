import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Form, InputGroup, Row, Col, Button } from 'react-bootstrap';
import {
  containsVal,
  containsAllVals,
  removeVal,
  removeAllVals,
  getAllLeafs
} from '../controls/tree-select';
import { updateVariantLookup } from '../../services/actions';
import { TreeSelectCustom } from '../controls/tree-select-custom';

export function VariantLookupForm({ onChange, onSubmit, onReset }) {
  const dispatch = useDispatch();
  const phenotypes = useSelector(state => state.phenotypes);
  const phenotypesTree = useSelector(state => state.phenotypesTree);
  const variantLookup = useSelector(state => state.variantLookup);
  const {
    selectedListType,
    selectedPhenotypes,
    selectedVariant,
    selectedGender
  } = variantLookup;

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
            console.log('REMOVE ONE', newValues[i]);
            values = removeVal(values, newValues[i].value);
          }
        }
      }
    }
    setSelectedPhenotypes(values);
    onChange(values);
  };

  const setSelectedListType = selectedListType => {
    dispatch(updateVariantLookup({ selectedListType }));
  };

  const setSelectedPhenotypes = selectedPhenotypes => {
    dispatch(updateVariantLookup({ selectedPhenotypes }));
  };

  const setSelectedVariant = selectedVariant => {
    dispatch(updateVariantLookup({ selectedVariant }));
  };

  const setSelectedGender = selectedGender => {
    dispatch(updateVariantLookup({ selectedGender }));
  };

  const alphabetizedPhenotypes = [...phenotypes].sort((a, b) =>
    a.title.localeCompare(b.title)
  );

  const handleChangeCustom = items => {
    console.log("handleChangeCustom", items)
    setSelectedPhenotypes(items);
    // console.log("selected", items);
    // conatselectedPhenotypes
  };

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
        value={selectedPhenotypes}
        onChange={handleChangeCustom}
      />

      <br></br>

      <b>Variant</b>
      <input
        className="form-control"
        // style={{ width: '470px' }}
        placeholder="Enter RS Number"
        aria-label="Variant (required)"
        value={selectedVariant}
        onChange={e => {
          setSelectedVariant(e.target.value);
          onChange(e.target.value);
        }}
        type="text"
        required
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
        // disabled={!canSubmit}
        onClick={e => {
          e.preventDefault();
          onSubmit({ selectedPhenotypes, selectedVariant });
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
    </>
  );
}

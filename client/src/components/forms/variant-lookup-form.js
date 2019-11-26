import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Form,
  FormControl,
  InputGroup,
  Row,
  Col,
  Button
} from 'react-bootstrap';
import {
  containsVal,
  containsAllVals,
  removeVal,
  removeAllVals,
  getAllLeafs } from '../controls/tree-select';
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

  const handleChangeCustom = (items) => {
    setSelectedPhenotypes(items);
    // console.log("selected", items);
    // conatselectedPhenotypes

  }

  return (
    <>
      {/* <select
        className="form-control"
        value={selectedListType}
        onChange={e => setSelectedListType(e.target.value)}>
        <option value="categorical">Categorical</option>
        <option value="alphabetic">Alphabetic</option>
      </select> */}

      <div className="sortByToggle">
          <b>Sort by</b>
          <input className="ml-3" type="radio" id="categoricalRadio" name="sortByRadios" value="categorical" defaultChecked />
          <label className="ml-1" htmlFor="categoricalRadio">Categorical</label>
          <input className="ml-2" type="radio" id="alphabeticRadio" name="sortByRadios" value="alphabetic" />
          <label className="ml-1" htmlFor="alphabeticRadio">Alphabetic</label>
      </div>

      <TreeSelectCustom
        data={phenotypesTree}
        value={selectedPhenotypes}
        onChange={handleChangeCustom}
      />

      <br></br>

      <FormControl
        className="form-control"
        // style={{ width: '470px' }}
        placeholder="(Variant rsid or coordinate)"
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
          onSubmit({selectedPhenotypes, selectedVariant});
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

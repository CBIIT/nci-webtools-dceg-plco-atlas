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
import TreeSelect, { TreeNode } from 'rc-tree-select';
import 'rc-tree-select/assets/index.css';

export function SearchFormTraitsVariant({ onSubmit, onReset }) {
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
    a.label.localeCompare(b.label)
  );

  const canSubmit =
    selectedPhenotypes &&
    selectedPhenotypes.length > 0 &&
    (selectedVariant && selectedVariant.length > 0);

  const validateVariantInput = e => {
    e.preventDefault();
    // console.log(selectedVariant);
    // (/^rs\d+/i).test(selectedVariant)

    if (
      selectedVariant.match(/^[r|R][s|S][0-9]+$/) != null ||
      selectedVariant.match(
        /^([c|C][h|H][r|R])?(([1-9]|[1][0-9]|[2][0-2])|[x|X|y|Y]):[0-9]+$/
      ) != null
    ) {
      // console.log("valid");
      onSubmit({
        selectedPhenotypes,
        selectedVariant
      });
    } else {
      // console.log("invalid");
      onSubmit({
        selectedPhenotypes,
        selectedVariant,
        error: 'Invalid variant input.'
      });
    }
  };

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
        treeDefaultExpandAll
        treeLine
        multiple
        allowClear
        labelInValue
        placeholder="(Select Phenotypes)"
      />

      <FormControl
        className="form-control flex-shrink-auto ml-2"
        style={{ width: '450px' }}
        placeholder="(Variant rsid or coordinate)"
        aria-label="Variant (required)"
        value={selectedVariant}
        onChange={e => setSelectedVariant(e.target.value)}
        type="text"
        required
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
        className="ml-2 flex-shrink-auto"
        style={{ maxHeight: '38px' }}
        variant="primary"
        disabled={!canSubmit}
        onClick={validateVariantInput}>
        Submit
      </Button>

      <Button
        className="ml-2 flex-shrink-auto"
        style={{ maxHeight: '38px' }}
        variant="secondary"
        onClick={e => {
          e.preventDefault();
          onReset(e);
        }}>
        Reset
      </Button>
    </div>
  );
}

import React, { useState, useEffect, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Button, OverlayTrigger, Tooltip } from 'react-bootstrap';
import { TreeSelect } from '../../../controls/tree-select/tree-select';
import {
  updateSummaryResults
} from '../../../../services/actions';

export function SummaryResultsForm({
  phenotype = null,
  sex = 'all',
  onSubmit = any => {},
  onReset = any => {}
}) {
  const dispatch = useDispatch();
  // in order to prevent updating the redux store until after the form has
  // been submitted, we should store the state in the component, and then emit
  // this state on submit or reset, allowing the handler to update the store

  // private members prefixed with _
  const [_phenotype, _setPhenotype] = useState(null);
  const [_sex, _setSex] = useState('all');
  // const submitRef = useRef(null);

  // update state when props change
  useEffect(() => _setPhenotype(phenotype), [phenotype]);
  useEffect(() => _setSex(sex), [sex]);

  // select store members
  const phenotypes = useSelector(state => state.phenotypes);
  const { 
    submitted, 
    disableSubmit, 
    existingSexes 
  } = useSelector(state => state.summaryResults);

  const treeRef = useRef();

  const handleExistingSex = (chosen) => {
    const existingSexes = phenotypes.metadata.filter((item) => item.phenotype_id === chosen.id).map((item) => item.sex).sort();
    dispatch(updateSummaryResults({ existingSexes }));
    if (existingSexes.length > 0) {
      _setSex(existingSexes[0]);
    }
  }

  const sexes = {
    all: {
      value: 'all',
      name: 'All'
    },
    stacked: {
      value: 'stacked',
      name: 'Female/Male (Stacked)'
    },
    female: {
      value: 'female',
      name: 'Female'
    },
    male: {
      value: 'male',
      name: 'Male'
    }
  };

  const SexOptions = () => {
    let displayOptions = existingSexes.map((item) => sexes[item]);
    if (existingSexes.includes('female') && existingSexes.includes('male')) {
      displayOptions.push(sexes['stacked']);
    }
    return (
      <>
        {displayOptions.map((item) => 
          <option key={item.value} value={item.value}>{item.name}</option>
        )}
      </>
    )
  }

  return (
    <>
      {/* <pre>{JSON.stringify({_phenotype, _sex}, null, 2)}</pre> */}
      <div className="mb-2">
        <label className="required">Phenotypes</label>
        <TreeSelect
          data={phenotypes}
          value={_phenotype}
          onChange={val => {
            _setPhenotype((val && val.length) ? val[0] : null);
            dispatch(updateSummaryResults({ disableSubmit: false }));
            handleExistingSex((val && val.length) ? val[0] : null);
          }}
          singleSelect
          ref={treeRef}
        />
      </div>

      <div className="mb-3">
        <label htmlFor="summary-results-sex" className="required">Sex</label>
        <select
          id="summary-results-sex"
          className="form-control"
          value={_sex}
          onChange={e => {
            _setSex(e.target.value);
            dispatch(updateSummaryResults({ disableSubmit: false }));
          }}
          aria-label="Select sex"
          disabled={existingSexes.length === 0}>
            { existingSexes.length === 0 &&
              <option value="" disabled selected>Select a phenotype</option>
            }
            <SexOptions />
        </select>
      </div>

      <div>
        <OverlayTrigger
          overlay={
            <Tooltip
              style={{display: _phenotype ? 'none' : 'block'}}
              id="submit-summary-results">
              Please select a phenotype.
          </Tooltip>}>
          <span className={`d-inline-block ${!_phenotype && 'c-not-allowed'}`}>
            <Button
              type="submit"
              variant="silver"
              className={!_phenotype && 'pointer-events-none'}
              // disabled={!_phenotype || submitted}
              disabled={!_phenotype || disableSubmit}
              onClick={e => {
                e.preventDefault();
                onSubmit({phenotype: _phenotype, sex: _sex});
              }}>
              Submit
            </Button>
          </span>
        </OverlayTrigger>

        <Button
          className="ml-2"
          variant="silver"
          onClick={e => {
            e.preventDefault();
            _setPhenotype(null);
            _setSex('all');
            onReset();
            treeRef.current.resetSearchFilter();
          }}>
          Reset
        </Button>
      </div>
    </>
  );
}

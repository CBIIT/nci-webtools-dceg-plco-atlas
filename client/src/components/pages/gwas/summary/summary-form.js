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
  ancestry = 'all',
  onSubmit = any => {},
  onReset = any => {}
}) {
  const dispatch = useDispatch();
  // in order to prevent updating the redux store until after the form has
  // been submitted, we should store the state in the component, and then emit
  // this state on submit or reset, allowing the handler to update the store

  // select store members
  const phenotypes = useSelector(state => state.phenotypes);
  const { 
    submitted, 
    disableSubmit, 
    existingSexes,
    existingAncestries
  } = useSelector(state => state.summaryResults);

  const treeRef = useRef();

  // private members prefixed with _
  const [_phenotype, _setPhenotype] = useState(null);
  const [_sex, _setSex] = useState('all');
  const [_ancestry, _setAncestry] = useState('all');
  // const submitRef = useRef(null);

  // update state when props change
  useEffect(() => {
    _setPhenotype(phenotype)
  }, [phenotype]);

  useEffect(() => {
    handleExistingSex(_phenotype);
    handleExistingAncestry(_phenotype);
  }, [_phenotype]);

  useEffect(() => {
    _setSex(sex);
  }, [sex]);

  useEffect(() => {
    _setAncestry(ancestry);
  }, [ancestry]);

  const handleExistingSex = (chosen) => {
    if (!phenotypes || !phenotypes.metadata) return;
    if (chosen) {
      const existingSexes = phenotypes.metadata.filter((item) => item.phenotype_id === chosen.id).map((item) => item.sex).sort();
      dispatch(updateSummaryResults({ existingSexes }));
      if (existingSexes.length > 0) {
        _setSex(existingSexes[0]);
      }
    } else {
      dispatch(updateSummaryResults({ existingSexes: [] }));
    }
  }

  const handleExistingAncestry = (chosen) => {
    if (!phenotypes || !phenotypes.metadata) return;
    if (chosen) {
      // const existingAncestries = phenotypes.metadata.filter((item) => item.phenotype_id === chosen.id).map((item) => item.sex).sort();
      const existingAncestries = ['all'];
      dispatch(updateSummaryResults({ existingAncestries }));
      if (existingAncestries.length > 0) {
        _setAncestry(existingAncestries[0]);
      }
    } else {
      dispatch(updateSummaryResults({ existingAncestries: [] }));
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
    return (
      <>
        {displayOptions.map((item) => 
          <option key={item.value} value={item.value}>{item.name}</option>
        )}
      </>
    )
  }

  const ancestries = {
    all: {
      value: 'all',
      name: 'All'
    },
    white: {
      value: 'white',
      name: 'White'
    },
    black: {
      value: 'black',
      name: 'Black'
    },
    hispanic: {
      value: 'hispanic',
      name: 'Hispanic'
    },
    asian: {
      value: 'asian',
      name: 'Asian'
    },
    pacific_islander: {
      value: 'pacific_islander',
      name: 'Pacific Islander'
    },
    american_indian: {
      value: 'american_indian',
      name: 'American Indian'
    },
  };

  const AncestryOptions = () => {
    let displayOptions = existingAncestries.map((item) => ancestries[item]);
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
          }}
          singleSelect
          ref={treeRef}
        />
      </div>

      <div className="mb-3">
        <label htmlFor="summary-results-sex" className="required">Sex</label>
        <select
          style={{
            // fontSize: '13.3333px',
            color: existingSexes.length === 0 ? '#AAAAAA' : 'unset'
          }}
          id="summary-results-sex"
          className="form-control"
          value={existingSexes.length === 0 ? 'empty-sex' : _sex}
          onChange={e => {
            _setSex(e.target.value);
            dispatch(updateSummaryResults({ disableSubmit: false }));
          }}
          aria-label="Select a sex"
          disabled={existingSexes.length === 0}
          >
            { existingSexes.length === 0 &&
              <option value="empty-sex" disabled defaultValue>Select a Sex</option>
            }
            { existingSexes.length > 0 &&
              <SexOptions />
            }
        </select>
      </div>

      <div className="mb-3">
        <label htmlFor="summary-results-ancestry" className="required">Ancestry</label>
        <select
          style={{
            // fontSize: '13.3333px',
            color: existingAncestries.length === 0 ? '#AAAAAA' : 'unset'
          }}
          id="summary-results-ancestry"
          className="form-control"
          value={existingAncestries.length === 0 ? 'empty-ancestry' : _ancestry}
          onChange={e => {
            _setAncestry(e.target.value);
            dispatch(updateSummaryResults({ disableSubmit: false }));
          }}
          aria-label="Select a ancestry"
          disabled={existingAncestries.length === 0}
          >
            { existingAncestries.length === 0 &&
              <option value="empty-ancestry" disabled defaultValue>Select an Ancestry</option>
            }
            { existingAncestries.length > 0 &&
              <AncestryOptions />
            }
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
                onSubmit({phenotype: _phenotype, sex: _sex, ancestry: _ancestry});
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
            _setAncestry('all');
            onReset();
            treeRef.current.resetSearchFilter();
          }}>
          Reset
        </Button>
      </div>
    </>
  );
}

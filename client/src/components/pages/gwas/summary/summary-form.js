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
  ancestry = 'european',
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
  const [_ancestry, _setAncestry] = useState('european');
  // const submitRef = useRef(null);

  // update state when props change
  useEffect(() => {
    _setPhenotype(phenotype)
    handleInitStratifications(phenotype);
  }, [phenotype]);

  useEffect(() => {
    _setSex(sex);
  }, [sex]);

  useEffect(() => {
    _setAncestry(ancestry);
  }, [ancestry]);

  const handleInitStratifications = (selectedPhenotype) => {
    // console.log("handleInitStratifications");
    if (!phenotypes || !phenotypes.metadata) return;
    if (selectedPhenotype) {
      const existingAncestries = [...new Set(phenotypes.metadata.filter((item) => item.phenotype_id === selectedPhenotype.id && item.count > 0).map((item) => item.ancestry).sort())];
      dispatch(updateSummaryResults({ existingAncestries }));
      if (existingAncestries.length > 0) {
        _setAncestry(existingAncestries[0]);
      }
      const existingSexes = [...new Set(phenotypes.metadata.filter((item) => item.phenotype_id === selectedPhenotype.id && item.ancestry === existingAncestries[0] && item.count > 0).map((item) => item.sex).sort())];
      dispatch(updateSummaryResults({ existingSexes }));
      if (existingSexes.length > 0) {
        _setSex(existingSexes[0]);
      }
      
    } else {
      dispatch(updateSummaryResults({ 
        existingSexes: [],
        existingAncestries: []
      }));
    }
  }

  const handleExistingStratifications = (change) => {
    // console.log("handleExistingStratifications", change);
    if (!phenotypes || !phenotypes.metadata) return;
    if ('sex' in change || 'ancestry' in change) {
      if ('sex' in change) {
        const existingAncestries = [...new Set(phenotypes.metadata.filter((item) => item.phenotype_id === _phenotype.id && (change.sex === 'stacked' ? (item.sex === 'male' || item.sex === 'female') : item.sex === change.sex) && item.count > 0).map((item) => item.ancestry).sort())];
        dispatch(updateSummaryResults({ existingAncestries }));
      } else {
        const existingSexes = [...new Set(phenotypes.metadata.filter((item) => item.phenotype_id === _phenotype.id && item.ancestry === change.ancestry && item.count > 0).map((item) => item.sex).sort())];
        dispatch(updateSummaryResults({ existingSexes }));
      }
    } else {
      dispatch(updateSummaryResults({ 
        existingSexes: [],
        existingAncestries: []
      }));
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
    let displayOptionsValues = existingSexes.map((item) => sexes[item].value);
    displayOptions = displayOptions.filter((item) => { 
      if (item.value === 'stacked') {
        return displayOptionsValues.includes('female') && displayOptionsValues.includes('male');
      } else {
        return true;
      }
    });
    return (
      <>
        {displayOptions.map((item) => 
          <option key={item.value} value={item.value}>{item.name}</option>
        )}
      </>
    )
  }

  const ancestries = {
    european: {
      value: 'european',
      name: 'European'
    },
    east_asian: {
      value: 'east_asian',
      name: 'East Asian'
    }
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
            handleInitStratifications((val && val.length) ? val[0] : null);
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
            handleExistingStratifications({sex: e.target.value});
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
            handleExistingStratifications({ancestry: e.target.value});
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
            _setAncestry('european');
            onReset();
            treeRef.current.resetSearchFilter();
          }}>
          Reset
        </Button>
      </div>
    </>
  );
}

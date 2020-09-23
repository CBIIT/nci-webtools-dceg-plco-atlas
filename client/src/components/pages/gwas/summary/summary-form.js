import React, { useState, useEffect, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Button, OverlayTrigger, Tooltip } from 'react-bootstrap';
import { TreeSelect } from '../../../controls/tree-select/tree-select';
import Select, { components } from 'react-select';
import {
  updateSummaryResults
} from '../../../../services/actions';

export function SummaryResultsForm({
  phenotype = null,
  // sex = 'all',
  // ancestry = 'european',
  stratification = null,
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
    existingStratifications
  } = useSelector(state => state.summaryResults);

  const treeRef = useRef();

  // private members prefixed with _
  const [_phenotype, _setPhenotype] = useState(null);
  const [_stratification, _setStratification] = useState(null);
  // const submitRef = useRef(null);

  // update state when props change
  useEffect(() => {
    _setPhenotype(phenotype)
    handleInitStratifications(phenotype);
  }, [phenotype]);

  // useEffect(() => {
  //   console.log("useEffect _setStratification", stratification);
  //   _setStratification(stratification);
  // }, [stratification]);

  const handleInitStratifications = (selectedPhenotype) => {
    if (!phenotypes || !phenotypes.metadata) return;
    if (selectedPhenotype) {
      let existingStratifications  = [];
      const existingAncestries = [...new Set(phenotypes.metadata.filter((item) => item.phenotype_id === selectedPhenotype.id && item.count > 0).map((item) => item.ancestry).sort())];
      existingAncestries.map((ancestry) => {
        const existingSexes = [...new Set(phenotypes.metadata.filter((item) => item.phenotype_id === selectedPhenotype.id && item.ancestry === ancestry && item.count > 0).map((item) => item.sex).sort())];
        const existingSexesChecked = existingSexes.filter((item) => {
            if (item === "stacked") {
              return existingSexes.includes('female') && existingSexes.includes('male');
            } else {
              return true;
            }
          })
          .map((sex) => {
            return {
              label: `${ancestries[ancestry].name} - ${sexes[sex].name}`,
              value: `${ancestry}__${sex}`
            }
          });

        existingStratifications.push({
          label: ancestries[ancestry].name,
          options: existingSexesChecked
        })
      })
      dispatch(updateSummaryResults({ existingStratifications }));
      if (!stratification && existingStratifications.length > 0) {
        _setStratification(existingStratifications[0].options[0]);
      } else {
        _setStratification(stratification);
      }
    } else {
      dispatch(updateSummaryResults({ 
        existingStratifications: []
      }));
    }
  }

  const handleChangeStratifications = (selectedPhenotype) => {
    if (!phenotypes || !phenotypes.metadata) return;
    if (selectedPhenotype) {
      let existingStratifications  = [];
      const existingAncestries = [...new Set(phenotypes.metadata.filter((item) => item.phenotype_id === selectedPhenotype.id && item.count > 0).map((item) => item.ancestry).sort())];
      existingAncestries.map((ancestry) => {
        const existingSexes = [...new Set(phenotypes.metadata.filter((item) => item.phenotype_id === selectedPhenotype.id && item.ancestry === ancestry && item.count > 0).map((item) => item.sex).sort())];
        const existingSexesChecked = existingSexes.filter((item) => {
            if (item === "stacked") {
              return existingSexes.includes('female') && existingSexes.includes('male');
            } else {
              return true;
            }
          })
          .map((sex) => {
            return {
              label: `${ancestries[ancestry].name} - ${sexes[sex].name}`,
              value: `${ancestry}__${sex}`
            }
          });

        existingStratifications.push({
          label: ancestries[ancestry].name,
          options: existingSexesChecked
        })
      })
      dispatch(updateSummaryResults({ existingStratifications }));
      if (existingStratifications.length > 0) {
        _setStratification(existingStratifications[0].options[0]);
      }
    } else {
      dispatch(updateSummaryResults({ 
        existingStratifications: []
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

  const Option = props => {
    return (
      <components.Option {...props}>
        {props && props.label && props.label.split('-')[1]}
      </components.Option>
    );
  };

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
            handleChangeStratifications((val && val.length) ? val[0] : null);
            dispatch(updateSummaryResults({ disableSubmit: false }));
          }}
          singleSelect
          ref={treeRef}
        />
      </div>

      <div className="mb-3">
        <label htmlFor="summary-results-stratification" className="required">Stratification</label>
        <Select 
          id="summary-results-stratification" 
          options={existingStratifications} 
          components={{ Option }}
          value={_stratification}
          onChange={item => {
            console.log("onChange", item);
            _setStratification(item);
            dispatch(updateSummaryResults({ disableSubmit: false }));
          }}
          placeholder={"Select a Stratification"}
          isDisabled={existingStratifications.length === 0}
        />
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
                onSubmit({phenotype: _phenotype, ancestry: _stratification.value.split('__')[0], sex: _stratification.value.split('__')[1], });
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
            // _setSex('all');
            // _setAncestry('european');
            _setStratification(null);
            onReset();
            treeRef.current.resetSearchFilter();
          }}>
          Reset
        </Button>
      </div>
    </>
  );
}

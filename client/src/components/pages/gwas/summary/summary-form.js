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
  const { submitted, disableSubmit } = useSelector(state => state.summaryResults);

  const treeRef = useRef();

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
          id="summary-results-sex"
          className="form-control"
          value={_sex}
          onChange={e => {
            _setSex(e.target.value);
            dispatch(updateSummaryResults({ disableSubmit: false }));
          }}
          aria-label="Select sex"
          // disabled={submitted}
          >
          <option value="all">All</option>
          <option value="stacked">Female/Male (Stacked)</option>
          <option value="female">Female</option>
          <option value="male">Male</option>
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

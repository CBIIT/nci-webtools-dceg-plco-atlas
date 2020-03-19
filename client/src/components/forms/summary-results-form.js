import React, { useState, useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';
import { Button, OverlayTrigger, Tooltip } from 'react-bootstrap';
import { TreeSelect } from '../controls/tree-select';

export function SummaryResultsForm({
  phenotype = null,
  gender = 'all',
  onSubmit,
  onReset
}) {

  // private members prefixed with _
  const [_phenotype, _setPhenotype] = useState(null);
  const [_gender, _setGender] = useState('all');
  // const submitRef = useRef(null);

  // update state when props change
  useEffect(() => _setPhenotype(phenotype), [phenotype]);
  useEffect(() => _setGender(gender), [gender]);

  // select store members
  const phenotypes = useSelector(state => state.phenotypes);
  const { submitted } = useSelector(state => state.summaryResults);

  const treeRef = useRef();

  return (
    <>
      {/* <pre>{JSON.stringify({_phenotype, _gender}, null, 2)}</pre> */}
      <div className="mb-2">
        <label className="required">Phenotypes</label>
        <TreeSelect
          data={phenotypes}
          value={_phenotype}
          onChange={val => _setPhenotype((val && val.length) ? val[0] : null)}
          singleSelect
          ref={treeRef}
          submitted={submitted}
        />
      </div>

      <div className="mb-3">
        <label htmlFor="summary-results-gender" className="required">Sex</label>
        <select
          id="summary-results-gender"
          className="form-control"
          value={_gender}
          onChange={e => _setGender(e.target.value)}
          aria-label="Select the type of data you wish to plot"
          disabled={submitted}>
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
              disabled={!_phenotype || submitted}
              onClick={e => {
                e.preventDefault();
                onSubmit(_phenotype, _gender);
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
            _setGender('all');
            onReset();
            treeRef.current.resetSearchFilter();
          }}>
          Reset
        </Button>
      </div>
    </>
  );
}

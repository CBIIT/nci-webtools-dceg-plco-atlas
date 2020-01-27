import React, { useState, useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';
import { Button, OverlayTrigger, Tooltip } from 'react-bootstrap';
import { TreeSelectCustom } from '../controls/tree-select-custom';

export function PhenotypesForm({
  phenotype = null,
  onSubmit,
  onReset
}) {

  // private members prefixed with _
  const [_phenotype, _setPhenotype] = useState(null);
  const submitRef = useRef(null);

  // update state when props change
  useEffect(() => _setPhenotype(phenotype), [phenotype]);

  // select store members
  const phenotypes = useSelector(state => state.phenotypes);
  const phenotypeCategories = useSelector(state => state.phenotypeCategories);
  const phenotypesTree = useSelector(state => state.phenotypesTree);
  const alphabetizedPhenotypes = [...phenotypes].sort((a, b) =>
    a.title.localeCompare(b.title)
  );

  return (
    <>
      {/* <pre>{JSON.stringify({_phenotype, _gender}, null, 2)}</pre> */}
      <div className="mb-2">
        <label className="required">Phenotypes</label>
        <TreeSelectCustom
          data={phenotypesTree}
          dataAlphabetical={alphabetizedPhenotypes}
          dataCategories={phenotypeCategories}
          value={_phenotype}
          onChange={val => _setPhenotype((val && val.length) ? val[0] : null)}
          singleSelect
        />
      </div>

      <div>
        <OverlayTrigger
          overlay={
            <Tooltip
              style={{display: _phenotype ? 'none' : 'block'}}
              id="submit-summary-results">
              Please select a phenotype
          </Tooltip>}>
          <span className={`d-inline-block ${!_phenotype && 'c-not-allowed'}`}>
            <Button
              type="submit"
              variant="silver"
              className={!_phenotype && 'pointer-events-none'}
              disabled={!_phenotype}
              onClick={e => {
                e.preventDefault();
                onSubmit(_phenotype);
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
            onReset();
          }}>
          Reset
        </Button>
      </div>
    </>
  );
}
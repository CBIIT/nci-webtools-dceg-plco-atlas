import React, { useState, useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';
import { Button, OverlayTrigger, Tooltip } from 'react-bootstrap';
import { TreeSelect } from '../controls/tree-select';

export function PhenotypesForm({
  phenotype = null,
  onSubmit,
  onChange,
  onReset,
  displayTreeParent
}) {

  // private members prefixed with _
  const [_phenotype, _setPhenotype] = useState(null);
  // const submitRef = useRef(null);
  const treeRef = useRef();

  // update state when props change
  useEffect(() => _setPhenotype(phenotype), [phenotype]);

  useEffect(() => {
    if (!displayTreeParent) return;
    treeRef.current.expandSelectedPhenotype(displayTreeParent);
  }, [displayTreeParent]);

  // select store members
  const phenotypes = useSelector(state => state.phenotypes);
  const { submitted, loading }  = useSelector(state => state.browsePhenotypes);

  return (
    <>
      {/* <pre>{JSON.stringify({_phenotype, _sex}, null, 2)}</pre> */}
      <div className="mb-2">
        <label className="required">Phenotypes</label>
        <TreeSelect
          data={phenotypes}
          value={_phenotype}
          // onChange={val => _setPhenotype((val && val.length) ? val[0] : null)}
          onChange={val => onChange((val && val.length) ? val[0] : null)}
          singleSelect
          ref={treeRef}
          submitted={submitted}
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
              disabled={!_phenotype || submitted || loading}
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
            treeRef.current.resetSearchFilter();
          }}>
          Reset
        </Button>
      </div>
    </>
  );
}

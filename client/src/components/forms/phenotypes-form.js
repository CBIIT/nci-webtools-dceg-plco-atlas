import React, { useState, useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';
import { Button, OverlayTrigger, Tooltip } from 'react-bootstrap';
import { TreeSelect } from '../controls/tree-select';

export function PhenotypesForm({
  // phenotype = null,
  onSubmit,
  onChange,
  onReset,
  // displayTreeParent
}) {

  // private members prefixed with _
  // const [_phenotype, _setPhenotype] = useState(null);
  // const submitRef = useRef(null);

  const treeRef = useRef();

  // update state when props change
  // useEffect(() => _setPhenotype(phenotype), [phenotype]);

  // select store members
  const phenotypes = useSelector(state => state.phenotypes);
  const { 
    submitted, 
    loading,
    displayTreeParent,
    selectedPhenotype
  }  = useSelector(state => state.browsePhenotypes);

  useEffect(() => {
    if (!displayTreeParent) return;
    treeRef.current.expandSelectedPhenotype(displayTreeParent);
  }, [displayTreeParent, phenotypes]);

  return (
    <>
      {/* <pre>{JSON.stringify({_phenotype, _sex}, null, 2)}</pre> */}
      <div className="mb-2">
        <label className="required">Phenotypes</label>
        <TreeSelect
          data={phenotypes}
          value={selectedPhenotype}
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
              style={{display: selectedPhenotype ? 'none' : 'block'}}
              id="submit-summary-results">
              Please select a phenotype.
          </Tooltip>}>
          <span className={`d-inline-block ${!selectedPhenotype && 'c-not-allowed'}`}>
            <Button
              type="submit"
              variant="silver"
              className={!selectedPhenotype && 'pointer-events-none'}
              disabled={!selectedPhenotype || submitted || loading}
              onClick={e => {
                e.preventDefault();
                onSubmit(selectedPhenotype);
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
            // _setPhenotype(null);
            onReset();
            treeRef.current.resetSearchFilter();
          }}>
          Reset
        </Button>
      </div>
    </>
  );
}

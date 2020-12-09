import React, { useState, useEffect, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Button, OverlayTrigger, Tooltip } from 'react-bootstrap';
import { TreeSelect } from '../../controls/tree-select/tree-select';
import { updateBrowsePhenotypes } from '../../../services/actions';

export function PhenotypesForm({ onSubmit, onChange, onReset }) {
  const dispatch = useDispatch();

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
    disableSubmit,
    loading,
    displayTreeParent,
    selectedPhenotype
  } = useSelector(state => state.browsePhenotypes);

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
          data={phenotypes.tree}
          value={selectedPhenotype}
          // onChange={val => _setPhenotype((val && val.length) ? val[0] : null)}
          onChange={val => {
            onChange(val && val.length ? val[0] : null);
            dispatch(updateBrowsePhenotypes({ disableSubmit: false }));
          }}
          singleSelect
          enabled={item => !item.children || item.participant_count > 0}
          ref={treeRef}
        />
      </div>

      <div>
        <OverlayTrigger
          overlay={
            <Tooltip
              style={{ display: selectedPhenotype ? 'none' : 'block' }}
              id="submit-summary-results">
              Please select a phenotype.
            </Tooltip>
          }>
          <span
            className={`d-inline-block ${!selectedPhenotype &&
              'c-not-allowed'}`}>
            <Button
              type="submit"
              variant="silver"
              className={!selectedPhenotype && 'pointer-events-none'}
              disabled={!selectedPhenotype || disableSubmit || loading}
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

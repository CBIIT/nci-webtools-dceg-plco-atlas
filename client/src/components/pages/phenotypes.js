import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Alert, Tab, Tabs, Button, OverlayTrigger, Tooltip } from 'react-bootstrap';
import { TreeSelectCustom } from '../controls/tree-select-custom';
import {
  SidebarContainer,
  SidebarPanel,
  MainPanel,
} from '../controls/sidebar-container';
import { updateBrowsePhenotypes } from '../../services/actions';

export function Phenotypes({
  onSubmit,
  onReset
}) {
  const dispatch = useDispatch();
  const phenotypes = useSelector(state => state.phenotypes);
  const phenotypeCategories = useSelector(state => state.phenotypeCategories);
  const phenotypesTree = useSelector(state => state.phenotypesTree);

  const [_phenotype, _setPhenotype] = useState(null);
  const [_gender, _setGender] = useState('all');

  const {
    selectedPhenotypes,
    submitted
  } = useSelector(state => state.browsePhenotypes);

  const alphabetizedPhenotypes = [...phenotypes].sort((a, b) =>
    a.title.localeCompare(b.title)
  );

  function handleChange(items) {
    dispatch(updateBrowsePhenotypes({
      selectedPhenotypes: items,//.slice(0, 5),
      submitted: false,
    }));
  }

  function handleSubmit() {
    // if (!selectedPhenotypes.length || selectedPhenotypes.length > 5) {
    //   return;
    // }

    dispatch(updateBrowsePhenotypes({
      submitted: true
    }));

    // selectedPhenotypes.forEach((e, i) => {
    //   setTimeout(() => {
    //     download(generateLink(e.value, true));
    //   }, i * 250);
    // })
  }

  function handleReset() {
    dispatch(updateBrowsePhenotypes({
      selectedPhenotypes: [],
      submitted: false,
    }));
  }

  return (
    <SidebarContainer className="m-3">
      <SidebarPanel className="col-lg-3">
        <div className="p-2 bg-white border rounded-0">
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
                onReset();
              }}>
              Reset
            </Button>
          </div>
        </div>
      </SidebarPanel>

      <MainPanel className="col-lg-9">
        <div className="bg-white border rounded-0 p-4">
          {!submitted && 
            <p class="h4 text-center text-secondary my-5">
              hierarchical bubble chart
            </p>
          }
        </div>
      </MainPanel>
    </SidebarContainer>
  );
}

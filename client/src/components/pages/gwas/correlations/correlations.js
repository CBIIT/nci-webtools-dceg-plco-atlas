import React, { useEffect, useState, useRef, useContext } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { PhenotypeCorrelationsForm } from './correlations-form';
import { Heatmap } from './heatmap-plot';
import { Alert } from 'react-bootstrap';
import { PhenotypeCorrelationsSearchCriteria } from './correlations-search-criteria';
import {
  SidebarContainer,
  SidebarPanel,
  MainPanel
} from '../../../controls/sidebar-container/sidebar-container';
import {
  updatePhenotypeCorrelations,
  updateHeatmap,
  drawHeatmap
} from '../../../../services/actions';
import { RootContext } from '../../../..';

export function PhenotypeCorrelations() {
  const dispatch = useDispatch();
  const tooltipRef = useRef();

  const { getInitialState } = useContext(RootContext);

  const {
    selectedPhenotypes,
    selectedAncestry,
    selectedSex,
    submitted,
    sharedState,
  } = useSelector(
    state => state.phenotypeCorrelations
  );

  const handleSubmit = ({phenotypes, ancestry, sex}) => {
    dispatch(updatePhenotypeCorrelations({
      selectedPhenotypes: phenotypes,
      selectedAncestry: ancestry,
      selectedSex: sex,
      submitted: true,
    }))
    dispatch(drawHeatmap({
      phenotypes,
      ancestry,
      sex
    }));
    tooltipRef.current && tooltipRef.current.resetTooltip();
  };

  const handleReset = async () => {
    const initialState = getInitialState();
    dispatch(updatePhenotypeCorrelations(initialState.phenotypeCorrelations));
    dispatch(updateHeatmap(initialState.heatmap));
    tooltipRef.current && tooltipRef.current.resetTooltip();
  };

  useEffect(() => {
    if (
      sharedState &&
      sharedState.parameters &&
      sharedState.parameters.params
    ) {
      const state = sharedState.parameters.params;
      handleSubmit({
        phenotypes: state.selectedPhenotypes,
        ancestry: state.selectedAncestry,
        sex: state.selectedSex,
      });
    }
  }, [sharedState]);

  const placeholder = (
    <p className="h4 text-center text-secondary my-5">
      Please select phenotypes to view this plot
    </p>
  );

  return (
    <div className="position-relative">
      <h1 className="sr-only">
        Explore GWAS data - Visualize phenotype correlations
      </h1>

      <SidebarContainer className="mx-3">
        <SidebarPanel className="col-lg-3">
          <div className="px-2 pt-2 pb-3 bg-white tab-pane-bordered rounded-0">
            <PhenotypeCorrelationsForm
              onSubmit={handleSubmit}
              onReset={handleReset}
              selectedPhenotypes={selectedPhenotypes}
              selectedAncestry={selectedAncestry}
              selectedSex={selectedSex}
            />
          </div>
        </SidebarPanel>

        <MainPanel className="col-lg-9">
          <PhenotypeCorrelationsSearchCriteria />
          <div
            className={
              'bg-white tab-pane-bordered rounded-0 p-3 d-flex justify-content-center align-items-center'
            }
            style={{ minHeight: '426px', overflowX: 'auto' }}>
            {!submitted ? placeholder : 
              <div
                className="mw-100 my-4"
                style={{ display: submitted ? 'block' : 'none' }}>
                <Heatmap ref={tooltipRef} />
              </div>}
          </div>
        </MainPanel>
      </SidebarContainer>
    </div>
  );
}

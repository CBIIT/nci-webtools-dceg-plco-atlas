import React, { useEffect, useState, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { PhenotypeCorrelationsForm } from '../forms/phenotype-correlations-form';
import { Heatmap } from '../plots/heatmap-plot';
import { Alert, Tabs, Tab, Button, Spinner } from 'react-bootstrap';
import { PhenotypeCorrelationsSearchCriteria } from '../search-criteria/phenotype-correlations-search-criteria';
import {
  SidebarContainer,
  SidebarPanel,
  MainPanel,
} from '../controls/sidebar-container';
import {
  updatePhenotypeCorrelations,
  drawHeatmap
} from '../../services/actions';


export function PhenotypeCorrelations() {
  const dispatch = useDispatch();

  const phenotypeCorrelations = useSelector(
    state => state.phenotypeCorrelations
  );

  const {
    submitted,
    messages,
    sharedState
  } = phenotypeCorrelations;

  const tooltipRef = useRef();

  const setSubmitted = submitted => {
    dispatch(updatePhenotypeCorrelations({ submitted }));
  };

  const setMessages = messages => {
    dispatch(updatePhenotypeCorrelations({ messages }));
  };

  const clearMessages = e => {
    setMessages([]);
  };

  const setSearchCriteriaPhenotypeCorrelations = searchCriteriaPhenotypeCorrelations => {
    dispatch(
      updatePhenotypeCorrelations({ searchCriteriaPhenotypeCorrelations })
    );
  };

  const placeholder = (
    <div style={{ display: submitted ? 'none' : 'block' }}>
      <p className="h4 text-center text-secondary my-5">
        Please select phenotypes to view this plot
      </p>
    </div>
  );

  const handleChange = () => {
    clearMessages();
    // setSubmitted(null);
  };

  const handleSubmit = params => {
    if (params.length < 2) {
      setMessages([
        {
          type: 'danger',
          content: 'Please select 2 or more phenotypes.'
        }
      ]);
      return;
    }

    // close sidebar on submit
    // setOpenSidebar(false);
    setSearchCriteriaPhenotypeCorrelations({
      phenotypes: params.phenotypes.map(item =>
        item.title ? item.title : item.label
      ),
      sex: params.sex,
      totalPhenotypes: params.phenotypes.length
    });

    setSubmitted(new Date());
    console.log('submit');

    dispatch(drawHeatmap(params));
    tooltipRef.current.resetTooltip();
    dispatch(updatePhenotypeCorrelations({
      sharedState: null
    }))
  };

  useEffect(() => {
    if (sharedState) {
      handleReset();
      dispatch(updatePhenotypeCorrelations({
        selectedPhenotypes: sharedState.parameters.params.selectedPhenotypes,
        selectedSex: sharedState.parameters.params.selectedSex
      }))
      handleSubmit({
        phenotypes: sharedState.parameters.params.selectedPhenotypes,
        sex: sharedState.parameters.params.selectedSex
      });
    }
  }, [sharedState]);

  const handleReset = () => {
    dispatch(
      updatePhenotypeCorrelations({
        // selectedListType: 'categorical',
        selectedPhenotypes: [],
        selectedSex: 'combined',
        heatmapData: null,
        heatmapLayout: {},
        submitted: null,
        messages: [],
        searchCriteriaPhenotypeCorrelations: null,
        collapseCriteria: true,
        shareID: null,
        sharedState: null
      })
    );
    tooltipRef.current.resetTooltip();
  };

  const [openSidebar, setOpenSidebar] = useState(true);

  return (
    <div className="position-relative">
      <h1 className="sr-only">Explore GWAS data - Visualize phenotype correlations</h1>

      <SidebarContainer className="mx-3">
        <SidebarPanel className="col-lg-3">
          <div className="px-2 pt-2 pb-3 bg-white border rounded-0">
            <PhenotypeCorrelationsForm
              onSubmit={handleSubmit}
              onChange={handleChange}
              onReset={handleReset}
              style={{display: openSidebar ? 'block' : 'none'}}
            />
            {messages &&
              messages.map(({ type, content }) => (
                <Alert className="mt-3" variant={type} onClose={clearMessages} dismissible>
                  {content}
                </Alert>
              ))}
            </div>
        </SidebarPanel>

        <MainPanel className="col-lg-9">
          <PhenotypeCorrelationsSearchCriteria />
          <Tabs
            transition={false}
            defaultActiveKey="phenotype-correlations">
            <Tab
              eventKey="phenotype-correlations"
              // title="Heatmap"
              className={
                "bg-white border rounded-0 p-3 d-flex justify-content-center align-items-center"
              }
              style={{ minHeight: '404px' }}>
              <div
                className="mw-100 my-4"
                style={{ display: submitted ? 'block' : 'none' }}>
                <Heatmap ref={tooltipRef} />
              </div>
              {placeholder}
            </Tab>
          </Tabs>
        </MainPanel>
      </SidebarContainer>
    </div>
  );
}

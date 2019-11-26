import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { PhenotypeCorrelationsForm } from '../forms/phenotype-correlations-form';
import { Heatmap } from '../plots/heatmap-plot';
import { Alert, Tabs, Tab, Button } from 'react-bootstrap';
import { PhenotypeCorrelationsSearchCriteria } from '../controls/phenotype-correlations-search-criteria';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCaretRight, faCaretLeft } from '@fortawesome/free-solid-svg-icons'
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
    selectedPhenotypes,
    selectedGender,
  } = phenotypeCorrelations;

  const { submitted, messages } = phenotypeCorrelations;

  const setSubmitted = submitted => {
    dispatch(updatePhenotypeCorrelations({ submitted }));
  };

  const setMessages = messages => {
    dispatch(updatePhenotypeCorrelations({ messages }));
  };

  const setPopupTooltipData = popupTooltipData => {
    dispatch(updatePhenotypeCorrelations({ popupTooltipData }));
  };

  const clearMessages = e => {
    setMessages([]);
  };

  const setSearchCriteriaPhenotypeCorrelations = searchCriteriaPhenotypeCorrelations => {
    dispatch(updatePhenotypeCorrelations({ searchCriteriaPhenotypeCorrelations }));
  }

  const placeholder = (
    <div style={{ display: submitted ? 'none' : 'block' }}>
      <p className="h4 text-center my-5">
        Please select phenotypes to view this plot.
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
          content: 'Please select two or more phenotypes.'
        }
      ]);
      return;
    }

    setSearchCriteriaPhenotypeCorrelations({
      phenotypes: selectedPhenotypes.map((item) => item.title ? item.title : item.label),
      gender: selectedGender,
      totalPhenotypes: selectedPhenotypes.length
    });

    setSubmitted(new Date());
    setPopupTooltipData(null);
    console.log('submit');

    dispatch(drawHeatmap(params));
  };

  const handleReset = params => {
    dispatch(
      updatePhenotypeCorrelations({
        selectedListType: 'categorical',
        selectedPhenotypes: [],
        selectedGender: 'combined',
        heatmapData: [],
        heatmapLayout: {},
        results: [],
        loading: false,
        submitted: null,
        messages: [],
        popupTooltipStyle: {display: 'none'},
        popupTooltipData: null,
        searchCriteriaPhenotypeCorrelations: {}
      })
    );
  };

  const [openSidebar, setOpenSidebar] = useState(true);

  return (
    <>
      <Button
        title="Show/hide search panel"
        variant="link"
        style={{position: 'absolute', zIndex: 100}}
        onClick={() => setOpenSidebar(!openSidebar)}
        aria-controls="phenotype-correlations-collapse-input-panel"
        aria-expanded={openSidebar}>
        { openSidebar ? <FontAwesomeIcon icon={faCaretLeft} size="lg"/> : <FontAwesomeIcon icon={faCaretRight} size="lg"/>}
      </Button>

      <div className={openSidebar ? "row mx-3" : "mx-3"}>
        {openSidebar && (
          <div className="col-md-3">
            <Tabs defaultActiveKey="phenotype-correlations-form">
              <Tab
                eventKey="phenotype-correlations-form"
                // title="Table"
                className="p-2 bg-white tab-pane-bordered rounded-0"
                style={{minHeight: '100%'}}>
                <PhenotypeCorrelationsForm onSubmit={handleSubmit} onChange={handleChange} onReset={handleReset} />
                {messages &&
                  messages.map(({ type, content }) => (
                    <Alert variant={type} onClose={clearMessages} dismissible>
                      {content}
                    </Alert>
                  ))}
              </Tab>
             </Tabs>
          </div>
          )}

        <div className="d-md-none p-2"></div>
      
        <div className={openSidebar ? "col-md-9" : "col-md-12"}>
          <PhenotypeCorrelationsSearchCriteria />

          <Tabs defaultActiveKey="phenotype-correlations">
            <Tab
              eventKey="phenotype-correlations"
              // title="Heatmap"
              className="p-2 bg-white tab-pane-bordered rounded-0"
              style={{minHeight: '50vh'}}>
              
              <div
                className="mw-100 my-4"
                style={{ display: submitted ? 'block' : 'none' }}>
                <Heatmap />
              </div>
              {placeholder}
            </Tab>
          </Tabs>
        </div>
      </div>
    </>
  );
}

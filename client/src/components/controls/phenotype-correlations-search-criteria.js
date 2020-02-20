import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { updatePhenotypeCorrelations } from '../../services/actions';
import { Tab, Tabs, Button } from 'react-bootstrap';

export const PhenotypeCorrelationsSearchCriteria = props => {
  const dispatch = useDispatch();
  const { 
    searchCriteriaPhenotypeCorrelations,
    collapseCriteria
  } = useSelector(state => state.phenotypeCorrelations);

  const setCollapseCriteria = collapseCriteria => {
    dispatch(updatePhenotypeCorrelations({ collapseCriteria }));
  };

  const toggleCollapseCriteria = () => {
    if (collapseCriteria) {
      setCollapseCriteria(false);
    } else {
      setCollapseCriteria(true);
    }
  };

  const CollapseCaret = () => {
    if (!collapseCriteria && searchCriteriaPhenotypeCorrelations.phenotypes) {
      return <i className="fas fa-caret-down fa-lg"></i>;
    } else {
      return <i className="fas fa-caret-right fa-lg"></i>;
    }
  };

  const displayGender = gender =>
    ({
      all: 'All',
      combined: 'All',
      stacked: 'Female/Male (Stacked)',
      female: 'Female',
      male: 'Male'
    }[gender]);

  return (
    <div className="mb-2">
      <Tabs 
        transition={false}
        className="" 
        defaultActiveKey="search-criteria">
        <Tab
          eventKey="search-criteria"
          className="d-flex justify-content-between px-3 py-2 bg-white tab-pane-bordered rounded-0">
          <div className="row left py-1">
            <div className="col-md-auto pr-0">
              <span className="mr-1">
                <Button
                  className="p-0"
                  style={{
                    color: searchCriteriaPhenotypeCorrelations.phenotypes
                      ? '#008CBA'
                      : ''
                  }}
                  title="Expand/collapse search criteria panel"
                  variant="link"
                  onClick={e => toggleCollapseCriteria()}
                  aria-controls="search-criteria-collapse-panel"
                  aria-expanded={!collapseCriteria}
                  disabled={!searchCriteriaPhenotypeCorrelations.phenotypes}>
                  <CollapseCaret />
                </Button>
              </span>
              <span>
                <b>Phenotypes(</b>
                {searchCriteriaPhenotypeCorrelations.phenotypes
                  ? searchCriteriaPhenotypeCorrelations.phenotypes.length
                  : 0}
                <b>)</b>:
              </span>
            </div>
            <div
              className="col-md-auto ml-1 pl-0"
              style={{ maxHeight: '300px', overflow: 'auto' }}>
              {collapseCriteria && (
                <>
                  <span>
                    {searchCriteriaPhenotypeCorrelations &&
                    searchCriteriaPhenotypeCorrelations.phenotypes && searchCriteriaPhenotypeCorrelations.phenotypes.length >= 1
                      ? searchCriteriaPhenotypeCorrelations.phenotypes[0]
                      : 'None'}
                  </span>
                  <span className="ml-1">
                    {searchCriteriaPhenotypeCorrelations &&
                    searchCriteriaPhenotypeCorrelations.phenotypes &&
                    searchCriteriaPhenotypeCorrelations.phenotypes.length >
                      1 ? (
                      <span>and</span>
                    ) : (
                      <></>
                    )}
                    <button
                      className="ml-1 p-0 text-primary"
                      style={{
                        all: 'unset',
                        textDecoration: 'underline',
                        cursor: 'pointer'
                      }}
                      title="Expand/collapse search criteria panel"
                      onClick={e => toggleCollapseCriteria()}
                      aria-controls="search-criteria-collapse-panel"
                      aria-expanded={!collapseCriteria}>
                      <span style={{ color: '#008CBA' }}>
                        {searchCriteriaPhenotypeCorrelations &&
                        searchCriteriaPhenotypeCorrelations.phenotypes
                          ? searchCriteriaPhenotypeCorrelations.phenotypes
                              .length -
                            1 +
                            ` other${
                              searchCriteriaPhenotypeCorrelations.phenotypes
                                .length -
                                1 ===
                              1
                                ? ''
                                : 's'
                            }`
                          : ''}
                      </span>
                    </button>
                  </span>
                </>
              )}
              {!collapseCriteria &&
                searchCriteriaPhenotypeCorrelations &&
                searchCriteriaPhenotypeCorrelations.phenotypes &&
                searchCriteriaPhenotypeCorrelations.phenotypes.map(
                  phenotype => <div>{phenotype}</div>
                )}
            </div>

            <div className="col-md-auto border-left border-dark">

              <span>
                <b>Gender</b>:{' '}
              </span>
              {searchCriteriaPhenotypeCorrelations &&
              searchCriteriaPhenotypeCorrelations.gender
                ? displayGender(searchCriteriaPhenotypeCorrelations.gender)
                : 'None'}
            </div>
          </div>

          <div className="right py-1">
            <span>Total Phenotypes: </span>
            {searchCriteriaPhenotypeCorrelations &&
            searchCriteriaPhenotypeCorrelations.totalPhenotypes
              ? searchCriteriaPhenotypeCorrelations.totalPhenotypes
              : 'None'}
          </div>
        </Tab>
      </Tabs>
    </div>
  );
};

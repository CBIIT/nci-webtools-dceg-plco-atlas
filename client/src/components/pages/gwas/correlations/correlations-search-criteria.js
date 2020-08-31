import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { updatePhenotypeCorrelations } from '../../../../services/actions';
import { Button } from 'react-bootstrap';
import { ShareLink } from '../../../controls/share-link/share-link';


export const PhenotypeCorrelationsSearchCriteria = () => {
  const dispatch = useDispatch();

  const phenotypeCorrelations = useSelector(
    state => state.phenotypeCorrelations
  );

  const {
    searchCriteriaPhenotypeCorrelations,
    collapseCriteria,
    shareID,
    disableSubmit
  } = phenotypeCorrelations;

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
    if (searchCriteriaPhenotypeCorrelations && !collapseCriteria && searchCriteriaPhenotypeCorrelations.phenotypes) {
      return <i className="fa fa-caret-down fa-lg"></i>;
    } else {
      return <i className="fa fa-caret-right fa-lg"></i>;
    }
  };

  const displaySex = sex =>
    ({
      all: 'All',
      combined: 'All',
      stacked: 'Female/Male (Stacked)',
      female: 'Female',
      male: 'Male'
    }[sex]);

  const displayAncestry = ancestry =>
    ({
      all: 'All',
      white: 'White',
      black: 'Black',
      hispanic: 'Hispanic',
      asian: 'Asian',
      pacific_islander: 'Pacific Islander',
      american_indian: 'American Indian',
    }[ancestry]);

  return (
    <div className="mb-2">
      <div className="px-3 py-2 bg-white tab-pane-bordered rounded-0">
        <div className="d-flex justify-content-between">
          <div className="py-1 d-flex justify-content-start">
            <span className="mr-1">
              <Button
                className="p-0"
                style={{
                  color: 
                    searchCriteriaPhenotypeCorrelations && 
                    searchCriteriaPhenotypeCorrelations.phenotypes && 
                    searchCriteriaPhenotypeCorrelations.phenotypes.length > 1
                    ? 'rgb(0, 126, 167)'
                    : ''
                }}
                title="Expand/collapse search criteria panel"
                variant="link"
                onClick={e => toggleCollapseCriteria()}
                aria-controls="search-criteria-collapse-panel"
                aria-expanded={!collapseCriteria}
                disabled={
                  !searchCriteriaPhenotypeCorrelations || 
                  (searchCriteriaPhenotypeCorrelations && searchCriteriaPhenotypeCorrelations.phenotypes.length < 2)
                }>
                <CollapseCaret />
              </Button>
            </span>
            <span>
              <b>Phenotypes:</b>{' '}
              {collapseCriteria && (
                <>
                  <span>
                    {searchCriteriaPhenotypeCorrelations &&
                    searchCriteriaPhenotypeCorrelations.phenotypes && searchCriteriaPhenotypeCorrelations.phenotypes.length >= 1
                      ? searchCriteriaPhenotypeCorrelations.phenotypes[0]
                      : 'None'}
                  </span>
                  <span className="">
                    {searchCriteriaPhenotypeCorrelations &&
                    searchCriteriaPhenotypeCorrelations.phenotypes &&
                    searchCriteriaPhenotypeCorrelations.phenotypes.length >
                      1 ? (
                      <span>{' '}and</span>
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
                      <span style={{ color: 'rgb(0, 126, 167)' }}>
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
            </span>
            <span className="ml-1">
              {!collapseCriteria &&
                searchCriteriaPhenotypeCorrelations &&
                searchCriteriaPhenotypeCorrelations.phenotypes &&
                searchCriteriaPhenotypeCorrelations.phenotypes.map(phenotype => (
                  <div title={phenotype}>
                    {phenotype.length < 50 ? phenotype : phenotype.substring(0, 47) + "..." }
                  </div>
              ))}
            </span>

            <span className="border-left border-secondary mx-3" style={{maxHeight: '1.6em'}}></span>
            
            <span>
              <b>Sex</b>:{' '}
              {searchCriteriaPhenotypeCorrelations &&
              searchCriteriaPhenotypeCorrelations.sex
                ? displaySex(searchCriteriaPhenotypeCorrelations.sex)
                : 'None'
              }
            </span>

            <span className="border-left border-secondary mx-3" style={{maxHeight: '1.6em'}}></span>
            
            <span>
              <b>Ancestry</b>:{' '}
              {searchCriteriaPhenotypeCorrelations && searchCriteriaPhenotypeCorrelations.ancestry
                ? displayAncestry(searchCriteriaPhenotypeCorrelations.ancestry)
                : 'None'
              }
            </span>
          </div>

          <div className="d-flex">
            <span className="py-1">
              <b>Total Phenotypes:</b>{' '}
              {searchCriteriaPhenotypeCorrelations &&
                searchCriteriaPhenotypeCorrelations.totalPhenotypes
                  ? searchCriteriaPhenotypeCorrelations.totalPhenotypes
                  : 'None'
              }
            </span>
            
            <span className="ml-3" style={{maxHeight: '1.6em'}}></span>
            
            <div className="d-inline">
              <ShareLink 
                disabled={!searchCriteriaPhenotypeCorrelations || !disableSubmit}
                shareID={shareID}
                params={phenotypeCorrelations}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

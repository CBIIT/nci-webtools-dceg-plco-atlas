import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { updateVariantLookup } from '../../services/actions';
import { Tab, Tabs, Button } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCaretRight, faCaretDown } from '@fortawesome/free-solid-svg-icons';

export const VariantLookupSearchCriteria = props => {
  const dispatch = useDispatch();
  const { 
    searchCriteriaVariantLookup, 
    numResults,
    collapseCriteria
  } = useSelector(state => state.variantLookup);

  const setCollapseCriteria = collapseCriteria => {
    dispatch(updateVariantLookup({ collapseCriteria }));
  };

  const toggleCollapseCriteria = () => {
    if (collapseCriteria) {
      setCollapseCriteria(false);
    } else {
      setCollapseCriteria(true);
    }
  };

  const CollapseCaret = () => {
    if (!collapseCriteria && searchCriteriaVariantLookup.phenotypes) {
      return <FontAwesomeIcon icon={faCaretDown} size="lg" />;
    } else {
      return <FontAwesomeIcon icon={faCaretRight} size="lg" />;
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
      <Tabs className="" defaultActiveKey="variant-lookup-search-criteria">
        <Tab
          eventKey="variant-lookup-search-criteria"
          className="d-flex justify-content-between px-3 py-2 bg-white tab-pane-bordered rounded-0">
          <div className="row left py-1">
            <div className="col-md-auto pr-0">
              <span className="mr-1">
                <Button
                  className="p-0"
                  title="Expand/collapse search criteria panel"
                  style={{
                    color: searchCriteriaVariantLookup.phenotypes
                      ? '#008CBA'
                      : ''
                  }}
                  variant="link"
                  onClick={e => toggleCollapseCriteria()}
                  aria-controls="search-criteria-collapse-panel"
                  aria-expanded={!collapseCriteria}
                  disabled={!searchCriteriaVariantLookup.phenotypes}>
                  <CollapseCaret />
                </Button>
              </span>
              <span>
                <b>Phenotypes(</b>
                {searchCriteriaVariantLookup.phenotypes
                  ? searchCriteriaVariantLookup.phenotypes.length
                  : 0}
                <b>)</b>:
              </span>
            </div>
            <div
              className="col-md-auto ml-1 px-0"
              style={{ maxHeight: '300px', overflow: 'auto' }}>
              {collapseCriteria && (
                <>
                  <span>
                    {searchCriteriaVariantLookup &&
                    searchCriteriaVariantLookup.phenotypes && searchCriteriaVariantLookup.phenotypes.length >= 1
                      ? searchCriteriaVariantLookup.phenotypes[0]
                      : 'None'}
                  </span>
                  <span className="ml-1">
                    {searchCriteriaVariantLookup &&
                    searchCriteriaVariantLookup.phenotypes &&
                    searchCriteriaVariantLookup.phenotypes.length > 1 ? (
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
                        {searchCriteriaVariantLookup &&
                        searchCriteriaVariantLookup.phenotypes &&
                        searchCriteriaVariantLookup.phenotypes.length > 1
                          ? searchCriteriaVariantLookup.phenotypes.length -
                            1 +
                            ` other${
                              searchCriteriaVariantLookup.phenotypes.length -
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
                searchCriteriaVariantLookup &&
                searchCriteriaVariantLookup.phenotypes &&
                searchCriteriaVariantLookup.phenotypes.map(phenotype => (
                  <div>{phenotype}</div>
                ))}
            </div>

            <div className="col-md-auto ml-1 px-0">
              <span className="mx-3">|</span>

              <span>
                <b>Variant</b>:{' '}
              </span>
              {searchCriteriaVariantLookup &&
              searchCriteriaVariantLookup.variant
                ? searchCriteriaVariantLookup.variant
                : 'None'}

              <span className="mx-3">|</span>

              <span>
                <b>Gender</b>:{' '}
              </span>
              {searchCriteriaVariantLookup && searchCriteriaVariantLookup.gender
                ? displayGender(searchCriteriaVariantLookup.gender)
                : 'None'}
            </div>
          </div>

          <div className="right py-1">
            <span>Total Results: </span>
            {searchCriteriaVariantLookup && numResults ? numResults : 'None'}
          </div>
        </Tab>
      </Tabs>
    </div>
  );
};

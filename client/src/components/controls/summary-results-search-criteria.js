import React from 'react';
import { useSelector } from 'react-redux';
import { Tab, Tabs } from 'react-bootstrap';

export const SummaryResultsSearchCriteria = () => {
  const { searchCriteriaSummaryResults, sampleSize } = useSelector(
    state => state.summaryResults
  );

  const displayGender = gender =>
    ({
      all: 'All',
      stacked: 'Female/Male (Stacked)',
      female: 'Female',
      male: 'Male'
    }[gender]);

  return (
    <div className="mb-2">
      <Tabs 
        transition={false}
        className="" 
        defaultActiveKey="summary-results-search-criteria">
        <Tab
          eventKey="summary-results-search-criteria"
          className="d-flex justify-content-between px-3 py-2 bg-white tab-pane-bordered rounded-0">
          <div className="row left py-1">
            <div className="col-md-auto ml-1">
              <span>
                <b>Phenotype</b>:{' '}
              </span>
              {searchCriteriaSummaryResults &&
              searchCriteriaSummaryResults.phenotype
                ? searchCriteriaSummaryResults.phenotype
                : 'None'}
            </div>
            <div className="col-md-auto border-left border-dark">
              <span>
                <b>Gender</b>:{' '}
              </span>
              {searchCriteriaSummaryResults && searchCriteriaSummaryResults.gender
                ? displayGender(searchCriteriaSummaryResults.gender)
                : 'None'}
            </div>
          </div>

          <div className="right py-1">
            <span>Total Variants: </span>
            {sampleSize ? sampleSize.toLocaleString() : 'None'}
          </div>
        </Tab>
      </Tabs>
    </div>
  );
};

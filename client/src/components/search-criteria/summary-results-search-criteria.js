import React from 'react';
import { useSelector } from 'react-redux';
import { Tab, Tabs } from 'react-bootstrap';
import { ShareLink } from '../controls/share-link';


export const SummaryResultsSearchCriteria = () => {
  const { searchCriteriaSummaryResults, sampleSize } = useSelector(
    state => state.summaryResults
  );

  const displaySex = sex =>
    ({
      all: 'All',
      stacked: 'Female/Male (Stacked)',
      female: 'Female',
      male: 'Male'
    }[sex]);

  return (
    <div className="mb-2">
      <Tabs
        transition={false}
        className=""
        defaultActiveKey="summary-results-search-criteria">
        <Tab
          eventKey="summary-results-search-criteria"
          className="px-3 py-2 bg-white tab-pane-bordered rounded-0">
          <div className="d-flex justify-content-between">
              <div className="py-1">
                <span>
                  <b>Phenotype</b>:{' '}
                </span>
                {searchCriteriaSummaryResults &&
                searchCriteriaSummaryResults.phenotype
                  ? searchCriteriaSummaryResults.phenotype
                  : 'None'}

                <span className="border-left border-secondary mx-3" style={{maxHeight: '1.6em'}}></span>
                
                <span>
                  <b>Sex</b>:{' '}
                </span>
                {searchCriteriaSummaryResults && searchCriteriaSummaryResults.sex
                  ? displaySex(searchCriteriaSummaryResults.sex)
                  : 'None'}
              </div>
            
            <div className="py-1">
              <b><span>Total Variants: </span></b>
              {sampleSize ? sampleSize.toLocaleString() : 'None'}
            </div>
          </div>

          {/* <div className="right py-1">
            <b><span>Total Variants: </span></b>
            {sampleSize ? sampleSize.toLocaleString() : 'None'}
          </div> */}
          {
            searchCriteriaSummaryResults &&
              <div className="d-flex justify-content-end">
                <ShareLink />
              </div>
          }

        </Tab>
      </Tabs>
    </div>
  );
};

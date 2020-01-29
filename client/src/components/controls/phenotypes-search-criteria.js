import React from 'react';
import { useSelector } from 'react-redux';
import { Tab, Tabs } from 'react-bootstrap';

export const PhenotypesSearchCriteria = () => {
  const { 
    searchCriteriaPhenotypes,
    submitted
  } = useSelector(
    state => state.browsePhenotypes
  );

  const placeholder = (
    <div style={{ display: submitted ? 'none' : 'block' }}>
      <p className="h4 text-center text-secondary my-1">
        Please select a phenotype
      </p>
    </div>
  );

  return (
    <div className="mb-2">
      <Tabs className="" defaultActiveKey="phenotypes-search-criteria">
        <Tab
          eventKey="phenotypes-search-criteria"
          className="d-flex justify-content-between px-3 py-2 bg-white tab-pane-bordered rounded-0">
          <div 
            className="left"
            style={{ display: !submitted ? 'none' : 'block' }}>
            <p className="h4 my-1">
              {searchCriteriaPhenotypes.phenotype}
            </p>
          </div>
          {placeholder}
        </Tab>
      </Tabs>
    </div>
  );
};

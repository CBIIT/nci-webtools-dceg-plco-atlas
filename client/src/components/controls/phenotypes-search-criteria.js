import React from 'react';
import { useSelector } from 'react-redux';
import { Tab, Tabs } from 'react-bootstrap';

export const PhenotypesSearchCriteria = () => {
  const { searchCriteriaPhenotypes } = useSelector(
    state => state.browsePhenotypes
  );

  return (
    <div className="mb-2">
      <Tabs className="" defaultActiveKey="phenotypes-search-criteria">
        <Tab
          eventKey="phenotypes-search-criteria"
          className="d-flex justify-content-between px-3 py-2 bg-white tab-pane-bordered rounded-0">
          <div className="left py-1">
            <span>
              <b>Phenotype</b>:{' '}
            </span>
            {searchCriteriaPhenotypes &&
            searchCriteriaPhenotypes.phenotype
              ? searchCriteriaPhenotypes.phenotype
              : 'None'}
          </div>
        </Tab>
      </Tabs>
    </div>
  );
};

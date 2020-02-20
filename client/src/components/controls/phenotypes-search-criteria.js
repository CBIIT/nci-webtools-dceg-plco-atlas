import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { updateBrowsePhenotypes } from '../../services/actions';
import { Tab, Tabs } from 'react-bootstrap';
import { Icon } from './icon';


export const PhenotypesSearchCriteria = () => {
  const dispatch = useDispatch();
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

  const setSubmitted = () => {
    dispatch(updateBrowsePhenotypes({ 
      submitted: null,
     }));
  }

  return (
    <div className="mb-2">
      <Tabs 
        transition={false}
        className="" 
        defaultActiveKey="phenotypes-search-criteria">
        <Tab
          eventKey="phenotypes-search-criteria"
          className="d-flex justify-content-between px-3 py-2 bg-white tab-pane-bordered rounded-0">
          <div
            className="left"
            style={{ display: !submitted ? 'none' : 'block' }}>

            {/* <div
              className="left">
              <a 
                href="javascript:void(0)"
                onClick={setSubmitted}>
                Go back
              </a>
              <Icon
                name="arrow-left"
                className="mx-2 opacity-50"
                width="10"
              />
            </div> */}
            
            <p className="h4 my-1">
              {searchCriteriaPhenotypes.phenotype}

              <span className="text-muted ml-3" style={{fontSize: '13px'}}>
                Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed et venenatis mauris. Etiam aliquam accumsan enim, in sodales urna ultrices sed. Duis et vehicula ante, tempor semper nisl. Suspendisse in tempor erat, at tincidunt elit. Etiam scelerisque venenatis nulla eu maximus. Ut sit amet ipsum odio.
              </span>
            </p>

          </div>
          {placeholder}
        </Tab>
      </Tabs>
    </div>
  );
};

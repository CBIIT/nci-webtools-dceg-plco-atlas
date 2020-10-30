import React from 'react';
import { useSelector } from 'react-redux';
import { ShareLink } from '../../controls/share-link/share-link';

export const PhenotypesSearchCriteria = () => {
  const browsePhenotypes = useSelector(state => state.browsePhenotypes);
  const { submitted, shareID, disableSubmit } = browsePhenotypes;
  const { phenotypeData } = useSelector(state => state.browsePhenotypesPlots);

  const phenotypes = useSelector(state => state.phenotypes);

  const placeholder = (
    <div style={{ display: submitted ? 'none' : 'block' }}>
      <p className="h5 text-center text-secondary my-1">
        Please select a phenotype
      </p>
    </div>
  );

  return (
    <div className="mb-2">
      <div className="d-flex justify-content-between px-3 py-2 bg-white tab-pane-bordered rounded-0">
        <div
          className=""
          style={{
            display: !submitted ? 'none' : 'block',
            width: '85%'
          }}>
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

          <p className="h5 my-1">
            {(phenotypeData && phenotypeData.displayName) || ''}

            <span className="text-muted ml-3" style={{ fontSize: '13px' }}>
              {(phenotypeData && phenotypeData.description) || ''}
            </span>
          </p>
        </div>
        {placeholder}

        <span className="ml-3" style={{ maxHeight: '1.6em' }}></span>

        <div className="d-inline">
          <ShareLink
            disabled={!phenotypes || (!disableSubmit && phenotypeData)}
            shareID={shareID}
            params={browsePhenotypes}
          />
        </div>
      </div>
    </div>
  );
};

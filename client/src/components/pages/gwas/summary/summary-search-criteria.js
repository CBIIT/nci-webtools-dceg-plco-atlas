import React from 'react';
import { useSelector } from 'react-redux';
import { ShareLink } from '../../../controls/share-link';


export const SummaryResultsSearchCriteria = () => {
  const summaryResults = useSelector(state => state.summaryResults);
  const {
    searchCriteriaSummaryResults,
    selectedPhenotype,
    selectedSex,
    shareID,
    disableSubmit
  } = summaryResults;

  const {
    sampleSize
  } = useSelector(state => state.qqPlot);

  const displaySex = sex =>
    ({
      all: 'All',
      stacked: 'Female/Male (Stacked)',
      female: 'Female',
      male: 'Male'
    }[sex]);

  return (
    <div className="mb-2">
      <div className="px-3 py-2 bg-white tab-pane-bordered rounded-0">
        <div className="d-flex justify-content-between">
            <div className="py-1">
              <span>
                <b>Phenotype</b>:{' '}
                {selectedPhenotype &&
                selectedPhenotype.display_name
                  ? selectedPhenotype.display_name
                  : 'None'}
              </span>

              <span className="border-left border-secondary mx-3" style={{maxHeight: '1.6em'}}></span>

              <span>
                <b>Sex</b>:{' '}
                {selectedSex
                  ? displaySex(selectedSex)
                  : 'None'}
              </span>
            </div>

            <div className="d-flex">
              <span className="py-1">
                <b>Total Variants:</b> {' '}
                {sampleSize
                  ? sampleSize.toLocaleString() :
                  'None'}
              </span>

              <span className="ml-3" style={{maxHeight: '1.6em'}}></span>

              <div className="d-flex justify-content-end">
                <ShareLink
                  disabled={!searchCriteriaSummaryResults || !disableSubmit}
                  shareID={shareID}
                  params={summaryResults}
                />
              </div>

            </div>
        </div>
      </div>
    </div>
  );
};

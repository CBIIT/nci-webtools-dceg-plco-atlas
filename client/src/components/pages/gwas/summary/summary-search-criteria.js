import React from 'react';
import { useSelector } from 'react-redux';
import { ShareLink } from '../../../controls/share-link/share-link';
// import { LoadingOverlay } from '../../../controls/loading-overlay/loading-overlay';


export const SummaryResultsSearchCriteria = () => {
  const summaryResults = useSelector(state => state.summaryResults);
  const {
    searchCriteriaSummaryResults,
    selectedPhenotype,
    selectedSex,
    selectedAncestry,
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

  const displayAncestry = ancestry =>
    ({
      european: 'European',
      east_asian: 'East Asian'
    }[ancestry]);

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

              {/* <span>
                <b>Sex</b>:{' '}
                {selectedSex
                  ? displaySex(selectedSex)
                  : 'None'}
              </span>

              <span className="border-left border-secondary mx-3" style={{maxHeight: '1.6em'}}></span> */}

              <span>
                <b>Stratification</b>:{' '}
                {selectedAncestry
                  ? `${displayAncestry(selectedAncestry)} - ${displaySex(selectedSex)}`
                  : 'None'}
              </span>
            </div>

            <div className="d-flex">
              <span className="py-1"
                style={{
                  display: selectedSex === 'stacked' ? 'none' : 'block'
                }}>
                <b>Total Variants:</b> {' '}
                <span>
                  {/* <LoadingOverlay active={true} /> */}
                  {sampleSize
                    ? sampleSize.toLocaleString() :
                    'None'}
                </span>
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

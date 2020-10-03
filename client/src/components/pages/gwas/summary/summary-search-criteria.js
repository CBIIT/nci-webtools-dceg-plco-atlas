import React from 'react';
import { useSelector } from 'react-redux';
import { ShareLink } from '../../../controls/share-link/share-link';
import { asTitleCase } from './utils';
// import { LoadingOverlay } from '../../../controls/loading-overlay/loading-overlay';


export const SummaryResultsSearchCriteria = () => {
  const summaryResults = useSelector(state => state.summaryResults);
  const sampleSize = useSelector(state => state.summaryTables.tables[0].resultsCount)
  const {
    selectedPhenotypes,
    selectedStratifications,
    isPairwise,
    shareID,
    submitted,
  } = summaryResults;

  return (
    <div className="mb-2">
      <div className="px-3 py-2 bg-white tab-pane-bordered rounded-0">
        <div className="d-flex justify-content-between">
            <div className="py-1">
              <span>
                <b>Phenotype(s): </b>
                  {selectedPhenotypes.length 
                    ? selectedPhenotypes.map(p => p.display_name).join(', ') 
                    : 'None'}
              </span>

              <span className="border-left border-secondary mx-3" style={{maxHeight: '1.6em'}}></span>

              <span>
                <b>Stratification(s): </b>
                    {selectedStratifications.length
                      ? selectedStratifications.map(s => asTitleCase(`${s.ancestry} - ${s.sex}`)).join(', ')
                      : 'None'}
              </span>
            </div>

            <div className="d-flex">
              {submitted && !isPairwise && <span className="py-1 mr-3">
                <b>Total Variants:</b> {sampleSize.toLocaleString()}
              </span>}

              <ShareLink
                disabled={!submitted}
                shareID={shareID}
                params={summaryResults}
              />
            </div>
        </div>
      </div>
    </div>
  );
};

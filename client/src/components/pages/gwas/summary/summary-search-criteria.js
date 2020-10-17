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
  

  const summaryTables = useSelector(state => state.summaryTables);
  const phenotypes = submitted ? (isPairwise ? [0, 1] : [0]).map(index => ({
    ...(selectedPhenotypes[index] || selectedPhenotypes[0]), 
    stratification: [
      selectedStratifications[index].ancestry,
      selectedStratifications[index].sex,
    ].filter(str => str !== 'all').map(asTitleCase).join(' '),
    resultsCount: summaryTables.tables[index].resultsCount,
  })) : [];

  return (
    <div className="p-3 mb-2 bg-white border rounded-0 d-flex justify-content-between">
        {!submitted 
          ? <strong className="d-flex align-items-center text-muted">No phenotype(s) selected.</strong>
          : <div>
            {phenotypes.map((p, i) => <div className={(isPairwise && i == 0) ? 'mb-2' : 'mb-0'}>
              <strong>{p.display_name} ({p.stratification}) - <small>{p.resultsCount.toLocaleString()} variants</small></strong>
              <div className="small muted">{p.description}</div>
            </div>)}
          </div>}
        <ShareLink
          disabled={!submitted}
          shareID={shareID}
          params={summaryResults}
        />
    </div>
  );
};

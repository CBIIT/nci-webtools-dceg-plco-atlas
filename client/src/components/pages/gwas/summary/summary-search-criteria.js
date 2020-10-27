import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { ShareLink } from '../../../controls/share-link/share-link';
import { asTitleCase } from './utils';
import { query } from '../../../../services/query';

export const SummaryResultsSearchCriteria = () => {
  const {
    selectedPhenotypes,
    selectedStratifications,
    selectedChromosome,
    selectedPlot,
    isPairwise,
    manhattanPlotView,
    nlogpMin,
    nlogpMax,
    bpMin,
    bpMax,
    submitted,
    shareID,
  } = useSelector(state => state.summaryResults);

  const [phenotypes, setPhenotypes] = useState([]);

  useEffect(() => {
    Promise.all(
      submitted
        ? (isPairwise ? [0, 1] : [0]).map(async index => ({
            ...(selectedPhenotypes[index] || selectedPhenotypes[0]),
            stratification: [
              selectedStratifications[index].ancestry,
              selectedStratifications[index].sex
            ]
              .filter(str => str !== 'all')
              .map(asTitleCase)
              .join(' '),
            resultsCount: (await query('metadata', {
              phenotype_id: (selectedPhenotypes[index] || selectedPhenotypes[0])
                .id,
              ancestry: selectedStratifications[index].ancestry,
              sex: selectedStratifications[index].sex,
              chromosome: 'all'
            }))[0].count
          }))
        : []
    ).then(setPhenotypes);
  }, [submitted, selectedPhenotypes, selectedStratifications, isPairwise]);

  return (
    <div className="p-3 mb-2 bg-white border rounded-0 d-flex justify-content-between">
      {!submitted ? (
        <strong className="d-flex align-items-center text-muted">
          No phenotype(s) selected.
        </strong>
      ) : (
        <div>
          {phenotypes.map((p, i) => (
            <div className={isPairwise && i == 0 ? 'mb-2' : 'mb-0'}>
              <strong>
                {p.display_name} ({p.stratification}) -{' '}
                <small>{p.resultsCount.toLocaleString()} variants</small>
              </strong>
              <div className="small muted">{p.description}</div>
            </div>
          ))}
        </div>
      )}
      <ShareLink
        disabled={!submitted}
        shareID={shareID}
        params={{
          selectedPhenotypes,
          selectedStratifications,
          selectedChromosome,
          selectedPlot,
          isPairwise,
          manhattanPlotView,
          nlogpMin,
          nlogpMax,
          bpMin,
          bpMax,
        }}
      />
    </div>
  );
};

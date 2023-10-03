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
	} = useSelector((state) => state.summaryResults);

	const [phenotypes, setPhenotypes] = useState([]);

	useEffect(() => {
		Promise.all(
			submitted && selectedPhenotypes && selectedStratifications
				? (isPairwise ? [0, 1] : [0]).map(async (index) => ({
						...(selectedPhenotypes[index] || selectedPhenotypes[0]),
						stratification: [
							selectedStratifications[index].ancestry,
							selectedStratifications[index].sex,
						]
							.filter((str) => str !== 'all')
							.map(asTitleCase)
							.join(' '),
						resultsCounts: (
							await query('metadata', {
								phenotype_id: (
									selectedPhenotypes[index] || selectedPhenotypes[0]
								).id,
								ancestry: selectedStratifications[index].ancestry,
								sex: selectedStratifications[index].sex,
								chromosome: 'all',
							})
						)[0],
				  }))
				: []
		).then(setPhenotypes);
	}, [submitted, selectedPhenotypes, selectedStratifications, isPairwise]);

	return (
		<div className='p-3 mb-2 bg-white border rounded-0 d-flex justify-content-between'>
			{!(submitted && selectedPhenotypes && selectedStratifications) ? (
				<strong className='d-flex align-items-center text-muted'>
					No phenotype(s) selected.
				</strong>
			) : (
				<div>
					{phenotypes.map((p, i) => (
						<div className={isPairwise && +i === 0 ? 'mb-2' : 'mb-0'}>
							<strong>
								<a href={p.link} target='_blank'>
									{p.display_name}
								</a>{' '}
								({p.stratification}) -{' '}
								<small>{p.resultsCounts.count.toLocaleString()} variants</small>
								{p.display_name.includes('Machiela') ? (
									p.type === 'binary' ? (
										<>
											<small className='ml-2'>
												{(
													p.resultsCounts.participant_count_case || 0
												).toLocaleString()}{' '}
												cases
											</small>
											<small className='ml-2'>
												{(
													p.resultsCounts.participant_count_control || 0
												).toLocaleString()}{' '}
												controls
											</small>
										</>
									) : (
										<>
											<small className='ml-2'>
												{(
													p.resultsCounts.participant_count_case ||
													p.resultsCounts.participant_count ||
													0
												).toLocaleString()}{' '}
												participants
											</small>
										</>
									)
								) : (
									''
								)}
							</strong>
							<div className='small muted'>{p.description}</div>
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
					submitted,
				}}
			/>
		</div>
	);
};

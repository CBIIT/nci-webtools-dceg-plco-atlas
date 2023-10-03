import React, { useContext, useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { VariantLookupForm } from './lookup-form';
import {
	updateVariantLookup,
	lookupVariants,
	updateVariantLookupTable,
} from '../../../../services/actions';
import {
	SidebarContainer,
	SidebarPanel,
	MainPanel,
} from '../../../controls/sidebar-container/sidebar-container';
import {
	Table,
	paginationText,
	paginationSizeSelector,
	paginationButton,
} from '../../../controls/table/table';
import paginationFactory from 'react-bootstrap-table2-paginator';
import filterFactory from 'react-bootstrap-table2-filter';
import ToolkitProvider, { CSVExport } from 'react-bootstrap-table2-toolkit';
import { LoadingOverlay } from '../../../controls/loading-overlay/loading-overlay';
import { VariantLookupSearchCriteria } from './lookup-search-criteria';
import { RootContext } from '../../../../index';
export function VariantLookup() {
	const dispatch = useDispatch();
	const { getInitialState } = useContext(RootContext);
	const {
		selectedPhenotypes,
		selectedAncestry,
		selectedSex,
		selectedVariant,
		submitted,
		sharedState,
	} = useSelector((state) => state.variantLookup);
	const results = useSelector((state) => state.variantLookupTable.results);
	const { ExportCSVButton } = CSVExport;
	const defaultFormatter = (cell) => (cell === null ? '-' : cell);
	const columns = [
		{
			// title: true,
			title: (cell, row, rowIndex, colIndex) => cell,
			dataField: 'phenotype.display_name',
			text: 'Phenotype',
			sort: true,
			headerStyle: { width: '290px' },
			headerClasses: 'overflow-ellipsis',
			classes: 'overflow-ellipsis',
			// events: {
			//   onClick: (e, column, columnIndex, row, rowIndex) => { console.log(e.target.title) },
			// }
		},
		{
			dataField: 'variant',
			text: 'Variant',
			hidden: true,
		},
		{
			dataField: 'sex',
			text: 'Sex',
			hidden: true,
		},
		{
			dataField: 'ancestry',
			text: 'Ancestry',
			hidden: true,
		},
		{
			dataField: 'chromosome',
			text: 'Chr.',
			headerTitle: (_) => 'Chromosome',
			title: true,
			sort: true,
			formatter: (cell) => (cell == 23 ? 'X' : defaultFormatter(cell)),
			headerStyle: { width: '65px', minWidth: '65px' },
			headerClasses: 'overflow-ellipsis',
			classes: 'overflow-ellipsis',
		},
		{
			dataField: 'position',
			text: 'Pos.',
			headerTitle: (_) => 'Position',
			title: true,
			sort: true,
			formatter: defaultFormatter,
			headerStyle: { width: '100px' },
			headerClasses: 'overflow-ellipsis',
			classes: 'overflow-ellipsis',
		},
		{
			dataField: 'snp',
			text: 'SNP',
			sort: true,
			formatter: (cell) =>
				cell === null ? (
					'-'
				) : !/^rs\d+/.test(cell) ? (
					cell
				) : (
					<a
						className='overflow-ellipsis'
						href={`https://www.ncbi.nlm.nih.gov/snp/${cell.split(':')[0]}`}
						target='_blank'
					>
						{cell}
					</a>
				),
			title: true,
			headerStyle: { width: '180px' },
			headerClasses: 'overflow-ellipsis',
			classes: 'overflow-ellipsis  text-nowrap',
		},
		{
			dataField: 'allele_effect',
			text: 'Eff. Allele [Freq.]',
			headerTitle: (_) => 'Effect Allele [Frequency]',
			formatter: (cell, row) =>
				cell === null
					? '-'
					: `${cell} [${row.allele_effect_frequency.toPrecision(4)}]`,
			title: (cell, row) =>
				cell === null
					? '-'
					: `${cell} [${row.allele_effect_frequency.toPrecision(4)}]`,
			headerStyle: { width: '200px' },
			headerClasses: 'overflow-ellipsis',
			classes: 'overflow-ellipsis text-nowrap',
		},
		{
			dataField: 'allele_non_effect',
			text: 'Non-Eff. Allele [Freq.]',
			headerTitle: (_) => 'Non-Effect Allele [Frequency]',
			formatter: (cell, row) =>
				cell === null
					? '-'
					: `${cell} [${(1 - row.allele_effect_frequency).toPrecision(4)}]`,
			title: (cell, row) =>
				cell === null
					? '-'
					: `${cell} [${(1 - row.allele_effect_frequency).toPrecision(4)}]`,
			headerStyle: { width: '200px' },
			headerClasses: 'overflow-ellipsis',
			classes: 'overflow-ellipsis  text-nowrap',
		},
		{
			dataField: 'beta',
			text: 'Beta [95% CI]',
			headerTitle: (_) => 'Beta [95% Confidence Interval]',
			title: true,
			formatter: (cell, row) =>
				cell === null || isNaN(cell) || row.phenotype.type !== 'continuous'
					? '-'
					: `${(+cell).toFixed(3)} [${row.beta_ci_95_low.toFixed(
							3
					  )}, ${+row.beta_ci_95_high.toFixed(3)}]`,
			title: (cell, row) =>
				!cell || isNaN(cell)
					? '-'
					: `${(+cell).toFixed(3)} [${row.beta_ci_95_low.toFixed(
							3
					  )}, ${+row.beta_ci_95_high.toFixed(3)}]`,
			headerStyle: { minWidth: '200px', width: '200px' },
			headerClasses: 'overflow-ellipsis',
			classes: 'overflow-ellipsis',
		},
		{
			dataField: 'odds_ratio',
			text: 'OR [95% CI]',
			headerTitle: (_) => 'Odds Ratio [95% Confidence Interval]',
			formatter: (cell, row) =>
				cell === null || isNaN(cell) || row.phenotype.type !== 'binary'
					? '-'
					: `${(+cell).toFixed(3)} [${row.odds_ratio_ci_95_low.toFixed(
							3
					  )}, ${+row.odds_ratio_ci_95_high.toFixed(3)}]`,
			title: (cell, row) =>
				!cell || isNaN(cell)
					? '-'
					: `${(+cell).toFixed(3)} [${row.odds_ratio_ci_95_low.toFixed(
							3
					  )}, ${+row.odds_ratio_ci_95_high.toFixed(3)}]`,
			headerStyle: { minWidth: '200px', width: '200px' },
			classes: 'overflow-ellipsis',
			headerClasses: 'overflow-ellipsis',
		},
		{
			dataField: 'p_value',
			text: (
				<span>
					Assoc. <span className='text-nowrap'>P-Value</span>
				</span>
			),
			headerTitle: (_) => 'Association P-Values',
			formatter: (cell) =>
				cell === null ? '-' : cell < 1e-2 ? (+cell).toExponential() : cell,
			title: true,
			sort: true,
			headerStyle: { width: '110px', minWidth: '110px' },
			headerClasses: 'overflow-ellipsis',
			classes: 'overflow-ellipsis',
		},
		{
			dataField: 'p_value_heterogenous',
			text: (
				<span>
					Het. <span className='text-nowrap'>P-Value</span>
				</span>
			),
			headerTitle: (_) => 'Heterogenous P-Values',
			title: true,
			formatter: defaultFormatter,
			headerStyle: { width: '100px', minWidth: '100px' },
			headerClasses: 'overflow-ellipsis',
			classes: 'overflow-ellipsis',
		},
		{
			dataField: 'n',
			text: 'N',
			headerTitle: (_) => 'Sample Size',
			title: true,
			formatter: defaultFormatter,
			headerStyle: { width: '80px' },
			headerClasses: 'overflow-ellipsis',
			classes: 'overflow-ellipsis',
		},
	];
	useEffect(() => {
		if (
			sharedState &&
			sharedState.parameters &&
			sharedState.parameters.params
		) {
			const state = sharedState.parameters.params;
			handleSubmit({
				phenotypes: state.selectedPhenotypes,
				variant: state.selectedVariant,
				sex: state.selectedSex,
				ancestry: state.selectedAncestry,
			});
		}
	}, [sharedState]);
	const handleSubmit = (params) => {
		dispatch(
			lookupVariants({
				phenotypes: params.phenotypes,
				variant: params.variant,
				sex: params.sex,
				ancestry: params.ancestry,
			})
		);
	};
	const handleReset = () => {
		const { variantLookup, variantLookupTable } = getInitialState();
		dispatch(updateVariantLookup(variantLookup));
		dispatch(updateVariantLookupTable(variantLookupTable));
	};
	const placeholder = (
		<div style={{ display: submitted ? 'none' : 'block' }}>
			<p className='h4 text-center text-secondary my-5'>
				Please select phenotypes and input variant to view this table
			</p>
		</div>
	);
	return (
		<div className='position-relative'>
			<h1 className='sr-only'>
				Explore GWAS data - Search for variant across phenotypes
			</h1>
			<SidebarContainer className='mx-3'>
				<SidebarPanel className='col-lg-3'>
					<div className='px-2 pt-2 pb-3 bg-white tab-pane-bordered rounded-0'>
						<VariantLookupForm
							onSubmit={handleSubmit}
							onReset={handleReset}
							selectedPhenotypes={selectedPhenotypes}
							selectedAncestry={selectedAncestry}
							selectedSex={selectedSex}
							selectedVariant={selectedVariant}
						/>
					</div>
				</SidebarPanel>
				<MainPanel className='col-lg-9'>
					<VariantLookupSearchCriteria />
					<div
						className={
							submitted && results
								? 'p-2 bg-white tab-pane-bordered rounded-0'
								: 'p-2 bg-white tab-pane-bordered rounded-0 d-flex justify-content-center align-items-center'
						}
						style={{ minHeight: '472px' }}
					>
						{results && submitted && (
							<div className='mw-100 my-2 px-4'>
								<LoadingOverlay active={submitted && results.length === 0} />
								<ToolkitProvider
									keyField='variant_id'
									data={results}
									columns={columns}
									exportCSV={{
										fileName: 'variant_lookup.csv',
									}}
								>
									{(props) => (
										<div>
											<ExportCSVButton
												className='float-right btn-link'
												{...props.csvProps}
											>
												Export CSV
											</ExportCSVButton>
											<br />
											<Table
												wrapperClasses='table-responsive'
												{...props.baseProps}
												bootstrap4
												// keyField="variant_id"
												// data={results}
												// columns={columns}
												filter={filterFactory()}
												pagination={paginationFactory({
													showTotal: results ? results.length > 0 : false,
													sizePerPageList: [25, 50, 100],
													paginationTotalRenderer: paginationText(
														'variant',
														'variants'
													),
													sizePerPageRenderer: paginationSizeSelector,
													pageButtonRenderer: paginationButton,
												})}
												defaultSorted={[{ dataField: 'p', order: 'asc' }]}
											/>
										</div>
									)}
								</ToolkitProvider>
							</div>
						)}
						{placeholder}
					</div>
				</MainPanel>
			</SidebarContainer>
		</div>
	);
}

import React from 'react';

export function About() {
	return (
		<div className='mt-3 container bg-white tab-pane-bordered rounded-0 p-4'>
			<h3 className='font-weight-light'>About PLCO Atlas</h3>
			<hr />

			<p>
				The Prostate, Lung, Colorectal, Ovarian (PLCO) Cancer Screening Study is
				a large population-based randomized trial designed and sponsored by the
				National Cancer Institute (NCI) to determine the effects of screening on
				cancer-related mortality and secondary endpoints in men and women aged
				55 to 74. The screening component of the trial was completed in 2006.
				Existing data from the trial is available and can be obtained from the{' '}
				<a
					className='font-weight-bold'
					target='_blank'
					rel='noopener noreferrer'
					href='https://biometry.nci.nih.gov/cdas/plco/'
				>
					Cancer Data Access System website
				</a>
				. Biological samples are also available to the entire scientific
				community through a peer-review process.
			</p>

			<p>
				The cohort of participants has been followed for more than two decades,
				resulting in a rich collection of anthropometric, lifestyle, and disease
				information, and includes data from several smaller-scale molecular
				studies. As costs for the technology have drastically decreased, the NCI
				Division of Cancer Epidemiology and Genetics, has genotyped 110,000 PLCO
				participants and by doing so created a new resource for genomic studies.
			</p>

			<p>
				We have created this website to maximize use of this resource, promote
				public access to this federally-funded research, and facilitate
				meta-analyses with other sample sets. It serves as an interactive
				resource for genetics researchers as well as other interested
				individuals to search for, visualize, and download aggregated
				association results from PLCO genome-wide association analyses (GWAS).
				The resource includes a comprehensive list of over 200 phenotypes
				collected from questionnaire data, linkage to medical records, cancer
				registries, and the National Death Index. Tools are available to
				visualize association results by interactive Manhattan plots that allow
				for stratification by sex as well as other diagnostic plots (e.g., Q-q
				plots) and resources to compare genetic correlations across phenotypes.
				Furthermore, descriptive characteristics of PLCO, annotation of
				phenotypes, and links to other pertinent genomic resources are
				available.
			</p>

			<p>
				All PLCO genotype data is available in dbGaP under accession number{' '}
				<a
					href='https://www.ncbi.nlm.nih.gov/projects/gap/cgi-bin/study.cgi?study_id=phs001286.v2.p2'
					target='_blank'
					rel='noopener noreferrer'
					alt='Link to open dbGAP study'
				>
					phs001286.v2.p2
				</a>
				. This public repository allows researchers to apply for access to the
				individual genotype and imputation data that we used to create the GWAS
				Atlas. Companion phenotype data can be requested through the{' '}
				<a
					href='https://cdas.cancer.gov/plco/'
					target='_blank'
					rel='noopener noreferrer'
					alt='Link to open NCI CDAS portal'
				>
					NCI Cancer Data Access System (CDAS)
				</a>
				. We note that some of the cancer endpoint data used in the GWAS Atlas
				cannot be shared through CDAS due to restrictions on data use agreements
				with certain cancer registries. However, summary GWAS statistic data is
				directly available from this website, as well as accessed directly
				through{' '}
				<a
					href='#/api-access'
					target='_blank'
					rel='noopener noreferrer'
					alt='Link to open ExploreGWAS API Access tab'
				>
					API Access
				</a>
				.
			</p>

			<p>
				This application's source code can be viewed on{' '}
				<a
					href='https://github.com/CBIIT/nci-webtools-dceg-plco-atlas'
					target='_blank'
					rel='noopener noreferrer'
					alt='Link to open GitHub'
				>
					GitHub
				</a>
				.
			</p>
		</div>
	);
}

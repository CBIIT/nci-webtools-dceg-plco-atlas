import React from 'react';

export function About() {
	return (
		<div className='mt-3 container bg-white tab-pane-bordered rounded-0 p-4'>
			<h3 className='font-weight-light'>About GWAS Explorer</h3>
			<hr />

			<p>
				The GWAS Explorer is a publicly available webtool developed and hosted by the {' '}
				<a
					className='font-weight-bold'
					target='_blank'
					rel='noopener noreferrer'
					href='https://dceg.cancer.gov'
				>
					Division of Cancer Epidemiology and Genetics (DCEG) 
				</a>
				, National Cancer Institute, part of the National Institutes of Health. 
			</p>

			<p>
				GWAS Explorer allows genetics researchers to search for, visualize, 
				and download aggregated association results from genome-wide association studies (GWAS). 
				The resource includes association summary statistics from a comprehensive list of over 
				200 cancer and cancer-related phenotypes harmonized from large-scale GWAS efforts. 
				Interactive tools are available to visualize and examine association results utilizing 
				dynamic Manhattan and Miami plots, stratify by sex and ancestry, as well as review diagnostic 
				plots (e.g., Q-q plots). Additional links permit users to integrate findings with {' '}
				<a
					href='https://ldlink.nih.gov/ldtrait'
					target='_blank'
					rel='noopener noreferrer'
					alt='Link to open Ldlink'
				>
					external resources
				</a>
				. GWAS summary statistic data are directly available from this website, 
				as well as through {' '}
				<a
					href='#/api-access'
					target='_blank'
					rel='noopener noreferrer'
					alt='Link to open ExploreGWAS API Access tab'
				>
					API Access
				</a>.
			</p>

			<p>
				The GWAS Explorer was initially developed to host GWAS data from 110,000 participants 
				of the Prostate, Lung, Colorectal, Ovarian (PLCO) Cancer Screening Study. 
				PLCO was a large NCI-sponsored population-based randomized trial designed to determine 
				the effects of screening on cancer-related mortality and secondary endpoints. 
				A cohort of PLCO participants has been followed for two decades, resulting in a rich collection 
				of anthropometric, lifestyle, and disease information, and data from several smaller-scale 
				molecular studies. Existing data from the trial can be obtained from the {' '}
				<a
					target='_blank'
					rel='noopener noreferrer'
					href='https://cdas.cancer.gov/plco/'
					alt='Link to open CDAS'
				>
					Cancer Data Access System (CDAS)
				</a>. Some of the cancer endpoint data used in the GWAS Explorer 
				cannot be shared through CDAS due to restrictions on data use agreements with certain cancer registries. 
				All PLCO genotype data are available in dbGaP under accession number {' '}
				<a
					href='https://www.ncbi.nlm.nih.gov/projects/gap/cgi-bin/study.cgi?study_id=phs001286.v2.p2'
					target='_blank'
					rel='noopener noreferrer'
					alt='Link to open dbGAP study'
				>
					phs001286.v2.p2
				</a>. 
				Biological samples are also available to the scientific community through a peer-review application 
				process in CDAS.
			</p>

			<p>
				Since development of the GWAS Explorer to host PLCO GWAS summary statistics, 
				the GWAS Explorer has been expanded to include cancer and cancer-related data from a variety of 
				external public resources (e.g.,{' '} 
				<a
					href='https://www.ebi.ac.uk/gwas/'
					target='_blank'
					rel='noopener noreferrer'
					alt='Link to open GWAS Catalog'
				>
					GWAS Catalog
				</a>
				). This expansion aims to maximize use of this resource, promote public access to federally 
				funded genetic epidemiology research, and facilitate meta-analyses for cancer and cancer-related traits.
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

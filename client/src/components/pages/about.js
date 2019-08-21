import React from 'react';

export function About() {
  return (
    <div className="container my-4">
      <h1 className="font-weight-light">About PLCO Atlas</h1>
      <hr />

      <p>The Prostate, Lung, Colorectal, Ovarian (PLCO) Cancer Screening Study is a large population-based randomized trial designed and sponsored by the National Cancer Institute (NCI) to determine the effects of screening on cancer-related mortality and secondary endpoints in men and women aged 55 to 74. The screening component of the trial was completed in 2006. Existing data from the trial is available and can be obtained from the <a className="font-weight-bold" target="_blank" rel="noopener noreferrer" href="https://biometry.nci.nih.gov/cdas/plco/">Cancer Data Access System website</a>. Biological samples are also available to the entire scientific community through a peer-review process.</p>

      <p>The cohort of participants has been followed for more than two decades, resulting in a rich collection of anthropometric, lifestyle, and disease information, and includes data from several smaller-scale molecular studies. As costs for the technology have drastically decreased, the NCI Division of Cancer Epidemiology and Genetics, has genotyped 110,000 PLCO participants and by doing so created a new resource for genomic studies.</p>

      <p>We have created this website to maximize use of this resource, promote public access to this federally-funded research, and facilitate meta-analyses with other sample sets. It serves as an interactive resource for genetics researchers as well as other interested individuals to search for, visualize, and download aggregated association results from PLCO genome-wide association analyses (GWAS). The resource includes a comprehensive list of over 200 phenotypes collected from questionnaire data, linkage to medical records, cancer registries, and the National Death Index. Tools are available to visualize association results by interactive Manhattan plots that allow for stratification by gender as well as other diagnostic plots (e.g., Q-q plots) and resources to compare genetic correlations across phenotypes. Furthermore, descriptive characteristics of PLCO, annotation of phenotypes, and links to other pertinent genomic resources are available.</p>

      {/* <hr /> */}

      {/* <h2 className="font-weight-light">General Statistics</h2>
      <p>Placeholder Text</p>
      <hr />
      <h2 className="font-weight-light">Summary</h2>
      <p>Placeholder Text</p> */}
    </div>
  );
}

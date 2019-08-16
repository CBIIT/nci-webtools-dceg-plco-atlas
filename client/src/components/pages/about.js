import React from 'react';

export function About() {
  return (
    <div className="container my-4">
      <h1 className="font-weight-light">About PLCO Atlas</h1>
      <hr />
      <p>
        The Prostate, Lung, Colorectal and Ovarian (PLCO) Cancer Screening Trial
        was a study investigating the impact on screening on reducing cancer
        mortality in individuals age 55-74. PLCO finished in 2006, but
        participants were rolled over into a cohort study and subsequently
        followed for disease onset.
      </p>
      <p>
        The PLCO Atlas helps conduct genome-wide association studies (GWAS) on
        the rich covariate data that PLCO has collected on its participants.
      </p>

      <hr />

      <h2 className="font-weight-light">General Statistics</h2>
      <p>Placeholder Text</p>
      <hr />
      <h2 className="font-weight-light">Summary</h2>
      <p>Placeholder Text</p>
    </div>
  );
}

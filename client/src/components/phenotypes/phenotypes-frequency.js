import React from 'react';

export function PhenotypesFrequency({
  selectedPhenotype,
  phenotypeType
}) {
  
  return (
    <>
      PhenotypesFrequency: {selectedPhenotype.title} {phenotypeType}
    </>
  );
}

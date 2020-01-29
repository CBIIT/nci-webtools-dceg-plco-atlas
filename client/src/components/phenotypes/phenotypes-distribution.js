import React from 'react';

export function PhenotypesDistribution({
  selectedPhenotype,
  phenotypeType
}) {
  
  return (
    <>
      PhenotypesDistribution: {selectedPhenotype.title} {phenotypeType}
    </>
  );
}

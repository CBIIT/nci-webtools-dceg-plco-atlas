import React from 'react';

export function PhenotypesDistribution({
  selectedPhenotype,
  phenotypeType,
  option
}) {
  
  return (
    <>
      PhenotypesDistribution: {selectedPhenotype.title} {phenotypeType} {option}
    </>
  );
}

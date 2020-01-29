import React from 'react';

export function PhenotypesRelated({
  selectedPhenotype,
  phenotypeType
}) {
  
  return (
    <>
      PhenotypesRelated: {selectedPhenotype.title} {phenotypeType}
    </>
  );
}

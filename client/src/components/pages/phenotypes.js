import React from 'react';

export function Phenotypes({ params, setParams }) {
  return (
    <div className="container">
      <h1 className="font-weight-light">Phenotypes</h1>
      <hr />
      <h2 className="font-weight-light">Placeholder</h2>

      <input
        value={params.trait}
        onChange={e => setParams({ trait: e.target.value })}
      />
    </div>
  );
}

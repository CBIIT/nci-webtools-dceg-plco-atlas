import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { ShareLink } from '../../../controls/share-link/share-link';

export const PhenotypeCorrelationsSearchCriteria = () => {
  const {
    selectedPhenotypes,
    selectedSex,
    selectedAncestry,
    shareID,
    submitted
  } = useSelector(
    state => state.phenotypeCorrelations
  );
  const [collapsed, setCollapsed] = useState(true);
  const canCollapse = submitted && selectedPhenotypes.length > 1;
  const toggleCollapsed = _ =>  canCollapse && setCollapsed(!collapsed);

  const asTitleCase = str => str.replace(/_+/g, ' ').replace(/\w+/g, word =>
    word[0].toUpperCase() + word.substr(1).toLowerCase());

  const pluralize = (count, singular, plural) => count === 1
    ? singular
    : (plural || `${singular}s`);

  const truncate = (str, limit = 50) => str.length > limit 
    ? (str.substring(0, limit) + '...')
    : str;

  return (
    <div className={`mb-2 px-3 py-2 bg-white tab-pane-bordered rounded-0 d-flex align-items-${collapsed ? 'center' : 'start'} justify-content-between`} 
      style={{ overflowX: 'auto' }}>
      <div className="d-flex align-items-start">
        <button 
            className="btn btn-link btn-sm p-0 outline-none"
            onClick={toggleCollapsed}
            title="Expand/collapse search criteria panel"
            disabled={!canCollapse}>
          <i
            className={
              `fa fa-lg
              fa-caret-${collapsed ? 'right' : 'down'} 
              ${canCollapse ? 'text-secondary' : 'text-muted'}`} /> 
        </button>

        <b className="pl-2">{pluralize(selectedPhenotypes.length, 'Phenotype')}: </b>
        <span className="ml-1 pr-4 border-right border-dark">
          {!selectedPhenotypes.length  ? 'None' : collapsed 
            ? <>
              {selectedPhenotypes[0].display_name}
              {selectedPhenotypes.length > 1 && <> 
                {` and `}
                <span className="btn-link" role="button" onClick={toggleCollapsed}>
                  {selectedPhenotypes.length - 1}
                  {pluralize(selectedPhenotypes.length - 1, ' other')}
                </span>
              </>}
            </> 
            : selectedPhenotypes.map((phenotype, i) => 
              <div key={`correlation-phenotype-${i}`} title={phenotype.display_name}>
                {truncate(phenotype.display_name, 50)}
              </div>
            )}
        </span>

        <span className="px-4 border-right border-dark">
          <b>Sex: </b>
          {selectedSex ? asTitleCase(selectedSex) : 'None'}
        </span>

        <span className="px-4">
          <b>Ancestry: </b>
          {selectedAncestry ? asTitleCase(selectedAncestry) : 'None'}
        </span>
      </div>

      <div className="d-flex align-items-center">
        <span className="mr-2">
          <b>Total Results: </b>
          {selectedPhenotypes.length ? selectedPhenotypes.length.toLocaleString() : 'None'}
        </span>
        <ShareLink
          disabled={!submitted}
          shareID={shareID}
          params={{ selectedPhenotypes, selectedSex, selectedAncestry }}
        />
      </div>

    </div>
  );
};

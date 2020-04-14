import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { updateSummaryResults } from '../../services/actions';
import { query } from '../../services/query';
import { Table } from '../controls/table';
import { Icon } from '../controls/icon';

export const SnpSearchForm = () => {
  const dispatch = useDispatch();
  const {
    snp,
    snpResults,
    showSnpResults,
    selectedPhenotype,
    selectedChromosome,
    selectedSex
  } = useSelector(state => state.summaryResults);

  const columns = [
    {
      dataField: 'chr',
      text: 'Chromosome'
    },
    {
      dataField: 'bp',
      text: 'Position'
    },
    {
      dataField: 'snp',
      text: 'SNP'
    },
    {
      dataField: 'a1',
      text: 'Reference Allele'
    },
    {
      dataField: 'a2',
      text: 'Alternate Allele'
    },
    {
      dataField: 'or',
      text: 'Odds Ratio'
    },
    {
      dataField: 'p',
      text: 'P-Value'
    }
  ];

  const setSnp = snp => {
    dispatch(updateSummaryResults({ snp }));
  };

  const handleSnpLookup = async () => {
    if (!snp) return;
    const table = {
      all: 'variant_all',
      stacked: 'variant_all',
      female: 'variant_female',
      male: 'variant_male'
    }[selectedSex];

    const { data } = await query('variants', {
      database: selectedPhenotype.value + '.db',
      table: table,
      snp: snp
    });
    dispatch(
      updateSummaryResults({
        snpResults: data,
        showSnpResults: true
      })
    );
  };

  const handleSnpReset = () => {
    dispatch(
      updateSummaryResults({
        snp: '',
        snpResults: [],
        showSnpResults: false
      })
    );
  };

  return (
    <div>
      <div className="d-flex mb-2">
        <input
          type="text"
          style={{ maxWidth: '400px' }}
          className="form-control"
          placeholder="Search for a SNP"
          value={snp}
          onChange={e => setSnp(e.target.value)}
        />
        <button
          className="btn btn-silver flex-shrink-auto d-flex"
          onClick={handleSnpReset}>
          <Icon className="opacity-50" name="times" width="12" />
          <span className="sr-only">Clear</span>
        </button>
        <button
          className="btn btn-silver flex-shrink-auto mx-2"
          onClick={handleSnpLookup}>
          Search
        </button>
      </div>

      {showSnpResults && (
        <Table keyField="variant_id" data={snpResults} columns={columns} />
      )}
    </div>
  );
};

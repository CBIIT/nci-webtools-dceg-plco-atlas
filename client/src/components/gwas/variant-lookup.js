import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { SearchFormTraitsVariant } from '../forms/search-form-traits-variant';
import { updateVariantLookup, lookupVariants } from '../../services/actions';
import { Table, paginationText, paginationSizeSelector, paginationButton } from '../controls/table';
import paginationFactory from 'react-bootstrap-table2-paginator';
import filterFactory, { textFilter } from 'react-bootstrap-table2-filter';
import { Spinner, Card, Tabs, Tab } from 'react-bootstrap';

export function VariantLookup() {
  const dispatch = useDispatch();
  const variantLookup = useSelector(state => state.variantLookup);
  const {
    selectedPhenotypes,
    selectedVariant,
    results,
    message,
    loading,
    submitted
  } = variantLookup;

  const columns = [
    {
      dataField: 'phenotype',
      text: 'Phenotype',
      sort: true
    },
    {
      dataField: 'snp',
      text: 'SNP'
    },
    {
      dataField: 'chr',
      text: 'Chromosome'
    },
    {
      dataField: 'bp',
      text: 'Position'
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
      text: 'Odds Ratio',
      sort: true
    },
    {
      dataField: 'p',
      text: 'P-value',
      sort: true
    }
  ].map(c => {
    c.filter = textFilter({ className: 'form-control-sm' });
    return c;
  });

  const placeholder = (
    <div style={{ display: submitted ? 'none' : 'block' }}>
      <p className="h4 text-center my-5">
        Please select phenotype(s) and input variant to view this table.
      </p>
    </div>
  );

  const placeholderMessage = (
    <div style={{ display: message.length > 1 ? 'block' : 'none' }}>
      <p className="h4 text-center mb-5">
        {message}
      </p>
    </div>
  );

  const setSubmitted = submitted => {
    dispatch(updateVariantLookup({ submitted }));
  };

  const handleSubmit = params => {
    setSubmitted(new Date());
    dispatch(lookupVariants(selectedPhenotypes, selectedVariant));
  }

  const handleReset = params => {
    dispatch(
      updateVariantLookup({
        selectedListType: 'categorical',
        selectedPhenotype: null,
        selectedPhenotypes: [],
        selectedVariant: '',
        selectedGender: 'combined',
        results: [],
        message: '',
        loading: false,
        submitted: null
      })
    );
  };

  return (
    <>
      <SearchFormTraitsVariant onSubmit={handleSubmit} onReset={handleReset} />

      <Tabs defaultActiveKey="variant-lookup">
        <Tab
          eventKey="variant-lookup"
          title="Table"
          className="p-2 bg-white tab-pane-bordered" 
          style={{minHeight: '50vh'}}>

          <div
            className="mw-100 my-4"
            style={{ display: submitted ? 'block' : 'none' }}>
            <Table
              bootstrap4
              keyField="variant_id"
              data={results}
              columns={columns}
              filter={filterFactory()}
              pagination={paginationFactory({
                showTotal: results.length > 0,
                sizePerPageList: [10, 25, 50, 100],
                paginationTotalRenderer: paginationText,
                sizePerPageRenderer: paginationSizeSelector,
                pageButtonRenderer: paginationButton,
              })}
            />
          </div>
          {placeholder}
          {/* {placeholderMessage} */}
        </Tab>
      </Tabs>
    </>
  );
}

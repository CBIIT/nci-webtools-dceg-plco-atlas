import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { SearchFormTraitsVariant } from '../forms/search-form-traits-variant';
import { updateVariantLookup, lookupVariants } from '../../services/actions';
import { Table } from '../controls/table';
import paginationFactory from 'react-bootstrap-table2-paginator';
import filterFactory, { textFilter } from 'react-bootstrap-table2-filter';
import { Spinner, Card } from 'react-bootstrap';

export function VariantLookup() {
  const dispatch = useDispatch();
  const variantLookup = useSelector(state => state.variantLookup);
  const {
    selectedPhenotypes,
    selectedVariant,
    results,
    message,
    loading
  } = variantLookup;

  const columns = [
    {
      dataField: 'phenotype',
      text: 'Phenotype',
      filter: textFilter(),
      sort: true
    },
    {
      dataField: 'snp',
      text: 'SNP',
      filter: textFilter()
    },
    {
      dataField: 'chr',
      text: 'Chromosome',
      filter: textFilter()
    },
    {
      dataField: 'bp',
      text: 'Position',
      filter: textFilter()
    },
    {
      dataField: 'a1',
      text: 'Reference Allele',
      filter: textFilter()
    },
    {
      dataField: 'a2',
      text: 'Alternate Allele',
      filter: textFilter()
    },
    {
      dataField: 'or',
      text: 'Odds Ratio',
      filter: textFilter(),
      sort: true
    },
    {
      dataField: 'p',
      text: 'P-value',
      filter: textFilter(),
      sort: true
    }
  ];

  return (
    <>
      <SearchFormTraitsVariant
        onSubmit={e =>
          dispatch(lookupVariants(selectedPhenotypes, selectedVariant))
        }
      />

      <Card className="mb-4">
        <Card.Header className="bg-egg font-weight-bolder text-center">
          Variant-Phenotype(s) Table
        </Card.Header>
        <Card.Body>
          <div className="row text-center">
            <div className="col-md-12">
              <h4>{message}</h4>
            </div>
            <div
              className="col-md-12"
              style={{
                display:
                  results.length === 0 && message.length === 0 && !loading
                    ? 'block'
                    : 'none'
              }}>
              <h4>No Results</h4>
            </div>
          </div>

          <div style={{ display: results.length > 0 ? 'block' : 'none' }}>
            <Table
              bootstrap4
              keyField="id"
              data={results}
              columns={columns}
              pagination={paginationFactory()}
              filter={filterFactory()}
            />
          </div>

          <div
            className="text-center"
            style={{ display: loading ? 'block' : 'none' }}>
            <Spinner animation="border" variant="primary" role="status">
              <span className="sr-only">Loading...</span>
            </Spinner>
          </div>
        </Card.Body>
      </Card>
    </>
  );
}

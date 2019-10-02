import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { VariantLookupForm } from '../forms/variant-lookup-form';
import { updateVariantLookup, lookupVariants } from '../../services/actions';
import { Table, paginationText, paginationSizeSelector, paginationButton } from '../controls/table';
import paginationFactory from 'react-bootstrap-table2-paginator';
import filterFactory, { textFilter } from 'react-bootstrap-table2-filter';
import ToolkitProvider, { CSVExport } from 'react-bootstrap-table2-toolkit';
import { Alert, Spinner, Card, Tabs, Tab } from 'react-bootstrap';

export function VariantLookup() {
  const dispatch = useDispatch();
  const variantLookup = useSelector(state => state.variantLookup);
  const {
    selectedPhenotypes,
    selectedVariant,
    results,
    messages,
    loading,
    submitted
  } = variantLookup;

  const { ExportCSVButton } = CSVExport;

  const columns = [
    {
      // title: true,
      title: (cell, row, rowIndex, colIndex) => cell,
      dataField: 'phenotype',
      text: 'Phenotype',
      sort: true,
      style: {
        overflowX: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap'
      },
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
  ];
  // add filter to column headers
  // .map(c => {
  //   c.filter = textFilter({ className: 'form-control-sm' });
  //   return c;
  // });

  const placeholder = (
    <div style={{ display: submitted ? 'none' : 'block' }}>
      <p className="h4 text-center my-5">
        Please select phenotype(s) and input variant to view this table.
      </p>
    </div>
  );

  const setMessages = messages => {
    dispatch(updateVariantLookup({ messages }));
  };

  const clearMessages = e => {
    setMessages([]);
  };

  const setSubmitted = submitted => {
    dispatch(updateVariantLookup({ submitted }));
  };

  const validateVariantInput = (variant) => {
    if (
      variant.match(/^[r|R][s|S][0-9]+$/) != null 
      ||
      variant.match(
        /^([c|C][h|H][r|R])?(([1-9]|[1][0-9]|[2][0-2])|[x|X|y|Y]):[0-9]+/
      ) != null
      // ||
      // selectedVariant.match(
      //   /^([c|C][h|H][r|R])?(([1-9]|[1][0-9]|[2][0-2])|[x|X|y|Y]):[0-9]+$/
      // ) != null
    ) {
      return true;
    } else {
      return false;
    }
  };

  const handleChange = () => {
    clearMessages();
    // setSubmitted(null);
  };

  const handleSubmit = params => {
    if (params.selectedPhenotypes.length < 1 && params.selectedVariant.length < 1) {
      setMessages([
        {
          type: 'danger',
          content:
            'Please select one or more phenotypes and input a variant.'
        }
      ]);
      return;
    }
    if (params.selectedPhenotypes.length < 1) {
      setMessages([
        {
          type: 'danger',
          content:
            'Please select one or more phenotypes.'
        }
      ]);
      return;
    }
    if (params.selectedVariant.length < 1) {
      setMessages([
        {
          type: 'danger',
          content:
            'Please input a variant.'
        }
      ]);
      return;
    }
    if (!validateVariantInput(params.selectedVariant)) {
      setMessages([
        {
          type: 'danger',
          content:
            'Please input a valid variant rsid or coordinate.'
        }
      ]);
      return;
    }
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
        messages: [],
        loading: false,
        submitted: null
      })
    );
  };

  return (
    <>
      <VariantLookupForm onSubmit={handleSubmit} onChange={handleChange} onReset={handleReset} />
      {messages &&
        messages.map(({ type, content }) => (
          <Alert variant={type} onClose={clearMessages} dismissible>
            {content}
          </Alert>
        ))}

      <Tabs defaultActiveKey="variant-lookup">
        <Tab
          eventKey="variant-lookup"
          // title="Table"
          className="p-2 bg-white tab-pane-bordered" 
          style={{minHeight: '50vh'}}>
          <div
            className="mw-100 my-4 px-4"
            style={{ display: submitted ? 'block' : 'none' }}>
              <ToolkitProvider
                keyField="variant_id"
                data={ results }
                columns={ columns }
                exportCSV={{
                  fileName: 'variant_lookup.csv'
                }}> 
              {
                props => (
                  <div>
                    <ExportCSVButton 
                      className="btn btn-silver btn-sm float-right"
                      { ...props.csvProps }>
                      Export CSV
                    </ExportCSVButton>
                    <br />
                    <Table
                      { ...props.baseProps }
                      bootstrap4
                      // keyField="variant_id"
                      // data={results}
                      // columns={columns}
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
                )
              }
            </ToolkitProvider>
          </div>
          {placeholder}
        </Tab>
      </Tabs>
    </>
  );
}

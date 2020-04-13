import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { VariantLookupForm } from '../forms/variant-lookup-form';
import { updateVariantLookup, lookupVariants } from '../../services/actions';
import {
  SidebarContainer,
  SidebarPanel,
  MainPanel,
} from '../controls/sidebar-container';
import {
  Table,
  paginationText,
  paginationSizeSelector,
  paginationButton
} from '../controls/table';
import paginationFactory from 'react-bootstrap-table2-paginator';
import filterFactory, { textFilter } from 'react-bootstrap-table2-filter';
import ToolkitProvider, { CSVExport } from 'react-bootstrap-table2-toolkit';
import { Alert, Tabs, Tab, Spinner } from 'react-bootstrap';
import { VariantLookupSearchCriteria } from '../search-criteria/variant-lookup-search-criteria';


export function VariantLookup() {
  const dispatch = useDispatch();
  const variantLookup = useSelector(state => state.variantLookup);
  const {
    selectedPhenotypes,
    selectedVariant,
    selectedSex,
    results,
    messages,
    submitted,
    sharedState
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
      headerStyle: {
        width: '290px'
      }
      // events: {
      //   onClick: (e, column, columnIndex, row, rowIndex) => { console.log(e.target.title) },
      // }
    },
    {
      dataField: 'variant',
      text: 'Variant',
      hidden: true
    },
    {
      dataField: 'sex',
      text: 'Sex',
      hidden: true
    },
    {
      headerTitle: () => 'Chromosome',
      dataField: 'chromosome',
      text: 'Chr.',
      // headerAlign: 'center',
      // align: 'center'
      headerStyle: {
        width: '50px'
      }
    },
    {
      dataField: 'position',
      text: 'Position',
      headerStyle: {
        width: '100px'
      }
    },
    {
      dataField: 'allele_reference',
      text: 'Reference Allele'
    },
    {
      dataField: 'allele_alternate',
      text: 'Alternate Allele'
    },
    {
      dataField: 'odds_ratio',
      text: 'Odds Ratio/Beta',
      sort: true,
      sortFunc: (a, b, order, dataField, rowA, rowB) => {
        if (order === 'asc') {
          return a - b;
        }
        return b - a; // desc
      }
    },
    {
      dataField: 'p_value',
      text: 'P-value',
      sort: true,
      sortFunc: (a, b, order, dataField, rowA, rowB) => {
        if (order === 'asc') {
          return a - b;
        }
        return b - a; // desc
      }
    }
  ];
  // add filter to column headers
  // .map(c => {
  //   c.filter = textFilter({ className: 'form-control-sm' });
  //   return c;
  // });

  const placeholder = (
    <div style={{ display: submitted ? 'none' : 'block' }}>
      <p className="h4 text-center text-secondary my-5">
        Please select phenotypes and input variant to view this table
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

  const setSearchCriteriaVariantLookup = searchCriteriaVariantLookup => {
    dispatch(updateVariantLookup({ searchCriteriaVariantLookup }));
  };

  const validateVariantInput = variant => {
    if (
      variant.match(/^rs[0-9]+$/i) != null ||
      variant.match(
        /^(chr)?(([1-9]|[1][0-9]|[2][0-2])|[x|y]):[0-9]+/i
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
    if (
      params.phenotypes.length < 1 &&
      params.variant.length < 1
    ) {
      setMessages([
        {
          type: 'danger',
          content: 'Please select one or more phenotypes and input a variant.'
        }
      ]);
      return;
    }
    if (params.phenotypes.length < 1) {
      setMessages([
        {
          type: 'danger',
          content: 'Please select one or more phenotypes.'
        }
      ]);
      return;
    }
    if (params.variant.length < 1) {
      setMessages([
        {
          type: 'danger',
          content: 'Please input a variant.'
        }
      ]);
      return;
    }
    if (!validateVariantInput(params.variant)) {
      setMessages([
        {
          type: 'danger',
          content: "Please input a valid variant rsid or coordinate. (Ex. 'rs1234' or 'chr22:25855459')"
        }
      ]);
      return;
    }
    // close sidebar on submit
    // setOpenSidebar(false);
    setSearchCriteriaVariantLookup({
      phenotypes: params.phenotypes.map(item => item.title),
      variant: params.variant,
      sex: params.sex
    });
    setSubmitted(new Date());
    dispatch(lookupVariants(params.phenotypes, params.variant, params.sex === 'combined' ? 'all' : params.sex));
    dispatch(updateVariantLookup({
      sharedState: null
    }))
  };

  useEffect(() => {
    if (sharedState) {
      handleReset();
      dispatch(updateVariantLookup({
        selectedPhenotypes: sharedState.parameters.params.selectedPhenotypes,
        selectedVariant: sharedState.parameters.params.selectedVariant,
        selectedSex: sharedState.parameters.params.selectedSex
      }))
      handleSubmit({
        phenotypes: sharedState.parameters.params.selectedPhenotypes,
        variant: sharedState.parameters.params.selectedVariant,
        sex: sharedState.parameters.params.selectedSex
      });
    }
  }, [sharedState]);

  const handleReset = () => {
    dispatch(
      updateVariantLookup({
        selectedPhenotypes: [],
        selectedVariant: '',
        selectedSex: 'combined',
        results: null,
        messages: [],
        submitted: null,
        searchCriteriaVariantLookup: null,
        numResults: null,
        collapseCriteria: true,
        shareID: null,
        sharedState: null
      })
    );
  };

  return (
    <div className="position-relative">
      <h1 className="sr-only">Explore GWAS data - Search for variant across phenotypes</h1>
      <SidebarContainer className="mx-3">
        <SidebarPanel className="col-lg-3">
          <div className="px-2 pt-2 pb-3 bg-white border rounded-0">
            <VariantLookupForm
              onSubmit={handleSubmit}
              onChange={handleChange}
              onReset={handleReset}
            />
            {(messages || []).map(({ type, content }) => (
              <Alert
                className="mt-3"
                key={content}
                variant={type}
                onClose={clearMessages}
                dismissible>
                {content}
              </Alert>
            ))}
          </div>
        </SidebarPanel>
        <MainPanel className="col-lg-9">
          <VariantLookupSearchCriteria />

          <Tabs
            transition={false}
            defaultActiveKey="variant-lookup">
            <Tab
              eventKey="variant-lookup"
              // title="Table"
              className={
                submitted && results && results.length > 0 ?
                "p-2 bg-white tab-pane-bordered rounded-0" :
                "p-2 bg-white tab-pane-bordered rounded-0 d-flex justify-content-center align-items-center"
              }
              style={{ minHeight: '474px' }}>
              {
                results && results.length > 0 &&
                  <div
                    className="mw-100 my-2 px-4"
                    style={{ display: submitted && results && results.length > 0 ? 'block' : 'none' }}>
                    <ToolkitProvider
                      keyField="variant_id"
                      data={results}
                      columns={columns}
                      exportCSV={{
                        fileName: 'variant_lookup.csv'
                      }}>
                      {props => (
                        <div>
                          <ExportCSVButton
                            className="float-right"
                            style={{
                              all: 'unset',
                              textDecoration: 'underline',
                              cursor: 'pointer',
                              color: '#008CBA'
                            }}
                            {...props.csvProps}>
                            Export CSV
                          </ExportCSVButton>
                          <br />
                          <Table
                            {...props.baseProps}
                            bootstrap4
                            // keyField="variant_id"
                            // data={results}
                            // columns={columns}
                            filter={filterFactory()}
                            pagination={paginationFactory({
                              showTotal: results ? results.length > 0 : false,
                              sizePerPageList: [25, 50, 100],
                              paginationTotalRenderer: paginationText,
                              sizePerPageRenderer: paginationSizeSelector,
                              pageButtonRenderer: paginationButton
                            })}
                            defaultSorted={[{ dataField: 'p', order: 'asc' }]}
                          />
                        </div>
                      )}
                    </ToolkitProvider>
                  </div>
              }
              {
                results && results.length <= 0 &&
                  <Spinner animation="border" variant="primary" role="status">
                    <span className="sr-only">Loading...</span>
                  </Spinner>
              }
              {placeholder}
            </Tab>
          </Tabs>
        </MainPanel>
      </SidebarContainer>
    </div>
  );
}

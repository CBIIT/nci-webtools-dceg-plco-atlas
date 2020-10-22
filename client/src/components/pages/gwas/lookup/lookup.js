import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { VariantLookupForm } from './lookup-form';
import { updateVariantLookup, lookupVariants, updateVariantLookupTable } from '../../../../services/actions';
import { getInitialState } from '../../../../services/store';
import {
  SidebarContainer,
  SidebarPanel,
  MainPanel,
} from '../../../controls/sidebar-container/sidebar-container';
import {
  Table,
  paginationText,
  paginationSizeSelector,
  paginationButton
} from '../../../controls/table/table';
import paginationFactory from 'react-bootstrap-table2-paginator';
import filterFactory, { textFilter } from 'react-bootstrap-table2-filter';
import ToolkitProvider, { CSVExport } from 'react-bootstrap-table2-toolkit';
import { Alert, Spinner } from 'react-bootstrap';
import { VariantLookupSearchCriteria } from './lookup-search-criteria';


export function VariantLookup() {
  const dispatch = useDispatch();
  const {
    messages,
    submitted,
    sharedState,
    selectedPhenotypes
  } = useSelector(state => state.variantLookup);
  const {
    results
  } = useSelector(state => state.variantLookupTable);

  const phenotypes = useSelector(state => state.phenotypes);

  const { ExportCSVButton } = CSVExport;

  const columns = [
    {
      // title: true,
      title: (cell, row, rowIndex, colIndex) => cell,
      dataField: 'phenotype',
      text: 'Phenotype',
      sort: true,
      headerStyle: { width: '290px' },
      headerClasses: 'overflow-ellipsis',
      classes: 'overflow-ellipsis',      
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
      dataField: 'ancestry',
      text: 'Ancestry',
      hidden: true
    },
    {
      dataField: 'chromosome',
      text: 'Chr.',
      headerTitle: _ => 'Chromosome',
      title: true,
      sort: true,
      headerStyle: { width: '65px' },
      headerClasses: 'overflow-ellipsis',
      classes: 'overflow-ellipsis',
    },
    {
      dataField: 'position',
      text: 'Pos.',
      headerTitle: _ => 'Position',
      title: true,
      sort: true,
      headerStyle: { width: '100px' },
      headerClasses: 'overflow-ellipsis',
      classes: 'overflow-ellipsis',
    },
    {
      dataField: 'snp',
      text: 'SNP',
      sort: true,
      formatter: cell => !/^rs\d+/.test(cell) ?
        (!/^chr[\d+|x|y]:\d+/i.test(cell) ? cell :
          cell.split(':')[0] + ':' + cell.split(':')[1]) :
        <a className="overflow-ellipsis" href={`https://www.ncbi.nlm.nih.gov/snp/${cell.split(':')[0]}`} target="_blank">{cell}</a>,
      title: true,
      headerStyle: {width: '180px'},
      headerClasses: 'overflow-ellipsis',
      classes: 'overflow-ellipsis  text-nowrap',
    },    
    {
      dataField: 'allele_reference',
      text: 'Eff. Allele',
      headerTitle: _ => 'Effect Allele [Frequency]',
      formatter: (cell, row) => cell === '-' ? '-' : `${cell} [${row.allele_frequency.toPrecision(4)}]`,
      title: (cell, row) => cell === '-' ? '-' : `${cell} [${row.allele_frequency.toPrecision(4)}]`,
      headerStyle: { width: '200px' },
      headerClasses: 'overflow-ellipsis',
      classes: 'overflow-ellipsis text-nowrap',

    },
    {
      dataField: 'allele_alternate',
      text: 'Non-Eff. Allele',
      headerTitle: _ => 'Non-Effect Allele [Frequency]',
      formatter: (cell, row) => cell === '-' ? '-' : `${cell} [${(1 - row.allele_frequency).toPrecision(4)}]`,
      title: (cell, row) => cell === '-' ? '-' : `${cell} [${(1 - row.allele_frequency).toPrecision(4)}]`,
      headerStyle: { width: '200px' },
      headerClasses: 'overflow-ellipsis',
      classes: 'overflow-ellipsis  text-nowrap',
    },
    {
      dataField: 'beta',
      text: 'Beta',
      title: true,
      headerStyle: {width: '80px'},
      headerClasses: 'overflow-ellipsis',
      classes: 'overflow-ellipsis',
    },
    {
      dataField: 'odds_ratio',
      text: 'OR [95% CI]',
      headerTitle: _ => 'Odds Ratio [95% Confidence Interval]',
      formatter: (cell, row) => (!cell || isNaN(cell)) ? '-' : 
        `${(+cell).toFixed(3)} [${row.ci_95_low.toFixed(3)} - ${+row.ci_95_high.toFixed(3)}]`,
      title: (cell, row) => (!cell || isNaN(cell)) ? '-' : 
        `${(+cell).toFixed(3)} [${row.ci_95_low.toFixed(3)} - ${+row.ci_95_high.toFixed(3)}]`,
      headerStyle: { minWidth: '200px',  width: '200px' },
      classes: 'overflow-ellipsis',
      headerClasses: 'overflow-ellipsis',
    },
    {
      dataField: 'p_value',
      text: <span>Assoc. <span className="text-nowrap">P-Value</span></span>,
      headerTitle: _ => 'Association P-Values',
      formatter: cell => cell < 1e-2 ? (+cell).toExponential() : cell,
      title: true,
      sort: true,
      headerStyle: {minWidth: '100px'},
      headerClasses: 'overflow-ellipsis',
      classes: 'overflow-ellipsis',
    },
    {
      dataField: 'p_value_heterogenous',
      text: <span>Het. <span className="text-nowrap">P-Value</span></span>,
      headerTitle: _ => 'Heterogenous P-Values',
      title: true,
      formatter: cell => isNaN(cell) ? '-' : cell,
      headerStyle: {minWidth: '100px'},
      headerClasses: 'overflow-ellipsis',
      classes: 'overflow-ellipsis',
    },
    {
      dataField: 'n',
      text: 'N',
      headerTitle: _ => 'Sample Size',
      title: true,
      formatter: cell => isNaN(cell) ? '-' : cell,
      headerStyle: {width: '80px'},
      headerClasses: 'overflow-ellipsis',
      classes: 'overflow-ellipsis',
    },
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

  const setSelectedPhenotypes = selectedPhenotypes => {
    dispatch(updateVariantLookup({ selectedPhenotypes }));
  };

  const setSubmitted = submitted => {
    dispatch(updateVariantLookup({ submitted }));
  };

  const setSearchCriteriaVariantLookup = searchCriteriaVariantLookup => {
    dispatch(updateVariantLookup({ searchCriteriaVariantLookup }));
  };

  const validateVariantInput = variant => {
    if (
      variant.match(/^rs\d+$/i) != null ||
      variant.match(/^chr(\d+|x|y):\d/i 
      
        // /^(chr)?(([1-9]|[1][0-9]|[2][0-2])|[x|y]):[0-9]+/i
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
    // skip variant validation for now
    // if (!validateVariantInput(params.variant)) {
    //   setMessages([
    //     {
    //       type: 'danger',
    //       content: "Please input a valid variant rsid or coordinate. (Ex. 'rs1234' or 'chr22:25855459')"
    //     }
    //   ]);
    //   return;
    // }
    // close sidebar on submit
    // setOpenSidebar(false);

    dispatch(updateVariantLookup({
      searchCriteriaVariantLookup: {
        phenotypes: params.phenotypes.map(item => item.title),
        variant: params.variant,
        sex: params.sex,
        ancestry: params.ancestry
      },
      submitted: new Date(),
      disableSubmit: true
    }));
    
    dispatch(lookupVariants({
      phenotypes: params.phenotypes, 
      variant: params.variant, 
      sex: params.sex,
      ancestry: params.ancestry
    }));
  };

  const loadState = state => {
    if (!state || !Object.keys(state).length) return;
    dispatch(updateVariantLookup({
      ...state, 
      submitted: new Date(),
      sharedState: null
    }));
    dispatch(
      lookupVariants({
        phenotypes: state.selectedPhenotypes, 
        variant: state.selectedVariant, 
        sex: state.selectedSex === 'combined' ? 'all' : state.selectedSex,
        ancestry: state.selectedAncestry
      })
    );
  }

  useEffect(() => {
    if (sharedState && sharedState.parameters && sharedState.parameters.params) {
      loadState(sharedState.parameters.params);
    }
  }, [sharedState]);

  useEffect(() => {
    if (sharedState) return;
    if (selectedPhenotypes) {
      setSelectedPhenotypes(selectedPhenotypes);
    }
  }, [selectedPhenotypes]);

  const handleReset = () => {
    const initialState = getInitialState();
    dispatch(
      updateVariantLookup(initialState.variantLookup)
    );
    dispatch(
      updateVariantLookupTable(initialState.variantLookupTable)
    );
  };

  return (
    <div className="position-relative">
      <h1 className="sr-only">Explore GWAS data - Search for variant across phenotypes</h1>
      <SidebarContainer className="mx-3">
        <SidebarPanel className="col-lg-3">
          <div className="px-2 pt-2 pb-3 bg-white tab-pane-bordered rounded-0">
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
          <div
            className={
              submitted && results ?
              "p-2 bg-white tab-pane-bordered rounded-0" :
              "p-2 bg-white tab-pane-bordered rounded-0 d-flex justify-content-center align-items-center"
            }
            style={{ minHeight: '472px' }}>
            {
              results &&
                <div
                  className="mw-100 my-2 px-4"
                  style={{ display: submitted && results ? 'block' : 'none' }}>
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
                            color: 'rgb(0, 126, 167)'
                          }}
                          {...props.csvProps}>
                          Export CSV
                        </ExportCSVButton>
                        <br />
                        <Table
                          wrapperClasses="table-responsive" 
                          {...props.baseProps}
                          bootstrap4
                          // keyField="variant_id"
                          // data={results}
                          // columns={columns}
                          filter={filterFactory()}
                          pagination={paginationFactory({
                            showTotal: results ? results.length > 0 : false,
                            sizePerPageList: [25, 50, 100],
                            paginationTotalRenderer: paginationText('variant', 'variants'),
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
              submitted && !results &&
                <Spinner animation="border" variant="primary" role="status">
                  <span className="sr-only">Loading...</span>
                </Spinner>
            }
            {placeholder}
          </div>
        </MainPanel>
      </SidebarContainer>
    </div>
  );
}

import { createStore, applyMiddleware, compose } from 'redux';
import { rootReducer } from './reducers';
import { initialize } from './actions';
import ReduxThunk from 'redux-thunk';

// returns a reference to a new object
export const getInitialState = () => ({
  phenotypes: null,

  summaryResults: {
    selectedPhenotype: null,
    selectedChromosome: null,
    selectedPlot: 'manhattan-plot',
    selectedTable: '',
    selectedSex: '',
    existingSexes: [],
    selectedAncestry: '',
    existingAncestries: ['all'],
    manhattanPlotView: '',
    nlogpMin: null,
    nlogpMax: null,
    bpMin: null,
    bpMax: null,
    messages: [],
    submitted: null,
    disableSubmit: false,
    searchCriteriaSummaryResults: null,
    shareID: null,
    sharedState: null
  },
  qqPlot: {
    loadingQQPlot: false,
    lambdaGC: null,
    sampleSize: null,
    qqplotData: [],
    qqplotLayout: {},
    lambdaGC: '',
    areaItems: []
  },
  manhattanPlot: {
    loadingManhattanPlot: false,
    manhattanPlotData: {},
    manhattanMirroredData: {},
    loadingManhattanTable: false,
    manhattanPlotConfig: {},
    restoredZoomLevel: null,
    zoomStack: [],
    genes: [],
  },
  summaryTables: {
    visible: true,
    loading: false,
    stackedSex: 'female',
    all: {
      results: [],
      resultsCount: 0,
      page: 1,
      pageSize: 10,
    },
    female: {
      results: [],
      resultsCount: 0,
      page: 1,
      pageSize: 10,
    },
    male: {
      results: [],
      resultsCount: 0,
      page: 1,
      pageSize: 10,
    },
  },
  summarySnpTables: {
    snp: '',
    visible: false,
    loading: false,
    all: {
      results: [],
      resultsCount: 0,
      page: 1,
      pageSize: 10,
    },
    female: {
      results: [],
      resultsCount: 0,
      page: 1,
      pageSize: 10,
    },
    male: {
      results: [],
      resultsCount: 0,
      page: 1,
      pageSize: 10,
    },
  },
  variantLookup: {
    selectedPhenotypes: [],
    selectedVariant: '',
    selectedSex: 'all',
    messages: [],
    submitted: null,
    disableSubmit: false,
    searchCriteriaVariantLookup: null,
    collapseCriteria: true,
    shareID: null,
    sharedState: null
  },
  variantLookupTable: {
    results: null,
    numResults: null,
  },
  phenotypeCorrelations: {
    selectedPhenotypes: [],
    selectedSex: 'combined',
    submitted: null,
    disableSubmit: false,
    messages: [],
    searchCriteriaPhenotypeCorrelations: null,
    collapseCriteria: true,
    shareID: null,
    sharedState: null
  },
  heatmap: {
    heatmapData: null,
    heatmapLayout: null,
  },
  browsePhenotypes: {
    selectedPhenotype: null,
    displayTreeParent: null,
    submitted: null,
    disableSubmit: false,
    messages: [],
    selectedPlot: 'frequency',
    breadCrumb: [],
    currentBubbleData: null,
    categoryColor: null,
    shareID: null,
    sharedState: null
  },
  browsePhenotypesPlots: {
    phenotypeData: null,
    phenotypeType: 'binary',
    loading: false
  },
  downloads: {
    selectedPhenotypes: [],
    downloadRoot: '',
  },
  error: {
    visible: false,
    message: `An error occured when requesting data. If this problem persists, please contact the administrator at <a href="mailto:PLCOWebAdmin@cancer.gov">PLCOWebAdmin@cancer.gov</a>.`
  },
});

export const store = createStore(
  rootReducer,
  getInitialState(),
  compose(
    applyMiddleware(ReduxThunk),
    window.__REDUX_DEVTOOLS_EXTENSION__
      ? window.__REDUX_DEVTOOLS_EXTENSION__({ trace: true })
      : e => e
  )
);

store.dispatch(initialize());

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
    selectedSex: 'all',
    manhattanPlotView: '',
    nlogpMin: null,
    nlogpMax: null,
    bpMin: null,
    bpMax: null,
    messages: [],
    submitted: null,
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
    areaItems: [],
    // popupTooltipData: null,
    // tooltipData: null,
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
    selectedSex: 'combined',
    results: null,
    messages: [],
    submitted: null,
    searchCriteriaVariantLookup: null,
    numResults: null,
    collapseCriteria: true,
    shareID: null,
    sharedState: null
  },
  phenotypeCorrelations: {
    selectedPhenotypes: [],
    selectedSex: 'combined',
    
    submitted: null,
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
    messages: [],
    selectedPlot: 'frequency',
    phenotypeType: 'binary',
    breadCrumb: [],
    currentBubbleData: null,
    phenotypeData: null,
    categoryColor: null,
    loading: false,
    shareID: null,
    sharedState: null
  },
  downloads: {
    selectedPhenotypes: [],
    downloadRoot: '',
  }
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

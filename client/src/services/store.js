import { createStore, applyMiddleware, compose } from 'redux';
import { rootReducer } from './reducers';
import { initialize } from './actions';
import ReduxThunk from 'redux-thunk';

export const getInitialState = () => ({
  phenotypes: null,
  summaryResults: {
    selectedListType: 'categorical',
    selectedPhenotype: null,
    selectedChromosome: null,
    selectedPlot: 'manhattan-plot',
    selectedTable: '',
    selectedManhattanPlotType: 'all',
    manhattanPlotData: {},
    manhattanMirroredData: {},
    manhattanPlotView: '',
    nlogpMin: null,
    nlogpMax: null,
    bpMin: null,
    bpMax: null,
    messages: [],
    areaItems: [],
    lambdaGC: '',
    submitted: null,
    loadingManhattanTable: false,
    loadingManhattanPlot: false,
    loadingQQPlot: false,
    drawManhattanPlot: null,
    // popupTooltipData: null,
    // tooltipData: null,
    qqplotData: [],
    qqplotLayout: {},
    searchCriteriaSummaryResults: null,
    sampleSize: null,
    manhattanPlotConfig: {},
    zoomStack: [],
    genes: [],
    shareID: null
  },
  manhattanPlot: {
    data: {},
    mirroredData: {},
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
    selectedListType: 'categorical',
    selectedPhenotypes: [],
    selectedVariant: '',
    selectedSex: 'combined',
    results: null,
    messages: [],
    submitted: null,
    searchCriteriaVariantLookup: null,
    numResults: null,
    collapseCriteria: true,
    shareID: null
  },
  phenotypeCorrelations: {
    selectedListType: 'categorical',
    selectedPhenotypes: [],
    selectedSex: 'combined',
    heatmapData: null,
    heatmapLayout: {},
    submitted: null,
    messages: [],
    searchCriteriaPhenotypeCorrelations: null,
    collapseCriteria: true,
    shareID: null
  },
  browsePhenotypes: {
    selectedPhenotype: null,
    displayTreeParent: null,
    submitted: null,
    messages: [],
    selectedPlot: 'frequency',
    phenotypeType: 'binary',
    breadcrumb: [],
    currentBubbleData: null,
    phenotypeData: null,
    categoryColor: null,
    loading: false,
    shareID: null
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

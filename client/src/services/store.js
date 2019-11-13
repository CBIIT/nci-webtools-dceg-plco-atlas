import { createStore, applyMiddleware, compose } from 'redux';
import { rootReducer } from './reducers';
import { fetchRanges } from './actions';
import ReduxThunk from 'redux-thunk';

const initialState = {
  phenotypes: [],
  phenotypesTree: [],
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
    qqplotSrc: '',
    areaItems: [],
    lambdaGC: '',
    sampleSize: '',
    submitted: null,
    loading: false,
    loadingManhattanPlot: false,
    drawManhattanPlot: null,
    updateResultsTable: null,
    popupTooltipData: null,
    snp: '',
    snpResults: null,
    showSnpResults: null,
    qqplotData: [],
    qqplotLayout: {},
  },
  summaryTables: [
    {
      results: [],
      resultsCount: 0,
      page: 1,
      pageSize: 10,
    },
    {
      results: [],
      resultsCount: 0,
      page: 1,
      pageSize: 10,
    },
  ],
  variantLookup: {
    selectedListType: 'categorical',
    selectedPhenotype: null,
    selectedPhenotypes: [],
    selectedVariant: '',
    selectedGender: 'combined',
    results: [],
    messages: [],
    loading: false,
    submitted: null
  },
  phenotypeCorrelations: {
    selectedListType: 'categorical',
    selectedPhenotypes: [],
    selectedGender: 'combined',
    heatmapData: [],
    heatmapLayout: {},
    results: [],
    loading: false,
    submitted: null,
    messages: [],
    popupTooltipStyle: {display: 'none'},
    popupTooltipData: null
  }
};

export const store = createStore(
  rootReducer,
  initialState,
  compose(
    applyMiddleware(ReduxThunk),
    window.__REDUX_DEVTOOLS_EXTENSION__
      ? window.__REDUX_DEVTOOLS_EXTENSION__({ trace: true })
      : e => e
  )
);

store.dispatch(fetchRanges());

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
    selectedManhattanPlotType: 'aggregate',
    manhattanPlotData: {},
    manhattanPlotView: '',
    ranges: [],
    results: [],
    resultsCount: 0,
    page: 1,
    pageSize: 10,
    messages: [],
    qqplotSrc: '',
    areaItems: [],
    lambdaGC: '',
    sampleSize: '',
    submitted: null,
    loading: false,
    drawManhattanPlot: null,
    updateResultsTable: null
  },
  variantLookup: {
    selectedListType: 'categorical',
    selectedPhenotype: null,
    selectedPhenotypes: [],
    selectedVariant: '',
    selectedGender: 'combined',
    results: [],
    message: '',
    loading: false,
    submitted: null
  },
  phenotypeCorrelations: {
    // drawHeatmap: null,
    selectedListType: 'categorical',
    selectedPhenotypes: [],
    selectedGender: 'combined',
    heatmapData: [],
    results: [],
    loading: false,
    submitted: null,
    messages: []
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

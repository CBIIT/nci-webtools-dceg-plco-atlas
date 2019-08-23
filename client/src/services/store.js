import { createStore, applyMiddleware, compose } from 'redux';
import { rootReducer } from './reducers';
import ReduxThunk from 'redux-thunk';

const initialState = {
    phenotypes: [],
    summaryResults: {
        selectedListType: 'alphabetic',
        selectedPhenotype: null,
        selectedChromosome: null,
        selectedManhattanPlotType: 'combined',
        ranges: [],
        results: [],
        resultsCount: 0,
        page: 1,
        pageSize: 10,
        messages: [],
        qqplotSrc: '',
        areaItems: [],
        submitted: null,
        loading: false,
        drawManhattanPlot: null,
        drawQQPlot: null,
        updateResultsTable: null,
    },
    variantLookup: {
        selectedListType: 'alphabetic',
        selectedPhenotype: null,
        selectedPhenotypes: [],
        selectedVariant: null,
        selectedGender: 'combined',
        results: [],
        message: '',
        loading: false,
    },
    phenotypeCorrelations: {
        drawHeatmap: null,
        selectedListType: 'alphabetic',
        selectedPhenotypes: [],
        results: [],
        loading: false,
        submitted: null,
        messages: [],
    }
};

export const store = createStore(
    rootReducer,
    initialState,
    compose(
        applyMiddleware(ReduxThunk),
        window.__REDUX_DEVTOOLS_EXTENSION__ 
            ? window.__REDUX_DEVTOOLS_EXTENSION__()
            : e => e
    )
);

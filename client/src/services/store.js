import { createStore, applyMiddleware } from 'redux';
import { rootReducer } from './reducers';
import ReduxThunk from 'redux-thunk';

const initialState = {
    phenotypes: [],
    summaryResults: {
        selectedListType: 'alphabetic',
        selectedPhenotype: null,
        selectedChromosome: null,
        ranges: [],
        results: [],
        resultsCount: 0,
        page: 1,
        pageSize: 10,
        messages: [],
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
        selectedVariant: null,
        results: [],
        message: '',
        loading: false,
        lookupFunction: null,
    },
    phenotypeCorrelations: {
        selectedListType: 'alphabetic',
        selectedPhenotypes: [],
        results: [],
    }
};

export const store = createStore(
    rootReducer,
    initialState,
    applyMiddleware(ReduxThunk)
);

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
        messages: [],
        submitted: null,
        loading: false,
        drawManhattanPlot: null,
        drawQQPlot: null,
    },
    variantLookup: {
        selectedListType: 'alphabetic',
        selectedPhenotype: null,
        selectedVariant: null,
        results: [],
        loading: false,
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

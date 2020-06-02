import {
    UPDATE_KEY,
    UPDATE_SUMMARY_RESULTS,
    UPDATE_MANHATTAN_PLOT,
    UPDATE_QQ_PLOT,
    UPDATE_SUMMARY_TABLE,
    UPDATE_SUMMARY_SNP,
    UPDATE_SUMMARY_SNP_TABLE,
    UPDATE_VARIANT_LOOKUP,
    UPDATE_VARIANT_LOOKUP_TABLE,
    UPDATE_PHENOTYPE_CORRELATIONS,
    UPDATE_PHENOTYPES,
    UPDATE_BROWSE_PHENOTYPES,
    UPDATE_BROWSE_PHENOTYPES_PLOTS,
    UPDATE_HEATMAP,
    UPDATE_DOWNLOADS,
    UPDATE_ERROR,
} from './actions';
import {
    getInitialState
} from './store';
import {
   rootReducer 
} from './reducers';


describe('Reducers Module', function () {

    test('rootReducer() returns correct state for action: UPDATE_KEY', () => {
        let state = getInitialState();
        let type = UPDATE_KEY;
        let key = 'test';
        let data = {test: 1}
        let action = {type, key, data};
        expect(rootReducer(state, action)).toEqual({
            ...state,
            [action.key]: action.data
        });
    });

    test('rootReducer() returns correct state for action: UPDATE_SUMMARY_RESULTS', () => {
        let state = getInitialState();
        let type = UPDATE_SUMMARY_RESULTS;
        let data = {test: 1}
        let action = {type, data};
        expect(rootReducer(state, action)).toEqual({
            ...state,
            summaryResults: {
              ...state.summaryResults,
              ...action.data
            }
        })
    });

    test('rootReducer() returns correct state for action: UPDATE_MANHATTAN_PLOT', () => {
        let state = getInitialState();
        let type = UPDATE_MANHATTAN_PLOT;
        let data = {test: 1}
        let action = {type, data};
        expect(rootReducer(state, action)).toEqual({
            ...state,
            manhattanPlot: {
              ...state.manhattanPlot,
              ...action.data,
            }
        })
    });

    test('rootReducer() returns correct state for action: UPDATE_QQ_PLOT', () => {
        let state = getInitialState();
        let type = UPDATE_QQ_PLOT;
        let data = {test: 1}
        let action = {type, data};
        expect(rootReducer(state, action)).toEqual({
            ...state,
            qqPlot: {
              ...state.qqPlot,
              ...action.data,
            }
        })
    });

    test('rootReducer() returns correct state for action: UPDATE_SUMMARY_TABLE', () => {
        let state = getInitialState();
        let type = UPDATE_SUMMARY_TABLE;
        let key = 'test';
        let data = {test: 1}
        let action = {type, key, data};
        expect(rootReducer(state, action)).toEqual({
            ...state,
            summaryTables: {
                ...state.summaryTables,
                [action.key]: action.data
            }
        })
    });

    test('rootReducer() returns correct state for action: UPDATE_SUMMARY_SNP', () => {
        let state = getInitialState();
        let type = UPDATE_SUMMARY_SNP;
        let key = 'test';
        let data = {test: 1}
        let action = {type, key, data};
        expect(rootReducer(state, action)).toEqual({
            ...state,
            summarySnpTables: {
                ...state.summarySnpTables,
                [action.key]: action.data
            }
        })
    });

    test('rootReducer() returns correct state for action: UPDATE_SUMMARY_SNP_TABLE', () => {
        let state = getInitialState();
        let type = UPDATE_SUMMARY_SNP_TABLE;
        let key = 'test';
        let data = {test: 1};
        let action = {type, key, data};
        expect(rootReducer(state, action)).toEqual({
            ...state,
            summarySnpTables: {
                ...state.summarySnpTables,
                [action.key]: action.data
            }
        })
    });

    test('rootReducer() returns correct state for action: UPDATE_VARIANT_LOOKUP', () => {
        let state = getInitialState();
        let type = UPDATE_VARIANT_LOOKUP;
        let data = {test: 1}
        let action = {type, data};
        expect(rootReducer(state, action)).toEqual({
            ...state,
            variantLookup: {
              ...state.variantLookup,
              ...action.data
            }
        })
    });

    test('rootReducer() returns correct state for action: UPDATE_VARIANT_LOOKUP_TABLE', () => {
        let state = getInitialState();
        let type = UPDATE_VARIANT_LOOKUP_TABLE;
        let key = '';
        let data = {test: 1}
        let action = {type, key, data};
        expect(rootReducer(state, action)).toEqual({
            ...state,
            variantLookupTable: {
              ...state.variantLookupTable,
              ...action.data
            }
        })
    });

    test('rootReducer() returns correct state for action: UPDATE_PHENOTYPE_CORRELATIONS', () => {
        let state = getInitialState();
        let type = UPDATE_PHENOTYPE_CORRELATIONS;
        let data = {test: 1}
        let action = {type, data};
        expect(rootReducer(state, action)).toEqual({
            ...state,
            phenotypeCorrelations: {
              ...state.phenotypeCorrelations,
              ...action.data
            }
        })
    });

    test('rootReducer() returns correct state for action: UPDATE_PHENOTYPES', () => {
        let state = getInitialState();
        let type = UPDATE_PHENOTYPES;
        let data = {test: 1}
        let action = {type, data};
        expect(rootReducer(state, action)).toEqual({
            ...state,
            phenotypes: action.data
        })
    });

    test('rootReducer() returns correct state for action: UPDATE_BROWSE_PHENOTYPES', () => {
        let state = getInitialState();
        let type = UPDATE_BROWSE_PHENOTYPES;
        let data = {test: 1}
        let action = {type, data};
        expect(rootReducer(state, action)).toEqual({
            ...state,
            browsePhenotypes: {
              ...state.browsePhenotypes,
              ...action.data
            }
        })
    });

    test('rootReducer() returns correct state for action: UPDATE_BROWSE_PHENOTYPES_PLOTS', () => {
        let state = getInitialState();
        let type = UPDATE_BROWSE_PHENOTYPES_PLOTS;
        let data = {test: 1}
        let action = {type, data};
        expect(rootReducer(state, action)).toEqual({
            ...state,
            browsePhenotypesPlots: {
              ...state.browsePhenotypesPlots,
              ...action.data
            }
        })
    });

    test('rootReducer() returns correct state for action: UPDATE_HEATMAP', () => {
        let state = getInitialState();
        let type = UPDATE_HEATMAP;
        let data = {test: 1};
        let action = {type, data};
        expect(rootReducer(state, action)).toEqual({
            ...state,
            heatmap: {
              ...state.heatmap,
              ...action.data
            }
        })
    });

    test('rootReducer() returns correct state for action: UPDATE_DOWNLOADS', () => {
        let state = getInitialState();
        let type = UPDATE_DOWNLOADS;
        let data = {test: 1};
        let action = {type, data};
        expect(rootReducer(state, action)).toEqual({
            ...state,
            downloads: {
              ...state.downloads,
              ...action.data
            }
        })
    });

    test('rootReducer() returns correct state for action: UPDATE_ERROR', () => {
        let state = getInitialState();
        let type = UPDATE_ERROR;
        let data = {test: 1};
        let action = {type, data};
        expect(rootReducer(state, action)).toEqual({
            ...state,
            error: {
              ...state.error,
              ...action.data
            }
        })
    });        
});

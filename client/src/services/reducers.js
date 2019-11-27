import {
  UPDATE_SUMMARY_RESULTS,
  UPDATE_SUMMARY_TABLE,
  UPDATE_VARIANT_LOOKUP,
  UPDATE_PHENOTYPE_CORRELATIONS,
  UPDATE_PHENOTYPES,
  UPDATE_PHENOTYPES_TREE,
  UPDATE_PHENOTYPES_HEATMAP_TREE
} from './actions';

export const rootReducer = (state, action) => {
  switch (action.type) {
    case UPDATE_SUMMARY_RESULTS:
      return {
        ...state,
        summaryResults: {
          ...state.summaryResults,
          ...action.data
        }
      };
    case UPDATE_SUMMARY_TABLE:
      let summaryTables = state.summaryTables;
      summaryTables[action.index] = action.data;
      return {
        ...state,
        summaryTables
      };
    case UPDATE_VARIANT_LOOKUP:
      return {
        ...state,
        variantLookup: {
          ...state.variantLookup,
          ...action.data
        }
      };
    case UPDATE_PHENOTYPE_CORRELATIONS:
      return {
        ...state,
        phenotypeCorrelations: {
          ...state.phenotypeCorrelations,
          ...action.data
        }
      };
    case UPDATE_PHENOTYPES:
      return {
        ...state,
        phenotypes: action.data
      };
    case UPDATE_PHENOTYPES_TREE:
      return {
        ...state,
        phenotypesTree: action.data
      };
    default:
      return state;
  }
};

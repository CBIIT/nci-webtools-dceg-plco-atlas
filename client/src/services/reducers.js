import {
  UPDATE_SUMMARY_RESULTS,
  UPDATE_VARIANT_LOOKUP,
  UPDATE_PHENOTYPE_CORRELATIONS,
  UPDATE_PHENOTYPES
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
    default:
      return state;
  }
};

import {
  UPDATE_KEY,
  UPDATE_SUMMARY_RESULTS,
  UPDATE_SUMMARY_TABLE,
  UPDATE_SUMMARY_SNP,
  UPDATE_SUMMARY_SNP_TABLE,
  UPDATE_VARIANT_LOOKUP,
  UPDATE_PHENOTYPE_CORRELATIONS,
  UPDATE_PHENOTYPES,
  UPDATE_PHENOTYPE_CATEGORIES,
  UPDATE_PHENOTYPES_TREE
} from './actions';

export const rootReducer = (state, action) => {
  switch (action.type) {
    case UPDATE_KEY:
      return {
        ...state,
        [action.key]: action.data
      }
    case UPDATE_SUMMARY_RESULTS:
      return {
        ...state,
        summaryResults: {
          ...state.summaryResults,
          ...action.data
        }
      };
    case UPDATE_SUMMARY_TABLE:
      let summaryTables = {
        ...state.summaryTables,
        [action.key]: action.data
      };
      return {
        ...state,
        summaryTables
      };
    case UPDATE_SUMMARY_SNP:
    case UPDATE_SUMMARY_SNP_TABLE:
      let summarySnpTables = {
        ...state.summarySnpTables,
        [action.key]: action.data
      };
      return {
        ...state,
        summarySnpTables
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
    case UPDATE_PHENOTYPE_CATEGORIES:
      return {
        ...state,
        phenotypeCategories: action.data
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

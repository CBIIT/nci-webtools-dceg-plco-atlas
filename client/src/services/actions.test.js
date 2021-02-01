import {
  UPDATE_KEY,
  UPDATE_SUMMARY_RESULTS,
  UPDATE_QQ_PLOT,
  UPDATE_PCA_PLOT,
  UPDATE_MANHATTAN_PLOT,
  UPDATE_SUMMARY_TABLE,
  UPDATE_SUMMARY_SNP_TABLE,
  UPDATE_SUMMARY_SNP,
  UPDATE_VARIANT_LOOKUP,
  UPDATE_VARIANT_LOOKUP_TABLE,
  UPDATE_PHENOTYPE_CORRELATIONS,
  UPDATE_HEATMAP,
  UPDATE_PHENOTYPES,
  UPDATE_BROWSE_PHENOTYPES,
  UPDATE_BROWSE_PHENOTYPES_PLOTS,
  UPDATE_DOWNLOADS,
  UPDATE_ERROR,
  updateKey,
  updatePhenotypes,
  updateSummaryResults,
  updateManhattanPlot,
  updateQQPlot,
  updatePCAPlot,
  updateSummaryTable,
  setSummaryTableLoading,
  updateSummarySnp,
  updateSummarySnpTable,
  setSummarySnpLoading,
  updateVariantLookup,
  updateVariantLookupTable,
  updatePhenotypeCorrelations,
  updateHeatmap,
  updateBrowsePhenotypes,
  updateBrowsePhenotypesPlots,
  updateDownloads,
  updateError
} from './actions';

describe('Actions Module', function() {
  test('updateKey() generates expected action', () => {
    const data = { test: 1 };
    const key = 'example';
    expect(updateKey(key, data)).toEqual({ type: UPDATE_KEY, key, data });
  });

  test('updatePhenotypes() generates expected action', () => {
    const data = { test: 1 };
    expect(updatePhenotypes(data)).toEqual({ type: UPDATE_PHENOTYPES, data });
  });

  test('updateSummaryResults() generates expected action', () => {
    const data = { test: 1 };
    expect(updateSummaryResults(data)).toEqual({
      type: UPDATE_SUMMARY_RESULTS,
      data
    });
  });

  test('updateManhattanPlot() generates expected action', () => {
    const data = { test: 1 };
    expect(updateManhattanPlot(data)).toEqual({
      type: UPDATE_MANHATTAN_PLOT,
      data
    });
  });

  test('updateQQPlot() generates expected action', () => {
    const data = { test: 1 };
    expect(updateQQPlot(data)).toEqual({ type: UPDATE_QQ_PLOT, data });
  });

  test('updatePCAPlot() generates expected action', () => {
    const data = { test: 1 };
    expect(updatePCAPlot(data)).toEqual({ type: UPDATE_PCA_PLOT, data });
  });

  test('updateSummaryTable() generates expected action', () => {
    const data = { test: 1 };
    const key = 'example';
    expect(updateSummaryTable(key, data)).toEqual({
      type: UPDATE_SUMMARY_TABLE,
      key,
      data
    });
  });

  test('setSummaryTableLoading() generates expected action', () => {
    const data = true;
    expect(setSummaryTableLoading(data)).toEqual({
      type: UPDATE_SUMMARY_TABLE,
      key: 'loading',
      data
    });
  });

  test('updateSummarySnp() generates expected action', () => {
    const data = { test: 1 };
    const key = 'example';
    expect(updateSummarySnp(key, data)).toEqual({
      type: UPDATE_SUMMARY_SNP,
      key,
      data
    });
  });

  test('updateSummarySnpTable() generates expected action', () => {
    const data = { test: 1 };
    const key = 'example';
    expect(updateSummarySnpTable(key, data)).toEqual({
      type: UPDATE_SUMMARY_SNP_TABLE,
      key,
      data
    });
  });

  test('setSummarySnpLoading() generates expected action', () => {
    const data = true;
    expect(setSummarySnpLoading(data)).toEqual({
      type: UPDATE_SUMMARY_SNP,
      key: 'loading',
      data
    });
  });

  test('updateVariantLookup() generates expected action', () => {
    const data = { test: 1 };
    expect(updateVariantLookup(data)).toEqual({
      type: UPDATE_VARIANT_LOOKUP,
      data
    });
  });

  test('updateVariantLookupTable() generates expected action', () => {
    const data = { test: 1 };
    expect(updateVariantLookupTable(data)).toEqual({
      type: UPDATE_VARIANT_LOOKUP_TABLE,
      data
    });
  });

  test('updatePhenotypeCorrelations() generates expected action', () => {
    const data = { test: 1 };
    expect(updatePhenotypeCorrelations(data)).toEqual({
      type: UPDATE_PHENOTYPE_CORRELATIONS,
      data
    });
  });

  test('updateHeatmap() generates expected action', () => {
    const data = { test: 1 };
    expect(updateHeatmap(data)).toEqual({ type: UPDATE_HEATMAP, data });
  });

  test('updateBrowsePhenotypes() generates expected action', () => {
    const data = { test: 1 };
    expect(updateBrowsePhenotypes(data)).toEqual({
      type: UPDATE_BROWSE_PHENOTYPES,
      data
    });
  });

  test('updateBrowsePhenotypesPlots() generates expected action', () => {
    const data = { test: 1 };
    expect(updateBrowsePhenotypesPlots(data)).toEqual({
      type: UPDATE_BROWSE_PHENOTYPES_PLOTS,
      data
    });
  });

  test('updateDownloads() generates expected action', () => {
    const data = { test: 1 };
    expect(updateDownloads(data)).toEqual({ type: UPDATE_DOWNLOADS, data });
  });

  test('updateError() generates expected action', () => {
    const data = { test: 1 };
    expect(updateError(data)).toEqual({ type: UPDATE_ERROR, data });
  });
});

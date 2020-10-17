
import {
  getInitialState
} from './store';

describe('Store Module', function () {
  test('getInitialState() returns correct state', () => {
    expect(getInitialState()).toEqual({
      phenotypes: null,

      summaryResults: {
        selectedPhenotypes: [],
        selectedStratifications: [],
        selectedChromosome: null,
        selectedPlot: 'manhattan-plot',
        isPairwise: false,
        manhattanPlotView: '',
        nlogpMin: null,
        nlogpMax: null,
        bpMin: null,
        bpMax: null,
        messages: [],
        submitted: null,
        shareID: null,
        sharedState: null
      },
      qqPlot: {
        loadingQQPlot: false,
        lambdaGC: null,
        sampleSize: null,
        qqplotData: [],
        qqplotLayout: {},
        lambdaGC: '',
        areaItems: []
      },
      manhattanPlot: {
        loadingManhattanPlot: false,
        manhattanPlotData: {},
        manhattanMirroredData: {},
        manhattanPlotConfig: {},
        restoredZoomLevel: null,
        zoomStack: [],
        genes: [],
      },
      summaryTables: {
        visible: true,
        loading: false,
        selectedTable: 0,
        tables: [
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
          }
        ]
      },
      summarySnpTables: {
        snp: '',
        visible: false,
        loading: false,
        tables: [
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
          }
        ]
      },
      variantLookup: {
        selectedPhenotypes: [],
        selectedVariant: '',
        selectedSex: 'all',
        selectedAncestry: 'european',
        messages: [],
        submitted: null,
        disableSubmit: false,
        searchCriteriaVariantLookup: null,
        collapseCriteria: true,
        shareID: null,
        sharedState: null
      },
      variantLookupTable: {
        results: null,
        numResults: null,
      },
      phenotypeCorrelations: {
        selectedPhenotypes: [],
        selectedSex: 'all',
        selectedAncestry: 'european',
        submitted: null,
        disableSubmit: false,
        messages: [],
        searchCriteriaPhenotypeCorrelations: null,
        collapseCriteria: true,
        shareID: null,
        sharedState: null
      },
      heatmap: {
        heatmapData: null,
        heatmapLayout: null,
      },
      browsePhenotypes: {
        selectedPhenotype: null,
        displayTreeParent: null,
        submitted: null,
        disableSubmit: false,
        messages: [],
        selectedPlot: 'frequency',
        breadCrumb: [],
        currentBubbleData: null,
        categoryColor: null,
        shareID: null,
        sharedState: null
      },
      browsePhenotypesPlots: {
        phenotypeData: null,
        phenotypeType: 'binary',
        loading: false
      },
      downloads: {
        selectedPhenotypes: [],
        downloadRoot: '',
      },
      error: {
        visible: false,
        message: `An error occured when requesting data. If this problem persists, please contact the administrator at <a href="mailto:PLCOWebAdmin@cancer.gov">PLCOWebAdmin@cancer.gov</a>.`
      },

    });
  })
});

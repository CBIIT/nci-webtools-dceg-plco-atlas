import React, {
  useRef,
  useState,
  forwardRef,
  useImperativeHandle
} from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { query } from '../../../../services/query';
import { PlotlyWrapper as Plot } from '../../../plots/plotly/plotly-wrapper';
import { LoadingOverlay } from '../../../controls/loading-overlay/loading-overlay';
import { Tooltip } from '../../../controls/tooltip/tooltip';
import {
  submitSummaryResultsQuery,
  updateBrowsePhenotypes,
  updateBrowsePhenotypesPlots,
  updateSummaryResults
} from '../../../../services/actions';

export const Heatmap = forwardRef(({}, ref) => {
  const dispatch = useDispatch();

  useImperativeHandle(ref, () => ({
    resetTooltip() {
      updateTooltip({ visible: false });
    }
  }));

  const phenotypes = useSelector(state => state.phenotypes);
  const { heatmapData, heatmapLayout } = useSelector(state => state.heatmap);

  const { selectedSex, selectedAncestry } = useSelector(
    state => state.phenotypeCorrelations
  );

  const plotContainer = useRef(null);

  // use local state to reset tooltip when this component unmounts
  const [tooltip, setTooltip] = useState({
    visible: false,
    data: {}
  });

  const updateTooltip = state =>
    setTooltip({
      ...tooltip,
      ...state
    });

  const handleSummaryResultsQuery = async (a, b) => {
    // verify that both phenotypes have data for the specified sex/ancestry combination
    const metadata = await query('metadata', {
      phenotype_id: [a, b],
      sex: selectedSex,
      ancestry: selectedAncestry,
      chromosome: 'all'
    });

    if (
      metadata.find(m => m.phenotype_id == a) &&
      metadata.find(m => m.phenotype_id == b)
    ) {
      const phenotypePair = [
        phenotypes.flat.find(p => p.id === a),
        phenotypes.flat.find(p => p.id === b)
      ];
      const stratification = { sex: selectedSex, ancestry: selectedAncestry };
      const stratifications = [stratification, stratification];
      dispatch(
        submitSummaryResultsQuery({
          phenotypes: phenotypePair,
          stratifications,
          isPairwise: true
        })
      );
    } else {
      dispatch(
        updateSummaryResults({
          messages: [
            {
              type: 'danger',
              content:
                'One of the phenotypes selected does not have data for the specified ancestry and sex.'
            }
          ]
        })
      );
    }
  };

  const handlePhenotypeLookup = async id => {
    const phenotype = phenotypes.flat.find(p => p.id === id);
    dispatch(
      updateBrowsePhenotypes({
        submitted: false,
        displayTreeParent: null
      })
    );

    dispatch(
      updateBrowsePhenotypesPlots({
        phenotypeData: null,
        loading: true
      })
    );

    const data = await query('participants', {
      id: phenotype.id,
      type: 'frequency'
    });

    dispatch(
      updateBrowsePhenotypesPlots({
        phenotypeData: data,
        loading: false
      })
    );

    // update browse phenotypes filters
    dispatch(
      updateBrowsePhenotypes({
        selectedPhenotype: phenotype,
        displayTreeParent: {
          data: phenotype
        },
        submitted: new Date(),
        disableSubmit: true,
        selectedPlot: 'frequency'
      })
    );
  };

  const config = {
    responsive: true,
    toImageButtonOptions: {
      format: 'svg', // one of png, svg, jpeg, webp
      filename: 'phenotype_correlations',
      height: 1000,
      width: 1000,
      scale: 1 // Multiply title/legend/axis/canvas sizes by this factor
    },
    displaylogo: false,
    modeBarButtonsToRemove: [
      'autoScale2d',
      'hoverClosestCartesian',
      'hoverCompareCartesian'
    ]
  };

  return (
    <div className="text-center my-3 position-relative" ref={plotContainer}>
      <LoadingOverlay active={!heatmapData} />

      {heatmapData && (
        <Plot
          className="heatmap override-cursor-heatmap"
          style={{ position: 'relative', height: '1000px', width: '1000px' }}
          data={heatmapData}
          layout={heatmapLayout}
          config={config}
          onHover={data => {
            const [point] = data.points;
            const { xaxis, yaxis, pointIndex } = point;
            const [yIndex, xIndex] = pointIndex;
            const xOffset = xaxis.l2p(xIndex) + xaxis._offset;
            const yOffset = yaxis.l2p(yIndex) + yaxis._offset;

            // Use event.clientX/Y to position the tooltip at the cursor
            // const {clientX, clientY} = data.event;
            // const {x, y} = viewportToLocalCoordinates(
            //   clientX,
            //   clientY,
            //   plotContainer.current
            // );

            updateTooltip({
              visible: true,
              data: point.customdata,
              // x, y
              x: xOffset,
              y: yOffset
            });
          }}
          onRelayout={relayout => {
            updateTooltip({ visible: false });
          }}
        />
      )}

      <Tooltip
        closeButton
        visible={tooltip.visible}
        x={tooltip.x}
        y={tooltip.y}
        onClose={e => updateTooltip({ visible: false })}
        style={{ width: '400px' }}
        className="text-left">
        <div>
          <span className="font-weight-bold">Correlation: </span>
          {(+tooltip.data.value || 0).toPrecision(5)}
        </div>
        <div>
          <a
            className="font-weight-bold"
            href="#/phenotypes"
            onClick={e => handlePhenotypeLookup(tooltip.data.phenotype_a)}>
            Go to {tooltip.data.phenotype_a_display_name} details
          </a>
        </div>
        <div>
          <a
            className="font-weight-bold"
            href="#/phenotypes"
            onClick={e => handlePhenotypeLookup(tooltip.data.phenotype_b)}>
            Go to {tooltip.data.phenotype_b_display_name} details
          </a>
        </div>
        {
          <div>
            <a
              className="font-weight-bold"
              href="#/gwas/summary"
              onClick={e =>
                handleSummaryResultsQuery(
                  tooltip.data.phenotype_a,
                  tooltip.data.phenotype_b
                )
              }>
              Go to Pairwise Summary Results
            </a>
          </div>
        }
      </Tooltip>
    </div>
  );
});

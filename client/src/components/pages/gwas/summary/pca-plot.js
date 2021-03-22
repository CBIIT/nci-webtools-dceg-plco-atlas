import React, { useState, useRef, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { updatePCAPlot, drawPCAPlot, updateError } from '../../../../services/actions';
import { PlotlyWrapper as Plot } from '../../../plots/plotly/plotly-wrapper';
import { LoadingOverlay } from '../../../controls/loading-overlay/loading-overlay';
import { Tooltip } from '../../../controls/tooltip/tooltip';
import { query } from '../../../../services/query';

export function PCAPlot() {
  const { 
    loadingPCAPlot, 
    pcaplotData, 
    pcaplotLayout,
    selectedPlatform,
    selectedPCX,
    selectedPCY
  } = useSelector(state => state.pcaPlot);

  const {
    selectedPhenotypes,
    selectedStratifications,
    isPairwise
  } = useSelector(state => state.summaryResults);

  const dispatch = useDispatch();

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

  useEffect(() => updateTooltip({ visible: false }), []);

  const config = {
    responsive: true,
    toImageButtonOptions: {
      format: 'svg', // one of png, svg, jpeg, webp
      filename: 'pca_plot',
      height: 1000,
      width: 1000,
      scale: 1 // Multiply title/legend/axis/canvas sizes by this factor
    },
    displaylogo: false,
    modeBarButtonsToRemove: [
      // 'zoom2d',
      // 'zoomIn2d',
      // 'zoomOut2d',
      'select2d',
      'autoScale2d',
      'hoverClosestCartesian',
      'hoverCompareCartesian',
      'lasso2d'
    ]
  };

  return (
    <>
      <form className="row px-2 mx-1">
        <div className="form-group col-md-4">
          <label htmlFor="pca-form-platform">Platform</label>
          <select 
            id="pca-form-platform" 
            className="form-control" 
            value={selectedPlatform}
            onChange={ev => {
              dispatch(updatePCAPlot({selectedPlatform: ev.target.value}));
              dispatch(
                drawPCAPlot({
                  phenotypes: selectedPhenotypes,
                  stratifications: selectedStratifications,
                  isPairwise,
                  pc_platform: ev.target.value,
                  pc_x: selectedPCX,
                  pc_y: selectedPCY
                })
              );
            }}
            disabled={loadingPCAPlot}>
            <option value="PLCO_GSA">PLCO_GSA</option>
            <option value="PLCO_Omni5">PLCO_Omni5</option>                        
            <option value="PLCO_Omni25">PLCO_Omni25</option>
            <option value="PLCO_Oncoarray">PLCO_Oncoarray</option>
            <option value="PLCO_OmniX">PLCO_OmniX</option>
          </select>
        </div>
        <div className="form-group col-md-4">
          <label htmlFor="pca-form-pcx">PC (X-axis)</label>
          <select
            id="pca-form-pcx" 
            className="form-control" 
            value={selectedPCX}
            onChange={ev => {
              if (ev.target.value !== selectedPCY) {
                dispatch(updatePCAPlot({selectedPCX: ev.target.value}));
                dispatch(
                  drawPCAPlot({
                    phenotypes: selectedPhenotypes,
                    stratifications: selectedStratifications,
                    isPairwise,
                    pc_platform: selectedPlatform,
                    pc_x: ev.target.value,
                    pc_y: selectedPCY
                  })
                );
              } else {
                dispatch(updateError({ 
                  visible: true,
                  message: 'Principal components must be different.'
                 }));
              }
            }}
            disabled={loadingPCAPlot}>
            {
              [...Array(20)].map((_, idx) => 
                <option key={`opt_x_${idx + 1}`} value={`${idx + 1}`}>{idx + 1}</option>)
            }
          </select>
        </div>
        <div className="form-group col-md-4">
          <label htmlFor="pca-form-pcy">PC (Y-axis)</label>
          <select
            id="pca-form-pcy" 
            className="form-control" 
            value={selectedPCY}
            onChange={ev => {
              if (ev.target.value !== selectedPCX) {
                dispatch(updatePCAPlot({selectedPCY: ev.target.value}));
                dispatch(
                  drawPCAPlot({
                    phenotypes: selectedPhenotypes,
                    stratifications: selectedStratifications,
                    isPairwise,
                    pc_platform: selectedPlatform,
                    pc_x: selectedPCX,
                    pc_y: ev.target.value
                  })
                );
              } else {
                dispatch(updateError({ 
                  visible: true,
                  message: 'Principal components must be different.'
                 }));
              }
            }}
            disabled={loadingPCAPlot}>
            {
              [...Array(20)].map((_, idx) => 
                <option key={`opt_y_${idx + 1}`} value={`${idx + 1}`}>{idx + 1}</option>)
            }
          </select>
        </div>
      </form>
      <div
        className="text-center my-3 position-relative mw-100"
        style={{ width: '800px', margin: '1rem auto' }}
        ref={plotContainer}>
        <LoadingOverlay active={loadingPCAPlot} />
        
        {pcaplotData && (
          <Plot
            className="override-cursor-default position-relative"
            data={pcaplotData}
            layout={pcaplotLayout}
            config={config}
            onHover={data => {
              const [point] = data.points;
              if (point.customdata) {
                const { xaxis, yaxis } = point;
                const xOffset = xaxis.l2p(point.x) + xaxis._offset + 5;
                const yOffset = yaxis.l2p(point.y) + yaxis._offset + 5;

                /* Use event.clientX/Y if we want to position the tooltip at the cursor (instead of point)
                const {clientX, clientY} = data.event;
                const {x, y} = viewportToLocalCoordinates(
                  clientX, 
                  clientY, 
                  plotContainer.current
                ); */

                updateTooltip({
                  visible: true,
                  data: point.customdata,
                  x: xOffset,
                  y: yOffset
                });
              }
            }}
            onClick={async data => {
              const [point] = data.points;
              if (point.customdata) {
                const response = await query('variants', {
                  columns: ['chromosome', 'position', 'snp'],
                  phenotype_id: point.customdata.phenotypeId,
                  id: point.customdata.variantId,
                  ancestry: point.customdata.ancestry,
                  sex: point.customdata.sex
                });
                const record = response.data[0];
                const { xaxis, yaxis } = point;
                const xOffset = xaxis.l2p(point.x) + xaxis._offset + 5;
                const yOffset = yaxis.l2p(point.y) + yaxis._offset + 5;

                /* Use event.clientX/Y if we want to position the tooltip at the cursor (instead of point)
                const {clientX, clientY} = data.event;
                const {x, y} = viewportToLocalCoordinates(
                  clientX, 
                  clientY, 
                  plotContainer.current
                ); */

                updateTooltip({
                  visible: true,
                  data: {
                    ...point.customdata,
                    ...record
                  },
                  x: xOffset,
                  y: yOffset
                });
              }
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
          style={{
            width: '240px',
            border: `1px solid ${tooltip.data.color}`
          }}
          className="text-left pca-plot-tooltip">
          {!tooltip.data || !tooltip.data.showData ? (
            <div>Only the top 10,000 variants are selectable.</div>
          ) : (
            <div>
              {tooltip.data.chromosome && tooltip.data.position && (
                <div>
                  <b>position:</b> {tooltip.data.chromosome}:
                  {tooltip.data.position}
                </div>
              )}
              {/* {tooltip.data.expected_p && <div><b>expected p-value:</b> {(+tooltip.data.expected_p || 0).toPrecision(5)}</div>} */}
              {tooltip.data.p && (
                <div>
                  <b>p-value:</b> {(+tooltip.data.p || 0).toPrecision(5)}
                </div>
              )}
              {tooltip.data.snp && (
                <div>
                  <b>snp:</b> {tooltip.data.snp || 'N/A'}
                </div>
              )}
              {/* {!tooltip.data.snp && (
                <div className="text-secondary">
                  <small>
                    Click on Point or
                    <a
                      href="javascript:void(0)"
                      className="mx-1"
                      onClick={async _ => {
                        const response = await query('variants', {
                          columns: ['chromosome', 'position', 'snp'],
                          phenotype_id: tooltip.data.phenotypeId,
                          id: tooltip.data.variantId,
                          ancestry: tooltip.data.ancestry,
                          sex: tooltip.data.sex
                        });

                        const record = response.data[0];
                        updateTooltip({
                          data: {
                            ...tooltip.data,
                            ...record
                          }
                        });
                      }}>
                      here
                    </a>
                    for details
                  </small>
                </div>
              )} */}
              {(tooltip.data.snp ||
                (tooltip.data.chromosome && tooltip.data.position)) && (
                <div>
                  {/* <a
                    href="#/gwas/lookup"
                    className="font-weight-bold"
                    onClick={e =>
                      onVariantLookup({
                        phenotype: { id: tooltip.data.phenotypeId },
                        sex: tooltip.data.sex,
                        ancestry: tooltip.data.ancestry,
                        snp:
                          tooltip.data.snp ||
                          `chr${tooltip.data.chromosome}:${tooltip.data.position}`
                      })
                    }>
                    Go to Variant Lookup
                  </a> */}
                </div>
              )}
            </div>
          )}
        </Tooltip>
      </div>
    </>
  );
}

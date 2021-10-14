import React, { useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { updatePCAPlot, drawPCAPlot, updateError } from '../../../../services/actions';
import { PlotlyWrapper as Plot } from '../../../plots/plotly/plotly-wrapper';
import { LoadingOverlay } from '../../../controls/loading-overlay/loading-overlay';

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
          <>
            <Plot
              className="override-cursor-default position-relative"
              data={pcaplotData['trait1']}
              layout={pcaplotLayout}
              config={config}
            />
            { isPairwise && (
              <Plot
                className="override-cursor-default position-relative"
                data={pcaplotData['trait2']}
                layout={pcaplotLayout}
                config={config}
              />
            )}
          </>
        )}
      </div>
    </>
  );
}

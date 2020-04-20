import React, { useState, useRef } from 'react';
import { useSelector } from 'react-redux';
import Plot from 'react-plotly.js';
// import { viewportToLocalCoordinates } from '../../services/plots/utils';
import { LoadingOverlay } from '../controls/loading-overlay';
import { Tooltip } from '../controls/tooltip';

export function QQPlot({ onVariantLookup }) {
  const {
    loadingQQPlot,
    qqplotData,
    qqplotLayout,
  } = useSelector(state => state.qqPlot);

  const plotContainer = useRef(null);

  // use local state to reset tooltip when this component unmounts
  const [tooltip, setTooltip] = useState({
    visible: false,
    data: {}
  });

  const updateTooltip = state => setTooltip({
    ...tooltip,
    ...state
  });
  
  const config = {
    responsive: true,
    toImageButtonOptions: {
      format: 'svg', // one of png, svg, jpeg, webp
      filename: 'custom_image',
      height: 1000,
      width: 1000,
      scale: 1 // Multiply title/legend/axis/canvas sizes by this factor
    },
    displaylogo: false,
    modeBarButtonsToRemove: [
      'zoom2d',
      'zoomIn2d',
      'zoomOut2d',
      'select2d',
      'autoScale2d',
      'hoverClosestCartesian',
      'hoverCompareCartesian',
      'lasso2d'
    ]
  };

  return (
    <div 
      className="text-center my-3 position-relative" 
      ref={plotContainer}>
      <LoadingOverlay active={loadingQQPlot} />

      <Plot
        className="override-cursor-default"
        style={{
          display: !loadingQQPlot ? 'block' : 'none',
          position: 'relative',
          height: '800px',
          width: '800px'
        }}
        data={qqplotData}
        layout={qqplotLayout}
        config={config}
        onHover={data => {
          const [point] = data.points;
          const {xaxis, yaxis} = point;
          const xOffset = xaxis.l2p(point.x) + xaxis._offset;
          const yOffset = yaxis.l2p(point.y) + yaxis._offset;

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
            y: yOffset,
          });
        }}
        onRelayout={relayout => {
          updateTooltip({visible: false})
        }}
      />

      <Tooltip 
        closeButton 
        visible={tooltip.visible} 
        x={tooltip.x} 
        y={tooltip.y} 
        onClose={e => updateTooltip({visible: false})}
        style={{width: '220px'}}
        className="text-left">
        {(!tooltip.data || (tooltip.data && -Math.log10(tooltip.data.p) < 3))
          ? <div>No information displayed for variants with -log<sub>10</sub>(p) &lt; 3.</div> 
          : <div>
              {tooltip.data.chromosome && tooltip.data.position && <div><b>position:</b> {tooltip.data.chromosome}:{tooltip.data.position}</div>}
              {tooltip.data.p && <div><b>p-value:</b> {(+tooltip.data.p || 0).toPrecision(5)}</div>}
              {tooltip.data.snp && <div><b>snp:</b> {tooltip.data.snp || 'N/A'}</div>}
              {(tooltip.data.snp || (tooltip.data.chromosome && tooltip.data.position)) && 
                <div>
                  <a 
                    href="#/gwas/lookup" 
                    className="font-weight-bold" 
                    onClick={e => onVariantLookup({
                      phenotype: {id: tooltip.data.phenotype_id},
                      sex: tooltip.data.sex,
                      snp: tooltip.data.snp || `chr${tooltip.data.chromosome}:${tooltip.data.position}`,
                    })}>
                    Go to Variant Lookup
                  </a>
                </div>}
            </div>}
      </Tooltip>
    </div>
  );

}

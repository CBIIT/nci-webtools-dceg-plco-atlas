// import React, { useState } from 'react';
import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { updateSummaryResults } from '../../services/actions';
import { Link } from 'react-router-dom';
import { Spinner } from 'react-bootstrap';
import {
  viewportToLocalCoordinates
} from '../../services/plots/utils';
// import ReactCursorPosition from 'react-cursor-position';

import Plot from 'react-plotly.js';


export function QQPlot({ onVariantLookup }) {
  const dispatch = useDispatch();
  const { 
    // loading, 
    loadingQQPlot,
    qqplotSrc, 
    areaItems, 
    lambdaGC, 
    sampleSize, 
    popupTooltipData,
    qqplotData,
    qqplotLayout
  } = useSelector(state => state.summaryResults);

  // temporary set states
  // const [hoverTooltipData, setHoverTooltipData] = useState({});

  // const setPopupTooltipData = popupTooltipData => {
  //   dispatch(updateSummaryResults({ popupTooltipData }));
  // };

  // const [pos, setPos] = useState({
  //   position: {
  //     x: 0,
  //     y: 0
  //   }
  // });

  // const [hoverTooltipStyle, setHoverTooltipStyle] = useState({
  //   top: 0, // computed based on child and parent's height
  //   left: 0, // computed based on child and parent's width
  //   display: 'none'
  // });

  // const [popupTooltipStyle, setPopupTooltipStyle] = useState({
  //   top: 0, // computed based on child and parent's height
  //   left: 0, // computed based on child and parent's width
  //   display: 'none'
  // });

  // const popupMarkerClick = e => {
  //   // make sure action occurs on imagemap coord only
  //   if (e.target && e.target.coords) {
  //     var variant = e.target.alt.split(',');
  //     setPopupTooltipData({
  //       position: 'chr' + variant[0] + ':' + variant[1],
  //       // 'point_#': variant[0],
  //       'p-value': variant[3],
  //       snp: variant[2]
  //     });
  //     console.log(pos.position);
  //     setPopupTooltipStyle({
  //       ...popupTooltipStyle,
  //       top: pos.position.y, // computed based on child and parent's height
  //       left: pos.position.x + 15, // computed based on child and parent's width
  //       display: 'block'
  //     });
  //     hoverMarkerLeave();
  //   } else {
  //     popupMarkerClose();
  //   }
  // };

  // const popupMarkerClose = e => {
  //   setPopupTooltipStyle({
  //     ...popupTooltipStyle,
  //     display: 'none'
  //   });
  //   setPopupTooltipData(null);
  // };

  // const hoverMarkerEnter = e => {
  //   // make sure action occurs on imagemap coord only
  //   if (e.target && e.target.coords) {
  //     var variant = e.target.alt.split(',');
  //     // if (popupTooltipData && variant[0] !== popupTooltipData['point_#']) {
  //       setHoverTooltipData({
  //         'p-value': variant[3],
  //         snp: variant[2]
  //       });
  //       setHoverTooltipStyle({
  //         ...hoverTooltipStyle,
  //         top: pos.position.y, 
  //         left: pos.position.x + 15, 
  //         // top: pos.position.y - 70, // computed based on child and parent's height
  //         // left: pos.position.x - 45, // computed based on child and parent's width
  //         display: 'block'
  //       });
  //     // }
  //   } else {
  //     hoverMarkerLeave();
  //   }
  // };

  // const hoverMarkerLeave = e => {
  //   setHoverTooltipStyle({
  //     ...hoverTooltipStyle,
  //     display: 'none'
  //   });
  //   setHoverTooltipData({});
  // };

  const config = {
    toImageButtonOptions: {
      format: 'svg', // one of png, svg, jpeg, webp
      filename: 'custom_image',
      // height: 800,
      // width: 800,
      scale: 1 // Multiply title/legend/axis/canvas sizes by this factor
    },
    displaylogo: false,
    modeBarButtonsToRemove: ['zoom2d', 'zoomIn2d', 'zoomOut2d', 'select2d', 'autoScale2d', 'hoverClosestCartesian', 'hoverCompareCartesian', 'lasso2d']
    // responsive: true
  };

  const createTooltip = () => {
    const tooltip = document.createElement('div');
    tooltip.classList.add('qq-plot-tooltip');
    tooltip.style.display = 'none';
    tooltip.style.position = 'absolute';
    return tooltip;
  }

  const showTooltip = (ev, tooltip, html) => {
    let { x, y } = viewportToLocalCoordinates(
      ev.clientX,
      ev.clientY,
      ev.target
    );

    // console.log("viewportToLocalCoordinates X", x);
    // console.log("viewportToLocalCoordinates Y", y);

    // const targetWidth = ev.target.clientWidth;
    // const targetHeight = ev.target.clientHeight;

    // console.log("targetWidth", targetWidth);
    // console.log("targetHeight", targetHeight);

    tooltip.innerHTML = '';
    tooltip.style.display = 'inline-block';
    if (html instanceof Element) {
      tooltip.insertAdjacentElement('beforeend', html);
    } else  {
      tooltip.insertAdjacentHTML('beforeend', html);
    }

    // const tooltipHeight = tooltip.clientHeight;
    // const tooltipWidth = tooltip.clientWidth;

    // console.log("tooltipHeight", tooltipHeight);
    // console.log("tooltipWidth", tooltipWidth);

    // const tooltipLeft = (Math.min(x, targetWidth - tooltipWidth) - 2) + 'px';
    // const tooltipTop = (Math.min(y, targetHeight - tooltipHeight) - 2) + 'px';
    const tooltipLeft = (x - 2) + 'px';
    const tooltipTop = (y - 2) + 'px';

    tooltip.style.left = tooltipLeft;
    tooltip.style.top = tooltipTop;
  }

  const hideTooltip = () => {
    // console.log("if tooltip already exists, destroy");
    const elem = document.getElementsByClassName("qq-plot-tooltip");
    // console.log(elem);
    if (elem && elem.length > 0) {
      // console.log("TOOLTIP EXISTS = DESTROY");
      elem[0].remove();
    }
    // tooltip.style.display = 'none';
  }

  const popupMarkerClick = e => {
    // if (document.getElementsByClassName("qq-plot-tooltip")[0]) {
    //   hideTooltip();
    // } else {
      console.log("E", e);
      const ev = e.event;
      console.log("EVENT", ev);
      const points = e.points;
      console.log("POINTS", points)
      
      hideTooltip();
      const tooltip = createTooltip();
      // add tooltip to qq-plot container
      const qqPlotContainer = document.getElementsByClassName("qq-plot")[0];
      // console.log(qqPlotContainer.style);
      const containerStyle = getComputedStyle(qqPlotContainer);
      // console.log(containerStyle);
      if (containerStyle.position === 'static') {
        qqPlotContainer.style.position = 'relative';
      }
      qqPlotContainer.appendChild(tooltip);
      // show tooltip
      const html = "SOMETHING";
      showTooltip(ev, tooltip, html);
    // }
  };

  return (
    <>
      <div className="row mt-3">
        <div className="col-md-12 text-center qq-plot" style={{position: 'relative'}}>
          {/* <div style={popupTooltipStyle} className="popup-tooltip shadow" id="qqplot-tooltip">
            <a href="/">{popupTooltipData ? popupTooltipData.phenotypeX : ''}</a>
            <br />
            <a href="/">{popupTooltipData ? popupTooltipData.phenotypeY : ''}</a>
            <br />
            <b>Correlation:</b> {popupTooltipData ? popupTooltipData.r2 : ''}
            <br />
          </div> */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center'
            }}>
            <Plot
              style={{ display: !loadingQQPlot ? 'block' : 'none' }}
              data={qqplotData}
              layout={qqplotLayout}
              config={config}
              onClick={e => popupMarkerClick(e)}
              onRelayout={relayout => {
                console.log("RELAYOUT");
                hideTooltip();
              }}
            />
          </div>
          <div
            className="text-center"
            style={{ display: loadingQQPlot ? 'block' : 'none' }}>
            <Spinner animation="border" variant="primary" role="status">
              <span className="sr-only">Loading...</span>
            </Spinner>
          </div>
        </div>
      </div>





      {/* <div className="row mt-3">
        {qqplotSrc && (
          <div className="col-md-12 text-center">
            <b>&lambda;</b> = {lambdaGC} <b className="ml-4">Sample Size</b> ={' '}
            {sampleSize}
          </div>
        )}
        <div className="col-md-12 text-center">
          <div
            className="qq-plot">
            <ReactCursorPosition
              {...{
                className: 'qq-plot-mouse-window',
                onPositionChanged: newPos => setPos(newPos)
              }}>
              {popupTooltipData && (
                <div style={popupTooltipStyle} className="popup-tooltip shadow">
                  <b>position:</b> {popupTooltipData.position}
                  <br />
                  <b>p-value:</b> {popupTooltipData['p-value']}
                  <br />
                  <b>snp:</b> {popupTooltipData.snp}
                  <br />
                  <Link
                    to="/gwas/lookup"
                    onClick={_ => onVariantLookup(popupTooltipData)}>
                    <b>Go to Variant Lookup</b>
                  </Link>
                </div>
              )}

              <div style={hoverTooltipStyle} className="hover-tooltip shadow">
                <b>p-value:</b> {hoverTooltipData['p-value']}
                <br />
                <b>snp:</b> {hoverTooltipData.snp}
              </div>

              {qqplotSrc && (
                <img
                  src={qqplotSrc}
                  draggable={false}
                  alt="QQ Plot"
                  useMap="#image-map"
                  onClick={e => popupMarkerClick(e)}
                />
              )}

              <map name="image-map">
                {areaItems.map(function(area) {
                  return (
                    <area
                      key={area.alt}
                      shape={area.shape}
                      coords={area.coords}
                      alt={area.alt}
                      // href="javascript:void(0);"
                      onClick={e => popupMarkerClick(e)}
                      onMouseEnter={e => hoverMarkerEnter(e)}
                      onMouseLeave={e => hoverMarkerLeave(e)}
                    />
                  );
                })}
              </map>
            </ReactCursorPosition>
          </div>
        </div>
      </div>

      <script>
        window.ReactCursorPosition = window.ReactCursorPosition.default;
      </script> */}
    </>
  );
}

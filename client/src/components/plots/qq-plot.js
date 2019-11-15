import React, { useState } from 'react';
// import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { updateSummaryResults } from '../../services/actions';
import { Link } from 'react-router-dom';
import { Spinner } from 'react-bootstrap';
import {
  viewportToLocalCoordinates,
  createElement as h 
} from '../../services/plots/utils';
import ReactCursorPosition from 'react-cursor-position';

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
    qqplotLayout,
  } = useSelector(state => state.summaryResults);

  // temporary set states
  const [hoverTooltipData, setHoverTooltipData] = useState({});

  const setPopupTooltipData = popupTooltipData => {
    dispatch(updateSummaryResults({ popupTooltipData }));
  };

  const [pos, setPos] = useState({
    position: {
      x: 0,
      y: 0
    }
  });

  const [hoverTooltipStyle, setHoverTooltipStyle] = useState({
    top: 0, // computed based on child and parent's height
    left: 0, // computed based on child and parent's width
    display: 'none'
  });

  const [popupTooltipStyle, setPopupTooltipStyle] = useState({
    top: 0, // computed based on child and parent's height
    left: 0, // computed based on child and parent's width
    display: 'none'
  });

  const popupMarkerClickOld = e => {
    // make sure action occurs on imagemap coord only
    if (e.target && e.target.coords) {
      var variant = e.target.alt.split(',');
      setPopupTooltipData({
        position: 'chr' + variant[0] + ':' + variant[1],
        // 'point_#': variant[0],
        'p-value': variant[3],
        snp: variant[2]
      });
      console.log(pos.position);
      setPopupTooltipStyle({
        ...popupTooltipStyle,
        top: pos.position.y, // computed based on child and parent's height
        left: pos.position.x + 15, // computed based on child and parent's width
        display: 'block'
      });
      hoverMarkerLeave();
    } else {
      popupMarkerClose();
    }
  };

  const popupMarkerClose = e => {
    setPopupTooltipStyle({
      ...popupTooltipStyle,
      display: 'none'
    });
    setPopupTooltipData(null);
  };

  const hoverMarkerEnter = e => {
    // make sure action occurs on imagemap coord only
    if (e.target && e.target.coords) {
      var variant = e.target.alt.split(',');
      // if (popupTooltipData && variant[0] !== popupTooltipData['point_#']) {
        setHoverTooltipData({
          'p-value': variant[3],
          snp: variant[2]
        });
        setHoverTooltipStyle({
          ...hoverTooltipStyle,
          top: pos.position.y, 
          left: pos.position.x + 15, 
          // top: pos.position.y - 70, // computed based on child and parent's height
          // left: pos.position.x - 45, // computed based on child and parent's width
          display: 'block'
        });
      // }
    } else {
      hoverMarkerLeave();
    }
  };

  const hoverMarkerLeave = e => {
    setHoverTooltipStyle({
      ...hoverTooltipStyle,
      display: 'none'
    });
    setHoverTooltipData({});
  };

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

    tooltip.innerHTML = '';
    tooltip.style.display = 'inline-block';
    if (html instanceof Element) {
      console.log("ELEMENT");
      tooltip.insertAdjacentElement('beforeend', html);
    } else  {
      console.log("HTML");
      tooltip.insertAdjacentHTML('beforeend', html);
    }

    const tooltipLeft = (x + 85) + 'px';
    const tooltipTop = (y + 105) + 'px';

    tooltip.style.left = tooltipLeft;
    tooltip.style.top = tooltipTop;
  }

  const hideTooltip = () => {
    // if tooltip already exists, destroy
    const elem = document.getElementsByClassName("qq-plot-tooltip");
    if (elem && elem.length > 0) {
      elem[0].remove();
    }
    // tooltip.style.display = 'none';
  }

  const popupMarkerClick = e => {
    console.log("E", e);
    const ev = e.event;
    console.log("EVENT", ev);
    const points = e.points;
    console.log("POINTS", points)
    if (e  && ev && points && points[0]) {
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
      const tooltipData = points[0].text;
      const html =
        h('div', { className: '' }, [
          h('div', null, [
            h('b', null, 'position: '),
            `${tooltipData.chr}:${tooltipData.bp}`
          ]),
          h('div', null, [h('b', null, 'p-value: '), `${tooltipData.p}`]),
          h('div', null, [h('b', null, 'snp: '), `${tooltipData.snp}`]),
          h('div', null, [
            h(
              'a',
              {
                className: 'font-weight-bold',
                href: '#/gwas/lookup',
                onclick: () => onVariantLookup && onVariantLookup(tooltipData)
              },
              'Go to Variant Lookup'
            )
          ])
        ]);
      showTooltip(ev, tooltip, html);
    }
  };

  // const showTooltip = (ev, data) => {
  //   setTooltipData(data);
  //   let { x, y } = viewportToLocalCoordinates(
  //     ev.clientX,
  //     ev.clientY,
  //     ev.target
  //   );
  //   const elem = document.getElementsByClassName("qq-plot-tooltip");
  //   if (elem && elem.length > 0) {
  //     const tooltip = elem[0];
  //     const tooltipLeft = (x + 260) + 'px';
  //     const tooltipTop = (y + 105) + 'px';
  //     tooltip.style.display = 'inline-block';
  //     tooltip.style.left = tooltipLeft;
  //     tooltip.style.top = tooltipTop;
  //   }
  // }

  // const hideTooltip = () => {
  //   // if tooltip already exists, hide
  //   const elem = document.getElementsByClassName("qq-plot-tooltip");
  //   if (elem && elem.length > 0) {
  //     setTooltipData(null);
  //   }
  // }

  // const popupMarkerClick = e => {
  //   console.log("E", e);
  //   const ev = e.event;
  //   console.log("EVENT", ev);
  //   const points = e.points;
  //   console.log("POINTS", points)
  //   if (e  && ev && points && points[0]) {
  //     hideTooltip();
  //     // add tooltip to qq-plot container
  //     const qqPlotContainer = document.getElementsByClassName("qq-plot")[0];
  //     const containerStyle = getComputedStyle(qqPlotContainer);
  //     if (containerStyle.position === 'static') {
  //       qqPlotContainer.style.position = 'relative';
  //     }
  //     // show tooltip
  //     const data = points[0].text;
  //     showTooltip(ev, data);
  //   }
  // };

  return (
    <>
      <div className="row mt-3">
        <div className="col-md-12 text-center">
          <div
            style={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              textAlign: 'left',
            }}>
            <Plot
              className="qq-plot"
              style={{ display: !loadingQQPlot ? 'block' : 'none', position: 'relative' }}
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





      <div className="row mt-3">
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
                    onClick={_ => {console.log("popupTooltipData", popupTooltipData);onVariantLookup(popupTooltipData)}}>
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
                  onClick={e => popupMarkerClickOld(e)}
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
                      onClick={e => popupMarkerClickOld(e)}
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
      </script>
    </>
  );
}

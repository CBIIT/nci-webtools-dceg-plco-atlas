import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { query } from '../../services/query';
import { updatePhenotypeCorrelations } from '../../services/actions';
import { Spinner, Button, ButtonGroup, ToggleButton } from 'react-bootstrap';
import Plot from 'react-plotly.js';
// import ReactCursorPosition from 'react-cursor-position';

export function Heatmap() {
  const dispatch = useDispatch();

  const {
    heatmapData,
    heatmapLayout,
    loading,
    popupTooltipData,
    popupTooltipStyle
  } = useSelector(state => state.phenotypeCorrelations);

  const setPopupTooltipData = popupTooltipData => {
    dispatch(updatePhenotypeCorrelations({ popupTooltipData }));
  };

  const setPopupTooltipStyle = popupTooltipStyle => {
    dispatch(updatePhenotypeCorrelations({ popupTooltipStyle }));
  }

  const popupMarkerClose = e => {
    setPopupTooltipStyle({
      top: 0, // computed based on child and parent's height
      left: 0, // computed based on child and parent's width
      display: 'none'
    });
    setPopupTooltipData(null);
  };

  const isPopupDisplayed = () => {
    var ele = document.getElementById("heatmap-tooltip");
    return ele.offsetWidth > 0 && ele.offsetHeight > 0;
  }

  const popupMarkerClick = e => {
    if (isPopupDisplayed()) {
      popupMarkerClose();
    } else {
      if (e && e.points && e.points[0]) {
        setPopupTooltipData({
          phenotypeX: e.points[0].x,
          phenotypeY: e.points[0].y,
          r2: e.points[0].text
        });
        // console.log(e.event);
        let x = e.event.offsetX;
        let y = e.event.offsetY;
        console.log(x, y);
        // console.log(pos.position);
        setPopupTooltipStyle({
          left: x + 65, // computed based on child and parent's width
          top: y, // computed based on child and parent's height
          display: 'block'
        });
      } else {
        popupMarkerClose();
      }
    }
  };

  const config = {
    toImageButtonOptions: {
      format: 'svg', // one of png, svg, jpeg, webp
      filename: 'custom_image',
      // height: 800,
      // width: 800,
      scale: 1 // Multiply title/legend/axis/canvas sizes by this factor
    },
    displaylogo: false
    // responsive: true
  };

  return (
    <>
      <div className="row">
        <div
          className="col-md-12"
          style={{
            display: heatmapData.length > 0 && !loading ? 'block' : 'none'
          }}>
          <div
            className="heatmap"
            style={{ display: loading ? 'none' : 'block' }}>
            {/* <ReactCursorPosition
              {...{
                className: 'heatmap-mouse-window',
                onPositionChanged: newPos => console.log(newPos.position)
                // onPositionChanged: newPos => setPos(newPos)
              }}> */}
            {/* {popupTooltipData && ( */}
              <div style={popupTooltipStyle} className="popup-tooltip shadow" id="heatmap-tooltip">
                <a href="/">{popupTooltipData ? popupTooltipData.phenotypeX : ''}</a>
                <br />
                <a href="/">{popupTooltipData ? popupTooltipData.phenotypeY : ''}</a>
                <br />
                <b>Correlation:</b> {popupTooltipData ? popupTooltipData.r2 : ''}
                <br />
              </div>
            {/* )} */}
            <div
              style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center'
              }}>
              <Plot
                data={heatmapData}
                layout={heatmapLayout}
                config={config}
                onClick={e => popupMarkerClick(e)}
                onRelayout={relayout => {
                  if (isPopupDisplayed()) {
                    popupMarkerClose();
                  }
                }}
              />
            </div>
            {/* </ReactCursorPosition> */}
          </div>
        </div>
        <div className="col-md-12">
          <div
            className="text-center"
            style={{ display: loading ? 'block' : 'none' }}>
            <Spinner animation="border" variant="primary" role="status">
              <span className="sr-only">Loading...</span>
            </Spinner>
          </div>
        </div>
      </div>
      {/* <script>
        window.ReactCursorPosition = window.ReactCursorPosition.default;
      </script> */}
    </>
  );
}

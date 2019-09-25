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
    plottedPhenotypes,
    heatmapData,
    loading,
    popupTooltipData
  } = useSelector(state => state.phenotypeCorrelations);

  const setPopupTooltipData = popupTooltipData => {
    dispatch(updatePhenotypeCorrelations({ popupTooltipData }));
  };

  const [popupTooltipStyle, setPopupTooltipStyle] = useState({
    top: 0, // computed based on child and parent's height
    left: 0, // computed based on child and parent's width
    display: 'none'
  });

  const [showTooltip, setShowTooltip] = useState(false);

  const popupMarkerClose = e => {
    setPopupTooltipStyle({
      ...popupTooltipStyle,
      display: 'none'
    });
    setPopupTooltipData(null);
    setShowTooltip(false);
  };

  const popupMarkerClick = e => {
    console.log(e);
    console.log("showTooltip", showTooltip);
    // make sure action occurs on imagemap coord only
    if (showTooltip) {
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
          ...popupTooltipStyle,
          left: x + 65, // computed based on child and parent's width
          top: y, // computed based on child and parent's height
          display: 'block'
        });
        setShowTooltip(true);
      } else {
        popupMarkerClose();
      }
    }
  };

  const layout = {
    width: 1000,
    height: 1000,
    margin: {
      t: 120
    },
    // title: 'Example Heatmap',
    xaxis: {
      automargin: true,
      // autorange: 'reversed',
      side: 'top',
      tickangle: -45,
      tickfont: {
        family: 'Arial',
        size: 10,
        color: 'black'
      },
      tickvals: plottedPhenotypes,
      ticktext: plottedPhenotypes.map(phenotype => phenotype.length > 20 ? phenotype.substring(0, 20) + "..." : phenotype),
      // dtick: 5,
    },
    yaxis: {
      automargin: true,
      autorange: 'reversed',
      tickangle: 'auto',
      tickfont: {
        family: 'Arial',
        size: 10,
        color: 'black'
      },
      tickvals: plottedPhenotypes,
      ticktext: plottedPhenotypes.map(phenotype => phenotype.length > 20 ? phenotype.substring(0, 20) + "..." : phenotype),
      // dtick: 5
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
            {popupTooltipData && (
              <div style={popupTooltipStyle} className="popup-tooltip shadow">
                {/* <button
                  type="button"
                  className="close popup-tooltip-close"
                  aria-label="Close"
                  onClick={popupMarkerClose}>
                  <span aria-hidden="true">&times;</span>
                </button> */}
                <b>Phenotype X:</b> <a href="/">{popupTooltipData.phenotypeX}</a>
                <br />
                <b>Phenotype Y:</b> <a href="/">{popupTooltipData.phenotypeY}</a>
                <br />
                <b>Correlation:</b> {popupTooltipData.r2}
                <br />
              </div>
            )}
            <div
              style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center'
              }}>
              <Plot
                data={heatmapData}
                layout={layout}
                config={config}
                onClick={e => popupMarkerClick(e)}
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

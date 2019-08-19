import React, { useEffect, useState, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { root, query } from '../../services/query';
import { updateSummaryResults } from '../../services/actions';

import ReactCursorPosition, { INTERACTIONS } from 'react-cursor-position';

export function QQPlot({ drawFunctionRef }) {
  const dispatch = useDispatch();
  const plotContainer = useRef(null);
  const summaryResults = useSelector(state => state.summaryResults);
  const { phenotype, loading, areaItems } = summaryResults;
  const [hoverTooltipData, setHoverTooltipData] = useState({});
  const [popupTooltipData, setPopupTooltipData] = useState({});
  const [pos, setPos] = useState({
    position: {
        x: 0,
        y: 0
    }
  });
  const [hoverTooltipStyle, setHoverTooltipStyle] = useState({
    position: 'absolute',
    top: 0,    // computed based on child and parent's height
    left: 0,  // computed based on child and parent's width
    display: "none"
  });
  const [popupTooltipStyle, setPopupTooltipStyle] = useState({
    position: 'absolute',
    top: 0,    // computed based on child and parent's height
    left: 0,  // computed based on child and parent's width
    display: "none"
  });

  const setLoading = loading => {
    dispatch(updateSummaryResults({loading}));
  }

  const setAreaItems = areaItems => {
    dispatch(updateSummaryResults({areaItems}));
  }

  useEffect(() => {
    if (drawFunctionRef)
      drawFunctionRef(drawQQPlot);
  }, [drawFunctionRef]);

  const drawQQPlot = async phenotype => {
    console.log(phenotype);
    setLoading(true);

    plotContainer.current.innerHTML = '';
    // add QQ plot image
    const qqImg = document.createElement('img');
    qqImg.src = root + '/data/qq-plots/' + phenotype + '.png';
    qqImg.draggable = false;
    qqImg.alt = 'QQ-plot of selected phenotype';
    qqImg.useMap = '#image-map';
    plotContainer.current.appendChild(qqImg);
    // load & add QQ plot image map
    const imageMapData = await query('data/qq-plots/' + phenotype + '.imagemap.json');
    if (!imageMapData.error)
      setAreaItems(imageMapData);
    setLoading(false);
  }

  const popupMarkerClick = (e) => {
    if (e.target && e.target.coords) {
      var variant = e.target.alt.split(',');
      setPopupTooltipData({
        'point_#': variant[0],
        "snp": variant[1],
        'p-value': variant[2]
      }); 
      setPopupTooltipStyle({
        ...popupTooltipStyle,
        top: pos.position.y - 75,    // computed based on child and parent's height
        left: pos.position.x - 50,  // computed based on child and parent's width
        display: "block"
      });
    } else {
      setPopupTooltipStyle({
        ...popupTooltipStyle,
        display: "none"
      });
    }
  }

  const popupMarkerClose = (e) => {
    setPopupTooltipStyle({
      ...popupTooltipStyle,
      display: "none"
    });
  }

  const hoverMarkerEnter = (e) => {
    if (e.target && e.target.coords) {
      var variant = e.target.alt.split(',');
      setHoverTooltipData({
        'point_#': variant[0],
        "snp": variant[1],
        'p-value': variant[2]
      }); 
      setHoverTooltipStyle({
        ...hoverTooltipStyle,
        top: pos.position.y - 60,    // computed based on child and parent's height
        left: pos.position.x - 45,  // computed based on child and parent's width
        display: "block"
      });
    } else {
      setHoverTooltipStyle({
        ...hoverTooltipStyle,
        display: "none"
      });
    }
  }

  const hoverMarkerLeave = (e) => {
    setHoverTooltipStyle({
      ...hoverTooltipStyle,
      display: "none"
    });
  }

  return (
    <>
      <div className="row mt-3">
        <div className="col-md-12 text-center">

          <ReactCursorPosition {...{
              className: "qq-plot-mouse-window",
              // activationInteractionMouse: INTERACTIONS.CLICK,
              onPositionChanged: newPos => setPos(newPos)
            }}>

            <div style={hoverTooltipStyle} className="hover-tooltip shadow">
              SNP: {hoverTooltipData.snp}
              <br/>
              P-Value: {hoverTooltipData["p-value"]}
            </div>

            <div style={popupTooltipStyle} className="popup-tooltip shadow">
            <button type="button" className="close popup-tooltip-close" aria-label="Close" onClick={popupMarkerClose}>
              <span aria-hidden="true">&times;</span>
            </button>
              id: {popupTooltipData["point_#"]}
              <br/>
              SNP: <a href="/">{popupTooltipData.snp}</a>
              <br/>
              P-Value: {popupTooltipData["p-value"]}
            </div>

            <div ref={plotContainer} className="qq-plot" onClick={e => popupMarkerClick(e)} />
            <map name="image-map">
              {areaItems.map(function(area) {
                return (
                  <area
                    shape={area.shape}
                    coords={area.coords}
                    alt={area.alt}
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

      <script>
        window.ReactCursorPosition = window.ReactCursorPosition.default;
      </script>
    </>
  );

}

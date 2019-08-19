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
  const [debugQuery, setDebugQuery] = useState({});
  const [pos, setPos] = useState({
    position: {
        x: 0,
        y: 0
    }
  });
  const [popupStyle, setPopupStyle] = useState({
    position: 'absolute',
    top: 0,    // computed based on child and parent's height
    left: 0,  // computed based on child and parent's width
    border: '1px solid #ccc',
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
    qqImg.alt = 'QQ-plot of selected trait';
    qqImg.useMap = '#image-map';
    plotContainer.current.appendChild(qqImg);
    // load & add QQ plot image map
    const imageMapData = await query('data/qq-plots/' + phenotype + '.imagemap.json');
    if (!imageMapData.error)
      setAreaItems(imageMapData);
    setLoading(false);
  }

  const clickMarker = (e) => {
    if (e.target) {
      var variant = e.target.alt.split(',');
      setDebugQuery({
        'point_#': variant[0],
        "snp": variant[1],
        'p-value': variant[2]
      }); 
      setPopupStyle({
        ...popupStyle,
        top: pos.position.y + 5,    // computed based on child and parent's height
        left: pos.position.x,  // computed based on child and parent's width
        display: "block"
      });
    } else {
      setPopupStyle({
        ...popupStyle,
        display: "none"
      });
    }
  }

  const hoverMarkerEnter = (e) => {
    if (e.target) {
      var variant = e.target.alt.split(',');
      setDebugQuery({
        'point_#': variant[0],
        "snp": variant[1],
        'p-value': variant[2]
      }); 
      setPopupStyle({
        ...popupStyle,
        top: pos.position.y + 5,    // computed based on child and parent's height
        left: pos.position.x,  // computed based on child and parent's width
        display: "block"
      });
    } else {
      setPopupStyle({
        ...popupStyle,
        display: "none"
      });
    }
  }

  const hoverMarkerLeave = (e) => {
    console.log("LEAVE");
    setPopupStyle({
      ...popupStyle,
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

            <div style={popupStyle} className="p-3 text-left bg-white">
              {`x: ${pos.position.x}`}<br />
              {`y: ${pos.position.y}`}<br />
              <pre>{JSON.stringify(debugQuery, null, 2)}</pre>
            </div>

            <div ref={plotContainer} className="qq-plot" />
            <map name="image-map">
              {areaItems.map(function(area) {
                return (
                  <area
                    shape={area.shape}
                    coords={area.coords}
                    alt={area.alt}
                    onClick={e => clickMarker(e)}
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

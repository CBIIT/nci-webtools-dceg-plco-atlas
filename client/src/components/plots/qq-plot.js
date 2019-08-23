import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { root, query } from '../../services/query';
import { updateSummaryResults } from '../../services/actions';
import { Link } from 'react-router-dom';
import { Spinner } from 'react-bootstrap';
import ReactCursorPosition from 'react-cursor-position';

export function QQPlot({ drawFunctionRef, onVariantLookup }) {
  const dispatch = useDispatch();
  const summaryResults = useSelector(state => state.summaryResults);
  // const { phenotype, loading, areaItems } = summaryResults;
  const {
    phenotype,
    selectedPhenotype,
    selectedChromosome,
    loading,
    qqplotSrc,
    areaItems
  } = useSelector(state => state.summaryResults);
  const setLoading = loading => {
    dispatch(updateSummaryResults({loading}));
  }

  const setQQplotSrc = qqplotSrc => {
    dispatch(updateSummaryResults({qqplotSrc}));
  }

  const setAreaItems = areaItems => {
    dispatch(updateSummaryResults({areaItems}));
  }

  // temporary set states
  const [hoverTooltipData, setHoverTooltipData] = useState({});
  const [popupTooltipData, setPopupTooltipData] = useState({});
  const [pos, setPos] = useState({
    position: {
        x: 0,
        y: 0
    }
  });
  const [hoverTooltipStyle, setHoverTooltipStyle] = useState({
    top: 0,    // computed based on child and parent's height
    left: 0,  // computed based on child and parent's width
    display: "none"
  });
  const [popupTooltipStyle, setPopupTooltipStyle] = useState({
    top: 0,    // computed based on child and parent's height
    left: 0,  // computed based on child and parent's width
    display: "none"
  });

  useEffect(() => {
    if (drawFunctionRef)
      drawFunctionRef(drawQQPlot);
  }, [drawFunctionRef]);

  const drawQQPlot = async (phenotype) => {
    setLoading(true);
    setQQplotSrc('data/qq-plots/' + phenotype + '.png');
    const imageMapData = await query('data/qq-plots/' + phenotype + '.imagemap.json');
    if (!imageMapData.error)
      setAreaItems(imageMapData);
    setLoading(false);
  }

  const popupMarkerClick = (e) => {
    // make sure action occurs on imagemap coord only
    if (e.target && e.target.coords) {
      var variant = e.target.alt.split(',');
      setPopupTooltipData({
        'point_#': variant[0],
        "snp": variant[1],
        'p-value': variant[2]
      }); 
      setPopupTooltipStyle({
        ...popupTooltipStyle,
        top: pos.position.y,    // computed based on child and parent's height
        left: pos.position.x + 15,  // computed based on child and parent's width
        display: "block"
      });
      hoverMarkerLeave();
    } else {
      popupMarkerClose();
    }
  }

  const popupMarkerClose = (e) => {
    setPopupTooltipStyle({
      ...popupTooltipStyle,
      display: "none"
    });
    setPopupTooltipData({});
  }

  const hoverMarkerEnter = (e) => {
    // make sure action occurs on imagemap coord only
    if (e.target && e.target.coords) {
      var variant = e.target.alt.split(',');
      if (popupTooltipData && variant[0] !== popupTooltipData['point_#']) {
        setHoverTooltipData({
          'point_#': variant[0],
          "snp": variant[1],
          'p-value': variant[2]
        }); 
        setHoverTooltipStyle({
          ...hoverTooltipStyle,
          top: pos.position.y - 70,    // computed based on child and parent's height
          left: pos.position.x - 45,  // computed based on child and parent's width
          display: "block"
        });
      }
    } else {
      hoverMarkerLeave();
    }
  }

  const hoverMarkerLeave = (e) => {
    setHoverTooltipStyle({
      ...hoverTooltipStyle,
      display: "none"
    });
    setHoverTooltipData({});
  }

  return (
    <>
      <div className="row mt-3">
        <div className="col-md-12 text-center">
          <div className="qq-plot" style={{display: loading ? 'none' : 'block'}}>
            <ReactCursorPosition {...{
                className: "qq-plot-mouse-window",
                onPositionChanged: newPos => setPos(newPos)
              }}>

              <div style={popupTooltipStyle} className="popup-tooltip shadow">
                <button type="button" className="close popup-tooltip-close" aria-label="Close" onClick={popupMarkerClose}>
                  <span aria-hidden="true">&times;</span>
                </button>
                <b>id:</b> {popupTooltipData["point_#"]}
                <br/>
                <b>snp:</b> {popupTooltipData.snp}
                <br/>
                <b>p-value:</b> {popupTooltipData["p-value"]}
                <br/>
                <Link to='/gwas/lookup' onClick={_ => onVariantLookup(popupTooltipData)}><b>Go to Variant Lookup</b></Link>
              </div>

              <div style={hoverTooltipStyle} className="hover-tooltip shadow">
                <b>snp:</b> {hoverTooltipData.snp}
                <br/>
                <b>p-value:</b> {hoverTooltipData["p-value"]}
              </div>

              {qqplotSrc && <img src={qqplotSrc} draggable={false} alt="QQ Plot" useMap="#image-map" onClick={e => popupMarkerClick(e)}/>}
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
          <div className="text-center" style={{display: loading ? 'block' : 'none'}}>
            <Spinner animation="border" variant="primary"  role="status">
              <span className="sr-only">Loading...</span>
            </Spinner>
          </div>
        </div>
      </div>

      <script>
        window.ReactCursorPosition = window.ReactCursorPosition.default;
      </script>
    </>
  );

}

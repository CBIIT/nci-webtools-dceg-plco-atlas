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

  const clickPoint = (e) => {
    var variant = e.target.alt.split(',');
    setDebugQuery({
      'point_#': variant[0],
      "snp": variant[1],
      'p-value': variant[2]
    }); 
  }

  const PositionLabel = (props) => {
    const {
      detectedEnvironment: {
        isMouseDetected = false,
        isTouchDetected = false
      } = {},
      elementDimensions: {
        width = 0,
        height = 0
      } = {},
      isActive = false,
      isPositionOutside = false,
      position: {
        x = 0,
        y = 0
      } = {}
    } = props;

    const styles = {
      position: 'absolute',
      top: y + 5,    // computed based on child and parent's height
      left: x,  // computed based on child and parent's width
      border: '1px solid #ccc'
    };

    return (
      <>
        <div style={styles} className="p-3 text-left bg-white">
          {`x: ${x}`}<br />
          {`y: ${y}`}<br />
          <pre>{JSON.stringify(debugQuery, null, 2)}</pre>
        </div>
        {/* <div className="example__label">
          {`x: ${x}`}<br />
          {`y: ${y}`}<br />
          {`width:: ${width}`}<br />
          {`height: ${height}`}<br />
          {`isActive: ${isActive}`}<br />
          {`isPositionOutside: ${isPositionOutside ? 'true' : 'false'}`}<br />
          {`isMouseDetected: ${isMouseDetected ? 'true' : 'false'}`}<br />
          {`isTouchDetected: ${isTouchDetected ? 'true' : 'false'}`}
        </div> */}
      </>
    );
  };

  PositionLabel.defaultProps = {
      shouldShowIsActive: true
  };

  return (
    <>
      <div className="row mt-3">
        <div className="col-md-12 text-center">

          <ReactCursorPosition
            className="qq-plot-mouse-window"
            activationInteractionMouse={INTERACTIONS.CLICK}>

            <PositionLabel />

            <div ref={plotContainer} className="qq-plot" />
            <map name="image-map">
              {areaItems.map(function(area) {
                return (
                  <area
                    shape={area.shape}
                    coords={area.coords}
                    alt={area.alt}
                    onClick={e => clickPoint(e)}
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

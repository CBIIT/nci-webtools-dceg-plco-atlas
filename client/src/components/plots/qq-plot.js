import React, { useEffect, useState, useRef } from 'react';
import { query } from '../../services/query';
import ReactCursorPosition, { INTERACTIONS } from 'react-cursor-position';

export function QQPlot({ trait }) {
  const plotContainer = useRef(null);
  const [timestamp, setTimestamp] = useState(0);
  const [loading, setLoading] = useState(false);
  const [params, setParams] = useState({
    database: 'example'
  });
  const [debugQuery, setDebugQuery] = useState({});

  const [areaItems, setAreaItems] = useState([{}]);

  useEffect(() => {
    if (trait) loadQQPlot();
  }, [trait]);

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
      border: '1px solid #ccc',
      // background: 'white'
    };

    return (
      <>
        <div style={styles} className="p-3 text-left">
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
      <div className="row">
        <div className="col-md-12 text-right">
          {timestamp ? <strong className="mx-2">{timestamp} s</strong> : null}
          <div className="btn-group" role="group" aria-label="Basic example">
            <button
              className="btn btn-primary btn-sm"
              onClick={e => loadQQPlot()}
              disabled={loading}>
              Reset
            </button>
          </div>
        </div>
      </div>

      <div className="row">
        <div className="col-md-12 text-left">
          {/* <pre>{JSON.stringify(debugQuery, null, 2)}</pre> */}
        </div>
        <div className="col-md-12 text-left">
          {/* <PositionLabel /> */}
        </div>
      </div>

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

  async function loadQQPlot() {
    let start = new Date();
    let getTimestamp = e => (new Date() - start) / 1000;
    setLoading(true);
    setTimestamp(0);

    plotContainer.current.innerHTML = '';
    // add QQ plot image
    const qqImg = document.createElement('img');
    qqImg.src = 'assets/images/qq-plots/example.png';
    qqImg.alt = 'QQ-plot of selected trait';
    qqImg.useMap = '#image-map';
    plotContainer.current.appendChild(qqImg);
    // load & add QQ plot image map
    const imageMapData = await query('imagemapqq', params);
    setAreaItems(imageMapData.data);

    setLoading(false);
    setTimestamp(getTimestamp());
  }

  function clickPoint(e) {
    var variant = e.target.alt.split(',');
    setDebugQuery({
      'point_#': variant[0],
      snp: variant[1],
      'p-value': variant[2],
      nlog_p: variant[3]
    });
  }
}

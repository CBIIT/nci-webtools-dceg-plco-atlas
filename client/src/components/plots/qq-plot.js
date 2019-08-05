import React, { useEffect, useState, useRef } from 'react';
import { query } from '../../services/query';

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

  return (
    <>
      <div className="row">
        <div class="col-md-12 text-right">
          {timestamp ? <strong class="mx-2">{timestamp} s</strong> : null}
          <div class="btn-group" role="group" aria-label="Basic example">
            <button
              className="btn btn-primary btn-sm"
              onClick={e => loadQQPlot()}
              disabled={loading}>
              Reset
            </button>
          </div>
        </div>
      </div>

      <div className="row mt-3">
<<<<<<< HEAD
        <div class="col-md-12 text-center">
          <pre>{ JSON.stringify(debugQuery, null, 2) }</pre>
=======
        <div class="col-md-12 text-left">
          <pre>{JSON.stringify(debugQuery, null, 2)}</pre>
>>>>>>> master
        </div>
      </div>

      <div className="row">
        <div className="col-md-12 text-center">
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
        </div>
      </div>
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

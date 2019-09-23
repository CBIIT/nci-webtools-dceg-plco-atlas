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
    // selectedListType,
    // selectedPhenotypes,
    // results,
    heatmapData,
    loading,
    popupTooltipData
    // submitted
  } = useSelector(state => state.phenotypeCorrelations);

  const setLoading = loading => {
    dispatch(updatePhenotypeCorrelations({ loading }));
  };

  const setHeatmapData = heatmapData => {
    dispatch(updatePhenotypeCorrelations({ heatmapData }));
  };

  const [numPhenotypes, setNumPhenotypes] = useState(2);

  const setPopupTooltipData = popupTooltipData => {
    dispatch(updatePhenotypeCorrelations({ popupTooltipData }));
  };

  const [popupTooltipStyle, setPopupTooltipStyle] = useState({
    top: 0, // computed based on child and parent's height
    left: 0, // computed based on child and parent's width
    display: 'none'
  });

  // const [pos, setPos] = useState({
  //   position: {
  //     x: 0,
  //     y: 0
  //   }
  // });

  const popupMarkerClose = e => {
    setPopupTooltipStyle({
      ...popupTooltipStyle,
      display: 'none'
    });
    setPopupTooltipData(null);
  };

  const popupMarkerClick = e => {
    console.log(e);
    // make sure action occurs on imagemap coord only
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
        // top: pos.position.y, // computed based on child and parent's height
        // left: pos.position.x + 15, // computed based on child and parent's width
        display: 'block'
      });
    } else {
      popupMarkerClose();
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
      // title: 'Phenotypes',
      side: 'top',
      tickangle: -45,
      tickfont: {
        family: 'Arial',
        size: 10,
        color: 'black'
      }
      // dtick: 5,
    },
    yaxis: {
      automargin: true,
      // title: 'Phenotypes',
      tickangle: 'auto',
      tickfont: {
        family: 'Arial',
        size: 10,
        color: 'black'
      }
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

  const stringScore = (stringX, stringY) => {
    var sum = 0;
    for (var x = 0; x < stringX.length; x++) {
      sum += stringX.charCodeAt(x);
    }
    for (var y = 0; y < stringY.length; y++) {
      sum -= stringY.charCodeAt(y);
    }
    return Math.abs(sum);
  };

  const generateData = () => {
    setLoading(true);
    setPopupTooltipData(null);
    let n = numPhenotypes;
    let x = [];
    let y = [];
    let z = [];
    for (var i = 1; i <= n; i++) {
      let pheno =
        i +
        ' ' +
        Math.random()
          .toString(36)
          .substring(2, 6);
      x.push(pheno);
      y.unshift(pheno);
    }
    for (var xidx = 0; xidx < n; xidx++) {
      let row = [];
      for (var yidx = 0; yidx < n; yidx++) {
        if (x[xidx] === y[yidx]) {
          row.push(0.0);
        } else {
          row.push(stringScore(x[xidx], y[yidx]));
        }
      }
      z.push(row);
    }
    let randomData = {
      x,
      y,
      z,
      xgap: 1,
      ygap: 1,
      type: 'heatmap',
      colorscale: [
        ['0.0', 'rgb(255,255,255)'],
        ['0.444444444444', 'rgb(255,0,0)'],
        ['0.5', 'rgb(255,255,255)'],
        ['1.0', 'rgb(0,0,255)']
      ],
      showscale: false,
      hoverinfo: 'x+y',
      hovertemplate:
        '<br><b>Phenotype X</b>: %{x}<br>' +
        '<b>Phenotype Y</b>: %{y}<br>' +
        '<b>Correlation</b>: %{z}' +
        '<extra></extra>'
    };
    setHeatmapData([randomData]);
    setLoading(false);
  };

  const getZColor = (phenotype1, phenotype2, correlationData) => {
    var r2 = 0.0;
    // for (var i = 0; i < correlationData.length; i++) {
    //   if ((correlationData[i][0] === phenotype1 && correlationData[i][2] === phenotype2) ||
    //       (correlationData[i][0] === phenotype2 && correlationData[i][2] === phenotype1)) {
    //     r2 = correlationData[i][4];
    //     break;
    //   }
    // }
    // if (phenotype2 in correlationData[phenotype1]) {
    //   r2 = correlationData[phenotype1][phenotype2];
    // } else {
    //   r2 = correlationData[phenotype2][phenotype1];
    // }

    if (r2 === -1.0 || r2 === 1.0) {
      r2 = 0.0;
    }

    return r2;
  };

  const getZText = (phenotype1, phenotype2, correlationData) => {
    var r2 = 0.0;
    // for (var i = 0; i < correlationData.length; i++) {
    //   if ((correlationData[i][0] === phenotype1 && correlationData[i][2] === phenotype2) ||
    //       (correlationData[i][0] === phenotype2 && correlationData[i][2] === phenotype1)) {
    //     r2 = correlationData[i][4];
    //     break;
    //   }
    // }

    return r2;
  };

  const distinct = (val, idx, self) => {
    return self.indexOf(val) === idx;
  }

  const loadSamplePhenotypes = async () => {
    setLoading(true);
    setPopupTooltipData(null);

    const correlationData = await query(`data/sample_correlations_sanitized.json`);
    console.log("correlationData", correlationData.data);
    let uniquePhenotypes = correlationData.data.map(item => item[0])
    uniquePhenotypes = uniquePhenotypes.filter(distinct);
    console.log("uniquePhenotypes", uniquePhenotypes);
    // let uniquePhenotypes = Object.keys(correlationData);
    // uniquePhenotypes = uniquePhenotypes.slice(4, 9);
    let x = [];
    let y = [];
    let zColor = [];
    let zText = [];

    for (var i = 0; i < uniquePhenotypes.length; i++) {
      x.push(uniquePhenotypes[i]);
      y.unshift(uniquePhenotypes[i]);
    }

    for (var xidx = 0; xidx < x.length; xidx++) {
      let rowColor = [];
      let rowText = [];
      for (var yidx = 0; yidx < y.length; yidx++) {
        rowColor.unshift(getZColor(x[xidx], y[yidx], correlationData.data));
        rowText.unshift(getZText(x[xidx], y[yidx], correlationData.data));
      }
      zColor.unshift(rowColor);
      zText.unshift(rowText);
    }

    let sampleData = {
      x,
      y,
      z: zColor,
      zmin: -1.0,
      zmax: 1.0,
      text: zText,
      xgap: 1,
      ygap: 1,
      type: 'heatmap',
      colorscale: [
        ['0.0', 'rgb(0,0,255)'],
        ['0.5', 'rgb(255,255,255)'],
        ['1.0', 'rgb(255,0,0)']
      ],
      showscale: false,
      hoverinfo: 'x+y',
      hovertemplate:
        '<br><b>Phenotype X</b>: %{x}<br>' +
        '<b>Phenotype Y</b>: %{y}<br>' +
        // '<b>Color</b>: %{z}<br>' +
        '<b>Correlation</b>: %{text}' +
        '<extra></extra>'
    };
    setHeatmapData([sampleData]);
    setLoading(false);
  };

  return (
    <>
      <div className="row">
        <div className="col-md-12 py-3">
          <ButtonGroup
            toggle
            className="ml-3"
            onChange={e => setNumPhenotypes(e.target.value)}>
            <ToggleButton type="radio" name="radio" defaultChecked value="2">
              2
            </ToggleButton>
            <ToggleButton type="radio" name="radio" value="50">
              50
            </ToggleButton>
            <ToggleButton type="radio" name="radio" value="100">
              100
            </ToggleButton>
            <ToggleButton type="radio" name="radio" value="400">
              400
            </ToggleButton>
          </ButtonGroup>
          <Button className="ml-3" onClick={generateData}>
            Generate Sample Data
          </Button>
          <Button className="ml-3" onClick={loadSamplePhenotypes}>
            Load Sample Phenotypes
          </Button>
        </div>
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

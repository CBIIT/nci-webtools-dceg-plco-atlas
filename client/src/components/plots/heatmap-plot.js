import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { root, query } from '../../services/query';
import { updatePhenotypeCorrelations } from '../../services/actions';
import { Spinner, Button, ButtonGroup, ToggleButton } from 'react-bootstrap';

import Plot from 'react-plotly.js';

export function Heatmap({ drawFunctionRef }) {
  const dispatch = useDispatch();

  const {
    selectedListType,
    selectedPhenotypes,
    results,
    loading,
    submitted
  } = useSelector(state => state.phenotypeCorrelations);

  const setLoading = loading => {
    dispatch(updatePhenotypeCorrelations({loading}));
  };

  const [data, setData] = useState([]);
  const [numPhenotypes, setNumPhenotypes] = useState(2);

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
  }

  const generateData = () => {
    setLoading(true);
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
      type: 'heatmap',
      colorscale: [
        ['0.0', 'rgb(255,255,255)'],
        ['0.111111111111', 'rgb(255,178,178)'],
        ['0.222222222222', 'rgb(255,127,127)'],
        ['0.333333333333', 'rgb(255,50,50)'],
        ['0.444444444444', 'rgb(255,0,0)'],
        ['0.555555555556', 'rgb(255,255,255)'],
        ['0.666666666667', 'rgb(178,178,255)'],
        ['0.777777777778', 'rgb(127,127,255)'],
        ['0.888888888889', 'rgb(50,50,255)'],
        ['1.0', 'rgb(0,0,255)']
      ],
      showscale: false,
      hoverinfo:"x+y",
      hovertemplate: '<br><b>Phenotype X</b>: %{x}<br>' +
                      '<b>Phenotype Y</b>: %{y}<br>' +
                      '<b>Correlation</b>: %{z}' +
                      '<extra></extra>'
                      
    };
    setData([randomData]);
    setLoading(false);
  };

  return (
    <div className="row">
      <div className="col-md-12 py-3">
        <ButtonGroup toggle className="ml-3" onChange={e => setNumPhenotypes(e.target.value)}>
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
          Generate sample data
        </Button>
      </div>
      <div
        className="col-md-12"
        style={{ display: data.length > 0 ? 'block' : 'none' }}>
        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center'
          }}>
          <Plot data={data} layout={layout} config={config} />
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
  );
}

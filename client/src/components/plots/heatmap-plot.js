import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { root, query } from '../../services/query';
import { updatePhenotypeCorrelations } from '../../services/actions';
import { Spinner } from 'react-bootstrap';
// import Plot from 'react-plotly.js';


export function Heatmap({ drawFunctionRef }) {
  const dispatch = useDispatch();

  const {
    selectedListType,
    selectedPhenotypes,
    results,
    loading,
    submitted,
  } = useSelector(state => state.phenotypeCorrelations);

  const setLoading = loading => {
    dispatch(updatePhenotypeCorrelations({loading}));
  }

  return (
    <>
      heatmap
      {/* <Plot
        data={[
          {
            x: [1, 2, 3],
            y: [2, 6, 3],
            type: 'scatter',
            mode: 'lines+points',
            marker: {color: 'red'},
          },
          {type: 'bar', x: [1, 2, 3], y: [2, 5, 3]},
        ]}
        layout={ {width: 320, height: 240, title: 'A Fancy Plot'} }
      />; */}
    </>
  );

}

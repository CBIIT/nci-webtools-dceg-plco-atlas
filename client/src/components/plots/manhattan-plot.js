import React, { useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { rawQuery, query } from '../../services/query';
import { createElement as h } from '../../services/plots/utils';
import { ManhattanPlot as Plot } from '../../services/plots/manhattan-plot';
import { updateSummaryResults } from '../../services/actions';
import { Spinner } from 'react-bootstrap';

export function ManhattanPlot({ onChromosomeSelected, onVariantLookup, onZoom }) {
  const plotContainer = useRef(null);
  const {
    selectedManhattanPlotType,
    selectedPhenotype,
    selectedChromosome,
    loading,
    ranges,
  } = useSelector(state => state.summaryResults);

  useEffect(() => {
    let manhattanPlot = drawPlot(plotContainer.current);
    return () => manhattanPlot.destroy();
  })

  function drawPlot(container) {
    if (!container || !ranges) return false;
  }

  return (
    <>
      <div
        ref={plotContainer}
        className="manhattan-plot"
        style={{ display: loading ? 'none' : 'block' }}
      />
      <div
        className="text-center"
        style={{ display: loading ? 'block' : 'none' }}>
        <Spinner animation="border" variant="primary" role="status">
          <span className="sr-only">Loading...</span>
        </Spinner>
      </div>
    </>
  );
}

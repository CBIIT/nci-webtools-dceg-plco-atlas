import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { root, query } from '../../services/query';
import { updatePhenotypeCorrelations } from '../../services/actions';
import { Spinner } from 'react-bootstrap';

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
    </>
  );

}

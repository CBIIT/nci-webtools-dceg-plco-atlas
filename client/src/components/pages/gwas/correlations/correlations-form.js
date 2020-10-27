import React, { useState, useRef, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Button } from 'react-bootstrap';
import { TreeSelect } from '../../../controls/tree-select/tree-select';
import { updatePhenotypeCorrelations } from '../../../../services/actions';

export function PhenotypeCorrelationsForm({
  selectedPhenotypes = [],
  selectedAncestry = '',
  selectedSex = '',
  onSubmit = any => {},
  onReset = any => {}
}) {
  const treeRef = useRef();

  // select store members
  const dispatch = useDispatch();
  const phenotypes = useSelector(state => state.phenotypes);
  const messages = useSelector(state => state.phenotypeCorrelations.messages);
  const setMessages = messages => dispatch(updatePhenotypeCorrelations({ messages }));
  const clearMessages = _ => setMessages([]);

  // private members prefixed with _
  const [_selectedPhenotypes, _setSelectedPhenotypes] = useState([]);
  const [_selectedAncestry, _setSelectedAncestry] = useState('');
  const [_selectedSex, _setSelectedSex] = useState('');

  useEffect(() => {
    _setSelectedPhenotypes(selectedPhenotypes);
    _setSelectedAncestry(selectedAncestry);
    _setSelectedSex(selectedSex);
  }, [selectedPhenotypes, selectedAncestry, selectedSex]);

  function handleReset(ev) {
    console.log(ev);
    ev.preventDefault();
    treeRef.current.resetSearchFilter();
    _setSelectedPhenotypes([]);
    _setSelectedAncestry('');
    _setSelectedSex('');
    clearMessages();
    onReset();
  }

  function handleSubmit(ev) {
    ev.preventDefault();
    clearMessages();

    if (_selectedPhenotypes.length < 2) {
      setMessages([{type: 'danger', content: 'Please select 2 or more phenotypes.'}])
    } else if (!_selectedPhenotypes.length || !_selectedAncestry || !_selectedSex) {
      setMessages([{type: 'danger', content: 'Please select phenotype(s) and corresponding ancestry/sex'}])
    } else {
      onSubmit({
        phenotypes: _selectedPhenotypes,
        ancestry: _selectedAncestry,
        sex: _selectedSex
      });
    }
  }

  return (
    <form onSubmit={handleSubmit} onReset={handleReset}>
      <div className="form-group">
        <label className="required">Phenotypes</label>
        <TreeSelect
          data={phenotypes.tree}
          value={_selectedPhenotypes}
          onChange={ev => _setSelectedPhenotypes(ev)}
          ref={treeRef}
          enabled={item => item.import_date}
          limit={120}
        />
        <small className="text-muted">Up to 120 phenotypes may be selected.</small>
      </div>

      <div className="form-group">
        <label className="required" htmlFor="correlations-form-ancestry">Ancestry</label>
        <select 
          id="correlations-form-ancestry" 
          className="form-control" 
          value={_selectedAncestry}
          onChange={ev => _setSelectedAncestry(ev.target.value)}>
          <option value="" hidden>Select Ancestry</option>
          <option value="east_asian">East Asian</option>
          <option value="european">European</option>
        </select>
      </div>

      <div className="form-group">
        <label className="required" htmlFor="correlations-form-sex">Sex</label>
        <select 
          id="correlations-form-sex" 
          className="form-control" 
          value={_selectedSex}
          onChange={ev => _setSelectedSex(ev.target.value)}>
          <option value="" hidden>Select Sex</option>
          <option value="all">All</option>
          <option value="female">Female</option>
          <option value="male">Male</option>
        </select>
      </div>

      {messages.map(({ type, content }, i) => (
        <div 
          key={`correlations-form-message-${i}`} 
          className={`small my-3 text-${type}`}>
          {content}
        </div>
      ))}
      <div>
        <Button type="submit" variant="silver">
          Submit
        </Button>

        <Button type="reset" className="ml-2" variant="silver">
          Reset
        </Button>
      </div>
    </form>
  );
}

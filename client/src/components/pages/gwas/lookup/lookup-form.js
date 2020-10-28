import React, { useState, useRef, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Button } from 'react-bootstrap';
import { TreeSelect } from '../../../controls/tree-select/tree-select';
import { updatePhenotypeCorrelations } from '../../../../services/actions';

export function VariantLookupForm({
  selectedPhenotypes = [],
  selectedVariant = '',
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
  const [_selectedVariant, _setSelectedVariant] = useState('');
  const [_selectedAncestry, _setSelectedAncestry] = useState('');
  const [_selectedSex, _setSelectedSex] = useState('');

  useEffect(() => {
    _setSelectedPhenotypes(selectedPhenotypes);
    _setSelectedVariant(selectedVariant);
    _setSelectedAncestry(selectedAncestry);
    _setSelectedSex(selectedSex);
  }, [selectedPhenotypes, selectedVariant, selectedAncestry, selectedSex]);

  function handleReset(ev) {
    // console.log(ev);
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
    
    if (!_selectedPhenotypes.length || !_selectedAncestry || !_selectedSex) {
      setMessages([{type: 'danger', content: 'Please select phenotype(s) and corresponding ancestry/sex'}])
    } else if (!_selectedVariant.length) {
      setMessages([{type: 'danger', content: 'Please specify variants to search for'}])
    } else {
      onSubmit({
        phenotypes: _selectedPhenotypes,
        variant: _selectedVariant,
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
        />
      </div>
      
      <div className="form-group">
        <label className="required" htmlFor="lookup-form-variant">Variants</label>
        <textarea
          id="lookup-form-variant" 
          className="form-control"
          placeholder="Enter RS Numbers"
          value={_selectedVariant}
          onChange={ev => _setSelectedVariant(ev.target.value)}
        />
      </div>

      <div className="form-group">
        <label className="required" htmlFor="lookup-form-ancestry">Ancestry</label>
        <select 
          id="lookup-form-ancestry" 
          className="form-control" 
          value={_selectedAncestry}
          onChange={ev => _setSelectedAncestry(ev.target.value)}>
          <option value="" hidden>Select Ancestry</option>
          <option value="east_asian">East Asian</option>
          <option value="european">European</option>
        </select>
      </div>

      <div className="form-group">
        <label className="required" htmlFor="lookup-form-sex">Sex</label>
        <select 
          id="lookup-form-sex" 
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
          key={`lookup-form-message-${i}`} 
          className={`small my-3 text-${type}`}>
          {content}
        </div>
      ))}
      <div>
        <Button type="submit" variant="silver" >
          Submit
        </Button>

        <Button type="reset" className="ml-2" variant="silver">
          Reset
        </Button>
      </div>
    </form>
  );
}

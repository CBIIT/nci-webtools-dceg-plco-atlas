import React, { useState, useRef } from 'react';
import { useSelector } from 'react-redux';
import { Button, OverlayTrigger, Tooltip } from 'react-bootstrap';
import { TreeSelect } from '../../../controls/tree-select/tree-select';
import { asTitleCase } from './utils';
// import Select, { components } from 'react-select';

export function SummaryResultsForm({
  selectedPhenotypes = [],
  selectedStratifications = [],
  isPairwise = false,
  onSubmit = any => { },
  onReset = any => { }
}) {
  // in order to prevent updating the redux store until after the form has
  // been submitted, we should store the state in the component, and then emit
  // this state on submit or reset, allowing the handler to update the store

  const treeRef = useRef();

  // select store members
  const phenotypes = useSelector(state => state.phenotypes);
  const { submitted } = useSelector(state => state.summaryResults);

  // private members prefixed with _
  const [_selectedPhenotypes, _setSelectedPhenotypes] = useState(selectedPhenotypes);
  const [_selectedStratifications, _setSelectedStratifications] = useState(selectedStratifications.map(s => `${s.ancestry}__${s.sex}`));
  const [_isPairwise, _setIsPairwise] = useState(isPairwise);
  const [_isModified, _setIsModified] = useState(false);

  // stratification options can always be recalculated
  const [stratificationOptions, setStratificationOptions] = useState(getStratificationOptions(_selectedPhenotypes, _isPairwise));

  const isValid = _selectedPhenotypes[0]
    && _selectedStratifications[0]
    && (!_isPairwise || (_isPairwise && _selectedStratifications[1]));

  const showPhenotypesLabels = _isPairwise && _selectedPhenotypes[1];

  /**
   * Retrieves stratification option groups for each phenotype supplied
   * If isPairwise is passed in, and the second phenotype is not defined the first
   * phenotype will be used for both sets of options
   * @param {*} phenotypes 
   */
  function getStratificationOptions(selectedPhenotypes, isPairwise) {
    if (!phenotypes || !phenotypes.metadata) return [];
    const stratificationGroups = [];

    for (const phenotype of selectedPhenotypes) {
      const stratifications = [];
      phenotypes.metadata.filter(item =>
        item.phenotype_id === phenotype.id &&
        item.chromosome === 'all' &&
        item.count > 0 &&
        item.sex != 'stacked'
      ).forEach(({ sex, ancestry }) => {
        let stratification = stratifications.find(s => s.ancestry === ancestry) || {
          label: asTitleCase(ancestry),
          options: [],
          ancestry,
        };

        stratification.options.push({
          label: asTitleCase(`${ancestry} - ${sex}`),
          value: `${ancestry}__${sex}`
        });

        if (!stratifications.includes(stratification)) {
          stratifications.push(stratification);
        }
      })
      stratificationGroups.push(stratifications);
    }

    // if only one phenotype is selected, both option groups will have the same options
    if (isPairwise && !stratificationGroups[1]) {
      stratificationGroups[1] = stratificationGroups[0];
    }

    return stratificationGroups;
  }

  function mergeSelectedStratification(index, value) {
    const selectedStratifications = [..._selectedStratifications];
    selectedStratifications[index] = value;
    _setSelectedStratifications(selectedStratifications);
    _setIsModified(true);
  }

  function setSelectedPhenotypesAndOptions(selectedPhenotypes, pairwise) {
    if (pairwise === undefined) pairwise = _isPairwise;
    selectedPhenotypes = selectedPhenotypes.slice(0, pairwise ? 2 : 1);
    setStratificationOptions(getStratificationOptions(selectedPhenotypes, pairwise));
    _setSelectedPhenotypes(selectedPhenotypes);
    _setSelectedStratifications(['', '']);
    _setIsPairwise(pairwise);
    _setIsModified(true);
  }

  function handleReset(ev) {
    ev.preventDefault();
    _setSelectedPhenotypes([]);
    _setSelectedStratifications([]);
    _setIsPairwise(false);
    onReset();
  }

  function handleSubmit(ev) {
    ev.preventDefault();
    _setIsModified(false);
    onSubmit({
      isPairwise: _isPairwise,
      phenotypes: _selectedPhenotypes,
      stratifications: _selectedStratifications
        .filter(s => s.length)
        .map(s => {
          const [ancestry, sex] = s.split('__')
          return { ancestry, sex };
        }),
    });
  }

  return (
    <>
      {/* <pre>{JSON.stringify({ _selectedPhenotypes, _selectedStratifications }, null, 2)}</pre> */}
      <div className="mb-2">
        <div className="d-flex justify-content-between">
          <label className="required">Phenotypes</label>
          <div className="custom-control custom-checkbox">
            <input
              type="checkbox"
              className="custom-control-input"
              id="is-pairwise"
              checked={_isPairwise}
              onChange={e => setSelectedPhenotypesAndOptions(_selectedPhenotypes, e.target.checked)}
            />
            <label className="custom-control-label" htmlFor="is-pairwise">Pairwise Plots</label>
          </div>
        </div>

        <TreeSelect
          data={phenotypes}
          value={_selectedPhenotypes}
          onChange={setSelectedPhenotypesAndOptions}
          ref={treeRef}
        />
      </div>


      {(_isPairwise ? [0, 1] : [0]).map(i => stratificationOptions[i]).map((optionGroup, i) =>
        <div className="mb-3" key={`stratification-option-group-${i}`}>
          <label htmlFor={`summary-results-stratification-${i}`} className="required">
            Ancestry/Sex {showPhenotypesLabels && `for ${_selectedPhenotypes[i].display_name}`}
          </label>
          <select
            id={`summary-results-stratification-${i}`}
            className="form-control"
            value={_selectedStratifications[i]}
            onChange={e => mergeSelectedStratification(i, e.target.value)}
            disabled={!optionGroup || optionGroup.length === 0}>
            <option value="" hidden>Select Ancestry/Sex</option>
            {optionGroup && optionGroup.map(e => <optgroup key={`${i}-${e.label}`} label={e.label}>
              {e.options.map(o => <option key={`${i}-${e.label}-${o.value}`} value={o.value}>{o.label}</option>)}
            </optgroup>)}
          </select>
        </div>)}

      {/* Todo: replace selects with react-select if needed
        <Select 
          id="summary-results-stratification" 
          options={existingStratifications} 
          components={{ Option }}
          value={_stratification}
          onChange={item => {
            _setStratification(item);
            dispatch(updateSummaryResults({ disableSubmit: false }));
          }}
          placeholder={"Select a Stratification"}
          isDisabled={existingStratifications.length === 0}
        /> */}

      <div>
        <OverlayTrigger
          overlay={isValid ? <span /> : <Tooltip id="submit-summary-results">
            Please select phenotype(s) and/or stratification(s).
            </Tooltip>}>
          <span className={!isValid ? 'c-not-allowed' : undefined}>
            <Button
              type="submit"
              variant="silver"
              className={!isValid ? 'pointer-events-none' : undefined}
              disabled={!isValid || (!_isModified && submitted)}
              onClick={handleSubmit}>
              Submit
            </Button>
          </span>
        </OverlayTrigger>

        <Button
          className="ml-2"
          variant="silver"
          onClick={handleReset}>
          Reset
        </Button>
      </div>
    </>
  );
}

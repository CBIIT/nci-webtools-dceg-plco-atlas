import React, { useState, useEffect } from 'react';

/*

              placeholder="(Select one or more traits) *"
              value={selectedPhenotypes}
              onChange={setSelectedPhenotypes}
              isOptionDisabled={(option) => option.value === null}
              options={selectedListType === 'categorical' ?
                categorizePhenotypes(phenotypes) :
                alphabetizePhenotypes(phenotypes)}
              isMulti
*/

export function Select({
  className,
  optionClassName,
  onChange,
  value: valueProp,
  options: optionsProp,
  isOptionDisabled,
  placeholder,
  multiple
}) {
  const selectOptions = [];
  const [value, setValue] = useState(null);
  const [options, setOptions] = useState([]);

  const updateValue = val => {
    if (multiple) val = Array.isArray(value) ? value.concat(val) : [val];
    setValue(val);
    onChange(val);
  };

  useEffect(() => {
    updateValue(valueProp);
  }, [valueProp]);

  useEffect(() => {
    setOptions(optionsProp);
  }, [optionsProp]);

  const optionList = [];

  return (
    <div className={className}>
      {options.map((label, value) => {
        return (
          <div
            className={optionClassName}
            onClick={e => updateValue(option.value)}>
            {option.label}
          </div>
        );
      })}
    </div>
  );
}

import React, {useState, useEffect} from 'react';

export function ButtonGroup({
    name = 'button-group',
    options = [], 
    value = null, 
    onChange = v => {}, 
    size = '', 
    disabled = false,
    activeClass = 'btn-primary btn-primary-gradient active', 
    inactiveClass = 'btn-silver'}) {

    // use internal state to enable use as both a controlled/uncontrolled component
    const [_value, _setValue] = useState(null);
    useEffect(() => _setValue(value), [value, options]);

    const handleChange = value => {
        _setValue(value);
        onChange && onChange(value);
    };

    return (
        <div className="btn-group" role="group">
            {options.map((option, index) => 
                <label
                    key={`label-buttongroup-${index}-${option.value}`}
                    className={[
                        'btn',
                        'c-pointer',
                        disabled ? 'disabled' : '',
                        ['lg', 'sm'].includes(size) ? `btn-${size}` : ``,
                        option.value === _value ? activeClass : inactiveClass,
                    ].join(' ')}>
                    <input 
                        key={`input-buttongroup-${index}-${option.value}`}
                        disabled={disabled}
                        className="sr-only"
                        type="radio" 
                        name={name} 
                        value={option.value}
                        checked={option.value === _value}
                        onChange={_ => handleChange(option.value)}
                    />
                    {option.label}
                </label>)}
        </div>
    );
}
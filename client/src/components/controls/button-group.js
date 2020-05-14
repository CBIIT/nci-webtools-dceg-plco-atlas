import React, {useState, useEffect} from 'react';

export function ButtonGroup({
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
            {options.map(option => 
                <button
                    disabled={disabled}
                    className={[
                        'btn',
                        ['lg', 'sm'].includes(size) ? `btn-${size}` : ``,
                        option.value === _value ? activeClass : inactiveClass,
                    ].join(' ')}
                    onClick={_ => handleChange(option.value)}>
                    {option.label}
                </button>)}
        </div>
    );
}
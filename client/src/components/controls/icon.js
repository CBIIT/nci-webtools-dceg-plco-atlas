import React from 'react';

const icons = [
    'angle-down',
    'angle-left',
    'angle-right',
    'angle-up',
    'exclamation-circle',
    'sort',
    'sort-down',
    'sort-up',
];

const iconSrc = name => `assets/icons/${name}.svg`

export function Icon(props) {
    let { name } = props;

    if (!icons.includes(name)) {
        name = 'exclamation-circle';
    }

    return <img
        src={iconSrc(name)}
        width="10"
        {...props} />;
}
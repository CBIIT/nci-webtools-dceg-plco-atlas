import React from 'react';

export const Icon = props => (
    <img
        src={`assets/icons/${props.name}.svg`}
        width="10"
        {...props} />
);
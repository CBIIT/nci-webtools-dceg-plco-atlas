import React from 'react';

const iconDefaults = {
  path: 'assets/icons/',
  width: 10,
};

export const Icon = props => (
  <img src={`${props.path || iconDefaults.path}${props.name}.svg`} width={iconDefaults.width} {...props} />
);

import React from 'react';
import SwaggerUI from '../../controls/swagger-ui/swagger-ui'

export function ApiAccess() {

  return (
    <div className="mt-3 container bg-white tab-pane-bordered rounded-0 p-4">
      <h1 className="font-weight-light">API Access</h1>
      <hr />
      <SwaggerUI />
    </div>
  );

}

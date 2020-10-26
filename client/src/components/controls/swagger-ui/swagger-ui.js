import React, { useEffect } from 'react';
import SwaggerUi, { presets } from 'swagger-ui';
import 'swagger-ui/dist/swagger-ui.css';

export const SwaggerUI = ({spec}) => {

    useEffect(() => {
        SwaggerUi({
            dom_id: '#swaggerContainer',
            spec: spec,
            presets: [presets.apis],
        });
    });

    return (
        <div id="swaggerContainer" />
    );
}
import React, { useEffect } from 'react';
import SwaggerUi, { presets } from 'swagger-ui';
import 'swagger-ui/dist/swagger-ui.css';

function patchAccessibility(container) {
    container.querySelectorAll('.curl-command .copy-to-clipboard button').forEach(btn => {
        if (!btn.getAttribute('aria-label')) {
            btn.setAttribute('aria-label', 'Copy to clipboard');
        }
    });
    container.querySelectorAll('textarea.body-param__text').forEach(textarea => {
        if (!textarea.getAttribute('aria-label')) {
            textarea.setAttribute('aria-label', 'Request body');
        }
    });
}

export const SwaggerUI = ({spec}) => {

    useEffect(() => {
        SwaggerUi({
            dom_id: '#swaggerContainer',
            spec: spec,
            presets: [presets.apis],
        });

        const container = document.getElementById('swaggerContainer');
        const observer = new MutationObserver(() => patchAccessibility(container));
        observer.observe(container, { childList: true, subtree: true });
        return () => observer.disconnect();
    });

    return (
        <div id="swaggerContainer" />
    );
}
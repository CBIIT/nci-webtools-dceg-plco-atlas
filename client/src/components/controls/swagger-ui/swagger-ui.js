import React, { useEffect } from 'react';
import SwaggerUi, { presets } from 'swagger-ui';
import 'swagger-ui/dist/swagger-ui.css';

function patchAccessibility(container) {
    container.querySelectorAll('.copy-to-clipboard button').forEach(btn => {
        if (!btn.getAttribute('aria-label')) {
            btn.setAttribute('aria-label', 'Copy to clipboard');
        }
        if (!btn.getAttribute('title')) {
            btn.setAttribute('title', 'Copy to clipboard');
        }
    });
    container.querySelectorAll('textarea.body-param__text').forEach(textarea => {
        if (!textarea.getAttribute('aria-label')) {
            textarea.setAttribute('aria-label', 'Request body');
        }
    });
    container.querySelectorAll('.parameters-col_description select').forEach(select => {
        const row = select.closest('tr');
        const paramName = row?.getAttribute('data-param-name');
        const visibleName = row?.querySelector('.parameters-col_name .parameter__name')?.textContent?.trim();
        const labelSource = visibleName || paramName || 'parameter';
        const readableName = labelSource
            .replace(/^_+/, '')
            .replace(/[_-]+/g, ' ')
            .trim();
        const label = `Parameter ${readableName || 'value'}`;

        if (!select.getAttribute('aria-label')) {
            select.setAttribute('aria-label', label);
        }
        if (!select.getAttribute('title')) {
            select.setAttribute('title', label);
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
        patchAccessibility(container);
        const observer = new MutationObserver(() => patchAccessibility(container));
        observer.observe(container, { childList: true, subtree: true });
        return () => observer.disconnect();
    });

    return (
        <div id="swaggerContainer" />
    );
}
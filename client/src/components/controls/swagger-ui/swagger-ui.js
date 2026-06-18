import React, { useEffect } from 'react';
import SwaggerUi, { presets } from 'swagger-ui';
import 'swagger-ui/dist/swagger-ui.css';

// Swagger UI generates its own DOM, which ships with several Section 508 / WCAG
// gaps: copy-to-clipboard / request-body controls and parameter <select>
// elements without an accessible name, occasional icon-only buttons without
// discernible text, and scrollable code/example blocks that cannot receive
// keyboard focus. patchAccessibility() repairs these after Swagger renders (and
// again whenever it re-renders, e.g. when an operation is expanded or "Try it
// out" is toggled). It only adds attributes to elements that lack them, so it is
// safe to run repeatedly.
function patchAccessibility(root) {
    if (!root) return;

    // Copy-to-clipboard icon buttons.
    root.querySelectorAll('.copy-to-clipboard button').forEach((btn) => {
        if (!btn.getAttribute('aria-label')) btn.setAttribute('aria-label', 'Copy to clipboard');
        if (!btn.getAttribute('title')) btn.setAttribute('title', 'Copy to clipboard');
    });

    // Request-body textareas.
    root.querySelectorAll('textarea.body-param__text').forEach((textarea) => {
        if (!textarea.getAttribute('aria-label')) textarea.setAttribute('aria-label', 'Request body');
    });

    // Give every <select> an accessible name, derived from its parameter name.
    root.querySelectorAll('select:not([aria-label])').forEach((select) => {
        const row = select.closest('tr');
        const paramAttr = row && row.getAttribute('data-param-name');
        const nameEl = row && row.querySelector('.parameter__name');
        const visibleName = nameEl ? nameEl.textContent.replace('*', '').trim() : '';
        const labelSource = visibleName || paramAttr || 'parameter';
        const readableName = labelSource.replace(/^_+/, '').replace(/[_-]+/g, ' ').trim();
        const label = `Parameter ${readableName || 'value'}`;
        select.setAttribute('aria-label', label);
        if (!select.getAttribute('title')) select.setAttribute('title', label);
    });

    // Ensure remaining icon-only buttons expose discernible text.
    root.querySelectorAll('button:not([aria-label])').forEach((btn) => {
        if (btn.textContent.trim() || btn.getAttribute('title')) return;
        const cls = btn.className || '';
        let label = 'Button';
        if (cls.includes('expand-operation')) label = 'Expand operation';
        else if (cls.includes('authorize')) label = 'Authorize';
        else if (cls.includes('copy')) label = 'Copy to clipboard';
        else if (cls.includes('model-toggle')) label = 'Toggle model example';
        btn.setAttribute('aria-label', label);
    });

    // Make scrollable code / example blocks keyboard accessible.
    root.querySelectorAll('.highlight-code, .microlight, pre').forEach((el) => {
        if (el.hasAttribute('tabindex')) return;
        el.setAttribute('tabindex', '0');
        el.setAttribute('role', 'region');
        if (!el.getAttribute('aria-label')) el.setAttribute('aria-label', 'Code sample');
    });
}

export const SwaggerUI = ({ spec }) => {
    useEffect(() => {
        const container = document.getElementById('swaggerContainer');

        SwaggerUi({
            dom_id: '#swaggerContainer',
            spec: spec,
            presets: [presets.apis],
            onComplete: () => patchAccessibility(container),
        });

        // Swagger re-renders portions of its DOM on interaction (expanding an
        // operation surfaces the parameter selects, etc.), so re-apply the patch
        // on mutations. The patch only adds attributes to elements that lack
        // them, so it never triggers itself into a loop.
        let frame;
        const observer = new MutationObserver(() => {
            cancelAnimationFrame(frame);
            frame = requestAnimationFrame(() => patchAccessibility(container));
        });
        if (container) {
            observer.observe(container, { childList: true, subtree: true });
        }

        return () => {
            cancelAnimationFrame(frame);
            observer.disconnect();
        };
    });

    return <div id="swaggerContainer" />;
};

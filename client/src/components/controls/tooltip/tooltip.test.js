import React from 'react';
import { Provider } from 'react-redux';
import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom/extend-expect'
import { Tooltip } from './tooltip';


describe('Tooltip Module', function () {
    test('Tooltip renders correctly', () => {
        const tooltipContent = 'Test';
        render(<Tooltip visible closeButton>{tooltipContent}</Tooltip>)

        // expect tooltip to be visible
        expect(screen.getByTestId('Tooltip')).toBeVisible();

        // expect close button to be visible
        expect(screen.getByTestId('TooltipCloseButton')).toBeVisible();

        // expect tooltip to contain supplied text
        expect(screen.getByTestId('Tooltip')).toHaveTextContent(tooltipContent);
    });
});
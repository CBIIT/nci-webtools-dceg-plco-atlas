import React from 'react';
import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom/extend-expect'
import { ButtonGroup } from './button-group';

describe('ButtonGroup Module', function () {
    test('ButtonGroup renders correctly', () => {
        const value = 'a';
        const options = [
            {label: 'a', value: 'a'},
            {label: 'b', value: 'b'},
            {label: 'c', value: 'c'},
        ];
        const labelTestId = value => `buttongroup-label-${value}`;
        const inputTestId = value => `buttongroup-input-${value}`;
        
        render(<ButtonGroup value={value} options={options} />);
        
        // expect all buttons to be rendered correctly
        for (let option of options) {
            let label = screen.queryByTestId(labelTestId(option.value));
            let input = screen.queryByTestId(inputTestId(option.value));

            expect(label).toContainElement(input);
            expect(label).toHaveTextContent(option.label);
            expect(input).toHaveAttribute('value', option.value);
        }

        // expect the correct option to be selected
        expect(screen.queryByTestId(inputTestId(value))).toBeChecked();
    });
});
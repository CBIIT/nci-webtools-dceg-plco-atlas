import React from 'react';
import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom/extend-expect'
import { Icon } from './icon';

describe('Icon Module', function () {
    test('Icon renders correctly', () => {
        const props = {name: 'test', alt: 'test'};
        render(<Icon {...props} />)
        for (let [key, value] of Object.entries(props))
            expect(screen.getByTestId('Icon')).toHaveAttribute(key, value);
    });
});
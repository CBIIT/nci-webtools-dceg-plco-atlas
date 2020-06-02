import React from 'react';
import { createStore } from 'redux';
import { Provider } from 'react-redux';
import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom/extend-expect'
import { ErrorModal } from './error-modal';

describe('ErrorModal Module', function () {
    test('ErrorModal renders correctly', () => {
        const errorState = {visible: true, message: 'Sample Message'};
        const store = createStore(e => e, {error: errorState});

        // render error modal using provided store
        render(<Provider store={store}><ErrorModal /></Provider>)

        // expect error modal to be visible
        expect(screen.getByTestId('ErrorModal')).toBeVisible();

        // expect error modal to contain supplied message
        expect(screen.getByTestId('ErrorModalMessage')).toHaveTextContent(errorState.message);
    });
});
import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import { LoadingOverlay } from './loading-overlay';

describe('LoadingOverlay Module', function() {
  test('LoadingOverlay renders correctly', () => {
    const props = { active: true, content: 'Test' };
    render(<LoadingOverlay {...props} />);

    // expect loading overlay to be visible
    expect(screen.getByTestId('LoadingOverlay')).toBeVisible();

    // expect loader to contain supplied text
    expect(screen.getByTestId('DefaultLoader')).toHaveTextContent(
      props.content
    );
  });
});

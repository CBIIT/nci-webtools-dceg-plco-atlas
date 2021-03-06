import React from 'react';
import { Provider } from 'react-redux';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import { getStore } from '../../../services/store';
import { ShareLink } from './share-link';

describe('ShareLink Module', function() {
  test('ShareLink renders correctly', async () => {
    // render share-link using default store
    render(
      <Provider store={await getStore(true)}>
        <ShareLink />
      </Provider>
    );

    // expect loading overlay to be visible
    expect(screen.getByTestId('ShareLinkButton')).toBeVisible();

    // expect loader to contain supplied text
    expect(screen.getByTestId('ShareLinkButton')).toHaveTextContent(
      'Share Link'
    );
  });
});

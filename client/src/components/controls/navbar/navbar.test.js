import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import { HashRouter } from 'react-router-dom';
import { Navbar } from './navbar';

describe('Navbar Module', function() {
  test('Navbar renders correctly', () => {
    const route = 'example';
    const expectedRoute = `#/${route}`;
    const title = 'Example';
    const links = [{ route, title }];
    render(
      <HashRouter>
        <Navbar links={links} />
      </HashRouter>
    );
    screen.getAllByText(title).map(item => {
      expect(item).toHaveAttribute('href', expectedRoute);
    })
  });
});

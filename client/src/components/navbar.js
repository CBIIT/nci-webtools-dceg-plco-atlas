import React from 'react';
import { NavLink } from 'react-router-dom';

export function Navbar({ links }) {
  return (
    <div className="bg-primary text-white shadow-sm">
      <div className="container">
        {[{ route: '/', title: 'Home', exact: true }]
          .concat(links)
          .sort((a, b) => a.navIndex - b.navIndex)
          .map(({ route, title, exact }) => (
            <>
              <NavLink
                key={title}
                className="navlinks text-white py-2 px-4 d-inline-block "
                style={{ fontWeight: 600 }}
                activeClassName="active-navlinks"
                exact={exact}
                to={route}>
                {title}
              </NavLink>
              <div className="d-md-none w-100"></div>
            </>
          ))}
        {/* <pre>{JSON.stringify(links)}</pre> */}
      </div>
    </div>
  );
}

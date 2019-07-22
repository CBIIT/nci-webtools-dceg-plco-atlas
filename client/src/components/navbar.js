import React from 'react';
import { NavLink } from 'react-router-dom';

export function Navbar({ links }) {
  return (
    <div className="bg-primary text-white">
      <div className="container">
        {[{route: '/', title: 'Home', exact: true}]
          .concat(links)
          .sort((a, b) => a.navIndex - b.navIndex)
          .map(({ route, title, exact }) => (
            <NavLink className="navlinks text-white mr-3 py-1 px-3 d-inline-block" activeClassName="active-navlinks" exact={exact} to={route}>
              {title}
            </NavLink>
          ))}
        {/* <pre>{JSON.stringify(links)}</pre> */}
      </div>
    </div>
  );
}

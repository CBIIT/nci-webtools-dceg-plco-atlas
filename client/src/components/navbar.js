import React from 'react';
import { Link } from 'react-router-dom';

export function Navbar({ links }) {
  return (
    <div className="bg-primary text-white">
      <div className="container py-1">
        {/* <h1 className="h5 m-0">
          PLCO Aggregation Prototype
        </h1> */}
        <Link className="text-white mr-3" to="/">
          Home
        </Link>
        {[]
          .concat(links)
          .sort((a, b) => a.navIndex - b.navIndex)
          .map(({ route, title }) => (
            <Link className="text-white ml-3 mr-3" to={route}>
              {title}
            </Link>
          ))}
        {/* <pre>{JSON.stringify(links)}</pre> */}
      </div>
    </div>
  );
}

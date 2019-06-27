import React from 'react';
import { Link } from 'react-router-dom';

export function Navbar() {
  return (
    <div className="bg-primary text-white">
      <div className="container py-1">
        <h1 className="h5 m-0">
          <Link className="text-white" to="/">
            PLCO Atlas
          </Link>
        </h1>
      </div>
    </div>
  );
}

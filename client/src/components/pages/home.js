import React from 'react';
import { Link } from 'react-router-dom';

export function Home() {
  const links = [
    {
      route: '/about',
      title: 'About'
    },
    {
      route: '/search/gwas',
      title: 'GWAS'
    },
    {
      route: '/search/phenotypes',
      title: 'Phenotypes'
    },
    {
      route: '/downloads',
      title: 'Downloads'
    }
  ];

  return (
    <div className="container py-4">
      <div className="text-center">
        <h1 className="font-weight-light">
          <div className="h4">WELCOME TO</div>
          PLCO ATLAS
        </h1>
        <p>
          Simplifying GWAS for the Prostate, Lung, Colorectal and Ovarian Cancer
          Screening Trial
        </p>
        <div className="text-center">
          {links.map(({ exact, route, title }, index) => (
            <Link
              className="btn btn-primary m-2"
              exact={exact}
              key={index}
              to={route}>
              {title}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

import React, { useState } from 'react';
import { HashRouter as Router, Route } from 'react-router-dom';
import { Navbar } from './controls/navbar/navbar';
import { Home } from './pages/home/home';
import { About } from './pages/about/about';
import { Api } from './pages/api/api';
import { Gwas } from './pages/gwas/gwas';
import { Phenotypes } from './pages/phenotypes/phenotypes';
import { Downloads } from './pages/downloads/downloads';
import { LinkWrapper } from './pages/link/link-wrapper';
import { ErrorModal } from './controls/error-modal/error-modal';

function App() {
  const links = [
    {
      route: '/about',
      title: 'About',
      // cardTitle: 'About',
      image: 'assets/images/about.svg',
      navIndex: 4
    },
    {
      route: '/api-access',
      title: 'API Access',
      // cardTitle: 'API Access',
      image: 'assets/images/about.svg',
      navIndex: 3
    },
    {
      route: '/gwas',
      action: 'Explore',
      title: 'GWAS',
      cardTitle: 'GWAS Results',
      cardText:
        'Visualize genome-wide association results with dynamic Manhattan plots and tables',
      image: 'assets/images/gwas.svg',
      navIndex: 0
    },
    {
      route: '/phenotypes',
      action: 'Browse',
      title: 'Phenotypes',
      cardTitle: 'Phenotype Characteristics',
      cardText:
        'Browse trait and case definitions, descriptive characteristics and genetic correlations',
      image: 'assets/images/phenotypes.svg',
      navIndex: 1
    },
    {
      route: '/downloads',
      action: 'Download',
      title: 'Data',
      cardTitle: 'Access Data',
      cardText:
        'Download files of genome-wide association study estimates and summary statistics',
      image: 'assets/images/downloads.svg',
      navIndex: 2
    },
    {
      route: '/link'
    }
  ];

  return (
    <Router>
      <ErrorModal />
      <Navbar links={links} />
      <Route path="/" exact={true} render={_ => <Home links={links} />} />
      <Route path="/about" component={About} />
      <Route path="/api-access" component={Api} />
      <Route path="/gwas" component={Gwas} />
      <Route path="/phenotypes" component={Phenotypes} />
      <Route path="/downloads" component={Downloads} />
      <Route path="/link/:shareID?" component={LinkWrapper} />
    </Router>
  );
}

export default App;

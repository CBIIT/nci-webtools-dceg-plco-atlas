import React, { useState } from 'react';
import { HashRouter as Router, Route } from 'react-router-dom';
import { Navbar } from './navbar';
import { Home } from './pages/home';
import { About } from './pages/about';
import { Gwas } from './pages/gwas';
import { Phenotypes } from './pages/phenotypes';
import { Downloads } from './pages/downloads';

function App() {
  const [params, setParams] = useState({ trait: 'example' });

  const links = [
    {
      route: '/about',
      title: 'About',
      image: 'assets/images/about.svg',
      navIndex: 3
    },
    {
      route: '/gwas',
      title: 'GWAS',
      image: 'assets/images/gwas.svg',
      navIndex: 0
    },
    {
      route: '/phenotypes',
      title: 'Phenotypes',
      image: 'assets/images/phenotypes.svg',
      navIndex: 1
    },
    {
      route: '/downloads',
      title: 'Downloads',
      image: 'assets/images/downloads.svg',
      navIndex: 2
    }
  ];

  return (
    <Router>
      <Navbar links={links} />
      <Route path="/" exact={true} render={_ => <Home links={links} />} />
      <Route path="/about" component={About} />
      {/* <Route path="/search/:searchType" component={Search} /> */}
      <Route
        path="/gwas"
        render={_ => <Gwas params={params} setParams={setParams} />}
      />
      <Route
        path="/phenotypes"
        render={_ => <Phenotypes params={params} setParams={setParams} />}
      />
      <Route path="/downloads" component={Downloads} />
      {/* <Redirect to="/search/gwas" /> */}
    </Router>
  );
}

export default App;

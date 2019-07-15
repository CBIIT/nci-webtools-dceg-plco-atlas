import React from 'react';
import { HashRouter as Router, Redirect, Route } from 'react-router-dom';
import { Navbar } from './navbar';
import { Home } from './pages/home';
import { About } from './pages/about';
import { Search } from './pages/search';
import { Downloads } from './pages/downloads';

function App() {
  const links = [
    {
      route: '/about',
      title: 'About',
      image: 'assets/images/about-icon.svg',
      navIndex: 3
    },
    {
      route: '/search/gwas',
      title: 'GWAS',
      image: 'assets/images/gwas-icon.svg',
      navIndex: 0
    },
    {
      route: '/search/phenotypes',
      title: 'Phenotypes',
      image: 'assets/images/phenotypes-icon.svg',
      navIndex: 1
    },
    {
      route: '/downloads',
      title: 'Downloads',
      image: 'assets/images/downloads-icon.svg',
      navIndex: 2
    }
  ];

  return (
    <Router >
      <Navbar links={links} />
      <div className="my-4">
        <Route path="/" exact={true} render={_ => <Home links={links} /> } />
        <Route path="/about" component={About} />
        <Route path="/search/:searchType" component={Search} />
        <Route path="/downloads" component={Downloads} />
        {/* <Redirect to="/search/gwas" /> */}
      </div>
    </Router>
  );
}

export default App;

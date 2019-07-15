import React from 'react';
import { Link } from 'react-router-dom';
import Card from 'react-bootstrap/Card';
import { CardDeck } from 'react-bootstrap';

export function Home({links}) {
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

        <div className="video-banner" style={{width: 100}}>
          <video muted="" autoplay="autoplay" loop="loop" width="640" height="480">
            <source src="assets/images/plco-banner.mp4" type="video/mp4" />
          </video>
        </div>

        <div className="text-center">
          <CardDeck>
            {links.map(({ exact, route, title, image }, index) => (
              <Card style={{ width: '18rem', justifyContent: 'center', alignItems: 'center' }} border="white">
                <Card.Img variant="top" src={image} style={{width: 160, height: 160}} />
                <Card.Body>
                  <Card.Title>
                    <h3>{title}</h3>
                  </Card.Title>
                  <Card.Text>
                    Summary text here...
                  </Card.Text>
                  <Link
                    className="stretched-link"
                    exact={exact}
                    key={index}
                    to={route}>
                  </Link>
                </Card.Body>
              </Card>
            ))}
          </CardDeck>
        </div>
      </div>
    </div>
  );
}

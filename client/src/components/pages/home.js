import React from 'react';
import { Link } from 'react-router-dom';
import Card from 'react-bootstrap/Card';
import { CardDeck, Button } from 'react-bootstrap';

export function Home({ links }) {
  return (
    <>
      <div className="container video-banner-container text-center d-none d-md-block">
        <video id="video-banner" autoPlay muted loop>
          <source src="assets/images/plco-banner.mp4" type="video/mp4" />
        </video>
        <div className="video-banner-overlay-text row justify-content-center text-center text-light w-75">
          <div className="col-12">
            <h1 className="text-light">
              <b>PLCO ATLAS</b>
            </h1>
          </div>
          <div className="col-6 w-50 my-3 align-self-center" style={{borderTop: '2px solid orange'}}></div>
          <div className="col-12 text-center mt-2" style={{width: '100%', fontSize: '14pt'}}>
            Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor 
            incididunt ut labore et dolore magna aliqua. Quam lacus suspendisse faucibus interdum 
            posuere lorem ipsum. Integer malesuada nunc vel risus commodo viverra maecenas accumsan lacus. 
          </div>
          <div className="col-12 text-center mt-5" style={{width: '100%', fontSize: '14pt'}}>
            <Button className="mr-5 px-4" style={{backgroundColor: '#F2711D', border: 'none'}}>Link</Button>
            <Button className="px-4" style={{backgroundColor: '#01BDD4', border: 'none'}}>Link</Button>
          </div>
        </div>
      </div>

      <div className="text-center mt-2 d-md-none">
        <h1 className="text-dark">
          <b>PLCO ATLAS</b>
        </h1>
        <hr className="w-75"></hr>
        <div className="px-3 text-center">
          Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor 
          incididunt ut labore et dolore magna aliqua. Quam lacus suspendisse faucibus interdum 
          posuere lorem ipsum. Integer malesuada nunc vel risus commodo viverra maecenas accumsan lacus. 
        </div>
        <div className="text-center mt-4" style={{width: '100%', fontSize: '14pt'}}>
          <Button className="mr-5 px-4" style={{backgroundColor: '#F2711D', border: 'none'}}>Link</Button>
          <Button className="px-4" style={{backgroundColor: '#01BDD4', border: 'none'}}>Link</Button>
        </div>
      </div>

      <div
        className="container align-middle text-center"
        style={{'margin-top': '70px'}}>
        <CardDeck>
          {links.map(({ exact, route, title, image }, index) => (
            <>
              <Card
                key={title}
                className="mb-5 align-self-center"
                style={{
                  width: '18rem',
                  justifyContent: 'center',
                  alignItems: 'center',
                  border: '1px solid #DADBE6',
                  borderRadius: '10px'
                }}>
                <Link
                  className="stretched-link"
                  exact={exact}
                  key={index}
                  to={route}>
                  <div 
                    className="bg-primary rounded-circle"
                    style={{marginTop: '-40px', padding: '10px'}}>
                    
                      <img
                        alt="icon"
                        src={image}
                        height="55"
                        width="55"/>
                  </div>
                </Link>
                <Card.Body>
                  <Card.Title style={{color: '#545871'}}>
                    <h3><b>{title}</b></h3>
                  </Card.Title>
                  <Card.Text className="text-secondary">
                    <small>
                      Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. 
                      Id velit ut tortor pretium viverra suspendisse potenti.
                    </small>
                  </Card.Text>
                </Card.Body>
                <Card.Footer className="bg-secondary" style={{width: "100%"}}>
                  <Button 
                    className="my-2"
                    style={{backgroundColor: '#545871', borderRadius: '10px', width: '90%'}}>
                    <Link
                      className="stretched-link text-light"
                      exact={exact}
                      key={index}
                      to={route}>Click</Link>
                  </Button>
                </Card.Footer>
              </Card>
              <div className="d-lg-none w-100"></div>
            </>
          ))}
        </CardDeck>

      </div>
      <div className="bg-secondary text-center">
        <div 
          className="bg-white text-light text-center"
          style={{height: "50px", 'clip-path': 'polygon(50% 100%, 0 0, 100% 0)'}}>
        </div>
        <div className="py-5">
          <h3 style={{color: '#545871'}}><b>OUR FOCUS</b></h3>
          <h4 className="text-secondary mt-3 text-orange">
            Simplifying GWAS for the Prostate, Lung, Colorectal and Ovarian Cancer
            Screening Trial
          </h4>
        </div>
      </div>
      <div className="bg-primary py-5">
        <div className="container my-4 text-light">
        Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut 
        labore et dolore magna aliqua. Magna fringilla urna porttitor rhoncus dolor purus. Risus sed 
        vulputate odio ut. Dictum varius duis at consectetur lorem donec massa. Orci phasellus egestas 
        tellus rutrum. Vivamus arcu felis bibendum ut tristique. Non quam lacus suspendisse faucibus interdum 
        posuere lorem ipsum. Condimentum vitae sapien pellentesque habitant morbi. Ac turpis egestas integer 
        eget aliquet nibh praesent tristique magna.
        </div>
      </div>
    </>
  );
}

import React from "react";
import { Link } from "react-router-dom";
import Card from "react-bootstrap/Card";
import { CardDeck, Button } from "react-bootstrap";
import "./home.scss";

export function Home({ links }) {
  return (
    <>
      <div className="banner-container text-center d-none d-md-block">
        <img
          src="assets/images/plco-banner.jpg"
          alt="PLCO banner"
          style={{ width: "100%" }}
        ></img>
        <div className="banner-overlay-text row justify-content-center text-center text-light w-75">
          <div className="col-12">
            <h1 className="text-light">
              <b>GWAS Explorer</b>
            </h1>
          </div>
          <div
            className="col-6 w-50 my-3 align-self-center"
            style={{ borderTop: "3px solid white" }}
          ></div>
          <div
            className="col-12 text-center mt-2 font-weight-bold"
            style={{ width: "100%", fontSize: "18pt" }}
          >
            Visualize and interact with
            <br />
            genome-wide association study results
          </div>
          <div
            className="col-12 text-center mt-5"
            style={{ width: "100%", fontSize: "14pt" }}
          >
            {/* <Button
              className="mr-5 px-4"
              style={{ backgroundColor: '#F2711D', border: 'none' }}>
              Link
            </Button>
            <Button
              className="px-4"
              style={{ backgroundColor: '#01BDD4', border: 'none' }}>
              Link
            </Button> */}
          </div>
        </div>
      </div>

      <div className="text-center mt-2 d-md-none">
        <h1 className="text-dark">
          <b>GWAS Explorer</b>
        </h1>
        <hr className="w-75"></hr>
        <div className="px-3 text-center">
          Visualize and interact with genome-wide association study results
        </div>
        {/* <div
          className="text-center mt-4"
          style={{ width: '100%', fontSize: '14pt' }}>
          <Button
            className="mr-5 px-4"
            style={{ backgroundColor: '#F2711D', border: 'none' }}>
            Link
          </Button>
          <Button
            className="px-4"
            style={{ backgroundColor: '#01BDD4', border: 'none' }}>
            Link
          </Button>
        </div> */}
      </div>

      <div
        className="container align-middle text-center"
        style={{ marginTop: "70px" }}
      >
        <CardDeck>
          {links
            .filter((item) => item.cardTitle)
            .map(
              (
                { exact, route, action, title, cardTitle, cardText, image },
                index
              ) => (
                <>
                  <Card
                    key={title}
                    className="mb-5 align-self-center"
                    style={{
                      width: "18rem",
                      justifyContent: "center",
                      alignItems: "center",
                      border: "1px solid #DADBE6",
                      // minHeight: '280px'
                      // borderRadius: '10px'
                    }}
                  >
                    <Link
                      className="stretched-link"
                      exact={exact}
                      key={index}
                      to={route}
                    >
                      <span className="sr-only">{title + " link"}</span>
                      <div
                        className="bg-primary rounded-circle"
                        style={{ marginTop: "-40px", padding: "10px" }}
                      >
                        <img alt="icon" src={image} height="55" width="55" />
                      </div>
                    </Link>
                    <Card.Body>
                      <Card.Title
                        style={{ color: "#545871", wordSpacing: "100vw" }}
                      >
                        <h2 style={{ fontSize: "1.75rem" }}>
                          <b>{cardTitle}</b>
                        </h2>
                      </Card.Title>
                      <Card.Text className="text-secondary">
                        <small>{cardText}</small>
                      </Card.Text>
                    </Card.Body>
                    <Card.Footer
                      className="bg-white border-top-0"
                      style={{ width: "100%" }}
                    >
                      <Button
                        className="my-2 border border-0 font-weight-bold"
                        style={{
                          backgroundColor: "#2CC799",
                          // borderRadius: '10px',
                          width: "90%",
                        }}
                      >
                        <Link
                          className="stretched-link text-dark"
                          style={{ textDecoration: "none" }}
                          exact={exact}
                          key={index}
                          to={route}
                        >
                          {action}
                        </Link>
                      </Button>
                    </Card.Footer>
                  </Card>
                  <div className="d-lg-none w-100"></div>
                </>
              )
            )}
        </CardDeck>
      </div>
      <div className="bg-white text-center">
        <div
          className="bg-secondary text-light text-center"
          style={{
            height: "50px",
            clipPath: "polygon(50% 100%, 0 0, 100% 0)",
          }}
        ></div>
        <div className="py-5">
          <h3 style={{ color: "#545871" }}>
            <b>OUR FOCUS</b>
          </h3>
          <h4 className="container mt-3 text-dark" style={{ fontSize: "16pt" }}>
            GWAS Explorer accelerates innovative analysis of GWAS results
            through a dynamic framework of interactive visualizations designed
            to aid in uncovering novel connections and spark new avenues of
            investigation
          </h4>
        </div>
      </div>
      <div className="bg-egg py-4">
        <div className="container my-3 text-dark">
          <h2 className="h4">Credits</h2>
          <p>
            Mitchell Machiela, Neal Freedman, Wen-Yi Huang, Wendy Wong, Sonja
            Berndt, Mustapha Abubakar, Jonas De Almeida, Jada Hislop, Erikka
            Loftfield, Jennifer Loukissas, Joshua Sampson, Montse Garcia-Closas,
            Stephen Chanock and colleagues at the{" "}
            <a href="https://dceg.cancer.gov/" target="_blank">
              Division of Cancer Epidemiology and Genetics (DCEG)
            </a>
            ,{" "}
            <a href="https://www.cancer.gov/" target="_blank">
              National Cancer Institute (NCI)
            </a>
            ,{" "}
            <a href="https://www.nih.gov/" target="_blank">
              National Institutes of Health (NIH)
            </a>
            ; Eric Miller, Paul Pinsky, Neeraj Saxena, Claire Zhu, Lori Minasian
            and colleagues at the{" "}
            <a href="https://prevention.cancer.gov/" target="_blank">
              Division of Cancer Prevention, NCI, NIH
            </a>
            ; Michael Furr, Jerome Mabie, Shannon Merkle, Craig Williams,
            Patrick Wright, Thomas Riley and staff at{" "}
            <a href="https://www.imsweb.com/" target="_blank">
              Information Management Services, Inc.
            </a>
            ; Bari Ballew, Casey Dagnall, Jia Liu, Kristine Jones, Cameron
            Palmer, Aurelie Vogt, Meredith Yeager, Bin Zhu, Amy Hutchinson,
            Belynda Hicks and staff at the{" "}
            <a
              href="https://dceg.cancer.gov/about/organization/cgr"
              target="_blank"
            >
              Cancer Genomics Research Laboratory, DCEG, NCI
            </a>
            ,{" "}
            <a href="https://frederick.cancer.gov/" target="_blank">
              Frederick National Laboratory for Cancer Research (FNLCR)
            </a>
            ,{" "}
            <a
              href="https://www.leidos.com/company/subsidiaries/leidos-biomedical-research"
              target="_blank"
            >
              Leidos Biomedical Research, Inc.
            </a>
            ; Norma Diaz-Mayoral and staff at the{" "}
            <a
              href="https://ncifrederick.cancer.gov/Programs/Science/Csp/Lab.aspx?Id=27"
              target="_blank"
            >
              BioProcessing and Trial Logistics Laboratory, FNLCR, Leidos
              Biomedical Research, Inc.
            </a>
            ; Mary Ferrell, Erik Neidinger and staff at the NCI at{" "}
            <a
              href="https://frederick.cancer.gov/science/nci-frederick-central-repository"
              target="_blank"
            >
              Frederick Central Repository
            </a>
            ,{" "}
            <a href="https://www.atcc.org/">American Type Culture Collection</a>
            ; Kevin Jiang, Brian Park, Kai-Ling Chen and staff at{" "}
            <a href="https://www.essential-soft.com/" target="_blank">
              Essential Software Inc.
            </a>
            ,{" "}
            <a href="https://datascience.cancer.gov/" target="_blank">
              Center for Biomedical Informatics and Information Technology, NCI.
            </a>
          </p>
          {/* Citation: TBD
          <br /> */}
          GWAS Explorer's{" "}
          <a
            href="https://github.com/CBIIT/nci-webtools-dceg-plco-atlas"
            target="_blank"
            alt="Link to open GitHub"
          >
            source code
          </a>{" "}
          is available under the{" "}
          <a
            href="./assets/license.txt"
            target="_blank"
            alt="Link to MIT license"
          >
            MIT license
          </a>
          , an{" "}
          <a
            href="https://opensource.org"
            target="_blank"
            alt="Link to open source initiative"
          >
            Open Source Initiative
          </a>{" "}
          approved license.
          <br></br>
          <p>
            Machiela, M.J., Huang, WY., Wong, W.{" "}
            <span style={{ fontStyle: "italic" }}>et al</span>. GWAS Explorer:
            an open-source tool to explore, visualize, and access GWAS summary
            statistics in the PLCO Atlas.{" "}
            <span style={{ fontStyle: "italic" }}>Sci Data </span>
            <span style={{ fontWeight: "bold" }}>10 </span>, 25 (2023).{" "}
            <a
              href="https://doi.org/10.1038/s41597-022-01921-2"
              target="_black"
              alt="Link to Paper"
            >
              https://doi.org/10.1038/s41597-022-01921-2
            </a>
            .
          </p>
        </div>
      </div>
    </>
  );
}

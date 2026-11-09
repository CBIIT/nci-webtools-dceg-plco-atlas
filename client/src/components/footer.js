import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";

export function parseVersion(versionString) {
  if (!versionString) return "dev";

  const versionMatch = versionString.match(/(\d+\.\d+\.\d+)(_dev)?/);
  return versionMatch ? versionMatch[1] + (versionMatch[2] || "") : "dev";
}

export function parseDeploymentDate(deploymentDate) {
  return /^\d{4}-\d{2}-\d{2}$/.test(deploymentDate || "")
    ? deploymentDate
    : "Unknown";
}

export function getFooterMetadata(versionString, deploymentDate) {
  return {
    version: parseVersion(versionString),
    date: parseDeploymentDate(deploymentDate)
  };
}

export default function Footer() {
  const { version, date } = getFooterMetadata(
    process.env.REACT_APP_VERSION,
    process.env.REACT_APP_DEPLOYMENT_DATE
  );

  return (
    <footer className="bg-primary">
      <div className="p-5 text-light text-center">
        <div className="footer-nav text-left">
          <Row className="justify-content-between">
            <Col md="auto" className="footer-nav-col">
              <div className="d-none d-lg-block footer-header text-left mb-2">
                <a
                  className="footer-link text-light"
                  href="https://dceg.cancer.gov/"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <h1>
                    Division of Cancer Epidemiology and Genetics
                    <span>at the National Cancer Institute</span>
                  </h1>
                </a>
                <div>Last Updated: {date}</div>
                <div>Version: {version}</div>
              </div>

              <div className="d-lg-none footer-header-mobile text-left mb-2">
                <h1>
                  Division of Cancer Epidemiology and Genetics
                  <span>at the National Cancer Institute</span>
                </h1>
              </div>
            </Col>
            <Col md="auto" className="footer-nav-col">
              <h2 className="mb-2">CONTACT INFORMATION</h2>
              <div className="my-2">
                <a
                  className="footer-link text-light"
                  href="mailto:NCIExploreGWASWebAdmin@mail.nih.gov"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Contact Us
                </a>
              </div>
            </Col>
            <Col md="auto" className="footer-nav-col">
              <h2 className="mb-2">MORE INFORMATION</h2>
              <div className="my-2">
                <a
                  className="footer-link text-light"
                  href="https://dceg.cancer.gov/"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  DCEG
                </a>
              </div>
              <div className="my-2">
                <a
                  className="footer-link text-light"
                  href="https://prevention.cancer.gov/"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  DCP
                </a>
              </div>
              <div className="my-2">
                <a
                  className="footer-link text-light"
                  href="https://dceg.cancer.gov/research/who-we-study/cohorts/prostate-lung-colon-ovary-prospective-study"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  PLCO Website
                </a>
              </div>
            </Col>
            <Col md="auto" className="footer-nav-col">
              <h2 className="mb-2">POLICIES</h2>
              <div className="my-2">
                <a
                  className="footer-link text-light"
                  href="https://www.cancer.gov/policies/accessibility"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Accessibility
                </a>
              </div>
              <div className="my-2">
                <a
                  className="footer-link text-light"
                  href="https://www.cancer.gov/policies/disclaimer"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Disclaimer
                </a>
              </div>
              <div className="my-2">
                <a
                  className="footer-link text-light"
                  href="https://www.cancer.gov/policies/foia"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  FOIA
                </a>
              </div>
              <div className="my-2">
                <a
                  className="footer-link text-light"
                  href="https://www.hhs.gov/vulnerability-disclosure-policy/index.html"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  HHS Vulnerability Disclosure
                </a>
              </div>
              <div className="my-2">
                <a
                  className="footer-link text-light"
                  href="https://www.cancer.gov/policies/comments"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Comment Policy
                </a>
              </div>
            </Col>
          </Row>
        </div>

        <div className="footer-agencies my-4">
          <Row className="justify-content-md-center">
            <Col sm="auto">
              <a
                className="footer-link text-light"
                href="http://www.hhs.gov/"
                target="_blank"
                rel="noopener noreferrer"
              >
                U.S. Department of Health and Human Services
              </a>
            </Col>
            <Col sm="auto">
              <a
                className="footer-link text-light"
                href="http://www.nih.gov"
                target="_blank"
                rel="noopener noreferrer"
              >
                National Institutes of Health
              </a>
            </Col>
            <Col sm="auto">
              <a
                className="footer-link text-light"
                href="https://www.cancer.gov/"
                target="_blank"
                rel="noopener noreferrer"
              >
                National Cancer Institute
              </a>
            </Col>
            <Col sm="auto">
              <a
                className="footer-link text-light"
                href="http://usa.gov"
                target="_blank"
                rel="noopener noreferrer"
              >
                USA.gov
              </a>
            </Col>
          </Row>
        </div>

        <div className="footer-tagline">
          <h3>
            NIH ... Turning Discovery Into Health
            <sup>®</sup>
          </h3>
        </div>
      </div>
    </footer>
  );
}

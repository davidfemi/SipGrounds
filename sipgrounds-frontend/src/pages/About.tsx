import React from 'react';
import { Container, Row, Col, Card } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import SEOHead from '../components/SEOHead';

const About: React.FC = () => {
  return (
    <>
      <SEOHead
        title="About Us - SipGrounds"
        description="Learn about SipGrounds — the community platform connecting coffee lovers with their perfect café."
      />

      {/* Hero */}
      <div
        className="text-white text-center py-5 mb-5"
        style={{
          background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
          borderRadius: '15px',
        }}
      >
        <i className="fas fa-coffee fa-3x mb-3"></i>
        <h1 className="fw-bold">About SipGrounds</h1>
        <p className="lead mb-0">Connecting coffee lovers with their perfect brew since 2023</p>
      </div>

      <Container>
        <Row className="mb-5">
          <Col md={6} className="mb-4">
            <Card className="h-100 border-0 shadow-sm" style={{ borderRadius: '15px' }}>
              <Card.Header
                className="text-white py-3"
                style={{
                  background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                  borderRadius: '15px 15px 0 0',
                }}
              >
                <h5 className="mb-0">
                  <i className="fas fa-heart me-2"></i>
                  Our Mission
                </h5>
              </Card.Header>
              <Card.Body className="p-4">
                <p className="text-muted">
                  SipGrounds was born from a simple belief: every great coffee experience deserves
                  to be shared. We built a platform where passionate coffee lovers can discover,
                  review, and champion the cafés that make their mornings worth getting up for.
                </p>
                <p className="text-muted mb-0">
                  Whether you're hunting for the perfect pour-over, a cosy workspace, or a hidden
                  gem in a new city — SipGrounds has you covered.
                </p>
              </Card.Body>
            </Card>
          </Col>

          <Col md={6} className="mb-4">
            <Card className="h-100 border-0 shadow-sm" style={{ borderRadius: '15px' }}>
              <Card.Header
                className="text-white py-3"
                style={{
                  background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                  borderRadius: '15px 15px 0 0',
                }}
              >
                <h5 className="mb-0">
                  <i className="fas fa-users me-2"></i>
                  Our Community
                </h5>
              </Card.Header>
              <Card.Body className="p-4">
                <p className="text-muted">
                  We are a community-first platform. Every café listing, every review, and every
                  recommendation comes from real people who love great coffee just as much as you do.
                </p>
                <p className="text-muted mb-0">
                  Earn reward points for contributions, redeem them for free drinks, and help others
                  find their next favourite spot.
                </p>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        {/* Values */}
        <Row className="mb-5">
          <Col>
            <h2 className="text-center mb-4" style={{ color: '#1f2937' }}>
              What We Stand For
            </h2>
            <Row>
              {[
                { icon: 'fas fa-star', title: 'Quality', text: 'We celebrate cafés that take craft seriously — from sourcing beans to perfecting the extraction.' },
                { icon: 'fas fa-map-marker-alt', title: 'Discovery', text: 'We make it easy to explore new neighbourhoods and find coffee spots you never knew existed.' },
                { icon: 'fas fa-handshake', title: 'Transparency', text: 'Honest reviews from real customers — no paid placements, no hidden promotions.' },
                { icon: 'fas fa-leaf', title: 'Sustainability', text: 'We highlight cafés that prioritise ethical sourcing, fair trade, and eco-friendly practices.' },
              ].map(({ icon, title, text }) => (
                <Col md={3} sm={6} key={title} className="mb-4 text-center">
                  <div
                    className="p-4 rounded"
                    style={{ backgroundColor: '#fff7ed', border: '1px solid #fde68a' }}
                  >
                    <i className={`${icon} fa-2x mb-3`} style={{ color: '#f59e0b' }}></i>
                    <h6 className="fw-bold">{title}</h6>
                    <p className="text-muted small mb-0">{text}</p>
                  </div>
                </Col>
              ))}
            </Row>
          </Col>
        </Row>

        <div className="text-center py-4">
          <p className="text-muted mb-3">Ready to find your next favourite café?</p>
          <Link to="/cafes" className="btn text-white me-2" style={{ backgroundColor: '#f59e0b', borderColor: '#f59e0b' }}>
            <i className="fas fa-search me-2"></i>Explore Cafés
          </Link>
          <Link to="/contact" className="btn btn-outline-secondary">
            <i className="fas fa-envelope me-2"></i>Get in Touch
          </Link>
        </div>
      </Container>
    </>
  );
};

export default About;

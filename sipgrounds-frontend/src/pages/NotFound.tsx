import React from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import SEOHead from '../components/SEOHead';

const NotFound: React.FC = () => {
  return (
    <>
      <SEOHead title="Page Not Found - SipGrounds" description="This page doesn't exist." />

      <Container className="py-5 text-center">
        <Row className="justify-content-center">
          <Col md={6}>
            <div
              className="p-5 rounded"
              style={{ background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)', borderRadius: '15px' }}
            >
              <h1 className="text-white fw-bold" style={{ fontSize: '6rem' }}>404</h1>
              <i className="fas fa-coffee fa-3x text-white mb-3"></i>
              <h3 className="text-white fw-bold">Oops — looks like you spilled your coffee</h3>
              <p className="text-white opacity-75">
                The page you're looking for doesn't exist or has been moved.
              </p>
            </div>

            <div className="mt-4">
              <Link
                to="/"
                className="btn text-white me-3"
                style={{ backgroundColor: '#f59e0b', borderColor: '#f59e0b' }}
              >
                <i className="fas fa-home me-2"></i>
                Back to Home
              </Link>
              <Link to="/cafes" className="btn btn-outline-secondary">
                <i className="fas fa-search me-2"></i>
                Explore Cafés
              </Link>
            </div>
          </Col>
        </Row>
      </Container>
    </>
  );
};

export default NotFound;

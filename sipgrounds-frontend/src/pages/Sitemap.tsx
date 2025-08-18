import React from 'react';
import { Container, Row, Col, Card, ListGroup } from 'react-bootstrap';
import { Link } from 'react-router-dom';

const Sitemap: React.FC = () => {
  return (
    <Container className="py-5">
      <Row className="justify-content-center">
        <Col lg={10}>
          <div className="text-center mb-5">
            <h1 style={{ color: '#f59e0b', fontWeight: '600' }}>
              <i className="fas fa-map me-3"></i>
              Site Map
            </h1>
            <p className="lead text-muted">
              Navigate through all the pages and features of Sip Grounds
            </p>
          </div>

          <Row>
            {/* Main Navigation */}
            <Col md={6} lg={4} className="mb-4">
              <Card className="h-100 border-0 shadow-sm" style={{ borderRadius: '15px' }}>
                <Card.Header 
                  className="text-white text-center py-3"
                  style={{ 
                    background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                    borderRadius: '15px 15px 0 0'
                  }}
                >
                  <h5 className="mb-0">
                    <i className="fas fa-home me-2"></i>
                    Main Pages
                  </h5>
                </Card.Header>
                <Card.Body>
                  <ListGroup variant="flush">
                    <ListGroup.Item className="border-0 px-0">
                      <Link to="/" className="text-decoration-none">
                        <i className="fas fa-home me-2 text-warning"></i>
                        Home
                      </Link>
                    </ListGroup.Item>
                    <ListGroup.Item className="border-0 px-0">
                      <Link to="/cafes" className="text-decoration-none">
                        <i className="fas fa-coffee me-2 text-warning"></i>
                        Find Cafes
                      </Link>
                    </ListGroup.Item>
                    <ListGroup.Item className="border-0 px-0">
                      <Link to="/shop" className="text-decoration-none">
                        <i className="fas fa-shopping-bag me-2 text-warning"></i>
                        Shop
                      </Link>
                    </ListGroup.Item>
                    <ListGroup.Item className="border-0 px-0">
                      <Link to="/menu" className="text-decoration-none">
                        <i className="fas fa-utensils me-2 text-warning"></i>
                        Menu
                      </Link>
                    </ListGroup.Item>
                    <ListGroup.Item className="border-0 px-0">
                      <Link to="/polls" className="text-decoration-none">
                        <i className="fas fa-poll me-2 text-warning"></i>
                        Polls & Surveys
                      </Link>
                    </ListGroup.Item>
                  </ListGroup>
                </Card.Body>
              </Card>
            </Col>

            {/* Menu Categories */}
            <Col md={6} lg={4} className="mb-4">
              <Card className="h-100 border-0 shadow-sm" style={{ borderRadius: '15px' }}>
                <Card.Header 
                  className="text-white text-center py-3"
                  style={{ 
                    background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                    borderRadius: '15px 15px 0 0'
                  }}
                >
                  <h5 className="mb-0">
                    <i className="fas fa-utensils me-2"></i>
                    Menu Categories
                  </h5>
                </Card.Header>
                <Card.Body>
                  <ListGroup variant="flush">
                    <ListGroup.Item className="border-0 px-0">
                      <Link to="/menu/hot-coffee" className="text-decoration-none">
                        <i className="fas fa-mug-hot me-2 text-warning"></i>
                        Hot Coffee
                      </Link>
                    </ListGroup.Item>
                    <ListGroup.Item className="border-0 px-0">
                      <Link to="/menu/iced-coffee" className="text-decoration-none">
                        <i className="fas fa-glass me-2 text-warning"></i>
                        Iced Coffee
                      </Link>
                    </ListGroup.Item>
                    <ListGroup.Item className="border-0 px-0">
                      <Link to="/menu/espresso" className="text-decoration-none">
                        <i className="fas fa-coffee me-2 text-warning"></i>
                        Espresso
                      </Link>
                    </ListGroup.Item>
                    <ListGroup.Item className="border-0 px-0">
                      <Link to="/menu/tea" className="text-decoration-none">
                        <i className="fas fa-leaf me-2 text-warning"></i>
                        Tea
                      </Link>
                    </ListGroup.Item>
                    <ListGroup.Item className="border-0 px-0">
                      <Link to="/menu/smoothies" className="text-decoration-none">
                        <i className="fas fa-blender me-2 text-warning"></i>
                        Smoothies
                      </Link>
                    </ListGroup.Item>
                    <ListGroup.Item className="border-0 px-0">
                      <Link to="/menu/pastries" className="text-decoration-none">
                        <i className="fas fa-cookie-bite me-2 text-warning"></i>
                        Pastries
                      </Link>
                    </ListGroup.Item>
                    <ListGroup.Item className="border-0 px-0">
                      <Link to="/menu/sandwiches" className="text-decoration-none">
                        <i className="fas fa-hamburger me-2 text-warning"></i>
                        Sandwiches
                      </Link>
                    </ListGroup.Item>
                    <ListGroup.Item className="border-0 px-0">
                      <Link to="/menu/breakfast" className="text-decoration-none">
                        <i className="fas fa-egg me-2 text-warning"></i>
                        Breakfast
                      </Link>
                    </ListGroup.Item>
                  </ListGroup>
                </Card.Body>
              </Card>
            </Col>

            {/* User Account */}
            <Col md={6} lg={4} className="mb-4">
              <Card className="h-100 border-0 shadow-sm" style={{ borderRadius: '15px' }}>
                <Card.Header 
                  className="text-white text-center py-3"
                  style={{ 
                    background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                    borderRadius: '15px 15px 0 0'
                  }}
                >
                  <h5 className="mb-0">
                    <i className="fas fa-user me-2"></i>
                    Account
                  </h5>
                </Card.Header>
                <Card.Body>
                  <ListGroup variant="flush">
                    <ListGroup.Item className="border-0 px-0">
                      <Link to="/login" className="text-decoration-none">
                        <i className="fas fa-sign-in-alt me-2 text-warning"></i>
                        Login
                      </Link>
                    </ListGroup.Item>
                    <ListGroup.Item className="border-0 px-0">
                      <Link to="/register" className="text-decoration-none">
                        <i className="fas fa-user-plus me-2 text-warning"></i>
                        Register
                      </Link>
                    </ListGroup.Item>
                    <ListGroup.Item className="border-0 px-0">
                      <Link to="/profile" className="text-decoration-none">
                        <i className="fas fa-user-circle me-2 text-warning"></i>
                        Profile
                      </Link>
                      <small className="text-muted ms-2">(Login Required)</small>
                    </ListGroup.Item>
                    <ListGroup.Item className="border-0 px-0">
                      <Link to="/orders" className="text-decoration-none">
                        <i className="fas fa-receipt me-2 text-warning"></i>
                        My Orders
                      </Link>
                      <small className="text-muted ms-2">(Login Required)</small>
                    </ListGroup.Item>
                    <ListGroup.Item className="border-0 px-0">
                      <Link to="/rewards" className="text-decoration-none">
                        <i className="fas fa-gift me-2 text-warning"></i>
                        Rewards
                      </Link>
                      <small className="text-muted ms-2">(Login Required)</small>
                    </ListGroup.Item>
                  </ListGroup>
                </Card.Body>
              </Card>
            </Col>

            {/* Shopping */}
            <Col md={6} lg={4} className="mb-4">
              <Card className="h-100 border-0 shadow-sm" style={{ borderRadius: '15px' }}>
                <Card.Header 
                  className="text-white text-center py-3"
                  style={{ 
                    background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                    borderRadius: '15px 15px 0 0'
                  }}
                >
                  <h5 className="mb-0">
                    <i className="fas fa-shopping-cart me-2"></i>
                    Shopping
                  </h5>
                </Card.Header>
                <Card.Body>
                  <ListGroup variant="flush">
                    <ListGroup.Item className="border-0 px-0">
                      <Link to="/shop" className="text-decoration-none">
                        <i className="fas fa-store me-2 text-warning"></i>
                        Browse Products
                      </Link>
                    </ListGroup.Item>
                    <ListGroup.Item className="border-0 px-0">
                      <Link to="/checkout" className="text-decoration-none">
                        <i className="fas fa-credit-card me-2 text-warning"></i>
                        Checkout
                      </Link>
                    </ListGroup.Item>
                    <ListGroup.Item className="border-0 px-0">
                      <Link to="/checkout/success" className="text-decoration-none">
                        <i className="fas fa-check-circle me-2 text-warning"></i>
                        Order Success
                      </Link>
                    </ListGroup.Item>
                  </ListGroup>
                </Card.Body>
              </Card>
            </Col>

            {/* Support & Info */}
            <Col md={6} lg={4} className="mb-4">
              <Card className="h-100 border-0 shadow-sm" style={{ borderRadius: '15px' }}>
                <Card.Header 
                  className="text-white text-center py-3"
                  style={{ 
                    background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                    borderRadius: '15px 15px 0 0'
                  }}
                >
                  <h5 className="mb-0">
                    <i className="fas fa-info-circle me-2"></i>
                    Support & Info
                  </h5>
                </Card.Header>
                <Card.Body>
                  <ListGroup variant="flush">
                    <ListGroup.Item className="border-0 px-0">
                      <a href="/about" className="text-decoration-none">
                        <i className="fas fa-users me-2 text-warning"></i>
                        About Us
                      </a>
                    </ListGroup.Item>
                    <ListGroup.Item className="border-0 px-0">
                      <a href="/contact" className="text-decoration-none">
                        <i className="fas fa-envelope me-2 text-warning"></i>
                        Contact
                      </a>
                    </ListGroup.Item>
                    <ListGroup.Item className="border-0 px-0">
                      <a href="/faq" className="text-decoration-none">
                        <i className="fas fa-question-circle me-2 text-warning"></i>
                        FAQ
                      </a>
                    </ListGroup.Item>
                    <ListGroup.Item className="border-0 px-0">
                      <a href="/privacy" className="text-decoration-none">
                        <i className="fas fa-shield-alt me-2 text-warning"></i>
                        Privacy Policy
                      </a>
                    </ListGroup.Item>
                    <ListGroup.Item className="border-0 px-0">
                      <a href="/terms" className="text-decoration-none">
                        <i className="fas fa-file-contract me-2 text-warning"></i>
                        Terms of Service
                      </a>
                    </ListGroup.Item>
                  </ListGroup>
                </Card.Body>
              </Card>
            </Col>

            {/* Popular Menu Items */}
            <Col md={6} lg={4} className="mb-4">
              <Card className="h-100 border-0 shadow-sm" style={{ borderRadius: '15px' }}>
                <Card.Header 
                  className="text-white text-center py-3"
                  style={{ 
                    background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                    borderRadius: '15px 15px 0 0'
                  }}
                >
                  <h5 className="mb-0">
                    <i className="fas fa-star me-2"></i>
                    Popular Items
                  </h5>
                </Card.Header>
                <Card.Body>
                  <ListGroup variant="flush">
                    <ListGroup.Item className="border-0 px-0">
                      <Link to="/menu/item/americano" className="text-decoration-none">
                        <i className="fas fa-coffee me-2 text-warning"></i>
                        Americano
                      </Link>
                    </ListGroup.Item>
                    <ListGroup.Item className="border-0 px-0">
                      <Link to="/menu/item/cappuccino" className="text-decoration-none">
                        <i className="fas fa-coffee me-2 text-warning"></i>
                        Cappuccino
                      </Link>
                    </ListGroup.Item>
                    <ListGroup.Item className="border-0 px-0">
                      <Link to="/menu/item/latte" className="text-decoration-none">
                        <i className="fas fa-coffee me-2 text-warning"></i>
                        Latte
                      </Link>
                    </ListGroup.Item>
                    <ListGroup.Item className="border-0 px-0">
                      <Link to="/menu/item/mocha" className="text-decoration-none">
                        <i className="fas fa-coffee me-2 text-warning"></i>
                        Mocha
                      </Link>
                    </ListGroup.Item>
                    <ListGroup.Item className="border-0 px-0">
                      <Link to="/menu/item/macchiato" className="text-decoration-none">
                        <i className="fas fa-coffee me-2 text-warning"></i>
                        Macchiato
                      </Link>
                    </ListGroup.Item>
                  </ListGroup>
                </Card.Body>
              </Card>
            </Col>
          </Row>

          {/* Quick Statistics */}
          <Row className="mt-5">
            <Col>
              <Card className="border-0 shadow-sm" style={{ borderRadius: '15px', backgroundColor: '#fff7ed' }}>
                <Card.Body className="text-center py-4">
                  <h4 className="mb-3" style={{ color: '#f59e0b' }}>
                    <i className="fas fa-chart-line me-2"></i>
                    Site Statistics
                  </h4>
                  <Row>
                    <Col md={3} className="mb-3">
                      <div className="stat-item">
                        <h3 className="mb-1" style={{ color: '#f59e0b' }}>1000+</h3>
                        <p className="text-muted mb-0">Cafes Listed</p>
                      </div>
                    </Col>
                    <Col md={3} className="mb-3">
                      <div className="stat-item">
                        <h3 className="mb-1" style={{ color: '#f59e0b' }}>50+</h3>
                        <p className="text-muted mb-0">Menu Items</p>
                      </div>
                    </Col>
                    <Col md={3} className="mb-3">
                      <div className="stat-item">
                        <h3 className="mb-1" style={{ color: '#f59e0b' }}>8</h3>
                        <p className="text-muted mb-0">Shop Products</p>
                      </div>
                    </Col>
                    <Col md={3} className="mb-3">
                      <div className="stat-item">
                        <h3 className="mb-1" style={{ color: '#f59e0b' }}>20+</h3>
                        <p className="text-muted mb-0">Active Pages</p>
                      </div>
                    </Col>
                  </Row>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </Col>
      </Row>
    </Container>
  );
};

export default Sitemap;

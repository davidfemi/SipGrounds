import React from 'react';
import { Navbar as BootstrapNavbar, Nav, Container, Button, Badge } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

const Navbar: React.FC = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const { getCartItemCount } = useCart();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  return (
    <BootstrapNavbar bg="white" variant="light" expand="lg" className="custom-navbar border-bottom">
      <Container>
        <BootstrapNavbar.Brand as={Link} to="/" className="d-flex align-items-center">
          <img 
            src="/sipgrounds.jpg"
            alt="SipGrounds"
            height="50"
            width="50"
            className="me-2 rounded-circle"
          />
        </BootstrapNavbar.Brand>
        
        <BootstrapNavbar.Toggle aria-controls="basic-navbar-nav" />
        <BootstrapNavbar.Collapse id="basic-navbar-nav">
          <Nav className="me-auto ms-4">
            <Nav.Link as={Link} to="/menu" className="nav-item-custom">
              MENU
            </Nav.Link>
            <Nav.Link as={Link} to="/rewards" className="nav-item-custom">
              REWARDS
            </Nav.Link>
            <Nav.Link as={Link} to="/shop" className="nav-item-custom">
              SHOP
              {isAuthenticated && getCartItemCount() > 0 && (
                <Badge bg="success" className="ms-1">
                  {getCartItemCount()}
                </Badge>
              )}
            </Nav.Link>
          </Nav>
          
          <Nav className="ms-auto align-items-center">
            <Nav.Link as={Link} to="/cafes" className="find-store-btn">
              <i className="fas fa-map-marker-alt me-2"></i>
              Find a store
            </Nav.Link>
            <button
              className="btn btn-link nav-item-custom me-3 d-flex align-items-center p-0"
              onClick={() => navigate('/checkout')}
              style={{ textDecoration: 'none' }}
            >
              <i className="fas fa-shopping-cart me-2"></i>
              Cart
              {isAuthenticated && getCartItemCount() > 0 && (
                <Badge bg="secondary" className="ms-2">{getCartItemCount()}</Badge>
              )}
            </button>
            {isAuthenticated ? (
              <>
                <Link to="/profile" className="nav-item-custom me-3 btn btn-link p-0" style={{ textDecoration: 'none' }}>
                  Profile
                </Link>
                <Button variant="link" onClick={handleLogout} className="nav-item-custom p-0" style={{ textDecoration: 'none' }}>
                  Logout
                </Button>
              </>
            ) : (
              <>
                <Link to="/login" className="nav-item-custom me-3 btn btn-link p-0" style={{ textDecoration: 'none' }}>
                  Sign in
                </Link>
                <Link to="/register" className="nav-item-custom btn btn-link p-0" style={{ textDecoration: 'none' }}>
                  Join now
                </Link>
              </>
            )}
          </Nav>
        </BootstrapNavbar.Collapse>
      </Container>
    </BootstrapNavbar>
  );
};

export default Navbar; 
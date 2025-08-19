import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Container, 
  Row, 
  Col, 
  Card, 
  Button, 
  Form, 
  Alert,
  Modal,
  Badge,
  Spinner
} from 'react-bootstrap';
import { toast } from 'react-toastify';
import { productAPI, Product } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import SEOHead from '../components/SEOHead';
import LoadingScreen from '../components/LoadingScreen';
import { trackShopEvent, sipGroundsEvents } from '../services/intercomService';

interface ShippingAddress {
  name: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
}

// Utility function to truncate text for shop listing
const truncateDescription = (text: string, maxLength: number = 60): string => {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength).trim() + '...';
};

const Shop: React.FC = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showCheckout, setShowCheckout] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  
  // No shipping; redirect users to pickup checkout page

  const { isAuthenticated, user } = useAuth();
  const { cart, addToCart, removeFromCart, updateCartQuantity, clearCart, getCartTotal, getCartItemCount } = useCart();

  useEffect(() => {
    fetchProducts();
  }, [selectedCategory]);

  const fetchProducts = async () => {
    setLoading(true);
    setError('');
    
    try {
      const params = selectedCategory ? { category: selectedCategory } : { inStock: true };
      const response = await productAPI.getAll(params);
      
      if (response.success && response.data) {
        setProducts(response.data.products);
      } else {
        setError('Failed to fetch products');
      }
    } catch (error) {
      setError('Failed to fetch products');
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = (product: Product, quantity: number = 1) => {
    if (!isAuthenticated) {
      toast.error('Please login to add items to cart');
      return;
    }
    addToCart(product, quantity);
  };

  const handleCheckout = () => {
    // Track checkout initiation
    const orderData = {
      items: cart,
      totalAmount: getCartTotal(),
      item_count: getCartItemCount()
    };
    trackShopEvent('checkout_initiated', orderData, user);
    
    navigate('/checkout');
  };

  const categoryOptions = [
    { value: '', label: 'All Products' },
    { value: 'apparel', label: 'Apparel' },
    { value: 'accessories', label: 'Accessories' },
    { value: 'drinkware', label: 'Drinkware' },
    { value: 'stationery', label: 'Stationery' }
  ];

  if (loading) {
    return <LoadingScreen />;
  }

  return (
    <>
      <SEOHead 
        title="Shop - Sip Grounds" 
        description="Browse Sip Grounds official merchandise - coffee gear, mugs, apparel and more!" 
        keywords="coffee shop, merchandise, coffee gear, drinkware, apparel"
      />
      
      <Container className="py-4">
        {/* Header */}
        <Row className="mb-4">
          <Col>
            <div className="text-center">
              <h1 className="display-5 mb-3">
                <i className="fas fa-shopping-bag me-3" style={{color: '#f59e0b'}}></i>
                Sip Grounds Shop
              </h1>
              <p className="lead text-muted mb-4">
                Premium coffee gear and merchandise for true coffee lovers
              </p>
            </div>
          </Col>
        </Row>
        {/* Cart Summary */}
        {isAuthenticated && cart.length > 0 && (
          <Row className="mb-4">
            <Col>
              <Card className="mx-auto" style={{ maxWidth: '480px', background: '#fff7ed', borderColor: '#fde68a' }}>
                <Card.Body className="text-center">
                  <div className="d-flex align-items-center justify-content-center mb-2">
                    <i className="fas fa-shopping-cart fa-2x me-3" style={{color: '#f59e0b'}}></i>
                    <div>
                      <h3 className="mb-0" style={{color: '#f59e0b'}}>
                        {getCartItemCount()}
                      </h3>
                      <small className="text-muted">Items in Cart</small>
                    </div>
                  </div>
                  <div className="d-flex justify-content-between align-items-center">
                    <span className="h5 mb-0" style={{color: '#f59e0b'}}>
                      Total: ${getCartTotal().toFixed(2)}
                    </span>
                    <Button 
                      style={{ backgroundColor: '#f59e0b', borderColor: '#f59e0b' }}
                      onClick={() => setShowCheckout(true)}
                      className="text-white"
                    >
                      <i className="fas fa-credit-card me-2"></i>
                      Checkout
                    </Button>
                  </div>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        )}

        {/* Error Alert */}
        {error && (
          <Row className="mb-4">
            <Col>
              <Alert variant="danger" dismissible onClose={() => setError('')}>
                <i className="fas fa-exclamation-triangle me-2"></i>
                {error}
              </Alert>
            </Col>
          </Row>
        )}

        {/* Category Filter */}
        <Row className="mb-4">
          <Col md={4} className="mx-auto">
            <Card className="bg-white" style={{ borderColor: '#fde68a' }}>
              <Card.Body>
                <h6 className="mb-3 text-center">
                  <i className="fas fa-filter me-2" style={{color: '#f59e0b'}}></i>
                  Filter by Category
                </h6>
                <Form.Group>
                  <Form.Select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    style={{ borderColor: '#fde68a' }}
                  >
                    {categoryOptions.map(option => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        {/* Products Grid */}
        <Row>
          {products.length === 0 ? (
            <Col>
              <Card className="text-center py-5">
                <Card.Body>
                  <i className="fas fa-shopping-bag fa-3x text-muted mb-3"></i>
                  <h4>No products found</h4>
                  <p className="text-muted">
                    {selectedCategory ? 
                      `No products available in the "${categoryOptions.find(opt => opt.value === selectedCategory)?.label}" category.` :
                      'No products available at the moment. Check back soon!'
                    }
                  </p>
                </Card.Body>
              </Card>
            </Col>
          ) : (
            products.map(product => {
              const canPurchase = product.inStock && isAuthenticated;
              
              return (
                <Col key={product._id} lg={4} md={6} className="mb-4">
                  <Card className={`h-100 product-card ${!product.inStock ? 'opacity-75' : ''}`}>
                    <div className="position-relative">
                      <Card.Img 
                        variant="top" 
                        src={product.image} 
                        alt={product.name}
                        style={{ height: '200px', objectFit: 'cover', cursor: 'pointer' }}
                        onClick={() => navigate(`/products/${product._id}`)}
                      />
                      
                      {/* Stock Status */}
                      <div className="position-absolute top-0 end-0 m-2">
                        <Badge bg={product.inStock ? 'success' : 'danger'}>
                          {product.inStock ? 'In Stock' : 'Out of Stock'}
                        </Badge>
                      </div>
                    </div>

                    <Card.Body className="d-flex flex-column">
                      <div className="mb-3">
                        <Card.Title 
                          className="h5 mb-2" 
                          style={{ cursor: 'pointer' }}
                          onClick={() => navigate(`/products/${product._id}`)}
                        >
                          {product.name}
                        </Card.Title>
                        <Card.Text className="text-muted small">
                          {truncateDescription(product.description)}
                        </Card.Text>
                      </div>

                      {/* Price */}
                      <div className="mb-3">
                        <h5 className="mb-0" style={{color: '#f59e0b'}}>
                          ${product.price}
                        </h5>
                      </div>

                      {/* Action Buttons */}
                      <div className="mt-auto">
                        <div className="d-grid gap-2">
                          <Button 
                            variant="outline-primary"
                            onClick={() => navigate(`/products/${product._id}`)}
                            style={{ borderColor: '#f59e0b', color: '#f59e0b' }}
                          >
                            <i className="fas fa-eye me-2"></i>
                            View Details
                          </Button>
                          <Button 
                            style={{ 
                              backgroundColor: canPurchase ? '#f59e0b' : 'transparent', 
                              borderColor: '#f59e0b', 
                              color: canPurchase ? '#fff' : '#f59e0b' 
                            }}
                            disabled={!canPurchase}
                            onClick={() => handleAddToCart(product)}
                          >
                            {!isAuthenticated ? (
                              <>
                                <i className="fas fa-sign-in-alt me-2"></i>
                                Login to Purchase
                              </>
                            ) : !product.inStock ? (
                              <>
                                <i className="fas fa-times me-2"></i>
                                Out of Stock
                              </>
                            ) : (
                              <>
                                <i className="fas fa-cart-plus me-2"></i>
                                Add to Cart
                              </>
                            )}
                          </Button>
                        </div>
                      </div>
                    </Card.Body>
                  </Card>
                </Col>
              );
            })
          )}
        </Row>

        {/* How to Shop Section */}
        <Row className="mt-5">
          <Col>
            <Card className="bg-white" style={{ borderColor: '#fde68a' }}>
              <Card.Body className="text-center py-4">
                <h5 className="mb-3">
                  <i className="fas fa-lightbulb me-2" style={{color: '#f59e0b'}}></i>
                  How to Shop with Sip Grounds
                </h5>
                <Row>
                  <Col md={4} className="mb-3">
                    <i className="fas fa-search fa-2x mb-2" style={{color: '#f59e0b'}}></i>
                    <h6>Browse Products</h6>
                    <small className="text-muted">
                      Discover premium coffee gear and merchandise
                    </small>
                  </Col>
                  <Col md={4} className="mb-3">
                    <i className="fas fa-cart-plus fa-2x mb-2" style={{color: '#f59e0b'}}></i>
                    <h6>Add to Cart</h6>
                    <small className="text-muted">
                      Select your favorite items and quantities
                    </small>
                  </Col>
                  <Col md={4} className="mb-3">
                    <i className="fas fa-store fa-2x mb-2" style={{color: '#f59e0b'}}></i>
                    <h6>Pickup at Cafés</h6>
                    <small className="text-muted">
                      Choose your preferred pickup location
                    </small>
                  </Col>
                </Row>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>

      {/* Checkout Modal */}
      <Modal show={showCheckout} onHide={() => setShowCheckout(false)} size="lg" centered>
        <Modal.Header closeButton>
          <Modal.Title>
            <i className="fas fa-shopping-cart me-2" style={{color: '#f59e0b'}}></i>
            Order Summary
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {cart.length === 0 ? (
            <div className="text-center py-4">
              <i className="fas fa-shopping-cart fa-3x text-muted mb-3"></i>
              <h5>Your cart is empty</h5>
              <p className="text-muted">Add some items to get started!</p>
            </div>
          ) : (
            <>
              {cart.map(item => (
                <div key={item.product._id} className="border rounded p-3 mb-3" style={{ borderColor: '#fde68a' }}>
                  <div className="d-flex justify-content-between align-items-start">
                    <div className="flex-grow-1">
                      <h6 className="mb-1">{item.product.name}</h6>
                      <small className="text-muted">${item.product.price} each</small>
                    </div>
                    <div className="d-flex align-items-center gap-2">
                      <Button 
                        size="sm" 
                        variant="outline-secondary"
                        onClick={() => updateCartQuantity(item.product._id, item.quantity - 1)}
                        disabled={item.quantity <= 1}
                      >
                        <i className="fas fa-minus"></i>
                      </Button>
                      <span className="mx-2" style={{ minWidth: '2rem', textAlign: 'center' }}>
                        {item.quantity}
                      </span>
                      <Button 
                        size="sm" 
                        variant="outline-secondary"
                        onClick={() => updateCartQuantity(item.product._id, item.quantity + 1)}
                      >
                        <i className="fas fa-plus"></i>
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline-danger"
                        onClick={() => removeFromCart(item.product._id)}
                        className="ms-2"
                      >
                        <i className="fas fa-trash"></i>
                      </Button>
                    </div>
                  </div>
                  <div className="text-end mt-2">
                    <strong style={{color: '#f59e0b'}}>
                      ${(item.product.price * item.quantity).toFixed(2)}
                    </strong>
                  </div>
                </div>
              ))}
              
              <div className="bg-light p-3 rounded">
                <div className="d-flex justify-content-between align-items-center">
                  <h5 className="mb-0">Total:</h5>
                  <h4 className="mb-0" style={{color: '#f59e0b'}}>
                    ${getCartTotal().toFixed(2)}
                  </h4>
                </div>
              </div>

              <div className="mt-3 p-3 rounded" style={{ backgroundColor: '#fff7ed', border: '1px solid #fde68a' }}>
                <div className="d-flex align-items-center">
                  <i className="fas fa-info-circle me-2" style={{color: '#f59e0b'}}></i>
                  <small className="text-muted">
                    <strong>Pickup Only:</strong> You will choose your preferred café location on the next page.
                  </small>
                </div>
              </div>
            </>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="outline-secondary" onClick={() => setShowCheckout(false)}>
            <i className="fas fa-arrow-left me-2"></i>
            Continue Shopping
          </Button>
          <Button 
            style={{ backgroundColor: '#f59e0b', borderColor: '#f59e0b' }}
            onClick={handleCheckout}
            disabled={cart.length === 0}
            className="text-white"
          >
            <i className="fas fa-arrow-right me-2"></i>
            Proceed to Checkout
          </Button>
        </Modal.Footer>
      </Modal>

      <style>{`
        .product-card {
          transition: transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out;
        }
        .product-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 15px rgba(0,0,0,0.1) !important;
        }
      `}</style>
    </>
  );
};

export default Shop; 
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
    return (
      <Container className="text-center py-5">
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Loading...</span>
        </Spinner>
      </Container>
    );
  }

  return (
    <Container>
      <SEOHead title="Shop" description="Browse The Campgrounds official merchandise - T-shirts, mugs, notepads and more!" />
      
      {/* Page Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h1 className="yc-text-primary mb-2">The Campgrounds Shop</h1>
          <p className="text-muted mb-0">Official merchandise for outdoor enthusiasts</p>
        </div>
        
        {isAuthenticated && (
          <div className="d-flex align-items-center gap-3">
            <Button 
              variant="outline-primary" 
              onClick={() => setShowCheckout(true)}
              disabled={cart.length === 0}
            >
              <i className="fas fa-shopping-cart me-2"></i>
              Cart ({getCartItemCount()})
              {cart.length > 0 && (
                <Badge bg="secondary" className="ms-2">
                  ${getCartTotal().toFixed(2)}
                </Badge>
              )}
            </Button>
          </div>
        )}
      </div>

      {error && <Alert variant="danger">{error}</Alert>}

      {/* Category Filter */}
      <Row className="mb-4">
        <Col md={3}>
          <Form.Group>
            <Form.Label>Category</Form.Label>
            <Form.Select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
            >
              {categoryOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </Form.Select>
          </Form.Group>
        </Col>
      </Row>

      {/* Products Grid */}
      <Row>
        {products.length === 0 ? (
          <Col>
            <Alert variant="info">No products found in this category.</Alert>
          </Col>
        ) : (
          products.map(product => (
            <Col key={product._id} md={6} lg={4} className="mb-4">
              <Card className="h-100">
                <Card.Img 
                  variant="top" 
                  src={product.image} 
                  alt={product.name}
                  style={{ height: '200px', objectFit: 'cover', cursor: 'pointer' }}
                  onClick={() => navigate(`/products/${product._id}`)}
                />
                <Card.Body className="d-flex flex-column">
                  <Card.Title 
                    style={{ cursor: 'pointer' }}
                    onClick={() => navigate(`/products/${product._id}`)}
                  >
                    {product.name}
                  </Card.Title>
                  <Card.Text className="text-muted small">
                    {truncateDescription(product.description)}
                  </Card.Text>
                  <div className="mt-auto">
                    <div className="d-flex justify-content-between align-items-center mb-2">
                      <h5 className="mb-0 text-primary">${product.price}</h5>
                      <Badge bg={product.inStock ? 'success' : 'danger'}>
                        {product.inStock ? 'In Stock' : 'Out of Stock'}
                      </Badge>
                    </div>
                    <div className="d-flex gap-2">
                      <Button 
                        variant="outline-primary" 
                        onClick={() => navigate(`/products/${product._id}`)}
                        className="flex-fill"
                        style={{ borderColor: '#4a5d23', color: '#4a5d23' }}
                      >
                        <i className="fas fa-eye me-1"></i>
                        Details
                      </Button>
                      <Button 
                        variant="primary" 
                        onClick={() => handleAddToCart(product)}
                        disabled={!product.inStock || !isAuthenticated}
                        className="flex-fill"
                        style={{ backgroundColor: '#4a5d23', borderColor: '#4a5d23' }}
                      >
                        {!isAuthenticated ? 'Login' : 'Add to Cart'}
                      </Button>
                    </div>
                  </div>
                </Card.Body>
              </Card>
            </Col>
          ))
        )}
      </Row>

      {/* Checkout Modal */}
      <Modal show={showCheckout} onHide={() => setShowCheckout(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Checkout</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {/* Cart Items */}
          <h5>Order Summary</h5>
          {cart.map(item => (
            <div key={item.product._id} className="d-flex justify-content-between align-items-center border-bottom py-2">
              <div>
                <strong>{item.product.name}</strong>
                <br />
                <small className="text-muted">${item.product.price} each</small>
              </div>
              <div className="d-flex align-items-center gap-2">
                <Button 
                  size="sm" 
                  variant="outline-secondary"
                  onClick={() => updateCartQuantity(item.product._id, item.quantity - 1)}
                >
                  -
                </Button>
                <span>{item.quantity}</span>
                <Button 
                  size="sm" 
                  variant="outline-secondary"
                  onClick={() => updateCartQuantity(item.product._id, item.quantity + 1)}
                >
                  +
                </Button>
                <Button 
                  size="sm" 
                  variant="outline-danger"
                  onClick={() => removeFromCart(item.product._id)}
                >
                  Remove
                </Button>
              </div>
            </div>
          ))}
          
          <div className="text-end mt-3">
            <h5>Total: ${getCartTotal().toFixed(2)}</h5>
          </div>

          <hr />
          <div className="text-muted">Pickup only. You will choose your pickup store on the next page.</div>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowCheckout(false)}>
            Cancel
          </Button>
          <Button 
            variant="primary" 
            onClick={handleCheckout}
          >
            Continue to Pickup Checkout
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default Shop; 
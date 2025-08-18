import React, { useEffect, useState } from 'react';
import { Container, Row, Col, Form, Button, Card, Spinner, Alert, Image, Badge } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { cafesAPI, paymentsAPI, Cafe } from '../services/api';
import { useCart } from '../context/CartContext';
import SEOHead from '../components/SEOHead';
import CafesMap from '../components/CafesMap';

const Checkout: React.FC = () => {
  const { cart } = useCart();
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const [cafes, setCafes] = useState<Cafe[]>([]);
  const [cafeId, setCafeId] = useState('');
  const [pickupTime, setPickupTime] = useState('ASAP');
  const [loading, setLoading] = useState(false);
  const [usePoints, setUsePoints] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const run = async () => {
      try {
        const res = await cafesAPI.getAll({ limit: 100 });
        setCafes(res.data?.cafes || []);
        if (res.data?.cafes?.[0]?._id) setCafeId(res.data.cafes[0]._id);
      } catch (e) {
        console.error(e);
      }
    };
    run();
  }, []);

  const total = cart.reduce((sum: number, i: any) => sum + (i.product.price || 0) * (i.quantity || 1), 0);
  
  // Redirect to shop if cart is empty
  useEffect(() => {
    if (cart.length === 0) {
      navigate('/shop');
    }
  }, [cart, navigate]);

  const handlePlaceOrder = async () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    try {
      setLoading(true);
      setError('');
      const items = cart.map((i: any) => ({
        name: i.product.name,
        price: i.product.price,
        quantity: i.quantity || 1,
        productId: i.product._id
      }));
      const res = await paymentsAPI.createCheckoutSession({ items, orderType: 'pickup', cafeId, pickupTime, usePoints });
      const raw: any = res as any;
      const data = raw?.data || {};
      const url = data.url || raw.url;
      const sessionId = data.sessionId || raw.sessionId;
      const orderId = data.orderId || raw.orderId;
      if (url) { window.location.assign(url); return; }
      if (sessionId) { window.location.assign(`https://checkout.stripe.com/c/pay/${sessionId}`); return; }
      if (raw.success && orderId) { navigate(`/checkout/success?order_id=${orderId}`); return; }
      setError('Unable to start checkout. Please try again.');
    } catch (e: any) {
      console.error(e);
      setError(e?.response?.data?.error || 'Failed to start checkout');
    } finally {
      setLoading(false);
    }
  };

  // Don't render anything if cart is empty (redirect should handle this)
  if (cart.length === 0) {
    return null;
  }

  return (
    <Container className="py-4">
      <SEOHead title="Checkout - Pickup" description="Choose a pickup store and complete your order" />
      
      {/* Header */}
      <Row className="mb-4">
        <Col>
          <Card className="border-0 shadow-sm" style={{ borderRadius: '15px', background: 'linear-gradient(135deg, #fff7ed 0%, #ffffff 100%)' }}>
            <Card.Body className="py-4">
              <div className="d-flex align-items-center">
                <i className="fas fa-shopping-cart fa-2x me-3" style={{ color: '#f59e0b' }}></i>
                <div>
                  <h1 className="mb-1" style={{ color: '#1f2937', fontSize: '2rem', fontWeight: '700' }}>
                    Checkout
                  </h1>
                  <p className="text-muted mb-0">Complete your order and choose pickup details</p>
                </div>
                <div className="ms-auto">
                  <Badge 
                    className="px-3 py-2"
                    style={{ backgroundColor: '#f59e0b', color: 'white', fontSize: '14px' }}
                  >
                    {cart.length} item{cart.length !== 1 ? 's' : ''} in cart
                  </Badge>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Row className="g-4">
        <Col lg={8}>
          {/* Cart Items */}
          <Card className="border-0 shadow-sm mb-4" style={{ borderRadius: '15px' }}>
            <Card.Body>
              <h4 className="mb-4" style={{ color: '#1f2937' }}>
                <i className="fas fa-list me-2" style={{ color: '#f59e0b' }}></i>
                Your Items
              </h4>
              <div className="cart-items">
                {cart.map((item: any, index: number) => (
                  <div key={index} className="d-flex align-items-center py-3 border-bottom">
                    <div className="me-3">
                      {item.product?.image ? (
                        <Image
                          src={item.product.image}
                          alt={item.product.name}
                          style={{ 
                            width: '80px', 
                            height: '80px', 
                            objectFit: 'cover',
                            border: '3px solid #fde68a',
                            borderRadius: '12px'
                          }}
                        />
                      ) : (
                        <div 
                          className="d-flex align-items-center justify-content-center rounded"
                          style={{ 
                            width: '80px', 
                            height: '80px',
                            backgroundColor: '#fff7ed',
                            border: '2px solid #fde68a'
                          }}
                        >
                          <i className="fas fa-shopping-bag" style={{ color: '#f59e0b' }}></i>
                        </div>
                      )}
                    </div>
                    <div className="flex-grow-1">
                      <h6 className="mb-1" style={{ color: '#1f2937' }}>
                        {item.product?.name || 'Unknown Item'}
                      </h6>
                      <p className="text-muted mb-2 small">
                        {item.product?.category || 'Product'}
                      </p>
                      <div className="d-flex align-items-center">
                        <Badge 
                          className="me-2 px-2 py-1"
                          style={{ backgroundColor: '#f59e0b', color: 'white' }}
                        >
                          Qty: {item.quantity || 1}
                        </Badge>
                        <span className="text-muted small">
                          ${(item.product?.price || 0).toFixed(2)} each
                        </span>
                      </div>
                    </div>
                    <div className="text-end">
                      <div className="fw-bold" style={{ color: '#f59e0b', fontSize: '18px' }}>
                        ${((item.product?.price || 0) * (item.quantity || 1)).toFixed(2)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Card.Body>
          </Card>

          {/* Pickup Details */}
          <Card className="border-0 shadow-sm" style={{ borderRadius: '15px' }}>
            <Card.Body>
              <h4 className="mb-4" style={{ color: '#1f2937' }}>
                <i className="fas fa-map-marker-alt me-2" style={{ color: '#f59e0b' }}></i>
                Pickup Details
              </h4>
              <Form>
                <Form.Group className="mb-3">
                  <Form.Label className="fw-bold">Pickup store</Form.Label>
                  <Form.Select 
                    value={cafeId} 
                    onChange={e => setCafeId(e.target.value)}
                    style={{ borderColor: '#fde68a' }}
                  >
                    {cafes.map((c: any) => (
                      <option key={c._id} value={c._id}>{c.name}</option>
                    ))}
                  </Form.Select>
                </Form.Group>
                <div className="mb-4">
                  <CafesMap cafes={cafes} height="350px" />
                  <div className="small text-muted mt-2">
                    <i className="fas fa-info-circle me-1" style={{ color: '#f59e0b' }}></i>
                    Tip: Click a location pin, then use the dropdown to confirm your pickup store.
                  </div>
                </div>
                <Form.Group className="mb-3">
                  <Form.Label className="fw-bold">Pickup time</Form.Label>
                  <Form.Select 
                    value={pickupTime} 
                    onChange={e => setPickupTime(e.target.value)}
                    style={{ borderColor: '#fde68a' }}
                  >
                    <option value="ASAP">ASAP</option>
                    <option value="15 min">In 15 minutes</option>
                    <option value="30 min">In 30 minutes</option>
                    <option value="1 hr">In 1 hour</option>
                  </Form.Select>
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Check
                    type="switch"
                    id="use-points-toggle"
                    label={`Use points (Available: ${user?.points ?? 0})`}
                    checked={usePoints}
                    onChange={(e) => setUsePoints(e.currentTarget.checked)}
                    disabled={(user?.points ?? 0) < total}
                    style={{ accentColor: '#f59e0b' }}
                  />
                  <div className="small text-muted mt-1">
                    <i className="fas fa-coins me-1" style={{ color: '#f59e0b' }}></i>
                    1 point = $1. {(user?.points ?? 0) < total ? 'Not enough points to cover this order.' : 'If enabled, we will complete the order using your points without redirecting to Stripe.'}
                  </div>
                </Form.Group>
              </Form>
              {error && (
                <Alert variant="danger" className="mt-3" style={{ borderColor: '#fecaca', backgroundColor: '#fef2f2' }}>
                  <i className="fas fa-exclamation-triangle me-2"></i>
                  {error}
                </Alert>
              )}
            </Card.Body>
          </Card>
        </Col>
        
        <Col lg={4}>
          <Card className="border-0 shadow-sm sticky-top" style={{ borderRadius: '15px', top: '20px' }}>
            <Card.Body>
              <h5 className="mb-4" style={{ color: '#1f2937' }}>
                <i className="fas fa-receipt me-2" style={{ color: '#f59e0b' }}></i>
                Order Summary
              </h5>
              
              {/* Summary Details */}
              <div className="mb-3">
                <div className="d-flex justify-content-between mb-2">
                  <span>Subtotal ({cart.length} item{cart.length !== 1 ? 's' : ''})</span>
                  <span>${total.toFixed(2)}</span>
                </div>
                {usePoints && (
                  <div className="d-flex justify-content-between mb-2 text-success">
                    <span>
                      <i className="fas fa-coins me-1"></i>
                      Points Discount
                    </span>
                    <span>-${total.toFixed(2)}</span>
                  </div>
                )}
                <div className="text-muted small mb-3">
                  <i className="fas fa-info-circle me-1"></i>
                  Taxes calculated at checkout
                </div>
                <hr />
                <div className="d-flex justify-content-between mb-3">
                  <strong style={{ fontSize: '18px' }}>Total</strong>
                  <strong style={{ fontSize: '18px', color: '#f59e0b' }}>
                    ${usePoints ? '0.00' : total.toFixed(2)}
                  </strong>
                </div>
              </div>
              
              <Button 
                className="w-100 mb-3" 
                onClick={handlePlaceOrder} 
                disabled={loading || !cafeId}
                style={{ 
                  backgroundColor: '#f59e0b', 
                  borderColor: '#f59e0b',
                  padding: '12px',
                  fontSize: '16px',
                  fontWeight: '600'
                }}
              >
                {loading ? (
                  <>
                    <Spinner size="sm" animation="border" className="me-2" />
                    Processing...
                  </>
                ) : (
                  <>
                    <i className="fas fa-credit-card me-2"></i>
                    {usePoints ? 'Complete Order' : 'Place Order & Pay'}
                  </>
                )}
              </Button>
              
              <Button 
                variant="outline-secondary"
                className="w-100"
                onClick={() => navigate('/shop')}
              >
                <i className="fas fa-arrow-left me-2"></i>
                Continue Shopping
              </Button>
            </Card.Body>
          </Card>

          {/* Test Payment Information */}
          <Card className="border-0 shadow-sm mt-3" style={{ borderRadius: '15px', backgroundColor: '#fff7ed' }}>
            <Card.Body>
              <h6 className="mb-3" style={{ color: '#1f2937' }}>
                <i className="fas fa-info-circle me-2" style={{ color: '#f59e0b' }}></i>
                Test Payment Information
              </h6>
              <div className="small" style={{ color: '#374151' }}>
                <div className="mb-2">
                  <strong>Credit Card Number:</strong> 4242 4242 4242 4242
                </div>
                <div className="mb-2">
                  <strong>Exp Date:</strong> Any date in the future
                </div>
                <div className="mb-2">
                  <strong>CCV:</strong> Random 3 numbers
                </div>
                <div className="mb-0">
                  <strong>Zip Code:</strong> Random 5 numbers
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default Checkout;



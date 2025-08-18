import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Container, 
  Row, 
  Col, 
  Card, 
  Button, 
  Spinner, 
  Alert, 
  Badge,
  Image,
  Modal
} from 'react-bootstrap';
import { orderAPI, Order } from '../services/api';
import { useAuth } from '../context/AuthContext';
import SEOHead from '../components/SEOHead';

interface OrderDetailProps {
  order: Order | null;
  show: boolean;
  onHide: () => void;
  onCancel: (id: string) => void;
}

const OrderDetailModal: React.FC<OrderDetailProps> = ({ order, show, onHide, onCancel }) => {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
      case 'delivered':
        return 'success';
      case 'processing':
      case 'shipped':
        return 'primary';
      case 'pending':
        return 'warning';
      case 'cancelled':
      case 'expired':
        return 'danger';
      default:
        return 'secondary';
    }
  };

  if (!order) return null;

  const canCancel = () => ['pending', 'processing'].includes(order.status);
  const handleCancel = () => onCancel(order._id);

  return (
    <Modal show={show} onHide={onHide} size="lg">
      <Modal.Header closeButton style={{ backgroundColor: '#f59e0b', color: 'white' }}>
        <Modal.Title>Order Details</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Row>
          <Col md={8}>
            <Card className="mb-3">
              <Card.Header>
                <h5 className="mb-0">{`Order #${order.orderNumber}`}</h5>
              </Card.Header>
              <Card.Body>
                <div>
                  {order.items.map((item, index) => (
                    <div key={index} className="d-flex align-items-center mb-3 pb-3 border-bottom">
                      {item.product?.image ? (
                        <Image
                          src={item.product.image}
                          alt={item.product.name}
                          style={{ width: '60px', height: '60px', objectFit: 'cover' }}
                          rounded
                        />
                      ) : (
                        <div 
                          className="bg-light d-flex align-items-center justify-content-center rounded"
                          style={{ width: '60px', height: '60px' }}
                        >
                          <i className="fas fa-shopping-bag text-muted"></i>
                        </div>
                      )}
                      <div className="ms-3 flex-grow-1">
                        <h6 className="mb-1">{item.product?.name || 'Unknown Item'}</h6>
                        <small className="text-muted">{item.product?.category || 'N/A'}</small>
                        <div className="mt-1">
                          <span className="text-muted">Qty: {item.quantity}</span>
                          <span className="ms-3">${item.price.toFixed(2)} each</span>
                        </div>
                      </div>
                      <div className="text-end">
                        <strong>${(item.price * item.quantity).toFixed(2)}</strong>
                      </div>
                    </div>
                  ))}
                  <div className="text-end">
                    <h5>Total: ${order.totalAmount.toFixed(2)}</h5>
                  </div>
                </div>
              </Card.Body>
            </Card>

            <Card className="mb-3">
              <Card.Header>
                <h6 className="mb-0">Pickup Location</h6>
              </Card.Header>
              <Card.Body>
                {order.cafe ? (
                  <address className="mb-0">
                    <strong>{order.cafe.name}</strong><br />
                    {order.cafe.location}<br />
                    {order.cafe.address && (
                      <>
                        {order.cafe.address.street && `${order.cafe.address.street}, `}
                        {order.cafe.address.city}, {order.cafe.address.state} {order.cafe.address.zipCode}<br />
                      </>
                    )}
                    {order.cafe.contact?.phone && (
                      <>
                        <i className="fas fa-phone me-2"></i>
                        {order.cafe.contact.phone}<br />
                      </>
                    )}
                    <div className="mt-2">
                      <Badge bg="info" className="px-2 py-1">
                        <i className="fas fa-coffee me-1"></i>
                        {order.orderType === 'pickup' ? 'Pickup Order' : order.orderType}
                      </Badge>
                      {order.pickupTime && (
                        <small className="text-muted d-block mt-1">
                          <i className="fas fa-clock me-1"></i>
                          Pickup: {order.pickupTime === 'ASAP' ? 'ASAP' : new Date(order.pickupTime).toLocaleString()}
                        </small>
                      )}
                    </div>
                  </address>
                ) : (
                  <div className="text-muted">
                    <i className="fas fa-map-marker-alt me-2"></i>
                    Pickup location not specified
                  </div>
                )}
              </Card.Body>
            </Card>
          </Col>

          <Col md={4}>
            <Card>
              <Card.Header>
                <h6 className="mb-0">Status & Activity</h6>
              </Card.Header>
              <Card.Body>
                <div className="mb-3">
                  <Badge bg={getStatusColor(order.status || 'pending')} className="px-3 py-2">
                    {(order.status || 'pending').charAt(0).toUpperCase() + (order.status || 'pending').slice(1)}
                  </Badge>
                </div>

                <div className="activity-timeline">
                  <div className="activity-item mb-3">
                    <div className="d-flex align-items-center">
                      <div className="activity-icon me-3">
                        <i className="fas fa-plus-circle text-success"></i>
                      </div>
                      <div>
                        <div className="fw-bold">Order Placed</div>
                        <small className="text-muted">{formatDate(order.createdAt)}</small>
                      </div>
                    </div>
                  </div>

                  {(order.status === 'processing' || order.status === 'shipped' || order.status === 'delivered') && (
                    <div className="activity-item mb-3">
                      <div className="d-flex align-items-center">
                        <div className="activity-icon me-3">
                          <i className="fas fa-cog text-primary"></i>
                        </div>
                        <div>
                          <div className="fw-bold">{order.status === 'processing' ? 'Order Processing' : order.status === 'shipped' ? 'Order Shipped' : 'Order Delivered'}</div>
                          <small className="text-muted">{formatDate(order.updatedAt || order.createdAt)}</small>
                        </div>
                      </div>
                    </div>
                  )}

                  {order.status === 'cancelled' && order.refund && order.refund.status === 'processed' && (
                    <div className="activity-item mb-3">
                      <div className="d-flex align-items-center">
                        <div className="activity-icon me-3">
                          <i className="fas fa-undo text-info"></i>
                        </div>
                        <div>
                          <div className="fw-bold">Refund Processed</div>
                          <small className="text-muted">${order.refund.amount} refunded on {new Date(order.refund.processedAt!).toLocaleDateString()}</small>
                        </div>
                      </div>
                    </div>
                  )}

                  {order.status === 'cancelled' && order.refund && order.refund.status === 'failed' && (
                    <div className="activity-item mb-3">
                      <div className="d-flex align-items-center">
                        <div className="activity-icon me-3">
                          <i className="fas fa-exclamation-triangle text-warning"></i>
                        </div>
                        <div>
                          <div className="fw-bold">Refund Failed</div>
                          <small className="text-muted">{order.refund.failureReason || 'Please contact support'}</small>
                        </div>
                      </div>
                    </div>
                  )}

                  {order.payment && (
                    <div className="mt-3 pt-3 border-top">
                      <h6 className="mb-2">Payment Details</h6>
                      <div className="small text-muted">
                        <div>Method: {order.payment.method.charAt(0).toUpperCase() + order.payment.method.slice(1)}</div>
                        {order.payment.transactionId && (<div>Transaction: {order.payment.transactionId}</div>)}
                        {order.payment.paidAt && (<div>Paid: {new Date(order.payment.paidAt).toLocaleDateString()}</div>)}
                      </div>
                    </div>
                  )}
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onHide}>Close</Button>
        {canCancel() && (
          <Button variant="outline-danger" onClick={handleCancel} className="me-2">
            <i className="fas fa-times me-2"></i>
            Cancel Order
          </Button>
        )}
      </Modal.Footer>
    </Modal>
  );
};

const Orders: React.FC = () => {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [cancelId, setCancelId] = useState('');
  const [cancelLoading, setCancelLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    fetchOrdersData();
  }, [isAuthenticated, navigate]);

  const fetchOrdersData = async () => {
    setLoading(true);
    setError('');

    try {
      const ordersResponse = await orderAPI.getUserOrders();
      if (ordersResponse.success && ordersResponse.data) {
        setOrders(ordersResponse.data.orders);
      } else {
        setError('Failed to load orders');
      }
    } catch (error) {
      setError('Failed to load orders');
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'confirmed':
      case 'delivered':
        return 'success';
      case 'processing':
      case 'shipped':
        return 'primary';
      case 'pending':
        return 'warning';
      case 'cancelled':
      case 'expired':
        return 'danger';
      default:
        return 'secondary';
    }
  };

  const showOrderDetail = (order: Order) => {
    setSelectedOrder(order);
    setShowDetailModal(true);
  };

  const handleCancelRequest = (id: string) => {
    setCancelId(id);
    setShowCancelConfirm(true);
    setShowDetailModal(false);
  };

  const handleCancelConfirm = async () => {
    setCancelLoading(true);
    setError('');
    try {
      const response = await orderAPI.cancel(cancelId);
      if (response.success) {
        const message = response.data?.refund?.success 
          ? `Order cancelled and $${response.data.refund.refund.amount} refund processed`
          : 'Order cancelled successfully';
        setSuccessMessage(message);
        setOrders(prev => prev.map(order => 
          order._id === cancelId ? { ...order, status: 'cancelled' as const, refund: response.data?.refund?.refund } : order
        ));
        setTimeout(() => setSuccessMessage(''), 5000);
      } else {
        setError(response.error || 'Failed to cancel order');
      }
    } catch (error: any) {
      setError(error.response?.data?.error || 'Failed to cancel order');
    } finally {
      setCancelLoading(false);
      setShowCancelConfirm(false);
    }
  };

  if (!isAuthenticated) {
    return null;
  }

  if (loading) {
    return (
      <Container className="text-center py-5">
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Loading...</span>
        </Spinner>
        <div className="mt-3">
          <h5>Loading your orders...</h5>
        </div>
      </Container>
    );
  }

  const allItems = orders
    .map(order => ({ ...order, type: 'order' as const }))
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  return (
    <Container>
      <SEOHead 
        title={`${user?.username}'s Orders - Sip Grounds`}
        description={`View your order history on Sip Grounds`}
      />

      <Row className="mb-4">
        <Col>
          <Card className="border-0 shadow-sm" style={{ borderRadius: '15px', background: 'linear-gradient(135deg, #fff7ed 0%, #ffffff 100%)' }}>
            <Card.Body className="py-4">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <h1 className="mb-2" style={{ color: '#1f2937', fontSize: '2.5rem', fontWeight: '700' }}>
                    <i className="fas fa-receipt me-3" style={{ color: '#f59e0b' }}></i>
                    My Orders
                  </h1>
                  <p className="text-muted mb-0 fs-5">Track your coffee orders and purchases</p>
                  <div className="mt-2">
                    <Badge 
                      className="px-3 py-2 me-2"
                      style={{ backgroundColor: '#f59e0b', color: 'white' }}
                    >
                      <i className="fas fa-box me-1"></i>
                      {orders.length} Total Orders
                    </Badge>
                    <Badge bg="success" className="px-3 py-2">
                      <i className="fas fa-check me-1"></i>
                      {orders.filter(o => o.status === 'delivered').length} Delivered
                    </Badge>
                  </div>
                </div>
                <div className="text-end">
                  <div className="d-flex flex-column gap-2">
                    <Button 
                      onClick={() => navigate('/shop')}
                      style={{ backgroundColor: '#f59e0b', borderColor: '#f59e0b' }}
                      className="text-white px-4 py-2"
                    >
                      <i className="fas fa-shopping-cart me-2"></i>
                      Continue Shopping
                    </Button>
                    <Button 
                      variant="outline-secondary"
                      onClick={() => navigate('/cafes')}
                      className="px-4 py-2"
                    >
                      <i className="fas fa-coffee me-2"></i>
                      Find Cafés
                    </Button>
                  </div>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {error && (
        <Alert variant="danger" className="mb-4">
          <i className="fas fa-exclamation-triangle me-2"></i>
          {error}
        </Alert>
      )}

      {successMessage && (
        <Alert variant="success" className="mb-4">
          <i className="fas fa-check-circle me-2"></i>
          {successMessage}
        </Alert>
      )}

      <Card>
        <Card.Body>
          {allItems.length === 0 ? (
            <div className="text-center py-5">
              <div 
                className="mb-4 mx-auto d-flex align-items-center justify-content-center"
                style={{
                  width: '120px',
                  height: '120px',
                  borderRadius: '50%',
                  backgroundColor: '#fff7ed',
                  border: '3px solid #fde68a'
                }}
              >
                <i className="fas fa-coffee fa-3x" style={{ color: '#f59e0b' }}></i>
              </div>
              <h3 className="mb-3" style={{ color: '#1f2937' }}>No orders yet</h3>
              <p className="text-muted mb-4 fs-5">
                Start your coffee journey by exploring our amazing selection of<br />
                fresh beans, brewing equipment, and delicious treats!
              </p>
              <div className="d-flex justify-content-center gap-3">
                <Button 
                  onClick={() => navigate('/shop')}
                  style={{ backgroundColor: '#f59e0b', borderColor: '#f59e0b' }}
                  className="text-white px-4 py-2"
                  size="lg"
                >
                  <i className="fas fa-shopping-cart me-2"></i>
                  Browse Our Shop
                </Button>
                <Button 
                  variant="outline-secondary"
                  onClick={() => navigate('/cafes')}
                  className="px-4 py-2"
                  size="lg"
                >
                  <i className="fas fa-map-marker-alt me-2"></i>
                  Find Nearby Cafés
                </Button>
              </div>
            </div>
          ) : (
            <Row>
              {allItems.map((item) => (
                <Col lg={4} md={6} className="mb-4" key={`order-${item._id}`}>
                  <Card 
                    className="h-100 border-0 shadow-sm" 
                    style={{ 
                      borderRadius: '15px',
                      transition: 'transform 0.2s, box-shadow 0.2s',
                      cursor: 'pointer'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'translateY(-5px)';
                      e.currentTarget.style.boxShadow = '0 8px 25px rgba(245, 158, 11, 0.15)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.boxShadow = '';
                    }}
                    onClick={() => showOrderDetail(item as Order)}
                  >
                    <Card.Body className="p-0">
                      {/* Header with gradient */}
                      <div 
                        className="px-4 py-3" 
                        style={{ 
                          background: 'linear-gradient(135deg, #f59e0b 0%, #fbbf24 100%)',
                          borderRadius: '15px 15px 0 0',
                          color: 'white'
                        }}
                      >
                        <Row className="align-items-center">
                          <Col xs={7}>
                            <div className="d-flex align-items-center">
                              <i className="fas fa-coffee me-2"></i>
                              <strong style={{ fontSize: '14px' }}>Pickup Order</strong>
                            </div>
                          </Col>
                          <Col xs={5} className="text-end">
                            <Badge 
                              bg={getStatusVariant(item.status || 'pending')} 
                              className="px-2 py-1"
                              style={{ fontSize: '11px' }}
                            >
                              {(item.status || 'pending').charAt(0).toUpperCase() + (item.status || 'pending').slice(1)}
                            </Badge>
                          </Col>
                        </Row>
                      </div>

                      <div className="px-4 py-3">
                        {/* Order Number and Date */}
                        <div className="d-flex justify-content-between align-items-center mb-3">
                          <div>
                            <div className="fw-bold" style={{ color: '#1f2937', fontSize: '16px' }}>
                              #{(item as Order).orderNumber}
                            </div>
                            <small className="text-muted">
                              {formatDate(item.createdAt)}
                            </small>
                          </div>
                          <div className="text-end">
                            <div className="fw-bold" style={{ color: '#f59e0b', fontSize: '18px' }}>
                              ${(item as Order).totalAmount.toFixed(2)}
                            </div>
                            <small className="text-muted">
                              {(item as Order).items.length} item{(item as Order).items.length !== 1 ? 's' : ''}
                            </small>
                          </div>
                        </div>

                        {/* Cafe Location */}
                        {item.cafe && (
                          <div className="mb-3 p-2 rounded" style={{ backgroundColor: '#fff7ed' }}>
                            <div className="d-flex align-items-center">
                              <i className="fas fa-map-marker-alt me-2" style={{ color: '#f59e0b' }}></i>
                              <div>
                                <div className="fw-bold" style={{ fontSize: '13px', color: '#1f2937' }}>
                                  {item.cafe.name}
                                </div>
                                <small className="text-muted">{item.cafe.location}</small>
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Product Preview */}
                        <div className="d-flex align-items-center mb-3">
                          <div className="me-3">
                            {(item as Order).items[0]?.product?.image ? (
                              <Image
                                src={(item as Order).items[0].product.image}
                                alt={(item as Order).items[0].product.name}
                                style={{ 
                                  width: '60px', 
                                  height: '60px', 
                                  objectFit: 'cover',
                                  border: '3px solid #fde68a',
                                  borderRadius: '12px'
                                }}
                              />
                            ) : (
                              <div 
                                className="d-flex align-items-center justify-content-center rounded"
                                style={{ 
                                  width: '60px', 
                                  height: '60px',
                                  backgroundColor: '#fff7ed',
                                  border: '2px solid #fde68a'
                                }}
                              >
                                <i className="fas fa-shopping-bag" style={{ color: '#f59e0b' }}></i>
                              </div>
                            )}
                          </div>
                          <div className="flex-grow-1">
                            <div className="fw-bold mb-1" style={{ fontSize: '15px', color: '#1f2937' }}>
                              {(item as Order).items[0]?.product?.name || 'Multiple Items'}
                              {(item as Order).items.length > 1 && (
                                <small className="text-muted ms-2">+{(item as Order).items.length - 1} more</small>
                              )}
                            </div>
                            <small className="text-muted">
                              {(item as Order).items[0]?.product?.category || 'Mixed Items'}
                            </small>
                          </div>
                        </div>

                        {/* Action Button */}
                        <div className="text-center">
                          <Button
                            variant="outline-warning"
                            size="sm"
                            className="w-100"
                            style={{ 
                              borderColor: '#f59e0b', 
                              color: '#f59e0b',
                              fontWeight: '600'
                            }}
                          >
                            <i className="fas fa-eye me-2"></i>
                            View Details
                          </Button>
                        </div>
                      </div>
                    </Card.Body>
                  </Card>
                </Col>
              ))}
            </Row>
          )}
        </Card.Body>
      </Card>

      <OrderDetailModal
        order={selectedOrder}
        show={showDetailModal}
        onHide={() => setShowDetailModal(false)}
        onCancel={handleCancelRequest}
      />

      <Modal show={showCancelConfirm} onHide={() => setShowCancelConfirm(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Confirm Cancellation</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="text-center">
            <i className="fas fa-exclamation-triangle fa-3x text-warning mb-3"></i>
            <h5>Are you sure you want to cancel this order?</h5>
            <p className="text-muted">This action cannot be undone. Your order will be cancelled and stock will be restored.</p>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowCancelConfirm(false)} disabled={cancelLoading}>
            Keep Order
          </Button>
          <Button variant="danger" onClick={handleCancelConfirm} disabled={cancelLoading}>
            {cancelLoading ? (<><Spinner animation="border" size="sm" className="me-2" />Cancelling...</>) : (<><i className="fas fa-times me-2"></i>Yes, Cancel Order</>)}
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default Orders; 
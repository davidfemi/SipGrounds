import React, { useEffect, useRef } from 'react';
import { Container, Row, Col, Button, Card } from 'react-bootstrap';
import { useNavigate, useSearchParams } from 'react-router-dom';
import SEOHead from '../components/SEOHead';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { paymentsAPI } from '../services/api';

const CheckoutSuccess: React.FC = () => {
  const navigate = useNavigate();
  const { clearCart } = useCart();
  const { refreshUser } = useAuth();
  const [params] = useSearchParams();

  const ran = useRef(false);
  useEffect(() => {
    if (ran.current) return; // prevent re-running on provider re-renders
    ran.current = true;
    clearCart();
    const sessionId = params.get('session_id');
    const orderId = params.get('order_id');
    // Optionally call backend to confirm order using session_id
    if (sessionId && orderId) {
      (async () => {
        try {
          await paymentsAPI.confirmPayment(sessionId, orderId);
        } catch (_) {
          // ignore; webhook will handle it
        } finally {
          // Ensure frontend reflects updated points
          await refreshUser();
        }
      })();
    } else {
      // Still refresh to pick up webhook-awarded points
      refreshUser().catch(() => {});
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <Container className="py-5">
      <SEOHead title="Order successful - SipGrounds" description="Thank you for your order!" />
      <Row className="justify-content-center">
        <Col md={8} lg={6}>
          <Card className="border-0 shadow-sm p-4 text-center">
            <div className="mb-3">
              <span role="img" aria-label="check" style={{ fontSize: '48px' }}>✅</span>
            </div>
            <h2 className="mb-2">Payment successful</h2>
            <p className="text-muted mb-4">Thanks for your order! We'll start preparing it right away.</p>
            <div className="d-flex gap-3 justify-content-center">
              <Button variant="primary" onClick={() => navigate('/orders')} style={{ backgroundColor: '#F7990C', borderColor: '#F7990C' }}>
                View my orders
              </Button>
              <Button variant="outline-secondary" onClick={() => navigate('/menu')}>
                Continue browsing
              </Button>
            </div>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default CheckoutSuccess;



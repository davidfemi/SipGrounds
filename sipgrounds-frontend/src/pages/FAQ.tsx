import React, { useState } from 'react';
import { Container, Row, Col, Card, Accordion } from 'react-bootstrap';
import SEOHead from '../components/SEOHead';

const faqs = [
  {
    category: 'Getting Started',
    icon: 'fas fa-rocket',
    items: [
      {
        q: 'What is SipGrounds?',
        a: 'SipGrounds is a community platform for coffee lovers. You can discover cafés, read and write reviews, order drinks, earn reward points, and share your favourite spots with others.',
      },
      {
        q: 'Is SipGrounds free to use?',
        a: 'Yes! Creating an account and exploring cafés is completely free. You only spend money when you place an order.',
      },
      {
        q: 'How do I create an account?',
        a: 'Click "Register" in the top navigation bar, enter your username, email, and a secure password, and you\'re good to go.',
      },
    ],
  },
  {
    category: 'Orders & Payments',
    icon: 'fas fa-shopping-cart',
    items: [
      {
        q: 'How do I place an order?',
        a: 'Browse the Menu, add items to your cart, and proceed to checkout. You can pay securely via card through our Stripe integration.',
      },
      {
        q: 'Can I cancel an order?',
        a: 'Orders can be cancelled before they enter the "Preparing" status. Navigate to My Orders and click "Cancel" if the option is still available.',
      },
      {
        q: 'Are refunds available?',
        a: 'Yes. Cancelled orders eligible for a refund will have funds returned to your original payment method within 5–10 business days.',
      },
    ],
  },
  {
    category: 'Rewards',
    icon: 'fas fa-gift',
    items: [
      {
        q: 'How do I earn reward points?',
        a: 'You earn points on every paid order, by writing reviews, and by participating in community polls. Each pound spent earns 1 point.',
      },
      {
        q: 'How do I redeem my points?',
        a: 'Visit the Rewards page, browse available rewards, and click "Redeem". A voucher code will be generated for use at checkout.',
      },
      {
        q: 'Do points expire?',
        a: 'Points do not expire as long as your account remains active (at least one login every 12 months).',
      },
    ],
  },
  {
    category: 'Cafés & Reviews',
    icon: 'fas fa-coffee',
    items: [
      {
        q: 'How do I add a café?',
        a: 'Log in, then visit Cafés → Add New Café. Fill in the details and upload at least one photo. Your listing will appear immediately.',
      },
      {
        q: 'Can I edit a café I added?',
        a: 'Yes. Visit the café detail page and click "Edit" — this option is only visible to the café\'s author.',
      },
      {
        q: 'How are review ratings calculated?',
        a: 'The star rating displayed on each café is the simple average of all submitted reviews, updated in real time.',
      },
    ],
  },
];

const FAQ: React.FC = () => {
  return (
    <>
      <SEOHead
        title="FAQ - SipGrounds"
        description="Frequently asked questions about SipGrounds — orders, rewards, reviews, and more."
      />

      {/* Hero */}
      <div
        className="text-white text-center py-5 mb-5"
        style={{
          background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
          borderRadius: '15px',
        }}
      >
        <i className="fas fa-question-circle fa-3x mb-3"></i>
        <h1 className="fw-bold">Frequently Asked Questions</h1>
        <p className="lead mb-0">Everything you need to know about SipGrounds</p>
      </div>

      <Container>
        <Row>
          {faqs.map(({ category, icon, items }) => (
            <Col md={6} key={category} className="mb-4">
              <Card className="border-0 shadow-sm h-100" style={{ borderRadius: '15px' }}>
                <Card.Header
                  className="text-white py-3"
                  style={{
                    background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                    borderRadius: '15px 15px 0 0',
                  }}
                >
                  <h5 className="mb-0">
                    <i className={`${icon} me-2`}></i>
                    {category}
                  </h5>
                </Card.Header>
                <Card.Body className="p-3">
                  <Accordion flush>
                    {items.map(({ q, a }, i) => (
                      <Accordion.Item key={i} eventKey={String(i)} className="border-bottom">
                        <Accordion.Header>
                          <span style={{ color: '#1f2937', fontWeight: 500 }}>{q}</span>
                        </Accordion.Header>
                        <Accordion.Body className="text-muted">{a}</Accordion.Body>
                      </Accordion.Item>
                    ))}
                  </Accordion>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>

        <div
          className="text-center p-4 mt-4 rounded"
          style={{ backgroundColor: '#fff7ed', border: '1px solid #fde68a' }}
        >
          <i className="fas fa-envelope fa-2x mb-2" style={{ color: '#f59e0b' }}></i>
          <p className="mb-1 fw-bold">Still have questions?</p>
          <p className="text-muted mb-0">
            Drop us a message at{' '}
            <a href="mailto:hello@sipgrounds.com" style={{ color: '#f59e0b' }}>
              hello@sipgrounds.com
            </a>{' '}
            and we'll get back to you within 24 hours.
          </p>
        </div>
      </Container>
    </>
  );
};

export default FAQ;

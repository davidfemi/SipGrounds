import React from 'react';
import { Container, Card } from 'react-bootstrap';
import SEOHead from '../components/SEOHead';

const sections = [
  {
    icon: 'fas fa-user-check',
    title: '1. Eligibility',
    content:
      'You must be at least 13 years old to create an account on SipGrounds. By registering, you confirm that the information you provide is accurate and that you will keep it up to date.',
  },
  {
    icon: 'fas fa-coffee',
    title: '2. Use of the Platform',
    content:
      'SipGrounds is for personal, non-commercial use. You agree not to scrape, spam, impersonate other users, post false reviews, or attempt to access restricted areas of the platform. We reserve the right to suspend accounts that violate these terms.',
  },
  {
    icon: 'fas fa-pen',
    title: '3. User Content',
    content:
      'You retain ownership of the content you post (reviews, café listings, photos). By submitting content, you grant SipGrounds a non-exclusive, royalty-free licence to display and distribute that content on the platform. You are responsible for ensuring your content does not infringe third-party rights.',
  },
  {
    icon: 'fas fa-shopping-bag',
    title: '4. Orders and Payments',
    content:
      'When you place an order, you enter into a direct transaction with SipGrounds. Prices are displayed inclusive of applicable taxes. Payments are processed by Stripe and subject to their terms of service. We reserve the right to cancel orders at our discretion and will issue a full refund in such cases.',
  },
  {
    icon: 'fas fa-gift',
    title: '5. Rewards',
    content:
      'Reward points have no monetary value and cannot be transferred, sold, or exchanged for cash. We reserve the right to modify or discontinue the rewards programme at any time with reasonable notice.',
  },
  {
    icon: 'fas fa-exclamation-triangle',
    title: '6. Limitation of Liability',
    content:
      'SipGrounds is provided "as is". We do not guarantee uninterrupted service and are not liable for indirect or consequential losses arising from your use of the platform. Our total liability to you shall not exceed the amount you paid us in the 12 months preceding the claim.',
  },
  {
    icon: 'fas fa-sync',
    title: '7. Changes to These Terms',
    content:
      'We may update these Terms of Service from time to time. Material changes will be communicated via email or a prominent notice on the platform. Continued use after changes take effect constitutes your acceptance of the new terms.',
  },
];

const Terms: React.FC = () => {
  return (
    <>
      <SEOHead
        title="Terms of Service - SipGrounds"
        description="SipGrounds Terms of Service — your rights and obligations when using our platform."
      />

      {/* Hero */}
      <div
        className="text-white text-center py-5 mb-5"
        style={{
          background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
          borderRadius: '15px',
        }}
      >
        <i className="fas fa-file-contract fa-3x mb-3"></i>
        <h1 className="fw-bold">Terms of Service</h1>
        <p className="lead mb-0">Last updated: March 2026</p>
      </div>

      <Container style={{ maxWidth: '860px' }}>
        <p className="text-muted mb-5">
          Please read these Terms of Service carefully before using SipGrounds. By creating an
          account or using the platform, you agree to be bound by these terms.
        </p>

        {sections.map(({ icon, title, content }) => (
          <Card key={title} className="border-0 shadow-sm mb-4" style={{ borderRadius: '15px' }}>
            <Card.Header
              className="text-white py-3"
              style={{
                background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                borderRadius: '15px 15px 0 0',
              }}
            >
              <h5 className="mb-0">
                <i className={`${icon} me-2`}></i>
                {title}
              </h5>
            </Card.Header>
            <Card.Body className="p-4">
              <p className="text-muted mb-0">{content}</p>
            </Card.Body>
          </Card>
        ))}

        <p className="text-muted text-center pb-4">
          Questions about these terms? Contact us at{' '}
          <a href="mailto:legal@sipgrounds.com" style={{ color: '#f59e0b' }}>
            legal@sipgrounds.com
          </a>
        </p>
      </Container>
    </>
  );
};

export default Terms;

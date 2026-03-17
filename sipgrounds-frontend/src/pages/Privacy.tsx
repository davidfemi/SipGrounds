import React from 'react';
import { Container, Card } from 'react-bootstrap';
import SEOHead from '../components/SEOHead';

const sections = [
  {
    icon: 'fas fa-database',
    title: 'Information We Collect',
    content: [
      'Account data: username, email address, and hashed password when you register.',
      'Profile data: optional first name, last name, and phone number you choose to provide.',
      'Usage data: pages visited, items ordered, reviews written, and reward activity.',
      'Payment data: we do not store card numbers — all payments are processed securely by Stripe.',
    ],
  },
  {
    icon: 'fas fa-cogs',
    title: 'How We Use Your Information',
    content: [
      'To operate your account and process your orders.',
      'To calculate and credit reward points.',
      'To send transactional emails (order confirmations, password resets).',
      'To improve the platform through aggregated, anonymised analytics.',
      'To detect and prevent fraud or abuse.',
    ],
  },
  {
    icon: 'fas fa-share-alt',
    title: 'Sharing Your Information',
    content: [
      'We do not sell your personal data to third parties.',
      'We share data with Stripe for payment processing and Cloudinary for image hosting.',
      'We may disclose data if required by law or to protect the rights of our users.',
      'Public reviews and café listings you create are visible to all users.',
    ],
  },
  {
    icon: 'fas fa-shield-alt',
    title: 'Your Rights',
    content: [
      'Access: request a copy of the personal data we hold about you.',
      'Correction: update inaccurate or incomplete data via your profile settings.',
      'Deletion: request that we delete your account and associated data.',
      'Portability: receive your data in a machine-readable format.',
      'To exercise these rights, email us at privacy@sipgrounds.com.',
    ],
  },
  {
    icon: 'fas fa-cookie-bite',
    title: 'Cookies',
    content: [
      'We use a session cookie to keep you logged in — it expires when you close your browser or log out.',
      'We do not use tracking or advertising cookies.',
      'You can disable cookies in your browser, but this will prevent you from logging in.',
    ],
  },
];

const Privacy: React.FC = () => {
  return (
    <>
      <SEOHead
        title="Privacy Policy - SipGrounds"
        description="SipGrounds privacy policy — how we collect, use, and protect your data."
      />

      {/* Hero */}
      <div
        className="text-white text-center py-5 mb-5"
        style={{
          background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
          borderRadius: '15px',
        }}
      >
        <i className="fas fa-lock fa-3x mb-3"></i>
        <h1 className="fw-bold">Privacy Policy</h1>
        <p className="lead mb-0">Last updated: March 2026</p>
      </div>

      <Container style={{ maxWidth: '860px' }}>
        <p className="text-muted mb-5">
          SipGrounds ("we", "us") is committed to protecting your privacy. This policy explains what
          data we collect, why we collect it, and how you can control it.
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
              <ul className="text-muted mb-0">
                {content.map((item, i) => (
                  <li key={i} className="mb-2">
                    {item}
                  </li>
                ))}
              </ul>
            </Card.Body>
          </Card>
        ))}

        <p className="text-muted text-center pb-4">
          Questions? Contact us at{' '}
          <a href="mailto:privacy@sipgrounds.com" style={{ color: '#f59e0b' }}>
            privacy@sipgrounds.com
          </a>
        </p>
      </Container>
    </>
  );
};

export default Privacy;

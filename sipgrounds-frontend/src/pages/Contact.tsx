import React, { useState } from 'react';
import { Container, Row, Col, Card, Form, Button, Alert } from 'react-bootstrap';
import SEOHead from '../components/SEOHead';

const Contact: React.FC = () => {
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real app this would POST to an API endpoint
    setSubmitted(true);
  };

  return (
    <>
      <SEOHead
        title="Contact Us - SipGrounds"
        description="Get in touch with the SipGrounds team. We'd love to hear from you."
      />

      {/* Hero */}
      <div
        className="text-white text-center py-5 mb-5"
        style={{
          background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
          borderRadius: '15px',
        }}
      >
        <i className="fas fa-envelope fa-3x mb-3"></i>
        <h1 className="fw-bold">Contact Us</h1>
        <p className="lead mb-0">We'd love to hear from you</p>
      </div>

      <Container>
        <Row>
          {/* Contact Info */}
          <Col md={4} className="mb-4">
            <Card className="border-0 shadow-sm h-100" style={{ borderRadius: '15px' }}>
              <Card.Header
                className="text-white py-3"
                style={{
                  background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                  borderRadius: '15px 15px 0 0',
                }}
              >
                <h5 className="mb-0">
                  <i className="fas fa-info-circle me-2"></i>
                  Get In Touch
                </h5>
              </Card.Header>
              <Card.Body className="p-4">
                {[
                  { icon: 'fas fa-envelope', label: 'Email', value: 'hello@sipgrounds.com' },
                  { icon: 'fas fa-clock', label: 'Response Time', value: 'Within 24 hours' },
                  { icon: 'fas fa-map-marker-alt', label: 'Based in', value: 'London, UK' },
                ].map(({ icon, label, value }) => (
                  <div key={label} className="d-flex align-items-start mb-4">
                    <div
                      className="me-3 d-flex align-items-center justify-content-center text-white rounded"
                      style={{ width: '40px', height: '40px', backgroundColor: '#f59e0b', flexShrink: 0 }}
                    >
                      <i className={icon}></i>
                    </div>
                    <div>
                      <div className="text-muted small">{label}</div>
                      <div className="fw-bold">{value}</div>
                    </div>
                  </div>
                ))}

                <hr />
                <p className="text-muted small mb-0">
                  For café partnership enquiries, technical support, or general feedback — we read
                  every message.
                </p>
              </Card.Body>
            </Card>
          </Col>

          {/* Contact Form */}
          <Col md={8} className="mb-4">
            <Card className="border-0 shadow-sm" style={{ borderRadius: '15px' }}>
              <Card.Header
                className="text-white py-3"
                style={{
                  background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                  borderRadius: '15px 15px 0 0',
                }}
              >
                <h5 className="mb-0">
                  <i className="fas fa-paper-plane me-2"></i>
                  Send a Message
                </h5>
              </Card.Header>
              <Card.Body className="p-4">
                {submitted ? (
                  <Alert variant="success" className="mb-0">
                    <i className="fas fa-check-circle me-2"></i>
                    Thanks for reaching out! We'll get back to you within 24 hours.
                  </Alert>
                ) : (
                  <Form onSubmit={handleSubmit}>
                    <Row>
                      <Col md={6}>
                        <Form.Group className="mb-3">
                          <Form.Label>Your Name</Form.Label>
                          <Form.Control
                            type="text"
                            name="name"
                            value={form.name}
                            onChange={handleChange}
                            placeholder="Jane Smith"
                            required
                          />
                        </Form.Group>
                      </Col>
                      <Col md={6}>
                        <Form.Group className="mb-3">
                          <Form.Label>Email Address</Form.Label>
                          <Form.Control
                            type="email"
                            name="email"
                            value={form.email}
                            onChange={handleChange}
                            placeholder="jane@example.com"
                            required
                          />
                        </Form.Group>
                      </Col>
                    </Row>
                    <Form.Group className="mb-3">
                      <Form.Label>Subject</Form.Label>
                      <Form.Select name="subject" value={form.subject} onChange={handleChange} required>
                        <option value="">Select a subject…</option>
                        <option>General Enquiry</option>
                        <option>Café Partnership</option>
                        <option>Technical Support</option>
                        <option>Report an Issue</option>
                        <option>Other</option>
                      </Form.Select>
                    </Form.Group>
                    <Form.Group className="mb-4">
                      <Form.Label>Message</Form.Label>
                      <Form.Control
                        as="textarea"
                        rows={5}
                        name="message"
                        value={form.message}
                        onChange={handleChange}
                        placeholder="Tell us how we can help…"
                        required
                      />
                    </Form.Group>
                    <Button
                      type="submit"
                      className="text-white"
                      style={{ backgroundColor: '#f59e0b', borderColor: '#f59e0b' }}
                    >
                      <i className="fas fa-paper-plane me-2"></i>
                      Send Message
                    </Button>
                  </Form>
                )}
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </>
  );
};

export default Contact;

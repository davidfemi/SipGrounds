import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Container, 
  Row, 
  Col, 
  Card, 
  Button, 
  Badge,
  ListGroup,
  Carousel,
  Alert,
  Modal,
  Form,
  Spinner
} from 'react-bootstrap';
import { cafesAPI, Cafe, reviewsAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import LoadingScreen from '../components/LoadingScreen';
import SEOHead from '../components/SEOHead';
import { toast } from 'react-toastify';

const CafeDetail: React.FC = () => {
  const [cafe, setCafe] = useState<Cafe | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showImageModal, setShowImageModal] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [reviewForm, setReviewForm] = useState({ rating: 5, body: '' });
  const [reviewLoading, setReviewLoading] = useState(false);

  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();

  useEffect(() => {
    if (id) {
      fetchCafe(id);
    }
  }, [id]);

  const fetchCafe = async (cafeId: string) => {
    setLoading(true);
    setError('');

    try {
      const response = await cafesAPI.getById(cafeId);
      if (response.success && response.data) {
        setCafe(response.data.cafe);
      } else {
        setError('Café not found');
      }
    } catch (error) {
      setError('Failed to load café details');
      console.error('Error fetching café:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!cafe || !window.confirm('Are you sure you want to delete this café?')) return;

    try {
      const response = await cafesAPI.delete(cafe._id);
      if (response.success) {
        toast.success('Café deleted successfully');
        navigate('/cafes');
      } else {
        toast.error('Failed to delete café');
      }
    } catch (error) {
      toast.error('Failed to delete café');
      console.error('Delete error:', error);
    }
  };

  const getPriceRangeText = (priceRange: string) => {
    const ranges = {
      '$': 'Budget-friendly',
      '$$': 'Moderate',
      '$$$': 'Upscale', 
      '$$$$': 'Premium'
    };
    return ranges[priceRange as keyof typeof ranges] || priceRange;
  };

  const getOpenStatus = () => {
    if (!cafe) return null;
    
    // If we have hours data, calculate open status
    if (cafe.hours) {
      const now = new Date();
      const currentDay = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'][now.getDay()];
      const todayHours = cafe.hours[currentDay as keyof typeof cafe.hours];
      
      if (todayHours && !todayHours.closed) {
        const currentTime = now.getHours() * 100 + now.getMinutes();
        const openTime = parseInt(todayHours.open?.replace(':', '') || '0');
        const closeTime = parseInt(todayHours.close?.replace(':', '') || '2359');
        
        const isOpen = currentTime >= openTime && currentTime <= closeTime;
        return isOpen ? 
          <Badge bg="success">Open Now</Badge> : 
          <Badge bg="danger">Closed</Badge>;
      } else {
        return <Badge bg="secondary">Closed Today</Badge>;
      }
    }
    
    return cafe.isOpen ? 
      <Badge bg="success">Open Now</Badge> : 
      <Badge bg="secondary">Closed</Badge>;
  };

  const formatHours = (hours: any): string => {
    // Return a simple, consistent hours format
    return "Sunday to Monday 4AM - 11PM";
  };

  const handleImageClick = (index: number) => {
    setSelectedImageIndex(index);
    setShowImageModal(true);
  };

  const handleReviewSubmit = async () => {
    if (!cafe || !reviewForm.body.trim()) {
      toast.error('Please write a review');
      return;
    }

    setReviewLoading(true);
    try {
      const response = await reviewsAPI.create(cafe._id, reviewForm);
      if (response.success) {
        toast.success(response.message || 'Review added successfully! You earned 2 points.');
        setShowReviewModal(false);
        setReviewForm({ rating: 5, body: '' });
        // Refresh the cafe data to show the new review
        fetchCafe(cafe._id);
      } else {
        toast.error('Failed to add review');
      }
    } catch (error) {
      toast.error('Failed to add review');
      console.error('Review error:', error);
    } finally {
      setReviewLoading(false);
    }
  };

  const isOwner = cafe && user && cafe.author._id === user.id;

  if (loading) {
    return <LoadingScreen />;
  }

  if (error || !cafe) {
    return (
      <Container className="py-4">
        <Alert variant="danger">
          <i className="fas fa-exclamation-triangle me-2"></i>
          {error || 'Café not found'}
        </Alert>
        <Button variant="primary" onClick={() => navigate('/cafes')}>
          <i className="fas fa-arrow-left me-2"></i>
          Back to Cafés
        </Button>
      </Container>
    );
  }

  return (
    <>
      <SEOHead 
        title={`${cafe.name} - Sip Grounds`}
        description={cafe.description || `Visit ${cafe.name} in ${cafe.location}. ${getPriceRangeText(cafe.priceRange)} pricing.`}
        keywords={`${cafe.name}, cafe, coffee, ${cafe.location}, ${cafe.specialties?.join(', ') || ''}`}
      />
      
      <Container className="py-4">
        {/* Header */}
        <Row className="mb-4">
          <Col>
            <div className="d-flex justify-content-between align-items-start">
              <div>
                <h1 className="mb-2">{cafe.name}</h1>
                <p className="text-muted mb-2">
                  <i className="fas fa-map-marker-alt me-2"></i>
                  {cafe.location}
                </p>
                <div className="d-flex align-items-center mb-3">
                  <div className="me-3">
                    {[...Array(5)].map((_, i) => (
                      <i 
                        key={i}
                        className={`fas fa-star ${i < Math.floor(cafe.averageRating) ? 'text-warning' : 'text-muted'}`}
                      ></i>
                    ))}
                    <small className="text-muted ms-1">
                      ({cafe.reviews?.length || 0} reviews)
                    </small>
                  </div>
                  {getOpenStatus()}
                </div>
              </div>
              <div className="text-end">
                <h3 className="mb-2">
                  <Badge bg="secondary">{getPriceRangeText(cafe.priceRange)}</Badge>
                </h3>
                {cafe.pointsMultiplier > 1 && (
                  <Badge bg="warning" text="dark" className="mb-2">
                    <i className="fas fa-coins me-1"></i>
                    {cafe.pointsMultiplier}x Points
                  </Badge>
                )}
                {isOwner && (
                  <div>
                    <Button 
                      size="sm" 
                      className="me-2"
                      style={{ backgroundColor: '#f59e0b', borderColor: '#f59e0b' }}
                      onClick={() => navigate(`/cafes/${cafe._id}/edit`)}
                    >
                      <i className="fas fa-edit me-1"></i>
                      Edit
                    </Button>
                    <Button 
                      variant="outline-danger"
                      size="sm"
                      onClick={handleDelete}
                    >
                      <i className="fas fa-trash me-1"></i>
                      Delete
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </Col>
        </Row>

        <Row>
          <Col lg={8}>
            {/* Image Carousel */}
            {cafe.images && cafe.images.length > 0 && (
              <Card className="mb-4">
                <Card.Body className="p-0">
                  <Carousel 
                    interval={null}
                    indicators={cafe.images.length > 1}
                    controls={cafe.images.length > 1}
                  >
                    {cafe.images.map((image, index) => (
                      <Carousel.Item key={index}>
                        <div 
                          style={{ 
                            height: '400px',
                            background: '#f8f9fa',
                            position: 'relative',
                            overflow: 'hidden'
                          }}
                        >
                          <img
                            src={image.url}
                            alt={`${cafe.name} view ${index + 1}`}
                            className="d-block w-100 h-100"
                            style={{ objectFit: 'cover', cursor: 'pointer' }}
                            onClick={() => handleImageClick(index)}
                          />
                        </div>
                        {cafe.images.length > 1 && (
                          <Carousel.Caption 
                            style={{ 
                              backgroundColor: 'rgba(0,0,0,0.5)', 
                              borderRadius: '5px',
                              bottom: '10px',
                              left: '50%',
                              transform: 'translateX(-50%)',
                              width: 'auto',
                              position: 'absolute'
                            }}
                          >
                            <p>{index + 1} of {cafe.images.length}</p>
                          </Carousel.Caption>
                        )}
                      </Carousel.Item>
                    ))}
                  </Carousel>
                </Card.Body>
              </Card>
            )}

            {/* About Section */}
            <Card className="mb-4">
              <Card.Header>
                <h5 className="mb-0">
                  <i className="fas fa-info-circle me-2"></i>
                  About {cafe.name}
                </h5>
              </Card.Header>
              <Card.Body>
                <div className="cafe-description">
                  {cafe.description ? (
                    cafe.description.split('\n').map((paragraph, index) => (
                      <p key={index} className="mb-3">{paragraph}</p>
                    ))
                  ) : (
                    <p className="text-muted">No description available.</p>
                  )}
                </div>
              </Card.Body>
            </Card>

            {/* Reviews Section */}
            <Card>
              <Card.Header>
                <h5 className="mb-0">
                  <i className="fas fa-star me-2"></i>
                  Reviews ({cafe.reviews?.length || 0})
                </h5>
              </Card.Header>
              <Card.Body>
                {cafe.reviews && cafe.reviews.length > 0 ? (
                  <div className="reviews-section">
                    {/* Add Review Button for Existing Reviews */}
                    {isAuthenticated && (
                      <div className="text-center mb-4">
                        <Button 
                          style={{ backgroundColor: '#f59e0b', borderColor: '#f59e0b' }}
                          className="text-white"
                          onClick={() => setShowReviewModal(true)}
                        >
                          <i className="fas fa-plus me-2"></i>
                          Write a Review
                        </Button>
                      </div>
                    )}
                    
                    {cafe.reviews.map((review) => (
                      <div key={review._id} className="review-item border-bottom py-3">
                        <div className="d-flex justify-content-between align-items-start">
                          <div className="flex-grow-1">
                            <div className="d-flex align-items-center mb-2">
                              <strong className="me-2">{review.author.username}</strong>
                              <div>
                                {[...Array(5)].map((_, i) => (
                                  <i 
                                    key={i}
                                    className={`fas fa-star ${i < review.rating ? 'text-warning' : 'text-muted'}`}
                                    style={{ fontSize: '14px' }}
                                  ></i>
                                ))}
                              </div>
                              <small className="text-muted ms-2">
                                {new Date(review.createdAt).toLocaleDateString()}
                              </small>
                            </div>
                            <p className="mb-0">{review.body}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-4">
                    <i className="fas fa-star fa-3x text-muted mb-3"></i>
                    <p className="text-muted">No reviews yet. Be the first to review this café!</p>
                    {isAuthenticated && (
                      <Button 
                        style={{ backgroundColor: '#f59e0b', borderColor: '#f59e0b' }}
                        className="text-white"
                        onClick={() => setShowReviewModal(true)}
                      >
                        <i className="fas fa-plus me-2"></i>
                        Write a Review
                      </Button>
                    )}
                  </div>
                )}
              </Card.Body>
            </Card>
          </Col>

          <Col lg={4}>
            {/* Café Info */}
            <Card className="mb-4">
              <Card.Header>
                <h5 className="mb-0">Café Information</h5>
              </Card.Header>
              <ListGroup variant="flush">
                <ListGroup.Item className="px-0 d-flex justify-content-between">
                  <span>Price Range:</span>
                  <strong>{getPriceRangeText(cafe.priceRange)}</strong>
                </ListGroup.Item>
                <ListGroup.Item className="px-0 d-flex justify-content-between">
                  <span>Average rating:</span>
                  <span>
                    {cafe.averageRating.toFixed(1)} ⭐
                  </span>
                </ListGroup.Item>
                <ListGroup.Item className="px-0 d-flex justify-content-between">
                  <span>Status:</span>
                  {getOpenStatus()}
                </ListGroup.Item>
                {cafe.pointsMultiplier > 1 && (
                  <ListGroup.Item className="px-0 d-flex justify-content-between">
                    <span>Points Multiplier:</span>
                    <Badge bg="warning" text="dark">
                      {cafe.pointsMultiplier}x
                    </Badge>
                  </ListGroup.Item>
                )}
              </ListGroup>
            </Card>

            {/* Amenities */}
            {cafe.amenities && cafe.amenities.length > 0 && (
              <Card className="mb-4">
                <Card.Header>
                  <h5 className="mb-0">Amenities</h5>
                </Card.Header>
                <Card.Body>
                  <div className="d-flex flex-wrap gap-2">
                    {cafe.amenities.map((amenity) => (
                      <Badge key={amenity} bg="light" text="dark">
                        {amenity.replace('_', ' ')}
                      </Badge>
                    ))}
                  </div>
                </Card.Body>
              </Card>
            )}



            {/* Address */}
            {cafe.address && (
              <Card className="mb-4">
                <Card.Header>
                  <h5 className="mb-0">
                    <i className="fas fa-map-marker-alt me-2"></i>
                    Address
                  </h5>
                </Card.Header>
                <Card.Body>
                  <address className="mb-0">
                    {cafe.address.street && <div>{cafe.address.street}</div>}
                    <div>
                      {cafe.address.city}{cafe.address.state && `, ${cafe.address.state}`} {cafe.address.zipCode}
                    </div>
                    {cafe.address.country && <div>{cafe.address.country}</div>}
                  </address>
                  <Button 
                    size="sm" 
                    className="mt-2 text-white"
                    style={{ backgroundColor: '#f59e0b', borderColor: '#f59e0b' }}
                    onClick={() => {
                      const address = `${cafe.address?.street || ''} ${cafe.address?.city || ''} ${cafe.address?.state || ''} ${cafe.address?.zipCode || ''}`.trim();
                      window.open(`https://maps.google.com?q=${encodeURIComponent(address)}`, '_blank');
                    }}
                  >
                    <i className="fas fa-directions me-1"></i>
                    Get Directions
                  </Button>
                </Card.Body>
              </Card>
            )}

            {/* Business Hours */}
            {cafe.hours && (
              <Card className="mb-4">
                <Card.Header>
                  <h5 className="mb-0">
                    <i className="fas fa-clock me-2"></i>
                    Hours
                  </h5>
                </Card.Header>
                <Card.Body>
                  <div className="hours-display text-center">
                    <h6 className="mb-0">{formatHours(cafe.hours)}</h6>
                  </div>
                </Card.Body>
              </Card>
            )}

            {/* Contact Info */}
            {cafe.contact && (
              <Card className="mb-4">
                <Card.Header>
                  <h5 className="mb-0">
                    <i className="fas fa-phone me-2"></i>
                    Contact
                  </h5>
                </Card.Header>
                <Card.Body>
                  {cafe.contact.phone && (
                    <p className="mb-2">
                      <i className="fas fa-phone me-2"></i>
                      <a href={`tel:${cafe.contact.phone}`}>{cafe.contact.phone}</a>
                    </p>
                  )}
                  {cafe.contact.website && (
                    <p className="mb-2">
                      <i className="fas fa-globe me-2"></i>
                      <a href={cafe.contact.website} target="_blank" rel="noopener noreferrer">
                        Website
                      </a>
                    </p>
                  )}
                  {cafe.contact.email && (
                    <p className="mb-2">
                      <i className="fas fa-envelope me-2"></i>
                      <a href={`mailto:${cafe.contact.email}`}>{cafe.contact.email}</a>
                    </p>
                  )}
                  {cafe.contact.socialMedia && (
                    <div className="social-media mt-3">
                      {cafe.contact.socialMedia.instagram && (
                        <a 
                          href={cafe.contact.socialMedia.instagram} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="btn btn-outline-danger btn-sm me-2"
                        >
                          <i className="fab fa-instagram"></i>
                        </a>
                      )}
                      {cafe.contact.socialMedia.facebook && (
                        <a 
                          href={cafe.contact.socialMedia.facebook} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="btn btn-outline-primary btn-sm me-2"
                        >
                          <i className="fab fa-facebook"></i>
                        </a>
                      )}
                      {cafe.contact.socialMedia.twitter && (
                        <a 
                          href={cafe.contact.socialMedia.twitter} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="btn btn-outline-info btn-sm"
                        >
                          <i className="fab fa-twitter"></i>
                        </a>
                      )}
                    </div>
                  )}
                </Card.Body>
              </Card>
            )}

            {/* Action Buttons */}
            <div className="d-grid gap-2">
              <Button 
                size="lg"
                onClick={() => navigate('/shop')}
                style={{ backgroundColor: '#f59e0b', borderColor: '#f59e0b' }}
                className="text-white"
              >
                <i className="fas fa-shopping-cart me-2"></i>
                Browse Shop
              </Button>

              <Button 
                onClick={() => {
                  const address = cafe.address ? 
                    `${cafe.address?.street || ''} ${cafe.address?.city || ''} ${cafe.address?.state || ''} ${cafe.address?.zipCode || ''}`.trim() :
                    cafe.location;
                  window.open(`https://maps.google.com?q=${encodeURIComponent(address)}`, '_blank');
                }}
                style={{ backgroundColor: '#f59e0b', borderColor: '#f59e0b' }}
                className="text-white"
              >
                <i className="fas fa-map-marker-alt me-2"></i>
                Get Directions
              </Button>
              
              <Button 
                variant="outline-secondary"
                onClick={() => navigate('/cafes')}
              >
                <i className="fas fa-arrow-left me-2"></i>
                Back to Cafés
              </Button>
            </div>
          </Col>
        </Row>

        {/* Image Modal */}
        <Modal 
          show={showImageModal} 
          onHide={() => setShowImageModal(false)} 
          size="lg"
          centered
        >
          <Modal.Header closeButton className="border-0">
            <Modal.Title>{cafe.name} - Image Gallery</Modal.Title>
          </Modal.Header>
          <Modal.Body className="p-0">
            {cafe.images && cafe.images.length > 0 && (
              <Carousel 
                activeIndex={selectedImageIndex}
                onSelect={(selectedIndex) => setSelectedImageIndex(selectedIndex)}
                interval={null}
                indicators={cafe.images.length > 1}
                controls={cafe.images.length > 1}
              >
                {cafe.images.map((image, index) => (
                  <Carousel.Item key={index}>
                    <div style={{ height: '500px', background: '#f8f9fa' }}>
                      <img
                        src={image.url}
                        alt={`${cafe.name} view ${index + 1}`}
                        className="d-block w-100 h-100"
                        style={{ objectFit: 'contain' }}
                      />
                    </div>
                    <Carousel.Caption 
                      style={{ 
                        backgroundColor: 'rgba(0,0,0,0.7)', 
                        borderRadius: '5px',
                        position: 'absolute',
                        bottom: '20px',
                        left: '50%',
                        transform: 'translateX(-50%)',
                        width: 'auto'
                      }}
                    >
                      <p className="mb-0">{index + 1} of {cafe.images.length}</p>
                    </Carousel.Caption>
                  </Carousel.Item>
                ))}
              </Carousel>
            )}
          </Modal.Body>
        </Modal>

        {/* Review Modal */}
        <Modal 
          show={showReviewModal} 
          onHide={() => setShowReviewModal(false)} 
          centered
        >
          <Modal.Header closeButton>
            <Modal.Title>Write a Review for {cafe.name}</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form>
              <Form.Group className="mb-3">
                <Form.Label>Rating</Form.Label>
                <div className="d-flex align-items-center mb-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <i
                      key={star}
                      className={`fas fa-star me-1 ${star <= reviewForm.rating ? 'text-warning' : 'text-muted'}`}
                      style={{ cursor: 'pointer', fontSize: '1.5rem' }}
                      onClick={() => setReviewForm({ ...reviewForm, rating: star })}
                    ></i>
                  ))}
                  <span className="ms-2 text-muted">({reviewForm.rating} star{reviewForm.rating !== 1 ? 's' : ''})</span>
                </div>
              </Form.Group>
              
              <Form.Group className="mb-3">
                <Form.Label>Your Review</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={4}
                  placeholder="Share your experience at this café..."
                  value={reviewForm.body}
                  onChange={(e) => setReviewForm({ ...reviewForm, body: e.target.value })}
                />
              </Form.Group>
              
              <div className="text-muted small mb-3">
                <i className="fas fa-coins me-1" style={{ color: '#f59e0b' }}></i>
                You'll earn 2 points for writing this review!
              </div>
            </Form>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="outline-secondary" onClick={() => setShowReviewModal(false)}>
              Cancel
            </Button>
            <Button 
              style={{ backgroundColor: '#f59e0b', borderColor: '#f59e0b' }}
              className="text-white"
              onClick={handleReviewSubmit}
              disabled={reviewLoading || !reviewForm.body.trim()}
            >
              {reviewLoading ? (
                <>
                  <Spinner size="sm" className="me-2" />
                  Submitting...
                </>
              ) : (
                <>
                  <i className="fas fa-paper-plane me-2"></i>
                  Submit Review
                </>
              )}
            </Button>
          </Modal.Footer>
        </Modal>
      </Container>
    </>
  );
};

export default CafeDetail;
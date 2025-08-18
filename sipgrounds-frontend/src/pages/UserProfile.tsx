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
  Modal,
  Form
} from 'react-bootstrap';
import { userAPI, UserProfile as UserProfileType } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { updateIntercomUser } from '../services/intercomService';
import SEOHead from '../components/SEOHead';

const UserProfile: React.FC = () => {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  
  const [userProfile, setUserProfile] = useState<UserProfileType | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showEditModal, setShowEditModal] = useState(false);
  const [editForm, setEditForm] = useState({
    firstName: '',
    lastName: '',
    phone: ''
  });

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    fetchUserData();
  }, [isAuthenticated, navigate]);

  const fetchUserData = async () => {
    setLoading(true);
    setError('');

    try {
      const profileResponse = await userAPI.getProfile();

      if (profileResponse.success && profileResponse.data) {
        setUserProfile(profileResponse.data.user);
        
        // Update Intercom with fresh user profile
        updateIntercomUser(profileResponse.data.user, []);
      } else {
        setError('Failed to load profile data');
      }
    } catch (error) {
      setError('Failed to load profile data');
      console.error('Error fetching user data:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return 'Unknown';
    
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return 'Unknown';
    
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
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
          <h5>Loading your profile...</h5>
        </div>
      </Container>
    );
  }

  const displayUser = userProfile || user;

  return (
    <Container>
      <SEOHead 
        title={`${displayUser?.username}'s Profile - Sip Grounds`}
        description={`View ${displayUser?.username}'s profile on Sip Grounds`}
      />
      
      {/* Profile Header */}
      <Row className="mb-4">
        <Col>
          <Card className="shadow-sm border-0" style={{ borderRadius: '15px' }}>
            <Card.Body className="p-4">
              <Row className="align-items-center">
                <Col md={8}>
                  <div className="profile-info">
                    <div className="d-flex align-items-center mb-3">
                      <div 
                        className="profile-avatar me-3 d-flex align-items-center justify-content-center text-white fw-bold"
                        style={{ 
                          width: '80px', 
                          height: '80px', 
                          borderRadius: '50%', 
                          backgroundColor: '#f59e0b',
                          fontSize: '2rem'
                        }}
                      >
                        {displayUser?.username?.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <h1 className="mb-2" style={{ color: '#1f2937' }}>
                          {displayUser?.username}
                        </h1>
                        <p className="text-muted mb-1">
                          <i className="fas fa-envelope me-2"></i>
                          {displayUser?.email}
                        </p>
                        <p className="text-muted mb-0">
                          <i className="fas fa-calendar me-2"></i>
                          Member since {userProfile ? formatDate(userProfile.createdAt) : 'Recently'}
                        </p>
                      </div>
                    </div>
                    
                    {/* Points Display */}
                    <div className="points-card p-3 rounded" style={{ backgroundColor: '#fff7ed', border: '2px solid #fde68a' }}>
                      <div className="d-flex align-items-center">
                        <i className="fas fa-coins fa-2x me-3" style={{ color: '#f59e0b' }}></i>
                        <div>
                          <h3 className="mb-0" style={{ color: '#f59e0b' }}>
                            {userProfile?.points || 0}
                          </h3>
                          <small className="text-muted">Reward Points</small>
                        </div>
                        <Button 
                          variant="outline-warning" 
                          size="sm" 
                          className="ms-auto"
                          onClick={() => navigate('/rewards')}
                          style={{ borderColor: '#f59e0b', color: '#f59e0b' }}
                        >
                          <i className="fas fa-gift me-1"></i>
                          Redeem
                        </Button>
                      </div>
                    </div>
                  </div>
                </Col>
                <Col md={4} className="text-md-end">
                  <div className="profile-stats">
                    <Row>
                      <Col xs={4} className="text-center mb-3">
                        <div 
                          className="stat-card p-3 rounded text-center"
                          style={{ backgroundColor: '#f8fafc', border: '1px solid #e2e8f0' }}
                        >
                          <div className="stat-number fs-4 fw-bold" style={{ color: '#f59e0b' }}>
                            {userProfile?.stats.cafes || userProfile?.stats.campgrounds || 0}
                          </div>
                          <div className="stat-label text-muted small">
                            Cafés
                          </div>
                        </div>
                      </Col>
                      <Col xs={4} className="text-center mb-3">
                        <div 
                          className="stat-card p-3 rounded text-center"
                          style={{ backgroundColor: '#f8fafc', border: '1px solid #e2e8f0' }}
                        >
                          <div className="stat-number fs-4 fw-bold" style={{ color: '#f59e0b' }}>
                            {userProfile?.stats.reviews || 0}
                          </div>
                          <div className="stat-label text-muted small">
                            Reviews
                          </div>
                        </div>
                      </Col>
                      <Col xs={4} className="text-center mb-3">
                        <div 
                          className="stat-card p-3 rounded text-center"
                          style={{ backgroundColor: '#f8fafc', border: '1px solid #e2e8f0' }}
                        >
                          <div className="stat-number fs-4 fw-bold" style={{ color: '#f59e0b' }}>
                            {userProfile?.stats.totalPointsEarned || 0}
                          </div>
                          <div className="stat-label text-muted small">
                            Total Points
                          </div>
                        </div>
                      </Col>
                    </Row>
                    
                    <Button 
                      variant="outline-primary" 
                      className="w-100 mt-2"
                      onClick={() => setShowEditModal(true)}
                      style={{ borderColor: '#f59e0b', color: '#f59e0b' }}
                    >
                      <i className="fas fa-edit me-2"></i>
                      Edit Profile
                    </Button>
                  </div>
                </Col>
              </Row>
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

      {/* Quick Actions */}
      <Row className="mb-4">
        <Col>
          <Card className="shadow-sm border-0" style={{ borderRadius: '15px' }}>
            <Card.Header className="border-0 pb-0" style={{ backgroundColor: 'transparent' }}>
              <h3 className="mb-0" style={{ color: '#1f2937' }}>
                <i className="fas fa-bolt me-2" style={{ color: '#f59e0b' }}></i>
                Quick Actions
              </h3>
            </Card.Header>
            <Card.Body className="pt-3">
              <Row>
                <Col lg={3} md={6} className="mb-3">
                  <div 
                    className="action-card p-4 rounded text-center h-100 d-flex flex-column justify-content-center"
                    style={{ 
                      backgroundColor: '#f59e0b', 
                      color: 'white',
                      cursor: 'pointer',
                      transition: 'transform 0.2s',
                      border: 'none'
                    }}
                    onClick={() => navigate('/orders')}
                    onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
                    onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                  >
                    <i className="fas fa-receipt fa-2x mb-2"></i>
                    <strong>My Orders</strong>
                    <small className="mt-1 opacity-75">Track your purchases</small>
                  </div>
                </Col>
                <Col lg={3} md={6} className="mb-3">
                  <div 
                    className="action-card p-4 rounded text-center h-100 d-flex flex-column justify-content-center"
                    style={{ 
                      backgroundColor: '#fff7ed', 
                      color: '#f59e0b',
                      cursor: 'pointer',
                      transition: 'transform 0.2s',
                      border: '2px solid #fde68a'
                    }}
                    onClick={() => navigate('/cafes')}
                    onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
                    onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                  >
                    <i className="fas fa-coffee fa-2x mb-2"></i>
                    <strong>Discover Cafés</strong>
                    <small className="mt-1">Find amazing coffee spots</small>
                  </div>
                </Col>
                <Col lg={3} md={6} className="mb-3">
                  <div 
                    className="action-card p-4 rounded text-center h-100 d-flex flex-column justify-content-center"
                    style={{ 
                      backgroundColor: '#fff7ed', 
                      color: '#f59e0b',
                      cursor: 'pointer',
                      transition: 'transform 0.2s',
                      border: '2px solid #fde68a'
                    }}
                    onClick={() => navigate('/shop')}
                    onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
                    onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                  >
                    <i className="fas fa-shopping-cart fa-2x mb-2"></i>
                    <strong>Browse Shop</strong>
                    <small className="mt-1">Coffee beans & gear</small>
                  </div>
                </Col>
                <Col lg={3} md={6} className="mb-3">
                  <div 
                    className="action-card p-4 rounded text-center h-100 d-flex flex-column justify-content-center"
                    style={{ 
                      backgroundColor: '#fff7ed', 
                      color: '#f59e0b',
                      cursor: 'pointer',
                      transition: 'transform 0.2s',
                      border: '2px solid #fde68a'
                    }}
                    onClick={() => navigate('/rewards')}
                    onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
                    onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                  >
                    <i className="fas fa-gift fa-2x mb-2"></i>
                    <strong>Rewards</strong>
                    <small className="mt-1">Redeem your points</small>
                  </div>
                </Col>
              </Row>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Account Information */}
      <Row className="mb-4">
        <Col>
          <Card className="shadow-sm border-0" style={{ borderRadius: '15px' }}>
            <Card.Header className="border-0 pb-0" style={{ backgroundColor: 'transparent' }}>
              <h3 className="mb-0" style={{ color: '#1f2937' }}>
                <i className="fas fa-info-circle me-2" style={{ color: '#f59e0b' }}></i>
                Account Information
              </h3>
            </Card.Header>
            <Card.Body className="pt-3">
              <Row>
                <Col md={6}>
                  <div className="info-item p-3 rounded mb-3" style={{ backgroundColor: '#f8fafc' }}>
                    <label className="text-muted small mb-1">Username</label>
                    <div className="fw-bold">{displayUser?.username}</div>
                  </div>
                  <div className="info-item p-3 rounded mb-3" style={{ backgroundColor: '#f8fafc' }}>
                    <label className="text-muted small mb-1">Email Address</label>
                    <div className="fw-bold">{displayUser?.email}</div>
                  </div>
                </Col>
                <Col md={6}>
                  <div className="info-item p-3 rounded mb-3" style={{ backgroundColor: '#f8fafc' }}>
                    <label className="text-muted small mb-1">Member Since</label>
                    <div className="fw-bold">
                      {userProfile ? formatDate(userProfile.createdAt) : 'Recently'}
                    </div>
                  </div>
                  <div className="info-item p-3 rounded mb-3" style={{ backgroundColor: '#f8fafc' }}>
                    <label className="text-muted small mb-1">Account Status</label>
                    <div>
                      <Badge 
                        style={{ backgroundColor: '#10b981', borderColor: '#10b981' }}
                        className="px-3 py-2"
                      >
                        <i className="fas fa-check-circle me-1"></i>
                        Active
                      </Badge>
                    </div>
                  </div>
                </Col>
              </Row>
              
              {/* Recent Activity */}
              <div className="mt-4 p-3 rounded" style={{ backgroundColor: '#fff7ed', border: '1px solid #fde68a' }}>
                <h6 className="mb-3" style={{ color: '#f59e0b' }}>
                  <i className="fas fa-chart-line me-2"></i>
                  Recent Activity
                </h6>
                <Row className="text-center">
                  <Col xs={6} md={3}>
                    <div className="activity-stat">
                      <div className="fs-5 fw-bold" style={{ color: '#f59e0b' }}>
                        {userProfile?.stats.reviews || 0}
                      </div>
                      <small className="text-muted">Reviews Written</small>
                    </div>
                  </Col>
                  <Col xs={6} md={3}>
                    <div className="activity-stat">
                      <div className="fs-5 fw-bold" style={{ color: '#f59e0b' }}>
                        {userProfile?.stats.totalPointsEarned || 0}
                      </div>
                      <small className="text-muted">Points Earned</small>
                    </div>
                  </Col>
                  <Col xs={6} md={3}>
                    <div className="activity-stat">
                      <div className="fs-5 fw-bold" style={{ color: '#f59e0b' }}>
                        {userProfile?.stats.cafes || userProfile?.stats.campgrounds || 0}
                      </div>
                      <small className="text-muted">Cafés Added</small>
                    </div>
                  </Col>
                  <Col xs={6} md={3}>
                    <div className="activity-stat">
                      <div className="fs-5 fw-bold" style={{ color: '#f59e0b' }}>
                        {userProfile?.stats.favoritesCafes || 0}
                      </div>
                      <small className="text-muted">Favorites</small>
                    </div>
                  </Col>
                </Row>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Navigation Actions */}
      <Row className="mt-4">
        <Col className="text-center">
          <Button 
            variant="outline-secondary" 
            onClick={() => navigate('/cafes')}
            className="me-3"
            style={{ borderColor: '#6b7280', color: '#6b7280' }}
          >
            <i className="fas fa-arrow-left me-2"></i>
            Back to Cafés
          </Button>
          <Button 
            onClick={() => navigate('/orders')}
            style={{ backgroundColor: '#f59e0b', borderColor: '#f59e0b' }}
            className="text-white"
          >
            <i className="fas fa-receipt me-2"></i>
            View My Orders
          </Button>
        </Col>
      </Row>

      {/* Edit Profile Modal */}
      <Modal show={showEditModal} onHide={() => setShowEditModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Edit Profile</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>First Name</Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter your first name"
                value={editForm.firstName}
                onChange={(e) => setEditForm({...editForm, firstName: e.target.value})}
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Last Name</Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter your last name"
                value={editForm.lastName}
                onChange={(e) => setEditForm({...editForm, lastName: e.target.value})}
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Phone Number</Form.Label>
              <Form.Control
                type="tel"
                placeholder="Enter your phone number"
                value={editForm.phone}
                onChange={(e) => setEditForm({...editForm, phone: e.target.value})}
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="outline-secondary" onClick={() => setShowEditModal(false)}>
            Cancel
          </Button>
          <Button 
            style={{ backgroundColor: '#f59e0b', borderColor: '#f59e0b' }}
            className="text-white"
            onClick={() => {
              // TODO: Implement profile update
              console.log('Profile update:', editForm);
              setShowEditModal(false);
            }}
          >
            <i className="fas fa-save me-2"></i>
            Save Changes
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default UserProfile; 
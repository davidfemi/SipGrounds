import React, { useState, useEffect } from 'react';
import { 
  Container, 
  Row, 
  Col, 
  Card, 
  Button, 
  Alert,
  Badge,
  Modal,
  Spinner,
  ProgressBar
} from 'react-bootstrap';
import { rewardsAPI, Reward } from '../services/api';
import { useAuth } from '../context/AuthContext';
import LoadingScreen from '../components/LoadingScreen';
import SEOHead from '../components/SEOHead';
import { toast } from 'react-toastify';

const Rewards: React.FC = () => {
  const [rewards, setRewards] = useState<Reward[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedReward, setSelectedReward] = useState<Reward | null>(null);
  const [showRedeemModal, setShowRedeemModal] = useState(false);
  const [redeeming, setRedeeming] = useState(false);

  const { user, refreshUser } = useAuth();

  useEffect(() => {
    // Ensure we have the latest user points when opening Rewards
    (async () => {
      try {
        await refreshUser();
      } catch (_) {}
      await fetchRewards();
    })();
  }, []);

  const fetchRewards = async () => {
    setLoading(true);
    setError('');

    try {
      const response = await rewardsAPI.getAll();
      if (response.success && response.data) {
        setRewards(response.data.rewards);
      } else {
        setError('Failed to fetch rewards');
      }
    } catch (error) {
      setError('Failed to fetch rewards');
      console.error('Error fetching rewards:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRedeemClick = (reward: Reward) => {
    setSelectedReward(reward);
    setShowRedeemModal(true);
  };

  const handleRedeem = async () => {
    if (!selectedReward) return;

    setRedeeming(true);
    try {
      const response = await rewardsAPI.redeem(selectedReward._id, {
        cafeId: null // For now, allow redemption at any cafe
      });

      if (response.success) {
        toast.success(response.message, {
          style: { color: '#d946ef' }
        });
        await refreshUser(); // Refresh user points
        setShowRedeemModal(false);
        setSelectedReward(null);
      } else {
        toast.error(response.error);
      }
    } catch (error) {
      toast.error('Failed to redeem reward');
      console.error('Redemption error:', error);
    } finally {
      setRedeeming(false);
    }
  };

  const getCategoryIcon = (category: string) => {
    const icons = {
      drink: 'fas fa-coffee',
      food: 'fas fa-hamburger',
      pastry: 'fas fa-cookie-bite',
      merchandise: 'fas fa-tshirt',
      experience: 'fas fa-star'
    };
    return icons[category as keyof typeof icons] || 'fas fa-gift';
  };

  const getCategoryColor = (category: string) => {
    const colors = {
      drink: 'primary',
      food: 'success',
      pastry: 'warning',
      merchandise: 'info',
      experience: 'danger'
    };
    return colors[category as keyof typeof colors] || 'secondary';
  };

  if (loading) {
    return <LoadingScreen />;
  }

  return (
    <>
      <SEOHead 
        title="Rewards - Sip Grounds"
        description="Redeem your points for amazing rewards at partner cafés. Earn points with every purchase and unlock exclusive perks."
        keywords="cafe rewards, coffee rewards, loyalty program, points redemption"
      />
      
      <Container className="py-4">
        {/* Header */}
        <Row className="mb-4">
          <Col>
            <div className="text-center">
              <h1 className="display-5 mb-3">
                <i className="fas fa-gift me-3" style={{color: '#f59e0b'}}></i>
                Rewards Store
              </h1>
              <p className="lead text-muted mb-4">
                Redeem your points for amazing rewards and exclusive perks
              </p>
              
              {/* User Points Display */}
              <Card className="mx-auto" style={{ maxWidth: '480px', background: '#fff7ed', borderColor: '#fde68a' }}>
                <Card.Body className="text-center">
                  <div className="d-flex align-items-center justify-content-center mb-2">
                    <i className="fas fa-coins fa-2x me-3" style={{color: '#f59e0b'}}></i>
                    <div>
                      <h3 className="mb-0" style={{color: '#f59e0b'}}>
                        {user?.points || 0}
                      </h3>
                      <small className="text-muted">Available Points</small>
                    </div>
                  </div>
                  <small className="text-muted">
                    Earn 1 point for every $1 spent at partner cafés
                  </small>
                </Card.Body>
              </Card>
            </div>
          </Col>
        </Row>

        {/* Error Alert */}
        {error && (
          <Row className="mb-4">
            <Col>
              <Alert variant="danger" dismissible onClose={() => setError('')}>
                <i className="fas fa-exclamation-triangle me-2"></i>
                {error}
              </Alert>
            </Col>
          </Row>
        )}

        {/* Rewards Grid */}
        <Row>
          {rewards.length === 0 ? (
            <Col>
              <Card className="text-center py-5">
                <Card.Body>
                  <i className="fas fa-gift fa-3x text-muted mb-3"></i>
                  <h4>No rewards available</h4>
                  <p className="text-muted">
                    Check back soon for new rewards, or start earning points by making purchases!
                  </p>
                </Card.Body>
              </Card>
            </Col>
          ) : (
            rewards.map((reward) => {
              const canAfford = (user?.points || 0) >= reward.pointsCost;
              const isInStock = reward.isInStock;
              
              return (
                <Col key={reward._id} lg={4} md={6} className="mb-4">
                  <Card className={`h-100 reward-card ${!canAfford || !isInStock ? 'opacity-75' : ''}`}>
                    <div className="position-relative">
                      {reward.image ? (
                        <Card.Img 
                          variant="top" 
                          src={reward.image.url} 
                          style={{ height: '200px', objectFit: 'cover' }}
                          alt={reward.name}
                        />
                      ) : (
                        <div 
                          className={`bg-${getCategoryColor(reward.category)} bg-opacity-10 d-flex align-items-center justify-content-center`}
                          style={{ height: '200px' }}
                        >
                          <i className={`${getCategoryIcon(reward.category)} fa-3x text-${getCategoryColor(reward.category)}`}></i>
                        </div>
                      )}
                      
                      {/* Category Badge */}
                      <div className="position-absolute top-0 start-0 m-2">
                        <Badge bg={getCategoryColor(reward.category)}>
                          <i className={`${getCategoryIcon(reward.category)} me-1`}></i>
                          {reward.category}
                        </Badge>
                      </div>
                      
                      {/* Stock Status */}
                      {!isInStock && (
                        <div className="position-absolute top-0 end-0 m-2">
                          <Badge bg="danger">Out of Stock</Badge>
                        </div>
                      )}
                    </div>

                    <Card.Body className="d-flex flex-column">
                      <div className="mb-3">
                        <Card.Title className="h5 mb-2">{reward.name}</Card.Title>
                        <Card.Text className="text-muted small">
                          {reward.description}
                        </Card.Text>
                      </div>

                      {/* Points Cost */}
                      <div className="mb-3">
                        <div className="d-flex align-items-center justify-content-between">
                          <div>
                            <span className="h5 mb-0" style={{color: '#f59e0b'}}>
                              <i className="fas fa-coins me-1"></i>
                              {reward.pointsCost}
                            </span>
                            <small className="text-muted ms-2">points</small>
                          </div>
                          <small className="text-muted">
                            Value: ${reward.monetaryValue}
                          </small>
                        </div>
                      </div>

                      {/* Stock Progress */}
                      {reward.stockLimit && (
                        <div className="mb-3">
                          <div className="d-flex justify-content-between align-items-center mb-1">
                            <small className="text-muted">Availability</small>
                            <small className="text-muted">
                              {reward.stockLimit - reward.redeemedCount} left
                            </small>
                          </div>
                          <ProgressBar 
                            now={reward.stockPercentage} 
                            variant={reward.stockPercentage < 20 ? 'danger' : 'success'}
                            style={{ height: '4px' }}
                          />
                        </div>
                      )}

                      {/* Redeem Button */}
                      <div className="mt-auto">
                        <div className="d-grid">
                          <Button 
                            style={{ backgroundColor: canAfford && isInStock ? '#f59e0b' : 'transparent', borderColor: '#f59e0b', color: canAfford && isInStock ? '#fff' : '#f59e0b' }}
                            disabled={!canAfford || !isInStock}
                            onClick={() => handleRedeemClick(reward)}
                          >
                            {!isInStock ? (
                              <>
                                <i className="fas fa-times me-2"></i>
                                Out of Stock
                              </>
                            ) : !canAfford ? (
                              <>
                                <i className="fas fa-lock me-2"></i>
                                Need {reward.pointsCost - (user?.points || 0)} more points
                              </>
                            ) : (
                              <>
                                <i className="fas fa-shopping-cart me-2"></i>
                                Redeem Now
                              </>
                            )}
                          </Button>
                        </div>
                      </div>
                    </Card.Body>
                  </Card>
                </Col>
              );
            })
          )}
        </Row>

        {/* How to Earn Points Section */}
        <Row className="mt-5">
          <Col>
            <Card className="bg-white" style={{ borderColor: '#fde68a' }}>
              <Card.Body className="text-center py-4">
                <h5 className="mb-3">
                  <i className="fas fa-lightbulb me-2" style={{color: '#f59e0b'}}></i>
                  How to Earn Points
                </h5>
                <Row>
                  <Col md={4} className="mb-3">
                    <i className="fas fa-shopping-bag fa-2x mb-2" style={{color: '#f59e0b'}}></i>
                    <h6>Make Purchases</h6>
                    <small className="text-muted">
                      Earn 1 point for every $1 spent at partner cafés
                    </small>
                  </Col>
                  <Col md={4} className="mb-3">
                    <i className="fas fa-poll fa-2x mb-2" style={{color: '#f59e0b'}}></i>
                    <h6>Participate in Polls</h6>
                    <small className="text-muted">
                      Get bonus points for engaging with our community
                    </small>
                  </Col>
                  <Col md={4} className="mb-3">
                    <i className="fas fa-star fa-2x mb-2" style={{color: '#f59e0b'}}></i>
                    <h6>Visit Partner Cafés</h6>
                    <small className="text-muted">
                      Some cafés offer bonus point multipliers
                    </small>
                  </Col>
                </Row>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>

      {/* Redeem Confirmation Modal */}
      <Modal show={showRedeemModal} onHide={() => setShowRedeemModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Confirm Redemption</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedReward && (
            <div className="text-center">
              <i className={`${getCategoryIcon(selectedReward.category)} fa-3x mb-3`} style={{color: '#f59e0b'}}></i>
              <h5>{selectedReward.name}</h5>
              <p className="text-muted">{selectedReward.description}</p>
              
              <div className="bg-light p-3 rounded mb-3">
                <div className="d-flex justify-content-between align-items-center">
                  <span>Points Required:</span>
                  <strong style={{color: '#f59e0b'}}>
                    <i className="fas fa-coins me-1"></i>
                    {selectedReward.pointsCost}
                  </strong>
                </div>
                <div className="d-flex justify-content-between align-items-center">
                  <span>Your Points:</span>
                  <strong>{user?.points || 0}</strong>
                </div>
                <hr className="my-2" />
                <div className="d-flex justify-content-between align-items-center">
                  <span>Remaining:</span>
                  <strong>{(user?.points || 0) - selectedReward.pointsCost}</strong>
                </div>
              </div>
              
              <p className="small text-muted">
                After redemption, you'll receive a unique code to present at any participating café.
              </p>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowRedeemModal(false)}>
            Cancel
          </Button>
          <Button 
            variant="success" 
            onClick={handleRedeem}
            disabled={redeeming}
          >
            {redeeming ? (
              <>
                <Spinner as="span" animation="border" size="sm" className="me-2" />
                Redeeming...
              </>
            ) : (
              <>
                <i className="fas fa-check me-2"></i>
                Confirm Redemption
              </>
            )}
          </Button>
        </Modal.Footer>
      </Modal>

      <style>{`
        .reward-card {
          transition: transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out;
        }
        .reward-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 15px rgba(0,0,0,0.1) !important;
        }
      `}</style>
    </>
  );
};

export default Rewards;

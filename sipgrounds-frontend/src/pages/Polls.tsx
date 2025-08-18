import React, { useState, useEffect } from 'react';
import { 
  Container, 
  Row, 
  Col, 
  Card, 
  Button, 
  Alert,
  Badge,
  ProgressBar,
  Form
} from 'react-bootstrap';
import { pollsAPI, Poll } from '../services/api';
import { useAuth } from '../context/AuthContext';
import LoadingScreen from '../components/LoadingScreen';
import SEOHead from '../components/SEOHead';
import { toast } from 'react-toastify';

const Polls: React.FC = () => {
  const [polls, setPolls] = useState<Poll[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [voting, setVoting] = useState<{[key: string]: boolean}>({});
  const [filter, setFilter] = useState('all');

  const { user, isAuthenticated, refreshUser } = useAuth();

  useEffect(() => {
    fetchPolls();
  }, [filter]);

  const fetchPolls = async () => {
    setLoading(true);
    setError('');

    try {
      const params = filter !== 'all' ? { category: filter } : {};
      const response = await pollsAPI.getAll(params);
      
      if (response.success && response.data) {
        setPolls(response.data.polls);
      } else {
        setError('Failed to fetch polls');
      }
    } catch (error) {
      setError('Failed to fetch polls');
      console.error('Error fetching polls:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleVote = async (pollId: string, optionIndex: number) => {
    if (!isAuthenticated) {
      toast.error('Please log in to vote');
      return;
    }

    setVoting(prev => ({ ...prev, [pollId]: true }));

    try {
      const response = await pollsAPI.vote(pollId, optionIndex);
      
      if (response.success) {
        toast.success(response.message, {
          style: { color: '#d946ef' }
        });
        
        // Refresh polls to show updated results
        await fetchPolls();
        
        // Refresh user points if they earned any
        if (response.data?.pointsEarned && response.data.pointsEarned > 0) {
          await refreshUser();
        }
      } else {
        toast.error(response.error);
      }
    } catch (error) {
      toast.error('Failed to submit vote');
      console.error('Voting error:', error);
    } finally {
      setVoting(prev => ({ ...prev, [pollId]: false }));
    }
  };

  const getCategoryIcon = (category: string) => {
    const icons = {
      general: 'fas fa-comments',
      menu: 'fas fa-utensils',
      cafe_features: 'fas fa-store',
      events: 'fas fa-calendar',
      feedback: 'fas fa-comment-dots'
    };
    return icons[category as keyof typeof icons] || 'fas fa-poll';
  };

  const getCategoryColor = (category: string) => {
    const colors = {
      general: 'primary',
      menu: 'success',
      cafe_features: 'info',
      events: 'warning',
      feedback: 'danger'
    };
    return colors[category as keyof typeof colors] || 'secondary';
  };

  const formatTimeRemaining = (endDate: string) => {
    const end = new Date(endDate);
    const now = new Date();
    const diff = end.getTime() - now.getTime();
    
    if (diff <= 0) return 'Ended';
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    
    if (days > 0) return `${days} day${days > 1 ? 's' : ''} left`;
    if (hours > 0) return `${hours} hour${hours > 1 ? 's' : ''} left`;
    return 'Ending soon';
  };

  if (loading) {
    return <LoadingScreen />;
  }

  return (
    <>
      <SEOHead 
        title="Community Polls - Sip Grounds"
        description="Share your voice in the coffee community. Vote on polls and help shape the future of your favorite cafés."
        keywords="coffee polls, community voting, cafe feedback, coffee preferences"
      />
      
      <Container className="py-4">
        {/* Header */}
        <Row className="mb-4">
          <Col>
            <div className="text-center">
              <h1 className="display-5 mb-3">
                <i className="fas fa-poll me-3" style={{color: '#d946ef'}}></i>
                Community Polls
              </h1>
              <p className="lead text-muted mb-4">
                Share your voice and help shape the coffee community
              </p>
              
              {isAuthenticated && (
                <Alert variant="info" className="mx-auto" style={{ maxWidth: '500px' }}>
                  <i className="fas fa-coins me-2"></i>
                  <strong>Earn points by voting!</strong> Some polls reward participants with bonus points.
                </Alert>
              )}
            </div>
          </Col>
        </Row>

        {/* Filter Tabs */}
        <Row className="mb-4">
          <Col>
            <Card>
              <Card.Body>
                <div className="d-flex flex-wrap gap-2 justify-content-center">
                  {[
                    { value: 'all', label: 'All Polls', icon: 'fas fa-list' },
                    { value: 'general', label: 'General', icon: 'fas fa-comments' },
                    { value: 'menu', label: 'Menu', icon: 'fas fa-utensils' },
                    { value: 'cafe_features', label: 'Café Features', icon: 'fas fa-store' },
                    { value: 'events', label: 'Events', icon: 'fas fa-calendar' },
                    { value: 'feedback', label: 'Feedback', icon: 'fas fa-comment-dots' }
                  ].map((tab) => (
                    <Button
                      key={tab.value}
                      variant={filter === tab.value ? 'primary' : 'outline-primary'}
                      onClick={() => setFilter(tab.value)}
                      className="mb-2"
                    >
                      <i className={`${tab.icon} me-2`}></i>
                      {tab.label}
                    </Button>
                  ))}
                </div>
              </Card.Body>
            </Card>
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

        {/* Polls */}
        <Row>
          {polls.length === 0 ? (
            <Col>
              <Card className="text-center py-5">
                <Card.Body>
                  <i className="fas fa-poll fa-3x text-muted mb-3"></i>
                  <h4>No polls found</h4>
                  <p className="text-muted">
                    {filter === 'all' 
                      ? 'Check back soon for new polls!'
                      : `No polls found in the ${filter} category.`
                    }
                  </p>
                  {filter !== 'all' && (
                    <Button variant="primary" onClick={() => setFilter('all')}>
                      View All Polls
                    </Button>
                  )}
                </Card.Body>
              </Card>
            </Col>
          ) : (
            <Col>
              {polls.map((poll) => {
                const hasVoted = poll.userHasVoted;
                const isVoting = voting[poll._id] || false;
                const isActive = poll.isCurrentlyActive;
                
                return (
                  <Card key={poll._id} className="mb-4 poll-card">
                    <Card.Body>
                      {/* Poll Header */}
                      <div className="d-flex align-items-start justify-content-between mb-3">
                        <div className="flex-grow-1">
                          <div className="d-flex align-items-center mb-2">
                            <Badge bg={getCategoryColor(poll.category)} className="me-2">
                              <i className={`${getCategoryIcon(poll.category)} me-1`}></i>
                              {poll.category.replace('_', ' ')}
                            </Badge>
                            
                            {poll.pointsReward > 0 && (
                              <Badge bg="warning" text="dark">
                                <i className="fas fa-coins me-1"></i>
                                +{poll.pointsReward} points
                              </Badge>
                            )}
                          </div>
                          
                          <h5 className="mb-2">{poll.question}</h5>
                          
                          {poll.description && (
                            <p className="text-muted mb-0">{poll.description}</p>
                          )}
                        </div>
                        
                        <div className="text-end ms-3">
                          <div className="text-muted small">
                            <i className="fas fa-users me-1"></i>
                            {poll.totalVotes} vote{poll.totalVotes !== 1 ? 's' : ''}
                          </div>
                          <div className="text-muted small">
                            <i className="fas fa-clock me-1"></i>
                            {formatTimeRemaining(poll.endsAt)}
                          </div>
                          {!isActive && (
                            <Badge bg="secondary" className="mt-1">Poll Ended</Badge>
                          )}
                        </div>
                      </div>

                      {/* Poll Image */}
                      {poll.image && (
                        <div className="mb-3">
                          <img 
                            src={poll.image.url} 
                            alt="Poll" 
                            className="img-fluid rounded"
                            style={{ maxHeight: '200px', width: '100%', objectFit: 'cover' }}
                          />
                        </div>
                      )}

                      {/* Poll Options */}
                      <div className="poll-options">
                        {poll.options.map((option, index) => {
                          const percentage = poll.totalVotes > 0 
                            ? Math.round((option.votes / poll.totalVotes) * 100)
                            : 0;
                          
                          return (
                            <div key={index} className="mb-3">
                              {hasVoted || !isActive || !isAuthenticated ? (
                                // Show results
                                <div className="poll-result">
                                  <div className="d-flex justify-content-between align-items-center mb-1">
                                    <span className="fw-medium">{option.text}</span>
                                    <span className="text-muted">
                                      {option.votes} vote{option.votes !== 1 ? 's' : ''} ({percentage}%)
                                    </span>
                                  </div>
                                  <ProgressBar 
                                    now={percentage} 
                                    variant="primary"
                                    style={{ height: '8px' }}
                                  />
                                </div>
                              ) : (
                                // Show voting option
                                <Button
                                  variant="outline-primary"
                                  className="w-100 text-start"
                                  onClick={() => handleVote(poll._id, index)}
                                  disabled={isVoting}
                                >
                                  <div className="d-flex align-items-center justify-content-between">
                                    <span>{option.text}</span>
                                    {isVoting && (
                                      <div className="spinner-border spinner-border-sm" role="status">
                                        <span className="visually-hidden">Loading...</span>
                                      </div>
                                    )}
                                  </div>
                                </Button>
                              )}
                            </div>
                          );
                        })}
                      </div>

                      {/* Poll Footer */}
                      <div className="mt-3 pt-3 border-top">
                        <div className="d-flex align-items-center justify-content-between">
                          <small className="text-muted">
                            Created by {poll.createdBy?.username} • {new Date(poll.createdAt).toLocaleDateString()}
                          </small>
                          
                          {!isAuthenticated ? (
                            <small className="text-muted">
                              <i className="fas fa-info-circle me-1"></i>
                              Log in to vote
                            </small>
                          ) : hasVoted ? (
                            <small className="text-success">
                              <i className="fas fa-check me-1"></i>
                              You voted
                            </small>
                          ) : !isActive ? (
                            <small className="text-muted">
                              <i className="fas fa-times me-1"></i>
                              Voting closed
                            </small>
                          ) : (
                            <small style={{color: '#d946ef'}}>
                              <i className="fas fa-hand-point-up me-1"></i>
                              Click an option to vote
                            </small>
                          )}
                        </div>
                      </div>
                    </Card.Body>
                  </Card>
                );
              })}
            </Col>
          )}
        </Row>

        {/* How Polling Works */}
        <Row className="mt-5">
          <Col>
            <Card className="bg-light">
              <Card.Body className="text-center py-4">
                <h5 className="mb-3">
                  <i className="fas fa-lightbulb me-2" style={{color: '#d946ef'}}></i>
                  How Community Polls Work
                </h5>
                <Row>
                  <Col md={4} className="mb-3">
                    <i className="fas fa-vote-yea fa-2x mb-2" style={{color: '#d946ef'}}></i>
                    <h6>Single-Select Voting</h6>
                    <small className="text-muted">
                      Each poll allows you to choose one option. Choose wisely!
                    </small>
                  </Col>
                  <Col md={4} className="mb-3">
                    <i className="fas fa-coins fa-2x mb-2" style={{color: '#d946ef'}}></i>
                    <h6>Earn Points</h6>
                    <small className="text-muted">
                      Some polls reward participants with bonus points
                    </small>
                  </Col>
                  <Col md={4} className="mb-3">
                    <i className="fas fa-chart-bar fa-2x mb-2" style={{color: '#d946ef'}}></i>
                    <h6>See Results</h6>
                    <small className="text-muted">
                      View real-time results and see how the community voted
                    </small>
                  </Col>
                </Row>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>

      <style>{`
        .poll-card {
          transition: transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out;
          border-left: 4px solid #d946ef;
        }
        .poll-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 15px rgba(0,0,0,0.1) !important;
        }
        .poll-result .progress-bar {
          background-color: #d946ef;
        }
      `}</style>
    </>
  );
};

export default Polls;

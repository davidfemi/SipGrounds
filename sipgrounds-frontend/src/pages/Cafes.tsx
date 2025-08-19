import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Container, 
  Row, 
  Col, 
  Card, 
  Button, 
  Form, 
  Alert,
  Badge,
  InputGroup,
  ButtonGroup
} from 'react-bootstrap';
import { cafesAPI, Cafe } from '../services/api';
import { useAuth } from '../context/AuthContext';
import CafesMap from '../components/CafesMap';
import LoadingScreen from '../components/LoadingScreen';
import SEOHead from '../components/SEOHead';

const Cafes: React.FC = () => {
  const [cafes, setCafes] = useState<Cafe[]>([]);
  const [allCafes, setAllCafes] = useState<Cafe[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'map'>('grid');

  const [filters, setFilters] = useState({
    search: '',
    location: '',
    amenities: '',
    specialties: '',
    priceRange: '',
    sortBy: 'name',
    sortOrder: 'asc' as 'asc' | 'desc'
  });

  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const fetchCafes = useCallback(async () => {
    setLoading(true);
    setError('');

    try {
      const params = {
        page: 1,
        limit: 1000
      };

      const response = await cafesAPI.getAll(params);
      
      if (response.success && response.data) {
        const cafesData = response.data.cafes || [];
        setAllCafes(cafesData);
        setCafes(cafesData);
      } else {
        setError('Failed to fetch cafés');
      }
    } catch (error) {
      setError('Failed to fetch cafés');
      console.error('Error fetching cafés:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCafes();
  }, [fetchCafes]);

  // Client-side filtering
  const filteredCafes = useMemo(() => {
    let filtered = [...allCafes];

    // Search filter
    if (filters.search.trim()) {
      const searchTerm = filters.search.toLowerCase().trim();
      filtered = filtered.filter(cafe => 
        cafe.name?.toLowerCase().includes(searchTerm) ||
        cafe.title?.toLowerCase().includes(searchTerm) ||
        cafe.location?.toLowerCase().includes(searchTerm) ||
        cafe.description?.toLowerCase().includes(searchTerm)
      );
    }

    // Location filter
    if (filters.location.trim()) {
      const locationTerm = filters.location.toLowerCase().trim();
      filtered = filtered.filter(cafe => 
        cafe.location?.toLowerCase().includes(locationTerm) ||
        cafe.address?.city?.toLowerCase().includes(locationTerm) ||
        cafe.address?.state?.toLowerCase().includes(locationTerm)
      );
    }

    // Amenities filter
    if (filters.amenities) {
      filtered = filtered.filter(cafe => 
        cafe.amenities?.includes(filters.amenities)
      );
    }

    // Specialties filter
    if (filters.specialties) {
      filtered = filtered.filter(cafe => 
        cafe.specialties?.includes(filters.specialties)
      );
    }

    // Price range filter
    if (filters.priceRange) {
      filtered = filtered.filter(cafe => {
        const price = cafe.price || cafe.priceRange;
        return price === filters.priceRange;
      });
    }

    // Sorting
    filtered.sort((a, b) => {
      let aValue, bValue;
      
      switch (filters.sortBy) {
        case 'name':
          aValue = (a.name || a.title || '').toLowerCase();
          bValue = (b.name || b.title || '').toLowerCase();
          break;
        case 'location':
          aValue = (a.location || '').toLowerCase();
          bValue = (b.location || '').toLowerCase();
          break;
        case 'price':
          aValue = a.price || a.priceRange || '';
          bValue = b.price || b.priceRange || '';
          break;
        default:
          aValue = (a.name || a.title || '').toLowerCase();
          bValue = (b.name || b.title || '').toLowerCase();
      }

      if (filters.sortOrder === 'desc') {
        return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
      }
      return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
    });

    return filtered;
  }, [allCafes, filters]);

  // Update cafes when filters change
  useEffect(() => {
    setCafes(filteredCafes);
  }, [filteredCafes]);

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const clearFilters = () => {
    setFilters({
      search: '',
      location: '',
      amenities: '',
      specialties: '',
      priceRange: '',
      sortBy: 'name',
      sortOrder: 'asc'
    });
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

  const getOpenStatus = (cafe: Cafe) => {
    // This would need to be implemented based on cafe hours
    return cafe.isOpen ? 
      <Badge bg="success">Open</Badge> : 
      <Badge bg="secondary">Closed</Badge>;
  };

  if (loading) {
    return <LoadingScreen />;
  }

  return (
    <>
      <SEOHead 
        title="Discover Amazing Cafés - Sip Grounds"
        description="Find the perfect café for your next coffee adventure. Discover local partners, earn points, and enjoy great coffee."
        keywords="cafe, coffee, local coffee shops, coffee discovery, cafe finder"
      />
      
      <Container fluid className="py-4">
        {/* Header */}
        <Row className="mb-4">
          <Col>
            <div className="text-center">
              <h1 className="display-5 mb-3">
                <i className="fas fa-coffee me-3" style={{color: '#f59e0b'}}></i>
                Discover Cafés
              </h1>
              <p className="lead text-muted mb-4">
                Find amazing coffee shops, earn points, and discover your next favorite spot
              </p>
              
              {isAuthenticated && (
                <div className="mb-4">
                  <Button 
                    onClick={() => navigate('/cafes/new')}
                    className="text-white"
                    style={{ backgroundColor: '#f59e0b', borderColor: '#f59e0b' }}
                    size="lg"
                  >
                    <i className="fas fa-plus me-2"></i>
                    Add New Café
                  </Button>
                </div>
              )}
            </div>
          </Col>
        </Row>

        {/* Stats Row */}
        <Row className="mb-4">
          <Col>
            <Card className="mx-auto" style={{ maxWidth: '480px', background: '#fff7ed', borderColor: '#fde68a' }}>
              <Card.Body className="text-center">
                <div className="d-flex align-items-center justify-content-center mb-2">
                  <i className="fas fa-map-marker-alt fa-2x me-3" style={{color: '#f59e0b'}}></i>
                  <div>
                    <h3 className="mb-0" style={{color: '#f59e0b'}}>
                      {cafes.length}
                    </h3>
                    <small className="text-muted">Cafés Available</small>
                  </div>
                </div>
                <small className="text-muted">
                  Explore local coffee shops and earn points with every visit
                </small>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        {/* Filters moved below stats */}
        <Row className="mb-4">
          <Col md={8} className="mx-auto">
            <div className="d-flex justify-content-center align-items-center">
              <div className="me-4">
                <ButtonGroup>
                  <Button 
                    style={{ 
                      backgroundColor: viewMode === 'grid' ? '#f59e0b' : 'transparent',
                      borderColor: '#f59e0b',
                      color: viewMode === 'grid' ? '#fff' : '#f59e0b'
                    }}
                    onClick={() => setViewMode('grid')}
                  >
                    <i className="fas fa-th-large me-2"></i>
                    Grid View
                  </Button>
                  <Button 
                    style={{ 
                      backgroundColor: viewMode === 'map' ? '#f59e0b' : 'transparent',
                      borderColor: '#f59e0b',
                      color: viewMode === 'map' ? '#fff' : '#f59e0b'
                    }}
                    onClick={() => setViewMode('map')}
                  >
                    <i className="fas fa-map me-2"></i>
                    Map View
                  </Button>
                </ButtonGroup>
              </div>
            </div>
          </Col>
        </Row>

        {/* Advanced Filters */}
        <Row className="mb-4">
          <Col>
            <Card className="bg-white" style={{ borderColor: '#fde68a' }}>
              <Card.Body>
                <h6 className="mb-3 text-center">
                  <i className="fas fa-filter me-2" style={{color: '#f59e0b'}}></i>
                  Filter Cafés
                </h6>
                <Row>
                  <Col md={3}>
                    <Form.Group className="mb-3">
                      <Form.Label>Search</Form.Label>
                      <InputGroup>
                        <Form.Control
                          type="text"
                          placeholder="Search cafés..."
                          value={filters.search}
                          onChange={(e) => handleFilterChange('search', e.target.value)}
                        />
                        <Button variant="outline-secondary">
                          <i className="fas fa-search"></i>
                        </Button>
                      </InputGroup>
                    </Form.Group>
                  </Col>
                  <Col md={2}>
                    <Form.Group className="mb-3">
                      <Form.Label>Location</Form.Label>
                      <Form.Control
                        type="text"
                        placeholder="City, Area..."
                        value={filters.location}
                        onChange={(e) => handleFilterChange('location', e.target.value)}
                      />
                    </Form.Group>
                  </Col>
                  <Col md={2}>
                    <Form.Group className="mb-3">
                      <Form.Label>Price Range</Form.Label>
                      <Form.Select
                        value={filters.priceRange}
                        onChange={(e) => handleFilterChange('priceRange', e.target.value)}
                      >
                        <option value="">All Prices</option>
                        <option value="$">$ - Budget</option>
                        <option value="$$">$$ - Moderate</option>
                        <option value="$$$">$$$ - Upscale</option>
                        <option value="$$$$">$$$$ - Premium</option>
                      </Form.Select>
                    </Form.Group>
                  </Col>
                  <Col md={2}>
                    <Form.Group className="mb-3">
                      <Form.Label>Amenities</Form.Label>
                      <Form.Select
                        value={filters.amenities}
                        onChange={(e) => handleFilterChange('amenities', e.target.value)}
                      >
                        <option value="">All Amenities</option>
                        <option value="wifi">WiFi</option>
                        <option value="parking">Parking</option>
                        <option value="outdoor_seating">Outdoor Seating</option>
                        <option value="pet_friendly">Pet Friendly</option>
                        <option value="wheelchair_accessible">Accessible</option>
                      </Form.Select>
                    </Form.Group>
                  </Col>
                  <Col md={2}>
                    <Form.Group className="mb-3">
                      <Form.Label>Sort By</Form.Label>
                      <Form.Select
                        value={`${filters.sortBy}-${filters.sortOrder}`}
                        onChange={(e) => {
                          const [sortBy, sortOrder] = e.target.value.split('-');
                          handleFilterChange('sortBy', sortBy);
                          handleFilterChange('sortOrder', sortOrder);
                        }}
                      >
                        <option value="name-asc">Name (A-Z)</option>
                        <option value="name-desc">Name (Z-A)</option>
                        <option value="rating-desc">Highest Rated</option>
                        <option value="distance-asc">Nearest</option>
                      </Form.Select>
                    </Form.Group>
                  </Col>
                  <Col md={1} className="d-flex align-items-end">
                    <Button 
                      variant="outline-secondary" 
                      onClick={clearFilters}
                      className="mb-3"
                    >
                      Clear
                    </Button>
                  </Col>
                </Row>
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

        {/* Content */}
        {viewMode === 'map' ? (
          <Row>
            <Col>
              <div style={{ height: '600px' }}>
                <CafesMap cafes={cafes} />
              </div>
            </Col>
          </Row>
        ) : (
          <Row>
            {cafes.length === 0 ? (
              <Col>
                <Card className="text-center py-5">
                  <Card.Body>
                    <i className="fas fa-coffee fa-3x text-muted mb-3"></i>
                    <h4>No cafés found</h4>
                    <p className="text-muted">
                      Try adjusting your filters or search terms to find more cafés.
                    </p>
                    <Button 
                      onClick={clearFilters}
                      style={{ backgroundColor: '#f59e0b', borderColor: '#f59e0b' }}
                      className="text-white"
                    >
                      Clear Filters
                    </Button>
                  </Card.Body>
                </Card>
              </Col>
            ) : (
              cafes.map((cafe) => (
                <Col key={cafe._id} lg={4} md={6} className="mb-4">
                  <Card className="h-100 shadow-sm cafe-card">
                    <div className="position-relative">
                      {cafe.images && cafe.images.length > 0 ? (
                        <Card.Img 
                          variant="top" 
                          src={cafe.images[0].url} 
                          style={{ height: '200px', objectFit: 'cover' }}
                          alt={cafe.name}
                        />
                      ) : (
                        <div 
                          className="bg-light d-flex align-items-center justify-content-center"
                          style={{ height: '200px' }}
                        >
                          <i className="fas fa-coffee fa-3x text-muted"></i>
                        </div>
                      )}
                      
                      {/* Status Badge */}
                      <div className="position-absolute top-0 end-0 m-2">
                        {getOpenStatus(cafe)}
                      </div>
                      
                      {/* Points Multiplier Badge */}
                      {cafe.pointsMultiplier && cafe.pointsMultiplier > 1 && (
                        <div className="position-absolute top-0 start-0 m-2">
                          <Badge bg="warning" text="dark">
                            <i className="fas fa-coins me-1"></i>
                            {cafe.pointsMultiplier}x Points
                          </Badge>
                        </div>
                      )}
                    </div>

                    <Card.Body className="d-flex flex-column">
                      <div className="mb-2">
                        <Card.Title className="h5 mb-1">{cafe.name}</Card.Title>
                        <div className="d-flex align-items-center mb-2">
                          <div className="me-3">
                            {[...Array(5)].map((_, i) => (
                              <i 
                                key={i}
                                className={`fas fa-star ${i < Math.floor(cafe.averageRating) ? 'text-warning' : 'text-muted'}`}
                              ></i>
                            ))}
                            <small className="text-muted ms-1">
                              ({cafe.reviews?.length || 0})
                            </small>
                          </div>
                          <Badge bg="secondary">{getPriceRangeText(cafe.priceRange)}</Badge>
                        </div>
                      </div>

                      <div className="mb-2">
                        <small className="text-muted">
                          <i className="fas fa-map-marker-alt me-1"></i>
                          {cafe.location}
                        </small>
                      </div>

                      <Card.Text className="text-muted small flex-grow-1">
                        {cafe.description?.substring(0, 100)}
                        {cafe.description && cafe.description.length > 100 && '...'}
                      </Card.Text>

                      {/* Amenities */}
                      {cafe.amenities && cafe.amenities.length > 0 && (
                        <div className="mb-3">
                          {cafe.amenities.slice(0, 3).map((amenity) => (
                            <Badge key={amenity} bg="light" text="dark" className="me-1 mb-1">
                              <small>{amenity.replace('_', ' ')}</small>
                            </Badge>
                          ))}
                          {cafe.amenities.length > 3 && (
                            <Badge bg="light" text="dark" className="me-1 mb-1">
                              <small>+{cafe.amenities.length - 3} more</small>
                            </Badge>
                          )}
                        </div>
                      )}

                      <div className="mt-auto">
                        <div className="d-grid gap-2">
                          <Button 
                            onClick={() => navigate(`/cafes/${cafe._id}`)}
                            style={{ backgroundColor: '#f59e0b', borderColor: '#f59e0b' }}
                            className="text-white"
                          >
                            <i className="fas fa-eye me-2"></i>
                            View Details
                          </Button>
                        </div>
                      </div>
                    </Card.Body>
                  </Card>
                </Col>
              ))
            )}
          </Row>
        )}

        {/* How to Find Great Cafés Section */}
        {cafes.length === 0 && !loading && (
          <Row className="mt-5">
            <Col>
              <Card className="bg-white" style={{ borderColor: '#fde68a' }}>
                <Card.Body className="text-center py-4">
                  <h5 className="mb-3">
                    <i className="fas fa-lightbulb me-2" style={{color: '#f59e0b'}}></i>
                    Discover Amazing Cafés
                  </h5>
                  <Row>
                    <Col md={4} className="mb-3">
                      <i className="fas fa-search fa-2x mb-2" style={{color: '#f59e0b'}}></i>
                      <h6>Search & Filter</h6>
                      <small className="text-muted">
                        Use our filters to find cafés by location, price, and amenities
                      </small>
                    </Col>
                    <Col md={4} className="mb-3">
                      <i className="fas fa-map-marker-alt fa-2x mb-2" style={{color: '#f59e0b'}}></i>
                      <h6>Explore Locations</h6>
                      <small className="text-muted">
                        Switch to map view to see cafés near you
                      </small>
                    </Col>
                    <Col md={4} className="mb-3">
                      <i className="fas fa-coins fa-2x mb-2" style={{color: '#f59e0b'}}></i>
                      <h6>Earn Points</h6>
                      <small className="text-muted">
                        Visit partner cafés and earn points with every purchase
                      </small>
                    </Col>
                  </Row>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        )}

        {/* Mobile Add Button */}
        {isAuthenticated && (
          <div className="position-fixed bottom-0 end-0 p-3 d-md-none">
            <Button
              size="lg"
              className="rounded-circle shadow text-white"
              onClick={() => navigate('/cafes/new')}
              style={{ 
                width: '60px', 
                height: '60px',
                backgroundColor: '#f59e0b',
                borderColor: '#f59e0b'
              }}
            >
              <i className="fas fa-plus"></i>
            </Button>
          </div>
        )}
      </Container>

      <style>{`
        .cafe-card {
          transition: transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out;
        }
        .cafe-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 15px rgba(0,0,0,0.1) !important;
        }
      `}</style>
    </>
  );
};

export default Cafes;
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Container, Row, Col, Card, Form, Button, Alert } from 'react-bootstrap';
import { cafesAPI, Cafe } from '../services/api';
import { useAuth } from '../context/AuthContext';
import LoadingScreen from '../components/LoadingScreen';
import SEOHead from '../components/SEOHead';
import { toast } from 'react-toastify';

const EditCafe: React.FC = () => {
  const [cafe, setCafe] = useState<Cafe | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    location: '',
    priceRange: '$$' as '$' | '$$' | '$$$' | '$$$$',
    amenities: [] as string[],
    specialties: [] as string[]
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

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
        const cafeData = response.data.cafe;
        setCafe(cafeData);
        setFormData({
          name: cafeData.name || '',
          description: cafeData.description || '',
          location: cafeData.location || '',
          priceRange: cafeData.priceRange || '$$',
          amenities: cafeData.amenities || [],
          specialties: cafeData.specialties || []
        });
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

  if (!isAuthenticated) {
    return (
      <Container className="py-4">
        <Alert variant="warning">
          Please log in to edit this café.
        </Alert>
      </Container>
    );
  }

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

  const isOwner = user && cafe.author._id === user.id;

  if (!isOwner) {
    return (
      <Container className="py-4">
        <Alert variant="warning">
          You don't have permission to edit this café.
        </Alert>
        <Button variant="primary" onClick={() => navigate(`/cafes/${cafe._id}`)}>
          <i className="fas fa-arrow-left me-2"></i>
          Back to Café
        </Button>
      </Container>
    );
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleCheckboxChange = (category: 'amenities' | 'specialties', value: string) => {
    setFormData(prev => ({
      ...prev,
      [category]: prev[category].includes(value)
        ? prev[category].filter(item => item !== value)
        : [...prev[category], value]
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim() || !formData.location.trim()) {
      setError('Name and location are required');
      return;
    }

    setSaving(true);
    setError('');

    try {
      const response = await cafesAPI.update(cafe._id, formData);
      if (response.success && response.data) {
        toast.success('Café updated successfully!');
        navigate(`/cafes/${cafe._id}`);
      } else {
        setError(response.error || 'Failed to update café');
      }
    } catch (error) {
      setError('Failed to update café');
      console.error('Update café error:', error);
    } finally {
      setSaving(false);
    }
  };

  const amenityOptions = [
    'wifi', 'parking', 'outdoor_seating', 'pet_friendly', 'wheelchair_accessible',
    'takeout', 'delivery', 'drive_through', 'reservations', 'live_music',
    'study_friendly', 'meeting_rooms', 'charging_stations'
  ];

  const specialtyOptions = [
    'espresso', 'pour_over', 'cold_brew', 'pastries', 'sandwiches', 'breakfast',
    'lunch', 'vegan_options', 'gluten_free', 'organic', 'fair_trade', 'local_roast'
  ];

  return (
    <>
      <SEOHead 
        title={`Edit ${cafe.name} - Sip Grounds`}
        description={`Edit ${cafe.name} details on Sip Grounds`}
      />
      
      <Container className="py-4">
        <Row className="justify-content-center">
          <Col lg={8}>
            <Card className="shadow">
              <Card.Header className="bg-primary text-white">
                <h4 className="mb-0">
                  <i className="fas fa-edit me-2"></i>
                  Edit {cafe.name}
                </h4>
              </Card.Header>
              <Card.Body>
                {error && (
                  <Alert variant="danger" className="mb-4">
                    <i className="fas fa-exclamation-triangle me-2"></i>
                    {error}
                  </Alert>
                )}

                <Form onSubmit={handleSubmit}>
                  <Row>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label>Café Name *</Form.Label>
                        <Form.Control
                          type="text"
                          name="name"
                          value={formData.name}
                          onChange={handleInputChange}
                          placeholder="Enter café name"
                          required
                        />
                      </Form.Group>
                    </Col>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label>Price Range</Form.Label>
                        <Form.Select
                          name="priceRange"
                          value={formData.priceRange}
                          onChange={handleInputChange}
                        >
                          <option value="$">$ - Budget-friendly</option>
                          <option value="$$">$$ - Moderate</option>
                          <option value="$$$">$$$ - Upscale</option>
                          <option value="$$$$">$$$$ - Premium</option>
                        </Form.Select>
                      </Form.Group>
                    </Col>
                  </Row>

                  <Form.Group className="mb-3">
                    <Form.Label>Location *</Form.Label>
                    <Form.Control
                      type="text"
                      name="location"
                      value={formData.location}
                      onChange={handleInputChange}
                      placeholder="Enter full address or area"
                      required
                    />
                    <Form.Text className="text-muted">
                      Include city, state for better discoverability
                    </Form.Text>
                  </Form.Group>

                  <Form.Group className="mb-4">
                    <Form.Label>Description</Form.Label>
                    <Form.Control
                      as="textarea"
                      rows={4}
                      name="description"
                      value={formData.description}
                      onChange={handleInputChange}
                      placeholder="Describe your café's atmosphere, specialties, and what makes it unique..."
                    />
                  </Form.Group>

                  <Row>
                    <Col md={6}>
                      <Form.Group className="mb-4">
                        <Form.Label>Amenities</Form.Label>
                        <div className="border rounded p-3" style={{ maxHeight: '200px', overflowY: 'auto' }}>
                          {amenityOptions.map((amenity) => (
                            <Form.Check
                              key={amenity}
                              type="checkbox"
                              label={amenity.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                              checked={formData.amenities.includes(amenity)}
                              onChange={() => handleCheckboxChange('amenities', amenity)}
                              className="mb-2"
                            />
                          ))}
                        </div>
                      </Form.Group>
                    </Col>
                    <Col md={6}>
                      <Form.Group className="mb-4">
                        <Form.Label>Specialties</Form.Label>
                        <div className="border rounded p-3" style={{ maxHeight: '200px', overflowY: 'auto' }}>
                          {specialtyOptions.map((specialty) => (
                            <Form.Check
                              key={specialty}
                              type="checkbox"
                              label={specialty.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                              checked={formData.specialties.includes(specialty)}
                              onChange={() => handleCheckboxChange('specialties', specialty)}
                              className="mb-2"
                            />
                          ))}
                        </div>
                      </Form.Group>
                    </Col>
                  </Row>

                  <div className="d-flex gap-3">
                    <Button
                      type="submit"
                      variant="primary"
                      disabled={saving}
                      className="flex-grow-1"
                    >
                      {saving ? (
                        <>
                          <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                          Updating...
                        </>
                      ) : (
                        <>
                          <i className="fas fa-save me-2"></i>
                          Update Café
                        </>
                      )}
                    </Button>
                    
                    <Button
                      type="button"
                      variant="outline-secondary"
                      onClick={() => navigate(`/cafes/${cafe._id}`)}
                    >
                      Cancel
                    </Button>
                  </div>
                </Form>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </>
  );
};

export default EditCafe;
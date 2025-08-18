import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Container, 
  Row, 
  Col, 
  Card, 
  Button, 
  Form, 
  Alert,
  Modal,
  Badge,
  Spinner,
  Tabs,
  Tab,
  ButtonGroup
} from 'react-bootstrap';
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { menuAPI, MenuItem as APIMenuItem, Menu as APIMenu } from '../services/api';
import SEOHead from '../components/SEOHead';

// Use types from API
type MenuItem = APIMenuItem;
type Menu = APIMenu;



const Menu: React.FC = () => {
  const { cafeId } = useParams<{ cafeId: string }>();
  const navigate = useNavigate();
  const [menu, setMenu] = useState<Menu | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState<'drinks' | 'food'>('drinks');
  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null);
  const [showCustomization, setShowCustomization] = useState(false);
  const [customizations, setCustomizations] = useState<{
    size?: string;
    milk?: string;
    extras?: string[];
    quantity: number;
  }>({
    quantity: 1,
    extras: []
  });

  const { isAuthenticated } = useAuth();
  const { addToCart } = useCart();

  useEffect(() => {
    if (cafeId) {
      fetchMenu();
    }
  }, [cafeId]);

  const fetchMenu = async () => {
    if (!cafeId) return;
    
    setLoading(true);
    setError('');
    
    try {
      const response = await menuAPI.getByCafe(cafeId);
      
      if (response.success && response.data) {
        setMenu(response.data.menu);
      } else {
        setError('Failed to fetch menu');
      }
    } catch (error) {
      setError('Failed to fetch menu');
      console.error('Error fetching menu:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleItemClick = (item: MenuItem) => {
    setSelectedItem(item);
    setCustomizations({
      quantity: 1,
      extras: []
    });
    setShowCustomization(true);
  };

  const handleAddToCart = () => {
    if (!selectedItem || !isAuthenticated) {
      toast.error('Please login to add items to cart');
      return;
    }

    // Calculate total price with customizations
    let totalPrice = selectedItem.price;
    if (customizations.size && selectedItem.customization?.sizes) {
      const size = selectedItem.customization.sizes.find(s => s.name === customizations.size);
      if (size) totalPrice = size.price;
    }
    
    if (customizations.extras && selectedItem.customization?.extras) {
      customizations.extras.forEach(extraName => {
        const extra = selectedItem.customization?.extras?.find(e => e.name === extraName);
        if (extra) totalPrice += extra.price;
      });
    }

    // Create customizations object
    const itemCustomizations = {
      size: customizations.size,
      milk: customizations.milk,
      extras: customizations.extras,
      specialInstructions: ''
    };

    // Create a modified item with updated price for cart
    const cartItem = {
      ...selectedItem,
      price: totalPrice
    };

    addToCart(cartItem, customizations.quantity, itemCustomizations);
    setShowCustomization(false);
  };

  const getDrinkSections = () => {
    if (!menu) return [];
    return menu.menuSections
      .filter(section => section.isActive && section.items.some(item => item.category === 'drinks'))
      .sort((a, b) => a.displayOrder - b.displayOrder);
  };

  const getFoodSections = () => {
    if (!menu) return [];
    return menu.menuSections
      .filter(section => section.isActive && section.items.some(item => item.category === 'food'))
      .sort((a, b) => a.displayOrder - b.displayOrder);
  };

  const renderMenuItem = (item: MenuItem) => (
    <Col key={item._id} md={6} lg={4} className="mb-4">
      <Card className="h-100 menu-item-card" style={{ cursor: 'pointer' }}>
        <Card.Img 
          variant="top" 
          src={item.image} 
          alt={item.name}
          style={{ height: '200px', objectFit: 'cover' }}
          onClick={() => handleItemClick(item)}
        />
        <Card.Body className="d-flex flex-column">
          <div className="d-flex justify-content-between align-items-start mb-2">
            <Card.Title 
              className="mb-0"
              onClick={() => handleItemClick(item)}
              style={{ fontSize: '1.1rem' }}
            >
              {item.name}
            </Card.Title>
            <div className="d-flex flex-column align-items-end">
              {item.isPopular && <Badge bg="warning" className="mb-1">Popular</Badge>}
              {item.isRecommended && <Badge bg="success" className="mb-1">Recommended</Badge>}
            </div>
          </div>
          
          <Card.Text className="text-muted small mb-2">
            {item.description}
          </Card.Text>
          
          <div className="mt-auto">
            <div className="d-flex justify-content-between align-items-center mb-2">
              <h5 className="mb-0 text-primary">${item.price.toFixed(2)}</h5>
              <small className="text-muted">
                {item.preparationTime} min • {item.pointsEarned} pts
              </small>
            </div>
            
            {/* Dietary/Drink info badges */}
            <div className="mb-2">
              {item.category === 'drinks' && item.caffeineContent !== undefined && (
                <Badge bg="info" className="me-1">
                  {item.caffeineContent}mg caffeine
                </Badge>
              )}
              {item.category === 'food' && item.dietaryInfo?.isVegan && (
                <Badge bg="success" className="me-1">Vegan</Badge>
              )}
              {item.category === 'food' && item.dietaryInfo?.isGlutenFree && (
                <Badge bg="primary" className="me-1">Gluten-Free</Badge>
              )}
              {!item.inStock && <Badge bg="danger">Out of Stock</Badge>}
            </div>
            
            <Button 
              variant="primary" 
              onClick={() => handleItemClick(item)}
              disabled={!item.inStock}
              className="w-100"
              style={{ backgroundColor: '#4a5d23', borderColor: '#4a5d23' }}
            >
              {!isAuthenticated ? 'Login to Order' : 'Customize & Add'}
            </Button>
          </div>
        </Card.Body>
      </Card>
    </Col>
  );

  if (loading) {
    return (
      <Container className="text-center py-5">
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Loading menu...</span>
        </Spinner>
      </Container>
    );
  }

  if (error || !menu) {
    return (
      <Container>
        <Alert variant="danger">
          {error || 'Menu not found'}
        </Alert>
        <Button variant="outline-primary" onClick={() => navigate('/cafes')}>
          Back to Cafés
        </Button>
      </Container>
    );
  }

  return (
    <Container>
      <SEOHead 
        title={`${menu.cafe.name} Menu`} 
        description={`Browse the menu at ${menu.cafe.name} - ${menu.description}`} 
      />
      
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h1 className="yc-text-primary mb-2">{menu.cafe.name}</h1>
          <p className="text-muted mb-0">{menu.description}</p>
        </div>
        <Button 
          variant="outline-primary" 
          onClick={() => navigate(`/cafes/${cafeId}`)}
        >
          <i className="fas fa-arrow-left me-2"></i>
          Back to Café
        </Button>
      </div>

      {/* Menu Tabs */}
      <Tabs
        activeKey={activeTab}
        onSelect={(k) => setActiveTab(k as 'drinks' | 'food')}
        className="mb-4"
      >
        <Tab eventKey="drinks" title="Drinks">
          {getDrinkSections().map(section => (
            <div key={section.name} className="mb-5">
              <h3 className="mb-3">{section.name}</h3>
              {section.description && (
                <p className="text-muted mb-3">{section.description}</p>
              )}
              <Row>
                {section.items
                  .filter(item => item.category === 'drinks' && item.inStock)
                  .map(renderMenuItem)}
              </Row>
            </div>
          ))}
        </Tab>
        
        <Tab eventKey="food" title="Food">
          {getFoodSections().map(section => (
            <div key={section.name} className="mb-5">
              <h3 className="mb-3">{section.name}</h3>
              {section.description && (
                <p className="text-muted mb-3">{section.description}</p>
              )}
              <Row>
                {section.items
                  .filter(item => item.category === 'food' && item.inStock)
                  .map(renderMenuItem)}
              </Row>
            </div>
          ))}
        </Tab>
      </Tabs>

      {/* Customization Modal */}
      <Modal 
        show={showCustomization} 
        onHide={() => setShowCustomization(false)} 
        size="lg"
      >
        <Modal.Header closeButton>
          <Modal.Title>{selectedItem?.name}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedItem && (
            <>
              <Row className="mb-4">
                <Col md={4}>
                  <img 
                    src={selectedItem.image} 
                    alt={selectedItem.name}
                    className="img-fluid rounded"
                  />
                </Col>
                <Col md={8}>
                  <p className="text-muted">{selectedItem.description}</p>
                  <div className="mb-2">
                    <strong>Base Price: </strong>${selectedItem.price.toFixed(2)}
                  </div>
                  <div className="mb-2">
                    <strong>Points Earned: </strong>{selectedItem.pointsEarned}
                  </div>
                  {selectedItem.nutritionalInfo?.calories && (
                    <div className="mb-2">
                      <strong>Calories: </strong>{selectedItem.nutritionalInfo.calories}
                    </div>
                  )}
                </Col>
              </Row>

              {/* Size Options */}
              {selectedItem.customization?.sizes && (
                <Form.Group className="mb-3">
                  <Form.Label><strong>Size</strong></Form.Label>
                  {selectedItem.customization.sizes.map(size => (
                    <Form.Check
                      key={size.name}
                      type="radio"
                      name="size"
                      id={`size-${size.name}`}
                      label={`${size.name} - $${size.price.toFixed(2)}`}
                      checked={customizations.size === size.name}
                      onChange={() => setCustomizations(prev => ({ ...prev, size: size.name }))}
                    />
                  ))}
                </Form.Group>
              )}

              {/* Milk Options for Drinks */}
              {selectedItem.category === 'drinks' && selectedItem.milkOptions && (
                <Form.Group className="mb-3">
                  <Form.Label><strong>Milk</strong></Form.Label>
                  <Form.Select
                    value={customizations.milk || ''}
                    onChange={(e) => setCustomizations(prev => ({ ...prev, milk: e.target.value }))}
                  >
                    <option value="">Select milk option</option>
                    {selectedItem.milkOptions.map(milk => (
                      <option key={milk.name} value={milk.name}>
                        {milk.name} {milk.extraCharge > 0 && `(+$${milk.extraCharge.toFixed(2)})`}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
              )}

              {/* Extras */}
              {selectedItem.customization?.extras && (
                <Form.Group className="mb-3">
                  <Form.Label><strong>Extras</strong></Form.Label>
                  {selectedItem.customization.extras.map(extra => (
                    <Form.Check
                      key={extra.name}
                      type="checkbox"
                      id={`extra-${extra.name}`}
                      label={`${extra.name} ${extra.price > 0 ? `(+$${extra.price.toFixed(2)})` : ''}`}
                      checked={customizations.extras?.includes(extra.name) || false}
                      onChange={(e) => {
                        const extras = customizations.extras || [];
                        if (e.target.checked) {
                          setCustomizations(prev => ({ 
                            ...prev, 
                            extras: [...extras, extra.name] 
                          }));
                        } else {
                          setCustomizations(prev => ({ 
                            ...prev, 
                            extras: extras.filter(name => name !== extra.name) 
                          }));
                        }
                      }}
                    />
                  ))}
                </Form.Group>
              )}

              {/* Quantity */}
              <Form.Group className="mb-3">
                <Form.Label><strong>Quantity</strong></Form.Label>
                <ButtonGroup>
                  <Button 
                    variant="outline-secondary"
                    onClick={() => setCustomizations(prev => ({ 
                      ...prev, 
                      quantity: Math.max(1, prev.quantity - 1) 
                    }))}
                  >
                    -
                  </Button>
                  <Button variant="outline-secondary" disabled>
                    {customizations.quantity}
                  </Button>
                  <Button 
                    variant="outline-secondary"
                    onClick={() => setCustomizations(prev => ({ 
                      ...prev, 
                      quantity: prev.quantity + 1 
                    }))}
                  >
                    +
                  </Button>
                </ButtonGroup>
              </Form.Group>
            </>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowCustomization(false)}>
            Cancel
          </Button>
          <Button 
            variant="primary" 
            onClick={handleAddToCart}
            disabled={!isAuthenticated}
            style={{ backgroundColor: '#4a5d23', borderColor: '#4a5d23' }}
          >
            {!isAuthenticated ? 'Login Required' : `Add to Cart - $${selectedItem?.price.toFixed(2) || '0.00'}`}
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default Menu;

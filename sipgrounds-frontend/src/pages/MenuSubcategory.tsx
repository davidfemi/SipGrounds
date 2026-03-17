import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Container, Row, Col, Card, Breadcrumb, Alert, Spinner, Button, Modal } from 'react-bootstrap';
import { toast } from 'react-toastify';
import { menuGroupsAPI, MenuItem } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import SEOHead from '../components/SEOHead';


const MenuSubcategory: React.FC = () => {
  const { categoryId, subcategoryId } = useParams<{ categoryId: string; subcategoryId: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [items, setItems] = useState<MenuItem[]>([]);
  const [groupName, setGroupName] = useState('');
  const [groupDescription, setGroupDescription] = useState('');
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [showCustomization, setShowCustomization] = useState(false);
  const [selectedSize, setSelectedSize] = useState<string>('');
  const [quantity, setQuantity] = useState(1);

  const { isAuthenticated } = useAuth();
  const { addToCart } = useCart();

  useEffect(() => {
    if (!subcategoryId) return;
    const fetchItems = async () => {
      setLoading(true);
      setError('');
      try {
        const response = await menuGroupsAPI.getGroupItems(subcategoryId);
        if (response.success && response.data) {
          setItems(response.data.items || []);
          setGroupName(response.data.group?.name || subcategoryId);
          setGroupDescription(response.data.group?.description || '');
        } else {
          setError('Failed to load menu items');
        }
      } catch (err) {
        setError('Could not load menu items. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    fetchItems();
  }, [subcategoryId]);

  const handleItemClick = (item: MenuItem) => {
    // Normalise API shape: customization.sizes → sizes for the modal
    const sizes = item.customization?.sizes || [];
    const normalised = { ...item, sizes };
    setSelectedItem(normalised);
    setSelectedSize(sizes.length > 0 ? sizes[0].name : '');
    setQuantity(1);
    setShowCustomization(true);
  };

  const handleAddToCart = () => {
    if (!selectedItem || !isAuthenticated) {
      toast.error('Please login to add items to cart');
      return;
    }

    const selectedSizeData = selectedItem.sizes?.find((s: any) => s.name === selectedSize);
    const finalPrice = selectedSizeData ? selectedSizeData.price : selectedItem.price;

    const cartItem = {
      ...selectedItem,
      price: finalPrice,
      _id: selectedItem._id || selectedItem.id,
      category: 'drinks' as const,
      itemType: 'DrinkItem' as const,
      pointsEarned: selectedItem.pointsEarned || Math.ceil(finalPrice),
      inStock: selectedItem.inStock ?? true,
      isPopular: selectedItem.isPopular ?? false,
      isRecommended: selectedItem.isRecommended ?? false,
      preparationTime: selectedItem.preparationTime ?? 3
    };

    const customizations = selectedSize ? { size: selectedSize } : undefined;

    addToCart(cartItem, quantity, customizations);
    toast.success(`${selectedItem.name} added to cart!`);
    setShowCustomization(false);
  };

  return (
    <>
      <SEOHead
        title={`${groupName} - Menu - SipGrounds`}
        description={groupDescription}
      />

      {/* Breadcrumb */}
      <div className="bg-light py-3">
        <Container>
          <Breadcrumb>
            <Breadcrumb.Item as={Link} to="/menu">Menu</Breadcrumb.Item>
            <Breadcrumb.Item as={Link} to={`/menu/${categoryId}`}>
              {categoryId}
            </Breadcrumb.Item>
            <Breadcrumb.Item active>{groupName}</Breadcrumb.Item>
          </Breadcrumb>
        </Container>
      </div>

      {/* Header */}
      <div className="bg-white py-4 border-bottom">
        <Container>
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <h1 className="mb-2">{groupName}</h1>
              {groupDescription && <p className="text-muted mb-0">{groupDescription}</p>}
            </div>
            <button className="btn btn-outline-primary" onClick={() => navigate(-1)}>
              ← Back
            </button>
          </div>
        </Container>
      </div>

      {/* Items Grid */}
      <Container className="py-5">
        {error && <Alert variant="danger" className="mb-4">{error}</Alert>}

        {loading ? (
          <div className="text-center py-5">
            <Spinner animation="border" role="status">
              <span className="visually-hidden">Loading...</span>
            </Spinner>
          </div>
        ) : items.length === 0 && !error ? (
          <Alert variant="info">No items found for this category.</Alert>
        ) : (
          <Row className="g-4">
            {items.map((item: MenuItem) => (
              <Col key={item._id} md={6} lg={4} xl={3}>
                <Card 
                  className="h-100 border-0 shadow-sm item-card"
                  style={{ cursor: 'pointer' }}
                  onClick={() => handleItemClick(item)}
                >
                  <div className="position-relative overflow-hidden" style={{ height: '200px' }}>
                    <Card.Img 
                      variant="top" 
                      src={item.image} 
                      alt={item.name}
                      className="w-100 h-100"
                      style={{ objectFit: 'cover' }}
                    />
                  </div>
                  <Card.Body className="d-flex flex-column">
                    <Card.Title className="fw-bold mb-2" style={{ fontSize: '1rem' }}>
                      {item.name}
                    </Card.Title>
                    <Card.Text className="text-muted small mb-3 flex-grow-1">
                      {item.description}
                    </Card.Text>
                    <div className="mt-auto">
                      <div className="d-flex justify-content-between align-items-center">
                        <div className="fw-bold text-primary">
                          ${item.price.toFixed(2)}
                          {item.customization?.sizes && item.customization.sizes.length > 1 && (
                            <small className="text-muted"> - ${item.customization.sizes[item.customization.sizes.length - 1].price.toFixed(2)}</small>
                          )}
                        </div>
                        <Button 
                          size="sm" 
                          variant="primary"
                          style={{ backgroundColor: '#4a5d23', borderColor: '#4a5d23' }}
                        >
                          Add
                        </Button>
                      </div>
                    </div>
                  </Card.Body>
                </Card>
              </Col>
            ))}
          </Row>
        )}
      </Container>

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
                </Col>
              </Row>

              {/* Size Options */}
              {selectedItem.sizes && (
                <div className="mb-4">
                  <h6 className="fw-bold mb-3">Size</h6>
                  {selectedItem.sizes.map((size: any) => (
                    <div key={size.name} className="form-check mb-2">
                      <input
                        className="form-check-input"
                        type="radio"
                        name="size"
                        id={`size-${size.name}`}
                        checked={selectedSize === size.name}
                        onChange={() => setSelectedSize(size.name)}
                      />
                      <label className="form-check-label d-flex justify-content-between w-100" htmlFor={`size-${size.name}`}>
                        <span>{size.name}</span>
                        <span className="fw-bold">${size.price.toFixed(2)}</span>
                      </label>
                    </div>
                  ))}
                </div>
              )}

              {/* Quantity */}
              <div className="mb-3">
                <h6 className="fw-bold mb-3">Quantity</h6>
                <div className="d-flex align-items-center">
                  <Button 
                    variant="outline-secondary" 
                    size="sm"
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  >
                    -
                  </Button>
                  <span className="mx-3 fw-bold">{quantity}</span>
                  <Button 
                    variant="outline-secondary" 
                    size="sm"
                    onClick={() => setQuantity(quantity + 1)}
                  >
                    +
                  </Button>
                </div>
              </div>
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
            {!isAuthenticated ? 'Login Required' : `Add to Cart - $${
              selectedItem?.sizes?.find((s: any) => s.name === selectedSize)?.price.toFixed(2) || 
              selectedItem?.price.toFixed(2) || '0.00'
            }`}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Custom Styles */}
      <style>{`
        .item-card {
          transition: transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out;
        }
        
        .item-card:hover {
          transform: translateY(-3px);
          box-shadow: 0 6px 20px rgba(0,0,0,0.15) !important;
        }
        
        .item-card:hover .card-title {
          color: #4a5d23 !important;
        }
      `}</style>
    </>
  );
};

export default MenuSubcategory;

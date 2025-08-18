import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Container, Row, Col, Card, Breadcrumb, Alert, Spinner, Button, Badge, Modal } from 'react-bootstrap';
import { toast } from 'react-toastify';
import { menuAPI, MenuItem } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import SEOHead from '../components/SEOHead';

// Subcategory configurations with sample items
const subcategoryConfig: { [key: string]: any } = {
  'brewed-coffee': {
    name: 'Brewed Coffee',
    description: 'Our signature blends, brewed fresh daily',
    categoryName: 'Hot Coffee',
    items: [
      {
        id: 'blonde-roast-sumatra',
        name: 'Blonde Roast - Sumatra',
        description: 'Light and smooth with herbal notes',
        image: 'https://images.unsplash.com/photo-1497935586351-b67a49e012bf?w=400',
        price: 2.45,
        sizes: [
          { name: 'Short', price: 2.45 },
          { name: 'Tall', price: 2.65 },
          { name: 'Grande', price: 2.95 },
          { name: 'Venti', price: 3.25 }
        ]
      },
      {
        id: 'medium-roast-pike-place',
        name: 'Medium Roast - Pike Place® Roast',
        description: 'Smooth and balanced with rich flavor',
        image: 'https://images.unsplash.com/photo-1497935586351-b67a49e012bf?w=400',
        price: 2.45,
        sizes: [
          { name: 'Short', price: 2.45 },
          { name: 'Tall', price: 2.65 },
          { name: 'Grande', price: 2.95 },
          { name: 'Venti', price: 3.25 }
        ]
      },
      {
        id: 'dark-roast-sumatra',
        name: 'Dark Roast - Sumatra',
        description: 'Full-bodied with earthy, herbal notes',
        image: 'https://images.unsplash.com/photo-1497935586351-b67a49e012bf?w=400',
        price: 2.45,
        sizes: [
          { name: 'Short', price: 2.45 },
          { name: 'Tall', price: 2.65 },
          { name: 'Grande', price: 2.95 },
          { name: 'Venti', price: 3.25 }
        ]
      },
      {
        id: 'dark-roast-caffe-verona',
        name: 'Dark Roast - Caffè Verona®',
        description: 'Well-balanced with a rich, approachable taste',
        image: 'https://images.unsplash.com/photo-1497935586351-b67a49e012bf?w=400',
        price: 2.45,
        sizes: [
          { name: 'Short', price: 2.45 },
          { name: 'Tall', price: 2.65 },
          { name: 'Grande', price: 2.95 },
          { name: 'Venti', price: 3.25 }
        ]
      },
      {
        id: 'decaf-roast-pike-place',
        name: 'Decaf Roast - Pike Place® Roast',
        description: 'Same great taste, without the caffeine',
        image: 'https://images.unsplash.com/photo-1497935586351-b67a49e012bf?w=400',
        price: 2.45,
        sizes: [
          { name: 'Short', price: 2.45 },
          { name: 'Tall', price: 2.65 },
          { name: 'Grande', price: 2.95 },
          { name: 'Venti', price: 3.25 }
        ]
      },
      {
        id: 'caffe-misto',
        name: 'Caffè Misto',
        description: 'Coffee with steamed milk',
        image: 'https://images.unsplash.com/photo-1561047029-3000c68339ca?w=400',
        price: 3.45,
        sizes: [
          { name: 'Short', price: 3.45 },
          { name: 'Tall', price: 3.65 },
          { name: 'Grande', price: 4.15 },
          { name: 'Venti', price: 4.45 }
        ]
      }
    ]
  },
  'latte': {
    name: 'Latte',
    description: 'Rich espresso with steamed milk',
    categoryName: 'Hot Coffee',
    items: [
      {
        id: 'caffe-latte',
        name: 'Caffè Latte',
        description: 'Our dark, rich espresso balanced with steamed milk',
        image: 'https://images.unsplash.com/photo-1561047029-3000c68339ca?w=400',
        price: 4.45,
        sizes: [
          { name: 'Short', price: 4.45 },
          { name: 'Tall', price: 4.65 },
          { name: 'Grande', price: 5.25 },
          { name: 'Venti', price: 5.65 }
        ]
      },
      {
        id: 'cinnamon-dolce-latte',
        name: 'Cinnamon Dolce Latte',
        description: 'Espresso with steamed milk and cinnamon dolce syrup',
        image: 'https://images.unsplash.com/photo-1561047029-3000c68339ca?w=400',
        price: 5.25,
        sizes: [
          { name: 'Short', price: 5.25 },
          { name: 'Tall', price: 5.45 },
          { name: 'Grande', price: 6.05 },
          { name: 'Venti', price: 6.45 }
        ]
      },
      {
        id: 'starbucks-blonde-vanilla-latte',
        name: 'Starbucks® Blonde Vanilla Latte',
        description: 'Blonde espresso with vanilla syrup and steamed milk',
        image: 'https://images.unsplash.com/photo-1561047029-3000c68339ca?w=400',
        price: 5.25,
        sizes: [
          { name: 'Short', price: 5.25 },
          { name: 'Tall', price: 5.45 },
          { name: 'Grande', price: 6.05 },
          { name: 'Venti', price: 6.45 }
        ]
      },
      {
        id: 'lavender-oatmilk-latte',
        name: 'Lavender Oatmilk Latte',
        description: 'Espresso with lavender syrup and oat milk',
        image: 'https://images.unsplash.com/photo-1561047029-3000c68339ca?w=400',
        price: 5.65,
        sizes: [
          { name: 'Short', price: 5.65 },
          { name: 'Tall', price: 5.85 },
          { name: 'Grande', price: 6.45 },
          { name: 'Venti', price: 6.85 }
        ]
      }
    ]
  }
};

const MenuSubcategory: React.FC = () => {
  const { categoryId, subcategoryId } = useParams<{ categoryId: string; subcategoryId: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [showCustomization, setShowCustomization] = useState(false);
  const [selectedSize, setSelectedSize] = useState<string>('');
  const [quantity, setQuantity] = useState(1);

  const { isAuthenticated } = useAuth();
  const { addToCart } = useCart();

  const subcategory = subcategoryId ? subcategoryConfig[subcategoryId] : null;

  const handleItemClick = (item: any) => {
    setSelectedItem(item);
    setSelectedSize(item.sizes ? item.sizes[0].name : '');
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
      _id: selectedItem.id,
      category: 'drinks' as const,
      itemType: 'DrinkItem' as const,
      pointsEarned: Math.ceil(finalPrice),
      inStock: true,
      isPopular: false,
      isRecommended: false,
      preparationTime: 3
    };

    const customizations = selectedSize ? { size: selectedSize } : undefined;

    addToCart(cartItem, quantity, customizations);
    toast.success(`${selectedItem.name} added to cart!`);
    setShowCustomization(false);
  };

  if (!subcategory) {
    return (
      <Container className="py-5">
        <Alert variant="danger">
          Subcategory not found. <Link to="/menu">Return to Menu</Link>
        </Alert>
      </Container>
    );
  }

  return (
    <>
      <SEOHead 
        title={`${subcategory.name} - ${subcategory.categoryName} - Menu - SipGrounds`} 
        description={subcategory.description} 
      />
      
      {/* Breadcrumb */}
      <div className="bg-light py-3">
        <Container>
          <Breadcrumb>
            <Breadcrumb.Item as={Link} to="/menu">Menu</Breadcrumb.Item>
            <Breadcrumb.Item as={Link} to={`/menu/${categoryId}`}>
              {subcategory.categoryName}
            </Breadcrumb.Item>
            <Breadcrumb.Item active>{subcategory.name}</Breadcrumb.Item>
          </Breadcrumb>
        </Container>
      </div>

      {/* Header */}
      <div className="bg-white py-4 border-bottom">
        <Container>
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <h1 className="mb-2">{subcategory.name}</h1>
              <p className="text-muted mb-0">{subcategory.description}</p>
            </div>
            <button 
              className="btn btn-outline-primary"
              onClick={() => navigate(-1)}
            >
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
        ) : (
          <Row className="g-4">
            {subcategory.items.map((item: any) => (
              <Col key={item.id} md={6} lg={4} xl={3}>
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
                          {item.sizes && item.sizes.length > 1 && (
                            <small className="text-muted"> - ${item.sizes[item.sizes.length - 1].price.toFixed(2)}</small>
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

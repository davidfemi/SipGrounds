import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Container, Row, Col, Card, Breadcrumb, Alert, Spinner } from 'react-bootstrap';
import { menuGroupsAPI, MenuItem } from '../services/api';
import SEOHead from '../components/SEOHead';

// Category configurations
const categoryConfig: { [key: string]: any } = {
  'hot-coffee': {
    name: 'Hot Coffee',
    description: 'Rich, aromatic coffee beverages served hot',
    subcategories: [
      {
        id: 'brewed-coffee',
        name: 'Brewed Coffee',
        description: 'Our signature blends, brewed fresh daily',
        image: 'https://images.unsplash.com/photo-1497935586351-b67a49e012bf?w=400',
        drinkTypes: ['brewed_coffee']
      },
      {
        id: 'americano',
        name: 'Americano',
        description: 'Espresso shots topped with hot water',
        image: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=400',
        drinkTypes: ['americano']
      },
      {
        id: 'latte',
        name: 'Latte',
        description: 'Rich espresso with steamed milk',
        image: 'https://images.unsplash.com/photo-1561047029-3000c68339ca?w=400',
        drinkTypes: ['latte']
      },
      {
        id: 'cappuccino',
        name: 'Cappuccino',
        description: 'Espresso with steamed milk and foam',
        image: 'https://images.unsplash.com/photo-1572442388796-11668a67e53d?w=400',
        drinkTypes: ['cappuccino']
      },
      {
        id: 'mocha',
        name: 'Mocha',
        description: 'Espresso with chocolate and steamed milk',
        image: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400',
        drinkTypes: ['mocha']
      },
      {
        id: 'macchiato',
        name: 'Macchiato',
        description: 'Espresso with a dollop of steamed milk',
        image: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=400',
        drinkTypes: ['macchiato']
      },
      {
        id: 'flat-white',
        name: 'Flat White',
        description: 'Double shot espresso with steamed milk',
        image: 'https://images.unsplash.com/photo-1561047029-3000c68339ca?w=400',
        drinkTypes: ['flat_white']
      },
      {
        id: 'cortado',
        name: 'Cortado',
        description: 'Equal parts espresso and warm milk',
        image: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=400',
        drinkTypes: ['cortado']
      }
    ]
  },
  'cold-coffee': {
    name: 'Cold Coffee',
    description: 'Refreshing coffee beverages served cold',
    subcategories: [
      {
        id: 'cold-brew',
        name: 'Cold Brew',
        description: 'Slow-steeped, smooth and refreshing',
        image: 'https://images.unsplash.com/photo-1461023058943-07fcbe16d735?w=400',
        drinkTypes: ['cold_brew']
      },
      {
        id: 'iced-coffee',
        name: 'Iced Coffee',
        description: 'Our signature coffee served over ice',
        image: 'https://images.unsplash.com/photo-1517701604599-bb29b565090c?w=400',
        drinkTypes: ['iced_coffee']
      },
      {
        id: 'iced-latte',
        name: 'Iced Latte',
        description: 'Espresso with cold milk over ice',
        image: 'https://images.unsplash.com/photo-1517701604599-bb29b565090c?w=400',
        drinkTypes: ['iced_latte']
      },
      {
        id: 'nitro-cold-brew',
        name: 'Nitro Cold Brew',
        description: 'Cold brew infused with nitrogen',
        image: 'https://images.unsplash.com/photo-1544787219-7f47ccb76574?w=400',
        drinkTypes: ['nitro_cold_brew']
      }
    ]
  },
  'breakfast': {
    name: 'Breakfast',
    description: 'Start your day with our delicious breakfast options',
    subcategories: [
      {
        id: 'egg-bites',
        name: 'Egg Bites',
        description: 'Fluffy eggs with various fillings',
        image: 'https://images.unsplash.com/photo-1525351484163-7529414344d8?w=400',
        foodTypes: ['egg_bites']
      },
      {
        id: 'breakfast-sandwiches',
        name: 'Breakfast Sandwiches',
        description: 'Hearty sandwiches to fuel your morning',
        image: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=400',
        foodTypes: ['sandwich']
      }
    ]
  },
  'bakery': {
    name: 'Bakery',
    description: 'Freshly baked pastries and treats',
    subcategories: [
      {
        id: 'croissants',
        name: 'Croissants',
        description: 'Buttery, flaky French pastries',
        image: 'https://images.unsplash.com/photo-1555507036-ab794f4ade0a?w=400',
        foodTypes: ['butter_croissant', 'chocolate_croissant', 'ham_swiss_croissant']
      },
      {
        id: 'danish',
        name: 'Danish',
        description: 'Sweet pastries with delicious fillings',
        image: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=400',
        foodTypes: ['vanilla_bean_custard_danish']
      }
    ]
  }
  ,
  'hot-tea': {
    name: 'Hot Tea',
    description: 'Comforting teas served warm',
    subcategories: []
  },
  'cold-tea': {
    name: 'Cold Tea',
    description: 'Refreshing iced teas',
    subcategories: []
  },
  'refreshers': {
    name: 'Refreshers',
    description: 'Light, fruit-forward beverages',
    subcategories: []
  },
  'frappuccino': {
    name: 'Frappuccino',
    description: 'Blended beverages',
    subcategories: []
  },
  'hot-chocolate-more': {
    name: 'Hot Chocolate & More',
    description: 'Hot chocolate, lemonades and more',
    subcategories: []
  },
  'bottled': {
    name: 'Bottled',
    description: 'Bottled water, juices and more',
    subcategories: []
  }
};

const MenuCategory: React.FC = () => {
  const { categoryId } = useParams<{ categoryId: string }>();
  const slugAliases: Record<string, string> = {
    'bottled-beverages': 'bottled',
    'hot-chocolate-and-more': 'hot-chocolate-more',
    'hot-chocolate': 'hot-chocolate-more'
  };
  const resolvedId = categoryId ? (slugAliases[categoryId] || categoryId) : undefined;
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [items, setItems] = useState<MenuItem[]>([]);

  const category = resolvedId ? categoryConfig[resolvedId] : null;

  useEffect(() => {
    const load = async () => {
      if (!resolvedId) return;
      setLoading(true);
      setError('');
      try {
        const res = await menuGroupsAPI.getGroupItems(resolvedId, { inStock: true });
        setItems(res.data?.items || []);
      } catch (e: any) {
        setError(e?.response?.data?.error || 'Failed to load items');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [resolvedId]);

  if (!category) {
    return (
      <Container className="py-5">
        <Alert variant="danger">
          Category not found. <Link to="/menu">Return to Menu</Link>
        </Alert>
      </Container>
    );
  }

  return (
    <>
      <SEOHead 
        title={`${category.name} - Menu - SipGrounds`} 
        description={category.description} 
      />
      
      {/* Breadcrumb */}
      <div className="bg-light py-3">
        <Container>
          <Breadcrumb>
            <Breadcrumb.Item linkAs={Link} linkProps={{ to: '/menu' }}>Menu</Breadcrumb.Item>
            <Breadcrumb.Item active>{category.name}</Breadcrumb.Item>
          </Breadcrumb>
        </Container>
      </div>

      {/* Header */}
      <div className="bg-white py-4 border-bottom">
        <Container>
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <h1 className="mb-2">{category.name}</h1>
              <p className="text-muted mb-0">{category.description}</p>
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
            {items.map((item) => (
              <Col key={item._id} md={6} lg={4} xl={3}>
                <Card className="h-100 border-0 shadow-sm">
                  <div className="position-relative overflow-hidden" style={{ height: '200px' }}>
                    <Card.Img 
                      variant="top" 
                      src={(item as any).image}
                      alt={item.name}
                      className="w-100 h-100"
                      style={{ objectFit: 'cover' }}
                    />
                  </div>
                  <Card.Body>
                    <Card.Title className="fw-bold text-dark mb-1">{item.name}</Card.Title>
                    <Card.Text className="text-muted small">{(item as any).description}</Card.Text>
                    <div className="d-flex justify-content-between align-items-center">
                      <span className="fw-bold">${item.price?.toFixed(2)}</span>
                      <Link to={`/menu-items/${item._id}`} className="btn btn-sm btn-outline-primary">View</Link>
                    </div>
                  </Card.Body>
                </Card>
              </Col>
            ))}
            {items.length === 0 && !loading && (
              <Col>
                <Alert variant="info">No items available in this group yet.</Alert>
              </Col>
            )}
          </Row>
        )}
      </Container>

      {/* Custom Styles */}
      <style>{`
        .subcategory-card {
          transition: transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out;
        }
        
        .subcategory-card:hover {
          transform: translateY(-3px);
          box-shadow: 0 6px 20px rgba(0,0,0,0.15) !important;
          text-decoration: none;
        }
        
        .subcategory-card:hover .card-title {
          color: #4a5d23 !important;
        }
      `}</style>
    </>
  );
};

export default MenuCategory;

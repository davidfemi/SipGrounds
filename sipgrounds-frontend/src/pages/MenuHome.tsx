import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Spinner, Alert } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { menuAPI } from '../services/api';
import SEOHead from '../components/SEOHead';

// Menu categories with custom Cloudinary images
const menuCategoryImages: { [key: string]: string } = {
  'hot-coffee': 'https://res.cloudinary.com/djsoqjxpg/image/upload/v1755202281/hot_coffee_zlym0y.jpg',
  'cold-coffee': 'https://res.cloudinary.com/djsoqjxpg/image/upload/v1755202282/cold_coffee_zhhesq.jpg',
  'hot-tea': 'https://res.cloudinary.com/djsoqjxpg/image/upload/v1755202280/hot_tea_gmvzmw.jpg',
  'cold-tea': 'https://res.cloudinary.com/djsoqjxpg/image/upload/v1755202277/cold_tea_ipge6m.jpg',
  'refreshers': 'https://res.cloudinary.com/djsoqjxpg/image/upload/v1755202278/refresher_byajep.jpg',
  'frappuccino': 'https://res.cloudinary.com/djsoqjxpg/image/upload/v1755202279/frappuccino_kkrlgu.jpg',
  'hot-chocolate': 'https://res.cloudinary.com/djsoqjxpg/image/upload/v1755202284/hot_chocolate_zgs31m.jpg',
  'bottled-beverages': 'https://res.cloudinary.com/djsoqjxpg/image/upload/v1755202278/orange_juice_yxc2ng.jpg',
  'breakfast': 'https://res.cloudinary.com/djsoqjxpg/image/upload/v1755202281/sandwich_mjr2id.jpg',
  'bakery': 'https://res.cloudinary.com/djsoqjxpg/image/upload/v1755202283/pastry_ryj12t.jpg',
  'snacks': 'https://res.cloudinary.com/djsoqjxpg/image/upload/v1755202283/pastry_ryj12t.jpg'
};

// Category configuration
const categoryConfig: { [key: string]: { name: string } } = {
  'hot-coffee': { name: 'Hot Coffee' },
  'cold-coffee': { name: 'Cold Coffee' },
  'hot-tea': { name: 'Hot Tea' },
  'cold-tea': { name: 'Cold Tea' },
  'refreshers': { name: 'Refreshers' },
  'frappuccino': { name: 'Frappuccino® Blended Beverages' },
  'hot-chocolate': { name: 'Hot Chocolate, Lemonade & More' },
  'bottled-beverages': { name: 'Bottled Beverages' },
  'breakfast': { name: 'Breakfast' },
  'bakery': { name: 'Bakery' },
  'snacks': { name: 'Snacks' }
};

const MenuHome: React.FC = () => {
  const [menuItems, setMenuItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchMenuItems = async () => {
      try {
        setLoading(true);
        // Fetch enough items to include all categories so none are hidden by pagination
        const response = await menuAPI.searchItems({ limit: 200 });
        setMenuItems(response.data?.items || []);
      } catch (err) {
        console.error('Error fetching menu items:', err);
        setError('Failed to load menu items');
      } finally {
        setLoading(false);
      }
    };

    fetchMenuItems();
  }, []);

  // Group items by category and create display structure
  const organizeMenuItems = () => {
    const drinkCategories: { [key: string]: any[] } = {};
    const foodCategories: { [key: string]: any[] } = {};

    menuItems.forEach(item => {
      if (item.category === 'drinks') {
        // Group drinks by type
        let categoryKey = '';
        // Hot coffee family
        if (
          ['brewed_coffee', 'latte', 'americano', 'cappuccino', 'mocha', 'cortado']
            .includes(item.drinkType)
        ) {
          categoryKey = 'hot-coffee';
        // Cold coffee family
        } else if (
          ['iced_coffee', 'cold_brew', 'nitro_cold_brew', 'iced_shaken_espresso', 'iced_latte', 'iced_mocha']
            .includes(item.drinkType)
        ) {
          categoryKey = 'cold-coffee';
        // Hot tea
        } else if (item.drinkType === 'hot_tea') {
          categoryKey = 'hot-tea';
        // Cold tea and tea lemonades
        } else if (['iced_tea', 'tea_lemonade'].includes(item.drinkType)) {
          categoryKey = 'cold-tea';
        // Refreshers (generic or specific)
        } else if (['refresher', 'mango_dragonfruit_lemonade', 'strawberry_acai_lemonade', 'summer_berry_refresher']
            .includes(item.drinkType)) {
          categoryKey = 'refreshers';
        // Frappuccino family
        } else if (['frappuccino', 'coffee_frappuccino', 'creme_frappuccino', 'strato_frappuccino']
            .includes(item.drinkType)) {
          categoryKey = 'frappuccino';
        // Hot chocolate, lemonade & more
        } else if (['hot_chocolate', 'lemonade', 'steamed_juice'].includes(item.drinkType)) {
          categoryKey = 'hot-chocolate';
        // Bottled beverages
        } else if (['bottled_water', 'bottled_juice', 'sparkling_water', 'juice']
            .includes(item.drinkType)) {
          categoryKey = 'bottled-beverages';
        }

        if (categoryKey) {
          if (!drinkCategories[categoryKey]) drinkCategories[categoryKey] = [];
          drinkCategories[categoryKey].push(item);
        }
      } else if (item.category === 'food') {
        // Group food by type
        let categoryKey = '';
        if (['sandwich', 'wrap', 'egg_bites', 'egg_bakes', 'avocado_spread'].includes(item.foodType)) {
          categoryKey = 'breakfast';
        } else if (['vanilla_bean_custard_danish', 'baked_apple_croissant', 'ham_swiss_croissant', 'butter_croissant', 'chocolate_croissant'].includes(item.foodType)) {
          categoryKey = 'bakery';
        } else if (['madagascar_vanilla_bar', 'dark_chocolate_peanut_butter_bar', 'peanut_butter_bar'].includes(item.foodType)) {
          categoryKey = 'snacks';
        }

        if (categoryKey) {
          if (!foodCategories[categoryKey]) foodCategories[categoryKey] = [];
          foodCategories[categoryKey].push(item);
        }
      }
    });

    return { drinkCategories, foodCategories };
  };

  const { drinkCategories, foodCategories } = organizeMenuItems();

  // Create category display objects
  const createCategoryDisplay = (categoryKey: string, items: any[]) => ({
    id: categoryKey,
    name: categoryConfig[categoryKey]?.name || categoryKey,
    image: menuCategoryImages[categoryKey] || 'https://images.unsplash.com/photo-1497935586351-b67a49e012bf?w=400',
    itemCount: items.length,
    subcategories: items.slice(0, 3).map(item => item.name)
  });

  const drinkCategoryDisplays = Object.entries(drinkCategories).map(([key, items]) => 
    createCategoryDisplay(key, items)
  );

  const foodCategoryDisplays = Object.entries(foodCategories).map(([key, items]) => 
    createCategoryDisplay(key, items)
  );

  // Note: Seasonal & Limited-Time items intentionally omitted from display

  const renderCategorySection = (title: string, categories: any[], bgColor: string = 'bg-light') => (
    <div className={`py-5 ${bgColor}`}>
      <Container>
        <h2 className="text-start mb-4 fw-bold" style={{ fontSize: '1.5rem', color: '#333' }}>{title}</h2>
        <Row className="g-4">
          {categories.map((category) => (
            <Col key={category.id} xs={6} md={4} lg={3} className="mb-4">
              <Link 
                to={`/menu/${category.id}`}
                className="text-decoration-none d-flex align-items-center category-link"
                style={{ cursor: 'pointer' }}
              >
                <div 
                  className="rounded-circle me-3 flex-shrink-0"
                  style={{ 
                    width: '140px', 
                    height: '140px',
                    backgroundImage: `url(${category.image})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center'
                  }}
                />
                <div>
                  <h5 className="mb-0 text-dark fw-normal" style={{ fontSize: '1rem' }}>
                    {category.name}
                  </h5>
                </div>
              </Link>
            </Col>
          ))}
        </Row>
      </Container>
    </div>
  );

  if (loading) {
    return (
      <Container className="py-5">
        <div className="text-center">
          <Spinner animation="border" role="status" className="mb-3">
            <span className="visually-hidden">Loading...</span>
          </Spinner>
          <p>Loading our delicious menu...</p>
        </div>
      </Container>
    );
  }

  if (error) {
    return (
      <Container className="py-5">
        <Alert variant="danger" className="text-center">
          <h4>Oops! Something went wrong</h4>
          <p>{error}</p>
          <button 
            className="btn btn-primary" 
            onClick={() => window.location.reload()}
          >
            Try Again
          </button>
        </Alert>
      </Container>
    );
  }

  return (
    <>
      <SEOHead 
        title="Menu - SipGrounds" 
        description="Explore our full menu of drinks, food, and seasonal specialties" 
      />
      
      {/* Hero Section */}
      <div className="bg-primary text-white py-5">
        <Container>
          <div className="text-center">
            <h1 className="display-4 fw-bold mb-3">Menu</h1>
            <p className="lead mb-0">
              Discover our carefully crafted selection of {menuItems.length} delicious items
            </p>
          </div>
        </Container>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white border-bottom sticky-top" style={{ top: '76px', zIndex: 1020 }}>
        <Container>
          <div className="d-flex justify-content-center py-3">
            <div className="d-flex gap-4">
              {drinkCategoryDisplays.length > 0 && (
                <a href="#drinks" className="text-decoration-none fw-semibold text-primary">
                  Drinks ({drinkCategoryDisplays.length})
                </a>
              )}
              {foodCategoryDisplays.length > 0 && (
                <a href="#food" className="text-decoration-none fw-semibold text-primary">
                  Food ({foodCategoryDisplays.length})
                </a>
              )}
              {/* Seasonal & Limited-Time tab removed intentionally */}
            </div>
          </div>
        </Container>
      </div>

      {/* Drinks Section */}
      {drinkCategoryDisplays.length > 0 && (
        <div id="drinks">
          {renderCategorySection('Drinks', drinkCategoryDisplays, 'bg-white')}
        </div>
      )}

      {/* Food Section */}
      {foodCategoryDisplays.length > 0 && (
        <div id="food">
          {renderCategorySection('Food', foodCategoryDisplays, 'bg-light')}
        </div>
      )}

      {/* At Home Coffee (Whole Bean) showcase - retained */}
      <div className="py-4 bg-white">
        <Container>
          <h3 className="mb-4 fw-bold" style={{ fontSize: '1.25rem' }}>At Home Coffee</h3>
          <Row className="g-4">
            {[{
              id: 'sumatra', name: 'Sumatra Blend', image: 'https://res.cloudinary.com/djsoqjxpg/image/upload/v1755035275/Sumatra_jy93xk.jpg'
            },{
              id: 'new-york', name: 'New York Blend', image: 'https://res.cloudinary.com/djsoqjxpg/image/upload/v1755035275/NewYork_cedbdt.jpg'
            },{
              id: 'colombian', name: 'Colombian Blend', image: 'https://res.cloudinary.com/djsoqjxpg/image/upload/v1755035275/Colombian_h3koyo.jpg'
            },{
              id: 'chicago', name: 'Chicago Blend', image: 'https://res.cloudinary.com/djsoqjxpg/image/upload/v1755035275/Chicago_rkfdfj.jpg'
            },{
              id: 'ethiopian', name: 'Ethiopian Blend', image: 'https://res.cloudinary.com/djsoqjxpg/image/upload/v1755035275/Ethiopian_kvcf8y.jpg'
            },{
              id: 'seattle', name: 'Seattle Blend', image: 'https://res.cloudinary.com/djsoqjxpg/image/upload/v1755036449/Seattle_xqmge0.jpg'
            },{
              id: 'miami', name: 'Miami Blend', image: 'https://res.cloudinary.com/djsoqjxpg/image/upload/v1755036449/Miami_zq7nhq.jpg'
            },{
              id: 'san-francisco', name: 'San Francisco Blend', image: 'https://res.cloudinary.com/djsoqjxpg/image/upload/v1755036449/SanFran_ozcoho.jpg'
            }].map(bean => (
              <Col key={bean.id} xs={6} md={3} className="mb-3">
                <Link to="/shop" className="text-decoration-none d-flex align-items-center category-link" style={{ cursor: 'pointer' }}>
                  <div className="rounded-circle me-3 flex-shrink-0" style={{ width: '140px', height: '140px', backgroundImage: `url(${bean.image})`, backgroundSize: 'cover', backgroundPosition: 'center' }} />
                  <div>
                    <h5 className="mb-0 text-dark fw-normal" style={{ fontSize: '1rem' }}>{bean.name}</h5>
                  </div>
                </Link>
              </Col>
            ))}
          </Row>
        </Container>
      </div>

      {/* Custom Styles */}
      <style>{`
        .category-link {
          transition: transform 0.2s ease-in-out;
        }
        
        .category-link:hover {
          transform: translateX(5px);
          text-decoration: none;
        }
        
        .category-link:hover h5 {
          color: #f59e0b !important; /* brand orange */
        }
        
        html {
          scroll-behavior: smooth;
        }
      `}</style>
    </>
  );
};

export default MenuHome;

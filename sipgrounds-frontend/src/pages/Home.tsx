import React, { useEffect, useState } from 'react';
import { Container, Row, Col, Button } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { cafesAPI, pollsAPI, Product } from '../services/api';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';
import SEOHead from '../components/SEOHead';

const Home: React.FC = () => {
  const [stats, setStats] = useState<{
    totalCafes: number;
    totalReviews: number;
    activePollsCount: number;
  } | null>(null);

  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [cafesResponse, pollsResponse] = await Promise.all([
          cafesAPI.getAll({ limit: 100 }),
          pollsAPI.getAll()
        ]);
        
        setStats({
          totalCafes: cafesResponse.data?.cafes?.length || 120,
          totalReviews: 10000,
          activePollsCount: pollsResponse.data?.polls?.filter((poll: any) => poll.isCurrentlyActive)?.length || 0
        });
      } catch (error) {
        console.error('Failed to fetch stats:', error);
        setStats({
          totalCafes: 120,
          totalReviews: 10000,
          activePollsCount: 3
        });
      }
    };

    fetchStats();
  }, []);

  return (
    <>
      <SEOHead 
        title="Sip Grounds - Where Coffee Meets Community"
        description="Join us for a fresh cup, friendly faces, and the perfect place to gather, connect, and unwind."
        keywords="coffee shops, café community, coffee rewards, local cafés"
      />
      
      <div className="hero-section" style={{ marginLeft: 'calc(-50vw + 50%)', marginRight: 'calc(-50vw + 50%)', width: '100vw' }}>
        <Container>
          <div className="hero-content">
            {/* Main Headline */}
            <div className="hero-headline">
              <div className="headline-line">Where Coffee</div>
              <div className="headline-line">Meets Community</div>
              </div>
            
            {/* Content Layout */}
            <Row className="align-items-center justify-content-center">
              {/* Illustration */}
              <Col lg={8} className="hero-right">
                <div className="illustration-container">
                  <img 
                    src="/sipBG.png" 
                    alt="Two friends enjoying coffee together" 
                    className="hero-illustration"
                  />
                </div>
              </Col>
            </Row>
                    </div>
        </Container>
      </div>

      {/* Coffee Products Section */}
      <section className="coffee-products-section">
        <Container>
          <div className="section-header">
            <h2>Explore our recent products</h2>
            <p>Our delectable drink options include classic espresso choices, house specialties, fruit smoothies, and frozen treats.</p>
          </div>
          
          <Row className="g-4">
            <Col md={6} lg={3}>
              <div className="coffee-card">
                <div className="coffee-image">
                  <img src="https://res.cloudinary.com/djsoqjxpg/image/upload/v1755035275/Sumatra_jy93xk.jpg" alt="Sumatra Blend Coffee" />
                </div>
                <div className="coffee-info">
                  <span className="coffee-category">COFFEE</span>
                  <h4>Sumatra Blend</h4>
                  <p className="coffee-price">Price: $12</p>
                  <div className="coffee-actions">
                    <button
                      className="add-to-cart-btn"
                      onClick={() => addToCart({ _id: 'sumatra-blend', name: 'Sumatra Blend', description: 'Whole bean coffee', price: 12, image: 'https://res.cloudinary.com/djsoqjxpg/image/upload/v1755035275/Sumatra_jy93xk.jpg', category: 'food', subcategory: 'coffee', availableAt: [], pointsEarned: 12, inStock: true, stockQuantity: 100 })}
                    >
                      Add to cart →
                    </button>
                    <button
                      className="wishlist-btn"
                      onClick={() => {
                        if (!isAuthenticated) { toast.info('Sign in to save favorites'); navigate('/login'); return; }
                        const favs = JSON.parse(localStorage.getItem('favorites') || '[]');
                        if (!favs.includes('sumatra-blend')) favs.push('sumatra-blend');
                        localStorage.setItem('favorites', JSON.stringify(favs));
                        toast.success('Saved to favorites');
                      }}
                    >
                      ♡
                    </button>
                  </div>
                </div>
              </div>
            </Col>
            
            <Col md={6} lg={3}>
              <div className="coffee-card">
                <div className="coffee-image">
                  <img src="https://res.cloudinary.com/djsoqjxpg/image/upload/v1755035275/NewYork_cedbdt.jpg" alt="New York Blend Coffee" />
                </div>
                <div className="coffee-info">
                  <span className="coffee-category">COFFEE</span>
                  <h4>New York Blend</h4>
                  <p className="coffee-price">Price: $14</p>
                  <div className="coffee-actions">
                    <button className="add-to-cart-btn" onClick={() => addToCart({ _id: 'new-york-blend', name: 'New York Blend', description: 'Whole bean coffee', price: 14, image: 'https://res.cloudinary.com/djsoqjxpg/image/upload/v1755035275/NewYork_cedbdt.jpg', category: 'food', subcategory: 'coffee', availableAt: [], pointsEarned: 14, inStock: true, stockQuantity: 100 })}>Add to cart →</button>
                    <button className="wishlist-btn" onClick={() => { if (!isAuthenticated) { toast.info('Sign in to save favorites'); navigate('/login'); return; } const favs = JSON.parse(localStorage.getItem('favorites') || '[]'); if (!favs.includes('new-york-blend')) favs.push('new-york-blend'); localStorage.setItem('favorites', JSON.stringify(favs)); toast.success('Saved to favorites'); }}>♡</button>
                  </div>
                </div>
              </div>
            </Col>
            
            <Col md={6} lg={3}>
              <div className="coffee-card">
                <div className="coffee-image">
                  <img src="https://res.cloudinary.com/djsoqjxpg/image/upload/v1755035275/Colombian_h3koyo.jpg" alt="Colombian Blend Coffee" />
                </div>
                <div className="coffee-info">
                  <span className="coffee-category">COFFEE</span>
                  <h4>Colombian Blend</h4>
                  <p className="coffee-price">Price: $13</p>
                  <div className="coffee-actions">
                    <button className="add-to-cart-btn" onClick={() => addToCart({ _id: 'colombian-blend', name: 'Colombian Blend', description: 'Whole bean coffee', price: 13, image: 'https://res.cloudinary.com/djsoqjxpg/image/upload/v1755035275/Colombian_h3koyo.jpg', category: 'food', subcategory: 'coffee', availableAt: [], pointsEarned: 13, inStock: true, stockQuantity: 100 })}>Add to cart →</button>
                    <button className="wishlist-btn" onClick={() => { if (!isAuthenticated) { toast.info('Sign in to save favorites'); navigate('/login'); return; } const favs = JSON.parse(localStorage.getItem('favorites') || '[]'); if (!favs.includes('colombian-blend')) favs.push('colombian-blend'); localStorage.setItem('favorites', JSON.stringify(favs)); toast.success('Saved to favorites'); }}>♡</button>
                  </div>
                </div>
              </div>
            </Col>
            
            <Col md={6} lg={3}>
              <div className="coffee-card">
                <div className="coffee-image">
                  <img src="https://res.cloudinary.com/djsoqjxpg/image/upload/v1755035275/Chicago_rkfdfj.jpg" alt="Chicago Blend Coffee" />
                </div>
                <div className="coffee-info">
                  <span className="coffee-category">COFFEE</span>
                  <h4>Chicago Blend</h4>
                  <p className="coffee-price">Price: $15</p>
                  <div className="coffee-actions">
                    <button className="add-to-cart-btn" onClick={() => addToCart({ _id: 'chicago-blend', name: 'Chicago Blend', description: 'Whole bean coffee', price: 15, image: 'https://res.cloudinary.com/djsoqjxpg/image/upload/v1755035275/Chicago_rkfdfj.jpg', category: 'food', subcategory: 'coffee', availableAt: [], pointsEarned: 15, inStock: true, stockQuantity: 100 })}>Add to cart →</button>
                    <button className="wishlist-btn" onClick={() => { if (!isAuthenticated) { toast.info('Sign in to save favorites'); navigate('/login'); return; } const favs = JSON.parse(localStorage.getItem('favorites') || '[]'); if (!favs.includes('chicago-blend')) favs.push('chicago-blend'); localStorage.setItem('favorites', JSON.stringify(favs)); toast.success('Saved to favorites'); }}>♡</button>
                  </div>
                </div>
              </div>
            </Col>
            
            <Col md={6} lg={3}>
              <div className="coffee-card">
                <div className="coffee-image">
                  <img src="https://res.cloudinary.com/djsoqjxpg/image/upload/v1755035275/Ethiopian_kvcf8y.jpg" alt="Ethiopian Blend Coffee" />
                </div>
                <div className="coffee-info">
                  <span className="coffee-category">COFFEE</span>
                  <h4>Ethiopian Blend</h4>
                  <p className="coffee-price">Price: $16</p>
                  <div className="coffee-actions">
                    <button className="add-to-cart-btn" onClick={() => addToCart({ _id: 'ethiopian-blend', name: 'Ethiopian Blend', description: 'Whole bean coffee', price: 16, image: 'https://res.cloudinary.com/djsoqjxpg/image/upload/v1755035275/Ethiopian_kvcf8y.jpg', category: 'food', subcategory: 'coffee', availableAt: [], pointsEarned: 16, inStock: true, stockQuantity: 100 })}>Add to cart →</button>
                    <button className="wishlist-btn" onClick={() => { if (!isAuthenticated) { toast.info('Sign in to save favorites'); navigate('/login'); return; } const favs = JSON.parse(localStorage.getItem('favorites') || '[]'); if (!favs.includes('ethiopian-blend')) favs.push('ethiopian-blend'); localStorage.setItem('favorites', JSON.stringify(favs)); toast.success('Saved to favorites'); }}>♡</button>
                  </div>
                </div>
              </div>
            </Col>
            
            <Col md={6} lg={3}>
              <div className="coffee-card">
                <div className="coffee-image">
                  <img src="https://res.cloudinary.com/djsoqjxpg/image/upload/v1755036449/Seattle_xqmge0.jpg" alt="Seattle Blend Coffee" />
                </div>
                <div className="coffee-info">
                  <span className="coffee-category">COFFEE</span>
                  <h4>Seattle Blend</h4>
                  <p className="coffee-price">Price: $17</p>
                  <div className="coffee-actions">
                    <button className="add-to-cart-btn" onClick={() => addToCart({ _id: 'seattle-blend', name: 'Seattle Blend', description: 'Whole bean coffee', price: 17, image: 'https://res.cloudinary.com/djsoqjxpg/image/upload/v1755036449/Seattle_xqmge0.jpg', category: 'food', subcategory: 'coffee', availableAt: [], pointsEarned: 17, inStock: true, stockQuantity: 100 })}>Add to cart →</button>
                    <button className="wishlist-btn" onClick={() => { if (!isAuthenticated) { toast.info('Sign in to save favorites'); navigate('/login'); return; } const favs = JSON.parse(localStorage.getItem('favorites') || '[]'); if (!favs.includes('seattle-blend')) favs.push('seattle-blend'); localStorage.setItem('favorites', JSON.stringify(favs)); toast.success('Saved to favorites'); }}>♡</button>
                  </div>
                </div>
              </div>
            </Col>
            
            <Col md={6} lg={3}>
              <div className="coffee-card">
                <div className="coffee-image">
                  <img src="https://res.cloudinary.com/djsoqjxpg/image/upload/v1755036449/Miami_zq7nhq.jpg" alt="Miami Blend Coffee" />
                </div>
                <div className="coffee-info">
                  <span className="coffee-category">COFFEE</span>
                  <h4>Miami Blend</h4>
                  <p className="coffee-price">Price: $15</p>
                  <div className="coffee-actions">
                    <button className="add-to-cart-btn" onClick={() => addToCart({ _id: 'miami-blend', name: 'Miami Blend', description: 'Whole bean coffee', price: 15, image: 'https://res.cloudinary.com/djsoqjxpg/image/upload/v1755036449/Miami_zq7nhq.jpg', category: 'food', subcategory: 'coffee', availableAt: [], pointsEarned: 15, inStock: true, stockQuantity: 100 })}>Add to cart →</button>
                    <button className="wishlist-btn" onClick={() => { if (!isAuthenticated) { toast.info('Sign in to save favorites'); navigate('/login'); return; } const favs = JSON.parse(localStorage.getItem('favorites') || '[]'); if (!favs.includes('miami-blend')) favs.push('miami-blend'); localStorage.setItem('favorites', JSON.stringify(favs)); toast.success('Saved to favorites'); }}>♡</button>
                  </div>
                </div>
              </div>
            </Col>
            
            <Col md={6} lg={3}>
              <div className="coffee-card">
                <div className="coffee-image">
                  <img src="https://res.cloudinary.com/djsoqjxpg/image/upload/v1755036449/SanFran_ozcoho.jpg" alt="San Francisco Blend Coffee" />
                </div>
                <div className="coffee-info">
                  <span className="coffee-category">COFFEE</span>
                  <h4>San Francisco Blend</h4>
                  <p className="coffee-price">Price: $18</p>
                  <div className="coffee-actions">
                    <button className="add-to-cart-btn" onClick={() => addToCart({ _id: 'san-francisco-blend', name: 'San Francisco Blend', description: 'Whole bean coffee', price: 18, image: 'https://res.cloudinary.com/djsoqjxpg/image/upload/v1755036449/SanFran_ozcoho.jpg', category: 'food', subcategory: 'coffee', availableAt: [], pointsEarned: 18, inStock: true, stockQuantity: 100 })}>Add to cart →</button>
                    <button className="wishlist-btn" onClick={() => { if (!isAuthenticated) { toast.info('Sign in to save favorites'); navigate('/login'); return; } const favs = JSON.parse(localStorage.getItem('favorites') || '[]'); if (!favs.includes('san-francisco-blend')) favs.push('san-francisco-blend'); localStorage.setItem('favorites', JSON.stringify(favs)); toast.success('Saved to favorites'); }}>♡</button>
                  </div>
                </div>
              </div>
            </Col>
          </Row>
        </Container>
      </section>

      {/* Coffee Made Easy Section */}
      <section className="coffee-easy-section">
        <Container>
          <div className="section-header">
            <h2>Coffee made easy</h2>
          </div>
          
          <Row className="align-items-center">
            {/* Left Features */}
            <Col lg={3} className="features-col">
              <div className="feature-item">
                <div className="feature-icon">
                  <img 
                    src="https://res.cloudinary.com/djsoqjxpg/image/upload/v1755097063/shop_oqyemg.png" 
                    alt="Coffee Shop" 
                    className="feature-image"
                  />
                </div>
                <div className="feature-content">
                  <h4>Convenient</h4>
                  <p>Shop online or in-store for your favorite coffee blends.</p>
                </div>
              </div>
              
              <div className="feature-item">
                <div className="feature-icon">
                  <img 
                    src="https://res.cloudinary.com/djsoqjxpg/image/upload/v1755097062/grinder_na3zeh.png" 
                    alt="Coffee Grinder" 
                    className="feature-image"
                  />
                </div>
                <div className="feature-content">
                  <h4>Your Choice</h4>
                  <p>Choose your preferred grind size for your coffee.</p>
                </div>
              </div>
            </Col>
            
            {/* Center Coffee Cup */}
            <Col lg={6} className="coffee-cup-col">
              <div className="coffee-cup-container">
                <img 
                  src="https://res.cloudinary.com/djsoqjxpg/image/upload/v1755049676/ChatGPT_Image_Aug_12_2025_08_47_27_PM_ib70xp.png" 
                  alt="Coffee Cup" 
                  className="coffee-cup-image"
                />
              </div>
            </Col>
            
            {/* Right Features */}
            <Col lg={3} className="features-col">
              <div className="feature-item">
                <div className="feature-icon">
                  <img 
                    src="https://res.cloudinary.com/djsoqjxpg/image/upload/v1755097061/cup1_x1eucx.png" 
                    alt="Coffee Cup 1" 
                    className="feature-image"
                  />
                </div>
                <div className="feature-content">
                  <h4>Tasty</h4>
                  <p>Our coffee is made with the best beans and roasted to perfection.</p>
                </div>
              </div>
              
              <div className="feature-item">
                <div className="feature-icon">
                  <img 
                    src="https://res.cloudinary.com/djsoqjxpg/image/upload/v1755097061/cup2_in4nty.png" 
                    alt="Coffee Cup 2" 
                    className="feature-image"
                  />
                </div>
                <div className="feature-content">
                  <h4>Decaf</h4>
                  <p>Choose your preferred decaf option for your coffee.</p>
                </div>
              </div>
            </Col>
          </Row>
        </Container>
      </section>
    </>
  );
};

export default Home;
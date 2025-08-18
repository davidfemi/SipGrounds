import React, { useEffect, useMemo, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Container, Row, Col, Breadcrumb, Spinner, Alert, Button, Badge, Card } from 'react-bootstrap';
import SEOHead from '../components/SEOHead';
import { menuAPI, MenuItem } from '../services/api';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';

const formatPrice = (value?: number) => (typeof value === 'number' ? `$${value.toFixed(2)}` : '$0.00');

const MenuItemDetail: React.FC = () => {
  const { itemId } = useParams<{ itemId: string }>();
  const { isAuthenticated } = useAuth();
  const { addToCart } = useCart();

  const [item, setItem] = useState<MenuItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [selectedSize, setSelectedSize] = useState<string>('');
  const [selectedMilk, setSelectedMilk] = useState<string>('');
  const [selectedExtras, setSelectedExtras] = useState<string[]>([]);
  const [specialInstructions, setSpecialInstructions] = useState('');
  const [quantity, setQuantity] = useState(1);

  // Brand colors
  const brandOrange = '#f59e0b';
  const brandOrangeDark = '#d97706';

  const toggleStyle = (active: boolean) => ({
    backgroundColor: active ? brandOrange : 'transparent',
    borderColor: brandOrange,
    color: active ? '#ffffff' : brandOrange
  } as React.CSSProperties);

  useEffect(() => {
    const run = async () => {
      try {
        setLoading(true);
        const res = await menuAPI.getMenuItem(itemId as string);
        const fetched = res.data?.item as MenuItem;
        setItem(fetched);

        // default size/milk
        const defaultSize = fetched?.customization?.sizes?.[0]?.name || '';
        const defaultMilk = (fetched as any)?.milkOptions?.[0]?.name || '';
        setSelectedSize(defaultSize);
        setSelectedMilk(defaultMilk);
      } catch (e) {
        console.error(e);
        setError('Failed to load item.');
      } finally {
        setLoading(false);
      }
    };
    if (itemId) run();
  }, [itemId]);

  const price = useMemo(() => {
    if (!item) return 0;
    let base = item.price;
    const sizeUp = item.customization?.sizes?.find(s => s.name === selectedSize)?.price;
    if (typeof sizeUp === 'number') base = sizeUp;
    // Extras total
    const extrasTotal = item.customization?.extras?.filter(e => selectedExtras.includes(e.name))
      .reduce((sum, e) => sum + (e.price || 0), 0) || 0;
    return base + extrasTotal;
  }, [item, selectedSize, selectedExtras]);

  const handleToggleExtra = (name: string) => {
    setSelectedExtras(prev => prev.includes(name) ? prev.filter(n => n !== name) : [...prev, name]);
  };

  const handleAddToCart = () => {
    if (!item) return;
    const customizations: any = {
      size: selectedSize || undefined,
      milk: selectedMilk || undefined,
      extras: selectedExtras.length ? selectedExtras : undefined,
      specialInstructions: specialInstructions.trim() || undefined,
    };
    addToCart(item as any, quantity, customizations);
  };

  if (loading) {
    return (
      <Container className="py-5 text-center">
        <Spinner animation="border" />
      </Container>
    );
  }

  if (error || !item) {
    return (
      <Container className="py-5">
        <Alert variant="danger">{error || 'Item not found.'} <Link to="/menu">Back to Menu</Link></Alert>
      </Container>
    );
  }

  return (
    <>
      <SEOHead title={`${item.name} - Menu - SipGrounds`} description={item.description} />

      {/* Page Header */}
      <div className="py-5" style={{ backgroundColor: '#ffffff' }}>
        <Container>
          <Row className="align-items-center g-4">
            <Col md={3} className="text-center">
              <img src={item.image} alt={item.name} style={{ width: 260, height: 260, objectFit: 'cover', borderRadius: '12px', boxShadow: '0 10px 30px rgba(0,0,0,.25)' }} />
            </Col>
            <Col md={9} className="text-dark">
              <h1 className="mb-2" style={{ fontWeight: 700 }}>{item.name}</h1>
              <div className="opacity-75">
                {item.nutritionalInfo?.calories ? `${item.nutritionalInfo.calories} calories` : ''}
              </div>
            </Col>
          </Row>
        </Container>
      </div>

      {/* Content */}
      <Container className="py-5">
        <Row className="g-5">
          <Col lg={7}>
            <div className="mb-4 text-muted">{item.description}</div>

            {/* Sizes */}
            {item.customization?.sizes?.length ? (
              <div className="mb-3">
                <div className="fw-bold mb-2">Size options</div>
                <div className="d-flex flex-wrap gap-2">
                  {item.customization.sizes.map(s => (
                    <Button
                      key={s.name}
                      size="sm"
                      style={toggleStyle(selectedSize === s.name)}
                      onClick={() => setSelectedSize(s.name)}
                    >
                      {s.name} <Badge bg="transparent" className="text-muted ms-1">{formatPrice(s.price)}</Badge>
                    </Button>
                  ))}
                </div>
              </div>
            ) : null}

            {/* Milk options (drinks only) */}
            {(item as any)?.milkOptions?.length ? (
              <div className="mb-3">
                <div className="fw-bold mb-2">Milk</div>
                <div className="d-flex flex-wrap gap-2">
                  {(item as any).milkOptions.map((m: any) => (
                    <Button
                      key={m.name}
                      size="sm"
                      style={toggleStyle(selectedMilk === m.name)}
                      onClick={() => setSelectedMilk(m.name)}
                    >
                      {m.name}
                      {m.extraCharge ? <Badge bg="transparent" className="text-muted ms-1">+{formatPrice(m.extraCharge)}</Badge> : null}
                    </Button>
                  ))}
                </div>
              </div>
            ) : null}

            {/* Extras */}
            {item.customization?.extras?.length ? (
              <div className="mb-3">
                <div className="fw-bold mb-2">Add‑ins</div>
                <div className="d-flex flex-wrap gap-2">
                  {item.customization.extras.map(ex => (
                    <Button
                      key={ex.name}
                      size="sm"
                      style={toggleStyle(selectedExtras.includes(ex.name))}
                      onClick={() => handleToggleExtra(ex.name)}
                    >
                      {ex.name}
                      {ex.price ? <Badge bg="transparent" className="text-muted ms-1">+{formatPrice(ex.price)}</Badge> : null}
                    </Button>
                  ))}
                </div>
              </div>
            ) : null}

            {/* Notes */}
            <div className="mb-4">
              <div className="fw-bold mb-2">Special instructions</div>
              <textarea className="form-control" rows={2} value={specialInstructions} onChange={e => setSpecialInstructions(e.target.value)} placeholder="Add any notes (e.g., light ice)" />
            </div>

          </Col>
          <Col lg={5}>
            <div className="p-4 rounded-3 shadow-sm border" style={{ position: 'sticky', top: 100, background: '#fff' }}>
              <div className="d-flex align-items-center justify-content-between mb-3">
                <div className="h5 mb-0">Your drink</div>
                <div className="fw-bold">{formatPrice(price)}</div>
              </div>

              {/* Quantity */}
              <div className="d-flex align-items-center justify-content-between mb-3">
                <div className="fw-semibold">Quantity</div>
                <div className="d-flex align-items-center">
                  <Button size="sm" onClick={() => setQuantity(q => Math.max(1, q - 1))} style={{ borderColor: brandOrange, color: brandOrange, background: 'transparent' }}>-</Button>
                  <span className="mx-3 fw-bold">{quantity}</span>
                  <Button size="sm" onClick={() => setQuantity(q => q + 1)} style={{ borderColor: brandOrange, color: brandOrange, background: 'transparent' }}>+</Button>
                </div>
              </div>

              <Button
                className="w-100"
                onClick={handleAddToCart}
                disabled={!isAuthenticated}
                style={{ backgroundColor: brandOrange, borderColor: brandOrange }}
              >
                {!isAuthenticated ? 'Login to order' : `Add to Order • ${formatPrice(price * quantity)}`}
              </Button>
              <div className="small text-muted mt-2">Taxes may apply at checkout.</div>
            </div>
          </Col>
        </Row>
      </Container>
    </>
  );
};

export default MenuItemDetail;



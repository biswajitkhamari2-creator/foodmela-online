import { useEffect, useState, type FormEvent } from 'react';
import { Link, NavLink, useLocation as useRouteLocation, useNavigate } from 'react-router-dom';
import { useShop } from '../store';
import { useDeliveryLocation } from './location-context';

export default function Header({ onCartOpen }: { onCartOpen: () => void }) {
  const { cartCount, user, setUser } = useShop();
  const { city, area, setLocOpen } = useDeliveryLocation();
  const nav = useNavigate();
  const loc = useRouteLocation();
  // No cart on the login page — it appears after login (existing behaviour)
  const hideCart = loc.pathname === '/login';
  const [bump, setBump] = useState(false);
  const [q, setQ] = useState('');
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    if (cartCount === 0) return;
    setBump(true);
    const t = setTimeout(() => setBump(false), 400);
    return () => clearTimeout(t);
  }, [cartCount]);

  const submitSearch = (e: FormEvent) => {
    e.preventDefault();
    if (!user) {
      nav('/login');
      return;
    }
    const query = q.trim();
    nav(query ? `/grocery?q=${encodeURIComponent(query)}` : '/grocery');
    setQ('');
  };

  return (
    <header className="fm-header">
      <div className="fm-header-inner">
        <Link to="/" className="fm-brand" aria-label="FoodMela home">
          <span className="fm-mark" aria-hidden="true">F</span>
          <span>
            FoodMela
            <small>
              LOCAL · <b>FRESH</b> · FAST
            </small>
          </span>
        </Link>

        <button className="fm-loc" onClick={() => setLocOpen(true)} aria-label={`Delivery location: ${area}, ${city}. Change location`}>
          <span className="pin" aria-hidden="true">📍</span>
          <span className="fm-loc-text">
            <small>Delivering to</small>
            <span className="fm-loc-addr">{area}, {city}</span>
          </span>
          <span aria-hidden="true">▾</span>
        </button>

        {Boolean(user) && (
          <nav className="fm-nav" aria-label="Primary">
            <NavLink to="/" end className={({ isActive }) => (isActive ? 'active' : '')}>Home</NavLink>
            <NavLink to="/grocery" className={({ isActive }) => (isActive ? 'active' : '')}>Grocery</NavLink>
            <NavLink to="/offers" className={({ isActive }) => `fm-nav-offers ${isActive ? 'active' : ''}`}>
              <span className="offer-fire" aria-hidden="true">🔥</span>
              <span>Offers</span>
              <span className="nav-discount-badge">50% OFF</span>
            </NavLink>
            <NavLink to="/orders" className={({ isActive }) => (isActive ? 'active' : '')}>Orders</NavLink>
          </nav>
        )}

        <div className="fm-head-right">
          {Boolean(user) && (
            <form className="fm-search" onSubmit={submitSearch} role="search">
              <span aria-hidden="true">🔍</span>
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search groceries..."
                aria-label="Search groceries"
              />
            </form>
          )}
          {user ? (
            <button
              className="fm-login me"
              title={user.phone}
              onClick={() => {
                if (confirm('Log out?')) {
                  setUser(null);
                  nav('/');
                }
              }}
            >
              👋 {user.name.split(' ')[0] || 'Hi'}
            </button>
          ) : (
            <button className="fm-login" onClick={() => nav('/login')}>Login</button>
          )}
          {!hideCart && (
            <button className={`fm-cart ${bump ? 'bump' : ''}`} onClick={onCartOpen} aria-label={`Open cart, ${cartCount} items`}>
              🛒 Cart <span className="n">{cartCount}</span>
            </button>
          )}
          <button
            className="fm-menu-btn"
            onClick={() => setMenuOpen(true)}
            aria-label="Open menu"
            title="Menu & Business Info"
          >
            <span className="fm-menu-icon" aria-hidden="true">☰</span>
            <span className="fm-menu-text">Menu</span>
          </button>
        </div>
      </div>

      {menuOpen && (
        <>
          <div className="drawer-overlay" onClick={() => setMenuOpen(false)} />
          <div className="fm-side-menu-drawer" role="dialog" aria-modal="true" aria-label="Main menu">
            <div className="fm-side-menu-head">
              <div className="fm-side-brand">
                <span className="fm-mark" aria-hidden="true">F</span>
                <div>
                  <div className="fm-side-title">FoodMela</div>
                  <div className="fm-side-subtitle">by <strong>Sidheswar Enterprises</strong></div>
                  <div className="fm-side-owner">Owner: <strong>Biswajit Khamari</strong></div>
                </div>
              </div>
              <button className="drawer-close" onClick={() => setMenuOpen(false)} aria-label="Close menu">✕</button>
            </div>

            <div className="fm-side-menu-body">
              <div className="fm-side-menu-section">
                <div className="fm-side-sec-title">Quick Menu</div>
                <button className="fm-side-item" onClick={() => { setMenuOpen(false); nav('/'); }}>
                  <span className="ico">🏠</span> Home
                </button>
                <button className="fm-side-item" onClick={() => { setMenuOpen(false); nav(user ? '/grocery' : '/login'); }}>
                  <span className="ico">🛒</span> Shop Grocery
                </button>
                <button className="fm-side-item" onClick={() => { setMenuOpen(false); nav(user ? '/offers' : '/login'); }}>
                  <span className="ico">🔥</span> Offers &amp; Discounts
                </button>
                <button className="fm-side-item" onClick={() => { setMenuOpen(false); nav(user ? '/orders' : '/login'); }}>
                  <span className="ico">🧾</span> My Orders &amp; Receipts
                </button>
                <button className="fm-side-item" onClick={() => { setMenuOpen(false); nav(user ? '/profile' : '/login'); }}>
                  <span className="ico">👤</span> {user ? 'My Account / Profile' : 'Login / Register'}
                </button>
              </div>

              <div className="fm-side-menu-section enterprise-section">
                <div className="fm-side-sec-title">Business &amp; Ownership</div>
                <div className="fm-enterprise-card">
                  <div className="enterprise-badge">🏢 Business Entity</div>
                  <div className="enterprise-row">
                    <span className="lbl">Brand:</span>
                    <span className="val">FoodMela (foodmela.online)</span>
                  </div>
                  <div className="enterprise-row">
                    <span className="lbl">Operated by:</span>
                    <span className="val bold">Sidheswar Enterprises</span>
                  </div>
                  <div className="enterprise-row">
                    <span className="lbl">Owner:</span>
                    <span className="val highlight">Biswajit Khamari</span>
                  </div>
                  <div className="enterprise-row">
                    <span className="lbl">Location:</span>
                    <span className="val">Birmaharajpur, Subarnapur, Odisha - 767018</span>
                  </div>
                  <div className="enterprise-row">
                    <span className="lbl">Helpline:</span>
                    <a href="tel:8144503650" className="val link">📞 8144503650</a>
                  </div>
                </div>
              </div>

              <div className="fm-side-menu-section">
                <div className="fm-side-sec-title">Support &amp; Legal</div>
                <Link to="/page/help" className="fm-side-link" onClick={() => setMenuOpen(false)}>💬 Help &amp; Customer Support</Link>
                <Link to="/page/contact" className="fm-side-link" onClick={() => setMenuOpen(false)}>📞 Contact &amp; Grievance Redressal</Link>
                <Link to="/page/terms" className="fm-side-link" onClick={() => setMenuOpen(false)}>📜 Terms of Service</Link>
                <Link to="/page/privacy" className="fm-side-link" onClick={() => setMenuOpen(false)}>🔒 Privacy Policy</Link>
                <Link to="/page/refund" className="fm-side-link" onClick={() => setMenuOpen(false)}>💸 Refund Policy</Link>
              </div>
            </div>

            <div className="fm-side-menu-foot">
              <div>FoodMela by <strong>Sidheswar Enterprises</strong></div>
              <small>Owner: Biswajit Khamari · Birmaharajpur, Odisha</small>
            </div>
          </div>
        </>
      )}
    </header>
  );
}

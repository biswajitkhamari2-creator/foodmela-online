import { Link, useLocation as useRouteLocation, useNavigate } from 'react-router-dom';
import { useShop } from '../store';

/**
 * Mobile bottom tabs — Home / Explore / Cart(FAB) / Orders / Profile.
 * Cart tab + FAB appear ONLY when logged in (existing visibility rule).
 */
export function BottomNav({ onCartOpen }: { onCartOpen: () => void }) {
  const { cartCount, user } = useShop();
  const loc = useRouteLocation();
  const isActive = (p: string) => (loc.pathname === p ? 'active' : '');

  return (
    <nav className="fm-tabs" aria-label="Mobile navigation">
      <div className="fm-tabs-inner">
        <Link to="/" className={`tab ${isActive('/')}`}>
          <span className="t-ico" aria-hidden="true">🏠</span>Home
        </Link>
        <Link to="/grocery" className={`tab ${isActive('/grocery') ? 'active' : ''}`}>
          <span className="t-ico" aria-hidden="true">🧭</span>Explore
        </Link>
        <Link to="/offers" className={`tab tab-offers ${isActive('/offers')}`}>
          <span className="t-ico" aria-hidden="true">🔥</span>Offers
          <span className="bottom-discount-dot">% OFF</span>
        </Link>
        {Boolean(user) && (
          <a
            href="#cart"
            className="tab tab-fab"
            onClick={(e) => {
              e.preventDefault();
              onCartOpen();
            }}
            aria-label={`Open cart, ${cartCount} items`}
          >
            <span className="t-ico" aria-hidden="true">🛒</span>
            {cartCount > 0 && <span className="t-badge">{cartCount}</span>}
          </a>
        )}
        <Link to="/orders" className={`tab ${isActive('/orders')}`}>
          <span className="t-ico" aria-hidden="true">🧾</span>Orders
        </Link>
        <Link to={user ? '/profile' : '/login'} className={`tab ${isActive('/profile') || isActive('/login') ? 'active' : ''}`}>
          <span className="t-ico" aria-hidden="true">{user ? '👤' : '🔑'}</span>{user ? 'Profile' : 'Login'}
        </Link>
      </div>
    </nav>
  );
}

export default function Footer() {
  const { user } = useShop();
  const nav = useNavigate();

  return (
    <footer className="fm-footer">
      <div className="footer-cta">
        <h3>
          Craving something? The mela is <span className="accent">always on.</span>
        </h3>
        <button className="btn-primary" onClick={() => nav(user ? '/grocery' : '/login')}>
          Order Now →
        </button>
      </div>

      <div className="footer-grid">
        <div className="footer-brand">
          <Link to="/" className="fm-brand" style={{ color: '#fff' }} aria-label="FoodMela home">
            <span className="fm-mark" aria-hidden="true">F</span>
            <span>
              FoodMela
              <small style={{ color: '#8a948d' }}>LOCAL · FRESH · FAST</small>
            </span>
          </Link>
          <p>
            Your neighbourhood mela — fresh groceries &amp; daily essentials,
            delivered fast across Birmaharajpur.
          </p>
          <p style={{ marginTop: 8, fontSize: 13, color: '#c6cfc8' }}>
            Helpline: <a href="tel:8144503650" style={{ color: '#ffc531', fontWeight: 700 }}>8144503650</a>
          </p>
          <div className="social-row">
            <button className="social-btn" aria-label="FoodMela on Instagram" title="Instagram" onClick={() => nav('/page/contact')}>📸</button>
            <button className="social-btn" aria-label="FoodMela on Facebook" title="Facebook" onClick={() => nav('/page/contact')}>👍</button>
            <button className="social-btn" aria-label="FoodMela on X" title="X" onClick={() => nav('/page/contact')}>𝕏</button>
            <button className="social-btn" aria-label="FoodMela on YouTube" title="YouTube" onClick={() => nav('/page/contact')}>▶️</button>
          </div>
        </div>

        <div className="footer-col">
          <h4>Company</h4>
          <Link to="/page/about">About FoodMela</Link>
          <Link to="/page/contact">Contact Us &amp; Grievance</Link>
          <a href="tel:8144503650">📞 8144503650</a>
          <Link to="/page/help">Help &amp; Support</Link>
          <Link to="/page/terms">Terms of Service</Link>
          <Link to="/page/disclaimer">Safety &amp; Disclaimer</Link>
          <Link to="/page/privacy">Privacy Policy</Link>
          <Link to="/page/refund">Refund Policy</Link>
        </div>

        <div className="footer-col">
          <h4>Partner With Us</h4>
          <Link to="/page/partner">Partner With Us</Link>
          <Link to="/page/partner-restaurant">Restaurant Partner</Link>
          <Link to="/page/partner-rider">Delivery Partner</Link>
          <Link to="/page/app">Get the App</Link>
        </div>

        <div className="footer-col">
          <h4>Explore</h4>
          <Link to="/grocery">Shop Grocery</Link>
          <Link to="/offers">Offers</Link>
        </div>

        <div className="footer-col">
          <h4>Account</h4>
          <Link to={user ? '/profile' : '/login'}>{user ? 'My Profile' : 'Login'}</Link>
          <Link to="/orders">My Orders</Link>
          <Link to="/orders">Track Order</Link>
          <Link to="/#app">App Download</Link>
        </div>
      </div>

      <div className="footer-bottom">
        <div className="tagline">“Freshness Brings People Together”</div>
        <div style={{ marginTop: 8, fontSize: 12, lineHeight: 1.6, opacity: 0.88 }}>
          © 2026 FoodMela (foodmela.online) · Digital Hyperlocal Delivery Intermediary · Birmaharajpur, Subarnapur, Odisha - 767018
        </div>
        <div style={{ fontSize: 11.5, opacity: 0.75, marginTop: 4 }}>
          Helpline &amp; Grievance Redressal: +91 8144503650 | Email: support@foodmela.online | Goods packed &amp; delivered by licensed merchant partners
        </div>
      </div>
    </footer>
  );
}

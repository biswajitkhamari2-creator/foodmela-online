import { Link, useLocation as useRouteLocation, useNavigate } from 'react-router-dom';
import { useShop } from '../store';

/** Mobile bottom tab bar (CSS shows it only on small screens). */
export function BottomNav({ onCartOpen }: { onCartOpen: () => void }) {
  const { cartCount, user } = useShop();
  const loc = useRouteLocation();
  const isActive = (p: string) => (loc.pathname === p ? 'active' : '');

  return (
    <nav className="tabbar" aria-label="Mobile navigation">
      <div className="tabbar-inner">
        <Link to="/" className={isActive('/')}>
          <span className="t-ico" aria-hidden="true">🏠</span>Home
        </Link>
        <Link to="/food" className={isActive('/food')}>
          <span className="t-ico" aria-hidden="true">🍛</span>Food
        </Link>
        {Boolean(user) && (
          <a
            href="#cart"
            className=""
            onClick={(e) => {
              e.preventDefault();
              onCartOpen();
            }}
            aria-label={`Open cart, ${cartCount} items`}
          >
            <span className="t-ico" aria-hidden="true">🛒</span>Cart
            {cartCount > 0 && <span className="t-badge">{cartCount}</span>}
          </a>
        )}
        <Link to="/grocery" className={isActive('/grocery')}>
          <span className="t-ico" aria-hidden="true">🥬</span>Grocery
        </Link>
        <Link to="/orders" className={isActive('/orders')}>
          <span className="t-ico" aria-hidden="true">🧾</span>Orders
        </Link>
      </div>
    </nav>
  );
}

export default function Footer() {
  const { user } = useShop();
  const nav = useNavigate();

  return (
    <footer className="footer">
      <div className="footer-cta">
        <h3>
          Hungry? Good food is <span className="accent">minutes away.</span>
        </h3>
        <button className="btn-primary" onClick={() => nav(user ? '/food' : '/login')}>
          Order Now →
        </button>
      </div>

      <div className="footer-grid">
        <div className="footer-brand">
          <Link to="/" className="brand" style={{ color: '#fff' }} aria-label="FoodMela home">
            <span className="brand-mark" aria-hidden="true">F</span>
            <span>
              FoodMela
              <small style={{ color: '#8a948d' }}>YOUR TRUSTED LOCAL DELIVERY</small>
            </span>
          </Link>
          <p>
            Your trusted local delivery app — fresh restaurant food, sweets, groceries &amp;
            daily essentials, delivered fast across Birmaharajpur.
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
          <Link to="/page/contact">Contact Us</Link>
          <Link to="/page/help">Help &amp; Support</Link>
          <Link to="/page/terms">Terms of Service</Link>
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
          <Link to="/food">Order Food</Link>
          <Link to="/grocery">Fresh Grocery</Link>
          <Link to="/restaurants">Restaurants</Link>
          <Link to="/offers">Offers</Link>
        </div>

        <div className="footer-col">
          <h4>Account</h4>
          <Link to="/login">Login</Link>
          <Link to="/orders">My Orders</Link>
          <Link to="/orders">Track Order</Link>
          <Link to="/#app">App Download</Link>
        </div>
      </div>

      <div className="footer-bottom">
        <div className="tagline">“Good Food Brings People Together”</div>
        <div style={{ marginTop: 8 }}>
          © 2026 FoodMela · foodmela.online · Now serving Birmaharajpur, Odisha
        </div>
      </div>
    </footer>
  );
}

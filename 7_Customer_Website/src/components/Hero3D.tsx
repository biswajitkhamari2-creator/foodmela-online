import { useNavigate } from 'react-router-dom';
import { useShop } from '../store';

/**
 * Modern Hero Showcase — clean 2-column layout with ambient shapes and quick stats.
 */
export default function Hero3D() {
  const { user } = useShop();
  const nav = useNavigate();

  return (
    <div className="modern-hero-card hero3d">
      {/* floating ambient shapes behind everything */}
      <div className="hero3d-ambient" aria-hidden="true">
        <span className="ha ha-1">🥬</span>
        <span className="ha ha-2">🍅</span>
        <span className="ha ha-3">🌶️</span>
        <span className="ha ha-4">🥕</span>
        <span className="ha ha-5">🍋</span>
      </div>

      <div className="m-hero-content">
        <div className="m-hero-badge">
          <span className="m-badge-dot">●</span>
          <span>Fastest Hyperlocal Delivery in Birmaharajpur</span>
        </div>
        <h1>
          Daily Essentials &amp; Fresh Veggies <br />
          <span className="gradient-text">Delivered to Your Door.</span>
        </h1>
        <p className="m-hero-sub">
          Farm-picked fresh vegetables, seasonal fruits &amp; daily staples at honest mandi rates with zero surge pricing.
        </p>

        <div className="m-hero-pills">
          <span className="m-pill">⚡ 15–25 Min Delivery</span>
          <span className="m-pill">🥦 100% Farm Fresh</span>
          <span className="m-pill">🛵 FREE Delivery &gt; ₹299</span>
          <span className="m-pill">💵 COD ≤ ₹100 &amp; UPI</span>
        </div>

        <div className="m-hero-actions">
          <button className="btn-primary btn-3d" onClick={() => nav(user ? '/grocery' : '/login')}>
            {user ? 'Shop Fresh Groceries →' : 'Start Ordering Now →'}
          </button>
          {user && (
            <button className="btn-ghost btn-3d" onClick={() => nav('/offers')}>
              🔥 View Deals &amp; Coupons
            </button>
          )}
        </div>
      </div>

      <div className="m-hero-highlights">
        <div className="m-stat-pill">
          <span className="s-ico">🥬</span>
          <div>
            <strong>Farm Fresh Today</strong>
            <small>Harvested &amp; sorted daily</small>
          </div>
        </div>
        <div className="m-stat-pill">
          <span className="s-ico">⚡</span>
          <div>
            <strong>20–30 Mins Drop</strong>
            <small>Local neighbourhood riders</small>
          </div>
        </div>
        <div className="m-stat-pill">
          <span className="s-ico">🛡️</span>
          <div>
            <strong>Sealed &amp; Safe</strong>
            <small>Check packaging &amp; share OTP</small>
          </div>
        </div>
      </div>
    </div>
  );
}

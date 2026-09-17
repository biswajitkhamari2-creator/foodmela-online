import { useCallback, useRef, type MouseEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useShop } from '../store';

const DISH_MAIN = 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=520&h=520&fit=crop';
const DISH_TOP = 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=300&h=300&fit=crop';
const DISH_SIDE = 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=300&h=300&fit=crop';
const DISH_SWEET = 'https://images.unsplash.com/photo-1601303516534-61dcef5bc3c5?w=300&h=300&fit=crop';

/**
 * 3D hero stage — layered parallax scene.
 * The whole `.hero3d-stage` tilts with the cursor (desktop only);
 * inner layers sit at different translateZ depths so dishes, rings and
 * floating chips drift apart in 3D space. Pure CSS, no libraries.
 * Honors prefers-reduced-motion via CSS.
 */
export default function Hero3D() {
  const { user } = useShop();
  const nav = useNavigate();
  const stageRef = useRef<HTMLDivElement>(null);

  const onMove = useCallback((e: MouseEvent<HTMLDivElement>) => {
    const el = stageRef.current;
    if (!el || window.matchMedia('(hover: none)').matches) return;
    // Measure against the card (always laid out), not the stage
    // (hidden on narrow screens → zero-size rect → Infinity).
    const r = e.currentTarget.getBoundingClientRect();
    if (r.width === 0 || r.height === 0) return;
    const px = (e.clientX - r.left) / r.width - 0.5;
    const py = (e.clientY - r.top) / r.height - 0.5;
    el.style.setProperty('--hrx', `${(-py * 10).toFixed(2)}deg`);
    el.style.setProperty('--hry', `${(px * 14).toFixed(2)}deg`);
    el.style.setProperty('--hpx', `${(px * -18).toFixed(1)}px`);
    el.style.setProperty('--hpy', `${(py * -14).toFixed(1)}px`);
  }, []);

  const onLeave = useCallback(() => {
    const el = stageRef.current;
    if (!el) return;
    el.style.setProperty('--hrx', '0deg');
    el.style.setProperty('--hry', '0deg');
    el.style.setProperty('--hpx', '0px');
    el.style.setProperty('--hpy', '0px');
  }, []);

  return (
    <div className="modern-hero-card hero3d" onMouseMove={onMove} onMouseLeave={onLeave}>
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

      {/* ── 3D parallax dish stage ── */}
      <div className="hero3d-wrap" aria-hidden="true">
        <div className="hero3d-stage" ref={stageRef}>
          <div className="hero3d-ring ring-a" />
          <div className="hero3d-ring ring-b" />
          <div className="hero3d-shadow" />

          <img className="hero3d-dish dish-main" src={DISH_MAIN} alt="" loading="eager" />
          <img className="hero3d-dish dish-top" src={DISH_TOP} alt="" loading="lazy" />
          <img className="hero3d-dish dish-side" src={DISH_SIDE} alt="" loading="lazy" />
          <img className="hero3d-dish dish-sweet" src={DISH_SWEET} alt="" loading="lazy" />

          <div className="hero3d-chip chip-eta">⚡ 20 min <small>avg delivery</small></div>
          <div className="hero3d-chip chip-rate">★ 4.8 <small>12k ratings</small></div>
          <div className="hero3d-chip chip-fresh">🥬 Farm Fresh <small>picked today</small></div>
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

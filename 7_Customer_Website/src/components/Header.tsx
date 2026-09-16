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
    nav(query ? `/food?q=${encodeURIComponent(query)}` : '/food');
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
            <NavLink to="/food" className={({ isActive }) => (isActive ? 'active' : '')}>Food</NavLink>
            <NavLink to="/restaurants" className={({ isActive }) => (isActive ? 'active' : '')}>Restaurants</NavLink>
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
                placeholder="Search food..."
                aria-label="Search food"
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
        </div>
      </div>
    </header>
  );
}

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
    const query = q.trim();
    nav(query ? `/food?q=${encodeURIComponent(query)}` : '/food');
    setQ('');
  };

  return (
    <header className="header">
      <div className="header-inner">
        <Link to="/" className="brand" aria-label="FoodMela home">
          <span className="brand-mark" aria-hidden="true">F</span>
          <span>
            FoodMela
            <small>
              YOUR <b>TRUSTED</b> LOCAL DELIVERY
            </small>
          </span>
        </Link>

        <button className="loc-pill" onClick={() => setLocOpen(true)} aria-label={`Delivery location: ${area}, ${city}. Change location`}>
          <span className="dot" aria-hidden="true" />
          <span>
            <small>Delivering to</small>
            {area}, {city}
          </span>
          <span aria-hidden="true">▾</span>
        </button>

        <nav className="nav-links" aria-label="Primary">
          <NavLink to="/" end className={({ isActive }) => (isActive ? 'active' : '')}>Home</NavLink>
          <NavLink to="/food" className={({ isActive }) => (isActive ? 'active' : '')}>Food</NavLink>
          <NavLink to="/restaurants" className={({ isActive }) => (isActive ? 'active' : '')}>Restaurants</NavLink>
          <NavLink to="/grocery" className={({ isActive }) => (isActive ? 'active' : '')}>Grocery</NavLink>
          <NavLink to="/offers" className={({ isActive }) => (isActive ? 'active' : '')}>Offers</NavLink>
          <NavLink to="/orders" className={({ isActive }) => (isActive ? 'active' : '')}>Orders</NavLink>
        </nav>

        <div className="header-right">
          <form className="search-mini" onSubmit={submitSearch} role="search">
            <span aria-hidden="true">🔍</span>
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search biryani, pizza…"
              aria-label="Search food"
              style={{ border: 'none', outline: 'none', background: 'transparent', fontSize: 13, width: 130, fontFamily: 'inherit' }}
            />
          </form>
          {user ? (
            <button
              className="login-btn ghost-user"
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
            <button className="login-btn" onClick={() => nav('/login')}>Login</button>
          )}
          {Boolean(user) && !hideCart && (
            <button className={`cart-btn ${bump ? 'bump' : ''}`} onClick={onCartOpen} aria-label={`Open cart, ${cartCount} items`}>
              🛒 Cart <span className="cart-count">{cartCount}</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
}

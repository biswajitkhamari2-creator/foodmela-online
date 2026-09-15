import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useShop } from '../store';
import FoodCard from '../components/FoodCard';

// Premium profile — uses EXISTING features only:
// user (name/phone/address), orders route, favourites (on-device),
// help pages, logout. No new backend.
export default function Profile() {
  const { user, setUser, allItems, favs, cartCount } = useShop();
  const nav = useNavigate();

  const favItems = useMemo(
    () => allItems.filter((c) => favs.has(c.id)),
    [allItems, favs],
  );

  if (!user) {
    return (
      <div className="section page-enter" style={{ maxWidth: 560 }}>
        <div className="mela-empty">
          <div className="mela-empty-icon">👤</div>
          <h3>Your profile lives here</h3>
          <p>Log in to see your orders, favourites, addresses and more.</p>
          <button className="btn-primary" style={{ marginTop: 18 }} onClick={() => nav('/login')}>
            Login →
          </button>
        </div>
      </div>
    );
  }

  const initial = (user.name.trim()[0] ?? 'F').toUpperCase();

  const rows: { icon: string; bg: string; title: string; sub: string; to: string; danger?: boolean }[] = [
    { icon: '🧾', bg: '#E7F6EC', title: 'My Orders', sub: 'Track, reorder & receipts', to: '/orders' },
    { icon: '❤️', bg: '#FDECEA', title: 'My Favourites', sub: favItems.length > 0 ? `${favItems.length} saved dishes` : 'Dishes you heart', to: '/profile#favs' },
    { icon: '📍', bg: '#FFF4D6', title: 'Delivery Address', sub: user.address || 'Add your address', to: '/page/help' },
    { icon: '🎁', bg: '#FFF4D6', title: 'Offers For You', sub: "Today's mela picks", to: '/offers' },
    { icon: '💬', bg: '#E3F0FF', title: 'Help & Support', sub: 'Helpline 8144503650', to: '/page/help' },
    { icon: '📜', bg: '#F1F3F0', title: 'Terms & Privacy', sub: 'Know your rights', to: '/page/terms' },
  ];

  return (
    <div className="page-enter">
      <div className="profile-hero">
        <div className="profile-hero-inner">
          <div className="profile-avatar" aria-hidden="true">{initial}</div>
          <div>
            <h1>{user.name}</h1>
            <p>+91 {user.phone}{cartCount > 0 ? ` · ${cartCount} item${cartCount === 1 ? '' : 's'} in your thali` : ''}</p>
            {user.address && <p>📍 {user.address}</p>}
          </div>
        </div>
      </div>

      <div className="pf-list">
        <div className="pf-card">
          {rows.map((r) => (
            <button key={r.title} className="pf-row" onClick={() => nav(r.to)}>
              <span className="pf-ico" style={{ background: r.bg }} aria-hidden="true">{r.icon}</span>
              <span>
                {r.title}
                <small>{r.sub}</small>
              </span>
              <span className="go" aria-hidden="true">›</span>
            </button>
          ))}
          <button
            className="pf-row danger"
            onClick={() => {
              if (confirm('Log out?')) {
                setUser(null);
                nav('/');
              }
            }}
          >
            <span className="pf-ico" style={{ background: '#FDECEA' }} aria-hidden="true">🚪</span>
            <span>
              Logout
              <small>See you at the next mela</small>
            </span>
            <span className="go" aria-hidden="true">›</span>
          </button>
        </div>

        <div id="favs" className="section" style={{ paddingLeft: 0, paddingRight: 0 }}>
          <div className="section-head">
            <div>
              <h2>Your FoodMela <span className="accent">favourites</span></h2>
              <p>{favItems.length > 0 ? `${favItems.length} saved dishes` : 'Tap 🤍 on any dish to save it here'}</p>
            </div>
          </div>
          {favItems.length === 0 ? (
            <div className="mela-empty" style={{ padding: '30px 10px' }}>
              <div className="mela-empty-icon">🤍</div>
              <h3>No cravings saved yet</h3>
              <p>Your favourite meals will live here — tap the heart on any dish.</p>
              <button className="btn-primary" style={{ marginTop: 16 }} onClick={() => nav('/food')}>
                Explore Food →
              </button>
            </div>
          ) : (
            <div className="food-grid">
              {favItems.map((item) => (
                <FoodCard key={item.id} item={item} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

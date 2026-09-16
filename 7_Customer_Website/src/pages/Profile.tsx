import { useMemo, useState } from 'react';
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
  // ── Instant name edit: pushes to backend (single source of truth).
  // App + admin pick it up live via their listeners — no delay.
  const [editingName, setEditingName] = useState(false);
  const [draftName, setDraftName] = useState('');
  const [savingName, setSavingName] = useState(false);
  const [nameMsg, setNameMsg] = useState('');

  const saveName = async () => {
    const clean = draftName.trim();
    if (!user || clean.length < 2) { setNameMsg('Enter a valid name'); return; }
    if (clean === user.name) { setEditingName(false); return; }
    setSavingName(true);
    setNameMsg('');
    try {
      const { api } = await import('../api');
      const res = await fetch(`/api/user/${encodeURIComponent(user.phone)}/profile`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: clean }),
      });
      if (!res.ok) throw new Error('save failed');
      setUser({ ...user, name: clean });
      try { void api.register({ phone: user.phone, name: clean, address: user.address }); } catch { /* name already saved */ }
      setEditingName(false);
      setNameMsg('✓ Name updated everywhere');
      setTimeout(() => setNameMsg(''), 3000);
    } catch {
      setNameMsg('Could not save — check internet');
    }
    setSavingName(false);
  };

  const rows: { icon: string; bg: string; title: string; sub: string; to: string; danger?: boolean }[] = [
    { icon: '🧾', bg: '#E7F6EC', title: 'My Orders', sub: 'Track, reorder & receipts', to: '/orders' },
    { icon: '❤️', bg: '#FDECEA', title: 'My Favourites', sub: favItems.length > 0 ? `${favItems.length} saved items` : 'Items you heart', to: '/profile#favs' },
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
            {editingName ? (
              <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
                <input
                  className="text-input"
                  value={draftName}
                  onChange={(e) => setDraftName(e.target.value)}
                  placeholder="Your full name"
                  autoFocus
                  style={{ maxWidth: 220 }}
                />
                <button className="btn-primary" style={{ padding: '9px 18px', fontSize: 13 }} disabled={savingName} onClick={saveName}>
                  {savingName ? 'Saving…' : 'Save'}
                </button>
                <button className="btn-ghost" style={{ padding: '9px 14px', fontSize: 13 }} onClick={() => setEditingName(false)}>
                  ✕
                </button>
              </div>
            ) : (
              <h1>
                {user.name}{' '}
                <button
                  onClick={() => { setDraftName(user.name); setEditingName(true); }}
                  aria-label="Edit name"
                  style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 16 }}
                >
                  ✏️
                </button>
              </h1>
            )}
            {nameMsg && <p style={{ fontSize: 12, color: nameMsg.startsWith('✓') ? '#0e9f4e' : '#C4271F', fontWeight: 700 }}>{nameMsg}</p>}
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
              <h2>Your <span className="accent">favourites</span></h2>
              <p>{favItems.length > 0 ? `${favItems.length} saved items` : 'Tap 🤍 on any item to save it here'}</p>
            </div>
          </div>
          {favItems.length === 0 ? (
            <div className="mela-empty" style={{ padding: '30px 10px' }}>
              <div className="mela-empty-icon">🤍</div>
              <h3>No cravings saved yet</h3>
              <p>Your favourite items will live here — tap the heart on any item.</p>
              <button className="btn-primary" style={{ marginTop: 16 }} onClick={() => nav('/grocery')}>
                Explore Grocery →
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

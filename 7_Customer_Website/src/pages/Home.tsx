import { useEffect, useMemo, useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  MOODS,
  STOREFRONTS,
  PROMO_OFFERS,
  readSeen,
} from '../data/catalog';
import { useShop } from '../store';
import { useDeliveryLocation } from '../components/location-context';
import FoodCard from '../components/FoodCard';
import FestBanner from '../components/FestBanner';
import OfferCard from '../components/OfferCard';

const GROCERY_CATS = new Set(['vegetables', 'fruits', 'grocery', 'dairy', 'eggs_meat']);

// Rotating hero plate images (presentation only).
const PLATE_IMAGES = [
  'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800&h=800&fit=crop',
  'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=800&h=800&fit=crop',
  'https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=800&h=800&fit=crop',
];

const BENEFITS = [
  { emoji: '⚡', bg: '#FFF4D6', title: 'Fast Delivery', text: 'Hot & fresh at your door in minutes' },
  { emoji: '🛡️', bg: '#E7F6EC', title: 'Safe & Secure', text: 'Trusted payments, every single order' },
  { emoji: '🥬', bg: '#E7F6EC', title: 'Fresh & Quality', text: 'Picked daily, quality-checked' },
  { emoji: '💰', bg: '#FFF4D6', title: 'Great Prices', text: 'Local rates, honest bills' },
  { emoji: '❤️', bg: '#FDECEA', title: 'Support Local', text: 'Every order helps your community' },
];

function scrollToMenu() {
  document.getElementById('menu')?.scrollIntoView({ behavior: 'smooth' });
}

export default function Home() {
  const { cartCount, allItems, customs, priceOf, mrpOf, user, favs } = useShop();
  const { city, area, setLocOpen } = useDeliveryLocation();
  const nav = useNavigate();
  const [q, setQ] = useState('');
  const [plateIdx, setPlateIdx] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setPlateIdx((i) => (i + 1) % PLATE_IMAGES.length), 4000);
    return () => clearInterval(t);
  }, []);

  // ── Discovery rails — all computed from REAL catalog + live prices ──
  const popular = useMemo(
    () => [...allItems].sort((a, b) => b.rating - a.rating).slice(0, 10),
    [allItems],
  );
  const bestValue = useMemo(
    () =>
      allItems
        .map((c) => {
          const mrp = mrpOf(c);
          const price = priceOf(c);
          const off = mrp ? Math.round(((mrp - price) / mrp) * 100) : 0;
          return { c, off };
        })
        .filter((x) => x.off > 0)
        .sort((a, b) => b.off - a.off || b.c.rating - a.c.rating)
        .slice(0, 8)
        .map((x) => x.c),
    [allItems, priceOf, mrpOf],
  );
  const freshToday = useMemo(
    () => allItems.filter((c) => GROCERY_CATS.has(c.category)).sort((a, b) => b.rating - a.rating).slice(0, 8),
    [allItems],
  );
  const freshAdded = useMemo(
    () => (customs.length > 0 ? customs : [...allItems].sort((a, b) => b.rating - a.rating)).slice(0, 8),
    [allItems, customs],
  );
  // Hidden gems = rated well but not top-10 (real data, second tier).
  const hiddenGems = useMemo(
    () => [...allItems].sort((a, b) => b.rating - a.rating).slice(10, 18),
    [allItems],
  );
  const favItems = useMemo(
    () => allItems.filter((c) => favs.has(c.id)),
    [allItems, favs],
  );
  const becauseYouOrdered = useMemo(() => {
    const seen = readSeen();
    if (seen.length === 0) return [];
    const seenCats = new Set(
      seen
        .map((id) => allItems.find((c) => c.id === id)?.category)
        .filter((c): c is string => Boolean(c)),
    );
    return allItems
      .filter((c) => seenCats.has(c.category) && !seen.includes(c.id))
      .sort((a, b) => b.rating - a.rating)
      .slice(0, 8);
  }, [allItems]);
  const moodCounts = useMemo(() => {
    const m = new Map<string, number>();
    for (const mood of MOODS) {
      m.set(mood.key, allItems.filter((c) => mood.cats.includes(c.category)).length);
    }
    return m;
  }, [allItems]);

  const avgRating = useMemo(() => {
    if (allItems.length === 0) return '4.6';
    return (allItems.reduce((s, c) => s + c.rating, 0) / allItems.length).toFixed(1);
  }, [allItems]);

  const requireLogin = (fn: () => void) => {
    if (!user) {
      nav('/login');
      return;
    }
    fn();
  };

  const submitHeroSearch = (e: FormEvent) => {
    e.preventDefault();
    const query = q.trim();
    if (!query) {
      requireLogin(scrollToMenu);
      return;
    }
    requireLogin(() => nav(`/food?q=${encodeURIComponent(query)}`));
  };

  return (
    <div className="page-enter">
      {/* ── HERO ── */}
      <div className="mela-hero">
        <div className="mela-hero-grid">
          <div>
            <span className="mela-eyebrow">
              <span className="pulse" aria-hidden="true" /> Now serving {city}
            </span>
            <h1>
              Good Food.
              <br />
              <span className="w-leaf">Made</span> <span className="w-chili">Local.</span>
            </h1>
            <p className="mela-sub">
              Discover amazing food, fresh groceries and local favourites delivered to your doorstep.
            </p>
            <div className="mela-cta">
              <button className="btn-primary" onClick={() => requireLogin(scrollToMenu)}>Order Now →</button>
              <button className="btn-ghost" onClick={() => requireLogin(() => nav('/food'))}>Explore Nearby</button>
            </div>
            {/* ── APP DOWNLOAD highlight — glowing, pulsing, unmissable ── */}
            <Link
              to="/apk"
              className="mela-app-banner"
              aria-label="Download the FoodMela Android app"
            >
              <span className="mela-app-ico" aria-hidden="true">📱</span>
              <span className="mela-app-text">
                <strong>⬇ GET THE APP — FREE DOWNLOAD</strong>
                <small>Faster ordering · Live tracking · Same account · v1.0.0</small>
              </span>
              <span className="mela-app-go" aria-hidden="true">GET →</span>
            </Link>
            <button className="mela-serve" onClick={() => setLocOpen(true)} aria-label={`Change delivery location, currently ${area}`}>
              📍 Delivering to <strong>&nbsp;{area}, {city}&nbsp;</strong> · Change ▾
            </button>
            <div className="mela-stats">
              <div><strong>{allItems.length}+</strong><span>Dishes &amp; essentials</span></div>
              <div><strong>{avgRating}★</strong><span>Loved by locals</span></div>
              <div><strong>~30 min</strong><span>Avg. delivery</span></div>
            </div>
          </div>
          <div className="mela-plate-wrap">
            <div className="mela-plate-ring" aria-hidden="true" />
            <div className="mela-plate">
              {PLATE_IMAGES.map((src, i) => (
                <img key={src} src={src} alt="" aria-hidden={i !== plateIdx} className={i === plateIdx ? 'on' : ''} loading={i === 0 ? 'eager' : 'lazy'} />
              ))}
            </div>
            <div className="mela-chip mela-chip-1">
              <span className="ci" aria-hidden="true">🛵</span>
              <span>
                <strong>Live rider tracking</strong>
                <small>{user && cartCount > 0 ? `${cartCount} item(s) in your thali` : 'Riders reach your exact address'}</small>
              </span>
            </div>
            <div className="mela-chip mela-chip-2">
              <span className="ci" aria-hidden="true">⭐</span>
              <span>
                <strong>{avgRating} rated by locals</strong>
                <small>Your trusted neighbourhood mela</small>
              </span>
            </div>
          </div>
        </div>

        {/* ── CRAVING SEARCH ── */}
        <div className="mela-search-zone">
          <form className="mela-search-box" onSubmit={submitHeroSearch} role="search">
            <span className="s-ico" aria-hidden="true">🔍</span>
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search biryani... find your favourite food..."
              aria-label="Search biryani, find your favourite food"
            />
            <button type="submit" className="btn-primary">Search</button>
          </form>
        </div>
      </div>

      <FestBanner />

      {user ? (
        <>
          {/* ── MEGA OFFERS & HOT DISCOUNTS ── */}
          <div className="section" style={{ paddingBottom: 10 }}>
            <div className="section-head">
              <div>
                <h2>🔥 Today&apos;s Hot <span className="accent-chili">Discounts &amp; Deals</span></h2>
                <p>Tap any coupon to copy &amp; save big on your order</p>
              </div>
              <span className="link-more" onClick={() => nav('/offers')}>All Offers (50% OFF) →</span>
            </div>
            <div className="ticket-grid" role="list">
              {PROMO_OFFERS.slice(0, 3).map((o) => (
                <OfferCard key={o.code} offer={o} />
              ))}
            </div>
          </div>

          {/* ── WHAT'S YOUR MOOD? ── */}
          <div className="section">
            <div className="section-head">
              <div>
                <h2>What&apos;s your <span className="accent">mood?</span></h2>
                <p>Six cravings, one neighbourhood — pick yours</p>
              </div>
              <span className="link-more" onClick={() => nav('/food')}>View all →</span>
            </div>
            <div className="mood-grid" role="list">
              {MOODS.map((m, i) => (
                <button
                  key={m.key}
                  role="listitem"
                  className={`mood-card mood-${i} reveal reveal-${Math.min(i, 4)}`}
                  onClick={() => nav(`/food?mood=${m.key}`)}
                  aria-label={`${m.title} — ${moodCounts.get(m.key) ?? 0} dishes`}
                >
                  <span className="m-count">{moodCounts.get(m.key) ?? 0} dishes</span>
                  <span className="m-emoji" aria-hidden="true">{m.emoji}</span>
                  <strong>{m.title}</strong>
                  <small>{m.blurb}</small>
                </button>
              ))}
            </div>
          </div>

          {/* ── MADE AROUND YOU ── */}
          <div className="section">
            <div className="local-band">
              <h2>Made <span className="accent">around you</span></h2>
              <p>Nearby kitchens &amp; stores in {city} — live menus, community favourites, honest prices.</p>
              <div className="local-scroll" role="list">
                {STOREFRONTS.map((s) => {
                  const items = allItems.filter((c) => c.category === s.key);
                  const top = items.reduce((m, c) => Math.max(m, c.rating), 0);
                  return (
                    <div key={s.key} role="listitem" className="local-card" onClick={() => nav(`/food?cat=${s.key}`)} tabIndex={0}
                      onKeyDown={(e) => { if (e.key === 'Enter') nav(`/food?cat=${s.key}`); }}
                      aria-label={`${s.name} — order now`}>
                      <img src={s.image} alt={s.name} loading="lazy" />
                      <div className="lc-body">
                        <h3>{s.name}</h3>
                        <p>{s.cuisine}</p>
                        <div className="lc-meta">
                          <span className="rate">★ {top > 0 ? top.toFixed(1) : '4.5'}</span>
                          <span className="eta">🛵 {s.eta}</span>
                          <span className="eta">{items.length} items</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* ── POPULAR RIGHT NOW ── */}
          <div className="section">
            <div className="section-head">
              <div>
                <h2>Popular <span className="accent">right now</span></h2>
                <p>Top-rated dishes people around you love</p>
              </div>
              <span className="link-more" onClick={() => nav('/food')}>View all →</span>
            </div>
            <div className="h-scroll">
              {popular.map((item) => (
                <FoodCard key={item.id} item={item} />
              ))}
            </div>
          </div>

          {/* ── BEST VALUE TODAY ── */}
          {bestValue.length > 0 && (
            <div className="section">
              <div className="section-head">
                <div>
                  <h2>Best value <span className="accent-chili">today</span></h2>
                  <p>Biggest live discounts, updated by the store</p>
                </div>
                <span className="link-more" onClick={() => nav('/offers')}>All offers →</span>
              </div>
              <div className="h-scroll">
                {bestValue.map((item) => (
                  <FoodCard key={item.id} item={item} />
                ))}
              </div>
            </div>
          )}

          {/* ── FRESH FOR YOUR HOME ── */}
          <div className="section" id="grocery">
            <div className="section-head">
              <div>
                <h2>Fresh for <span className="accent">your home</span></h2>
                <p>Vegetables, fruits, dairy &amp; staples — one mela, everything fresh</p>
              </div>
              <span className="link-more" onClick={() => nav('/grocery')}>Open grocery →</span>
            </div>
            <div className="h-scroll">
              {freshToday.map((item) => (
                <FoodCard key={item.id} item={item} />
              ))}
            </div>
          </div>

          {/* ── TODAY'S MELa PICKS (offers) ── */}
          <div className="section" id="offers">
            <div className="section-head">
              <div>
                <h2>Today&apos;s FoodMela <span className="accent">picks</span></h2>
                <p>Local love deals + festival specials</p>
              </div>
              <span className="link-more" onClick={() => nav('/offers')}>All offers →</span>
            </div>
            <div className="ticket-grid">
              {PROMO_OFFERS.map((o) => (
                <OfferCard key={o.code} offer={o} />
              ))}
            </div>
          </div>

          {/* ── FRESHLY ADDED ── */}
          <div className="section">
            <div className="section-head">
              <div>
                <h2>Freshly <span className="accent">added</span></h2>
                <p>{customs.length > 0 ? 'Just added by your local stores' : 'New to the mela this week'}</p>
              </div>
            </div>
            <div className="h-scroll">
              {freshAdded.map((item) => (
                <FoodCard key={item.id} item={item} />
              ))}
            </div>
          </div>

          {/* ── HIDDEN LOCAL GEMS ── */}
          {hiddenGems.length > 0 && (
            <div className="section">
              <div className="section-head">
                <div>
                  <h2>Hidden local <span className="accent">gems</span></h2>
                  <p>Quiet favourites worth discovering</p>
                </div>
              </div>
              <div className="h-scroll">
                {hiddenGems.map((item) => (
                  <FoodCard key={item.id} item={item} />
                ))}
              </div>
            </div>
          )}

          {/* ── YOUR FOODMELA FAVOURITES ── */}
          {favItems.length > 0 && (
            <div className="section">
              <div className="section-head">
                <div>
                  <h2>Your FoodMela <span className="accent-chili">favourites</span></h2>
                  <p>Your saved collection, one tap away</p>
                </div>
                <span className="link-more" onClick={() => nav('/profile')}>Manage →</span>
              </div>
              <div className="h-scroll">
                {favItems.map((item) => (
                  <FoodCard key={item.id} item={item} />
                ))}
              </div>
            </div>
          )}

          {/* ── BECAUSE YOU ORDERED ── */}
          {becauseYouOrdered.length > 0 && (
            <div className="section">
              <div className="section-head">
                <div>
                  <h2>Because you <span className="accent">ordered…</span></h2>
                  <p>More from the kitchens you love</p>
                </div>
              </div>
              <div className="h-scroll">
                {becauseYouOrdered.map((item) => (
                  <FoodCard key={item.id} item={item} />
                ))}
              </div>
            </div>
          )}
        </>
      ) : (
        <div className="section" id="menu">
          <div className="menu-lock-card">
            <span className="lock-badge">🔒 Members Only Menu</span>
            <h2>Log in to enter the <span className="accent">food mela</span></h2>
            <p>Sign in with your mobile number to explore fresh dishes, live prices, and order online in Birmaharajpur.</p>
            <button className="btn-primary" onClick={() => nav('/login')}>
              Login with Phone to View Menu →
            </button>
          </div>
        </div>
      )}

      {/* ── WHY FOODMELA ── */}
      <div className="section">
        <div className="section-head">
          <div>
            <h2>Why order with <span className="accent">FoodMela?</span></h2>
          </div>
        </div>
        <div className="benefit-grid">
          {BENEFITS.map((b) => (
            <div key={b.title} className="benefit-card">
              <div className="b-ico" style={{ background: b.bg }} aria-hidden="true">{b.emoji}</div>
              <strong>{b.title}</strong>
              <small>{b.text}</small>
            </div>
          ))}
        </div>
      </div>

      {/* ── APP ── */}
      <div className="section" id="app">
        <div className="app-band">
          <div>
            <h2>Your favourite food is just a tap away.</h2>
            <p>Get the FoodMela app for faster ordering, live rider tracking &amp; exclusive app-only deals.</p>
            <div className="store-row">
              <a
                className="store-btn"
                href="https://play.google.com/store/search?q=foodmela&c=apps"
                target="_blank"
                rel="noreferrer"
              >
                <span className="s-ico" aria-hidden="true">▶️</span>
                <span><small>GET IT ON</small><strong>Google Play</strong></span>
              </a>
              <button className="store-btn" onClick={() => nav(user ? '/food' : '/login')}>
                <span className="s-ico" aria-hidden="true">🌐</span>
                <span><small>OR CONTINUE ON</small><strong>foodmela.online</strong></span>
              </button>
            </div>
            <div className="qr-hint">📱 Android app available — search “FoodMela” on Google Play.</div>
          </div>
          <div className="phone-mock" aria-hidden="true">
            <div className="pm-notch" />
            <div className="pm-screen">
              <img
                src="https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=460&h=820&fit=crop"
                alt=""
                loading="lazy"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

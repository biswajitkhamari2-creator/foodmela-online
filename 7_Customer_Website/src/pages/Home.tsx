import { useMemo, useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  CATEGORIES,
  SHOWCASE_CATEGORIES,
  GROCERY_AISLES,
  STOREFRONTS,
  PROMO_OFFERS,
  SEARCH_SUGGESTIONS,
} from '../data/catalog';
import { useShop } from '../store';
import { useDeliveryLocation } from '../components/location-context';
import FoodCard from '../components/FoodCard';
import FestBanner from '../components/FestBanner';
import OfferCard from '../components/OfferCard';
import StorefrontCard from '../components/StorefrontCard';

const GROCERY_CATS = new Set(['vegetables', 'fruits', 'grocery', 'dairy', 'eggs_meat']);

const BENEFITS = [
  { emoji: '⚡', bg: '#FFF4D6', title: 'Fast Delivery', text: 'Hot & fresh at your door in minutes' },
  { emoji: '🛡️', bg: '#E7F6EC', title: 'Safe & Secure', text: 'Trusted payments, every single order' },
  { emoji: '🥬', bg: '#E7F6EC', title: 'Fresh & Quality', text: 'Picked daily, quality-checked' },
  { emoji: '💰', bg: '#FFF4D6', title: 'Great Prices', text: 'Local rates, no platform markup' },
  { emoji: '❤️', bg: '#FDECEA', title: 'Support Local', text: 'Every order helps your community' },
];

function scrollToMenu() {
  document.getElementById('menu')?.scrollIntoView({ behavior: 'smooth' });
}

export default function Home() {
  const { cartCount, allItems, customs, priceOf, mrpOf } = useShop();
  const { city, area, setLocOpen } = useDeliveryLocation();
  const nav = useNavigate();
  const [cat, setCat] = useState('all');
  const [q, setQ] = useState('');
  const [vegOnly, setVegOnly] = useState(false);

  // ── Discovery rails — all computed from REAL catalog + live prices ──
  const popular = useMemo(
    () => [...allItems].sort((a, b) => b.rating - a.rating).slice(0, 10),
    [allItems],
  );
  const bestSellers = useMemo(
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
  const trending = useMemo(
    () => (customs.length > 0 ? customs : [...allItems].sort((a, b) => b.rating - a.rating)).slice(0, 8),
    [allItems, customs],
  );
  const recommended = useMemo(
    () => allItems.filter((c) => c.rating >= 4.6 && c.isVeg).slice(0, 8),
    [allItems],
  );

  const items = useMemo(() => {
    const s = q.toLowerCase().trim();
    return allItems.filter((c) => {
      if (cat !== 'all' && c.category !== cat) return false;
      if (vegOnly && !c.isVeg) return false;
      if (s && !c.name.toLowerCase().includes(s)) return false;
      return true;
    });
  }, [cat, q, vegOnly, allItems]);

  const avgRating = useMemo(() => {
    if (allItems.length === 0) return '4.6';
    return (allItems.reduce((s, c) => s + c.rating, 0) / allItems.length).toFixed(1);
  }, [allItems]);

  const pickCategory = (key: string) => {
    setCat(key);
    setQ('');
    scrollToMenu();
  };

  const submitHeroSearch = (e: FormEvent) => {
    e.preventDefault();
    scrollToMenu();
  };

  return (
    <div className="page-enter">
      {/* ── 1. HERO ── */}
      <div className="hero-band">
        <div className="hero">
          <div>
            <span className="hero-eyebrow">
              <span className="pulse" aria-hidden="true" /> Now serving {city}
            </span>
            <h1>
              Good Food.
              <br />
              <span className="hl-green">Delivered</span> <span className="hl-yellow">Happier.</span>
            </h1>
            <p className="hero-sub">
              Food, groceries &amp; more — delivered fresh to your doorstep.
            </p>
            <div className="hero-cta">
              <button className="btn-primary" onClick={scrollToMenu}>Order Now →</button>
              <button className="btn-ghost" onClick={() => nav('/food')}>Explore Food</button>
            </div>
            <button className="hero-serve" onClick={() => setLocOpen(true)} aria-label={`Change delivery location, currently ${area}`}>
              📍 Delivering to <strong>&nbsp;{area}, {city}&nbsp;</strong> · Change ▾
            </button>
            <div className="hero-stats">
              <div><strong>{allItems.length}+</strong><span>Dishes &amp; essentials</span></div>
              <div><strong>{avgRating}★</strong><span>Avg. rating</span></div>
              <div><strong>~30 min</strong><span>Avg. delivery</span></div>
            </div>
          </div>
          <div className="hero-art">
            <div className="plate">
              <img
                src="https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=900&h=760&fit=crop"
                alt="Freshly cooked FoodMela meal"
              />
            </div>
            <div className="float-card float-1">
              <span className="fc-ico" aria-hidden="true">🛵</span>
              <span>
                <strong>Live rider tracking</strong>
                <small>{cartCount > 0 ? `${cartCount} item(s) in your cart` : 'Riders reach your exact address'}</small>
              </span>
            </div>
            <div className="float-card float-2">
              <span className="fc-ico" aria-hidden="true">⭐</span>
              <span>
                <strong>{avgRating} rated by locals</strong>
                <small>Your trusted local delivery app</small>
              </span>
            </div>
          </div>
        </div>

        {/* ── 2. SEARCH ── */}
        <div className="hero-search">
          <form className="hero-search-box" onSubmit={submitHeroSearch} role="search">
            <span className="s-ico" aria-hidden="true">🔍</span>
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search for biryani, pizza, burgers, groceries..."
              aria-label="Search for biryani, pizza, burgers, groceries"
            />
            <button type="submit" className="btn-primary">Search</button>
          </form>
          <div className="hero-search-hints">
            <span>Popular:</span>
            {SEARCH_SUGGESTIONS.slice(0, 6).map((s) => (
              <button key={s} className="hint-chip" onClick={() => { setQ(s); scrollToMenu(); }}>
                {s}
              </button>
            ))}
          </div>
        </div>
      </div>

      <FestBanner />

      {/* ── 3. CATEGORIES ── */}
      <div className="section">
        <div className="section-head">
          <div>
            <h2>What&apos;s on your <span className="accent">mind?</span></h2>
            <p>Live prices — admin updates reflect instantly, no refresh needed</p>
          </div>
          <span className="link-more" onClick={() => nav('/food')}>View all →</span>
        </div>
        <div className="cat-circle-row" role="list">
          {SHOWCASE_CATEGORIES.map((c, i) => (
            <button
              key={c.key}
              role="listitem"
              className={`cat-circle reveal reveal-${Math.min(i, 4)} ${cat === c.key ? 'on' : ''}`}
              onClick={() => pickCategory(c.key)}
              aria-label={`Browse ${c.label}`}
              title={c.blurb}
            >
              <span className="cc-img"><img src={c.image} alt={c.label} loading="lazy" /></span>
              <span>{c.emoji} {c.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* ── 4. POPULAR NEAR YOU ── */}
      <div className="section">
        <div className="section-head">
          <div>
            <h2>Popular <span className="accent">near you</span></h2>
            <p>Top-rated dishes loved across {city}</p>
          </div>
          <span className="link-more" onClick={() => nav('/food')}>View all →</span>
        </div>
        <div className="h-scroll">
          {popular.map((item) => (
            <FoodCard key={item.id} item={item} />
          ))}
        </div>
      </div>

      {/* ── 5. TOP RESTAURANTS / STORES ── */}
      <div className="section">
        <div className="section-head">
          <div>
            <h2>Top <span className="accent">restaurants &amp; stores</span></h2>
            <p>Local kitchens &amp; shops, live item counts</p>
          </div>
          <span className="link-more" onClick={() => nav('/restaurants')}>View all →</span>
        </div>
        <div className="food-grid">
          {STOREFRONTS.slice(0, 3).map((s) => (
            <StorefrontCard key={s.key} store={s} />
          ))}
        </div>
      </div>

      {/* ── 6. FULL MENU (existing filter logic, premium skin) ── */}
      <div className="section" id="menu">
        <div className="section-head">
          <div>
            <h2>Explore the <span className="accent">full menu</span></h2>
            <p>{items.length} items · search, filter &amp; add to cart</p>
          </div>
        </div>
        <div className="filter-bar">
          <div className="search-bar">
            <span aria-hidden="true">🔍</span>
            <input placeholder="Search dishes..." value={q} onChange={(e) => setQ(e.target.value)} aria-label="Search dishes" />
          </div>
          <button className={`cat-chip ${vegOnly ? 'veg-on' : ''}`} onClick={() => setVegOnly(!vegOnly)} aria-pressed={vegOnly}>
            🟢 Veg only
          </button>
        </div>
        <div className="cat-row">
          {CATEGORIES.map((c) => (
            <button key={c.key} className={`cat-chip ${cat === c.key ? 'on' : ''}`} onClick={() => setCat(c.key)}>
              {c.icon} {c.label}
            </button>
          ))}
        </div>
        {items.length === 0 ? (
          <div className="empty">
            <div className="empty-icon">🔍</div>
            <h3>No dishes found</h3>
            <p>Try a different search or category.</p>
          </div>
        ) : (
          <div className="food-grid">
            {items.map((item) => (
              <FoodCard key={item.id} item={item} />
            ))}
          </div>
        )}
      </div>

      {/* ── 7. BEST SELLERS (live discounts) ── */}
      {bestSellers.length > 0 && (
        <div className="section">
          <div className="section-head">
            <div>
              <h2>Best <span className="accent">sellers</span></h2>
              <p>Biggest live discounts, updated by the store</p>
            </div>
            <span className="link-more" onClick={() => nav('/offers')}>All offers →</span>
          </div>
          <div className="h-scroll">
            {bestSellers.map((item) => (
              <FoodCard key={item.id} item={item} />
            ))}
          </div>
        </div>
      )}

      {/* ── 8. GROCERY ── */}
      <div className="section" id="grocery">
        <div className="section-head">
          <div>
            <h2>Fresh groceries, <span className="accent">delivered fast</span></h2>
            <p>Vegetables, fruits, dairy &amp; staples — picked fresh daily</p>
          </div>
          <span className="link-more" onClick={() => nav('/grocery')}>Open grocery →</span>
        </div>
        <div className="cat-circle-row" role="list">
          {GROCERY_AISLES.map((c) => (
            <button key={c.key} role="listitem" className="cat-circle" onClick={() => nav(`/grocery?cat=${c.key}`)} aria-label={`Shop ${c.label}`} title={c.blurb}>
              <span className="cc-img"><img src={c.image} alt={c.label} loading="lazy" /></span>
              <span>{c.emoji} {c.label}</span>
            </button>
          ))}
        </div>
        <div className="h-scroll" style={{ marginTop: 8 }}>
          {freshToday.map((item) => (
            <FoodCard key={item.id} item={item} />
          ))}
        </div>
      </div>

      {/* ── 9. OFFERS ── */}
      <div className="section" id="offers">
        <div className="section-head">
          <div>
            <h2>Offers <span className="accent">for you</span></h2>
            <p>Festival specials + everyday local deals</p>
          </div>
          <span className="link-more" onClick={() => nav('/offers')}>All offers →</span>
        </div>
        <div className="offer-grid">
          {PROMO_OFFERS.map((o) => (
            <OfferCard key={o.code} offer={o} />
          ))}
        </div>
      </div>

      {/* ── 10. SUPPORT LOCAL (dark band) ── */}
      <div className="section">
        <div className="dark-band">
          <div>
            <h2>Support Local. <span className="accent">Eat Local.</span></h2>
            <p>
              Discover amazing restaurants and stores in your community. Every FoodMela
              order supports kitchens, shops and riders right here in {city}.
            </p>
            <div className="db-points">
              <div className="db-point"><span className="tick">✓</span>Local kitchens, honest prices</div>
              <div className="db-point"><span className="tick">✓</span>Riders from your own town</div>
              <div className="db-point"><span className="tick">✓</span>Fresh stock, updated daily</div>
              <div className="db-point"><span className="tick">✓</span>Support that knows your name</div>
            </div>
            <div style={{ marginTop: 24 }}>
              <button className="btn-primary" onClick={() => nav('/restaurants')}>Meet Local Stores →</button>
            </div>
          </div>
          <div className="db-img">
            <img
              src="https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800&h=600&fit=crop"
              alt="Local restaurant serving fresh food"
              loading="lazy"
            />
          </div>
        </div>
      </div>

      {/* ── 11. TRENDING + RECOMMENDED ── */}
      <div className="section">
        <div className="section-head">
          <div>
            <h2>Trending <span className="accent">now</span></h2>
            <p>{customs.length > 0 ? 'Just added by your local stores' : 'What everyone is ordering this week'}</p>
          </div>
        </div>
        <div className="h-scroll">
          {trending.map((item) => (
            <FoodCard key={item.id} item={item} />
          ))}
        </div>
      </div>

      {recommended.length > 0 && (
        <div className="section">
          <div className="section-head">
            <div>
              <h2>Recommended <span className="accent">for you</span></h2>
              <p>Top-rated vegetarian picks</p>
            </div>
          </div>
          <div className="h-scroll">
            {recommended.map((item) => (
              <FoodCard key={item.id} item={item} />
            ))}
          </div>
        </div>
      )}

      {/* ── 12. BENEFITS ── */}
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

      {/* ── 13. APP DOWNLOAD ── */}
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
              <button className="store-btn" onClick={() => nav('/food')}>
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

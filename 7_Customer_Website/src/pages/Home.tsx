import { useMemo, useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  CATEGORIES,
  GROCERY_AISLES,
  MOODS,
  STOREFRONTS,
  PROMO_OFFERS,
  FOOD_MENU_CATS,
  readSeen,
} from '../data/catalog';
import { useShop } from '../store';
import { useDeliveryLocation } from '../components/location-context';
import FoodCard from '../components/FoodCard';
import OfferCard from '../components/OfferCard';

const BENEFITS = [
  { emoji: '⚡', bg: '#FFF4D6', title: 'Fast Delivery', text: 'Hot & fresh at your door in minutes' },
  { emoji: '🛡️', bg: '#E7F6EC', title: 'Safe & Secure', text: 'Trusted payments, every single order' },
  { emoji: '🥬', bg: '#E7F6EC', title: 'Fresh & Quality', text: 'Picked daily, quality-checked' },
  { emoji: '💰', bg: '#FFF4D6', title: 'Great Prices', text: 'Local rates, honest bills' },
  { emoji: '❤️', bg: '#FDECEA', title: 'Support Local', text: 'Every order helps your community' },
];

export default function Home() {
  const { allItems, priceOf, mrpOf, user, favs, livePromos } = useShop();
  // Live admin promos first, then static fallback cards
  const hotDeals = useMemo(
    () => [...livePromos.slice(0, 3), ...PROMO_OFFERS].slice(0, 3),
    [livePromos],
  );
  const allDeals = useMemo(
    () => [...livePromos, ...PROMO_OFFERS.filter((s) => !livePromos.some((l) => l.code === s.code))],
    [livePromos],
  );
  const { city, area, setLocOpen } = useDeliveryLocation();
  const nav = useNavigate();
  const [heroQ, setHeroQ] = useState('');

  const submitHeroSearch = (e: FormEvent) => {
    e.preventDefault();
    if (!user) {
      nav('/login');
      return;
    }
    const query = heroQ.trim();
    nav(query ? `/grocery?q=${encodeURIComponent(query)}` : '/grocery');
  };

  // ── Discovery rails — all computed from REAL catalog + live prices ──
  // Prepared-food menu items are excluded from every display rail (frontend only).
  const menuItems = useMemo(
    () => allItems.filter((c) => !FOOD_MENU_CATS.has(c.category)),
    [allItems],
  );

  const categoryMap = useMemo(() => {
    const map = new Map<string, typeof menuItems>();
    for (const item of menuItems) {
      const list = map.get(item.category) ?? [];
      list.push(item);
      map.set(item.category, list);
    }
    return map;
  }, [menuItems]);

  const activeCategories = useMemo(() => {
    return CATEGORIES.filter(
      (c) => c.key !== 'all' && (categoryMap.get(c.key)?.length ?? 0) > 0,
    ).map((c) => ({
      ...c,
      items: categoryMap.get(c.key) ?? [],
    }));
  }, [categoryMap]);

  const availableAisles = useMemo(
    () => GROCERY_AISLES.filter((c) => (categoryMap.get(c.key)?.length ?? 0) > 0),
    [categoryMap],
  );
  const bestValue = useMemo(
    () =>
      menuItems
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
    [menuItems, priceOf, mrpOf],
  );
  const favItems = useMemo(
    () => menuItems.filter((c) => favs.has(c.id)),
    [menuItems, favs],
  );
  const becauseYouOrdered = useMemo(() => {
    const seen = readSeen();
    if (seen.length === 0) return [];
    const seenCats = new Set(
      seen
        .map((id) => menuItems.find((c) => c.id === id)?.category)
        .filter((c): c is string => Boolean(c)),
    );
    return menuItems
      .filter((c) => seenCats.has(c.category) && !seen.includes(c.id))
      .sort((a, b) => b.rating - a.rating)
      .slice(0, 8);
  }, [menuItems]);
  const moodCounts = useMemo(() => {
    const m = new Map<string, number>();
    for (const mood of MOODS) {
      m.set(mood.key, allItems.filter((c) => mood.cats.includes(c.category)).length);
    }
    return m;
  }, [allItems]);

  // Screenshot-style category tiles — every tile routes to REAL catalog
  // categories via the existing /grocery?cat= filter. No backend change.
  const shotCats = [
    { key: 'all', label: 'Meals', emoji: '🍛' },
    { key: 'vegetables', label: 'Vegetables', emoji: '🥬' },
    { key: 'grocery', label: 'Groceries', emoji: '🛒' },
    { key: 'dairy', label: 'Beverages', emoji: '🥤' },
  ];

  return (
    <div className="page-enter">
      {/* ── SCREENSHOT HERO — "Good Food Brighter Days" ── */}
      <section className="fms-hero" aria-label="FoodMela hero">
        <div className="fms-hero-inner">
          <div className="fms-hero-left">
            <p className="fms-script">From Our Kitchen to Your Home</p>
            <h1>
              Good Food<br />
              <span className="fms-hi">Brighter Days</span>
            </h1>
            <p className="fms-hero-sub">
              Fresh, healthy meals delivered to your doorstep — local, fresh &amp; trusted.
            </p>
            <form className="fms-hero-search" onSubmit={submitHeroSearch} role="search">
              <span className="fms-pin" aria-hidden="true">📍</span>
              <button type="button" className="fms-area" onClick={() => setLocOpen(true)} aria-label={`Delivery area: ${area}, ${city}. Change area`}>
                {area}, {city} ▾
              </button>
              <span className="fms-div" aria-hidden="true" />
              <input
                value={heroQ}
                onChange={(e) => setHeroQ(e.target.value)}
                placeholder="Search for meals, vegetables..."
                aria-label="Search for meals, vegetables"
              />
              <button type="submit" className="fms-go" aria-label="Search">🔍</button>
            </form>
            <div className="fms-cat-row" role="list" aria-label="Shop by category">
              {shotCats.map((c) => (
                <button
                  key={c.key}
                  role="listitem"
                  className="fms-cat"
                  onClick={() => {
                    if (!user) { nav('/login'); return; }
                    nav(c.key === 'all' ? '/grocery' : `/grocery?cat=${c.key}`);
                  }}
                >
                  <span className="fms-cat-ico" aria-hidden="true">{c.emoji}</span>
                  <span>{c.label}</span>
                </button>
              ))}
            </div>
          </div>
          <div className="fms-hero-right" aria-hidden="true">
            <div className="fms-blob" />
            <img src="/hero-rider.jpg" alt="" className="fms-rider" loading="eager" />
            <div className="fms-float fms-f1">⚡ 15–25 min delivery</div>
            <div className="fms-float fms-f2">🥬 Farm fresh daily</div>
          </div>
        </div>
        <div className="fms-trust" role="list" aria-label="Why FoodMela">
          <div role="listitem"><span aria-hidden="true">🍽️</span><strong>Wide Variety</strong></div>
          <div role="listitem"><span aria-hidden="true">🥬</span><strong>Fresh &amp; Quality</strong></div>
          <div role="listitem"><span aria-hidden="true">🛵</span><strong>Fast Delivery</strong></div>
          <div role="listitem"><span aria-hidden="true">🛡️</span><strong>Safe &amp; Secure</strong></div>
        </div>
      </section>

      <div className="section" style={{ paddingTop: 14, paddingBottom: 6 }}>
        {/* ── LIVE ANIMATED RUNNING TICKER (2D) ── */}
        <div className="live-ticker-wrap" aria-label="Live announcements">
          <div className="live-ticker-track">
            <div className="live-ticker-item"><span>⚡</span> 15–25 Mins Express Delivery in Birmaharajpur</div>
            <div className="live-ticker-dot">•</div>
            <div className="live-ticker-item"><span>🥦</span> 100% Farm Fresh Mandi Produce Daily</div>
            <div className="live-ticker-dot">•</div>
            <div className="live-ticker-item"><span>🛵</span> FREE Delivery on orders above ₹299</div>
            <div className="live-ticker-dot">•</div>
            <div className="live-ticker-item"><span>🏷️</span> Use Festive Coupons for Flat 50% OFF</div>
            <div className="live-ticker-dot">•</div>
            <div className="live-ticker-item"><span>💵</span> COD (≤ ₹100) &amp; Instant UPI Accepted</div>
            <div className="live-ticker-dot">•</div>
            <div className="live-ticker-item"><span>🛡️</span> Tamper-Proof Hygienic Packaging with Delivery OTP</div>
            <div className="live-ticker-dot">•</div>
            {/* Seamless continuous loop duplicate */}
            <div className="live-ticker-item"><span>⚡</span> 15–25 Mins Express Delivery in Birmaharajpur</div>
            <div className="live-ticker-dot">•</div>
            <div className="live-ticker-item"><span>🥦</span> 100% Farm Fresh Mandi Produce Daily</div>
            <div className="live-ticker-dot">•</div>
            <div className="live-ticker-item"><span>🛵</span> FREE Delivery on orders above ₹299</div>
            <div className="live-ticker-dot">•</div>
            <div className="live-ticker-item"><span>🏷️</span> Use Festive Coupons for Flat 50% OFF</div>
            <div className="live-ticker-dot">•</div>
            <div className="live-ticker-item"><span>💵</span> COD (≤ ₹100) &amp; Instant UPI Accepted</div>
            <div className="live-ticker-dot">•</div>
            <div className="live-ticker-item"><span>🛡️</span> Tamper-Proof Hygienic Packaging with Delivery OTP</div>
            <div className="live-ticker-dot">•</div>
          </div>
        </div>
      </div>

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
              {hotDeals.map((o) => (
                <OfferCard key={o.code} offer={o} />
              ))}
            </div>
          </div>

          {/* ── WHAT'S YOUR MOOD? — hidden for now (restore by removing this false) ── */}
          {false && (
          <div className="section">
            <div className="section-head">
              <div>
                <h2>What&apos;s your <span className="accent">mood?</span></h2>
                <p>Six cravings, one neighbourhood — pick yours</p>
              </div>
              <span className="link-more" onClick={() => nav('/grocery')}>View all →</span>
            </div>
            <div className="mood-grid" role="list">
              {MOODS.map((m, i) => (
                <button
                  key={m.key}
                  role="listitem"
                  className={`mood-card mood-${i} reveal reveal-${Math.min(i, 4)}`}
                  onClick={() => nav(`/grocery?mood=${m.key}`)}
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
          )}

          {/* ── MADE AROUND YOU — hidden for now (restore by removing this false) ── */}
          {false && (
          <div className="section">
            <div className="local-band">
              <h2>Made <span className="accent">around you</span></h2>
              <p>Nearby kitchens &amp; stores in {city} — live menus, community favourites, honest prices.</p>
              <div className="local-scroll" role="list">
                {STOREFRONTS.map((s) => {
                  const items = allItems.filter((c) => c.category === s.key);
                  const top = items.reduce((m, c) => Math.max(m, c.rating), 0);
                  return (
                    <div key={s.key} role="listitem" className="local-card" onClick={() => nav(`/grocery?cat=${s.key}`)} tabIndex={0}
                      onKeyDown={(e) => { if (e.key === 'Enter') nav(`/grocery?cat=${s.key}`); }}
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
          )}

          {/* ── SHOP BY CATEGORY ── */}
          <div className="section" style={{ paddingBottom: 6 }}>
            <div className="section-head">
              <div>
                <h2>Shop by <span className="accent">Category</span></h2>
                <p>Explore farm-fresh produce &amp; grocery essentials</p>
              </div>
              <span className="link-more" onClick={() => nav('/grocery')}>
                All Products ({menuItems.length}) →
              </span>
            </div>
            <div className="cat-circle-row" role="list">
              {availableAisles.map((c) => (
                <button
                  key={c.key}
                  role="listitem"
                  className="cat-circle"
                  onClick={() => nav(`/grocery?cat=${c.key}`)}
                  aria-label={`Shop ${c.label}`}
                  title={c.blurb}
                >
                  <span className="cc-img">
                    <img src={c.image} alt={c.label} loading="lazy" />
                  </span>
                  <span>{c.emoji} {c.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* ── ALL ITEMS IN CATEGORIES ── */}
          {activeCategories.map((catSec) => (
            <div className="section" key={catSec.key} id={`cat-${catSec.key}`}>
              <div className="section-head">
                <div>
                  <h2>
                    {catSec.icon} {catSec.label}{' '}
                    <span className="cat-badge" style={{ marginLeft: 8, verticalAlign: 'middle' }}>
                      {catSec.items.length} items
                    </span>
                  </h2>
                  <p>Fresh {catSec.label.toLowerCase()} available for delivery</p>
                </div>
                <span className="link-more" onClick={() => nav(`/grocery?cat=${catSec.key}`)}>
                  View all {catSec.label} →
                </span>
              </div>
              <div className="h-scroll">
                {catSec.items.map((item) => (
                  <FoodCard key={item.id} item={item} />
                ))}
              </div>
            </div>
          ))}

          {/* ── BEST VALUE TODAY (if any) ── */}
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

          {/* ── TODAY'S MELa PICKS (offers) ── */}
          <div className="section" id="offers">
            <div className="section-head">
              <div>
                <h2>Today&apos;s <span className="accent">picks</span></h2>
                <p>Local love deals + festival specials</p>
              </div>
              <span className="link-more" onClick={() => nav('/offers')}>All offers →</span>
            </div>
            <div className="ticket-grid">
              {allDeals.map((o) => (
                <OfferCard key={o.code} offer={o} />
              ))}
            </div>
          </div>

          {/* ── YOUR MELa FAVOURITES ── */}
          {favItems.length > 0 && (
            <div className="section">
              <div className="section-head">
                <div>
                  <h2>Your <span className="accent-chili">favourites</span></h2>
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
                  <p>More from the stores you love</p>
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
            <h2>Log in to enter the <span className="accent">mela</span></h2>
            <p>Sign in with your mobile number to explore fresh dishes, live prices, and order online in Birmaharajpur.</p>
            <button className="btn-primary" onClick={() => nav('/login')}>
              Login with Phone to View Menu →
            </button>
          </div>
        </div>
      )}

      {/* ── HOW FOODMELA WORKS (screenshot band) ── */}
      <div className="section">
        <div className="fms-how">
          <h2>How FoodMela Works</h2>
          <p className="fms-how-sub">Delicious food is just a few clicks away.</p>
          <div className="fms-steps" role="list">
            <div className="fms-step" role="listitem">
              <span className="fms-step-n">1</span>
              <span className="fms-step-ico" aria-hidden="true">📍</span>
              <strong>Choose your area</strong>
              <small>Pick {area}, {city} &amp; browse fresh picks</small>
            </div>
            <div className="fms-step" role="listitem">
              <span className="fms-step-n">2</span>
              <span className="fms-step-ico" aria-hidden="true">🛒</span>
              <strong>Place your order</strong>
              <small>Few clicks, COD &amp; UPI accepted</small>
            </div>
            <div className="fms-step" role="listitem">
              <span className="fms-step-n">3</span>
              <span className="fms-step-ico" aria-hidden="true">🛵</span>
              <strong>Fast doorstep delivery</strong>
              <small>Hot &amp; fresh in 15–25 mins</small>
            </div>
          </div>
          <div className="benefit-grid" style={{ marginTop: 18 }}>
            {BENEFITS.map((b) => (
              <div key={b.title} className="benefit-card">
                <div className="b-ico" style={{ background: b.bg }} aria-hidden="true">{b.emoji}</div>
                <strong>{b.title}</strong>
                <small>{b.text}</small>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── DOWNLOAD OUR APP — direct APK (v3, PayU prepaid inside) ── */}
      <div className="section" id="app">
        <div className="app-band">
          <div>
            <h2>Download Our Apps</h2>
            <p>Your favourite food is just a tap away — faster ordering, live rider tracking, secure UPI payments &amp; exclusive app-only deals.</p>
            <div className="store-row">
              <Link
                className="store-btn"
                to="/apk"
              >
                <span className="s-ico" aria-hidden="true">📱</span>
                <span><small>CUSTOMER APP</small><strong>FoodMela APK</strong></span>
              </Link>
              <Link
                className="store-btn"
                to="/rider"
              >
                <span className="s-ico" aria-hidden="true">🚴‍♂️</span>
                <span><small>DELIVERY PARTNER</small><strong>Rider App APK</strong></span>
              </Link>
              <button className="store-btn" onClick={() => nav(user ? '/grocery' : '/login')}>
                <span className="s-ico" aria-hidden="true">🌐</span>
                <span><small>OR CONTINUE ON</small><strong>foodmela.online</strong></span>
              </button>
            </div>
            <div className="qr-hint">📱 Android · Free · No Play Store needed · v3 with online payments</div>
          </div>
        </div>
      </div>
    </div>
  );
}

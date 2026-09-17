import { useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { CATEGORIES, GROCERY_AISLES } from '../data/catalog';
import { useShop } from '../store';
import FoodCard from '../components/FoodCard';

const GROCERY_CATS = new Set(['vegetables', 'fruits', 'grocery', 'dairy', 'eggs_meat']);

export default function Grocery() {
  const { allItems } = useShop();
  const [params] = useSearchParams();
  const [cat, setCat] = useState(params.get('cat') || 'all');
  const [q, setQ] = useState(params.get('q') || '');

  const groceryItems = useMemo(
    () => allItems.filter((c) => GROCERY_CATS.has(c.category)),
    [allItems],
  );

  const categoryMap = useMemo(() => {
    const map = new Map<string, typeof groceryItems>();
    for (const item of groceryItems) {
      const list = map.get(item.category) ?? [];
      list.push(item);
      map.set(item.category, list);
    }
    return map;
  }, [groceryItems]);

  const availableCats = useMemo(
    () => CATEGORIES.filter((c) => c.key === 'all' || (categoryMap.get(c.key)?.length ?? 0) > 0),
    [categoryMap],
  );

  const availableAisles = useMemo(
    () => GROCERY_AISLES.filter((c) => (categoryMap.get(c.key)?.length ?? 0) > 0),
    [categoryMap],
  );

  const groupedSections = useMemo(() => {
    const s = q.toLowerCase().trim();
    const sections: { key: string; label: string; icon: string; items: typeof groceryItems }[] = [];

    for (const c of CATEGORIES) {
      if (c.key === 'all') continue;
      if (cat !== 'all' && cat !== c.key) continue;

      const catItems = categoryMap.get(c.key) ?? [];
      const filtered = s ? catItems.filter((item) => item.name.toLowerCase().includes(s)) : catItems;

      if (filtered.length > 0) {
        sections.push({
          key: c.key,
          label: c.label,
          icon: c.icon,
          items: filtered,
        });
      }
    }
    return sections;
  }, [categoryMap, cat, q]);

  const totalMatches = useMemo(
    () => groupedSections.reduce((sum, sec) => sum + sec.items.length, 0),
    [groupedSections],
  );

  const selectedCatObj = useMemo(
    () => CATEGORIES.find((c) => c.key === cat),
    [cat],
  );

  return (
    <div className="page-enter">
      <div className="mela-pagehead">
        <div className="mela-pagehead-inner">
          <h1>Fresh for <span className="accent">your home</span></h1>
          <p>Farm-fresh vegetables, seasonal fruits &amp; daily grocery staples — neatly organized in categories.</p>
        </div>
      </div>

      <div className="section">
        {/* Category Aisles (Circular row) */}
        <div className="cat-circle-row" role="list">
          {availableAisles.map((c) => (
            <button
              key={c.key}
              role="listitem"
              className={`cat-circle ${cat === c.key ? 'on' : ''}`}
              onClick={() => setCat(cat === c.key ? 'all' : c.key)}
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

        {/* Filter & Search bar */}
        <div className="filter-bar" style={{ marginTop: 8 }}>
          <div className="search-bar">
            <span aria-hidden="true">🔍</span>
            <input
              placeholder="Search vegetables, fruits, rice..."
              value={q}
              onChange={(e) => setQ(e.target.value)}
              aria-label="Search groceries"
            />
          </div>
        </div>

        {/* Category Chips */}
        <div className="cat-row">
          {availableCats.map((c) => (
            <button
              key={c.key}
              className={`cat-chip ${cat === c.key ? 'on' : ''}`}
              onClick={() => setCat(c.key)}
            >
              {c.icon} {c.label}
              {c.key !== 'all' && (
                <small style={{ opacity: 0.7, marginLeft: 2 }}>
                  ({categoryMap.get(c.key)?.length ?? 0})
                </small>
              )}
            </button>
          ))}
        </div>

        {/* Single category selected banner */}
        {cat !== 'all' && selectedCatObj && (
          <div className="cat-selected-banner" style={{ marginTop: 14 }}>
            <div className="cat-selected-info">
              <span className="cs-icon" aria-hidden="true">{selectedCatObj.icon}</span>
              <div>
                <h2>{selectedCatObj.label}</h2>
                <p>{totalMatches} {totalMatches === 1 ? 'product' : 'products'} available</p>
              </div>
            </div>
            <button className="cat-reset-btn" onClick={() => setCat('all')}>
              ← Show All Categories
            </button>
          </div>
        )}

        {/* Total products count indicator */}
        {cat === 'all' && (
          <p style={{ fontSize: 13, color: '#66707D', margin: '14px 0 18px' }}>
            {totalMatches} products across {groupedSections.length} categories
          </p>
        )}

        {/* Grouped Category Sections */}
        {groupedSections.length === 0 ? (
          <div className="mela-empty">
            <div className="mela-empty-icon">🧺</div>
            <h3>No products found</h3>
            <p>
              {q ? `No items matching "${q}" found.` : 'No products available in this category right now.'}
            </p>
            {(cat !== 'all' || q) && (
              <button
                className="btn-ghost"
                style={{ marginTop: 16 }}
                onClick={() => { setCat('all'); setQ(''); }}
              >
                Clear Filters
              </button>
            )}
          </div>
        ) : (
          groupedSections.map((sec) => (
            <section key={sec.key} className="cat-block">
              <div className="cat-block-head">
                <div className="cat-block-title">
                  <span className="cb-icon" aria-hidden="true">{sec.icon}</span>
                  <h3>{sec.label}</h3>
                  <span className="cat-badge">{sec.items.length} items</span>
                </div>
                {cat === 'all' && (
                  <button
                    className="cat-view-btn"
                    onClick={() => setCat(sec.key)}
                    aria-label={`View all ${sec.label}`}
                  >
                    View only {sec.label} →
                  </button>
                )}
              </div>
              <div className="food-grid">
                {sec.items.map((item) => (
                  <FoodCard key={item.id} item={item} />
                ))}
              </div>
            </section>
          ))
        )}
      </div>
    </div>
  );
}

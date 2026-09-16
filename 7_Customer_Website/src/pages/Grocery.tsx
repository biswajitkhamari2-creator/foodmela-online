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

  const groceryItems = useMemo(() => allItems.filter((c) => GROCERY_CATS.has(c.category)), [allItems]);

  const items = useMemo(() => {
    const s = q.toLowerCase().trim();
    return groceryItems.filter((c) => {
      if (cat !== 'all' && c.category !== cat) return false;
      if (s && !c.name.toLowerCase().includes(s)) return false;
      return true;
    });
  }, [cat, q, groceryItems]);

  const cats = CATEGORIES.filter((c) => c.key === 'all' || GROCERY_CATS.has(c.key));

  return (
    <div className="page-enter">
      <div className="mela-pagehead">
        <div className="mela-pagehead-inner">
          <h1>Fresh for <span className="accent">your home</span></h1>
          <p>Vegetables, fruits, dairy &amp; staples — one mela, everything fresh, picked daily.</p>
        </div>
      </div>
      <div className="section">
        <div className="cat-circle-row" role="list">
          {GROCERY_AISLES.map((c) => (
            <button
              key={c.key}
              role="listitem"
              className={`cat-circle ${cat === c.key ? 'on' : ''}`}
              onClick={() => setCat(cat === c.key ? 'all' : c.key)}
              aria-label={`Shop ${c.label}`}
              title={c.blurb}
            >
              <span className="cc-img"><img src={c.image} alt={c.label} loading="lazy" /></span>
              <span>{c.emoji} {c.label}</span>
            </button>
          ))}
        </div>
        <div className="filter-bar" style={{ marginTop: 8 }}>
          <div className="search-bar">
            <span aria-hidden="true">🔍</span>
            <input
              placeholder="Search milk, rice, tomato..."
              value={q}
              onChange={(e) => setQ(e.target.value)}
              aria-label="Search groceries"
            />
          </div>
        </div>
        <div className="cat-row">
          {cats.map((c) => (
            <button key={c.key} className={`cat-chip ${cat === c.key ? 'on' : ''}`} onClick={() => setCat(c.key)}>
              {c.icon} {c.label}
            </button>
          ))}
        </div>
        <p style={{ fontSize: 13, color: '#66707D', marginBottom: 14 }}>{items.length} products</p>
        {items.length === 0 ? (
          <div className="mela-empty">
            <div className="mela-empty-icon">🧺</div>
            <h3>Your basket is empty here</h3>
            <p>Try a different search or aisle — fresh stock arrives daily.</p>
          </div>
        ) : (
          <div className="food-grid">
            {items.map((item) => (
              <FoodCard key={item.id} item={item} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

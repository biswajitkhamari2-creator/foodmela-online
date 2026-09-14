import { useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { CATEGORIES } from '../data/catalog';
import { useShop } from '../store';
import FoodCard from '../components/FoodCard';

const FOOD_CATS = new Set(['cooked_food', 'non_veg', 'sweets', 'snacks']);

export default function Food() {
  const { allItems } = useShop();
  const [params] = useSearchParams();
  const [cat, setCat] = useState(params.get('cat') || 'all');
  const [q, setQ] = useState(params.get('q') || '');
  const [vegOnly, setVegOnly] = useState(false);

  const foodItems = useMemo(() => allItems.filter((c) => FOOD_CATS.has(c.category)), [allItems]);

  const items = useMemo(() => {
    const s = q.toLowerCase().trim();
    return foodItems.filter((c) => {
      if (cat !== 'all' && c.category !== cat) return false;
      if (vegOnly && !c.isVeg) return false;
      if (s && !c.name.toLowerCase().includes(s)) return false;
      return true;
    });
  }, [cat, q, vegOnly, foodItems]);

  const cats = CATEGORIES.filter((c) => c.key === 'all' || FOOD_CATS.has(c.key));

  return (
    <div className="page-enter">
      <div className="page-hero">
        <div className="page-hero-inner">
          <h1>Order <span className="accent">food</span> online</h1>
          <p>Biryani, curries, sweets &amp; snacks — cooked fresh by local kitchens in Birmaharajpur.</p>
        </div>
      </div>
      <div className="section">
        <div className="filter-bar">
          <div className="search-bar">
            <span aria-hidden="true">🔍</span>
            <input
              placeholder="Search for biryani, pizza, burgers..."
              value={q}
              onChange={(e) => setQ(e.target.value)}
              aria-label="Search food"
            />
          </div>
          <button className={`cat-chip ${vegOnly ? 'veg-on' : ''}`} onClick={() => setVegOnly(!vegOnly)} aria-pressed={vegOnly}>
            🟢 Veg only
          </button>
        </div>
        <div className="cat-row">
          {cats.map((c) => (
            <button key={c.key} className={`cat-chip ${cat === c.key ? 'on' : ''}`} onClick={() => setCat(c.key)}>
              {c.icon} {c.label}
            </button>
          ))}
        </div>
        <p style={{ fontSize: 13, color: '#66707D', marginBottom: 14 }}>{items.length} dishes</p>
        {items.length === 0 ? (
          <div className="empty">
            <div className="empty-icon">🍛</div>
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
    </div>
  );
}

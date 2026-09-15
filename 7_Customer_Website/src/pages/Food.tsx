import { useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { CATEGORIES, MOODS } from '../data/catalog';
import { useShop } from '../store';
import FoodCard from '../components/FoodCard';

const FOOD_CATS = new Set(['cooked_food', 'non_veg', 'sweets', 'snacks']);

export default function Food() {
  const { allItems } = useShop();
  const [params] = useSearchParams();
  const [cat, setCat] = useState(params.get('cat') || 'all');
  const [q, setQ] = useState(params.get('q') || '');
  const [vegOnly, setVegOnly] = useState(false);
  const moodKey = params.get('mood') || '';
  const mood = MOODS.find((m) => m.key === moodKey);

  const foodItems = useMemo(() => allItems.filter((c) => FOOD_CATS.has(c.category)), [allItems]);

  const items = useMemo(() => {
    const s = q.toLowerCase().trim();
    return foodItems.filter((c) => {
      if (mood && !mood.cats.includes(c.category)) return false;
      if (cat !== 'all' && c.category !== cat) return false;
      if (vegOnly && !c.isVeg) return false;
      if (s && !c.name.toLowerCase().includes(s)) return false;
      return true;
    });
  }, [cat, q, vegOnly, foodItems, mood]);

  const cats = CATEGORIES.filter((c) => c.key === 'all' || FOOD_CATS.has(c.key));

  return (
    <div className="page-enter">
      <div className="mela-pagehead">
        <div className="mela-pagehead-inner">
          <h1>
            {mood ? (
              <>{mood.emoji} {mood.title}</>
            ) : (
              <>Order <span className="accent">food</span> online</>
            )}
          </h1>
          <p>
            {mood
              ? `${mood.blurb} — ${items.length} dishes from your neighbourhood mela.`
              : 'Biryani, curries, sweets & snacks — cooked fresh by local kitchens in Birmaharajpur.'}
          </p>
        </div>
      </div>
      <div className="section">
        <div className="filter-bar">
          <div className="search-bar">
            <span aria-hidden="true">🔍</span>
            <input
              placeholder="Find your favourite food..."
              value={q}
              onChange={(e) => setQ(e.target.value)}
              aria-label="Find your favourite food"
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
        <p style={{ fontSize: 13, color: '#68756E', marginBottom: 14 }}>{items.length} dishes</p>
        {items.length === 0 ? (
          <div className="mela-empty">
            <div className="mela-empty-icon">🍽️</div>
            <h3>No cravings here yet</h3>
            <p>Try a different search or craving — the mela has plenty more.</p>
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

import { useShop } from '../store';
import type { CatalogItem } from '../data/catalog';

// Presentation-only delivery hints per category (frontend copy, not backend data).
const ETA: Record<string, string> = {
  cooked_food: '25–30 min',
  non_veg: '30–35 min',
  sweets: '20–25 min',
  snacks: '15–20 min',
  vegetables: '20–30 min',
  fruits: '20–30 min',
  grocery: '25–35 min',
  dairy: '20–30 min',
  eggs_meat: '25–35 min',
};

export default function FoodCard({ item }: { item: CatalogItem }) {
  const { cart, addToCart, removeFromCart, priceOf, mrpOf } = useShop();
  const qty = cart.get(item.id) ?? 0;
  const price = priceOf(item);
  const mrp = mrpOf(item);
  const off = mrp ? Math.round(((mrp - price) / mrp) * 100) : 0;

  return (
    <article className="food-card">
      <div className="food-img">
        <img src={item.image} alt={item.name} loading="lazy" />
        <span
          className={`veg-mark ${item.isVeg ? '' : 'nonveg'}`}
          title={item.isVeg ? 'Vegetarian' : 'Non-vegetarian'}
          aria-label={item.isVeg ? 'Veg' : 'Non-veg'}
        >
          <i aria-hidden="true" />
        </span>
        <span className={`rating-pill ${item.rating < 4.5 ? 'low' : ''}`}>
          <span aria-hidden="true">★</span> {item.rating.toFixed(1)}
        </span>
        {off > 0 && <span className="off-ribbon">{off}% OFF</span>}
      </div>
      <div className="food-body">
        <div className="food-cat">{item.categoryLabel}</div>
        <h3>{item.name}</h3>
        <div className="food-meta">
          🛵 {ETA[item.category] ?? '~30 min'} · Free delivery over ₹299
        </div>
        <div className="price-row">
          <span className="price">₹{price}</span>
          {mrp && <span className="mrp">₹{mrp}</span>}
          {off > 0 && <span className="off-badge">{off}% off</span>}
        </div>
        <div className="add-row">
          {qty === 0 ? (
            <button className="add-btn" onClick={() => addToCart(item.id)} aria-label={`Add ${item.name} to cart`}>
              ADD +
            </button>
          ) : (
            <div className="qty-ctl">
              <button onClick={() => removeFromCart(item.id)} aria-label={`Remove one ${item.name}`}>−</button>
              <strong aria-live="polite">{qty}</strong>
              <button onClick={() => addToCart(item.id)} aria-label={`Add one more ${item.name}`}>+</button>
            </div>
          )}
        </div>
      </div>
    </article>
  );
}

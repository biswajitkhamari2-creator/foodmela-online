import { useShop } from '../store';
import { ITEM_DESCRIPTIONS, pushSeen, type CatalogItem } from '../data/catalog';

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

/**
 * Signature "Thali" plate card — circular dish portrait, veg mark,
 * favourite heart, rating, price + ADD stepper.
 * ADD uses the EXISTING cart (addToCart/removeFromCart) — logic untouched.
 */
export default function FoodCard({ item }: { item: CatalogItem }) {
  const { cart, addToCart, removeFromCart, priceOf, mrpOf, isFav, toggleFav } = useShop();
  const qty = cart.get(item.id) ?? 0;
  const price = priceOf(item);
  const mrp = mrpOf(item);
  const off = mrp ? Math.round(((mrp - price) / mrp) * 100) : 0;
  const fav = isFav(item.id);
  const desc = ITEM_DESCRIPTIONS[item.id];

  const add = () => {
    pushSeen(item.id);
    addToCart(item.id);
  };

  return (
    <article className="thali">
      <div className="thali-plate">
        <img src={item.image} alt={item.name} loading="lazy" />
        <span
          className={`veg-mark ${item.isVeg ? '' : 'nonveg'}`}
          title={item.isVeg ? 'Vegetarian' : 'Non-vegetarian'}
          aria-label={item.isVeg ? 'Veg' : 'Non-veg'}
        >
          <i aria-hidden="true" />
        </span>
        <button
          className={`thali-fav ${fav ? 'on' : ''}`}
          onClick={() => toggleFav(item.id)}
          aria-label={fav ? `Remove ${item.name} from favourites` : `Save ${item.name} to favourites`}
          aria-pressed={fav}
          title="Your Favourites"
        >
          {fav ? '❤️' : '🤍'}
        </button>
        {off > 0 && <span className="thali-off">{off}% OFF</span>}
      </div>
      <div className="thali-body">
        <div className="thali-cat">{item.categoryLabel}</div>
        <h3>{item.name}</h3>
        {desc && <p className="thali-desc">{desc}</p>}
        <div className="thali-rate">
          <span className={`stars ${item.rating < 4.5 ? 'low' : ''}`}>★ {item.rating.toFixed(1)}</span>
          <span>🛵 {ETA[item.category] ?? '~30 min'}</span>
        </div>
        <div className="price-row">
          <span className="price">₹{price}</span>
          {mrp && <span className="mrp">₹{mrp}</span>}
          {off > 0 && <span className="off-badge">{off}% off</span>}
        </div>
        <div className="add-row">
          {qty === 0 ? (
            <button className="add-btn" onClick={add} aria-label={`Add ${item.name} to cart`}>
              ADD +
            </button>
          ) : (
            <div className="qty-ctl">
              <button onClick={() => removeFromCart(item.id)} aria-label={`Remove one ${item.name}`}>−</button>
              <strong aria-live="polite" key={qty}>{qty}</strong>
              <button onClick={add} aria-label={`Add one more ${item.name}`}>+</button>
            </div>
          )}
        </div>
      </div>
    </article>
  );
}

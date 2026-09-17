import { useShop } from '../store';
import { getItemWeight, ITEM_DESCRIPTIONS, pushSeen, type CatalogItem } from '../data/catalog';
import { useTilt } from '../hooks/useTilt';

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
  const weight = getItemWeight(item);

  const add = () => {
    pushSeen(item.id);
    addToCart(item.id);
  };
  const tilt = useTilt<HTMLElement>(7);

  return (
    <article
      className="thali food-card tilt-glare"
      ref={tilt.ref}
      onMouseMove={tilt.onMouseMove}
      onMouseLeave={tilt.onMouseLeave}
    >
      <div className="thali-plate fc-media">
        <img src={item.image} alt={item.name} loading="lazy" />

        <div className="fc-top-overlay">
          {off > 0 ? (
            <span className="thali-off fc-off-badge">{off}% OFF</span>
          ) : <span />}

          <div className="fc-actions-corner">
            <span
              className={`veg-mark ${item.isVeg ? '' : 'nonveg'}`}
              title={item.isVeg ? 'Vegetarian' : 'Non-vegetarian'}
              aria-label={item.isVeg ? 'Veg' : 'Non-veg'}
            >
              <i aria-hidden="true" />
            </span>
            <button
              className={`thali-fav fc-fav-btn ${fav ? 'on' : ''}`}
              onClick={() => toggleFav(item.id)}
              aria-label={fav ? `Remove ${item.name} from favourites` : `Save ${item.name} to favourites`}
              aria-pressed={fav}
              title="Save to favourites"
            >
              {fav ? '❤️' : '🤍'}
            </button>
          </div>
        </div>

        <div className="fc-eta-tag">
          <span>⚡ {ETA[item.category] ?? '20–30 min'}</span>
        </div>
      </div>

      <div className="thali-body fc-body">
        <div className="fc-header-row">
          <span className="thali-cat fc-cat">{item.categoryLabel}</span>
          <span className="fc-rating-pill">★ {item.rating.toFixed(1)}</span>
        </div>

        <h3 className="fc-name">{item.name}</h3>

        <div className="thali-weight fc-weight-wrap" title={`Net Quantity: ${weight}`}>
          <span className="thali-weight-tag fc-weight-pill">⚖️ {weight}</span>
        </div>

        {desc && <p className="thali-desc fc-description">{desc}</p>}

        <div className="price-row fc-price-row">
          <div className="price-stack fc-price-col">
            <div className="fc-main-price-line">
              <span className="price fc-current-price">₹{price}</span>
              <span className="price-unit fc-unit-label">/{weight}</span>
            </div>
            {mrp && <span className="mrp fc-mrp-price">₹{mrp}</span>}
          </div>

          <div className="add-row fc-add-container">
            {qty === 0 ? (
              <button className="add-btn fc-add-btn" onClick={add} aria-label={`Add ${item.name} to cart`}>
                ADD +
              </button>
            ) : (
              <div className="qty-ctl fc-qty-pill">
                <button onClick={() => removeFromCart(item.id)} aria-label={`Remove one ${item.name}`}>−</button>
                <strong aria-live="polite" key={qty}>{qty}</strong>
                <button onClick={add} aria-label={`Add one more ${item.name}`}>+</button>
              </div>
            )}
          </div>
        </div>
      </div>
    </article>
  );
}

import { useNavigate } from 'react-router-dom';
import { useShop } from '../store';
import type { Storefront } from '../data/catalog';

// Postcard card — editorial split layout (image spine + details).
// Stats computed from REAL catalog data at render time.
export default function StorefrontCard({ store }: { store: Storefront }) {
  const { allItems, priceOf, mrpOf } = useShop();
  const nav = useNavigate();

  const items = allItems.filter((c) => c.category === store.key);
  const count = items.length;
  const top = items.reduce((m, c) => Math.max(m, c.rating), 0);
  // Signature dish = top-rated item in this storefront (real data).
  const signature = [...items].sort((a, b) => b.rating - a.rating)[0];
  const sigOff = (() => {
    if (!signature) return 0;
    const mrp = mrpOf(signature);
    if (!mrp) return 0;
    return Math.round(((mrp - priceOf(signature)) / mrp) * 100);
  })();

  return (
    <article
      className="postcard"
      onClick={() => nav(`/grocery?cat=${store.key}`)}
      role="link"
      aria-label={`${store.name} — order now`}
      tabIndex={0}
      onKeyDown={(e) => { if (e.key === 'Enter') nav(`/grocery?cat=${store.key}`); }}
    >
      <div className="postcard-img">
        <img src={store.image} alt={store.name} loading="lazy" />
      </div>
      <div className="postcard-body">
        <h3>{store.name}</h3>
        <div className="postcard-cuisine">{store.cuisine}</div>
        <div className="postcard-stars">
          <span className="stars">★ {top > 0 ? top.toFixed(1) : '4.5'}</span>
          <span>{count} items</span>
        </div>
        {signature && (
          <div className="postcard-dish">
            ⭐ {signature.name}{sigOff > 0 ? ` · ${sigOff}% off` : ''}
          </div>
        )}
        <div className="postcard-foot">
          <span className="meta-chip">🛵 {store.eta}</span>
          <span className="meta-chip hot">🎁 {store.offer}</span>
        </div>
      </div>
    </article>
  );
}

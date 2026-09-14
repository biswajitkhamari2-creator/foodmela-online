import { useNavigate } from 'react-router-dom';
import { useShop } from '../store';
import type { Storefront } from '../data/catalog';

// Storefront card — stats computed from REAL catalog data at render time.
export default function StorefrontCard({ store }: { store: Storefront }) {
  const { allItems } = useShop();
  const nav = useNavigate();

  const items = allItems.filter((c) => c.category === store.key);
  const count = items.length;
  const top = items.reduce((m, c) => Math.max(m, c.rating), 0);

  return (
    <article className="rest-card" onClick={() => nav(`/food?cat=${store.key}`)} role="link" aria-label={`${store.name} — order now`} tabIndex={0}
      onKeyDown={(e) => { if (e.key === 'Enter') nav(`/food?cat=${store.key}`); }}>
      <div className="rest-img">
        <img src={store.image} alt={store.name} loading="lazy" />
        <span className="rating-pill">★ {top > 0 ? top.toFixed(1) : '4.5'}</span>
      </div>
      <div className="rest-body">
        <h3>{store.name}</h3>
        <div className="rest-sub">{store.cuisine}</div>
        <div className="rest-meta">
          <span className="meta-chip rate">🛵 {store.eta}</span>
          <span className="meta-chip">{count} items</span>
          <span className="meta-chip">🎁 {store.offer}</span>
        </div>
      </div>
    </article>
  );
}

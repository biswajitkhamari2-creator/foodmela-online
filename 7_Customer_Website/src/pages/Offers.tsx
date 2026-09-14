import { useMemo } from 'react';
import { PROMO_OFFERS } from '../data/catalog';
import { useShop } from '../store';
import FoodCard from '../components/FoodCard';
import OfferCard from '../components/OfferCard';
import FestBanner from '../components/FestBanner';

export default function Offers() {
  const { allItems, priceOf, mrpOf } = useShop();

  // Live discounted items from REAL backend prices (not hard-coded deals).
  const deals = useMemo(
    () =>
      allItems
        .map((c) => {
          const mrp = mrpOf(c);
          const price = priceOf(c);
          const off = mrp ? Math.round(((mrp - price) / mrp) * 100) : 0;
          return { c, off };
        })
        .filter((x) => x.off > 0)
        .sort((a, b) => b.off - a.off)
        .map((x) => x.c),
    [allItems, priceOf, mrpOf],
  );

  return (
    <div className="page-enter">
      <div className="page-hero">
        <div className="page-hero-inner">
          <h1>Offers <span className="accent">&amp; deals</span></h1>
          <p>Festival specials plus live store discounts — updated in real time.</p>
        </div>
      </div>

      <FestBanner />

      <div className="section">
        <div className="section-head">
          <div>
            <h2>Featured <span className="accent">promotions</span></h2>
          </div>
        </div>
        <div className="offer-grid">
          {PROMO_OFFERS.map((o) => (
            <OfferCard key={o.code} offer={o} />
          ))}
        </div>
      </div>

      <div className="section">
        <div className="section-head">
          <div>
            <h2>Live <span className="accent">discounts</span></h2>
            <p>{deals.length > 0 ? `${deals.length} items on offer right now` : 'Store discounts appear here automatically'}</p>
          </div>
        </div>
        {deals.length === 0 ? (
          <div className="empty">
            <div className="empty-icon">🎁</div>
            <h3>No live discounts yet</h3>
            <p>Check back soon — the store updates prices in real time.</p>
          </div>
        ) : (
          <div className="food-grid">
            {deals.map((item) => (
              <FoodCard key={item.id} item={item} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

import { useMemo } from 'react';
import { PROMO_OFFERS, FOOD_MENU_CATS } from '../data/catalog';
import { useShop } from '../store';
import FoodCard from '../components/FoodCard';
import OfferCard from '../components/OfferCard';
import FestBanner from '../components/FestBanner';

export default function Offers() {
  const { allItems, priceOf, mrpOf, livePromos } = useShop();
  const allDeals = useMemo(
    () => [...livePromos, ...PROMO_OFFERS.filter((s) => !livePromos.some((l) => l.code === s.code))],
    [livePromos],
  );

  // Live discounted items from REAL backend prices (not hard-coded deals).
  const deals = useMemo(
    () =>
      allItems
        .filter((c) => !FOOD_MENU_CATS.has(c.category))
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
      <div className="mela-pagehead">
        <div className="mela-pagehead-inner">
          <h1>Today&apos;s <span className="accent">picks</span></h1>
          <p>Local love deals + festival specials + live store discounts.</p>
        </div>
      </div>

      <FestBanner />

      <div className="section">
        <div className="section-head">
          <div>
            <h2>Local love <span className="accent">deals</span></h2>
          </div>
        </div>
        <div className="ticket-grid">
          {allDeals.map((o) => (
            <OfferCard key={o.code} offer={o} />
          ))}
        </div>
      </div>

      <div className="section">
        <div className="section-head">
          <div>
            <h2>Fresh <span className="accent-chili">savings</span></h2>
            <p>{deals.length > 0 ? `${deals.length} items on offer right now` : 'Store discounts appear here automatically'}</p>
          </div>
        </div>
        {deals.length === 0 ? (
          <div className="mela-empty">
            <div className="mela-empty-icon">🎁</div>
            <h3>No fresh savings right now</h3>
            <p>The mela restocks deals often — check back soon.</p>
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

import { STOREFRONTS } from '../data/catalog';
import StorefrontCard from '../components/StorefrontCard';
import { useDeliveryLocation } from '../components/location-context';

export default function Restaurants() {
  const { city } = useDeliveryLocation();

  return (
    <div className="page-enter">
      <div className="page-hero">
        <div className="page-hero-inner">
          <h1>Top restaurants <span className="accent">&amp; stores</span></h1>
          <p>Local kitchens &amp; shops serving {city} — live menus, honest prices.</p>
        </div>
      </div>
      <div className="section">
        <div className="food-grid">
          {STOREFRONTS.map((s) => (
            <StorefrontCard key={s.key} store={s} />
          ))}
        </div>
        <div className="empty" style={{ paddingTop: 40 }}>
          <div className="empty-icon">🏪</div>
          <h3>Own a restaurant or store in {city}?</h3>
          <p>Join FoodMela and reach thousands of hungry locals.</p>
        </div>
      </div>
    </div>
  );
}

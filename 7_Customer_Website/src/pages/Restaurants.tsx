import { STOREFRONTS } from '../data/catalog';
import StorefrontCard from '../components/StorefrontCard';
import { useDeliveryLocation } from '../components/location-context';

export default function Restaurants() {
  const { city } = useDeliveryLocation();

  return (
    <div className="page-enter">
      <div className="mela-pagehead">
        <div className="mela-pagehead-inner">
          <h1>Made <span className="accent">around you</span></h1>
          <p>Local kitchens &amp; shops serving {city} — live menus, community favourites, honest prices.</p>
        </div>
      </div>
      <div className="section">
        <div className="post-grid">
          {STOREFRONTS.map((s) => (
            <StorefrontCard key={s.key} store={s} />
          ))}
        </div>
        <div className="mela-empty" style={{ paddingTop: 40 }}>
          <div className="mela-empty-icon">🏪</div>
          <h3>Own a kitchen or store in {city}?</h3>
          <p>Join the mela and reach thousands of hungry locals.</p>
        </div>
      </div>
    </div>
  );
}

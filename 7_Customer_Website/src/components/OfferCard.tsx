import type { PromoOffer } from '../data/catalog';

export default function OfferCard({ offer }: { offer: PromoOffer }) {
  return (
    <div className={`offer-card ${offer.theme}`} role="article" aria-label={offer.title}>
      <div className="o-emoji" aria-hidden="true">{offer.emoji}</div>
      <h3>{offer.title}</h3>
      <p>{offer.text}</p>
      <span className="o-code">CODE: {offer.code}</span>
    </div>
  );
}

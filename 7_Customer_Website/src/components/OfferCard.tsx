import type { PromoOffer } from '../data/catalog';

const THEME: Record<PromoOffer['theme'], string> = {
  'offer-green': 'ticket-green',
  'offer-red': 'ticket-red',
  'offer-dark': 'ticket-dark',
  'offer-gold': 'ticket-gold',
};

/** Mela ticket — perforated-stub offer card (original, not a coupon clone). */
export default function OfferCard({ offer }: { offer: PromoOffer }) {
  return (
    <div className={`ticket ${THEME[offer.theme]}`} role="article" aria-label={offer.title}>
      <div className="ticket-main">
        <div className="o-emoji" aria-hidden="true">{offer.emoji}</div>
        <h3>{offer.title}</h3>
        <p>{offer.text}</p>
      </div>
      <div className="ticket-stub" aria-label={`Offer code ${offer.code}`}>
        {offer.code}
      </div>
    </div>
  );
}

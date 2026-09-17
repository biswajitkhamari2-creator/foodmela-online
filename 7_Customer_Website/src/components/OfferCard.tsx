import { useState } from 'react';
import type { PromoOffer } from '../data/catalog';
import { useTilt } from '../hooks/useTilt';

const THEME: Record<PromoOffer['theme'], string> = {
  'offer-green': 'ticket-green',
  'offer-red': 'ticket-red',
  'offer-dark': 'ticket-dark',
  'offer-gold': 'ticket-gold',
};

/** Mela ticket — perforated-stub offer card with tap-to-copy */
export default function OfferCard({ offer }: { offer: PromoOffer }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    try {
      navigator.clipboard?.writeText(offer.code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2200);
    } catch {
      // fallback
    }
  };

  const tilt = useTilt<HTMLDivElement>(10);

  return (
    <div
      className={`ticket tilt-glare ${THEME[offer.theme]}`}
      role="article"
      aria-label={`${offer.title} — code ${offer.code}`}
      onClick={handleCopy}
      onMouseMove={tilt.onMouseMove}
      onMouseLeave={tilt.onMouseLeave}
      ref={tilt.ref}
      style={{ cursor: 'pointer' }}
      title="Tap to copy coupon code"
    >
      <div className="ticket-main">
        <div className="o-emoji" aria-hidden="true">{offer.emoji}</div>
        <h3>{offer.title}</h3>
        <p>{offer.text}</p>
        <span style={{ fontSize: 11, fontWeight: 700, opacity: 0.85, marginTop: 4, display: 'inline-block' }}>
          {copied ? '🎉 Code copied to clipboard!' : '👆 Tap card to copy code'}
        </span>
      </div>
      <div className="ticket-stub" aria-label={`Offer code ${offer.code}`}>
        <span style={{ fontSize: 10, opacity: 0.8, display: 'block', textTransform: 'uppercase', letterSpacing: 0.5 }}>COUPON</span>
        <strong>{copied ? '✓ COPIED' : offer.code}</strong>
      </div>
    </div>
  );
}

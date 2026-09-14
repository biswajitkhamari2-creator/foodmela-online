import { useEffect, useState } from 'react';
import { useShop } from '../store';

// Animated slideshow — same app_banners collection as the app.
// Frames crossfade; single image gets a slow zoom.
export default function FestBanner() {
  const { banner } = useShop();
  const [idx, setIdx] = useState(0);

  const slides = (() => {
    if (!banner) return [];
    const frames = Array.isArray(banner.frames) ? banner.frames.filter(Boolean) : [];
    const list = [...frames];
    if (banner.imageUrl && !list.includes(banner.imageUrl)) list.push(banner.imageUrl);
    return list;
  })();

  useEffect(() => {
    setIdx(0);
    if (slides.length < 2) return;
    const t = setInterval(() => setIdx((i) => (i + 1) % slides.length), 3000);
    return () => clearInterval(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [banner?.id, slides.length]);

  if (!banner) return null;

  return (
    <div className="fest-wrap">
      <div className="fest-banner">
        {slides.map((url, i) => (
          <div
            key={url}
            className="fest-slide"
            style={{ backgroundImage: `url(${url})`, opacity: i === idx ? 1 : 0 }}
          />
        ))}
        {slides.length === 0 && (
          <div className="fest-slide" style={{ background: 'linear-gradient(120deg,#E11D48,#F15A24)' }} />
        )}
        <div className="fest-overlay">
          {banner.badge && <span className="fest-badge">{banner.badge}</span>}
          <h2>{banner.title || 'Festival Special 🎉'}</h2>
          {banner.subtitle && <p>{banner.subtitle}</p>}
        </div>
        {slides.length > 1 && (
          <div className="fest-dots">
            {slides.map((_, i) => (
              <i key={i} className={i === idx ? 'on' : ''} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

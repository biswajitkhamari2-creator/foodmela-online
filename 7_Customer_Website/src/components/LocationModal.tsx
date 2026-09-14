import { useEffect } from 'react';
import { AREAS, useDeliveryLocation } from './location-context';

// Frontend-only area picker (no backend location API exists on the website).
export default function LocationModal() {
  const { city, area, locOpen, setLocOpen, chooseArea } = useDeliveryLocation();

  useEffect(() => {
    if (!locOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setLocOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [locOpen, setLocOpen]);

  if (!locOpen) return null;

  return (
    <>
      <div className="drawer-overlay" onClick={() => setLocOpen(false)} />
      <div
        style={{
          position: 'fixed', inset: 0, zIndex: 92, display: 'flex',
          alignItems: 'center', justifyContent: 'center', padding: 20, pointerEvents: 'none',
        }}
      >
        <div className="loc-modal-card" role="dialog" aria-modal="true" aria-label="Choose delivery area" style={{ pointerEvents: 'auto' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h3 style={{ fontSize: 19 }}>Choose your area</h3>
              <p style={{ fontSize: 13, color: '#66707D', marginTop: 4 }}>
                📍 Delivering across <strong style={{ color: '#0a5c2f' }}>{city}</strong>
              </p>
            </div>
            <button className="btn-ghost" style={{ padding: '8px 14px' }} onClick={() => setLocOpen(false)} aria-label="Close">
              ✕
            </button>
          </div>
          {AREAS.map((a) => (
            <button
              key={a.name}
              className={`loc-option ${area === a.name ? 'on' : ''}`}
              onClick={() => chooseArea(a.name)}
            >
              <span style={{ fontSize: 22 }} aria-hidden="true">📍</span>
              <span>
                <strong>{a.name}, {city}</strong>
                <small>{a.note}</small>
              </span>
              {area === a.name && <span style={{ marginLeft: 'auto', color: '#0e9f4e', fontWeight: 800 }}>✓</span>}
            </button>
          ))}
          <p style={{ fontSize: 12, color: '#9AA3AF', marginTop: 14, textAlign: 'center' }}>
            Outside {city}? We&apos;re expanding soon — stay tuned! 🛵
          </p>
        </div>
      </div>
    </>
  );
}

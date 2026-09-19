import { Link } from 'react-router-dom';

// ─── FoodMela APK download hub (foodmela.online/apk) ───────────────────────────
// Customer app direct download — hosted on Firebase Storage (public link).
// Update APK_URL + APP_VERSION + APP_SIZE_MB on every new release.
const APK_URL =
  'https://firebasestorage.googleapis.com/v0/b/food-mela-notification.firebasestorage.app/o/apk%2Ffoodmela-customer-v3.apk?alt=media&token=cceeb945-9480-461a-ad00-33fd50824d22';
const APP_VERSION = 'v3.0.0';
const APP_SIZE_MB = '69 MB';

const FEATURES = [
  { emoji: '💳', title: 'Online Payments', text: 'Pay securely with UPI / cards' },
  { emoji: '🛵', title: 'Live Tracking', text: 'Watch your rider on the map' },
  { emoji: '📞', title: 'In-App Calls', text: 'Call rider, numbers hidden' },
  { emoji: '🔑', title: 'OTP Login', text: 'No passwords to remember' },
];

const STEPS = [
  { n: '1', title: 'Tap Download below', text: 'The APK file saves to your phone.' },
  { n: '2', title: 'Tap "Keep anyway"', text: 'Chrome shows "harmful" for ALL non-Play Store apps — even Instagram. This is safe — tap Keep.' },
  { n: '3', title: 'Allow install', text: 'Open the file → allow Install unknown apps when asked.' },
  { n: '4', title: 'Login with OTP', text: 'Same phone number, same account as this website.' },
];

export default function Apk() {
  return (
    <div className="fm-page apk-page">
      {/* ── HERO ── */}
      <div className="apk-hero">
        <div className="apk-hero-emoji" aria-hidden="true">📱</div>
        <span className="apk-badge">✨ OFFICIAL APP · {APP_VERSION} · FREE</span>
        <h1>FoodMela App</h1>
        <p>Daily Essentials. Delivered Happier — now in your pocket.</p>
        <a href={APK_URL} download="FoodMela.apk" className="apk-dl-btn">
          ⬇ DOWNLOAD NOW
        </a>
        <div className="apk-meta">Android · {APP_SIZE_MB} · No Play Store needed</div>
        <div className="apk-trust">
          <span className="trust-badge">✓ Official FoodMela App</span>
          <span className="trust-badge">✓ Signed & Verified</span>
          <span className="trust-badge">✓ Safe to Install</span>
        </div>
      </div>

      {/* ── FEATURES ── */}
      <div className="apk-feats">
        {FEATURES.map((f) => (
          <div key={f.title} className="apk-feat">
            <div className="apk-feat-emoji" aria-hidden="true">{f.emoji}</div>
            <strong>{f.title}</strong>
            <small>{f.text}</small>
          </div>
        ))}
      </div>

      {/* ── STEPS ── */}
      <h2 className="apk-steps-title">Install in 30 seconds</h2>
      <div className="apk-steps">
        {STEPS.map((s) => (
          <div key={s.n} className="apk-step">
            <span className="apk-step-n">{s.n}</span>
            <span>
              <strong>{s.title}</strong>
              <small>{s.text}</small>
            </span>
          </div>
        ))}
      </div>

      {/* ── WARNING EXPLANATION ── */}
      <div className="apk-faq">
        <h3>⚠️ Why does Chrome say "harmful"?</h3>
        <p>
          Chrome shows this warning for <strong>every app outside Play Store</strong> — even Instagram, WhatsApp,
          or any other company's direct APK download. It's not specific to FoodMela.
        </p>
        <p>
          <strong>This file is 100% safe.</strong> It's our official app, digitally signed by FoodMela.
          When you see the warning, just tap <strong>"Keep anyway"</strong> or <strong>"Download anyway"</strong> to continue.
        </p>
        <p className="apk-faq-meta">
          🔒 File secured with SHA256 signature · Hosted on Google Firebase · No viruses or malware
        </p>
      </div>

      <div className="apk-back">
        <Link to="/">← Back to ordering on website</Link>
      </div>
    </div>
  );
}

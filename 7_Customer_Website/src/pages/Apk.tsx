import { Link } from 'react-router-dom';

// ─── FoodMela APK download hub (foodmela.online/apk) ───────────────────────────
// Customer app direct download — hosted on Firebase Storage (public link).
// Update APK_URL + APP_VERSION + APP_SIZE_MB on every new release.
const APK_URL =
  'https://firebasestorage.googleapis.com/v0/b/food-mela-notification.firebasestorage.app/o/apk%2Ffoodmela-customer-v1.apk?alt=media&token=a8bac5ed-2ccf-488a-a8c0-78d0bc686716';
const APP_VERSION = 'v1.0.0';
const APP_SIZE_MB = '249 MB';

const FEATURES = [
  { emoji: '🛵', title: 'Live Tracking', text: 'Watch your rider on the map' },
  { emoji: '📞', title: 'In-App Calls', text: 'Call rider, numbers hidden' },
  { emoji: '🔑', title: 'OTP Login', text: 'No passwords to remember' },
  { emoji: '👤', title: 'Same Account', text: 'Website + app in sync' },
];

const STEPS = [
  { n: '1', title: 'Tap Download below', text: 'The APK file saves to your phone.' },
  { n: '2', title: 'Allow install', text: 'Open the file → allow Install unknown apps when asked.' },
  { n: '3', title: 'Login with OTP', text: 'Same phone number, same account as this website.' },
];

export default function Apk() {
  return (
    <div className="fm-page apk-page">
      {/* ── HERO ── */}
      <div className="apk-hero">
        <div className="apk-hero-emoji" aria-hidden="true">📱</div>
        <span className="apk-badge">✨ OFFICIAL APP · {APP_VERSION} · FREE</span>
        <h1>FoodMela App</h1>
        <p>Good Food. Delivered Happier — now in your pocket.</p>
        <a href={APK_URL} download="FoodMela.apk" className="apk-dl-btn">
          ⬇ DOWNLOAD NOW
        </a>
        <div className="apk-meta">Android · {APP_SIZE_MB} · No Play Store needed</div>
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

      <div className="apk-back">
        <Link to="/">← Back to ordering on website</Link>
      </div>
    </div>
  );
}

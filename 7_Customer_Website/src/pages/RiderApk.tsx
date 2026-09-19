import { Link } from 'react-router-dom';

const APP_VERSION = '2.0.0';

const STEPS = [
  { n: '1', title: 'Tap "Become a Partner"', text: 'Web app kholo — kuch download nahi karna.' },
  { n: '2', title: 'Apply with your phone', text: 'OTP login karo — same number jo delivery ke liye register hai.' },
  { n: '3', title: 'Admin approval', text: 'Application under review — approval ke baad orders milne lagenge.' },
  { n: '4', title: 'Start earning', text: 'Approve hone pe log in karke orders accept karo.' },
];

export default function RiderApk() {
  return (
    <div className="apk-wrap">
      <div className="apk-hero">
        <div className="apk-icon">🚴‍♂️</div>
        <h1>FoodMela Rider App</h1>
        <p className="apk-sub">Delivery partner ka app — orders accept karo, deliver karo, earnings dekho</p>
        <a href="https://foodmela.online/rider-app/" className="apk-dl-btn">
          🚴 BECOME A DELIVERY PARTNER
        </a>
        <div className="apk-meta">💻 Works in browser · No download needed · v{APP_VERSION}</div>
        <div className="apk-trust">
          <span className="trust-badge">✓ Official FoodMela App</span>
          <span className="trust-badge">✓ Instant Web Access</span>
          <span className="trust-badge">✓ No APK Download</span>
        </div>
      </div>

      {/* ── STEPS ── */}
      <div className="apk-steps">
        <h2>Partner banne ke liye</h2>
        <div className="apk-step-grid">
          {STEPS.map(s => (
            <div key={s.n} className="apk-step">
              <div className="apk-step-n">{s.n}</div>
              <h3>{s.title}</h3>
              <p>{s.text}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ── INFO ── */}
      <div className="apk-faq">
        <h3>💡 Mobile app bhi chahiye?</h3>
        <p>
          Web version abhi kaafi hai — koi download nahi, koi "harmful" warning nahi, bas browser kholo aur kaam shuru karo.
        </p>
        <p>
          <strong>Web app kaunsa popular hai?</strong> Chai mein andar mobile app me aapka rider account automatically sync rehta hai —
          ek hi phone number, wahi orders, wahi earnings.
        </p>
        <p className="apk-faq-meta">
          🔒 Secure OTP login · Google Firebase hosting · No viruses
        </p>
      </div>

      <div className="apk-back">
        <Link to="/">← Back to home</Link>
      </div>
    </div>
  );
}

import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { useShop } from '../store';

// ── OTP LOGIN — LOGIC 100% PRESERVED ──
// Same phone.email widget + client ID, same global callback, same backend
// proxy (api.verifyPhoneEmail), same Firestore users/{phone} lookup, same
// backend profile check, same register call, same sessionStorage keys.
// ONLY the visual layout below was redesigned.

// Same phone.email account as the apps — same client ID, same identity.
// Official "Sign in with Phone" button widget: OTP happens in a modal on
// THIS page, then phoneEmailListener hands us a user_json_url that only a
// server may fetch — so the website posts it to our backend proxy.
const PE_CLIENT_ID = '14442678863809499061';
const PE_WIDGET_SRC = 'https://www.phone.email/sign_in_button_v1.js';

// Every network step has a hard timeout — without one a stalled request
// leaves the button on "Verifying..." forever.
const STEP_TIMEOUT_MS = 15000;

function withTimeout<T>(p: Promise<T>, ms: number, label: string): Promise<T> {
  let t: ReturnType<typeof setTimeout>;
  const timeout = new Promise<never>((_, reject) => {
    t = setTimeout(() => reject(new Error(`${label} timed out`)), ms);
  });
  return Promise.race([p, timeout]).finally(() => clearTimeout(t!));
}

interface PeWidgetUser {
  user_json_url?: string;
  user_country_code?: string;
  user_phone_number?: string;
  user_first_name?: string;
  user_last_name?: string;
}

declare global {
  interface Window {
    phoneEmailListener?: (userObj: PeWidgetUser) => void;
  }
}

export default function Login() {
  const { setUser } = useShop();
  const nav = useNavigate();
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');
  const [step, setStep] = useState('');
  const [needProfile, setNeedProfile] = useState<{ phone: string; name?: string } | null>(null);
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');

  // Load the official widget script once, register the global callback
  // BEFORE the script runs so no verification result is ever missed.
  useEffect(() => {
    window.phoneEmailListener = (userObj: PeWidgetUser) => {
      if (userObj?.user_json_url) {
        void verifyWidgetUser(userObj.user_json_url);
      } else {
        setErr('Verification failed — phone.email did not confirm your number. Please try again.');
      }
    };
    if (!document.querySelector(`script[src="${PE_WIDGET_SRC}"]`)) {
      const s = document.createElement('script');
      s.src = PE_WIDGET_SRC;
      s.async = true;
      document.body.appendChild(s);
    }
    return () => {
      delete window.phoneEmailListener;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Prefill the name field when the widget already knows it
  useEffect(() => {
    if (needProfile?.name && !name) setName(needProfile.name);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [needProfile]);

  // Resume interrupted profile step (verified, tab reloaded before saving)
  useEffect(() => {
    try {
      const saved = sessionStorage.getItem('fm_pe_phone');
      if (saved && !needProfile) {
        setNeedProfile({ phone: saved, name: sessionStorage.getItem('fm_pe_name') || undefined });
      }
    } catch { /* ignore */ }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Widget callback → backend proxy fetches the user JSON server-to-server
  const verifyWidgetUser = async (userJsonUrl: string) => {
    setBusy(true);
    setErr('');
    setStep('Confirming your number…');

    let phone = '';
    let widgetName = '';
    try {
      const { api } = await import('../api');
      const data = await withTimeout(
        api.verifyPhoneEmail({ user_json_url: userJsonUrl }),
        STEP_TIMEOUT_MS,
        'Verification server',
      );
      phone = String(data.phone ?? '').replace(/[^0-9]/g, '').slice(-10);
      widgetName = String(data.name ?? '').trim();
      if (!data.success || phone.length < 10) {
        setErr('Verification failed — phone.email did not confirm your number. Please try again.');
        setBusy(false);
        setStep('');
        return;
      }
      try {
        sessionStorage.setItem('fm_pe_phone', phone);
        if (widgetName) sessionStorage.setItem('fm_pe_name', widgetName);
        if (data.jwt) sessionStorage.setItem('fm_pe_jwt', data.jwt);
      } catch { /* ignore */ }
      // SECURITY: persist the backend session token (all sensitive API calls
      // need it) + sign into Firestore (hardened rules need Auth).
      try {
        const { setApiToken } = await import('../api');
        const { signIntoFirestore } = await import('../firebase');
        if (data.apiToken) setApiToken(data.apiToken);
        await signIntoFirestore(data.firebaseToken ?? null);
      } catch { /* backend API still works without Firestore auth */ }
    } catch {
      setErr('Could not reach verification server. Check your internet and try again.');
      setBusy(false);
      setStep('');
      return;
    }
    setStep('Looking up your account…');

    // Same identity lookup as the app — Firestore users/{phone}.
    // Website is unauthenticated so this read is usually denied by rules —
    // that just means "treat as new customer", never a fatal error.
    // The read can also hang (offline persistence retry), so race it: a
    // denial OR a 6s stall both fall through to the profile step.
    try {
      const snap = await Promise.race([
        getDoc(doc(db, 'users', phone)),
        new Promise<null>((resolve) => setTimeout(() => resolve(null), 6000)),
      ]);
      if (snap === null) throw new Error('lookup stalled');
      if (snap.exists()) {
        const d = snap.data() as Record<string, unknown>;
        if (d.accountStatus === 'blocked') {
          setErr('Your account has been blocked. Please contact support.');
          setBusy(false);
          setStep('');
          return;
        }
        const fullName =
          (String(d.fullName ?? d.name ?? '').trim() ||
            `${String(d.firstName ?? '').trim()} ${String(d.lastName ?? '').trim()}`.trim());
        const addr = String(d.deliveryAddress ?? d.address ?? '').trim();
        if (fullName) {
          // Returning customer — straight in, name never asked again
          setUser({ name: fullName, phone, address: addr });
          nav('/');
          return;
        }
      }
    } catch {
      // Rules denied the read (unauthenticated web) — fall through to backend check
    }

    // Backend Redis profile — the same store the apps use. A returning
    // customer (name saved from app or a previous website visit) goes
    // straight in; only a brand-new number sees the name/address form.
    try {
      const { api } = await import('../api');
      const res = await withTimeout(
        api.userProfile(phone),
        STEP_TIMEOUT_MS,
        'Verification server',
      );
      const u = res.user as Record<string, unknown>;
      if (String(u.accountStatus ?? 'active') === 'blocked') {
        setErr('Your account has been blocked. Please contact support.');
        setBusy(false);
        setStep('');
        return;
      }
      const fullName = String(u.fullName ?? u.name ?? '').trim();
      if (fullName) {
        const addrs = Array.isArray(u.addresses) ? (u.addresses as Record<string, unknown>[]) : [];
        const addr = String(addrs[0]?.address ?? u.address ?? '').trim();
        try {
          sessionStorage.removeItem('fm_pe_phone');
          sessionStorage.removeItem('fm_pe_name');
        } catch { /* ignore */ }
        setUser({ name: fullName, phone, address: addr });
        nav('/');
        return;
      }
    } catch {
      // Backend unreachable — fall through to profile step
    }

    // Brand-new number — ask name + address once.
    // The widget often already knows the name — prefill it.
    setNeedProfile({ phone, name: widgetName || undefined });
    setBusy(false);
    setStep('');
  };

  // First-time profile — saved via backend (same Redis store as apps).
  // Website never writes Firestore directly (rules deny unauthenticated writes).
  const saveProfile = async () => {
    if (!needProfile) return;
    if (!name.trim()) { setErr('Enter your name'); return; }
    if (!address.trim()) { setErr('Enter your delivery address'); return; }
    setBusy(true);
    setErr('');
    try {
      const res = await (await import('../api')).api.register({
        phone: needProfile.phone,
        name: name.trim(),
        address: address.trim(),
      });
      if (!res.success) throw new Error('register failed');
      try {
        sessionStorage.removeItem('fm_pe_phone');
        sessionStorage.removeItem('fm_pe_name');
      } catch { /* ignore */ }
      setUser({ name: res.user.name || name.trim(), phone: res.user.phone, address: res.user.address || address.trim() });
      nav('/');
    } catch {
      setErr('Could not save profile — is the backend online? Please try again.');
    }
    setBusy(false);
  };

  return (
    <div className="page-enter">
      <div className="auth-wrap">
        <div className="auth-card">
          <div className="auth-logo" aria-hidden="true">F</div>
          <h2 style={{ textAlign: 'center', margin: '16px 0 4px', fontSize: 24 }}>
            {needProfile ? 'Almost there! 🎉' : 'Welcome to FoodMela'}
          </h2>
          <p style={{ textAlign: 'center', color: '#66707D', fontSize: 13.5, marginBottom: 8 }}>
            {needProfile
              ? 'Tell us where to deliver your happiness.'
              : 'Fresh groceries. Delivered happier. Login with OTP to order.'}
          </p>
          <div className="auth-perks">
            <span>⚡ Fast delivery</span>
            <span>🛡️ Secure OTP login</span>
            <span>❤️ Supports local</span>
          </div>

          {!needProfile ? (
            <>
              {/* Official phone.email button — renders itself, opens OTP modal on this page */}
              <div style={{ display: 'flex', justifyContent: 'center', marginTop: 18, opacity: busy ? 0.6 : 1, pointerEvents: busy ? 'none' : 'auto' }}>
                <div className="pe_signin_button" data-client-id={PE_CLIENT_ID} />
              </div>
              {busy && (
                <p style={{ textAlign: 'center', color: '#0e9f4e', fontWeight: 700, fontSize: 13, marginTop: 14 }}>
                  Verifying…
                </p>
              )}
              {step && <p style={{ textAlign: 'center', color: '#66707D', fontSize: 12, marginTop: 6 }}>{step}</p>}
              <p style={{ textAlign: 'center', color: '#9AA3AF', fontSize: 12, marginTop: 14 }}>
                Same OTP login as the app — one account everywhere. No new page, no popup.
              </p>
            </>
          ) : (
            <>
              <p style={{ fontSize: 13, color: '#0a5c2f', background: '#E7F6EC', borderRadius: 12, padding: '10px 14px', fontWeight: 700, marginBottom: 14, marginTop: 16 }}>
                ✓ Number verified: +91 {needProfile.phone}
              </p>
              <label htmlFor="fm-name" style={{ fontSize: 12.5, fontWeight: 700, color: '#2B323B', display: 'block', marginBottom: 6 }}>
                Your full name
              </label>
              <input
                id="fm-name"
                className="text-input"
                placeholder="e.g. Rahul Sharma"
                value={name}
                onChange={(e) => setName(e.target.value)}
                autoComplete="name"
              />
              <label htmlFor="fm-addr" style={{ fontSize: 12.5, fontWeight: 700, color: '#2B323B', display: 'block', marginBottom: 6 }}>
                Delivery address
              </label>
              <textarea
                id="fm-addr"
                className="addr-input"
                placeholder="House no, street, landmark — Birmaharajpur"
                rows={3}
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                autoComplete="street-address"
              />
              <button className="btn-primary" style={{ width: '100%' }} disabled={busy} onClick={saveProfile}>
                {busy ? 'Saving...' : 'Start Ordering →'}
              </button>
            </>
          )}

          {err && <p style={{ color: '#C4271F', background: '#FDECEA', borderRadius: 12, padding: '10px 14px', fontSize: 13, marginTop: 14, textAlign: 'center' }}>{err}</p>}
        </div>
        <p style={{ textAlign: 'center', fontSize: 12, color: '#9AA3AF', marginTop: 16 }}>
          By continuing you agree to our Terms &amp; Privacy Policy.
        </p>
      </div>
    </div>
  );
}

import { initializeApp, getApps } from 'firebase/app';
import { getAuth, signInWithCustomToken, signOut } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// Same Firebase project as apps + admin — prices & banners stay in sync.
const firebaseConfig = {
  apiKey: 'AIzaSyCGj-c4WU6PwCF9s0Z6k3xT6dbA6yqdKEQ',
  authDomain: 'food-mela-notification.firebaseapp.com',
  projectId: 'food-mela-notification',
  storageBucket: 'food-mela-notification.firebasestorage.app',
  messagingSenderId: '623657462795',
  appId: '1:623657462795:web:26da5491d2c14a671fab0e',
};

const app = getApps().length ? getApps()[0]! : initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);

// ─── SECURITY (2026-09-18): sign into Firestore with the backend-minted ──
// custom token (uid = verified 10-digit phone). Without this, the hardened
// rules deny order reads. Best-effort: if the backend didn't return a token
// (older deploy), the site keeps working via the backend API; only the
// Firestore mirror reads degrade.
export async function signIntoFirestore(customToken: string | null | undefined) {
  if (!customToken) return;
  try {
    await signInWithCustomToken(auth, customToken);
  } catch {
    // Offline or stale token — backend API still works.
  }
}

export async function signOutFirestore() {
  try { await signOut(auth); } catch { /* ignore */ }
}

// Same-domain backend: foodmela.online/api in production (no CORS),
// VITE_BACKEND_URL override for local dev, legacy vercel.app URL as fallback.
// Order anywhere (app or website) → same kitchen, same riders, same admin.
//
// SECURITY (2026-09-18): sensitive endpoints require the apiToken minted at
// OTP login (bound to the verified phone). The token is stored in
// sessionStorage and sent as a Bearer header — the backend rejects
// cross-user access (IDOR kill) and strips OTP/FCM tokens for strangers.

// Orders ALSO mirror to Firestore so rider apps (Firestore listeners) see
// website orders instantly — same doc shape the apps use.
async function mirrorToFirestore(order: BackendOrder, body: {
  customerName: string;
  phone: string;
  address: string;
  items: { itemId: string; name: string; quantity: number; price: number; totalPrice: number }[];
  totalAmount: number;
}) {
  try {
    const { doc, setDoc, serverTimestamp } = await import('firebase/firestore');
    const { db } = await import('./firebase');
    const oid = order.orderId ?? order.id;
    await setDoc(doc(db, 'orders', oid), {
      orderId: oid,
      customerName: body.customerName,
      customerPhone: body.phone,
      address: body.address,
      items: body.items,
      itemsSummary: body.items.map((i) => `${i.quantity}x ${i.name}`).join(', '),
      totalAmount: body.totalAmount,
      status: 'Order Placed',
      stage: 0,
      riderId: null,
      riderName: null,
      deliveryOtp: order.deliveryOtp ?? String(1000 + Math.floor(Math.random() * 9000)),
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      isDeleted: false,
      source: 'website',
    }, { merge: true });
  } catch {
    // Backend already saved it — mirror is best-effort
  }
}

const BASE = (import.meta.env.VITE_BACKEND_URL as string | undefined)?.replace(/\/$/, '')
  ?? (import.meta.env.PROD ? '' : 'https://food-mela-backend.vercel.app');

// ─── Session token (minted by backend at OTP verify, bound to phone) ────
export function getApiToken(): string | null {
  try { return sessionStorage.getItem('fm_api_token'); } catch { return null; }
}
export function setApiToken(t: string | null) {
  try {
    if (t) sessionStorage.setItem('fm_api_token', t);
    else sessionStorage.removeItem('fm_api_token');
  } catch { /* ignore */ }
}

async function req<T>(path: string, init?: RequestInit): Promise<T> {
  const token = getApiToken();
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;
  const res = await fetch(`${BASE}${path}`, {
    headers: { ...headers, ...(init?.headers as Record<string, string> | undefined) },
    ...init,
  });
  if (res.status === 401) {
    // Session expired/invalid — force re-login on next protected call.
    setApiToken(null);
    throw new Error('Session expired — please login again');
  }
  if (!res.ok) throw new Error(`Backend ${res.status}`);
  return res.json() as Promise<T>;
}

export interface BackendOrder {
  id: string;
  orderId?: string;
  customerName?: string;
  phone?: string;
  customerPhone?: string;
  address?: string;
  items?: unknown;
  itemsSummary?: string;
  total?: string;
  totalAmount?: number;
  amountValue?: number;
  status?: string;
  stage?: number;
  acceptedByName?: string;
  riderName?: string;
  deliveryOtp?: string;
  timestamp?: string;
  placedAt?: string;
  createdAt?: string;
  updatedAt?: string;
}

export const api = {
  placeOrder: async (body: {
    id?: string;
    customerName: string;
    phone: string;
    address: string;
    items: { itemId: string; name: string; quantity: number; price: number; totalPrice: number }[];
    totalAmount: number;
  }) => {
    const res = await req<{ success: boolean; order: BackendOrder }>('/api/orders/place', {
      method: 'POST',
      body: JSON.stringify(body),
    });
    // Mirror to Firestore so riders + admin see it instantly
    if (res.order) await mirrorToFirestore(res.order, body);
    return res;
  },

  orderStatus: (orderId: string) =>
    req<{ success: boolean; order: BackendOrder }>(`/api/orders/status/${encodeURIComponent(orderId)}`),

  cancelOrder: (orderId: string) =>
    req<{ success: boolean }>('/api/orders/cancel', {
      method: 'POST',
      body: JSON.stringify({ orderId }),
    }),

  userOrders: (phone: string) =>
    req<{ success: boolean; orders: BackendOrder[] }>(`/api/user/${encodeURIComponent(phone)}/orders`),

  userProfile: (phone: string) =>
    req<{ success: boolean; user: Record<string, unknown> }>(`/api/user/${encodeURIComponent(phone)}`),

  register: (body: { phone: string; name: string; address: string }) =>
    req<{ success: boolean; user: { phone: string; name: string; address: string } }>('/api/user/register', {
      method: 'POST',
      body: JSON.stringify(body),
    }),

  // OTP verification via backend proxy (phone.email blocks browser CORS).
  // Official widget flow sends { user_json_url }; legacy redirect flow sends
  // { access_token } — the backend accepts both. Returns apiToken +
  // firebaseToken on success — callers must persist both via setApiToken
  // and signIntoFirestore.
  verifyPhoneEmail: (body: { user_json_url: string } | { access_token: string }) =>
    req<{ success: boolean; phone: string; name: string | null; user?: Record<string, any>; jwt: string | null; apiToken?: string; firebaseToken?: string }>('/api/auth/phone-email/verify', {
      method: 'POST',
      body: JSON.stringify(body),
    }),
};

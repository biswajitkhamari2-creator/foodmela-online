import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { collection, onSnapshot, query, where } from 'firebase/firestore';
import { db } from '../firebase';
import { api, type BackendOrder } from '../api';
import { useShop } from '../store';

// ── ORDER LIST — LOGIC 100% PRESERVED ──
// Same backend history + Firestore listeners, same merge/dedupe, same
// cancel + reorder flows. Only the card layout was redesigned.

interface FsOrder {
  id: string;
  orderId?: string;
  customerName?: string;
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
  createdAt?: { toDate?: () => Date } | string | null;
  isDeleted?: boolean;
}

type UnifiedOrder = Omit<BackendOrder, 'createdAt'> & {
  oid: string;
  source: 'app' | 'website';
  createdMs: number;
  createdAt?: FsOrder['createdAt'];
};

function toMs(ts: FsOrder['createdAt']): number {
  try {
    if (ts && typeof ts === 'object' && typeof ts.toDate === 'function') {
      return ts.toDate()?.getTime() ?? 0;
    }
    if (typeof ts === 'string') {
      const t = Date.parse(ts);
      return Number.isNaN(t) ? 0 : t;
    }
  } catch { /* ignore */ }
  return 0;
}

function stageOf(o: UnifiedOrder): number {
  return typeof o.stage === 'number' ? o.stage : 0;
}

function itemsText(o: UnifiedOrder): string {
  if (typeof o.items === 'string') return o.items;
  if (Array.isArray(o.items)) {
    const parts = (o.items as Record<string, unknown>[]).map((i) => {
      const q = Number(i.quantity ?? 1);
      const n = String(i.name ?? i.itemId ?? 'Item');
      return `${q}x ${n}`;
    });
    if (parts.length > 0) return parts.join(', ');
  }
  return o.itemsSummary ?? 'Food items';
}

function totalOf(o: UnifiedOrder): string {
  const v = o.totalAmount ?? o.amountValue;
  if (typeof v === 'number') return `₹${v}`;
  return o.total ?? '₹—';
}

function statusMeta(stage: number, cancelled: boolean): { label: string; cls: string; icon: string } {
  if (cancelled) return { label: 'CANCELLED', cls: 'st-cancel', icon: '🚨' };
  if (stage >= 3) return { label: 'DELIVERED', cls: 'st-done', icon: '🏁' };
  if (stage === 2) return { label: 'ON THE WAY', cls: 'st-way', icon: '🛵' };
  if (stage === 1) return { label: 'ACCEPTED', cls: 'st-accepted', icon: '👨‍🍳' };
  return { label: 'PLACED', cls: 'st-placed', icon: '🧾' };
}

export default function Orders() {
  const { user, addManyToCart, allItems } = useShop();
  const nav = useNavigate();
  const [tab, setTab] = useState<'active' | 'past'>('active');
  const [backendOrders, setBackendOrders] = useState<BackendOrder[]>([]);
  const [fsOrders, setFsOrders] = useState<FsOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState<string | null>(null);
  const [reordered, setReordered] = useState<string | null>(null);

  useEffect(() => {
    if (!user) { nav('/login'); return; }
    const phone = user.phone;

    // Website orders — backend Redis history
    api.userOrders(phone)
      .then((r) => setBackendOrders(r.orders ?? []))
      .catch(() => setBackendOrders([]))
      .finally(() => setLoading(false));

    // App orders — same Firestore collection the app writes to.
    // Publicly readable per firestore.rules (allow read: if true).
    // The app may store the number with or without country code, so listen
    // to both variants and merge (dedupe happens in the memo below).
    const digits = phone.replace(/[^0-9]/g, '').slice(-10);
    const variants = [...new Set([phone, digits, `+91${digits}`, `91${digits}`])];
    const unsubs = variants.map((v) =>
      onSnapshot(
        query(collection(db, 'orders'), where('customerPhone', '==', v)),
        (snap) => {
          const got = snap.docs
            .map((d) => ({ id: d.id, ...(d.data() as Omit<FsOrder, 'id'>) }))
            .filter((o) => o.isDeleted !== true);
          setFsOrders((prev) => {
            const others = prev.filter((p) => p.customerPhone !== v);
            return [...others, ...got];
          });
        },
      ),
    );
    return () => unsubs.forEach((u) => u());
  }, [user, nav]);

  const orders = useMemo<UnifiedOrder[]>(() => {
    const seen = new Set<string>();
    const list: UnifiedOrder[] = [];
    for (const o of fsOrders) {
      const oid = o.orderId ?? o.id;
      if (!oid || seen.has(oid)) continue;
      seen.add(oid);
      list.push({ ...o, oid, source: 'app', createdMs: toMs(o.createdAt) });
    }
    for (const o of backendOrders) {
      const oid = o.orderId ?? o.id;
      if (!oid || seen.has(oid)) continue;
      seen.add(oid);
      list.push({ ...o, oid, source: 'website', createdMs: toMs((o.createdAt ?? o.placedAt ?? o.timestamp) as FsOrder['createdAt']) });
    }
    list.sort((a, b) => b.createdMs - a.createdMs);
    return list;
  }, [fsOrders, backendOrders]);

  const active = orders.filter((o) => { const s = stageOf(o); return s !== 3 && s !== -1; });
  const past = orders.filter((o) => { const s = stageOf(o); return s === 3 || s === -1; });
  const shown = tab === 'active' ? active : past;

  const cancelOrder = async (oid: string) => {
    if (!confirm('Cancel this order?')) return;
    setCancelling(oid);
    try {
      // Backend first (Redis + history), Firestore mirror best-effort
      await api.cancelOrder(oid).catch(() => null);
      try {
        const { doc, updateDoc, serverTimestamp } = await import('firebase/firestore');
        await updateDoc(doc(db, 'orders', oid), {
          stage: -1,
          status: 'Cancelled by Customer',
          cancelledAt: serverTimestamp(),
        });
      } catch { /* backend already handled it */ }
    } finally {
      setCancelling(null);
    }
  };

  const reorder = (o: UnifiedOrder) => {
    const raw = Array.isArray(o.items) ? (o.items as Record<string, unknown>[]) : [];
    const entries: [string, number][] = [];
    for (const i of raw) {
      const id = String(i.itemId ?? '');
      const qty = Math.max(1, Number(i.quantity ?? 1));
      if (id && allItems.some((c) => c.id === id)) entries.push([id, qty]);
    }
    if (entries.length === 0) return;
    addManyToCart(entries);
    setReordered(o.oid);
    setTimeout(() => nav('/'), 600);
  };

  if (!user) return null;
  if (loading) {
    return (
      <div className="section page-enter" style={{ maxWidth: 780 }}>
        <h2>My Orders</h2>
        <div className="skel" style={{ height: 110, marginTop: 16 }} />
        <div className="skel" style={{ height: 110, marginTop: 12 }} />
        <div className="skel" style={{ height: 110, marginTop: 12 }} />
      </div>
    );
  }

  return (
    <div className="section page-enter" style={{ maxWidth: 780 }}>
      <h2>My Orders</h2>
      <p style={{ color: '#66707D', fontSize: 13, marginBottom: 18 }}>
        App + website in one place — same number, one history.
      </p>

      <div className="tab-row">
        <button className={`tab-btn ${tab === 'active' ? 'on' : ''}`} onClick={() => setTab('active')}>
          🛵 Active ({active.length})
        </button>
        <button className={`tab-btn ${tab === 'past' ? 'on' : ''}`} onClick={() => setTab('past')}>
          🧾 Past Orders ({past.length})
        </button>
      </div>

      {shown.length === 0 ? (
        <div className="empty">
          <div className="empty-icon">{tab === 'active' ? '🛵' : '🧾'}</div>
          <h3>{tab === 'active' ? 'No active orders' : 'No past orders yet'}</h3>
          <p>{tab === 'active' ? 'Place a new order from the menu and track it live here.' : 'Your completed orders will appear here.'}</p>
          {tab === 'active' && (
            <button className="btn-primary" style={{ marginTop: 16 }} onClick={() => nav('/food')}>
              Order Food →
            </button>
          )}
        </div>
      ) : (
        shown.map((o) => {
          const stage = stageOf(o);
          const cancelled = stage === -1;
          const canCancel = !cancelled && stage < 2;
          const canReorder = (stage === 3 || cancelled) && Array.isArray(o.items) && (o.items as unknown[]).length > 0;
          const meta = statusMeta(stage, cancelled);
          return (
            <div key={o.oid} className="order-card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8 }}>
                <Link to={`/track/${encodeURIComponent(o.oid)}`} style={{ fontWeight: 800, color: '#14181D', fontSize: 15 }}>
                  #{o.oid.replace(/^FM-/, '')}
                </Link>
                <span style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                  {o.source === 'app' && (
                    <span style={{ fontSize: 10, fontWeight: 800, padding: '4px 8px', borderRadius: 20, background: '#F1F3F0', color: '#66707D' }}>
                      APP
                    </span>
                  )}
                  <span className={`status-pill ${meta.cls}`}>{meta.icon} {meta.label}</span>
                </span>
              </div>
              <div style={{ fontSize: 13, color: '#66707D', marginTop: 8 }}>
                {itemsText(o)} • <strong style={{ color: '#0a5c2f' }}>{totalOf(o)}</strong>
              </div>
              {(o.acceptedByName || o.riderName) && !cancelled && (
                <div style={{ fontSize: 12, color: '#66707D', marginTop: 5 }}>🛵 {o.acceptedByName ?? o.riderName}</div>
              )}
              <div style={{ display: 'flex', gap: 8, marginTop: 14, flexWrap: 'wrap' }}>
                <Link to={`/track/${encodeURIComponent(o.oid)}`} className="btn-ghost" style={{ padding: '9px 16px', fontSize: 13, textDecoration: 'none' }}>
                  {cancelled || stage >= 3 ? 'View Details' : 'Track Live →'}
                </Link>
                {canCancel && (
                  <button
                    className="btn-ghost"
                    style={{ padding: '9px 16px', fontSize: 13, color: '#C4271F' }}
                    disabled={cancelling === o.oid}
                    onClick={() => cancelOrder(o.oid)}
                  >
                    {cancelling === o.oid ? 'Cancelling…' : 'Cancel Order'}
                  </button>
                )}
                {canReorder && (
                  <button
                    className="btn-primary"
                    style={{ padding: '9px 16px', fontSize: 13 }}
                    onClick={() => reorder(o)}
                  >
                    {reordered === o.oid ? '✓ Added!' : 'Order Again'}
                  </button>
                )}
              </div>
            </div>
          );
        })
      )}
    </div>
  );
}

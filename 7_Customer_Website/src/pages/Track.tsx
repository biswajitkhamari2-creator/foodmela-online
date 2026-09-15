import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { doc, onSnapshot, serverTimestamp, updateDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { api } from '../api';

// ── LIVE TRACKING — LOGIC 100% PRESERVED ──
// Same Firestore listener + backend poll fallback, same cancel flow.
// Only the progress UI was redesigned.

const STEPS = [
  { label: 'Order Confirmed', icon: '🧾', sub: 'Kitchen has your order' },
  { label: 'Restaurant Preparing', icon: '👨‍🍳', sub: 'Fresh on the flame' },
  { label: 'Picked Up', icon: '🛍️', sub: 'Packed & handed over' },
  { label: 'On The Way', icon: '🛵', sub: 'Rider is nearby' },
  { label: 'Delivered', icon: '🏁', sub: 'Enjoy your meal!' },
];

interface LiveOrder {
  status?: string;
  stage?: number;
  totalAmount?: number;
  amountValue?: number;
  total?: string;
  acceptedByName?: string;
  riderName?: string;
  deliveryOtp?: string;
  customerName?: string;
  address?: string;
  itemsSummary?: string;
  items?: unknown;
}

export default function Track() {
  const { orderId } = useParams();
  const nav = useNavigate();
  const [order, setOrder] = useState<LiveOrder | null>(null);
  const [err, setErr] = useState('');
  const [cancelling, setCancelling] = useState(false);

  useEffect(() => {
    if (!orderId) return;
    let alive = true;

    // Primary: live Firestore listener — same doc the app + riders update.
    // Works for app orders AND website orders (mirrored at placement).
    const unsub = onSnapshot(
      doc(db, 'orders', orderId),
      (snap) => {
        if (!alive) return;
        if (snap.exists()) {
          setOrder(snap.data() as LiveOrder);
          setErr('');
        }
      },
      () => { /* listener error — backend poll below covers it */ },
    );

    // Fallback: backend Redis poll (covers website orders if mirror lags)
    const poll = async () => {
      try {
        const res = await api.orderStatus(orderId);
        if (alive && res.order) {
          setOrder((prev) => prev ?? (res.order as LiveOrder));
          setErr('');
        }
      } catch {
        if (alive && !order) setErr('Waiting for order updates...');
      }
    };
    void poll();
    const t = setInterval(poll, 8000);

    return () => { alive = false; clearInterval(t); unsub(); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orderId]);

  if (!orderId) return <div className="section"><div className="mela-empty"><h3>No order ID</h3></div></div>;

  const stage = typeof order?.stage === 'number' ? order.stage : 0;
  const cancelled = stage === -1;
  // Map existing stage → 5-node journey (presentation only, same stage).
  const stepIdx = cancelled ? 0 : stage >= 3 ? 4 : stage === 2 ? 3 : Math.min(2, Math.max(0, stage));
  const otp = order?.deliveryOtp ?? '';
  const canCancel = !cancelled && stage < 2;

  const cancelOrder = async () => {
    if (!confirm('Cancel this order?')) return;
    setCancelling(true);
    try {
      await api.cancelOrder(orderId).catch(() => null);
      try {
        await updateDoc(doc(db, 'orders', orderId), {
          stage: -1,
          status: 'Cancelled by Customer',
          cancelledAt: serverTimestamp(),
        });
      } catch { /* backend already handled it */ }
    } finally {
      setCancelling(false);
    }
  };

  const itemsText = (() => {
    if (typeof order?.items === 'string') return order.items;
    if (Array.isArray(order?.items)) {
      const parts = (order.items as Record<string, unknown>[]).map((i) => {
        const q = Number(i.quantity ?? 1);
        return `${q}x ${String(i.name ?? i.itemId ?? 'Item')}`;
      });
      if (parts.length > 0) return parts.join(', ');
    }
    return order?.itemsSummary ?? '';
  })();

  return (
    <div className="section page-enter" style={{ maxWidth: 720 }}>
      <Link to="/orders" style={{ color: '#0e9f4e', fontWeight: 700, fontSize: 14 }}>← My Orders</Link>
      <h2 style={{ margin: '12px 0 4px' }}>Order #{orderId.replace(/^FM-/, '')}</h2>
      <p style={{ color: '#66707D', fontSize: 13 }}>Live status — updates instantly, no refresh needed</p>

      <div className="track-card" style={{ marginTop: 18 }}>
        {cancelled ? (
          <div className="mela-empty" style={{ padding: '30px 10px' }}>
            <div className="mela-empty-icon">🚨</div>
            <h3>Order Cancelled</h3>
            <p>{order?.status ?? ''}</p>
          </div>
        ) : !order ? (
          <div>
            <div className="skel" style={{ height: 64, borderRadius: 32 }} />
            <div className="mela-empty" style={{ padding: '26px 10px 10px' }}>
              <div className="mela-empty-icon">⏳</div>
              <h3>Finding your order…</h3>
              <p>{err || 'Connecting to live updates.'}</p>
            </div>
          </div>
        ) : (
          <>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
              <span className={`status-pill ${stage >= 3 ? 'st-done' : stage === 2 ? 'st-way' : stage === 1 ? 'st-accepted' : 'st-placed'}`}>
                {stage >= 3 ? '🏁 DELIVERED' : stage === 2 ? '🛵 ON THE WAY' : stage === 1 ? '👨‍🍳 ACCEPTED' : '🧾 ORDER PLACED'}
              </span>
              <span style={{ fontSize: 13, color: '#66707D' }}>
                Total: <strong style={{ color: '#0a5c2f', fontSize: 17 }}>₹{order.totalAmount ?? order.amountValue ?? order.total ?? '—'}</strong>
              </span>
            </div>
            <div className="steps" role="list" aria-label="Delivery progress">
              {STEPS.map((s, i) => (
                <div
                  key={s.label}
                  role="listitem"
                  aria-current={i === stepIdx ? 'step' : undefined}
                  className={`step ${i < stepIdx ? 'done' : ''} ${i === stepIdx ? 'now' : ''}`}
                >
                  <div className="step-dot">{i < stepIdx ? '✓' : s.icon}</div>
                  <span>{s.label}</span>
                </div>
              ))}
            </div>
            <div style={{ fontSize: 13, color: '#66707D' }}>
              Status: <strong style={{ color: '#14181D' }}>{order.status ?? 'Order Placed'}</strong>
            </div>
            {itemsText && <div style={{ fontSize: 13, color: '#66707D', marginTop: 8 }}>🧾 {itemsText}</div>}
            {order.address && <div style={{ fontSize: 13, color: '#66707D', marginTop: 4 }}>📍 {order.address}</div>}
            {(order.acceptedByName || order.riderName) && (
              <div style={{ marginTop: 12, fontSize: 13, background: '#E7F6EC', borderRadius: 12, padding: '10px 14px' }}>
                🛵 Rider: <strong>{order.acceptedByName ?? order.riderName}</strong>
              </div>
            )}
            {otp && stage < 3 && (
              <>
                <div className="otp-box">
                  <span style={{ fontSize: 12, opacity: 0.85 }}>Share this OTP with your rider ONLY after checking package seal</span>
                  <strong>{otp}</strong>
                </div>
                <div style={{ marginTop: 8, fontSize: 11.5, color: '#4B5563', background: '#FFFBEB', border: '1px solid #FDE68A', padding: '8px 12px', borderRadius: 10, lineHeight: 1.45, textAlign: 'left' }}>
                  🛡️ <strong>Safety Advisory:</strong> Inspect your package seal / staples upon arrival. If the seal is broken or tampered with, do <strong>NOT</strong> share your OTP and immediately call Helpline at <a href="tel:8144503650" style={{ color: '#0e9f4e', fontWeight: 700 }}>8144503650</a>.
                </div>
              </>
            )}
            {canCancel && (
              <button
                className="btn-ghost"
                style={{ marginTop: 16, color: '#C4271F', width: '100%' }}
                disabled={cancelling}
                onClick={cancelOrder}
              >
                {cancelling ? 'Cancelling…' : 'Cancel Order'}
              </button>
            )}
            <div style={{ marginTop: 14, fontSize: 13, color: '#66707D', textAlign: 'center' }}>
              Need help? Call support at{' '}
              <a href="tel:8144503650" style={{ color: '#0e9f4e', fontWeight: 700 }}>
                8144503650
              </a>
            </div>
            {err && <p style={{ color: '#9AA3AF', fontSize: 12, marginTop: 10 }}>{err}</p>}
          </>
        )}
      </div>

      <div style={{ marginTop: 16, display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' }}>
        <button className="btn-ghost" style={{ fontSize: 13 }} onClick={() => nav('/')}>← Back to Home</button>
        <button className="btn-primary" style={{ fontSize: 13 }} onClick={() => nav('/orders')}>All Orders</button>
      </div>
    </div>
  );
}

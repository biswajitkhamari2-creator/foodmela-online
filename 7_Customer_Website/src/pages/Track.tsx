import { useEffect, useState, useMemo } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { doc, onSnapshot, serverTimestamp, updateDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { api } from '../api';
import InvoiceModal from '../components/InvoiceModal';

interface LiveOrder {
  status?: string;
  stage?: number;
  totalAmount?: number;
  amountValue?: number;
  total?: string;
  acceptedByName?: string;
  riderName?: string;
  riderPhone?: string;
  deliveryOtp?: string;
  customerName?: string;
  customerPhone?: string;
  phone?: string;
  address?: string;
  itemsSummary?: string;
  items?: unknown;
  paymentMethod?: string;
  placedAt?: string;
  timestamp?: string;
  riderLat?: number;
  riderLng?: number;
  deliveryLat?: number;
  deliveryLng?: number;
}

const MILESTONES = [
  { label: 'Order Confirmed', sub: 'Kitchen accepted your order', icon: '🧾' },
  { label: 'Kitchen Preparing', sub: 'Chef is preparing fresh items', icon: '👨‍🍳' },
  { label: 'Ready & Packed', sub: 'Order packed & seal verified', icon: '🛍️' },
  { label: 'Out for Delivery', sub: 'Rider is on the way to you', icon: '🛵' },
  { label: 'Delivered', sub: 'Enjoy your delicious meal!', icon: '🏁' },
];

export default function Track() {
  const { orderId } = useParams();
  const nav = useNavigate();
  const [order, setOrder] = useState<LiveOrder | null>(null);
  const [err, setErr] = useState('');
  const [cancelling, setCancelling] = useState(false);
  const [showInvoice, setShowInvoice] = useState(false);
  const [copiedId, setCopiedId] = useState(false);
  const [copiedOtp, setCopiedOtp] = useState(false);
  const [remainingCancelSeconds, setRemainingCancelSeconds] = useState<number>(0);

  const cleanOrderId = useMemo(() => {
    if (!orderId) return '';
    return orderId.startsWith('FM-') ? orderId : `FM-${orderId}`;
  }, [orderId]);

  useEffect(() => {
    if (!orderId) return;
    let alive = true;

    // Primary: live Firestore listener
    const unsub = onSnapshot(
      doc(db, 'orders', orderId),
      (snap) => {
        if (!alive) return;
        if (snap.exists()) {
          setOrder(snap.data() as LiveOrder);
          setErr('');
        }
      },
      () => { /* listener error — covered by polling below */ },
    );

    // Fallback: backend Redis poll
    const poll = async () => {
      try {
        const res = await api.orderStatus(orderId);
        if (alive && res.order) {
          setOrder((prev) => prev ?? (res.order as LiveOrder));
          setErr('');
        }
      } catch {
        if (alive && !order) setErr('Connecting to live updates...');
      }
    };
    void poll();
    const t = setInterval(poll, 7000);

    return () => {
      alive = false;
      clearInterval(t);
      unsub();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orderId]);

  // Cancel countdown timer (120 seconds window from order placed)
  useEffect(() => {
    if (!order) return;
    const timeStr = order.placedAt || order.timestamp;
    if (!timeStr) {
      setRemainingCancelSeconds(120);
      return;
    }
    const calcSeconds = () => {
      try {
        const placed = new Date(timeStr).getTime();
        const now = Date.now();
        const diffSecs = Math.max(0, 120 - Math.floor((now - placed) / 1000));
        setRemainingCancelSeconds(diffSecs);
      } catch {
        setRemainingCancelSeconds(0);
      }
    };
    calcSeconds();
    const interval = setInterval(calcSeconds, 1000);
    return () => clearInterval(interval);
  }, [order]);

  if (!orderId) {
    return (
      <div className="section track-page-wrap">
        <div className="mela-empty">
          <div className="mela-empty-icon">❓</div>
          <h3>No Order ID Provided</h3>
          <p>Please select an order from your order history.</p>
          <button className="btn-primary" style={{ marginTop: 16 }} onClick={() => nav('/orders')}>
            Go to My Orders
          </button>
        </div>
      </div>
    );
  }

  const stage = typeof order?.stage === 'number' ? order.stage : 0;
  const isCancelled = stage === -1;
  const stepIdx = isCancelled ? 0 : stage >= 3 ? 4 : stage === 2 ? 3 : stage === 1 ? 1 : 0;
  const otp = order?.deliveryOtp ? String(order.deliveryOtp) : '';
  const canCancel = !isCancelled && stage < 2 && remainingCancelSeconds > 0;

  const cancelOrder = async () => {
    if (!confirm('Are you sure you want to cancel this order?')) return;
    setCancelling(true);
    setErr('');
    try {
      const res = await api.cancelOrder(orderId).catch((e: unknown) => {
        throw e instanceof Error ? e : new Error('Cancel failed');
      });
      if (!res.success) throw new Error('Cancel failed');
      try {
        await updateDoc(doc(db, 'orders', orderId), {
          stage: -1,
          status: 'Cancelled by Customer',
          cancelledAt: serverTimestamp(),
        });
      } catch { /* backend mirror handled it */ }
      setOrder((prev) => (prev ? { ...prev, stage: -1, status: 'Cancelled by Customer' } : prev));
    } catch (e) {
      const msg = e instanceof Error ? e.message : '';
      setErr(
        msg.includes('Too late') ? 'Too late to cancel — rider is already assigned. Call 8144503650 for assistance.'
        : msg.includes('Not your order') ? 'This order belongs to another phone number.'
        : msg.includes('Session expired') ? 'Session expired. Please log in again.'
        : 'Could not cancel order. Please check your internet or call 8144503650.',
      );
    } finally {
      setCancelling(false);
    }
  };

  const copyToClipboard = (text: string, type: 'id' | 'otp') => {
    try {
      void navigator.clipboard.writeText(text);
      if (type === 'id') {
        setCopiedId(true);
        setTimeout(() => setCopiedId(false), 2000);
      } else {
        setCopiedOtp(true);
        setTimeout(() => setCopiedOtp(false), 2000);
      }
    } catch { /* ignore */ }
  };

  interface ParsedItem {
    qty: number;
    name: string;
    price?: number;
  }

  const parsedItems: ParsedItem[] = (() => {
    if (!order) return [];
    if (Array.isArray(order.items)) {
      return (order.items as Record<string, unknown>[]).map((it) => ({
        qty: Number(it.quantity ?? 1),
        name: String(it.name ?? it.itemId ?? 'Item'),
        price: it.price ? Number(it.price) : undefined,
      }));
    }
    if (typeof order.items === 'string' && order.items.trim()) {
      return order.items.split(',').map((s) => ({
        qty: 1,
        name: s.trim(),
      }));
    }
    if (order.itemsSummary) {
      return order.itemsSummary.split(',').map((s) => ({
        qty: 1,
        name: s.trim(),
      }));
    }
    return [];
  })();

  const formatPlacedTime = () => {
    const raw = order?.placedAt || order?.timestamp;
    if (!raw) return 'Recently';
    try {
      const d = new Date(raw);
      return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });
    } catch {
      return 'Recently';
    }
  };

  const progressPercent = isCancelled
    ? 100
    : stage >= 3
    ? 100
    : stage === 2
    ? 75
    : stage === 1
    ? 45
    : 15;

  const totalAmount = order?.totalAmount ?? order?.amountValue ?? (order?.total ? order.total.replace(/[^0-9]/g, '') : '—');
  const riderName = order?.acceptedByName || order?.riderName;

  return (
    <div className="track-page-wrap page-enter">
      {/* Top Navigation & Live Beacon */}
      <div className="track-top-bar">
        <Link to="/orders" className="track-back-link">
          <span>←</span>
          <span>My Orders</span>
        </Link>
        <div className="track-live-beacon">
          <span className="track-pulse-dot" />
          <span>LIVE TRACKING</span>
        </div>
      </div>

      {/* Hero Status Banner */}
      <div className="track-hero-card">
        <div className="track-hero-glow" />
        <div className="track-hero-header">
          <div>
            <div
              className="track-order-id-chip"
              onClick={() => copyToClipboard(cleanOrderId, 'id')}
              title="Click to copy Order ID"
            >
              <span>{cleanOrderId}</span>
              <span style={{ fontSize: 11, opacity: 0.8 }}>{copiedId ? '✓ Copied' : '📋'}</span>
            </div>
            <div className="track-hero-time" style={{ marginTop: 6 }}>
              Placed at {formatPlacedTime()}
            </div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <span style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: 0.6, opacity: 0.8, display: 'block' }}>
              Grand Total
            </span>
            <span style={{ fontSize: 22, fontWeight: 900, color: '#ffc531' }}>
              ₹{totalAmount}
            </span>
          </div>
        </div>

        <div className="track-hero-body">
          <div className="track-hero-icon-box">
            {isCancelled ? '🚨' : stage >= 3 ? '🎉' : stage === 2 ? '🛵' : stage === 1 ? '🍳' : '🧾'}
          </div>
          <div>
            <h1 className="track-hero-title">
              {isCancelled
                ? 'Order Cancelled'
                : stage >= 3
                ? 'Order Delivered'
                : stage === 2
                ? 'Out For Delivery'
                : stage === 1
                ? 'Kitchen Preparing'
                : 'Order Confirmed'}
            </h1>
            <p className="track-hero-sub">
              {isCancelled
                ? order?.status || 'This order was cancelled.'
                : stage >= 3
                ? 'Delivered safely! Enjoy your meal.'
                : stage === 2
                ? riderName ? `${riderName} is heading towards your doorstep.` : 'Rider picked up your order and is heading towards you.'
                : stage === 1
                ? 'The chef is preparing your meal with fresh ingredients.'
                : 'Your order is confirmed and sent to the kitchen.'}
            </p>
          </div>
        </div>

        {/* Shimmering Progress Bar */}
        {!isCancelled && (
          <div className="track-progress-wrap">
            <div className="track-progress-info">
              <span>{stage >= 3 ? 'Complete' : stage === 2 ? 'Almost there (~10-15 mins)' : stage === 1 ? 'Cooking (~20-25 mins)' : 'Estimated Arrival (~30 mins)'}</span>
              <span>{progressPercent}%</span>
            </div>
            <div className="track-progress-track">
              <div className="track-progress-fill" style={{ width: `${progressPercent}%` }} />
            </div>
          </div>
        )}
      </div>

      {/* Visual Journey Stepper */}
      <div className="track-card-section">
        <h2 className="track-card-title">
          <span>📦</span>
          <span>Delivery Journey</span>
        </h2>

        <div className="track-timeline">
          {MILESTONES.map((m, i) => {
            const isDone = !isCancelled && i < stepIdx;
            const isActive = !isCancelled && i === stepIdx;
            const isLast = i === MILESTONES.length - 1;

            return (
              <div
                key={m.label}
                className={`track-timeline-step ${isDone ? 'done' : ''} ${isActive ? 'active' : ''}`}
              >
                {!isLast && (
                  <div className={`track-timeline-line ${isDone ? 'done' : ''}`} />
                )}
                <div className="track-timeline-node">
                  {isDone ? '✓' : m.icon}
                </div>
                <div className="track-timeline-content">
                  <div className="track-timeline-head">
                    <span className="track-step-name">{m.label}</span>
                    {isActive && <span className="track-step-badge">CURRENT</span>}
                  </div>
                  <p className="track-step-desc">{m.sub}</p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Live Route Radar / Animated Track */}
        {!isCancelled && stage < 3 && (
          <div className="track-route-card">
            <div className="track-route-flex">
              <div className="track-route-point">
                <div className="track-route-icon" style={{ borderColor: '#0e9f4e' }}>🏪</div>
                <span className="track-route-title">Kitchen</span>
                <span className="track-route-sub">Birmaharajpur</span>
              </div>

              <div className="track-route-track-line">
                <div className="track-route-track-fill" style={{ width: `${Math.max(20, progressPercent)}%` }} />
                <div
                  className="track-route-scooter"
                  style={{ left: `${Math.min(90, Math.max(15, progressPercent))}%` }}
                >
                  🛵
                </div>
              </div>

              <div className="track-route-point">
                <div className="track-route-icon" style={{ borderColor: stage >= 2 ? '#ffc531' : '#d1d5db' }}>🏠</div>
                <span className="track-route-title">Your Home</span>
                <span className="track-route-sub">{order?.address ? order.address.split(',')[0] : 'Delivery Pin'}</span>
              </div>
            </div>
          </div>
        )}

        {/* Delivery Partner Card (When assigned) */}
        {riderName && !isCancelled && (
          <div className="track-rider-card">
            <div className="track-rider-info">
              <div className="track-rider-avatar">
                🛵
              </div>
              <div>
                <div className="track-rider-name">{riderName}</div>
                <div className="track-rider-badge">
                  <span>🛡️ Verified Delivery Partner</span>
                  <span>•</span>
                  <span>⭐ 4.9</span>
                </div>
              </div>
            </div>
            <a
              href={`tel:${order?.riderPhone || '8144503650'}`}
              className="track-rider-call-btn"
            >
              <span>📞</span>
              <span>Call Rider</span>
            </a>
          </div>
        )}
      </div>

      {/* High-Security Delivery OTP Vault Card */}
      {otp && !isCancelled && stage < 3 && (
        <div className="track-otp-container">
          <div className="track-otp-top">
            <span className="track-otp-label">
              <span>🛡️</span>
              <span>Delivery Verification PIN</span>
            </span>
            <button
              type="button"
              className="track-otp-copy-btn"
              onClick={() => copyToClipboard(otp, 'otp')}
            >
              {copiedOtp ? '✓ Copied' : 'Copy PIN'}
            </button>
          </div>

          <div className="track-otp-boxes">
            {otp.split('').map((digit, idx) => (
              <div key={idx} className="track-otp-digit">
                {digit}
              </div>
            ))}
          </div>

          <div className="track-otp-security-note">
            ⚠️ <strong>Important:</strong> Share this 4-digit PIN with your delivery partner <strong>ONLY</strong> after checking the sealed package at your door. Never share over phone call.
          </div>
        </div>
      )}

      {/* Order Details & Summary Card */}
      <div className="track-card-section" style={{ marginTop: 20 }}>
        <h2 className="track-card-title">
          <span>🧾</span>
          <span>Order Summary</span>
        </h2>

        <div className="track-info-grid">
          {/* Items */}
          <div className="track-info-item">
            <span className="track-info-icon">🍲</span>
            <div style={{ flex: 1 }}>
              <div className="track-info-label">Items Ordered</div>
              <div className="track-info-val">
                {parsedItems.length > 0 ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                    {parsedItems.map((item, i) => (
                      <div key={i} style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span>{item.qty > 1 ? `${item.qty}x ` : ''}{item.name}</span>
                        {item.price ? <span>₹{item.price * item.qty}</span> : null}
                      </div>
                    ))}
                  </div>
                ) : (
                  <span>{order?.itemsSummary || 'Delicious food items'}</span>
                )}
              </div>
            </div>
          </div>

          {/* Delivery Address */}
          {order?.address && (
            <div className="track-info-item">
              <span className="track-info-icon">📍</span>
              <div>
                <div className="track-info-label">Delivery Address</div>
                <div className="track-info-val">{order.address}</div>
                {order.customerName && (
                  <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 2 }}>
                    Recipient: {order.customerName} {order.phone ? `(${order.phone})` : ''}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Payment Method */}
          <div className="track-info-item">
            <span className="track-info-icon">💳</span>
            <div>
              <div className="track-info-label">Payment Mode</div>
              <div className="track-info-val">
                {order?.paymentMethod?.toUpperCase() === 'PHONEPE' || (!order?.address?.includes('[COD]') && !order?.paymentMethod)
                  ? '⚡ Prepaid Online (PhonePe UPI)'
                  : '💵 Cash On Delivery (COD)'}
              </div>
            </div>
          </div>
        </div>

        {/* View Tax Invoice Button */}
        <button
          type="button"
          className="btn-ghost"
          style={{
            marginTop: 18,
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
            padding: '12px 18px',
            fontSize: 14,
            fontWeight: 700,
          }}
          onClick={() => setShowInvoice(true)}
        >
          <span>🧾</span>
          <span>View Official Bill / Tax Invoice</span>
        </button>

        {/* Cancellation Section */}
        {canCancel && (
          <div className="track-cancel-box">
            <div className="track-cancel-text">
              ⏱️ You can cancel within <strong>{Math.floor(remainingCancelSeconds / 60)}m {remainingCancelSeconds % 60}s</strong> before kitchen preparation starts.
            </div>
            <button
              type="button"
              className="track-cancel-btn"
              disabled={cancelling}
              onClick={cancelOrder}
            >
              {cancelling ? 'Cancelling…' : 'Cancel Order'}
            </button>
          </div>
        )}
      </div>

      {/* Support & Quick Navigation */}
      <div style={{ marginTop: 24, textAlign: 'center' }}>
        <p style={{ fontSize: 13, color: 'var(--muted)', marginBottom: 14 }}>
          Need assistance with your order? Our support team is ready to help:{' '}
          <a href="tel:8144503650" style={{ color: 'var(--leaf-deep)', fontWeight: 800 }}>
            8144503650
          </a>
        </p>

        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
          <button className="btn-ghost" style={{ fontSize: 13 }} onClick={() => nav('/')}>
            ← Back to Home
          </button>
          <button className="btn-primary" style={{ fontSize: 13 }} onClick={() => nav('/orders')}>
            View All Orders
          </button>
        </div>
      </div>

      {err && (
        <p style={{ color: 'var(--chili-deep)', fontSize: 12.5, textAlign: 'center', marginTop: 14, fontWeight: 600 }}>
          {err}
        </p>
      )}

      {/* Invoice Modal Portal */}
      <InvoiceModal
        order={showInvoice && order ? { ...order, oid: cleanOrderId } : null}
        onClose={() => setShowInvoice(false)}
      />
    </div>
  );
}


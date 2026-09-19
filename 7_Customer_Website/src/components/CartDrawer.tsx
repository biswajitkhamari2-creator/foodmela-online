import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api, getApiToken } from '../api';
import { useShop } from '../store';
import { getItemWeight } from '../data/catalog';

// UI-only reskin. Cart math, delivery-fee rule, placeOrder payload,
// backend endpoint + Firestore mirror (inside api.placeOrder) — untouched.
const FREE_DELIVERY_OVER = 299;
const DELIVERY_FEE = 39;
// Platform fee (₹7) — charged to the customer on every non-empty order,
// shown as its own bill row and included in the placed totalAmount.
const PLATFORM_FEE = 7;

// Static fallback coupons — live admin promos (from Firestore) take priority
const STATIC_COUPONS = [
  { code: 'MEGA70', discount: 70, minOrder: 220, label: 'Mega Feast ₹70 OFF' },
  { code: 'FEAST60', discount: 60, minOrder: 160, label: 'Special Treat ₹60 OFF' },
  { code: 'MELA50', discount: 50, minOrder: 100, label: 'Mela Welcome ₹50 OFF' },
] as const;

export default function CartDrawer({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { cart, addToCart, removeFromCart, clearCart, priceOf, mrpOf, cartTotal, cartCount, user, allItems, livePromos } = useShop();
  const nav = useNavigate();
  const [address, setAddress] = useState('');
  const [paymentMode, setPaymentMode] = useState<'cod' | 'prepaid'>('prepaid');
  const [selectedCouponCode, setSelectedCouponCode] = useState<string | null>(null);
  const [couponInput, setCouponInput] = useState('');
  const [couponError, setCouponError] = useState<string | null>(null);
  const [placing, setPlacing] = useState(false);
  const [err, setErr] = useState('');

  if (!open) return null;

  const lines = [...cart.entries()]
    .map(([id, qty]) => ({ item: allItems.find((c) => c.id === id)!, qty }))
    .filter((l) => l.item);

  const mrpTotal = lines.reduce((s, l) => {
    const mrp = mrpOf(l.item);
    return s + (mrp ?? priceOf(l.item)) * l.qty;
  }, 0);
  const savings = Math.max(0, mrpTotal - cartTotal);
  const deliveryFee = cartTotal >= FREE_DELIVERY_OVER || cartTotal === 0 ? 0 : DELIVERY_FEE;
  const platformFee = cartTotal === 0 ? 0 : PLATFORM_FEE;

  // Live admin promos → discount computed from type/value; static fallback below
  const liveCoupons = livePromos.map((p) => {
    const raw = p.discountType === 'percent'
      ? Math.floor((cartTotal * p.discountValue) / 100)
      : p.discountValue;
    const discount = p.maxDiscount > 0 ? Math.min(raw, p.maxDiscount) : raw;
    return {
      code: p.code.toUpperCase(),
      discount,
      minOrder: p.minOrder,
      label: `${p.title} — ${p.code}`,
      title: p.title,
    };
  });
  const COUPONS = [
    ...liveCoupons,
    ...STATIC_COUPONS.filter((s) => !liveCoupons.some((l) => l.code === s.code.toUpperCase())).map((s) => ({
      code: s.code,
      discount: s.discount,
      minOrder: s.minOrder,
      label: s.label,
      title: s.label,
    })),
  ];

  // Best eligible coupon based on cartTotal
  const bestEligibleCoupon = COUPONS.find((c) => cartTotal >= c.minOrder) || null;
  const effectiveCoupon =
    selectedCouponCode === 'NONE'
      ? null
      : selectedCouponCode
      ? COUPONS.find((c) => c.code.toUpperCase() === selectedCouponCode.toUpperCase() && cartTotal >= c.minOrder) ?? null
      : bestEligibleCoupon;
  const discountAmount = effectiveCoupon ? effectiveCoupon.discount : 0;

  const handleApplyCoupon = (codeToApply?: string) => {
    const code = (codeToApply ?? couponInput).trim().toUpperCase();
    if (!code) {
      setCouponError('Please enter a promo code');
      return;
    }
    if (cartTotal <= 0) {
      setCouponError('Add items to cart first');
      return;
    }
    const found = COUPONS.find((c) => c.code.toUpperCase() === code);
    if (!found) {
      setCouponError(`Promo code "${code}" is invalid or expired`);
      return;
    }
    if (cartTotal < found.minOrder) {
      const diff = found.minOrder - cartTotal;
      setCouponError(`Add items worth ₹${diff} more to apply ${found.code} (Min order ₹${found.minOrder})`);
      return;
    }
    setSelectedCouponCode(found.code);
    setCouponInput(found.code);
    setCouponError(null);
  };

  const handleRemoveCoupon = () => {
    setSelectedCouponCode('NONE');
    setCouponInput('');
    setCouponError(null);
  };

  const grand = Math.max(0, cartTotal + deliveryFee + platformFee - discountAmount);
  const awayFromFree = Math.max(0, FREE_DELIVERY_OVER - cartTotal);
  const progress = Math.min(100, Math.round((cartTotal / FREE_DELIVERY_OVER) * 100));

  const isCodAllowed = grand <= 100;
  const effectiveMode = isCodAllowed && paymentMode === 'cod' ? 'COD' : 'PREPAID';

  const placeOrder = async () => {
    if (!user) { onClose(); nav('/login'); return; }
    const addr = (address || user.address).trim();
    if (!addr) { setErr('Enter a delivery address'); return; }
    if (lines.length === 0) return;
    setPlacing(true);
    setErr('');

    // If PREPAID, redirect to PayU payment page via auto-submit form
    if (effectiveMode === 'PREPAID') {
      try {
        const orderAddr = effectiveCoupon
          ? `${addr} [PREPAID] [Coupon: ${effectiveCoupon.code} (-₹${discountAmount})]`
          : `${addr} [PREPAID]`;

        const payuToken = getApiToken();
        const initResp = await fetch('/api/payu/initiate', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(payuToken ? { 'Authorization': `Bearer ${payuToken}` } : {}),
          },
          body: JSON.stringify({
            customerName: user.name,
            phone: user.phone,
            email: `${String(user.phone).replace(/[^0-9]/g, '')}@foodmela.online`,
            address: orderAddr,
            items: lines.map((l) => ({
              itemId: l.item.id,
              name: `${l.item.name} (${getItemWeight(l.item)})`,
              quantity: l.qty,
              price: priceOf(l.item),
              totalPrice: priceOf(l.item) * l.qty,
            })),
            totalAmount: grand,
          }),
        });

        const initData = await initResp.json();

        if (initData.success && initData.payuUrl && initData.fields) {
          const form = document.createElement('form');
          form.method = 'POST';
          form.action = initData.payuUrl;
          for (const [k, v] of Object.entries(initData.fields as Record<string, string>)) {
            const input = document.createElement('input');
            input.type = 'hidden';
            input.name = k;
            input.value = v ?? '';
            form.appendChild(input);
          }
          document.body.appendChild(form);
          form.submit();
          return;
        }
        setErr(initData.error || 'Payment gateway unavailable — try COD (≤ ₹100)');
        setPlacing(false);
        return;
      } catch (e) {
        console.warn('PayU initiate error:', e);
        setErr('Payment gateway unreachable — try again or use COD (≤ ₹100)');
        setPlacing(false);
        return;
      }
    }

    try {
      const res = await api.placeOrder({
        customerName: user.name,
        phone: user.phone,
        address: effectiveCoupon
          ? `${addr} [${effectiveMode}] [Coupon: ${effectiveCoupon.code} (-₹${discountAmount})]`
          : `${addr} [${effectiveMode}]`,
        items: lines.map((l) => ({
          itemId: l.item.id,
          name: `${l.item.name} (${getItemWeight(l.item)})`,
          quantity: l.qty,
          price: priceOf(l.item),
          totalPrice: priceOf(l.item) * l.qty,
        })),
        totalAmount: grand,
      });
      clearCart();
      onClose();
      const oid = res.order.orderId ?? res.order.id;
      nav(`/track/${encodeURIComponent(oid)}`);
    } catch (e: unknown) {
      setErr(e instanceof Error ? e.message : 'Order failed — is the backend online?');
    }
    setPlacing(false);
  };

  return (
    <>
      <div className="drawer-overlay" onClick={onClose} />
      <div className="drawer" role="dialog" aria-modal="true" aria-label="Your cart">
        <div className="drawer-head">
          <div>
            <h3>Your Cart 🛒</h3>
            <small>{cartCount} item{cartCount === 1 ? '' : 's'} · Birmaharajpur delivery</small>
          </div>
          <button className="drawer-close" onClick={onClose} aria-label="Close cart">✕</button>
        </div>
        <div className="drawer-body">
          {lines.length === 0 ? (
            <div className="drawer-empty">
              <span className="empty-ic" aria-hidden="true">🧺</span>
              <h4>Your mela bag is empty</h4>
              <p>Explore Birmaharajpur favourites and fill your thali today!</p>
              <button className="btn-primary" onClick={onClose}>Explore Catalog</button>
            </div>
          ) : (
            <>
              {awayFromFree > 0 ? (
                <div className="free-del-progress">
                  <span>Add <strong>₹{awayFromFree}</strong> more for <strong>FREE delivery!</strong></span>
                  <div className="bar" role="progressbar" aria-valuenow={progress} aria-valuemin={0} aria-valuemax={100}>
                    <i style={{ width: `${progress}%` }} />
                  </div>
                </div>
              ) : (
                <div className="free-del-progress" style={{ background: '#E7F6EC', borderColor: '#BFE6CC', color: '#0a5c2f' }}>
                  🎉 You&apos;ve unlocked <strong>FREE delivery!</strong>
                  <div className="bar"><i style={{ width: '100%' }} /></div>
                </div>
              )}
              {lines.map((l) => {
                const w = getItemWeight(l.item);
                return (
                  <div key={l.item.id} className="cart-line">
                    <img src={l.item.image} alt={l.item.name} loading="lazy" />
                    <div className="cl-info">
                      <strong>{l.item.name}</strong>
                      <span className="unit">
                        <span className="cl-weight-badge">⚖️ {w}</span> · ₹{priceOf(l.item)}
                      </span>
                      <div className="cl-total">₹{priceOf(l.item) * l.qty}</div>
                    </div>
                    <div className="qty-ctl mini">
                      <button onClick={() => removeFromCart(l.item.id)} aria-label={`Remove one ${l.item.name}`}>−</button>
                      <strong aria-live="polite">{l.qty}</strong>
                      <button onClick={() => addToCart(l.item.id)} aria-label={`Add one more ${l.item.name}`}>+</button>
                    </div>
                  </div>
                );
              })}
              {/* 🏷️ Discount Coupons Section (Admin live promos + manual code input) */}
              <div
                style={{
                  background: 'linear-gradient(135deg, #FFFDF8 0%, #FEF9EE 100%)',
                  border: '1.5px dashed #F59E0B',
                  borderRadius: '12px',
                  padding: '12px',
                  marginTop: '12px',
                  marginBottom: '8px',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                  <span
                    style={{
                      fontSize: '12px',
                      fontWeight: 800,
                      color: '#B45309',
                      textTransform: 'uppercase',
                      letterSpacing: '0.6px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '5px',
                    }}
                  >
                    🏷️ Promo Code & Offers
                  </span>
                  {effectiveCoupon && (
                    <button
                      type="button"
                      onClick={handleRemoveCoupon}
                      style={{
                        fontSize: '11px',
                        color: '#DC2626',
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        fontWeight: 700,
                        padding: '2px 6px',
                      }}
                    >
                      Remove
                    </button>
                  )}
                </div>

                {/* Manual Promo Code Input Box */}
                <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
                  <input
                    type="text"
                    value={couponInput}
                    onChange={(e) => {
                      setCouponInput(e.target.value.toUpperCase());
                      setCouponError(null);
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleApplyCoupon();
                      }
                    }}
                    placeholder="Enter promo code (e.g. MEGA70)"
                    style={{
                      flex: 1,
                      padding: '8px 12px',
                      fontSize: '12px',
                      fontWeight: 700,
                      textTransform: 'uppercase',
                      border: '1.5px solid #F59E0B',
                      borderRadius: '8px',
                      outline: 'none',
                      background: '#FFFFFF',
                      color: '#1F2937',
                      letterSpacing: '0.6px',
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => handleApplyCoupon()}
                    style={{
                      padding: '8px 14px',
                      fontSize: '12px',
                      fontWeight: 800,
                      backgroundColor: '#D97706',
                      color: '#FFFFFF',
                      border: 'none',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      transition: 'background 0.15s ease',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    Apply
                  </button>
                </div>

                {couponError && (
                  <div
                    style={{
                      padding: '6px 10px',
                      background: '#FEF2F2',
                      border: '1px solid #FCA5A5',
                      borderRadius: '6px',
                      color: '#DC2626',
                      fontSize: '11px',
                      fontWeight: 600,
                      marginBottom: '8px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                    }}
                  >
                    <span>⚠️</span>
                    <span>{couponError}</span>
                  </div>
                )}

                {effectiveCoupon ? (
                  <div
                    style={{
                      padding: '6px 10px',
                      background: '#E7F6EC',
                      border: '1px solid #A7F3D0',
                      borderRadius: '6px',
                      color: '#047857',
                      fontSize: '11px',
                      fontWeight: 700,
                      marginBottom: '10px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                    }}
                  >
                    <span>🎉</span>
                    <span>
                      Coupon <strong>{effectiveCoupon.code}</strong> applied! You save <strong>₹{discountAmount}</strong>!
                    </span>
                  </div>
                ) : null}

                {COUPONS.length > 0 && (
                  <>
                    <div style={{ fontSize: '10.5px', fontWeight: 700, color: '#92400E', marginBottom: '6px' }}>
                      ⚡ Or tap to apply:
                    </div>
                    <div
                      style={{
                        display: 'grid',
                        gridTemplateColumns: `repeat(${Math.min(COUPONS.length, 3)}, 1fr)`,
                        gap: '6px',
                      }}
                    >
                      {COUPONS.map((c) => {
                        const isEligible = cartTotal >= c.minOrder;
                        const isApplied = effectiveCoupon?.code === c.code;
                        return (
                          <button
                            key={c.code}
                            type="button"
                            disabled={!isEligible}
                            onClick={() => handleApplyCoupon(c.code)}
                            style={{
                              padding: '8px 4px',
                              borderRadius: '10px',
                              border: isApplied
                                ? '2px solid #0e9f4e'
                                : isEligible
                                  ? '1.5px solid #F59E0B'
                                  : '1px solid #E5E7EB',
                              background: isApplied
                                ? '#E7F6EC'
                                : isEligible
                                  ? '#FFFFFF'
                                  : '#F3F4F6',
                              color: isApplied ? '#0a5c2f' : isEligible ? '#1F2937' : '#9CA3AF',
                              cursor: isEligible ? 'pointer' : 'not-allowed',
                              textAlign: 'center',
                              display: 'flex',
                              flexDirection: 'column',
                              alignItems: 'center',
                              justifyContent: 'center',
                              boxShadow: isApplied ? '0 2px 6px rgba(14, 159, 78, 0.18)' : 'none',
                              transition: 'all 0.15s ease',
                              fontFamily: 'inherit',
                            }}
                          >
                            <span
                              style={{
                                fontSize: '11px',
                                fontWeight: 800,
                                color: isApplied ? '#0e9f4e' : isEligible ? '#D97706' : '#9CA3AF',
                              }}
                            >
                              {c.code}
                            </span>
                            <span
                              style={{
                                fontSize: '13px',
                                fontWeight: 900,
                                color: isApplied ? '#0a5c2f' : isEligible ? '#111827' : '#9CA3AF',
                              }}
                            >
                              ₹{c.discount} OFF
                            </span>
                            <span
                              style={{
                                fontSize: '9.5px',
                                fontWeight: 600,
                                color: isApplied ? '#0e9f4e' : isEligible ? '#059669' : '#9CA3AF',
                                marginTop: '2px',
                              }}
                            >
                              {isApplied ? '✓ Applied' : isEligible ? 'Tap to apply' : `Min ₹${c.minOrder}`}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </>
                )}
              </div>

              <div className="bill-box">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <h4 style={{ margin: 0 }}>Bill Details</h4>
                  {effectiveCoupon && (
                    <span style={{ fontSize: '11px', fontWeight: 800, color: '#0e9f4e', background: '#E7F6EC', padding: '2px 8px', borderRadius: '6px' }}>
                      ₹{discountAmount} SAVED
                    </span>
                  )}
                </div>
                <div className="bill-row"><span>Subtotal</span><span>₹{cartTotal}</span></div>
                {effectiveCoupon && (
                  <div
                    className="bill-row save"
                    style={{
                      color: '#0e9f4e',
                      fontWeight: 700,
                      background: '#E7F6EC',
                      padding: '6px 10px',
                      borderRadius: '8px',
                      margin: '6px 0',
                      border: '1px solid #BFE6CC',
                    }}
                  >
                    <span>Special Discount ({effectiveCoupon.code}) 🎉</span>
                    <span>− ₹{discountAmount}</span>
                  </div>
                )}
                {savings > 0 && <div className="bill-row save"><span>Item MRP Savings</span><span>− ₹{savings}</span></div>}
                <div className="bill-row">
                  <span>Delivery {deliveryFee === 0 ? '(FREE over ₹299)' : ''}</span>
                  <span>{deliveryFee === 0 ? 'FREE' : `₹${deliveryFee}`}</span>
                </div>
                <div className="bill-row"><span>Platform Fee</span><span>₹{platformFee}</span></div>
                <div className="bill-row total"><span>Total</span><span>₹{grand}</span></div>
              </div>

              {/* Delivery Address Section */}
              <div style={{ marginTop: '14px' }}>
                <div style={{ fontSize: '11.5px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.8px', color: 'var(--muted)', marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '5px' }}>
                  📍 Delivery Address
                </div>
                <textarea
                  className="addr-input"
                  rows={2}
                  placeholder={user ? `Deliver to: ${user.address}` : 'Delivery address'}
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  aria-label="Delivery address"
                  style={{ marginBottom: '4px', resize: 'vertical' }}
                />
              </div>

              {/* Payment Method Section */}
              <div className="pay-opt-box" style={{ margin: '10px 0 14px', background: '#f7f9f6', padding: '12px', borderRadius: '14px', border: '1px solid var(--border)' }}>
                <div style={{ fontSize: '11px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.8px', color: '#66707D', marginBottom: '8px' }}>
                  Payment Method
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                  <button
                    type="button"
                    onClick={() => isCodAllowed && setPaymentMode('cod')}
                    disabled={!isCodAllowed}
                    style={{
                      padding: '8px 6px',
                      borderRadius: '10px',
                      border: `1.5px solid ${paymentMode === 'cod' && isCodAllowed ? 'var(--green)' : '#D8DED6'}`,
                      background: paymentMode === 'cod' && isCodAllowed ? 'var(--green-tint)' : isCodAllowed ? '#fff' : '#f1f3f0',
                      color: !isCodAllowed ? '#9AA3AF' : paymentMode === 'cod' ? 'var(--green-ink)' : '#2B323B',
                      cursor: isCodAllowed ? 'pointer' : 'not-allowed',
                      fontSize: '11.5px',
                      fontWeight: 700,
                      textAlign: 'center',
                      fontFamily: 'inherit',
                    }}
                  >
                    💵 Cash on Delivery
                    <span style={{ display: 'block', fontSize: '10px', fontWeight: 600, color: isCodAllowed ? 'var(--green-ink)' : '#C4271F', marginTop: '2px' }}>
                      {isCodAllowed ? 'Available (≤ ₹100)' : 'Unavailable (> ₹100)'}
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMode('prepaid')}
                    style={{
                      padding: '8px 6px',
                      borderRadius: '10px',
                      border: `1.5px solid ${paymentMode === 'prepaid' || !isCodAllowed ? 'var(--green)' : '#D8DED6'}`,
                      background: paymentMode === 'prepaid' || !isCodAllowed ? 'var(--green-tint)' : '#fff',
                      color: paymentMode === 'prepaid' || !isCodAllowed ? 'var(--green-ink)' : '#2B323B',
                      cursor: 'pointer',
                      fontSize: '11.5px',
                      fontWeight: 700,
                      textAlign: 'center',
                      fontFamily: 'inherit',
                    }}
                  >
                    📱 Online / Prepaid
                    <span style={{ display: 'block', fontSize: '10px', fontWeight: 600, color: 'var(--green-ink)', marginTop: '2px' }}>
                      UPI / QR Transfer
                    </span>
                  </button>
                </div>

                {!isCodAllowed && (
                  <div style={{ fontSize: '11px', color: '#B91C1C', marginTop: '8px', background: '#FEF2F2', padding: '6px 8px', borderRadius: '8px', lineHeight: '1.4' }}>
                    ℹ️ Orders above ₹100 must be Prepaid. COD is capped at ₹100.
                  </div>
                )}

                <div style={{ fontSize: '10.5px', color: '#56606D', marginTop: '8px', textAlign: 'center', lineHeight: '1.4' }}>
                  🔒 <strong>100% Sealed Delivery:</strong> Orders are picked up sealed from partner stores. Report transit issues within 60 mins. Helpline: <a href="tel:8144503650" style={{ color: 'var(--green)', fontWeight: 700 }}>8144503650</a>
                </div>
              </div>
            </>
          )}
        </div>
        {lines.length > 0 && (
          <div className="drawer-foot">
            {err && (
              <p style={{ color: '#DC2626', fontSize: '12px', marginBottom: '8px', fontWeight: 700, background: '#FEF2F2', padding: '6px 10px', borderRadius: '8px' }}>
                ⚠️ {err}
              </p>
            )}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px' }}>
              <div>
                <div style={{ fontSize: '11px', color: 'var(--muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  To Pay ({effectiveMode})
                </div>
                <div style={{ fontSize: '20px', fontWeight: 900, color: 'var(--ink)', lineHeight: '1.2' }}>
                  ₹{grand}
                  {discountAmount > 0 && (
                    <span style={{ fontSize: '10.5px', color: '#0e9f4e', fontWeight: 800, marginLeft: '6px', background: '#E7F6EC', padding: '1px 6px', borderRadius: '4px' }}>
                      ₹{discountAmount} OFF
                    </span>
                  )}
                </div>
              </div>
              <button
                className="btn-primary"
                style={{ flex: 1, padding: '13px 18px', fontSize: '14.5px', borderRadius: '14px', fontWeight: 800, textAlign: 'center' }}
                disabled={placing}
                onClick={placeOrder}
              >
                {placing ? 'Placing...' : user ? 'Place Order →' : 'Login to Order →'}
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
}

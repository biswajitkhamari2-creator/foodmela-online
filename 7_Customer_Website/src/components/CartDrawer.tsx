import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api';
import { useShop } from '../store';

// UI-only reskin. Cart math, delivery-fee rule, placeOrder payload,
// backend endpoint + Firestore mirror (inside api.placeOrder) — untouched.
const FREE_DELIVERY_OVER = 299;
const DELIVERY_FEE = 39;
// Platform fee (₹7) — charged to the customer on every non-empty order,
// shown as its own bill row and included in the placed totalAmount.
const PLATFORM_FEE = 7;

export default function CartDrawer({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { cart, addToCart, removeFromCart, clearCart, priceOf, mrpOf, cartTotal, cartCount, user, allItems } = useShop();
  const nav = useNavigate();
  const [address, setAddress] = useState('');
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
  const grand = cartTotal + deliveryFee + platformFee;
  const awayFromFree = Math.max(0, FREE_DELIVERY_OVER - cartTotal);
  const progress = Math.min(100, Math.round((cartTotal / FREE_DELIVERY_OVER) * 100));

  const placeOrder = async () => {
    if (!user) { onClose(); nav('/login'); return; }
    const addr = (address || user.address).trim();
    if (!addr) { setErr('Enter a delivery address'); return; }
    if (lines.length === 0) return;
    setPlacing(true);
    setErr('');
    try {
      const res = await api.placeOrder({
        customerName: user.name,
        phone: user.phone,
        address: addr,
        items: lines.map((l) => ({
          itemId: l.item.id,
          name: l.item.name,
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
            <div className="empty">
              <div className="empty-icon">🍽️</div>
              <h3>Cart is empty</h3>
              <p>Add something delicious!</p>
              <button className="btn-primary" style={{ marginTop: 16 }} onClick={() => { onClose(); nav('/food'); }}>
                Browse Food →
              </button>
            </div>
          ) : (
            <>
              {deliveryFee > 0 ? (
                <div className="free-del-progress">
                  Add <strong>₹{awayFromFree}</strong> more for FREE delivery 🛵
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
              {lines.map((l) => (
                <div key={l.item.id} className="cart-line">
                  <img src={l.item.image} alt={l.item.name} loading="lazy" />
                  <div className="cl-info">
                    <strong>{l.item.name}</strong>
                    <span className="unit">₹{priceOf(l.item)} each</span>
                    <div className="cl-total">₹{priceOf(l.item) * l.qty}</div>
                  </div>
                  <div className="qty-ctl mini">
                    <button onClick={() => removeFromCart(l.item.id)} aria-label={`Remove one ${l.item.name}`}>−</button>
                    <strong aria-live="polite">{l.qty}</strong>
                    <button onClick={() => addToCart(l.item.id)} aria-label={`Add one more ${l.item.name}`}>+</button>
                  </div>
                </div>
              ))}
              <div className="bill-box">
                <h4>Bill Details</h4>
                <div className="bill-row"><span>Subtotal</span><span>₹{cartTotal}</span></div>
                {savings > 0 && <div className="bill-row save"><span>You save 🎉</span><span>− ₹{savings}</span></div>}
                <div className="bill-row">
                  <span>Delivery {deliveryFee === 0 ? '(FREE over ₹299)' : ''}</span>
                  <span>{deliveryFee === 0 ? 'FREE' : `₹${deliveryFee}`}</span>
                </div>
                <div className="bill-row"><span>Platform Fee</span><span>₹{platformFee}</span></div>
                <div className="bill-row total"><span>Total</span><span>₹{grand}</span></div>
              </div>
            </>
          )}
        </div>
        {lines.length > 0 && (
          <div className="drawer-foot">
            <textarea
              className="addr-input"
              rows={2}
              placeholder={user ? `Deliver to: ${user.address}` : 'Delivery address'}
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              aria-label="Delivery address"
            />
            {err && <p style={{ color: '#DC2626', fontSize: 13, marginBottom: 8 }}>{err}</p>}
            <button className="btn-primary" style={{ width: '100%' }} disabled={placing} onClick={placeOrder}>
              {placing ? 'Placing...' : user ? `Place Order • ₹${grand}` : 'Login to Order →'}
            </button>
          </div>
        )}
      </div>
    </>
  );
}

import { createPortal } from 'react-dom';

export interface InvoiceItem {
  name: string;
  quantity: number;
  price?: number;
}

export interface InvoiceOrder {
  oid: string;
  orderId?: string;
  customerName?: string;
  customerPhone?: string;
  address?: string;
  items?: unknown;
  itemsSummary?: string;
  total?: string | number;
  totalAmount?: number;
  amountValue?: number;
  status?: string;
  stage?: number;
  paymentMode?: string;
  createdAt?: unknown;
  placedAt?: string;
  source?: string;
}

function parseItems(itemsRaw: unknown, summary?: string): InvoiceItem[] {
  if (Array.isArray(itemsRaw) && itemsRaw.length > 0) {
    return itemsRaw.map((it) => {
      const rec = it as Record<string, unknown>;
      const qty = Math.max(1, Number(rec.quantity ?? rec.qty ?? 1));
      const name = String(rec.name ?? rec.itemId ?? 'Item');
      const price = typeof rec.price === 'number' ? rec.price : typeof rec.unitPrice === 'number' ? rec.unitPrice : undefined;
      return { name, quantity: qty, price };
    });
  }
  if (typeof itemsRaw === 'string' && itemsRaw.trim()) {
    return itemsRaw.split(',').map((part) => {
      const m = part.trim().match(/^(\d+)x\s*(.*)$/);
      if (m) {
        return { quantity: parseInt(m[1], 10), name: m[2].trim() };
      }
      return { quantity: 1, name: part.trim() };
    });
  }
  if (summary && summary.trim()) {
    return summary.split(',').map((part) => {
      const m = part.trim().match(/^(\d+)x\s*(.*)$/);
      if (m) {
        return { quantity: parseInt(m[1], 10), name: m[2].trim() };
      }
      return { quantity: 1, name: part.trim() };
    });
  }
  return [{ name: 'Assorted Items', quantity: 1 }];
}

function formatInvoiceDate(createdAt: unknown, placedAt?: string): string {
  try {
    if (createdAt && typeof createdAt === 'object' && 'toDate' in (createdAt as Record<string, unknown>)) {
      const d = (createdAt as { toDate: () => Date }).toDate();
      return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
    }
    if (typeof createdAt === 'string' && createdAt) {
      const d = new Date(createdAt);
      if (!isNaN(d.getTime())) {
        return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
      }
    }
    if (typeof createdAt === 'number' && createdAt > 0) {
      const d = new Date(createdAt);
      return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
    }
    if (placedAt) {
      const d = new Date(placedAt);
      if (!isNaN(d.getTime())) {
        return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
      }
    }
  } catch {
    // fallback
  }
  return new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
}

export default function InvoiceModal({ order, onClose }: { order: InvoiceOrder | null; onClose: () => void }) {
  if (!order) return null;

  const rawOid = order.oid ?? order.orderId ?? 'FM-ORDER';
  const oid = rawOid.startsWith('FM-') ? rawOid : `FM-${rawOid}`;
  const cleanId = oid.replace(/^FM-/, '');
  const items = parseItems(order.items, order.itemsSummary);

  const rawTotal = order.totalAmount ?? order.amountValue ?? (typeof order.total === 'number' ? order.total : parseInt(String(order.total ?? '').replace(/[^0-9]/g, ''), 10) || 0);

  // Bill calculations
  const platformFee = rawTotal > 0 ? 7 : 0;
  const deliveryFee = rawTotal >= 299 || rawTotal === 0 ? 0 : 30;
  const subtotal = Math.max(0, rawTotal - platformFee - deliveryFee);

  const address = order.address ?? 'Birmaharajpur, Subarnapur, Odisha - 767018';
  const isCod = address.toUpperCase().includes('[COD]');
  const paymentText = isCod ? 'Cash on Delivery (COD)' : 'Online / Prepaid (UPI)';

  const dateStr = formatInvoiceDate(order.createdAt, order.placedAt);

  const handlePrint = () => {
    window.print();
  };

  const modalContent = (
    <div className="invoice-modal-overlay" onClick={onClose} role="dialog" aria-modal="true">
      <div className="invoice-modal-card" onClick={(e) => e.stopPropagation()}>
        {/* Printable Invoice Sheet */}
        <div className="invoice-print-area">
          {/* Header */}
          <div className="inv-header">
            <div className="inv-brand-box">
              <img src="/foodmela-f-logo.webp" alt="FoodMela — Good Food Happy People" className="inv-logo-img" />
              <div>
                <h2 className="inv-company">FoodMela</h2>
                <div className="inv-tagline">Local · Fresh · Fast</div>
                <div className="inv-sub">Hyperlocal Delivery Intermediary</div>
              </div>
            </div>
            <div className="inv-meta-right">
              <span className="inv-badge">TAX INVOICE / RECEIPT</span>
              <div className="inv-meta-line"><strong>Invoice #:</strong> INV-{cleanId}</div>
              <div className="inv-meta-line"><strong>Order ID:</strong> {oid}</div>
              <div className="inv-meta-line"><strong>Date:</strong> {dateStr}</div>
            </div>
          </div>

          <div className="inv-divider" />

          {/* Addresses Row */}
          <div className="inv-grid-2">
            <div className="inv-box">
              <div className="inv-label">Delivered To:</div>
              <div className="inv-name">{order.customerName || 'Valued Customer'}</div>
              {order.customerPhone && <div className="inv-phone">📞 {order.customerPhone}</div>}
              <div className="inv-addr">{address.replace(/\[(COD|PREPAID)\]/gi, '').trim()}</div>
            </div>
            <div className="inv-box right-box">
              <div className="inv-label">Issued By:</div>
              <div className="inv-name">FoodMela Online Logistics</div>
              <div className="inv-addr">Birmaharajpur, Subarnapur, Odisha - 767018</div>
              <div className="inv-phone">Helpline: +91 8144503650</div>
              <div className="inv-phone">Email: support@foodmela.online</div>
            </div>
          </div>

          {/* Items Table */}
          <table className="inv-table">
            <thead>
              <tr>
                <th style={{ width: '45px', textAlign: 'center' }}>#</th>
                <th>Item Description</th>
                <th style={{ width: '70px', textAlign: 'center' }}>Qty</th>
                <th style={{ width: '100px', textAlign: 'right' }}>Amount</th>
              </tr>
            </thead>
            <tbody>
              {items.map((it, idx) => {
                const itemTotal = it.price ? it.price * it.quantity : undefined;
                return (
                  <tr key={idx}>
                    <td style={{ textAlign: 'center' }}>{idx + 1}</td>
                    <td>
                      <strong>{it.name}</strong>
                      <div style={{ fontSize: '11px', color: '#68756e' }}>Cooked &amp; packed by licensed restaurant partner</div>
                    </td>
                    <td style={{ textAlign: 'center' }}>{it.quantity}</td>
                    <td style={{ textAlign: 'right' }}>
                      {itemTotal ? `₹${itemTotal}` : 'Included in Total'}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {/* Bill Summary */}
          <div className="inv-summary-wrap">
            <div className="inv-pay-status">
              <div className="inv-label">Payment Method:</div>
              <div className={`inv-pay-pill ${isCod ? 'pay-cod' : 'pay-prepaid'}`}>
                {isCod ? '💵' : '📱'} {paymentText}
              </div>
              <div style={{ marginTop: 8, fontSize: '11px', color: '#68756e' }}>
                Order Status: <strong style={{ color: '#1E2A24' }}>{order.status ?? 'Delivered'}</strong>
              </div>
            </div>

            <div className="inv-calc-box">
              <div className="inv-calc-row">
                <span>Items Subtotal</span>
                <span>₹{subtotal > 0 ? subtotal : rawTotal}</span>
              </div>
              <div className="inv-calc-row">
                <span>Delivery Charge</span>
                <span>{deliveryFee === 0 ? 'FREE' : `₹${deliveryFee}`}</span>
              </div>
              <div className="inv-calc-row">
                <span>Platform Fee</span>
                <span>₹{platformFee}</span>
              </div>
              <div className="inv-divider-thin" />
              <div className="inv-calc-row total">
                <span>Grand Total</span>
                <span className="grand-price">₹{rawTotal}</span>
              </div>
            </div>
          </div>

          {/* Legal Intermediary Note */}
          <div className="inv-footer-note">
            <p>
              <strong>Statutory Disclosure (IT Act 2000 &amp; FSSA 2006):</strong> FoodMela operates strictly as an intermediary technology aggregator connecting buyers with independent licensed restaurant Food Business Operators (FBOs) and logistics delivery partners. Food preparation and packaging liability rests solely with the merchant kitchen. Platform Fee is charged for platform maintenance, technology hosting, and real-time tracking services.
            </p>
          </div>

          {/* Authorized Signature */}
          <div className="inv-sign-row">
            <div className="inv-sign-left">
              <span>Birmaharajpur, Subarnapur, Odisha - 767018</span>
            </div>
            <div className="inv-sign-right">
              <div className="inv-sign-name">Guruudev</div>
              <div className="inv-sign-label">Authorized Signature</div>
            </div>
          </div>
        </div>

        {/* Modal Action Controls (Hidden on Print) */}
        <div className="inv-action-bar">
          <button className="btn-ghost" onClick={onClose} style={{ padding: '10px 22px', fontSize: 13.5 }}>
            ✕ Close
          </button>
          <button className="btn-primary" onClick={handlePrint} style={{ padding: '10px 24px', fontSize: 13.5 }}>
            🖨️ Print / Save as PDF
          </button>
        </div>
      </div>
    </div>
  );

  return typeof document !== 'undefined' ? createPortal(modalContent, document.body) : modalContent;
}

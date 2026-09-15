import { Link, useNavigate, useParams } from 'react-router-dom';

interface InfoPage {
  title: string;
  emoji: string;
  body: string[];
  cta?: { label: string; to: string };
}

const PAGES: Record<string, InfoPage> = {
  about: {
    title: 'About FoodMela',
    emoji: '🍽️',
    body: [
      'FoodMela is your trusted local delivery app — bringing fresh restaurant food, sweets, groceries and daily essentials to doorsteps across Birmaharajpur, Odisha.',
      'We work directly with local kitchens, shops and riders from your own community. No platform markup, no dark patterns — just good food, delivered happier.',
      'Order on this website or get the FoodMela app. Same kitchen, same riders, same account everywhere.',
    ],
    cta: { label: 'Start Ordering →', to: '/food' },
  },
  contact: {
    title: 'Contact Us',
    emoji: '📞',
    body: [
      'Need help with an order? Reach out — our local Birmaharajpur team is ready to assist you.',
      '📞 Phone / WhatsApp: +91 8144503650',
      'Support hours: 9:00 AM – 10:00 PM, all days.',
      'For immediate order assistance, tap the button below to call us directly.',
    ],
    cta: { label: 'Call 8144503650 →', to: 'tel:8144503650' },
  },
  help: {
    title: 'Help & Support',
    emoji: '💬',
    body: [
      'Track your order live from My Orders — status updates instantly, no refresh needed.',
      'Share the delivery OTP shown on the tracking page with your rider at the door.',
      'You can cancel an order from the tracking page while it is still placed or accepted.',
      'For refunds, payment issues or urgent help, call or WhatsApp our helpline at +91 8144503650.',
    ],
    cta: { label: 'Call Support: 8144503650 →', to: 'tel:8144503650' },
  },
  terms: {
    title: 'Terms of Service & Legal Framework',
    emoji: '📜',
    body: [
      '1. INTERMEDIARY STATUS (Section 79, Information Technology Act, 2000): FoodMela (foodmela.online) operates strictly as a digital technology intermediary and delivery service aggregator within the meaning of Section 79 of the Information Technology Act, 2000. FoodMela provides a technology platform connecting customers with independent local merchants and logistics services.',
      '2. NO FOOD PREPARATION OR RESTAURANT OPERATIONS: FoodMela does not prepare, cook, package, store, or alter any food items. All food products, grocery items, and beverages available on the platform are prepared, cooked, and packaged solely and independently by third-party restaurant and store partners.',
      '3. FSSAI COMPLIANCE (Food Safety and Standards Act, 2006): All partnered food business operators (FBOs) listed on FoodMela are required to hold a valid license/registration issued by the Food Safety and Standards Authority of India (FSSAI) under the Food Safety and Standards Act, 2006. FoodMela strictly partners with licensed merchants.',
      '4. PRODUCT LIABILITY & HEALTH DISCLAIMER (Consumer Protection Act, 2019): Under the Consumer Protection Act, 2019 and the Consumer Protection (E-Commerce) Rules, 2020, product liability for food quality, hygiene, freshness, taste, contamination, foreign objects, adulteration, allergic reactions, or foodborne illness lies exclusively and solely with the respective merchant/restaurant FBO. FoodMela shall not be held liable or responsible for any illness or injury resulting from the consumption of food prepared by independent merchant kitchens.',
      '5. SCOPE OF LOGISTICS & TRANSIT DAMAGE: FoodMela’s sole responsibility is restricted to the safe transit and delivery of sealed packages from the merchant to the customer. We inspect package seal integrity upon pickup. Any external transit damage, spillage, or missing items must be reported within 2 hours of delivery for prompt refund or replacement under our Refund Policy.',
      '6. PRICING & CANCELLATION: Prices displayed on the platform are live store prices provided by merchants. Orders can be cancelled while in Placed or Accepted stage; once dispatched for delivery, cancellations are subject to merchant terms. Free delivery applies on orders above ₹299.',
    ],
    cta: { label: 'Explore Legal Disclaimer →', to: '/page/disclaimer' },
  },
  disclaimer: {
    title: 'Food Safety & Intermediary Disclaimer',
    emoji: '⚖️',
    body: [
      'INTERMEDIARY SAFE HARBOR (IT ACT, 2000, SECTION 79): FoodMela functions solely as an online technology intermediary and delivery logistics network. Under Section 79 of the Information Technology Act, 2000, FoodMela is not the manufacturer, seller, or preparer of food products.',
      'FSSAI REGISTRATION & INDEPENDENT VENDORS: In accordance with FSSAI regulations for E-Commerce Food Business Operators (2018) under the Food Safety and Standards Act, 2006, all food business partners listed on FoodMela are required to possess valid FSSAI licenses. Each merchant is solely responsible for maintaining food hygiene, temperature control, and safety during food preparation.',
      'FOOD QUALITY & CONTAMINATION EXCLUSION: FoodMela riders transport food packages in sealed condition directly from the restaurant to your address. FoodMela does not open, inspect internal ingredients, or alter food. FoodMela expressly disclaims all liability for food taste, undercooking, spoiled ingredients, chemical contamination, or food poisoning. All such claims are strictly between the consumer and the cooking restaurant.',
      'TRANSIT DEFICIENCY vs. FOOD DEFECT: As recognized under the Consumer Protection Act, 2019, FoodMela is accountable solely for transit deficiency (transit spill, outer package tamper, or delivery delays). Deficiencies in food quality or preparation are the legal liability of the respective restaurant.',
      'NEED ASSISTANCE? For transit damage or missing items, contact our Birmaharajpur support team at +91 8144503650.',
    ],
    cta: { label: 'Call Support: 8144503650 →', to: 'tel:8144503650' },
  },
  privacy: {
    title: 'Privacy Policy',
    emoji: '🔒',
    body: [
      'We collect only what delivery needs: your name, phone number and delivery address.',
      'Your number is verified over OTP via our verification provider; we never see or store your OTP.',
      'We never sell your data. Order history is used only to serve you better — reorder in one tap.',
    ],
  },
  refund: {
    title: 'Cancellation & Refund Policy',
    emoji: '💸',
    body: [
      '1. CASH ON DELIVERY (COD) CAPPED AT ₹100: Cash on Delivery (COD) is strictly permitted only for orders with total value up to ₹100. Any order exceeding ₹100 must be prepaid via online/UPI payment before dispatch.',
      '2. NO REFUND FOR TASTE OR SUBJECTIVE PREFERENCE: Food taste, spice level, ingredient personal dislike, texture, or temperature expectations are strictly subjective and NOT eligible for cancellation, return, or refund under any circumstances.',
      '3. ELIGIBLE REFUND SCENARIOS (VERIFIED DEFECTS ONLY): As per standard delivery aggregator policies (similar to Swiggy/Zomato), refunds or free replacements are strictly issued only in the following verifiable events:',
      '   • Packaging Damaged in Transit: Package physically torn, punctured, broken, or crushed during transit by the delivery rider rendering food unhygienic.',
      '   • Severe Spillage or Leakage: Containers heavily leaked or spilled inside the delivery bag during transit.',
      '   • Wrong Item Delivered: Kitchen or rider delivered an entirely incorrect dish or order.',
      '   • Missing Item: Ordered item missing from a multi-item package (pro-rata refund issued for the missing item).',
      '   • Food Spoiled Upon Arrival: Food arrived sour, stale, or contaminated upon delivery, documented with photographic proof.',
      '4. MANDATORY 60-MINUTE REPORTING WITH PHOTO/VIDEO PROOF: Any transit damage, spillage, or missing item must be inspected upon delivery and reported within 60 minutes of receiving the order. Customers must share clear photos/unboxing videos via WhatsApp or Call to +91 8144503650. Requests made after 60 minutes cannot be entertained.',
      '5. CANCELLATION RESTRICTIONS: Orders can be cancelled with 100% refund only while in the "Placed" stage before the kitchen accepts or begins cooking. Once food preparation has begun or the order is out for delivery, cancellations are strictly non-refundable.',
      '6. SETTLEMENT TIMELINE: Approved refunds are credited directly to your original payment method or UPI within 24–48 hours, or processed in cash/store credit for COD orders.',
      '7. CUSTOMER SUPPORT HELPLINE: For urgent order assistance, damage claims, or payment help, call or WhatsApp our Birmaharajpur support team at +91 8144503650 (9:00 AM – 10:00 PM).',
    ],
    cta: { label: 'Call Support: 8144503650 →', to: 'tel:8144503650' },
  },
  partner: {
    title: 'Partner With Us',
    emoji: '🤝',
    body: [
      'Grow with FoodMela — join Birmaharajpur\'s own delivery network as a restaurant, store or rider.',
      'Zero listing complexity, local support, and payouts you can track.',
    ],
    cta: { label: 'Become a Restaurant Partner →', to: '/page/partner-restaurant' },
  },
  'partner-restaurant': {
    title: 'Restaurant Partner',
    emoji: '🏪',
    body: [
      'Put your kitchen on FoodMela and reach thousands of hungry locals.',
      'Live menu control, instant order alerts, and fair commissions — no platform markup on your food.',
    ],
    cta: { label: 'Contact Us to Join →', to: '/page/contact' },
  },
  'partner-rider': {
    title: 'Delivery Partner',
    emoji: '🛵',
    body: [
      'Ride with FoodMela and earn on every delivery across Birmaharajpur.',
      'Flexible hours, live GPS orders, and weekly payouts.',
    ],
    cta: { label: 'Contact Us to Join →', to: '/page/contact' },
  },
  app: {
    title: 'Get the FoodMela App',
    emoji: '📱',
    body: [
      'Your favourite food is just a tap away. The Android app brings faster ordering, live rider tracking and app-only deals.',
      'Search “FoodMela” on Google Play, or keep ordering right here on foodmela.online — same account everywhere.',
    ],
    cta: { label: 'Order on Web →', to: '/food' },
  },
};

export default function Info() {
  const { slug } = useParams();
  const nav = useNavigate();
  const page = slug ? PAGES[slug] : undefined;

  if (!page) {
    return (
      <div className="section page-enter" style={{ maxWidth: 720 }}>
        <div className="mela-empty">
          <div className="mela-empty-icon">🔍</div>
          <h3>Page not found</h3>
          <p>The page you&apos;re looking for doesn&apos;t exist.</p>
          <button className="btn-primary" style={{ marginTop: 16 }} onClick={() => nav('/')}>
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="section page-enter" style={{ maxWidth: 720 }}>
      <Link to="/" style={{ color: '#0e9f4e', fontWeight: 700, fontSize: 14 }}>← Home</Link>
      <div className="track-card" style={{ marginTop: 16 }}>
        <div style={{ fontSize: 44 }}>{page.emoji}</div>
        <h2 style={{ margin: '10px 0 12px', fontSize: 26 }}>{page.title}</h2>
        {page.body.map((p, i) => (
          <p key={i} style={{ fontSize: 14.5, color: '#2B323B', lineHeight: 1.75, marginBottom: 12 }}>{p}</p>
        ))}
        {page.cta && (
          page.cta.to.startsWith('tel:') ? (
            <a
              className="btn-primary"
              style={{ marginTop: 8, display: 'inline-flex', textDecoration: 'none' }}
              href={page.cta.to}
            >
              {page.cta.label}
            </a>
          ) : (
            <button className="btn-primary" style={{ marginTop: 8 }} onClick={() => nav(page.cta!.to)}>
              {page.cta.label}
            </button>
          )
        )}
      </div>
    </div>
  );
}

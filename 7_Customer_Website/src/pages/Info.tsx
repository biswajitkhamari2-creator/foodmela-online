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
    title: 'Contact Us & Grievance Redressal',
    emoji: '📞',
    body: [
      'Need help with an order, delivery or payment? Reach out directly to our local Birmaharajpur team.',
      '📞 Phone / WhatsApp Helpline: +91 8144503650',
      'Support Hours: 9:00 AM – 10:00 PM, 7 days a week.',
      'Operating Address: FoodMela Services, Birmaharajpur, Subarnapur, Odisha - 767018.',
      'STATUTORY GRIEVANCE REDRESSAL (Consumer Protection E-Commerce Rules, 2020):',
      'Grievance Officer: Biswajit Khamari',
      'Designation: Customer Care & Grievance Officer',
      'Email: support@foodmela.online | Direct Phone: +91 8144503650',
      'Redressal Timeline: Any formal complaint will be acknowledged within 48 hours and resolved within 30 days from the date of receipt.',
    ],
    cta: { label: 'Call Helpline: 8144503650 →', to: 'tel:8144503650' },
  },
  help: {
    title: 'Help & Support',
    emoji: '💬',
    body: [
      'Track your order live from My Orders — status updates instantly, no refresh needed.',
      'Share the delivery OTP shown on the tracking page with your rider ONLY after checking the package seal.',
      'You can cancel an order from the tracking page while it is still placed or accepted.',
      'For refunds, transit damage or payment issues, call or WhatsApp our helpline at +91 8144503650.',
      'Operating Location: Birmaharajpur, Subarnapur, Odisha - 767018.',
    ],
    cta: { label: 'Call Support: 8144503650 →', to: 'tel:8144503650' },
  },
  terms: {
    title: 'Terms of Service & Legal Framework',
    emoji: '📜',
    body: [
      '1. INTERMEDIARY STATUS (Section 79, Information Technology Act, 2000): FoodMela (foodmela.online) operates strictly as a digital technology intermediary and delivery service facilitator. Under Section 79 of the IT Act, 2000, FoodMela provides a technology interface connecting buyers with independent local restaurants, stores, and delivery riders.',
      '2. NO COOKING / NO FOOD MANUFACTURE: FoodMela does NOT cook, prepare, manufacture, or store cooked food items. All food dishes, bakery, grocery, and beverages available on the platform are prepared, cooked, and packaged solely and independently by third-party restaurant and store partners.',
      '3. FSSAI REGISTRATION & FBO RESPONSIBILITY: Under the Food Safety and Standards Act, 2006, all food preparation, cooking hygiene, ingredient safety, temperature control, and packaging standards are the sole legal responsibility of the respective Food Business Operator (FBO) / cooking restaurant. Any proprietary packaged product sold directly by FoodMela (such as packaged snack mixtures) complies with applicable registration.',
      '4. CONSUMER PROTECTION & PRODUCT LIABILITY: Under the Consumer Protection Act, 2019 and the Consumer Protection (E-Commerce) Rules, 2020, product liability for food taste, contamination, foreign particles, undercooking, allergic reactions, or foodborne illness lies solely with the cooking merchant/restaurant. FoodMela disclaims all liability for food preparation defects.',
      '5. SCOPE OF TRANSIT & 60-MINUTE REFUND POLICY: FoodMela is responsible solely for transit integrity. Orders with torn packaging, spillage, wrong items, or missing items must be reported within 60 minutes of delivery with photo/video evidence to +91 8144503650. Subjective taste, spicy level, or personal preference is strictly non-refundable.',
      '6. STATUTORY GRIEVANCE REDRESSAL: In compliance with Rule 5(3)(b) of the Consumer Protection (E-Commerce) Rules, 2020, our Grievance Officer is Biswajit Khamari (Birmaharajpur, Subarnapur, Odisha - 767018, Phone: 8144503650, Email: support@foodmela.online). Complaints are acknowledged within 48 hours and resolved within 30 days.',
      '7. CASH ON DELIVERY (COD): COD is capped at a maximum of ₹100. All orders exceeding ₹100 must be prepaid via online/UPI payment.',
    ],
    cta: { label: 'Explore Food Safety Disclaimer →', to: '/page/disclaimer' },
  },
  disclaimer: {
    title: 'Food Safety & Intermediary Disclaimer',
    emoji: '⚖️',
    body: [
      'INTERMEDIARY SAFE HARBOR (IT ACT, 2000, SECTION 79): FoodMela functions solely as an online technology intermediary and delivery logistics network. Under Section 79 of the Information Technology Act, 2000, FoodMela is not the manufacturer, seller, or preparer of food products.',
      'FOOD BUSINESS OPERATOR (FBO) ROLES & FSSAI: In accordance with the Food Safety and Standards Act, 2006 and FSSAI regulations, each cooking hotel/restaurant is an independent Food Business Operator solely responsible for the ingredients, hygiene, quality, and cooking of the food. FoodMela only collects sealed packages from these restaurants and delivers them to your doorstep.',
      'FOOD QUALITY & CONTAMINATION EXCLUSION: FoodMela riders transport food packages in sealed condition directly from the restaurant. FoodMela riders do not open, tamper with, inspect internal ingredients, or alter food. FoodMela expressly disclaims all liability for food taste, spice levels, spoilage, or food poisoning arising from restaurant cooking.',
      'TRANSIT DEFICIENCY vs. FOOD DEFECT: FoodMela is accountable solely for delivery logistics (transit spillage, packaging crushed during transit, or delivery delays). Any such transit damage must be reported within 60 minutes of delivery with photo proof via WhatsApp to 8144503650.',
      'REGISTERED LOCATION & SUPPORT: Birmaharajpur, Subarnapur, Odisha - 767018 | Helpline: +91 8144503650.',
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

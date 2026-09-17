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
      'FoodMela is your trusted local delivery app — bringing fresh groceries and daily essentials to doorsteps across Birmaharajpur, Odisha.',
      'We work directly with local shops and riders from your own community. No platform markup, no dark patterns — just freshness, delivered happier.',
      'Order on this website or get the FoodMela app. Same stores, same riders, same account everywhere.',
    ],
    cta: { label: 'Start Ordering →', to: '/grocery' },
  },
  enterprise: {
    title: 'Sidheswar Enterprises — FoodMela',
    emoji: '🏢',
    body: [
      'FoodMela (foodmela.online) is owned and operated by Sidheswar Enterprises.',
      'Proprietor & Owner: Biswajit Khamari',
      'Entity Name: Sidheswar Enterprises',
      'Operating Base: Birmaharajpur, Subarnapur District, Odisha - 767018',
      'Business Model: Hyperlocal on-demand grocery & daily essentials delivery platform connecting residents of Birmaharajpur with local vendors.',
      'Helpline: +91 8144503650 | Email: support@foodmela.online',
    ],
    cta: { label: 'Explore Grocery →', to: '/grocery' },
  },
  contact: {
    title: 'Contact Us & Statutory Grievance Redressal',
    emoji: '📞',
    body: [
      'Need assistance with an order, delivery or payment? Reach out directly to our Birmaharajpur team.',
      '📞 Phone / WhatsApp Helpline: +91 8144503650',
      'Operating Hours: 9:00 AM – 10:00 PM, all 7 days.',
      'DIGITAL-FIRST OPERATING MODEL: FoodMela operates as a cloud-based digital delivery aggregation platform. To provide fast, low-cost community delivery, we operate digitally without physical walk-in retail storefronts. All customer support, merchant tie-ups, and statutory communications are processed via our verified digital channels.',
      'OPERATING JURISDICTION & BASE: Birmaharajpur, Subarnapur District, Odisha - 767018, India.',
      'STATUTORY GRIEVANCE REDRESSAL CELL (Consumer Protection E-Commerce Rules, 2020):',
      'Grievance Officer: Jitendriya Amat',
      'Designation: Customer Operations & Grievance Officer',
      'Email: support@foodmela.online | Direct Phone: +91 8144503650',
      'Resolution Standards: Every formal complaint is ticketed, acknowledged within 48 hours, and redressed within 30 days of receipt.',
    ],
    cta: { label: 'Call Helpline: 8144503650 →', to: 'tel:8144503650' },
  },
  help: {
    title: 'Help & Support',
    emoji: '💬',
    body: [
      'Track your order live from My Orders — status updates instantly without page refresh.',
      'Inspect outer packaging and stapler pins upon delivery. Share your delivery OTP only after confirming package is sealed.',
      'Order cancellation is available directly from the tracking page while your order is in Placed or Accepted stage.',
      'For missing items, severe transit spills, or payment disputes, call or WhatsApp our helpline at +91 8144503650.',
      'Operating Base: Birmaharajpur, Subarnapur, Odisha - 767018 | Email: support@foodmela.online.',
    ],
    cta: { label: 'Call Support: 8144503650 →', to: 'tel:8144503650' },
  },
  terms: {
    title: 'Terms of Service & Legal Agreement',
    emoji: '📜',
    body: [
      '1. INTERMEDIARY SAFE HARBOR (Section 79, Information Technology Act, 2000): FoodMela (foodmela.online) operates strictly as a digital technology intermediary and delivery logistics network. Under Section 79 of the IT Act, 2000, FoodMela provides an online platform enabling customers to order food and essentials from independent local merchants, prepared by third-party Food Business Operators (FBOs) and transported by delivery executives.',
      '2. NO FOOD PREPARATION / ZERO COOKING LIABILITY: FoodMela does NOT cook, bake, package, process, formulate, or store prepared food items. All dishes, beverages, and grocery items listed on the platform are prepared and packaged solely by independent restaurant and merchant partners.',
      '3. FSSAI & PRODUCT LIABILITY COMPLIANCE: Under the Food Safety and Standards Act (FSSA), 2006 and the Consumer Protection Act, 2019, 100% legal responsibility for food quality, hygiene, preparation standards, ingredient safety, foreign objects, spoilage, or foodborne ailments rests exclusively and solely with the respective merchant FBO / cooking restaurant. FoodMela disclaims all liability for food preparation defects.',
      '4. DIGITAL HYPERLOCAL MODEL: FoodMela operates as a digital-first platform headquartered and operating within Birmaharajpur, Subarnapur, Odisha - 767018. We do not operate public physical walk-in customer branches; all communications, billing, and grievance redressals are handled electronically via support@foodmela.online and helpline +91 8144503650.',
      '5. PACKAGE SEAL & OTP ACCEPTANCE: Customers are strictly instructed to inspect outer packaging and stapler/tape seals before accepting delivery. Sharing the delivery OTP with the delivery partner constitutes legal confirmation that the parcel was received sealed, intact, and in good external physical condition.',
      '6. CASH ON DELIVERY (COD) RESTRICTION: Cash on Delivery (COD) is strictly permitted only on orders with total value up to ₹100. All orders exceeding ₹100 must be prepaid online via UPI or online payment prior to order dispatch.',
      '7. STATUTORY GRIEVANCE REDRESSAL: In compliance with Rule 5(3)(b) of the Consumer Protection (E-Commerce) Rules, 2020, our Grievance Officer is Jitendriya Amat (Birmaharajpur, Subarnapur, Odisha - 767018, Phone: 8144503650, Email: support@foodmela.online). Complaints are acknowledged within 48 hours and resolved within 30 days.',
      '8. GOVERNING LAW & JURISDICTION: These terms shall be governed by the laws of India. Any disputes arising out of or in connection with the platform shall be subject to the exclusive jurisdiction of the competent courts in Subarnapur, Odisha.',
    ],
    cta: { label: 'View Food Safety Disclaimer →', to: '/page/disclaimer' },
  },
  disclaimer: {
    title: 'Food Safety & Intermediary Disclaimer',
    emoji: '⚖️',
    body: [
      'INTERMEDIARY STATUS (IT ACT, 2000, SEC 79): FoodMela functions strictly as a technology intermediary platform connecting users with local food merchants and logistics delivery partners.',
      'FOOD BUSINESS OPERATOR (FBO) RESPONSIBILITY: In accordance with the Food Safety and Standards Act, 2006 (FSSA) and FSSAI regulations, each cooking hotel/restaurant is an independent Food Business Operator solely responsible for the ingredients, hygiene, quality, freshness, and preparation of the food. FoodMela only collects sealed packages from these restaurants and delivers them to your doorstep.',
      'EXCLUSION OF COOKING & FOOD CONTAMINATION CLAIMS: FoodMela riders transport food packages in sealed condition directly from the restaurant. FoodMela does not inspect internal ingredients, open containers, or alter food. FoodMela expressly disclaims all legal liability for food taste, spice levels, spoilage, or food poisoning arising from restaurant cooking.',
      'TRANSIT DEFICIENCY vs. FOOD DEFECT: FoodMela is accountable solely for delivery logistics (transit spillage, packaging crushed during transit, or delivery delays). Any transit damage must be reported within 60 minutes of delivery with photo/video proof via WhatsApp to 8144503650.',
      'DIGITAL SERVICE BASE: Birmaharajpur, Subarnapur District, Odisha - 767018 | Helpline: +91 8144503650 | Email: support@foodmela.online.',
    ],
    cta: { label: 'Call Support: 8144503650 →', to: 'tel:8144503650' },
  },
  privacy: {
    title: 'Privacy Policy & Data Protection',
    emoji: '🔒',
    body: [
      'DATA PROTECTION COMPLIANCE (IT Act 2000 & SPDI Rules 2011): FoodMela collects only minimal personal information necessary to deliver your orders: your name, contact phone number, and delivery address.',
      'SECURE OTP AUTHENTICATION: Your phone number is verified via secure OTP through our verification provider. We do not store OTPs or sensitive personal passwords.',
      'NO PAYMENT CARD STORAGE: All payments are processed through secure Indian UPI / payment gateways. FoodMela never collects, views, or stores your debit/credit card numbers or UPI PIN.',
      'ZERO DATA MONETIZATION: We do not sell, rent, trade, or share your personal information with third-party marketing companies. Data is used solely for order fulfilment and customer support in Birmaharajpur.',
      'DATA INQUIRIES & DELETION: For any data questions or account deletion requests, write to our Grievance Officer at support@foodmela.online or call +91 8144503650.',
    ],
    cta: { label: 'Contact Grievance Officer →', to: '/page/contact' },
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
  shipping: {
    title: 'Shipping & Delivery Policy',
    emoji: '🛵',
    body: [
      '1. HYPERLOCAL DELIVERY TIMELINES: FoodMela provides on-demand hyperlocal food and grocery delivery across Birmaharajpur, Odisha. Standard delivery time is typically 25 to 45 minutes from the time of order confirmation, depending on food preparation time and delivery distance.',
      '2. REAL-TIME ORDER TRACKING: Once your order is accepted by the merchant kitchen, you can track your order live from the "My Orders" and "Track Order" screens with real-time status updates.',
      '3. DELIVERY CHARGES: Delivery fees (if applicable) are clearly calculated and displayed on the checkout cart before you place the order. Free delivery is provided on orders exceeding ₹299.',
      '4. PACKAGING & SAFETY: All food orders are dispatched in sealed packages directly from partner restaurants. Customers are requested to inspect the seal before sharing the delivery confirmation OTP with the rider.',
      '5. DELIVERY ATTEMPTS: Our delivery partner will make attempts to contact the customer via phone upon arriving at the designated address. If the customer is unreachable after multiple attempts, the order may be cancelled without refund to cover kitchen and rider expenses.',
      '6. CUSTOMER SUPPORT: For any delivery queries or delays, reach out directly to our Birmaharajpur helpline at +91 8144503650 or email support@foodmela.online.',
    ],
    cta: { label: 'Contact Support: 8144503650 →', to: 'tel:8144503650' },
  },
  app: {
    title: 'Get the FoodMela App',
    emoji: '📱',
    body: [
      'Your favourite food is just a tap away. The Android app brings faster ordering, live rider tracking and app-only deals.',
      'Search “FoodMela” on Google Play, or keep ordering right here on foodmela.online — same account everywhere.',
    ],
    cta: { label: 'Order on Web →', to: '/grocery' },
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

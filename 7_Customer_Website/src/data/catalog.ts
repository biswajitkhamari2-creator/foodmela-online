// Same catalog as the customer app (food_mela_data.dart) — names, images,
// categories, base prices. Live prices/MRP come from Firestore product_prices.
export interface CatalogItem {
  id: string;
  name: string;
  category: string;
  categoryLabel: string;
  basePrice: number;
  rating: number;
  image: string;
  isVeg: boolean;
}

export const CATEGORIES = [
  { key: 'all', label: 'All', icon: '🍽️' },
  { key: 'cooked_food', label: 'Cooked Food', icon: '🍛' },
  { key: 'non_veg', label: 'Non-Veg', icon: '🍗' },
  { key: 'sweets', label: 'Sweets', icon: '🍮' },
  { key: 'snacks', label: 'Snacks', icon: '🥙' },
  { key: 'vegetables', label: 'Vegetables', icon: '🥦' },
  { key: 'fruits', label: 'Fruits', icon: '🍎' },
  { key: 'grocery', label: 'Grocery', icon: '🛒' },
  { key: 'dairy', label: 'Dairy', icon: '🥛' },
  { key: 'eggs_meat', label: 'Eggs & Meat', icon: '🥚' },
];

// ── Presentation-only discovery data (frontend). ──
// No backend change: every card below filters the REAL catalog / live
// Firestore prices. Nothing here invents products, prices or restaurants.

export const CATALOG: CatalogItem[] = [
  { id: 'cf1', name: 'Chicken Biryani', category: 'cooked_food', categoryLabel: 'Cooked Food', basePrice: 220, rating: 4.8, image: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=600&h=400&fit=crop', isVeg: false },
  { id: 'cf2', name: 'Paneer Butter Masala', category: 'cooked_food', categoryLabel: 'Cooked Food', basePrice: 180, rating: 4.6, image: 'https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=600&h=400&fit=crop', isVeg: true },
  { id: 'cf3', name: 'Dal Makhani', category: 'cooked_food', categoryLabel: 'Cooked Food', basePrice: 150, rating: 4.5, image: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=600&h=400&fit=crop', isVeg: true },
  { id: 'cf4', name: 'Mutton Curry', category: 'non_veg', categoryLabel: 'Non-Veg', basePrice: 280, rating: 4.7, image: 'https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?w=600&h=400&fit=crop', isVeg: false },
  { id: 'cf5', name: 'Fish Curry', category: 'non_veg', categoryLabel: 'Non-Veg', basePrice: 240, rating: 4.6, image: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=600&h=400&fit=crop', isVeg: false },
  { id: 'sw1', name: 'Rasgulla (6 pcs)', category: 'sweets', categoryLabel: 'Sweets', basePrice: 80, rating: 4.7, image: 'https://images.unsplash.com/photo-1601303516534-61dcef5bc3c5?w=600&h=400&fit=crop', isVeg: true },
  { id: 'sw2', name: 'Gulab Jamun (6 pcs)', category: 'sweets', categoryLabel: 'Sweets', basePrice: 70, rating: 4.5, image: 'https://images.unsplash.com/photo-1625961332071-f1673bbc4e78?w=600&h=400&fit=crop', isVeg: true },
  { id: 'sw3', name: 'Kheer (250ml)', category: 'sweets', categoryLabel: 'Sweets', basePrice: 60, rating: 4.4, image: 'https://images.unsplash.com/photo-1541696432-82c6da8ce7bf?w=600&h=400&fit=crop', isVeg: true },
  { id: 'sn1', name: 'Samosa (4 pcs)', category: 'snacks', categoryLabel: 'Snacks', basePrice: 40, rating: 4.5, image: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=600&h=400&fit=crop', isVeg: true },
  { id: 'sn2', name: 'Aloo Tikki (4 pcs)', category: 'snacks', categoryLabel: 'Snacks', basePrice: 50, rating: 4.3, image: 'https://images.unsplash.com/photo-1589302168068-964664d93dc0?w=600&h=400&fit=crop', isVeg: true },
  { id: 'vg1', name: 'Fresh Tomato', category: 'vegetables', categoryLabel: 'Vegetables', basePrice: 40, rating: 4.6, image: 'https://images.unsplash.com/photo-1546470427-e26264be0b0d?w=600&h=400&fit=crop', isVeg: true },
  { id: 'vg2', name: 'Potato', category: 'vegetables', categoryLabel: 'Vegetables', basePrice: 30, rating: 4.4, image: 'https://images.unsplash.com/photo-1518977676601-b53f82aba655?w=600&h=400&fit=crop', isVeg: true },
  { id: 'vg3', name: 'Onion', category: 'vegetables', categoryLabel: 'Vegetables', basePrice: 35, rating: 4.3, image: 'https://images.unsplash.com/photo-1618512496248-a07fe83aa8cb?w=600&h=400&fit=crop', isVeg: true },
  { id: 'vg4', name: 'Brinjal (Baingan)', category: 'vegetables', categoryLabel: 'Vegetables', basePrice: 30, rating: 4.5, image: 'https://images.unsplash.com/photo-1615485500704-8e990f9900f7?w=600&h=400&fit=crop', isVeg: true },
  { id: 'vg5', name: 'Cabbage (Pattagobi)', category: 'vegetables', categoryLabel: 'Vegetables', basePrice: 30, rating: 4.4, image: 'https://images.unsplash.com/photo-1594282486552-05b4d80fbb9f?w=600&h=400&fit=crop', isVeg: true },
  { id: 'vg6', name: 'Cauliflower (Phoolgobi)', category: 'vegetables', categoryLabel: 'Vegetables', basePrice: 35, rating: 4.6, image: 'https://images.unsplash.com/photo-1568584711075-3d021a7c3ca3?w=600&h=400&fit=crop', isVeg: true },
  { id: 'vg7', name: 'Lady Finger (Bhindi)', category: 'vegetables', categoryLabel: 'Vegetables', basePrice: 40, rating: 4.3, image: 'https://images.unsplash.com/photo-1425543103986-22abb7d7e8d2?w=600&h=400&fit=crop', isVeg: true },
  { id: 'fr1', name: 'Banana (Dozen)', category: 'fruits', categoryLabel: 'Fruits', basePrice: 50, rating: 4.5, image: 'https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?w=600&h=400&fit=crop', isVeg: true },
  { id: 'fr2', name: 'Apple', category: 'fruits', categoryLabel: 'Fruits', basePrice: 160, rating: 4.6, image: 'https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=600&h=400&fit=crop', isVeg: true },
  { id: 'gr1', name: 'Basmati Rice (India Gate)', category: 'grocery', categoryLabel: 'Grocery', basePrice: 180, rating: 4.7, image: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=600&h=400&fit=crop', isVeg: true },
  { id: 'gr2', name: 'Refined Oil (Fortune)', category: 'grocery', categoryLabel: 'Grocery', basePrice: 145, rating: 4.5, image: 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=600&h=400&fit=crop', isVeg: true },
  { id: 'da1', name: 'Full Cream Milk (Amul)', category: 'dairy', categoryLabel: 'Dairy', basePrice: 62, rating: 4.8, image: 'https://images.unsplash.com/photo-1563636619-e9143da7973b?w=600&h=400&fit=crop', isVeg: true },
  { id: 'da2', name: 'Paneer (Fresh)', category: 'dairy', categoryLabel: 'Dairy', basePrice: 80, rating: 4.6, image: 'https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=600&h=400&fit=crop', isVeg: true },
  { id: 'em1', name: 'Farm Eggs', category: 'eggs_meat', categoryLabel: 'Eggs & Meat', basePrice: 72, rating: 4.7, image: 'https://images.unsplash.com/photo-1582722872445-44dc5f7e3c8f?w=600&h=400&fit=crop', isVeg: false },
  { id: 'em2', name: 'Chicken (Boneless)', category: 'eggs_meat', categoryLabel: 'Eggs & Meat', basePrice: 320, rating: 4.6, image: 'https://images.unsplash.com/photo-1604503468506-a8da13d82791?w=600&h=400&fit=crop', isVeg: false },
];

/** Circular "What's on your mind?" tiles → each maps to a real catalog category. */
export interface ShowcaseCategory {
  key: string; // catalog category key (or 'all')
  label: string;
  emoji: string;
  image: string;
  blurb: string;
}

export const SHOWCASE_CATEGORIES: ShowcaseCategory[] = [
  { key: 'cooked_food', label: 'Restaurant Food', emoji: '🍛', image: 'https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=400&h=400&fit=crop', blurb: 'Biryani, curries & homely meals' },
  { key: 'non_veg', label: 'Non-Veg Specials', emoji: '🍗', image: 'https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?w=400&h=400&fit=crop', blurb: 'Chicken, mutton & fish curries' },
  { key: 'snacks', label: 'Fast Food & Snacks', emoji: '🍔', image: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=400&h=400&fit=crop', blurb: 'Samosa, tikki & evening bites' },
  { key: 'sweets', label: 'Desserts & Sweets', emoji: '🍰', image: 'https://images.unsplash.com/photo-1601303516534-61dcef5bc3c5?w=400&h=400&fit=crop', blurb: 'Rasgulla, gulab jamun & kheer' },
  { key: 'vegetables', label: 'Vegetables', emoji: '🥬', image: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=400&h=400&fit=crop', blurb: 'Farm-fresh, picked daily' },
  { key: 'fruits', label: 'Fruits', emoji: '🍎', image: 'https://images.unsplash.com/photo-1610832958506-aa56368176cf?w=400&h=400&fit=crop', blurb: 'Sweet, juicy & seasonal' },
  { key: 'grocery', label: 'Groceries', emoji: '🛒', image: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=400&h=400&fit=crop', blurb: 'Rice, oil & kitchen staples' },
  { key: 'dairy', label: 'Dairy & Bakery', emoji: '🥛', image: 'https://images.unsplash.com/photo-1563636619-e9143da7973b?w=400&h=400&fit=crop', blurb: 'Milk, paneer & fresh dairy' },
  { key: 'eggs_meat', label: 'Eggs & Meat', emoji: '🥚', image: 'https://images.unsplash.com/photo-1582722872445-44dc5f7e3c8f?w=400&h=400&fit=crop', blurb: 'Farm eggs & fresh chicken' },
];

/** Grocery aisle tiles (subset of real grocery-ish categories). */
export const GROCERY_AISLES: ShowcaseCategory[] = [
  { key: 'vegetables', label: 'Vegetables', emoji: '🥬', image: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=400&h=400&fit=crop', blurb: 'Fresh daily' },
  { key: 'fruits', label: 'Fruits', emoji: '🍎', image: 'https://images.unsplash.com/photo-1610832958506-aa56368176cf?w=400&h=400&fit=crop', blurb: 'Seasonal picks' },
  { key: 'dairy', label: 'Dairy', emoji: '🥛', image: 'https://images.unsplash.com/photo-1563636619-e9143da7973b?w=400&h=400&fit=crop', blurb: 'Milk & paneer' },
  { key: 'grocery', label: 'Staples', emoji: '🌾', image: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=400&h=400&fit=crop', blurb: 'Rice, oil & more' },
  { key: 'snacks', label: 'Snacks', emoji: '🍿', image: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=400&h=400&fit=crop', blurb: 'Evening bites' },
  { key: 'sweets', label: 'Bakery & Sweets', emoji: '🍰', image: 'https://images.unsplash.com/photo-1601303516534-61dcef5bc3c5?w=400&h=400&fit=crop', blurb: 'Fresh & sweet' },
];

/**
 * Storefronts derived from REAL catalog data — one card per catalog
 * category, with live item count + top rating computed at render time.
 * (The platform is a single local kitchen + stores; these are cuisine /
 * aisle storefronts, not invented restaurants.)
 */
export interface Storefront {
  key: string;
  name: string;
  cuisine: string;
  image: string;
  eta: string;
  offer: string;
}

export const STOREFRONTS: Storefront[] = [
  { key: 'cooked_food', name: 'FoodMela Kitchen', cuisine: 'Biryani • Curries • Homely Meals', image: 'https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=800&h=500&fit=crop', eta: '25–30 min', offer: 'Free delivery over ₹299' },
  { key: 'non_veg', name: 'Non-Veg House', cuisine: 'Chicken • Mutton • Fish Curry', image: 'https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?w=800&h=500&fit=crop', eta: '30–35 min', offer: 'Up to 20% off' },
  { key: 'sweets', name: 'Mithaas Sweets', cuisine: 'Rasgulla • Gulab Jamun • Kheer', image: 'https://images.unsplash.com/photo-1601303516534-61dcef5bc3c5?w=800&h=500&fit=crop', eta: '20–25 min', offer: 'Fresh made daily' },
  { key: 'snacks', name: 'Evening Snacks Corner', cuisine: 'Samosa • Tikki • Fried Bites', image: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=800&h=500&fit=crop', eta: '15–20 min', offer: 'From just ₹40' },
  { key: 'vegetables', name: 'Fresh Sabzi Mandi', cuisine: 'Vegetables • Daily Harvest', image: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=800&h=500&fit=crop', eta: '20–30 min', offer: 'Farm fresh picks' },
  { key: 'grocery', name: 'Daily Grocery Store', cuisine: 'Rice • Oil • Staples • Dairy', image: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=800&h=500&fit=crop', eta: '25–35 min', offer: 'Best prices near you' },
];

/** Static promo cards shown alongside the live admin banner (frontend only). */
export interface PromoOffer {
  emoji: string;
  title: string;
  text: string;
  code: string;
  theme: 'offer-green' | 'offer-red' | 'offer-dark' | 'offer-gold';
}

export const PROMO_OFFERS: PromoOffer[] = [
  { emoji: '🔥', title: 'Flat 50% OFF', text: 'Get 50% OFF up to ₹100 on your delicious meal today!', code: 'MELA50', theme: 'offer-red' },
  { emoji: '🛵', title: 'FREE Delivery', text: 'Zero delivery charges on all orders over ₹299.', code: 'FREEDEL', theme: 'offer-green' },
  { emoji: '⚡', title: 'Flat ₹20 OFF', text: 'Instant ₹20 discount on local Birmaharajpur favourites.', code: 'BMAJ20', theme: 'offer-gold' },
  { emoji: '🍰', title: '15% Sweet Discount', text: 'Extra 15% discount on desserts, sweets & bakery.', code: 'SWEET15', theme: 'offer-dark' },
];

/** Search suggestions — plain strings that feed the existing local filter. */
export const SEARCH_SUGGESTIONS = ['biryani', 'pizza', 'burger', 'paneer', 'samosa', 'rasgulla', 'milk', 'eggs', 'rice', 'fish curry'];

// ── "What's Your Mood?" — signature discovery (frontend only). ──
// Each mood maps to REAL catalog categories; counts computed at render time.
export interface Mood {
  key: string;
  title: string;
  emoji: string;
  blurb: string;
  cats: string[];
}

export const MOODS: Mood[] = [
  { key: 'comfort', title: 'Comfort Food', emoji: '🍕', blurb: 'Warm, hearty plates', cats: ['cooked_food', 'non_veg'] },
  { key: 'spicy', title: 'Spicy Cravings', emoji: '🌶️', blurb: 'Biryani & curries', cats: ['cooked_food', 'non_veg'] },
  { key: 'sweet', title: 'Sweet Moments', emoji: '🍰', blurb: 'Mithaas & desserts', cats: ['sweets'] },
  { key: 'chai', title: 'Chai Time', emoji: '☕', blurb: 'Snacks & sips', cats: ['snacks', 'dairy'] },
  { key: 'quick', title: 'Quick Bites', emoji: '🍔', blurb: 'Ready in minutes', cats: ['snacks'] },
  { key: 'family', title: 'Family Meals', emoji: '🥘', blurb: 'Rice, staples & more', cats: ['cooked_food', 'grocery', 'dairy', 'eggs_meat'] },
];

// ── Short descriptions for product cards (presentation copy only). ──
export const ITEM_DESCRIPTIONS: Record<string, string> = {
  cf1: 'Fragrant dum-style biryani with tender chicken pieces.',
  cf2: 'Creamy tomato gravy with soft paneer cubes.',
  cf3: 'Slow-cooked black dal, rich and homely.',
  cf4: 'Hearty mutton curry, village-style spices.',
  cf5: 'Tangy Odia-style fish curry, fresh catch.',
  sw1: 'Spongy, syrupy — the pride of Odisha & Bengal.',
  sw2: 'Warm, soft dumplings in rose syrup.',
  sw3: 'Slow-simmered rice pudding, served fresh.',
  sn1: 'Crispy, golden, stuffed with spiced aloo.',
  sn2: 'Crisp outside, soft inside — chaat-style.',
  vg1: 'Firm, ripe tomatoes for curries & salads.',
  vg2: 'Everyday potatoes, farm-fresh stock.',
  vg3: 'Sharp, juicy onions for tadka & salads.',
  vg4: 'Glossy brinjals, perfect for bharta.',
  vg5: 'Crunchy cabbage for sabzi & rolls.',
  vg6: 'Tight white florets, farm-picked.',
  vg7: 'Tender bhindi, no strings attached.',
  fr1: 'Sweet, energy-packed — a dozen full.',
  fr2: 'Crisp, juicy apples, hand-picked.',
  gr1: 'Long-grain basmati for perfect pulao.',
  gr2: 'Light refined oil for everyday cooking.',
  da1: 'Thick, creamy full-cream milk.',
  da2: 'Soft fresh paneer, made daily.',
  em1: 'Protein-rich farm eggs.',
  em2: 'Tender boneless chicken, cleaned fresh.',
};

// ── Favourites (frontend-only, localStorage). ──
// No backend wishlist exists, so favourites live on-device per user.
const FAV_KEY = 'fm_favs';
export function readFavs(): Set<string> {
  try {
    const raw = localStorage.getItem(FAV_KEY);
    if (raw) return new Set(JSON.parse(raw) as string[]);
  } catch { /* ignore */ }
  return new Set();
}
export function writeFavs(favs: Set<string>) {
  try {
    localStorage.setItem(FAV_KEY, JSON.stringify([...favs]));
  } catch { /* ignore */ }
}

// ── Recent views (frontend-only, localStorage) for "Because You Ordered". ──
const SEEN_KEY = 'fm_seen';
export function readSeen(): string[] {
  try {
    const raw = localStorage.getItem(SEEN_KEY);
    if (raw) return JSON.parse(raw) as string[];
  } catch { /* ignore */ }
  return [];
}
export function pushSeen(id: string) {
  try {
    const list = readSeen().filter((x) => x !== id);
    list.unshift(id);
    localStorage.setItem(SEEN_KEY, JSON.stringify(list.slice(0, 24)));
  } catch { /* ignore */ }
}

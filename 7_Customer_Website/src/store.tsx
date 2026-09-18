import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { collection, onSnapshot } from 'firebase/firestore';
import { db } from './firebase';
import { CATALOG, HIDDEN_ITEM_IDS, readFavs, writeFavs, type CatalogItem } from './data/catalog';

export interface LivePromo {
  id: string;
  code: string;
  title: string;
  text: string;
  emoji: string;
  theme: 'offer-green' | 'offer-red' | 'offer-dark' | 'offer-gold';
  discountType: 'flat' | 'percent';
  discountValue: number;
  maxDiscount: number;
  minOrder: number;
  isActive?: boolean;
  sortOrder?: number;
}

interface ShopState {
  prices: Map<string, number>;
  mrps: Map<string, number>;
  images: Map<string, string>;
  livePromos: LivePromo[];
  customs: CatalogItem[];
  allItems: CatalogItem[];
  cart: Map<string, number>;
  addToCart: (id: string) => void;
  addManyToCart: (entries: [string, number][]) => void;
  removeFromCart: (id: string) => void;
  clearCart: () => void;
  priceOf: (item: CatalogItem) => number;
  mrpOf: (item: CatalogItem) => number | null;
  cartCount: number;
  cartTotal: number;
  user: { name: string; phone: string; address: string } | null;
  setUser: (u: { name: string; phone: string; address: string } | null) => void;
  favs: Set<string>;
  toggleFav: (id: string) => void;
  isFav: (id: string) => boolean;
}

const Ctx = createContext<ShopState>(null!);
export const useShop = () => useContext(Ctx);

export function ShopProvider({ children }: { children: React.ReactNode }) {
  const [prices, setPrices] = useState<Map<string, number>>(new Map());
  const [mrps, setMrps] = useState<Map<string, number>>(new Map());
  const [images, setImages] = useState<Map<string, string>>(new Map());
  const [livePromos, setLivePromos] = useState<LivePromo[]>([]);
  const [customs, setCustoms] = useState<CatalogItem[]>([]);
  const [cart, setCart] = useState<Map<string, number>>(() => {
    try {
      const raw = localStorage.getItem('fm_cart');
      if (raw) return new Map(Object.entries(JSON.parse(raw) as Record<string, number>));
    } catch { /* ignore */ }
    return new Map();
  });
  const [user, setUserState] = useState<ShopState['user']>(() => {
    try {
      const raw = localStorage.getItem('fm_user');
      if (raw) return JSON.parse(raw);
    } catch { /* ignore */ }
    return null;
  });
  // Favourites — on-device only (no backend wishlist exists).
  const [favs, setFavs] = useState<Set<string>>(() => readFavs());
  const toggleFav = (id: string) => {
    setFavs((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      writeFavs(next);
      return next;
    });
  };

  // Live prices + MRP + IMAGES from the SAME Firestore the admin edits.
  // Admin photo change reflects here instantly (same onSnapshot tick as price).
  useEffect(() => {
    const unsub = onSnapshot(collection(db, 'product_prices'), (snap) => {
      const p = new Map<string, number>();
      const m = new Map<string, number>();
      const img = new Map<string, string>();
      snap.docs.forEach((d) => {
        const data = d.data() as { price?: number; mrp?: number; image?: string };
        if (typeof data.price === 'number' && data.price >= 0) p.set(d.id, data.price);
        if (typeof data.mrp === 'number' && data.mrp > 0) m.set(d.id, data.mrp);
        if (typeof data.image === 'string' && data.image.trim()) img.set(d.id, data.image.trim());
      });
      setPrices(p);
      setMrps(m);
      setImages(img);
    });
    return () => unsub();
  }, []);

  // Admin-added items — same collection the admin panel writes.
  // isActive=false hidden; merged with bundled catalog below.
  useEffect(() => {
    const unsub = onSnapshot(collection(db, 'custom_products'), (snap) => {
      const list: CatalogItem[] = [];
      snap.docs.forEach((d) => {
        const m = d.data() as Record<string, unknown>;
        if (m.isActive === false) return;
        const name = String(m.name ?? '').trim();
        const price = typeof m.price === 'number' ? m.price : Number(m.price);
        if (!name || !Number.isFinite(price) || price < 0) return;
        const cat = String(m.category ?? 'cooked_food');
        list.push({
          id: d.id,
          name,
          category: cat,
          categoryLabel: cat.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()),
          basePrice: price,
          rating: typeof m.rating === 'number' ? m.rating : 4.5,
          image: String(m.image ?? ''),
          isVeg: m.isVeg !== false,
          unit: m.unit ? String(m.unit) : (m.weight ? String(m.weight) : undefined),
        });
      });
      list.sort((a, b) => a.name.localeCompare(b.name));
      setCustoms(list);
    });
    return () => unsub();
  }, []);

  // Live promo codes — admin writes app_promos, site reflects instantly
  useEffect(() => {
    const unsub = onSnapshot(collection(db, 'app_promos'), (snap) => {
      const list = snap.docs
        .map((d) => ({ id: d.id, ...(d.data() as Omit<LivePromo, 'id'>) }))
        .filter((p) => p.isActive === true && p.code && (p.discountValue ?? 0) > 0)
        .sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0));
      setLivePromos(list);
    }, () => setLivePromos([]));
    return () => unsub();
  }, []);

  useEffect(() => {
    try { localStorage.setItem('fm_cart', JSON.stringify(Object.fromEntries(cart))); } catch { /* ignore */ }
  }, [cart]);

  // ── LIVE profile sync: backend is the single source of truth.
  // If the name changes anywhere (app, admin), this open website updates
  // within seconds — no reload, no re-login. Polls every 15s while logged in.
  useEffect(() => {
    if (!user) return;
    const phone = user.phone;
    let dead = false;
    const sync = async () => {
      try {
        const res = await fetch(`/api/user/${encodeURIComponent(phone)}`);
        if (!res.ok || dead) return;
        const data = (await res.json()) as { user?: Record<string, unknown> };
        const u = data.user ?? {};
        const fresh = String(u.fullName ?? u.name ?? '').trim();
        if (fresh && fresh !== user.name) {
          setUserState({ ...user, name: fresh });
          try { localStorage.setItem('fm_user', JSON.stringify({ ...user, name: fresh })); } catch { /* ignore */ }
        }
      } catch { /* backend unreachable — keep current */ }
    };
    const t = setInterval(sync, 15000);
    return () => { dead = true; clearInterval(t); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.phone]);

  const setUser = (u: ShopState['user']) => {
    setUserState(u);
    try {
      if (u) localStorage.setItem('fm_user', JSON.stringify(u));
      else localStorage.removeItem('fm_user');
    } catch { /* ignore */ }
  };

  // Admin image overrides applied onto bundled catalog — instant via onSnapshot.
  // HIDDEN_ITEM_IDS filtered out (cooked food, chicken/mutton, paneer, oil).
  const allItems = useMemo(
    () =>
      [
        ...CATALOG.filter((c) => !HIDDEN_ITEM_IDS.has(c.id)).map((c) => {
          const img = images.get(c.id);
          return img ? { ...c, image: img } : c;
        }),
        ...customs,
      ].filter((c) => !HIDDEN_ITEM_IDS.has(c.id) && !/\b(paneer|oil)\b/i.test(c.name)),
    [customs, images],
  );

  const value = useMemo<ShopState>(() => {
    const priceOf = (item: CatalogItem) => prices.get(item.id) ?? item.basePrice;
    const mrpOf = (item: CatalogItem) => {
      const mrp = mrps.get(item.id);
      if (mrp == null || mrp <= priceOf(item)) return null;
      return mrp;
    };
    let cartCount = 0;
    let cartTotal = 0;
    cart.forEach((qty, id) => {
      const item = allItems.find((c) => c.id === id);
      if (!item) return;
      cartCount += qty;
      cartTotal += priceOf(item) * qty;
    });
    return {
      prices, mrps, images, livePromos, cart, customs, allItems, favs, toggleFav,
      isFav: (id: string) => favs.has(id),
      addToCart: (id) => setCart((c) => new Map(c).set(id, (c.get(id) ?? 0) + 1)),
      addManyToCart: (entries) => setCart((c) => {
        const n = new Map(c);
        for (const [id, qty] of entries) n.set(id, (n.get(id) ?? 0) + qty);
        return n;
      }),
      removeFromCart: (id) => setCart((c) => {
        const n = new Map(c);
        const q = (n.get(id) ?? 0) - 1;
        if (q <= 0) n.delete(id); else n.set(id, q);
        return n;
      }),
      clearCart: () => setCart(new Map()),
      priceOf, mrpOf, cartCount, cartTotal, user, setUser,
    };
  }, [prices, mrps, images, livePromos, cart, user, customs, allItems, favs]);

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

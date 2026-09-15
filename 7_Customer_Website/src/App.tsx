import { useState } from 'react';
import { BrowserRouter, Routes, Route, useNavigate, useLocation, Navigate } from 'react-router-dom';
import { ShopProvider, useShop } from './store';
import { DeliveryLocationProvider } from './components/location-context';
import Header from './components/Header';
import Footer, { BottomNav } from './components/Footer';
import CartDrawer from './components/CartDrawer';
import LocationModal from './components/LocationModal';
import Home from './pages/Home';
import Food from './pages/Food';
import Grocery from './pages/Grocery';
import Restaurants from './pages/Restaurants';
import Offers from './pages/Offers';
import Info from './pages/Info';
import Login from './pages/Login';
import Orders from './pages/Orders';
import Track from './pages/Track';
import Profile from './pages/Profile';

// Routes, providers, cart state, auth flow — all unchanged.
// Only the chrome (top strip, footer, bottom nav, location modal) is new.
function Shell() {
  const [cartOpen, setCartOpen] = useState(false);
  const { user, cartCount, cartTotal } = useShop();
  const nav = useNavigate();
  const loc = useLocation();
  // Cart requires login — guests are sent to the OTP login page instead
  // of opening the drawer (matches the pre-redesign behaviour).
  const openCart = () => {
    if (!user) {
      nav('/login');
      return;
    }
    setCartOpen(true);
  };

  const showFloatingCart = cartCount > 0 && !cartOpen && loc.pathname !== '/login';

  return (
    <>
      <div className="top-strip">
        🎉 <strong>Food Fiesta is live!</strong> Free delivery over ₹299 · Now serving Birmaharajpur
      </div>
      <Header onCartOpen={openCart} />
      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/food" element={user ? <Food /> : <Navigate to="/login" replace />} />
          <Route path="/grocery" element={user ? <Grocery /> : <Navigate to="/login" replace />} />
          <Route path="/restaurants" element={user ? <Restaurants /> : <Navigate to="/login" replace />} />
          <Route path="/offers" element={user ? <Offers /> : <Navigate to="/login" replace />} />
          <Route path="/page/:slug" element={<Info />} />
          <Route path="/login" element={<Login />} />
          <Route path="/orders" element={user ? <Orders /> : <Navigate to="/login" replace />} />
          <Route path="/track/:orderId" element={<Track />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="*" element={<Info />} />
        </Routes>
      </main>
      <Footer />
      {Boolean(user) && <BottomNav onCartOpen={openCart} />}
      {showFloatingCart && (
        <aside
          className="fm-floating-cart"
          onClick={openCart}
          role="button"
          tabIndex={0}
          aria-label={`View cart with ${cartCount} items totaling ₹${cartTotal}`}
        >
          <div className="floating-cart-info">
            <span className="floating-cart-count">🛒 {cartCount} {cartCount === 1 ? 'ITEM' : 'ITEMS'}</span>
            <span className="floating-cart-dot">•</span>
            <span className="floating-cart-total">₹{cartTotal}</span>
          </div>
          <div className="floating-cart-btn">
            <span>View Cart</span>
            <span className="floating-cart-arrow">→</span>
          </div>
        </aside>
      )}
      <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} />
      <LocationModal />
    </>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <ShopProvider>
        <DeliveryLocationProvider>
          <Shell />
        </DeliveryLocationProvider>
      </ShopProvider>
    </BrowserRouter>
  );
}

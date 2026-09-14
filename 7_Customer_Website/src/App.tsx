import { useState } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ShopProvider } from './store';
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

// Routes, providers, cart state, auth flow — all unchanged.
// Only the chrome (top strip, footer, bottom nav, location modal) is new.
function Shell() {
  const [cartOpen, setCartOpen] = useState(false);
  const openCart = () => setCartOpen(true);

  return (
    <>
      <div className="top-strip">
        🎉 <strong>Food Fiesta is live!</strong> Free delivery over ₹299 · Now serving Birmaharajpur
      </div>
      <Header onCartOpen={openCart} />
      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/food" element={<Food />} />
          <Route path="/grocery" element={<Grocery />} />
          <Route path="/restaurants" element={<Restaurants />} />
          <Route path="/offers" element={<Offers />} />
          <Route path="/page/:slug" element={<Info />} />
          <Route path="/login" element={<Login />} />
          <Route path="/orders" element={<Orders />} />
          <Route path="/track/:orderId" element={<Track />} />
          <Route path="*" element={<Info />} />
        </Routes>
      </main>
      <Footer />
      <BottomNav onCartOpen={openCart} />
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

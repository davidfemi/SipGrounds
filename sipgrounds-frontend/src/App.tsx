import React, { useEffect } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import 'bootstrap/dist/css/bootstrap.min.css';

import { updateIntercomPage } from './services/intercomService';
import { CartProvider } from './context/CartContext';
import Navbar from './components/Navbar';
import BackToTop from './components/BackToTop';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Cafes from './pages/Cafes';
import CafeDetail from './pages/CafeDetail';
import NewCafe from './pages/NewCafe';
import EditCafe from './pages/EditCafe';
import UserProfile from './pages/UserProfile';
import Shop from './pages/Shop';
import ProductDetail from './pages/ProductDetail';
import Checkout from './pages/Checkout';
import CheckoutSuccess from './pages/CheckoutSuccess';
import Orders from './pages/Orders';
import Rewards from './pages/Rewards';
import Polls from './pages/Polls';
import Menu from './pages/Menu';
import MenuHome from './pages/MenuHome';
import MenuCategory from './pages/MenuCategory';
import MenuSubcategory from './pages/MenuSubcategory';
import MenuItemDetail from './pages/MenuItemDetail';
import ProtectedRoute from './components/ProtectedRoute';
import BookingDetail from './pages/BookingDetail';
import Sitemap from './pages/Sitemap';

import './App.css';

// Component to handle route changes for Intercom
function IntercomRouteHandler() {
  const location = useLocation();

  useEffect(() => {
    updateIntercomPage();
  }, [location.pathname]);

  return null;
}

function App() {
  return (
    <CartProvider>
      <div className="App">
        <IntercomRouteHandler />
        <Navbar />
      <main className="container mt-4">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/cafes" element={<Cafes />} />
          <Route path="/cafes/:id" element={<CafeDetail />} />
          <Route path="/cafes/:cafeId/menu" element={<Menu />} />
          <Route path="/menu" element={<MenuHome />} />
          <Route path="/menu/:categoryId" element={<MenuCategory />} />
          <Route path="/menu/:categoryId/:subcategoryId" element={<MenuSubcategory />} />
          <Route path="/menu/item/:itemId" element={<MenuItemDetail />} />
          <Route path="/menu-items/:itemId" element={<MenuItemDetail />} />
          <Route path="/shop" element={<Shop />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/checkout/success" element={<CheckoutSuccess />} />
          <Route path="/products/:id" element={<ProductDetail />} />
          <Route path="/polls" element={<Polls />} />
          <Route path="/sitemap" element={<Sitemap />} />
          <Route
            path="/orders"
            element={
              <ProtectedRoute>
                <Orders />
              </ProtectedRoute>
            }
          />
          <Route
            path="/rewards"
            element={
              <ProtectedRoute>
                <Rewards />
              </ProtectedRoute>
            }
          />
          <Route
            path="/cafes/new"
            element={
              <ProtectedRoute>
                <NewCafe />
              </ProtectedRoute>
            }
          />
          <Route
            path="/cafes/:id/edit"
            element={
              <ProtectedRoute>
                <EditCafe />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <UserProfile />
              </ProtectedRoute>
            }
          />
          <Route
            path="/bookings/:id"
            element={
              <ProtectedRoute>
                <BookingDetail />
              </ProtectedRoute>
            }
          />
        </Routes>
      </main>
      
      {/* Back to Top Button */}
      <BackToTop />
      
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
    </div>
    </CartProvider>
  );
}

export default App;

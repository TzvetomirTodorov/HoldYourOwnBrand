/**
 * Main Application Component
 *
 * This component serves as the top-level container for the entire application.
 * It sets up the routing structure and wraps everything in necessary providers.
 *
 * The routing structure follows a common e-commerce pattern:
 * - Public routes for browsing products
 * - Auth routes for login/register
 * - Protected routes for user account
 * - Admin routes for store management
 *
 * FIXED: Added OrderConfirmationPage route for post-checkout Stripe redirect
 * ADDED: ScrollToTop component to scroll to top on route changes
 */

import { Routes, Route } from 'react-router-dom';

// Layout components
import Layout from './components/layout/Layout';
import AdminLayout from './components/layout/AdminLayout';

// Utility components
import ScrollToTop from './components/ScrollToTop';  // ADDED: Auto-scroll to top on navigation

// Page components
import HomePage from './pages/HomePage';
import ProductsPage from './pages/ProductsPage';
import ProductDetailPage from './pages/ProductDetailPage';
import CartPage from './pages/CartPage';
import CheckoutPage from './pages/CheckoutPage';
import OrderConfirmationPage from './pages/OrderConfirmationPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import AccountPage from './pages/AccountPage';
import OrdersPage from './pages/OrdersPage';
import WishlistPage from './pages/WishlistPage';
import AboutPage from './pages/AboutPage';
import ContactPage from './pages/ContactPage';
import NotFoundPage from './pages/NotFoundPage';

// Admin pages
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminProducts from './pages/admin/AdminProducts';
import AdminOrders from './pages/admin/AdminOrders';

// Auth protection wrapper
import ProtectedRoute from './components/auth/ProtectedRoute';
import AdminRoute from './components/auth/AdminRoute';

function App() {
  return (
    <>
      {/* ScrollToTop: Automatically scrolls to top when navigating to a new page */}
      <ScrollToTop />
      
      <Routes>
        {/* Public Routes - Wrapped in main layout with header/footer */}
        <Route path="/" element={<Layout />}>
          {/* Homepage */}
          <Route index element={<HomePage />} />

          {/* Product browsing */}
          <Route path="products" element={<ProductsPage />} />
          <Route path="products/:slug" element={<ProductDetailPage />} />
          <Route path="category/:category" element={<ProductsPage />} />

          {/* Shopping */}
          <Route path="cart" element={<CartPage />} />
          <Route path="checkout" element={<CheckoutPage />} />

          {/* Order confirmation - Stripe redirects here after payment */}
          <Route path="order-confirmation" element={<OrderConfirmationPage />} />

          {/* Authentication */}
          <Route path="login" element={<LoginPage />} />
          <Route path="register" element={<RegisterPage />} />

          {/* Protected user routes */}
          <Route path="account" element={
            <ProtectedRoute>
              <AccountPage />
            </ProtectedRoute>
          } />
          <Route path="orders" element={
            <ProtectedRoute>
              <OrdersPage />
            </ProtectedRoute>
          } />
          <Route path="wishlist" element={
            <ProtectedRoute>
              <WishlistPage />
            </ProtectedRoute>
          } />

          {/* Content pages */}
          <Route path="about" element={<AboutPage />} />
          <Route path="contact" element={<ContactPage />} />

          {/* 404 */}
          <Route path="*" element={<NotFoundPage />} />
        </Route>

        {/* Admin Routes - Separate layout without storefront header/footer */}
        <Route path="/admin" element={
          <AdminRoute>
            <AdminLayout />
          </AdminRoute>
        }>
          <Route index element={<AdminDashboard />} />
          <Route path="products" element={<AdminProducts />} />
          <Route path="orders" element={<AdminOrders />} />
        </Route>
      </Routes>
    </>
  );
}

export default App;

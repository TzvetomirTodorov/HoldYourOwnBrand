// HYOW E-commerce API Service
// This service handles all communication with the backend API
// 
// FIX: Token storage now reads from Zustand's persist middleware location
// The authStore saves tokens under "hyow-auth" in localStorage as a nested JSON object

import axios from 'axios';

// Use environment variable for API URL - Vite exposes env vars via import.meta.env
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

/**
 * Helper function to get auth data from Zustand's persisted storage
 * Zustand persist middleware stores state as: { state: { ...data }, version: 0 }
 */
const getAuthFromStorage = () => {
  try {
    const stored = localStorage.getItem('hyow-auth');
    if (!stored) return { accessToken: null, refreshToken: null };
    
    const parsed = JSON.parse(stored);
    return {
      accessToken: parsed?.state?.accessToken || null,
      refreshToken: parsed?.state?.refreshToken || null,
    };
  } catch (error) {
    console.error('Error reading auth from storage:', error);
    return { accessToken: null, refreshToken: null };
  }
};

/**
 * Helper function to update tokens in Zustand's persisted storage
 * This keeps the storage in sync when tokens are refreshed
 */
const updateTokensInStorage = (accessToken, refreshToken) => {
  try {
    const stored = localStorage.getItem('hyow-auth');
    if (!stored) return;
    
    const parsed = JSON.parse(stored);
    if (parsed?.state) {
      if (accessToken !== undefined) parsed.state.accessToken = accessToken;
      if (refreshToken !== undefined) parsed.state.refreshToken = refreshToken;
      localStorage.setItem('hyow-auth', JSON.stringify(parsed));
    }
  } catch (error) {
    console.error('Error updating tokens in storage:', error);
  }
};

/**
 * Helper function to clear auth from Zustand's persisted storage
 * Sets authenticated state to false and clears tokens
 */
const clearAuthStorage = () => {
  try {
    const stored = localStorage.getItem('hyow-auth');
    if (!stored) return;
    
    const parsed = JSON.parse(stored);
    if (parsed?.state) {
      parsed.state.user = null;
      parsed.state.accessToken = null;
      parsed.state.refreshToken = null;
      parsed.state.isAuthenticated = false;
      localStorage.setItem('hyow-auth', JSON.stringify(parsed));
    }
  } catch (error) {
    console.error('Error clearing auth storage:', error);
  }
};

// Create axios instance with default configuration
const api = axios.create({
  baseURL: `${API_URL}/api`,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

// Request interceptor - adds auth token to every request
// FIX: Now reads from Zustand's persisted storage location
api.interceptors.request.use(
  (config) => {
    const { accessToken } = getAuthFromStorage();
    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor - handles token refresh on 401 errors
// FIX: Uses correct storage location and softer error handling
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Only attempt refresh for 401 errors that haven't been retried
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const { refreshToken } = getAuthFromStorage();
        
        if (refreshToken) {
          // Try to refresh the access token
          const response = await axios.post(`${API_URL}/api/auth/refresh`, {
            refreshToken,
          });

          const { accessToken: newAccessToken, refreshToken: newRefreshToken } = response.data.tokens || response.data;
          
          // Update tokens in Zustand's storage
          updateTokensInStorage(newAccessToken, newRefreshToken || refreshToken);

          // Retry the original request with new token
          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
          return api(originalRequest);
        }
      } catch (refreshError) {
        // Refresh failed - clear auth state but don't force redirect
        // Let the ProtectedRoute component handle the redirect naturally
        console.error('Token refresh failed:', refreshError);
        clearAuthStorage();
        
        // Only redirect if we're not already on the login page
        if (!window.location.pathname.includes('/login')) {
          window.location.href = '/login';
        }
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

// AUTH API
export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  logout: () => api.post('/auth/logout'),
  refreshToken: (refreshToken) => api.post('/auth/refresh', { refreshToken }),
  forgotPassword: (email) => api.post('/auth/forgot-password', { email }),
  resetPassword: (token, password) => api.post('/auth/reset-password', { token, password }),
  verifyEmail: (token) => api.post('/auth/verify-email', { token }),
};

// USER API
export const userAPI = {
  getProfile: () => api.get('/users/profile'),
  updateProfile: (data) => api.put('/users/profile', data),
  changePassword: (data) => api.put('/users/password', data),
  getAddresses: () => api.get('/users/addresses'),
  addAddress: (data) => api.post('/users/addresses', data),
  updateAddress: (id, data) => api.put(`/users/addresses/${id}`, data),
  deleteAddress: (id) => api.delete(`/users/addresses/${id}`),
};

// PRODUCTS API
export const productsAPI = {
  getAll: (params) => api.get('/products', { params }),
  getById: (id) => api.get(`/products/${id}`),
  getBySlug: (slug) => api.get(`/products/slug/${slug}`),
  getFeatured: () => api.get('/products/featured'),
  search: (query) => api.get('/products/search', { params: { q: query } }),
};

// CATEGORIES API
export const categoriesAPI = {
  getAll: () => api.get('/categories'),
  getById: (id) => api.get(`/categories/${id}`),
  getBySlug: (slug) => api.get(`/categories/slug/${slug}`),
  getProducts: (id, params) => api.get(`/categories/${id}/products`, { params }),
};

// CART API
export const cartAPI = {
  get: () => api.get('/cart'),
  addItem: (productId, variantId, quantity) =>
    api.post('/cart/items', { productId, variantId, quantity }),
  updateItem: (itemId, quantity) =>
    api.put(`/cart/items/${itemId}`, { quantity }),
  removeItem: (itemId) => api.delete(`/cart/items/${itemId}`),
  clear: () => api.delete('/cart'),
  applyCoupon: (code) => api.post('/cart/coupon', { code }),
  removeCoupon: () => api.delete('/cart/coupon'),
};

// ORDERS API
export const ordersAPI = {
  create: (data) => api.post('/orders', data),
  getAll: () => api.get('/orders'),
  getById: (id) => api.get(`/orders/${id}`),
  cancel: (id) => api.post(`/orders/${id}/cancel`),
};

// WISHLIST API
export const wishlistAPI = {
  get: () => api.get('/wishlist'),
  add: (productId) => api.post('/wishlist', { productId }),
  remove: (productId) => api.delete(`/wishlist/${productId}`),
};

// CHECKOUT API (Stripe Integration)
export const checkoutAPI = {
  createPaymentIntent: (data) => api.post('/checkout/payment-intent', data),
  createSession: (data) => api.post('/checkout/session', data),
};

// ADMIN API
export const adminAPI = {
  getDashboard: () => api.get('/admin/dashboard'),

  getProducts: (params) => api.get('/admin/products', { params }),
  createProduct: (data) => api.post('/admin/products', data),
  updateProduct: (id, data) => api.put(`/admin/products/${id}`, data),
  deleteProduct: (id) => api.delete(`/admin/products/${id}`),

  getCategories: () => api.get('/admin/categories'),
  createCategory: (data) => api.post('/admin/categories', data),
  updateCategory: (id, data) => api.put(`/admin/categories/${id}`, data),
  deleteCategory: (id) => api.delete(`/admin/categories/${id}`),

  getOrders: (params) => api.get('/admin/orders', { params }),
  getOrder: (id) => api.get(`/admin/orders/${id}`),
  updateOrderStatus: (id, status) => api.put(`/admin/orders/${id}/status`, { status }),

  getUsers: (params) => api.get('/admin/users', { params }),
  getUser: (id) => api.get(`/admin/users/${id}`),
  updateUser: (id, data) => api.put(`/admin/users/${id}`, data),

  getInventory: (params) => api.get('/admin/inventory', { params }),
  updateInventory: (variantId, data) => api.put(`/admin/inventory/${variantId}`, data),
};

export default api;

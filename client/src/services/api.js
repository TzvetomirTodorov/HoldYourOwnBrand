// HYOW E-commerce API Service
// This service handles all communication with the backend API
// 
// FIXED: Auth interceptor now properly distinguishes between:
// - Network errors (don't logout - could be temporary)
// - CORS/blocked errors (don't logout - might be ad blocker)
// - Actual 401 auth failures from our server (try refresh, then logout only if refresh also fails with 401)

import axios from 'axios';

// Use environment variable for API URL - Vite exposes env vars via import.meta.env
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

/**
 * Read auth tokens from Zustand's persist storage location
 * Zustand persist middleware stores state at: localStorage['hyow-auth'].state
 * 
 * IMPORTANT: This must match the key used in authStore.js persist config
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
  } catch (e) {
    console.error('Failed to read auth from storage:', e);
    return { accessToken: null, refreshToken: null };
  }
};

/**
 * Update tokens in Zustand's persist storage
 * This keeps api.js and Zustand authStore in sync after token refresh
 */
const updateTokensInStorage = (accessToken, refreshToken) => {
  try {
    const stored = localStorage.getItem('hyow-auth');
    if (!stored) return;

    const parsed = JSON.parse(stored);
    if (parsed?.state) {
      parsed.state.accessToken = accessToken;
      if (refreshToken) {
        parsed.state.refreshToken = refreshToken;
      }
      localStorage.setItem('hyow-auth', JSON.stringify(parsed));
    }
  } catch (e) {
    console.error('Failed to update tokens in storage:', e);
  }
};

/**
 * Clear auth state from Zustand's persist storage
 * ONLY call this when we're CERTAIN the user's session is invalid
 * (i.e., the refresh endpoint explicitly rejected us with 401/403)
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
  } catch (e) {
    console.error('Failed to clear auth storage:', e);
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

// Track if we're currently refreshing to prevent multiple simultaneous refresh attempts
let isRefreshing = false;
let failedQueue = [];

/**
 * Process queued requests after token refresh completes
 */
const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

/**
 * Response interceptor - handles token refresh on 401 errors
 * 
 * CRITICAL FIX: This interceptor now properly distinguishes between different error types:
 * 
 * 1. NO RESPONSE (network error, CORS, blocked by ad blocker):
 *    - DO NOT treat as auth failure
 *    - Just reject the promise so the calling code can handle it
 *    - User stays logged in
 * 
 * 2. 401 from auth endpoints (/auth/login, /auth/refresh, etc.):
 *    - Skip refresh attempt (would cause infinite loop)
 *    - Just reject the promise
 * 
 * 3. 401 from other endpoints:
 *    - Try to refresh the token
 *    - If refresh succeeds: retry original request
 *    - If refresh fails with 401/403: NOW we clear auth and redirect
 *    - If refresh fails with network error: keep user logged in, just reject
 */
api.interceptors.response.use(
  // Success handler - just pass through
  (response) => response,
  
  // Error handler
  async (error) => {
    const originalRequest = error.config;

    // ═══════════════════════════════════════════════════════════════════
    // CASE 1: No response = Network error, CORS issue, or blocked request
    // ═══════════════════════════════════════════════════════════════════
    // This is NOT an auth problem - do NOT logout the user!
    // Common causes:
    // - Ad blocker blocking requests (ERR_BLOCKED_BY_CLIENT)
    // - Network offline
    // - CORS rejection
    // - Server unreachable
    if (!error.response) {
      console.warn('Network error (not auth related):', error.message);
      return Promise.reject(error);
    }

    // ═══════════════════════════════════════════════════════════════════
    // CASE 2: Non-401 error - just pass through
    // ═══════════════════════════════════════════════════════════════════
    const isAuthError = error.response.status === 401;
    if (!isAuthError) {
      return Promise.reject(error);
    }

    // ═══════════════════════════════════════════════════════════════════
    // CASE 3: 401 from auth endpoints - skip refresh to prevent loops
    // ═══════════════════════════════════════════════════════════════════
    const isAuthEndpoint = originalRequest?.url?.includes('/auth/');
    if (isAuthEndpoint) {
      return Promise.reject(error);
    }

    // ═══════════════════════════════════════════════════════════════════
    // CASE 4: Already retried this request - don't retry again
    // ═══════════════════════════════════════════════════════════════════
    if (originalRequest._retry) {
      return Promise.reject(error);
    }

    // ═══════════════════════════════════════════════════════════════════
    // CASE 5: Another refresh is in progress - queue this request
    // ═══════════════════════════════════════════════════════════════════
    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        failedQueue.push({ resolve, reject });
      })
        .then((token) => {
          originalRequest.headers.Authorization = `Bearer ${token}`;
          return api(originalRequest);
        })
        .catch((err) => Promise.reject(err));
    }

    // ═══════════════════════════════════════════════════════════════════
    // CASE 6: Attempt token refresh
    // ═══════════════════════════════════════════════════════════════════
    originalRequest._retry = true;
    isRefreshing = true;

    const { refreshToken } = getAuthFromStorage();

    // No refresh token available - can't refresh, but DON'T force logout
    // The user might just be browsing without being logged in
    if (!refreshToken) {
      isRefreshing = false;
      processQueue(error, null);
      return Promise.reject(error);
    }

    try {
      // Attempt to refresh the token
      const response = await axios.post(`${API_URL}/api/auth/refresh`, {
        refreshToken,
      });

      // Extract new tokens (handle both response formats)
      const { accessToken: newAccessToken, refreshToken: newRefreshToken } = 
        response.data.tokens || response.data;

      // Update tokens in storage
      updateTokensInStorage(newAccessToken, newRefreshToken);

      // Update the failed request's auth header
      originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;

      // Process any queued requests with the new token
      processQueue(null, newAccessToken);

      // Retry the original request
      return api(originalRequest);
      
    } catch (refreshError) {
      // Refresh failed
      processQueue(refreshError, null);

      // ═══════════════════════════════════════════════════════════════
      // CRITICAL: Only clear auth if refresh endpoint EXPLICITLY rejected us
      // ═══════════════════════════════════════════════════════════════
      // If refreshError has no response, it's a network error during refresh
      // - Don't logout (might just be temporary network issue)
      // 
      // If refreshError.response.status is 401 or 403, the server explicitly
      // said "this refresh token is invalid" - NOW we can logout
      const serverExplicitlyRejected = 
        refreshError.response && 
        (refreshError.response.status === 401 || refreshError.response.status === 403);

      if (serverExplicitlyRejected) {
        console.log('Session expired - clearing auth and redirecting to login');
        clearAuthStorage();

        // Only redirect if we're not already on the login page
        if (!window.location.pathname.includes('/login')) {
          // Small delay to allow state to update before redirect
          setTimeout(() => {
            window.location.href = '/login';
          }, 100);
        }
      } else {
        // Network error during refresh - keep user logged in
        console.warn('Token refresh failed due to network error, keeping session');
      }

      return Promise.reject(refreshError);
    } finally {
      isRefreshing = false;
    }
  }
);

// ═══════════════════════════════════════════════════════════════════════════
// API ENDPOINTS
// ═══════════════════════════════════════════════════════════════════════════

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
  getBySlug: (slug) => api.get(`/products/${slug}`),
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

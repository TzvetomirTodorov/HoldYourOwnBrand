/**
 * API Service
 * 
 * This module creates a configured Axios instance for making API requests.
 * It handles common tasks like:
 * - Setting the base URL
 * - Attaching auth tokens to requests
 * - Automatically refreshing expired tokens
 * - Handling common error responses
 * 
 * By centralizing all API configuration here, we ensure consistent behavior
 * across all API calls in the application.
 */

import axios from 'axios';
import { useAuthStore } from '../store/authStore';

// Create axios instance with default configuration
const api = axios.create({
  // In development, Vite proxies /api requests to the backend
  // In production, this should be the full API URL
  baseURL: import.meta.env.VITE_API_URL || '/api',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000, // 30 second timeout
});

/**
 * Request Interceptor
 * 
 * This runs before every request is sent. We use it to:
 * 1. Attach the auth token (if available) to the Authorization header
 * 2. Log requests in development for debugging
 */
api.interceptors.request.use(
  (config) => {
    // Get the current access token from the auth store
    const accessToken = useAuthStore.getState().accessToken;
    
    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }

    // Log requests in development
    if (import.meta.env.DEV) {
      console.log(`📤 ${config.method?.toUpperCase()} ${config.url}`);
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

/**
 * Response Interceptor
 * 
 * This runs after every response is received. We use it to:
 * 1. Handle 401 (Unauthorized) errors by attempting to refresh the token
 * 2. Transform error responses into a consistent format
 */
api.interceptors.response.use(
  // Success handler - just return the response
  (response) => {
    return response;
  },
  
  // Error handler
  async (error) => {
    const originalRequest = error.config;

    // If we get a 401 and haven't already tried to refresh
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      // Try to refresh the access token
      const newToken = await useAuthStore.getState().refreshAccessToken();

      if (newToken) {
        // Retry the original request with the new token
        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        return api(originalRequest);
      }

      // Refresh failed - the user will be logged out by the auth store
    }

    // For other errors, reject with a consistent format
    return Promise.reject(error);
  }
);

/**
 * Helper functions for common HTTP methods
 * These provide a cleaner API for components to use
 */

export const apiGet = (url, config) => api.get(url, config);
export const apiPost = (url, data, config) => api.post(url, data, config);
export const apiPut = (url, data, config) => api.put(url, data, config);
export const apiPatch = (url, data, config) => api.patch(url, data, config);
export const apiDelete = (url, config) => api.delete(url, config);

export default api;

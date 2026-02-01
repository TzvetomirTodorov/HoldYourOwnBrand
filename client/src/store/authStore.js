/**
 * Auth Store
 * 
 * This store manages authentication state using Zustand, a lightweight
 * state management library. It handles:
 * - User login/logout
 * - Token storage and refresh
 * - Checking authentication status
 * 
 * Zustand was chosen over Redux because it's simpler, has less boilerplate,
 * and works great for smaller to medium applications like this e-commerce site.
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import api from '../services/api';

/**
 * The auth store manages all authentication-related state.
 * Using the 'persist' middleware, we automatically save the state
 * to localStorage so users stay logged in across page refreshes.
 */
export const useAuthStore = create(
  persist(
    (set, get) => ({
      // State
      user: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      // Actions

      /**
       * Log in with email and password
       */
      login: async (email, password) => {
        set({ isLoading: true, error: null });
        
        try {
          const response = await api.post('/auth/login', { email, password });
          const { user, tokens } = response.data;

          set({
            user,
            accessToken: tokens.accessToken,
            refreshToken: tokens.refreshToken,
            isAuthenticated: true,
            isLoading: false,
            error: null,
          });

          return { success: true };
        } catch (error) {
          const message = error.response?.data?.message || 'Login failed';
          set({ isLoading: false, error: message });
          return { success: false, error: message };
        }
      },

      /**
       * Register a new account
       */
      register: async (userData) => {
        set({ isLoading: true, error: null });

        try {
          const response = await api.post('/auth/register', userData);
          const { user, tokens } = response.data;

          set({
            user,
            accessToken: tokens.accessToken,
            refreshToken: tokens.refreshToken,
            isAuthenticated: true,
            isLoading: false,
            error: null,
          });

          return { success: true };
        } catch (error) {
          const message = error.response?.data?.message || 'Registration failed';
          set({ isLoading: false, error: message });
          return { success: false, error: message };
        }
      },

      /**
       * Log out the current user
       */
      logout: async () => {
        const { refreshToken } = get();

        try {
          // Tell the server to revoke the refresh token
          await api.post('/auth/logout', { refreshToken });
        } catch (error) {
          // Even if the server request fails, we still log out locally
          console.error('Logout request failed:', error);
        }

        // Clear all auth state
        set({
          user: null,
          accessToken: null,
          refreshToken: null,
          isAuthenticated: false,
          error: null,
        });
      },

      /**
       * Refresh the access token using the refresh token
       * This is called automatically when an API request returns 401
       */
      refreshAccessToken: async () => {
        const { refreshToken } = get();

        if (!refreshToken) {
          get().logout();
          return null;
        }

        try {
          const response = await api.post('/auth/refresh', { refreshToken });
          const { tokens } = response.data;

          set({
            accessToken: tokens.accessToken,
            refreshToken: tokens.refreshToken,
          });

          return tokens.accessToken;
        } catch (error) {
          // Refresh failed - log the user out
          get().logout();
          return null;
        }
      },

      /**
       * Check if the current user is an admin
       */
      isAdmin: () => {
        const { user } = get();
        return user?.role === 'admin' || user?.role === 'super_admin';
      },

      /**
       * Clear any error messages
       */
      clearError: () => set({ error: null }),

      /**
       * Update user profile in the store (after API update)
       */
      updateUser: (updates) => {
        const { user } = get();
        set({ user: { ...user, ...updates } });
      },
    }),
    {
      name: 'hyow-auth', // localStorage key
      partialize: (state) => ({
        // Only persist these specific fields
        user: state.user,
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);

/**
 * Cart Store
 * 
 * Manages shopping cart state including items, quantities, and totals.
 * The cart persists to localStorage for guests and syncs with the server
 * for logged-in users.
 * 
 * The store handles both the local state (for fast UI updates) and
 * server synchronization (for persistence and multi-device support).
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import api from '../services/api';

export const useCartStore = create(
  persist(
    (set, get) => ({
      // State
      items: [],
      subtotal: 0,
      discount: null,
      discountAmount: 0,
      total: 0,
      itemCount: 0,
      isLoading: false,
      error: null,
      sessionId: null, // For guest carts

      // Actions

      /**
       * Fetch the current cart from the server
       * This syncs the local state with what's stored on the backend
       */
      fetchCart: async () => {
        set({ isLoading: true });
        
        try {
          const { sessionId } = get();
          const headers = sessionId ? { 'x-session-id': sessionId } : {};
          
          const response = await api.get('/cart', { headers });
          const { cart } = response.data;

          set({
            items: cart.items,
            subtotal: cart.subtotal,
            discount: cart.discount,
            discountAmount: cart.discountAmount,
            total: cart.total,
            itemCount: cart.itemCount,
            isLoading: false,
            error: null,
          });
        } catch (error) {
          set({ 
            isLoading: false,
            error: error.response?.data?.message || 'Failed to load cart'
          });
        }
      },

      /**
       * Add an item to the cart
       */
      addItem: async (variantId, quantity = 1) => {
        set({ isLoading: true, error: null });

        try {
          const { sessionId } = get();
          const headers = sessionId ? { 'x-session-id': sessionId } : {};

          const response = await api.post('/cart/items', 
            { variantId, quantity },
            { headers }
          );

          // Store session ID for guests
          if (response.data.sessionId) {
            set({ sessionId: response.data.sessionId });
          }

          // Refresh the full cart to get updated totals
          await get().fetchCart();

          return { success: true };
        } catch (error) {
          const message = error.response?.data?.message || 'Failed to add item';
          set({ isLoading: false, error: message });
          return { success: false, error: message };
        }
      },

      /**
       * Update the quantity of a cart item
       */
      updateQuantity: async (itemId, quantity) => {
        set({ isLoading: true, error: null });

        try {
          const { sessionId } = get();
          const headers = sessionId ? { 'x-session-id': sessionId } : {};

          await api.patch(`/cart/items/${itemId}`, 
            { quantity },
            { headers }
          );

          // Refresh cart
          await get().fetchCart();

          return { success: true };
        } catch (error) {
          const message = error.response?.data?.message || 'Failed to update item';
          set({ isLoading: false, error: message });
          return { success: false, error: message };
        }
      },

      /**
       * Remove an item from the cart
       */
      removeItem: async (itemId) => {
        set({ isLoading: true, error: null });

        try {
          const { sessionId } = get();
          const headers = sessionId ? { 'x-session-id': sessionId } : {};

          await api.delete(`/cart/items/${itemId}`, { headers });

          // Refresh cart
          await get().fetchCart();

          return { success: true };
        } catch (error) {
          const message = error.response?.data?.message || 'Failed to remove item';
          set({ isLoading: false, error: message });
          return { success: false, error: message };
        }
      },

      /**
       * Apply a discount code
       */
      applyDiscount: async (code) => {
        set({ isLoading: true, error: null });

        try {
          const { sessionId } = get();
          const headers = sessionId ? { 'x-session-id': sessionId } : {};

          await api.post('/cart/discount', { code }, { headers });

          // Refresh cart to get new totals
          await get().fetchCart();

          return { success: true };
        } catch (error) {
          const message = error.response?.data?.message || 'Invalid discount code';
          set({ isLoading: false, error: message });
          return { success: false, error: message };
        }
      },

      /**
       * Remove the applied discount
       */
      removeDiscount: async () => {
        set({ isLoading: true, error: null });

        try {
          const { sessionId } = get();
          const headers = sessionId ? { 'x-session-id': sessionId } : {};

          await api.delete('/cart/discount', { headers });

          // Refresh cart
          await get().fetchCart();

          return { success: true };
        } catch (error) {
          set({ isLoading: false, error: null });
          return { success: false };
        }
      },

      /**
       * Clear the cart (used after successful checkout)
       */
      clearCart: () => {
        set({
          items: [],
          subtotal: 0,
          discount: null,
          discountAmount: 0,
          total: 0,
          itemCount: 0,
        });
      },

      /**
       * Clear any error message
       */
      clearError: () => set({ error: null }),
    }),
    {
      name: 'hyow-cart',
      partialize: (state) => ({
        // Only persist these fields
        sessionId: state.sessionId,
        itemCount: state.itemCount, // For quick badge display
      }),
    }
  )
);

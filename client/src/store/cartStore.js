/**
 * HYOW Cart Store - Fixed Version
 * 
 * CHANGES FROM ORIGINAL:
 * 1. Removed custom X-Cart-Session-Id header (was causing CORS preflight failures)
 * 2. Session ID is now sent in the request body or as a cookie
 * 3. Uses credentials: 'include' to handle cookies properly
 * 4. Added proper error handling for CORS issues
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { v4 as uuidv4 } from 'uuid';

// Get API URL from environment
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

// Create a session ID for guest users (stored in localStorage)
const getSessionId = () => {
  let sessionId = localStorage.getItem('hyow_cart_session');
  if (!sessionId) {
    sessionId = uuidv4();
    localStorage.setItem('hyow_cart_session', sessionId);
  }
  return sessionId;
};

export const useCartStore = create(
  persist(
    (set, get) => ({
      // State
      items: [],
      isLoading: false,
      error: null,
      isOpen: false,  // For cart drawer/modal

      // Actions
      
      /**
       * Fetch cart from server
       * Works for both guests (using session ID) and logged-in users (using auth token)
       */
      fetchCart: async () => {
        set({ isLoading: true, error: null });
        
        try {
          const token = localStorage.getItem('hyow_token');
          const sessionId = getSessionId();
          
          // Build URL with session ID as query param (instead of custom header)
          const url = token 
            ? `${API_URL}/api/cart` 
            : `${API_URL}/api/cart?sessionId=${sessionId}`;
          
          const headers = {
            'Content-Type': 'application/json',
          };
          
          // Only add Authorization header if we have a token
          if (token) {
            headers['Authorization'] = `Bearer ${token}`;
          }
          
          const response = await fetch(url, {
            method: 'GET',
            headers,
            credentials: 'include',  // Important for cookies
          });
          
          if (!response.ok) {
            // If 401, clear token and retry as guest
            if (response.status === 401) {
              localStorage.removeItem('hyow_token');
              return get().fetchCart();
            }
            throw new Error('Failed to fetch cart');
          }
          
          const data = await response.json();
          set({ items: data.items || [], isLoading: false });
          
        } catch (error) {
          console.error('Cart fetch error:', error);
          set({ error: error.message, isLoading: false });
        }
      },

      /**
       * Add item to cart
       * @param {string} variantId - The product variant ID
       * @param {number} quantity - Quantity to add
       */
      addItem: async (variantId, quantity = 1, productId = null) => {
        set({ isLoading: true, error: null });
        
        try {
          const token = localStorage.getItem('hyow_token');
          const sessionId = getSessionId();
          
          const headers = {
            'Content-Type': 'application/json',
          };
          
          if (token) {
            headers['Authorization'] = `Bearer ${token}`;
          }
          
          const response = await fetch(`${API_URL}/api/cart/items`, {
            method: 'POST',
            headers,
            credentials: 'include',
            body: JSON.stringify({
              variantId,
              productId,
              quantity,
              sessionId: token ? undefined : sessionId,  // Only send sessionId if not logged in
            }),
          });
          
          if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.message || 'Failed to add item to cart');
          }
          
          const data = await response.json();
          set({ items: data.items || [], isLoading: false });
          
          return { success: true };
          
        } catch (error) {
          console.error('Add to cart error:', error);
          set({ error: error.message, isLoading: false });
          return { success: false, error: error.message };
        }
      },

      /**
       * Update item quantity
       * @param {string} itemId - The cart item ID
       * @param {number} quantity - New quantity
       */
      updateQuantity: async (itemId, quantity) => {
        if (quantity < 1) {
          return get().removeItem(itemId);
        }
        
        set({ isLoading: true, error: null });
        
        try {
          const token = localStorage.getItem('hyow_token');
          const sessionId = getSessionId();
          
          const headers = {
            'Content-Type': 'application/json',
          };
          
          if (token) {
            headers['Authorization'] = `Bearer ${token}`;
          }
          
          const response = await fetch(`${API_URL}/api/cart/items/${itemId}`, {
            method: 'PATCH',
            headers,
            credentials: 'include',
            body: JSON.stringify({
              quantity,
              sessionId: token ? undefined : sessionId,
            }),
          });
          
          if (!response.ok) {
            throw new Error('Failed to update quantity');
          }
          
          const data = await response.json();
          set({ items: data.items || [], isLoading: false });
          
        } catch (error) {
          console.error('Update quantity error:', error);
          set({ error: error.message, isLoading: false });
        }
      },

      /**
       * Remove item from cart
       * @param {string} itemId - The cart item ID
       */
      removeItem: async (itemId) => {
        set({ isLoading: true, error: null });
        
        try {
          const token = localStorage.getItem('hyow_token');
          const sessionId = getSessionId();
          
          const headers = {
            'Content-Type': 'application/json',
          };
          
          if (token) {
            headers['Authorization'] = `Bearer ${token}`;
          }
          
          // Pass sessionId as query param for guests
          const url = token 
            ? `${API_URL}/api/cart/items/${itemId}`
            : `${API_URL}/api/cart/items/${itemId}?sessionId=${sessionId}`;
          
          const response = await fetch(url, {
            method: 'DELETE',
            headers,
            credentials: 'include',
          });
          
          if (!response.ok) {
            throw new Error('Failed to remove item');
          }
          
          const data = await response.json();
          set({ items: data.items || [], isLoading: false });
          
        } catch (error) {
          console.error('Remove item error:', error);
          set({ error: error.message, isLoading: false });
        }
      },

      /**
       * Clear entire cart
       */
      clearCart: async () => {
        set({ isLoading: true, error: null });
        
        try {
          const token = localStorage.getItem('hyow_token');
          const sessionId = getSessionId();
          
          const headers = {
            'Content-Type': 'application/json',
          };
          
          if (token) {
            headers['Authorization'] = `Bearer ${token}`;
          }
          
          const url = token 
            ? `${API_URL}/api/cart`
            : `${API_URL}/api/cart?sessionId=${sessionId}`;
          
          const response = await fetch(url, {
            method: 'DELETE',
            headers,
            credentials: 'include',
          });
          
          if (!response.ok) {
            throw new Error('Failed to clear cart');
          }
          
          set({ items: [], isLoading: false });
          
        } catch (error) {
          console.error('Clear cart error:', error);
          set({ error: error.message, isLoading: false });
        }
      },

      // UI Actions
      openCart: () => set({ isOpen: true }),
      closeCart: () => set({ isOpen: false }),
      toggleCart: () => set((state) => ({ isOpen: !state.isOpen })),
      clearError: () => set({ error: null }),

      // Computed values (called as functions)
      getItemCount: () => {
        const { items } = get();
        return items.reduce((total, item) => total + item.quantity, 0);
      },

      getSubtotal: () => {
        const { items } = get();
        return items.reduce((total, item) => {
          const price = item.price || item.variant?.price || 0;
          return total + (price * item.quantity);
        }, 0);
      },
    }),
    {
      name: 'hyow-cart',
      partialize: (state) => ({
        // Only persist items - not loading state or errors
        items: state.items,
      }),
    }
  )
);

export default useCartStore;

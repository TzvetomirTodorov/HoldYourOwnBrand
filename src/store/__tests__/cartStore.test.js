/**
 * Cart Store Tests
 * 
 * This test file demonstrates how to test Zustand stores.
 * It covers:
 * - Initial state
 * - Actions that modify state
 * - Async actions (API calls)
 * - Error handling
 * 
 * Run with: npm test
 * Run this file only: npm test -- cartStore
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { act } from '@testing-library/react';

// We'll test the store by importing and calling it directly
// For this to work, we need to mock fetch and localStorage

// ============================================================================
// MOCK SETUP
// ============================================================================

// Mock notification store (cart store uses it for toasts)
vi.mock('@/store/notificationStore', () => ({
  useNotificationStore: {
    getState: () => ({
      success: vi.fn(),
      error: vi.fn(),
      info: vi.fn(),
    }),
  },
}));

// Mock uuid for session ID generation
vi.mock('uuid', () => ({
  v4: () => 'mock-session-id-12345',
}));

// ============================================================================
// TEST DATA
// ============================================================================

const mockCartItem = {
  id: 'cart-item-1',
  variantId: 'variant-1',
  productId: 'product-1',
  productName: 'Test Hoodie',
  size: 'M',
  color: 'Black',
  quantity: 2,
  price: 89.99,
  imageUrl: '/images/hoodie.jpg',
};

const mockCartResponse = {
  items: [mockCartItem],
};

// ============================================================================
// TEST SUITES
// ============================================================================

describe('Cart Store', () => {
  // We'll dynamically import the store to get a fresh instance each test
  let useCartStore;
  
  beforeEach(async () => {
    // Clear localStorage
    localStorage.clear();
    
    // Reset fetch mock
    global.fetch = vi.fn();
    
    // Reset modules to get fresh store instance
    vi.resetModules();
    
    // Import fresh store
    const module = await import('@/store/cartStore');
    useCartStore = module.useCartStore || module.default;
  });
  
  afterEach(() => {
    vi.clearAllMocks();
  });

  // --------------------------------------------------------------------------
  // INITIAL STATE TESTS
  // --------------------------------------------------------------------------
  
  describe('Initial State', () => {
    it('starts with empty items array', () => {
      const state = useCartStore.getState();
      expect(state.items).toEqual([]);
    });

    it('starts with isLoading false', () => {
      const state = useCartStore.getState();
      expect(state.isLoading).toBe(false);
    });

    it('starts with error null', () => {
      const state = useCartStore.getState();
      expect(state.error).toBe(null);
    });

    it('starts with cart closed', () => {
      const state = useCartStore.getState();
      expect(state.isOpen).toBe(false);
    });
  });

  // --------------------------------------------------------------------------
  // UI ACTIONS TESTS
  // --------------------------------------------------------------------------
  
  describe('UI Actions', () => {
    it('openCart sets isOpen to true', () => {
      const { openCart } = useCartStore.getState();
      
      act(() => {
        openCart();
      });
      
      expect(useCartStore.getState().isOpen).toBe(true);
    });

    it('closeCart sets isOpen to false', () => {
      // First open, then close
      const { openCart, closeCart } = useCartStore.getState();
      
      act(() => {
        openCart();
        closeCart();
      });
      
      expect(useCartStore.getState().isOpen).toBe(false);
    });

    it('toggleCart toggles isOpen state', () => {
      const { toggleCart } = useCartStore.getState();
      
      // Start closed, toggle to open
      act(() => {
        toggleCart();
      });
      expect(useCartStore.getState().isOpen).toBe(true);
      
      // Toggle back to closed
      act(() => {
        toggleCart();
      });
      expect(useCartStore.getState().isOpen).toBe(false);
    });

    it('clearError sets error to null', () => {
      // Manually set an error first
      useCartStore.setState({ error: 'Some error' });
      
      const { clearError } = useCartStore.getState();
      
      act(() => {
        clearError();
      });
      
      expect(useCartStore.getState().error).toBe(null);
    });
  });

  // --------------------------------------------------------------------------
  // COMPUTED VALUES TESTS
  // --------------------------------------------------------------------------
  
  describe('Computed Values', () => {
    it('getItemCount returns total quantity of items', () => {
      // Set up cart with items
      useCartStore.setState({
        items: [
          { ...mockCartItem, quantity: 2 },
          { ...mockCartItem, id: 'item-2', quantity: 3 },
        ],
      });
      
      const { getItemCount } = useCartStore.getState();
      expect(getItemCount()).toBe(5); // 2 + 3
    });

    it('getItemCount returns 0 for empty cart', () => {
      useCartStore.setState({ items: [] });
      
      const { getItemCount } = useCartStore.getState();
      expect(getItemCount()).toBe(0);
    });

    it('getSubtotal calculates total price correctly', () => {
      useCartStore.setState({
        items: [
          { ...mockCartItem, price: 50, quantity: 2 },  // 100
          { ...mockCartItem, id: 'item-2', price: 30, quantity: 1 },  // 30
        ],
      });
      
      const { getSubtotal } = useCartStore.getState();
      expect(getSubtotal()).toBe(130);
    });

    it('getSubtotal returns 0 for empty cart', () => {
      useCartStore.setState({ items: [] });
      
      const { getSubtotal } = useCartStore.getState();
      expect(getSubtotal()).toBe(0);
    });
  });

  // --------------------------------------------------------------------------
  // FETCH CART TESTS
  // --------------------------------------------------------------------------
  
  describe('fetchCart', () => {
    it('sets isLoading while fetching', async () => {
      // Setup fetch to resolve after a delay
      global.fetch = vi.fn(() => 
        new Promise((resolve) => 
          setTimeout(() => resolve({
            ok: true,
            json: () => Promise.resolve(mockCartResponse),
          }), 50)
        )
      );
      
      const { fetchCart } = useCartStore.getState();
      
      // Start fetch
      const fetchPromise = fetchCart();
      
      // Should be loading
      expect(useCartStore.getState().isLoading).toBe(true);
      
      // Wait for fetch to complete
      await fetchPromise;
      
      // Should no longer be loading
      expect(useCartStore.getState().isLoading).toBe(false);
    });

    it('updates items on successful fetch', async () => {
      global.fetch = vi.fn(() => Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockCartResponse),
      }));
      
      const { fetchCart } = useCartStore.getState();
      await fetchCart();
      
      expect(useCartStore.getState().items).toEqual(mockCartResponse.items);
    });

    it('handles fetch error gracefully', async () => {
      global.fetch = vi.fn(() => Promise.resolve({
        ok: false,
        status: 500,
      }));
      
      const { fetchCart } = useCartStore.getState();
      await fetchCart();
      
      expect(useCartStore.getState().error).toBe('Failed to fetch cart');
      expect(useCartStore.getState().isLoading).toBe(false);
    });

    it('includes session ID for guest users', async () => {
      // No token in localStorage = guest user
      localStorage.removeItem('hyow_token');
      localStorage.setItem('hyow_cart_session', 'test-session-123');
      
      global.fetch = vi.fn(() => Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockCartResponse),
      }));
      
      const { fetchCart } = useCartStore.getState();
      await fetchCart();
      
      // Check that fetch was called with session ID in URL
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('sessionId='),
        expect.any(Object)
      );
    });

    it('includes auth token for logged in users', async () => {
      localStorage.setItem('hyow_token', 'test-jwt-token');
      
      global.fetch = vi.fn(() => Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockCartResponse),
      }));
      
      const { fetchCart } = useCartStore.getState();
      await fetchCart();
      
      // Check that fetch was called with Authorization header
      expect(global.fetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          headers: expect.objectContaining({
            'Authorization': 'Bearer test-jwt-token',
          }),
        })
      );
    });
  });

  // --------------------------------------------------------------------------
  // ADD ITEM TESTS
  // --------------------------------------------------------------------------
  
  describe('addItem', () => {
    beforeEach(() => {
      global.fetch = vi.fn(() => Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ items: [mockCartItem] }),
      }));
    });

    it('calls API with variant ID and quantity', async () => {
      const { addItem } = useCartStore.getState();
      await addItem('variant-123', 2);
      
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/cart/items'),
        expect.objectContaining({
          method: 'POST',
          body: expect.stringContaining('variant-123'),
        })
      );
    });

    it('updates items after successful add', async () => {
      const { addItem } = useCartStore.getState();
      await addItem('variant-123', 1);
      
      expect(useCartStore.getState().items).toEqual([mockCartItem]);
    });

    it('returns success indicator on success', async () => {
      const { addItem } = useCartStore.getState();
      const result = await addItem('variant-123', 1);
      
      expect(result.success).toBe(true);
    });

    it('handles API error and returns failure', async () => {
      global.fetch = vi.fn(() => Promise.resolve({
        ok: false,
        json: () => Promise.resolve({ message: 'Out of stock' }),
      }));
      
      const { addItem } = useCartStore.getState();
      const result = await addItem('variant-123', 1);
      
      expect(result.success).toBe(false);
      expect(result.error).toBe('Out of stock');
    });
  });

  // --------------------------------------------------------------------------
  // UPDATE QUANTITY TESTS
  // --------------------------------------------------------------------------
  
  describe('updateQuantity', () => {
    beforeEach(() => {
      global.fetch = vi.fn(() => Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ items: [{ ...mockCartItem, quantity: 5 }] }),
      }));
    });

    it('calls API with item ID and new quantity', async () => {
      const { updateQuantity } = useCartStore.getState();
      await updateQuantity('cart-item-1', 5);
      
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/cart/items/cart-item-1'),
        expect.objectContaining({
          method: 'PATCH',
          body: expect.stringContaining('5'),
        })
      );
    });

    it('removes item when quantity is 0', async () => {
      // Mock removeItem behavior
      global.fetch = vi.fn(() => Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ items: [] }),
      }));
      
      const { updateQuantity } = useCartStore.getState();
      await updateQuantity('cart-item-1', 0);
      
      // Should call DELETE endpoint
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/cart/items/cart-item-1'),
        expect.objectContaining({
          method: 'DELETE',
        })
      );
    });
  });

  // --------------------------------------------------------------------------
  // REMOVE ITEM TESTS
  // --------------------------------------------------------------------------
  
  describe('removeItem', () => {
    beforeEach(() => {
      global.fetch = vi.fn(() => Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ items: [] }),
      }));
    });

    it('calls DELETE API endpoint', async () => {
      const { removeItem } = useCartStore.getState();
      await removeItem('cart-item-1');
      
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/cart/items/cart-item-1'),
        expect.objectContaining({
          method: 'DELETE',
        })
      );
    });

    it('updates items after successful removal', async () => {
      // Start with an item
      useCartStore.setState({ items: [mockCartItem] });
      
      const { removeItem } = useCartStore.getState();
      await removeItem('cart-item-1');
      
      expect(useCartStore.getState().items).toEqual([]);
    });
  });

  // --------------------------------------------------------------------------
  // CLEAR CART TESTS
  // --------------------------------------------------------------------------
  
  describe('clearCart', () => {
    beforeEach(() => {
      global.fetch = vi.fn(() => Promise.resolve({
        ok: true,
        json: () => Promise.resolve({}),
      }));
    });

    it('empties the items array', async () => {
      // Start with items
      useCartStore.setState({ items: [mockCartItem] });
      
      const { clearCart } = useCartStore.getState();
      await clearCart();
      
      expect(useCartStore.getState().items).toEqual([]);
    });
  });
});

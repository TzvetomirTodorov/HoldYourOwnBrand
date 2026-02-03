/**
 * Test Setup File - HYOW E-Commerce
 * 
 * This file runs before each test file and sets up:
 * - DOM testing utilities
 * - Mock implementations for browser APIs
 * - Mock implementations for external services
 * - Global test helpers
 */

import '@testing-library/jest-dom';
import { vi, beforeAll, afterEach, afterAll } from 'vitest';

// ============================================================================
// BROWSER API MOCKS
// ============================================================================

/**
 * Mock localStorage
 * Tests can check what was stored: localStorage.getItem('key')
 * Tests can set values: localStorage.setItem('key', 'value')
 */
const localStorageMock = {
  store: {},
  getItem: vi.fn((key) => localStorageMock.store[key] || null),
  setItem: vi.fn((key, value) => {
    localStorageMock.store[key] = String(value);
  }),
  removeItem: vi.fn((key) => {
    delete localStorageMock.store[key];
  }),
  clear: vi.fn(() => {
    localStorageMock.store = {};
  }),
};
Object.defineProperty(window, 'localStorage', { value: localStorageMock });

/**
 * Mock sessionStorage (same API as localStorage)
 */
const sessionStorageMock = {
  store: {},
  getItem: vi.fn((key) => sessionStorageMock.store[key] || null),
  setItem: vi.fn((key, value) => {
    sessionStorageMock.store[key] = String(value);
  }),
  removeItem: vi.fn((key) => {
    delete sessionStorageMock.store[key];
  }),
  clear: vi.fn(() => {
    sessionStorageMock.store = {};
  }),
};
Object.defineProperty(window, 'sessionStorage', { value: sessionStorageMock });

/**
 * Mock window.matchMedia (used by responsive components)
 */
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

/**
 * Mock window.scrollTo (often called by navigation)
 */
window.scrollTo = vi.fn();

/**
 * Mock IntersectionObserver (used by lazy loading, infinite scroll)
 */
class MockIntersectionObserver {
  constructor(callback) {
    this.callback = callback;
  }
  observe = vi.fn();
  unobserve = vi.fn();
  disconnect = vi.fn();
}
window.IntersectionObserver = MockIntersectionObserver;

/**
 * Mock ResizeObserver (used by responsive components)
 */
class MockResizeObserver {
  observe = vi.fn();
  unobserve = vi.fn();
  disconnect = vi.fn();
}
window.ResizeObserver = MockResizeObserver;

// ============================================================================
// FETCH MOCK
// ============================================================================

/**
 * Global fetch mock - can be customized per test
 * 
 * Usage in tests:
 *   global.fetch = vi.fn(() => Promise.resolve({
 *     ok: true,
 *     json: () => Promise.resolve({ data: 'test' }),
 *   }));
 */
global.fetch = vi.fn(() =>
  Promise.resolve({
    ok: true,
    json: () => Promise.resolve({}),
    text: () => Promise.resolve(''),
    blob: () => Promise.resolve(new Blob()),
  })
);

// ============================================================================
// ENVIRONMENT VARIABLES
// ============================================================================

/**
 * Mock environment variables used in the app
 */
vi.stubEnv('VITE_API_URL', 'http://localhost:3001');
vi.stubEnv('VITE_STRIPE_PUBLISHABLE_KEY', 'pk_test_mock');
vi.stubEnv('VITE_RADAR_PUBLISHABLE_KEY', 'prj_test_mock');

// ============================================================================
// CONSOLE SUPPRESSION (Optional - uncomment to reduce noise)
// ============================================================================

// Suppress console.error for cleaner test output (be careful with this)
// const originalError = console.error;
// beforeAll(() => {
//   console.error = (...args) => {
//     // Filter out specific React warnings if needed
//     if (args[0]?.includes?.('Warning:')) return;
//     originalError.call(console, ...args);
//   };
// });
// afterAll(() => {
//   console.error = originalError;
// });

// ============================================================================
// CLEANUP
// ============================================================================

/**
 * Clean up after each test to prevent state leakage
 */
afterEach(() => {
  // Clear all mocks
  vi.clearAllMocks();
  
  // Clear localStorage mock
  localStorageMock.store = {};
  localStorageMock.getItem.mockClear();
  localStorageMock.setItem.mockClear();
  localStorageMock.removeItem.mockClear();
  
  // Clear sessionStorage mock
  sessionStorageMock.store = {};
  
  // Reset fetch mock
  global.fetch.mockClear();
});

// ============================================================================
// GLOBAL TEST HELPERS
// ============================================================================

/**
 * Helper to wait for async operations
 * Usage: await waitFor(() => expect(element).toBeVisible());
 */
export const waitForTimeout = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Helper to create a mock user object
 */
export const createMockUser = (overrides = {}) => ({
  id: 'user-123',
  email: 'test@example.com',
  firstName: 'Test',
  lastName: 'User',
  role: 'customer',
  createdAt: '2024-01-01T00:00:00Z',
  ...overrides,
});

/**
 * Helper to create a mock product object
 */
export const createMockProduct = (overrides = {}) => ({
  id: 'product-123',
  name: 'Test Product',
  slug: 'test-product',
  price: 99.99,
  description: 'A test product',
  imageUrl: '/images/test-product.jpg',
  category: 'test-category',
  ...overrides,
});

/**
 * Helper to create a mock cart item
 */
export const createMockCartItem = (overrides = {}) => ({
  id: 'cart-item-123',
  variantId: 'variant-123',
  productId: 'product-123',
  productName: 'Test Product',
  size: 'M',
  color: 'Black',
  quantity: 1,
  price: 99.99,
  imageUrl: '/images/test-product.jpg',
  ...overrides,
});

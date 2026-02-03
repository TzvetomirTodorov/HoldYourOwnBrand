/**
 * Vitest Test Setup
 * 
 * This file runs before each test file to set up the testing environment.
 * It configures mocks for browser APIs and external dependencies.
 * 
 * FIXED: Added proper mock for notificationStore with showSuccess, showError, etc.
 */

import { vi, beforeEach, afterEach } from 'vitest';
import '@testing-library/jest-dom/vitest';

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};
Object.defineProperty(window, 'localStorage', { value: localStorageMock });

// Mock sessionStorage
const sessionStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};
Object.defineProperty(window, 'sessionStorage', { value: sessionStorageMock });

// Mock window.scrollTo
window.scrollTo = vi.fn();

// Mock IntersectionObserver
class IntersectionObserverMock {
  constructor() {
    this.observe = vi.fn();
    this.unobserve = vi.fn();
    this.disconnect = vi.fn();
  }
}
window.IntersectionObserver = IntersectionObserverMock;

// Mock ResizeObserver
class ResizeObserverMock {
  constructor() {
    this.observe = vi.fn();
    this.unobserve = vi.fn();
    this.disconnect = vi.fn();
  }
}
window.ResizeObserver = ResizeObserverMock;

// Mock matchMedia
window.matchMedia = vi.fn().mockImplementation((query) => ({
  matches: false,
  media: query,
  onchange: null,
  addListener: vi.fn(),
  removeListener: vi.fn(),
  addEventListener: vi.fn(),
  removeEventListener: vi.fn(),
  dispatchEvent: vi.fn(),
}));

/**
 * CRITICAL FIX: Mock the notificationStore module
 * 
 * The cartStore imports useNotificationStore and calls methods like:
 * - useNotificationStore.getState().showSuccess(message)
 * - useNotificationStore.getState().showError(message)
 * - useNotificationStore.getState().showInfo(message)
 * 
 * We need to provide these mock functions so tests don't fail.
 */
vi.mock('../store/notificationStore', () => ({
  useNotificationStore: {
    getState: () => ({
      showSuccess: vi.fn(),
      showError: vi.fn(),
      showInfo: vi.fn(),
      showWarning: vi.fn(),
      showLoading: vi.fn(),
      addNotification: vi.fn(),
      removeNotification: vi.fn(),
      clearAll: vi.fn(),
      notifications: [],
    }),
    subscribe: vi.fn(),
    setState: vi.fn(),
  },
}));

// Reset mocks between tests
beforeEach(() => {
  vi.clearAllMocks();
  localStorageMock.getItem.mockReturnValue(null);
});

afterEach(() => {
  vi.restoreAllMocks();
});

// Suppress console errors/warnings during tests (optional)
// Uncomment if you want cleaner test output
// console.error = vi.fn();
// console.warn = vi.fn();

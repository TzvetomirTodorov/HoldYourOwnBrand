/**
 * Test Utilities - HYOW E-Commerce
 * 
 * This file provides custom render functions that wrap components
 * with all the providers they need (Router, stores, etc.)
 * 
 * Usage:
 *   import { renderWithProviders, screen } from '@/test/utils';
 *   renderWithProviders(<MyComponent />);
 *   expect(screen.getByText('Hello')).toBeInTheDocument();
 */

import React from 'react';
import { render } from '@testing-library/react';
import { BrowserRouter, MemoryRouter } from 'react-router-dom';
import userEvent from '@testing-library/user-event';

// Re-export everything from testing-library for convenience
export * from '@testing-library/react';
export { userEvent };

// ============================================================================
// MOCK STORES
// ============================================================================

/**
 * Create a mock auth store state
 * This can be customized per test
 */
export const createMockAuthStore = (overrides = {}) => ({
  user: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
  login: vi.fn(),
  logout: vi.fn(),
  register: vi.fn(),
  checkAuth: vi.fn(),
  ...overrides,
});

/**
 * Create a mock cart store state
 */
export const createMockCartStore = (overrides = {}) => ({
  items: [],
  isLoading: false,
  error: null,
  isOpen: false,
  fetchCart: vi.fn(),
  addItem: vi.fn(),
  updateQuantity: vi.fn(),
  removeItem: vi.fn(),
  clearCart: vi.fn(),
  openCart: vi.fn(),
  closeCart: vi.fn(),
  toggleCart: vi.fn(),
  getItemCount: vi.fn(() => 0),
  getSubtotal: vi.fn(() => 0),
  ...overrides,
});

/**
 * Create a mock notification store state
 */
export const createMockNotificationStore = (overrides = {}) => ({
  notifications: [],
  success: vi.fn(),
  error: vi.fn(),
  info: vi.fn(),
  warning: vi.fn(),
  remove: vi.fn(),
  ...overrides,
});

// ============================================================================
// MOCK ZUSTAND STORES
// ============================================================================

/**
 * Mock the useAuthStore hook
 * 
 * Usage in test file:
 *   vi.mock('@/store/authStore', () => ({
 *     useAuthStore: () => mockAuthStore,
 *   }));
 */
export const mockAuthStore = createMockAuthStore();
export const mockCartStore = createMockCartStore();
export const mockNotificationStore = createMockNotificationStore();

// ============================================================================
// RENDER HELPERS
// ============================================================================

/**
 * Render with BrowserRouter
 * Use this for most component tests that use React Router
 */
export function renderWithRouter(ui, options = {}) {
  const { route = '/', ...renderOptions } = options;
  
  window.history.pushState({}, 'Test page', route);
  
  return {
    user: userEvent.setup(),
    ...render(ui, {
      wrapper: ({ children }) => <BrowserRouter>{children}</BrowserRouter>,
      ...renderOptions,
    }),
  };
}

/**
 * Render with MemoryRouter
 * Use this when you need to control the router history
 */
export function renderWithMemoryRouter(ui, options = {}) {
  const { 
    initialEntries = ['/'],
    initialIndex = 0,
    ...renderOptions 
  } = options;
  
  return {
    user: userEvent.setup(),
    ...render(ui, {
      wrapper: ({ children }) => (
        <MemoryRouter initialEntries={initialEntries} initialIndex={initialIndex}>
          {children}
        </MemoryRouter>
      ),
      ...renderOptions,
    }),
  };
}

/**
 * Render with all providers (Router + mocked stores)
 * This is the most common render function you'll use
 * 
 * Usage:
 *   const { user } = renderWithProviders(<AccountPage />, {
 *     authStore: { isAuthenticated: true, user: mockUser },
 *   });
 */
export function renderWithProviders(ui, options = {}) {
  const {
    route = '/',
    authStore = {},
    cartStore = {},
    notificationStore = {},
    ...renderOptions
  } = options;
  
  // Update mock stores with provided overrides
  Object.assign(mockAuthStore, createMockAuthStore(authStore));
  Object.assign(mockCartStore, createMockCartStore(cartStore));
  Object.assign(mockNotificationStore, createMockNotificationStore(notificationStore));
  
  window.history.pushState({}, 'Test page', route);
  
  return {
    user: userEvent.setup(),
    mockAuthStore,
    mockCartStore,
    mockNotificationStore,
    ...render(ui, {
      wrapper: ({ children }) => <BrowserRouter>{children}</BrowserRouter>,
      ...renderOptions,
    }),
  };
}

// ============================================================================
// ASYNC HELPERS
// ============================================================================

/**
 * Wait for loading states to resolve
 * Useful when components fetch data on mount
 */
export const waitForLoadingToFinish = () =>
  waitFor(() => {
    const loaders = document.querySelectorAll('[data-testid="loading"]');
    expect(loaders.length).toBe(0);
  });

/**
 * Wait for a specific amount of time
 * Use sparingly - prefer waitFor with assertions
 */
export const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// ============================================================================
// ACCESSIBILITY HELPERS
// ============================================================================

/**
 * Check that an element is accessible by role
 */
export const expectAccessibleElement = (element, role) => {
  expect(element).toBeInTheDocument();
  expect(element).toHaveAttribute('role', role);
};

/**
 * Check that a form field has proper labeling
 */
export const expectLabeledField = (labelText) => {
  const label = screen.getByText(labelText);
  expect(label).toBeInTheDocument();
  
  const forAttr = label.getAttribute('for');
  if (forAttr) {
    const input = document.getElementById(forAttr);
    expect(input).toBeInTheDocument();
  }
};

// ============================================================================
// FORM HELPERS
// ============================================================================

/**
 * Fill out a form field by label
 */
export const fillField = async (user, labelText, value) => {
  const input = screen.getByLabelText(labelText);
  await user.clear(input);
  await user.type(input, value);
  return input;
};

/**
 * Submit a form by button text
 */
export const submitForm = async (user, buttonText = 'Submit') => {
  const button = screen.getByRole('button', { name: buttonText });
  await user.click(button);
};

// ============================================================================
// IMPORT HELPER FOR TESTS
// ============================================================================

/**
 * Common imports object for test files
 * 
 * Usage at top of test file:
 *   import { renderWithProviders, screen, userEvent, waitFor } from '@/test/utils';
 */
import { screen, waitFor, within, fireEvent } from '@testing-library/react';
export { screen, waitFor, within, fireEvent };

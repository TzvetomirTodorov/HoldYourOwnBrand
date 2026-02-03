/**
 * AccountPage Component Tests
 * 
 * This test file demonstrates how to test React components in HYOW.
 * It covers:
 * - Rendering with different states (authenticated vs not)
 * - User interactions (clicking, form submission)
 * - Async operations (logout)
 * - Navigation testing
 * 
 * Run with: npm test
 * Run this file only: npm test -- AccountPage
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import AccountPage from '@/pages/AccountPage';

// ============================================================================
// MOCK SETUP
// ============================================================================

// Mock the stores - these are hoisted, so they run before imports
const mockNavigate = vi.fn();
const mockLogout = vi.fn();
const mockSuccess = vi.fn();

// Mock react-router-dom's useNavigate
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

// Mock the auth store
vi.mock('@/store/authStore', () => ({
  useAuthStore: vi.fn(),
}));

// Mock the notification store
vi.mock('@/store/notificationStore', () => ({
  useNotificationStore: () => ({
    success: mockSuccess,
    error: vi.fn(),
    info: vi.fn(),
  }),
}));

// Import the mocked hook so we can control its return value
import { useAuthStore } from '@/store/authStore';

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Helper to render AccountPage with router context
 */
const renderAccountPage = () => {
  return render(
    <BrowserRouter>
      <AccountPage />
    </BrowserRouter>
  );
};

/**
 * Create a mock user object for testing
 */
const createMockUser = (overrides = {}) => ({
  id: 'user-123',
  email: 'john@example.com',
  firstName: 'John',
  lastName: 'Doe',
  role: 'customer',
  phone: '555-123-4567',
  createdAt: '2024-01-15T10:00:00Z',
  ...overrides,
});

// ============================================================================
// TEST SUITES
// ============================================================================

describe('AccountPage', () => {
  // Reset mocks before each test
  beforeEach(() => {
    vi.clearAllMocks();
    mockNavigate.mockClear();
    mockLogout.mockClear();
    mockSuccess.mockClear();
  });

  // --------------------------------------------------------------------------
  // AUTHENTICATION TESTS
  // --------------------------------------------------------------------------
  
  describe('Authentication Redirect', () => {
    it('redirects to login page when user is not authenticated', () => {
      // Setup: User is not authenticated
      useAuthStore.mockReturnValue({
        user: null,
        isAuthenticated: false,
        logout: mockLogout,
      });

      // Act: Render the page
      renderAccountPage();

      // Assert: Should redirect to login
      expect(mockNavigate).toHaveBeenCalledWith('/login');
    });

    it('shows loading state when checking authentication', () => {
      // Setup: Checking auth (not yet determined)
      useAuthStore.mockReturnValue({
        user: null,
        isAuthenticated: false,
        logout: mockLogout,
      });

      // Act
      renderAccountPage();

      // Assert: Should show loading indicator
      expect(screen.getByText('Loading...')).toBeInTheDocument();
    });
  });

  // --------------------------------------------------------------------------
  // AUTHENTICATED USER TESTS
  // --------------------------------------------------------------------------
  
  describe('Authenticated User View', () => {
    beforeEach(() => {
      // Setup: User is authenticated
      useAuthStore.mockReturnValue({
        user: createMockUser(),
        isAuthenticated: true,
        logout: mockLogout,
      });
    });

    it('displays the page title', () => {
      renderAccountPage();
      
      expect(screen.getByRole('heading', { name: /my account/i })).toBeInTheDocument();
    });

    it('displays user email', () => {
      renderAccountPage();
      
      // Email appears in multiple places, so we check for at least one
      const emailElements = screen.getAllByText('john@example.com');
      expect(emailElements.length).toBeGreaterThan(0);
    });

    it('displays user full name', () => {
      renderAccountPage();
      
      const names = screen.getAllByText('John Doe'); expect(names.length).toBeGreaterThan(0);
    });

    it('displays user avatar with first initial', () => {
      renderAccountPage();
      
      // The avatar shows the first letter of firstName
      expect(screen.getByText('J')).toBeInTheDocument();
    });

    it('displays member since date formatted correctly', () => {
      renderAccountPage();
      
      // Date should be formatted as "January 15, 2024"
      expect(screen.getByText(/member since/i)).toBeInTheDocument();
      expect(screen.getByText(/january 15, 2024/i)).toBeInTheDocument();
    });

    it('displays phone number when available', () => {
      renderAccountPage();
      
      expect(screen.getByText('555-123-4567')).toBeInTheDocument();
    });

    it('displays "Not set" when phone is missing', () => {
      useAuthStore.mockReturnValue({
        user: createMockUser({ phone: null }),
        isAuthenticated: true,
        logout: mockLogout,
      });

      renderAccountPage();
      
      expect(screen.getByText('Not set')).toBeInTheDocument();
    });
  });

  // --------------------------------------------------------------------------
  // NAVIGATION LINKS TESTS
  // --------------------------------------------------------------------------
  
  describe('Navigation Links', () => {
    beforeEach(() => {
      useAuthStore.mockReturnValue({
        user: createMockUser(),
        isAuthenticated: true,
        logout: mockLogout,
      });
    });

    it('has link to Order History', () => {
      renderAccountPage();
      
      const orderLink = screen.getByRole('link', { name: /order history/i });
      expect(orderLink).toHaveAttribute('href', '/orders');
    });

    it('has link to Wishlist', () => {
      renderAccountPage();
      
      const wishlistLink = screen.getByRole('link', { name: /wishlist/i });
      expect(wishlistLink).toHaveAttribute('href', '/wishlist');
    });

    it('has link to Continue Shopping', () => {
      renderAccountPage();
      
      const shopLink = screen.getByRole('link', { name: /continue shopping/i });
      expect(shopLink).toHaveAttribute('href', '/products');
    });
  });

  // --------------------------------------------------------------------------
  // ADMIN TESTS
  // --------------------------------------------------------------------------
  
  describe('Admin User Features', () => {
    it('shows admin section for admin users', () => {
      useAuthStore.mockReturnValue({
        user: createMockUser({ role: 'admin' }),
        isAuthenticated: true,
        logout: mockLogout,
      });

      renderAccountPage();
      
      expect(screen.getByText(/admin access/i)).toBeInTheDocument();
      const adminLink = screen.getByRole('link', { name: /go to admin dashboard/i });
      expect(adminLink).toHaveAttribute('href', '/admin');
    });

    it('hides admin section for regular users', () => {
      useAuthStore.mockReturnValue({
        user: createMockUser({ role: 'customer' }),
        isAuthenticated: true,
        logout: mockLogout,
      });

      renderAccountPage();
      
      expect(screen.queryByText(/admin access/i)).not.toBeInTheDocument();
    });
  });

  // --------------------------------------------------------------------------
  // LOGOUT TESTS
  // --------------------------------------------------------------------------
  
  describe('Logout Functionality', () => {
    beforeEach(() => {
      useAuthStore.mockReturnValue({
        user: createMockUser(),
        isAuthenticated: true,
        logout: mockLogout.mockResolvedValue(),
      });
    });

    it('displays sign out button', () => {
      renderAccountPage();
      
      expect(screen.getByRole('button', { name: /sign out/i })).toBeInTheDocument();
    });

    it('calls logout when sign out button is clicked', async () => {
      const user = userEvent.setup();
      renderAccountPage();
      
      const signOutButton = screen.getByRole('button', { name: /sign out/i });
      await user.click(signOutButton);

      expect(mockLogout).toHaveBeenCalledTimes(1);
    });

    it('shows loading state during logout', async () => {
      // Make logout take some time
      mockLogout.mockImplementation(() => new Promise((resolve) => setTimeout(resolve, 100)));
      
      const user = userEvent.setup();
      renderAccountPage();
      
      const signOutButton = screen.getByRole('button', { name: /sign out/i });
      await user.click(signOutButton);

      // Button should show loading text
      expect(screen.getByText(/signing out/i)).toBeInTheDocument();
    });

    it('shows success notification after logout', async () => {
      const user = userEvent.setup();
      renderAccountPage();
      
      const signOutButton = screen.getByRole('button', { name: /sign out/i });
      await user.click(signOutButton);

      await waitFor(() => {
        expect(mockSuccess).toHaveBeenCalledWith('You have been signed out');
      });
    });

    it('navigates to home page after logout', async () => {
      const user = userEvent.setup();
      renderAccountPage();
      
      const signOutButton = screen.getByRole('button', { name: /sign out/i });
      await user.click(signOutButton);

      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith('/');
      });
    });
  });

  // --------------------------------------------------------------------------
  // EDGE CASES
  // --------------------------------------------------------------------------
  
  describe('Edge Cases', () => {
    it('handles user with only email (no name)', () => {
      useAuthStore.mockReturnValue({
        user: createMockUser({ firstName: null, lastName: null }),
        isAuthenticated: true,
        logout: mockLogout,
      });

      renderAccountPage();
      
      // Should show "Welcome" instead of name
      expect(screen.getByText('Welcome')).toBeInTheDocument();
      
      // Avatar should use first letter of email
      expect(screen.getByText('J')).toBeInTheDocument(); // 'j' from john@example.com
    });

    it('handles missing createdAt date', () => {
      useAuthStore.mockReturnValue({
        user: createMockUser({ createdAt: null }),
        isAuthenticated: true,
        logout: mockLogout,
      });

      renderAccountPage();
      
      // Should not crash, just not show the date
      expect(screen.queryByText(/member since/i)).not.toBeInTheDocument();
    });
  });
});

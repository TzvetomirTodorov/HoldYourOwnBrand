/**
 * Header Component - FIXED VERSION v2
 *
 * Main navigation header for the storefront.
 *
 * FIXES APPLIED:
 * 1. Added useEffect to call fetchCart() on component mount
 * 2. This ensures the cart badge always shows accurate count from server
 *
 * BEHAVIOR:
 * - When NOT logged in: Shows "Sign In" link that goes to /login
 * - When logged in: Shows user icon with dropdown menu containing:
 *   - User's name/email
 *   - My Account link
 *   - Order History link
 *   - Wishlist link
 *   - Sign Out button (clearly labeled)
 */

import { useState, useEffect } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { Search, User, ShoppingBag, Menu, X, Heart, LogOut, ChevronDown } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { useCartStore } from '../../store/cartStore';

function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);

  const navigate = useNavigate();
  const { isAuthenticated, user, logout } = useAuthStore();
  
  // Subscribe to cart store - items will update reactively when cart changes
  const items = useCartStore((state) => state.items);
  const fetchCart = useCartStore((state) => state.fetchCart);

  // Calculate cart item count from current items
  const cartItemCount = (items || []).reduce((sum, item) => sum + (item.quantity || 1), 0);

  // FIXED: Fetch cart from server on component mount to ensure badge is accurate
  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  // Also refetch cart when auth state changes (login/logout)
  useEffect(() => {
    fetchCart();
  }, [isAuthenticated, fetchCart]);

  // Debug: Log auth state (remove in production)
  useEffect(() => {
    console.log('Header auth state:', { isAuthenticated, user: user?.email });
  }, [isAuthenticated, user]);

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close menus when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (isProfileMenuOpen && !e.target.closest('.profile-menu-container')) {
        setIsProfileMenuOpen(false);
      }
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [isProfileMenuOpen]);

  const handleLogout = async () => {
    setIsProfileMenuOpen(false);
    await logout();
    navigate('/');
  };

  const navLinks = [
    { name: 'SHOP ALL', path: '/products' },
    { name: 'T-SHIRTS', path: '/category/t-shirts' },
    { name: 'HOODIES', path: '/category/hoodies' },
    { name: 'HATS', path: '/category/hats' },
    { name: 'ACCESSORIES', path: '/category/accessories' },
    { name: 'ABOUT', path: '/about' },
  ];

  return (
    <header className={`sticky top-0 z-50 transition-all duration-300 ${
      isScrolled ? 'bg-white shadow-md' : 'bg-white'
    }`}>
      <div className="container-custom">
        <div className="flex items-center justify-between h-16 md:h-20">
          {/* Logo */}
          <Link to="/" className="font-display text-xl md:text-2xl tracking-wider text-ocean-950">
            HOLD YOUR OWN
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-6">
            {navLinks.map((link) => (
              <NavLink
                key={link.path}
                to={link.path}
                className={({ isActive }) =>
                  `text-xs tracking-wider transition-colors ${
                    isActive
                      ? 'text-ocean-950 font-semibold'
                      : 'text-street-600 hover:text-ocean-950'
                  }`
                }
              >
                {link.name}
              </NavLink>
            ))}
          </nav>

          {/* Desktop Actions */}
          <div className="hidden lg:flex items-center gap-4">
            {/* Search */}
            <button
              className="p-2 text-street-600 hover:text-ocean-950 transition-colors"
              aria-label="Search"
            >
              <Search className="w-5 h-5" />
            </button>

            {/* Profile / Account - Different behavior based on auth state */}
            {isAuthenticated ? (
              /* LOGGED IN: Show dropdown menu */
              <div className="relative profile-menu-container">
                <button
                  onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                  className="flex items-center gap-1 p-2 text-street-600 hover:text-ocean-950 transition-colors"
                  aria-label="Account menu"
                >
                  <User className="w-5 h-5" />
                  <ChevronDown className={`w-3 h-3 transition-transform ${isProfileMenuOpen ? 'rotate-180' : ''}`} />
                </button>

                {/* Profile Dropdown */}
                {isProfileMenuOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-white border border-street-200 rounded-lg shadow-lg py-2 z-50">
                    {/* User Info */}
                    <div className="px-4 py-3 border-b border-street-100">
                      <p className="text-sm font-medium text-ocean-950">
                        {user?.firstName ? `${user.firstName} ${user.lastName || ''}` : 'Welcome!'}
                      </p>
                      <p className="text-xs text-street-500 truncate">
                        {user?.email}
                      </p>
                    </div>

                    {/* Menu Links */}
                    <div className="py-1">
                      <Link
                        to="/account"
                        onClick={() => setIsProfileMenuOpen(false)}
                        className="flex items-center gap-3 px-4 py-2 text-sm text-street-700 hover:bg-street-50 transition-colors"
                      >
                        <User className="w-4 h-4" />
                        My Account
                      </Link>
                      <Link
                        to="/orders"
                        onClick={() => setIsProfileMenuOpen(false)}
                        className="flex items-center gap-3 px-4 py-2 text-sm text-street-700 hover:bg-street-50 transition-colors"
                      >
                        <ShoppingBag className="w-4 h-4" />
                        Order History
                      </Link>
                      <Link
                        to="/wishlist"
                        onClick={() => setIsProfileMenuOpen(false)}
                        className="flex items-center gap-3 px-4 py-2 text-sm text-street-700 hover:bg-street-50 transition-colors"
                      >
                        <Heart className="w-4 h-4" />
                        Wishlist
                      </Link>
                    </div>

                    {/* Sign Out */}
                    <div className="border-t border-street-100 pt-1">
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-4 py-2 text-sm text-blood-600 hover:bg-blood-50 transition-colors"
                      >
                        <LogOut className="w-4 h-4" />
                        Sign Out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              /* NOT LOGGED IN: Show Sign In link */
              <Link
                to="/login"
                className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-street-600 hover:text-ocean-950 transition-colors"
              >
                <User className="w-5 h-5" />
                <span className="hidden xl:inline">Sign In</span>
              </Link>
            )}

            {/* Wishlist (only when logged in) */}
            {isAuthenticated && (
              <Link
                to="/wishlist"
                className="p-2 text-street-600 hover:text-ocean-950 transition-colors"
                aria-label="Wishlist"
              >
                <Heart className="w-5 h-5" />
              </Link>
            )}

            {/* Cart */}
            <Link
              to="/cart"
              className="p-2 text-street-600 hover:text-ocean-950 transition-colors relative"
              aria-label="Shopping cart"
            >
              <ShoppingBag className="w-5 h-5" />
              {cartItemCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-california-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
                  {cartItemCount > 9 ? '9+' : cartItemCount}
                </span>
              )}
            </Link>
          </div>

          {/* Mobile Actions */}
          <div className="flex lg:hidden items-center gap-2">
            {/* Profile - Mobile */}
            {isAuthenticated ? (
              <Link
                to="/account"
                className="p-2 text-street-600 hover:text-ocean-950 transition-colors"
                aria-label="Account"
              >
                <User className="w-5 h-5" />
              </Link>
            ) : (
              <Link
                to="/login"
                className="p-2 text-street-600 hover:text-ocean-950 transition-colors"
                aria-label="Sign in"
              >
                <User className="w-5 h-5" />
              </Link>
            )}

            {/* Cart - Mobile */}
            <Link
              to="/cart"
              className="p-2 text-street-600 hover:text-ocean-950 transition-colors relative"
              aria-label="Shopping cart"
            >
              <ShoppingBag className="w-5 h-5" />
              {cartItemCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-california-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
                  {cartItemCount > 9 ? '9+' : cartItemCount}
                </span>
              )}
            </Link>

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-2 text-street-600 hover:text-ocean-950 transition-colors"
              aria-label={isMenuOpen ? 'Close menu' : 'Open menu'}
            >
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="lg:hidden border-t border-street-200 bg-white">
          <nav className="container-custom py-4">
            {/* Navigation Links */}
            {navLinks.map((link) => (
              <NavLink
                key={link.path}
                to={link.path}
                onClick={() => setIsMenuOpen(false)}
                className={({ isActive }) =>
                  `block py-3 text-sm tracking-wider transition-colors ${
                    isActive
                      ? 'text-ocean-950 font-semibold'
                      : 'text-street-600 hover:text-ocean-950'
                  }`
                }
              >
                {link.name}
              </NavLink>
            ))}

            {/* Mobile Account Section */}
            <div className="border-t border-street-200 mt-4 pt-4">
              {isAuthenticated ? (
                /* LOGGED IN: Show account links and sign out */
                <div className="space-y-1">
                  <p className="text-xs text-street-500 uppercase tracking-wider mb-2">
                    Account
                  </p>
                  <Link
                    to="/account"
                    onClick={() => setIsMenuOpen(false)}
                    className="block py-2 text-sm text-street-600 hover:text-ocean-950"
                  >
                    My Account
                  </Link>
                  <Link
                    to="/orders"
                    onClick={() => setIsMenuOpen(false)}
                    className="block py-2 text-sm text-street-600 hover:text-ocean-950"
                  >
                    Order History
                  </Link>
                  <Link
                    to="/wishlist"
                    onClick={() => setIsMenuOpen(false)}
                    className="block py-2 text-sm text-street-600 hover:text-ocean-950"
                  >
                    Wishlist
                  </Link>
                  <button
                    onClick={() => {
                      handleLogout();
                      setIsMenuOpen(false);
                    }}
                    className="block w-full text-left py-2 text-sm text-blood-600 font-medium"
                  >
                    Sign Out
                  </button>
                </div>
              ) : (
                /* NOT LOGGED IN: Show sign in / register */
                <div className="space-y-3">
                  <Link
                    to="/login"
                    onClick={() => setIsMenuOpen(false)}
                    className="block w-full py-3 text-center bg-ocean-950 text-white text-sm font-medium rounded hover:bg-ocean-900 transition-colors"
                  >
                    Sign In
                  </Link>
                  <Link
                    to="/register"
                    onClick={() => setIsMenuOpen(false)}
                    className="block w-full py-3 text-center border border-ocean-950 text-ocean-950 text-sm font-medium rounded hover:bg-ocean-50 transition-colors"
                  >
                    Create Account
                  </Link>
                </div>
              )}
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}

export default Header;

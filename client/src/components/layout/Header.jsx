/**
 * Header Component
 * 
 * Main navigation header for the storefront.
 * - Shows logo and main navigation links
 * - Profile icon: links to /account when logged in, /login when not
 * - Cart icon with item count badge
 * - Responsive mobile menu
 */

import { useState, useEffect } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { Search, User, ShoppingBag, Menu, X, Heart, LogOut } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { useCartStore } from '../../store/cartStore';

function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  
  const navigate = useNavigate();
  const { isAuthenticated, user, logout } = useAuthStore();
  const { items } = useCartStore();
  
  // Calculate cart item count
  const cartItemCount = (items || []).reduce((sum, item) => sum + (item.quantity || 1), 0);

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

  const handleLogout = () => {
    logout();
    setIsProfileMenuOpen(false);
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

            {/* Profile / Account */}
            <div className="relative profile-menu-container">
              {isAuthenticated ? (
                <>
                  <button
                    onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                    className="p-2 text-street-600 hover:text-ocean-950 transition-colors"
                    aria-label="Account menu"
                  >
                    <User className="w-5 h-5" />
                  </button>
                  
                  {/* Profile Dropdown */}
                  {isProfileMenuOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-white border border-street-200 rounded-lg shadow-lg py-2 z-50">
                      <div className="px-4 py-2 border-b border-street-100">
                        <p className="text-sm font-medium text-ocean-950">
                          {user?.firstName || 'Welcome'}
                        </p>
                        <p className="text-xs text-street-500 truncate">
                          {user?.email}
                        </p>
                      </div>
                      <Link
                        to="/account"
                        onClick={() => setIsProfileMenuOpen(false)}
                        className="block px-4 py-2 text-sm text-street-700 hover:bg-street-50"
                      >
                        My Account
                      </Link>
                      <Link
                        to="/orders"
                        onClick={() => setIsProfileMenuOpen(false)}
                        className="block px-4 py-2 text-sm text-street-700 hover:bg-street-50"
                      >
                        Order History
                      </Link>
                      <Link
                        to="/wishlist"
                        onClick={() => setIsProfileMenuOpen(false)}
                        className="block px-4 py-2 text-sm text-street-700 hover:bg-street-50"
                      >
                        Wishlist
                      </Link>
                      <button
                        onClick={handleLogout}
                        className="w-full text-left px-4 py-2 text-sm text-blood-600 hover:bg-street-50 flex items-center gap-2"
                      >
                        <LogOut className="w-4 h-4" />
                        Sign Out
                      </button>
                    </div>
                  )}
                </>
              ) : (
                <Link
                  to="/login"
                  className="p-2 text-street-600 hover:text-ocean-950 transition-colors"
                  aria-label="Sign in"
                >
                  <User className="w-5 h-5" />
                </Link>
              )}
            </div>

            {/* Wishlist (when logged in) */}
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
            {/* Profile */}
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
            
            {/* Mobile Account Links */}
            <div className="border-t border-street-200 mt-4 pt-4 space-y-3">
              {isAuthenticated ? (
                <>
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
                    className="block py-2 text-sm text-blood-600"
                  >
                    Sign Out
                  </button>
                </>
              ) : (
                <>
                  <Link
                    to="/login"
                    onClick={() => setIsMenuOpen(false)}
                    className="block py-2 text-sm text-street-600 hover:text-ocean-950"
                  >
                    Sign In
                  </Link>
                  <Link
                    to="/register"
                    onClick={() => setIsMenuOpen(false)}
                    className="block py-2 text-sm text-street-600 hover:text-ocean-950"
                  >
                    Create Account
                  </Link>
                </>
              )}
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}

export default Header;

/**
 * Header Component
 * 
 * The main navigation header for the storefront. It includes the logo,
 * navigation links, search, account access, and shopping cart.
 * 
 * The header is designed to be responsive:
 * - On desktop: Full horizontal navigation
 * - On mobile: Hamburger menu with slide-out navigation
 */

import { useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { Menu, X, Search, User, ShoppingBag, Heart } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { useCartStore } from '../../store/cartStore';

function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  
  // Get auth state from store
  const { user, isAuthenticated } = useAuthStore();
  
  // Get cart item count from store
  const cartItemCount = useCartStore((state) => state.itemCount);

  // Navigation links
  const navigation = [
    { name: 'Shop All', href: '/products' },
    { name: 'T-Shirts', href: '/category/tees' },
    { name: 'Hoodies', href: '/category/hoodies' },
    { name: 'Hats', href: '/category/hats' },
    { name: 'Accessories', href: '/category/accessories' },
    { name: 'About', href: '/about' },
  ];

  return (
    <header className="bg-white border-b border-street-200 sticky top-0 z-50">
      <nav className="container-custom">
        <div className="flex items-center justify-between h-16 lg:h-20">
          
          {/* Mobile menu button */}
          <button
            type="button"
            className="lg:hidden p-2 -ml-2 text-street-600 hover:text-street-900"
            onClick={() => setMobileMenuOpen(true)}
          >
            <Menu className="w-6 h-6" />
            <span className="sr-only">Open menu</span>
          </button>

          {/* Logo */}
          <Link to="/" className="flex-shrink-0">
            <span className="font-display text-2xl lg:text-3xl tracking-wider text-ocean-950">
              HOLD YOUR OWN
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex lg:items-center lg:gap-8">
            {navigation.map((item) => (
              <NavLink
                key={item.name}
                to={item.href}
                className={({ isActive }) =>
                  `font-display text-sm tracking-wider uppercase transition-colors duration-200 ${
                    isActive 
                      ? 'text-ocean-950 border-b-2 border-sunset-500' 
                      : 'text-street-600 hover:text-ocean-950'
                  }`
                }
              >
                {item.name}
              </NavLink>
            ))}
          </div>

          {/* Right side icons */}
          <div className="flex items-center gap-2 sm:gap-4">
            {/* Search button */}
            <button
              type="button"
              className="p-2 text-street-600 hover:text-street-900 transition-colors"
              onClick={() => setSearchOpen(true)}
            >
              <Search className="w-5 h-5" />
              <span className="sr-only">Search</span>
            </button>

            {/* Wishlist (logged in only) */}
            {isAuthenticated && (
              <Link
                to="/wishlist"
                className="hidden sm:block p-2 text-street-600 hover:text-street-900 transition-colors"
              >
                <Heart className="w-5 h-5" />
                <span className="sr-only">Wishlist</span>
              </Link>
            )}

            {/* Account */}
            <Link
              to={isAuthenticated ? '/account' : '/login'}
              className="p-2 text-street-600 hover:text-street-900 transition-colors"
            >
              <User className="w-5 h-5" />
              <span className="sr-only">Account</span>
            </Link>

            {/* Cart */}
            <Link
              to="/cart"
              className="relative p-2 text-street-600 hover:text-street-900 transition-colors"
            >
              <ShoppingBag className="w-5 h-5" />
              {cartItemCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 flex items-center justify-center bg-sunset-600 text-white text-xs font-bold rounded-full">
                  {cartItemCount}
                </span>
              )}
              <span className="sr-only">Cart</span>
            </Link>
          </div>
        </div>
      </nav>

      {/* Mobile menu overlay */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-black/50"
            onClick={() => setMobileMenuOpen(false)}
          />
          
          {/* Menu panel */}
          <div className="fixed inset-y-0 left-0 w-full max-w-xs bg-white shadow-xl">
            <div className="flex items-center justify-between p-4 border-b border-street-200">
              <span className="font-display text-xl tracking-wider text-ocean-950">
                MENU
              </span>
              <button
                type="button"
                className="p-2 -mr-2 text-street-600"
                onClick={() => setMobileMenuOpen(false)}
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="py-4">
              {navigation.map((item) => (
                <NavLink
                  key={item.name}
                  to={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={({ isActive }) =>
                    `block px-4 py-3 font-display text-lg tracking-wider uppercase ${
                      isActive 
                        ? 'text-ocean-950 bg-ocean-50' 
                        : 'text-street-600 hover:text-ocean-950 hover:bg-street-50'
                    }`
                  }
                >
                  {item.name}
                </NavLink>
              ))}
            </div>

            {/* Mobile menu footer */}
            <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-street-200">
              {isAuthenticated ? (
                <div className="text-sm text-street-600">
                  Welcome back, <span className="font-medium">{user?.firstName}</span>
                </div>
              ) : (
                <div className="flex gap-4">
                  <Link
                    to="/login"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex-1 btn-secondary text-sm py-2"
                  >
                    Sign In
                  </Link>
                  <Link
                    to="/register"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex-1 btn-primary text-sm py-2"
                  >
                    Register
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Search overlay - TODO: Implement search modal */}
      {searchOpen && (
        <div className="fixed inset-0 z-50 bg-white">
          <div className="container-custom py-4">
            <div className="flex items-center gap-4">
              <input
                type="search"
                placeholder="Search products..."
                className="input flex-1"
                autoFocus
              />
              <button
                type="button"
                className="p-2 text-street-600"
                onClick={() => setSearchOpen(false)}
              >
                <X className="w-6 h-6" />
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}

export default Header;

/**
 * AccountPage - User Account Dashboard
 *
 * Full-featured account page with:
 * - User profile display
 * - Quick links to orders, wishlist
 * - Account settings
 * - Sign out functionality
 */

import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, Package, Heart, Settings, LogOut, Mail, Calendar, Shield, ChevronRight } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { useNotificationStore } from '../store/notificationStore';

function AccountPage() {
  const navigate = useNavigate();
  const { user, isAuthenticated, logout } = useAuthStore();
  const { success } = useNotificationStore();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  // Redirect if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, navigate]);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await logout();
      success('You have been signed out');
      navigate('/');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setIsLoggingOut(false);
    }
  };

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  if (!isAuthenticated || !user) {
    return (
      <div className="section">
        <div className="container-custom">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gold-500 mx-auto mb-4"></div>
              <p className="text-street-500">Loading...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="section bg-street-50 min-h-screen">
      <div className="container-custom py-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="font-display text-4xl tracking-wider mb-2">MY ACCOUNT</h1>
          <p className="text-street-500">Manage your profile and preferences</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Profile Card - Left Column */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm p-6">
              {/* Avatar */}
              <div className="flex flex-col items-center mb-6">
                <div className="w-24 h-24 rounded-full bg-gold-500 flex items-center justify-center mb-4">
                  <span className="text-3xl font-display text-white">
                    {user.firstName?.[0] || user.email?.[0]?.toUpperCase() || 'U'}
                  </span>
                </div>
                <h2 className="font-display text-xl tracking-wider">
                  {user.firstName ? `${user.firstName} ${user.lastName || ''}`.trim() : 'Welcome'}
                </h2>
                <p className="text-street-500 text-sm">{user.email}</p>
              </div>

              {/* User Info */}
              <div className="space-y-4 border-t border-street-100 pt-4">
                <div className="flex items-center text-sm">
                  <Mail className="w-4 h-4 text-street-400 mr-3" />
                  <span className="text-street-600">{user.email}</span>
                </div>
                {user.createdAt && (
                  <div className="flex items-center text-sm">
                    <Calendar className="w-4 h-4 text-street-400 mr-3" />
                    <span className="text-street-600">Member since {formatDate(user.createdAt)}</span>
                  </div>
                )}
                <div className="flex items-center text-sm">
                  <Shield className="w-4 h-4 text-street-400 mr-3" />
                  <span className="text-street-600 capitalize">{user.role || 'Customer'}</span>
                </div>
              </div>

              {/* Sign Out Button */}
              <button
                onClick={handleLogout}
                disabled={isLoggingOut}
                className="w-full mt-6 py-3 px-4 border border-street-200 rounded-lg text-street-600 hover:bg-street-50 hover:border-street-300 transition-colors flex items-center justify-center gap-2"
              >
                <LogOut className="w-4 h-4" />
                {isLoggingOut ? 'Signing out...' : 'Sign Out'}
              </button>
            </div>
          </div>

          {/* Main Content - Right Column */}
          <div className="lg:col-span-2 space-y-6">
            {/* Quick Actions */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="font-display text-lg tracking-wider mb-4">QUICK ACTIONS</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Order History */}
                <Link
                  to="/orders"
                  className="flex items-center p-4 border border-street-100 rounded-lg hover:border-gold-500 hover:bg-gold-50 transition-all group"
                >
                  <div className="w-12 h-12 rounded-full bg-gold-100 flex items-center justify-center mr-4 group-hover:bg-gold-200 transition-colors">
                    <Package className="w-6 h-6 text-gold-600" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium text-street-900">Order History</h4>
                    <p className="text-sm text-street-500">View your past orders</p>
                  </div>
                  <ChevronRight className="w-5 h-5 text-street-400 group-hover:text-gold-500 transition-colors" />
                </Link>

                {/* Wishlist */}
                <Link
                  to="/wishlist"
                  className="flex items-center p-4 border border-street-100 rounded-lg hover:border-gold-500 hover:bg-gold-50 transition-all group"
                >
                  <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mr-4 group-hover:bg-red-200 transition-colors">
                    <Heart className="w-6 h-6 text-red-500" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium text-street-900">Wishlist</h4>
                    <p className="text-sm text-street-500">Items you've saved</p>
                  </div>
                  <ChevronRight className="w-5 h-5 text-street-400 group-hover:text-gold-500 transition-colors" />
                </Link>
              </div>
            </div>

            {/* Account Settings */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="font-display text-lg tracking-wider mb-4">ACCOUNT DETAILS</h3>
              
              <div className="space-y-4">
                {/* Name */}
                <div className="flex justify-between items-center py-3 border-b border-street-100">
                  <div>
                    <p className="text-sm text-street-500">Full Name</p>
                    <p className="font-medium text-street-900">
                      {user.firstName ? `${user.firstName} ${user.lastName || ''}`.trim() : 'Not set'}
                    </p>
                  </div>
                </div>

                {/* Email */}
                <div className="flex justify-between items-center py-3 border-b border-street-100">
                  <div>
                    <p className="text-sm text-street-500">Email Address</p>
                    <p className="font-medium text-street-900">{user.email}</p>
                  </div>
                  <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">Verified</span>
                </div>

                {/* Phone */}
                <div className="flex justify-between items-center py-3 border-b border-street-100">
                  <div>
                    <p className="text-sm text-street-500">Phone Number</p>
                    <p className="font-medium text-street-900">{user.phone || 'Not set'}</p>
                  </div>
                </div>

                {/* Password */}
                <div className="flex justify-between items-center py-3">
                  <div>
                    <p className="text-sm text-street-500">Password</p>
                    <p className="font-medium text-street-900">••••••••</p>
                  </div>
                </div>
              </div>

              <p className="text-sm text-street-400 mt-4">
                Profile editing coming soon. Contact support if you need to update your information.
              </p>
            </div>

            {/* Admin Link (if admin) */}
            {user.role === 'admin' && (
              <div className="bg-white rounded-lg shadow-sm p-6 border-2 border-gold-200">
                <h3 className="font-display text-lg tracking-wider mb-4 flex items-center gap-2">
                  <Shield className="w-5 h-5 text-gold-500" />
                  ADMIN ACCESS
                </h3>
                <p className="text-street-600 mb-4">You have administrator privileges.</p>
                <Link
                  to="/admin"
                  className="inline-flex items-center gap-2 bg-gold-500 text-white px-6 py-3 rounded-lg hover:bg-gold-600 transition-colors"
                >
                  Go to Admin Dashboard
                  <ChevronRight className="w-4 h-4" />
                </Link>
              </div>
            )}

            {/* Continue Shopping */}
            <div className="text-center pt-4">
              <Link
                to="/products"
                className="text-gold-600 hover:text-gold-700 font-medium inline-flex items-center gap-1"
              >
                Continue Shopping
                <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AccountPage;

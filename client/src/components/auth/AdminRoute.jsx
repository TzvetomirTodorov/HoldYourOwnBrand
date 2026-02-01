/**
 * Admin Route Component
 * 
 * Similar to ProtectedRoute, but with an additional check for admin permissions.
 * This ensures that only users with 'admin' or 'super_admin' roles can access
 * the admin dashboard and management pages.
 * 
 * The component performs two checks:
 * 1. Is the user authenticated? If not, redirect to login.
 * 2. Is the user an admin? If not, redirect to homepage with a message.
 */

import { Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';

function AdminRoute({ children }) {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const user = useAuthStore((state) => state.user);
  const location = useLocation();

  // First, check if logged in at all
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Then, check if they have admin permissions
  const isAdmin = user?.role === 'admin' || user?.role === 'super_admin';
  
  if (!isAdmin) {
    // Redirect non-admin users to the homepage
    // In a real app, you might show a "403 Forbidden" page instead
    return <Navigate to="/" replace />;
  }

  // User is an admin - render the admin content
  return children;
}

export default AdminRoute;

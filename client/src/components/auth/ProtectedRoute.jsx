/**
 * Protected Route Component
 * 
 * This component acts as a "guard" for routes that require authentication.
 * If a user tries to access a protected page without being logged in,
 * they'll be redirected to the login page.
 * 
 * The component also saves the intended destination, so after logging in,
 * the user is taken to where they originally wanted to go - not just
 * the homepage. This creates a much smoother user experience.
 * 
 * Usage example:
 *   <Route path="/account" element={
 *     <ProtectedRoute>
 *       <AccountPage />
 *     </ProtectedRoute>
 *   } />
 */

import { Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';

function ProtectedRoute({ children }) {
  // Get authentication status from the store
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  
  // useLocation gives us the current URL path - we need this to remember
  // where the user wanted to go, so we can redirect them after login
  const location = useLocation();

  // If the user isn't logged in, redirect them to the login page
  // The `state` prop passes the current location to the login page,
  // which can then redirect back here after successful authentication
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // User is authenticated - render the protected content
  return children;
}

export default ProtectedRoute;

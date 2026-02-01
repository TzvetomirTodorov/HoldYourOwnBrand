/**
 * Authentication Middleware
 * 
 * This middleware handles JWT token verification and user authentication.
 * It provides functions to protect routes that require authentication and
 * to restrict access based on user roles.
 * 
 * JWT (JSON Web Tokens) work by encoding user information into a signed token
 * that the client sends with each request. The server can verify the signature
 * to ensure the token hasn't been tampered with.
 */

const jwt = require('jsonwebtoken');
const db = require('../config/database');
const { AppError } = require('./errorHandler');

/**
 * Authenticate user from JWT token
 * 
 * This middleware extracts the JWT from the Authorization header,
 * verifies it, and attaches the user object to the request for
 * use in subsequent middleware and route handlers.
 * 
 * The Authorization header format is: "Bearer <token>"
 */
const authenticate = async (req, res, next) => {
  try {
    // Extract the token from the Authorization header
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new AppError('No authentication token provided', 401);
    }

    // Remove "Bearer " prefix to get the actual token
    const token = authHeader.split(' ')[1];

    // Verify the token using the secret key
    // If the token is invalid or expired, jwt.verify will throw an error
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Get the user from the database to ensure they still exist
    // and haven't been deactivated since the token was issued
    const result = await db.query(
      `SELECT id, email, first_name, last_name, role, is_active, created_at
       FROM users 
       WHERE id = $1`,
      [decoded.userId]
    );

    if (result.rows.length === 0) {
      throw new AppError('User no longer exists', 401);
    }

    const user = result.rows[0];

    // Check if the user account is active
    if (!user.is_active) {
      throw new AppError('Your account has been deactivated', 401);
    }

    // Attach the user to the request object
    // This makes user data available to all subsequent middleware and routes
    req.user = {
      id: user.id,
      email: user.email,
      firstName: user.first_name,
      lastName: user.last_name,
      role: user.role
    };

    next();
  } catch (error) {
    // Pass JWT-specific errors to the error handler
    if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
      return next(error);
    }
    // Pass our custom AppErrors
    if (error.isOperational) {
      return next(error);
    }
    // For unexpected errors, create a generic unauthorized error
    next(new AppError('Authentication failed', 401));
  }
};

/**
 * Optional authentication
 * 
 * Similar to authenticate, but doesn't fail if no token is provided.
 * Useful for routes that work differently for authenticated vs anonymous users,
 * like a product listing that might show wishlist status for logged-in users.
 */
const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    // If no auth header, just continue without setting req.user
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return next();
    }

    const token = authHeader.split(' ')[1];

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      
      const result = await db.query(
        `SELECT id, email, first_name, last_name, role, is_active
         FROM users 
         WHERE id = $1 AND is_active = true`,
        [decoded.userId]
      );

      if (result.rows.length > 0) {
        const user = result.rows[0];
        req.user = {
          id: user.id,
          email: user.email,
          firstName: user.first_name,
          lastName: user.last_name,
          role: user.role
        };
      }
    } catch (tokenError) {
      // Token is invalid, but that's okay for optional auth
      // Just continue without setting req.user
    }

    next();
  } catch (error) {
    // For optional auth, we don't want to block the request
    next();
  }
};

/**
 * Authorize by role
 * 
 * This middleware restricts access to specific user roles.
 * It must be used AFTER the authenticate middleware.
 * 
 * Usage:
 *   router.get('/admin', authenticate, authorize('admin', 'super_admin'), handler);
 * 
 * @param {...string} roles - Allowed roles for this route
 */
const authorize = (...roles) => {
  return (req, res, next) => {
    // Check if user exists (authenticate middleware should have run first)
    if (!req.user) {
      return next(new AppError('You must be logged in to access this resource', 401));
    }

    // Check if user's role is in the allowed roles list
    if (!roles.includes(req.user.role)) {
      return next(new AppError('You do not have permission to perform this action', 403));
    }

    next();
  };
};

/**
 * Check if user owns the resource
 * 
 * This middleware ensures users can only access their own resources.
 * It compares the user ID from the token with a user ID in the request.
 * 
 * @param {string} paramName - The name of the route parameter containing the user ID
 */
const isOwnerOrAdmin = (paramName = 'userId') => {
  return (req, res, next) => {
    if (!req.user) {
      return next(new AppError('You must be logged in', 401));
    }

    const resourceUserId = req.params[paramName];
    
    // Allow if user owns the resource or is an admin
    if (req.user.id === resourceUserId || 
        req.user.role === 'admin' || 
        req.user.role === 'super_admin') {
      return next();
    }

    next(new AppError('You can only access your own resources', 403));
  };
};

module.exports = {
  authenticate,
  optionalAuth,
  authorize,
  isOwnerOrAdmin
};

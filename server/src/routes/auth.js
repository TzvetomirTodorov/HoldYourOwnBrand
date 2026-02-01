/**
 * Authentication Routes
 * 
 * This file handles all authentication-related endpoints including:
 * - User registration (creating new accounts)
 * - Login (getting access tokens)
 * - Token refresh (getting new access tokens using refresh tokens)
 * - Password reset flow
 * - Logout (invalidating refresh tokens)
 * 
 * We use JWT (JSON Web Tokens) for authentication with a dual-token strategy:
 * - Access tokens: Short-lived (15 min), used for API requests
 * - Refresh tokens: Long-lived (7 days), used only to get new access tokens
 * 
 * This approach limits the damage if an access token is stolen (it expires quickly)
 * while still providing a good user experience (they don't need to log in constantly).
 */

const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const { body, validationResult } = require('express-validator');
const db = require('../config/database');
const { AppError, asyncHandler } = require('../middleware/errorHandler');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

// ===========================================
// VALIDATION RULES
// ===========================================

// These rules define what constitutes valid input for each field.
// express-validator will check these and create an array of errors if any fail.

const registerValidation = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address'),
  body('password')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Password must contain at least one uppercase letter, one lowercase letter, and one number'),
  body('firstName')
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage('First name is required and must be less than 50 characters'),
  body('lastName')
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage('Last name is required and must be less than 50 characters')
];

const loginValidation = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address'),
  body('password')
    .notEmpty()
    .withMessage('Password is required')
];

// ===========================================
// HELPER FUNCTIONS
// ===========================================

/**
 * Generate JWT tokens
 * 
 * Creates both an access token (for API requests) and a refresh token
 * (for getting new access tokens). The tokens contain the user's ID,
 * which we can use to look up their full information when needed.
 */
const generateTokens = (userId) => {
  // Access token - short lived, contains minimal user info
  const accessToken = jwt.sign(
    { userId, type: 'access' },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '15m' }
  );

  // Refresh token - longer lived, only used to get new access tokens
  const refreshToken = jwt.sign(
    { userId, type: 'refresh', tokenId: uuidv4() },
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d' }
  );

  return { accessToken, refreshToken };
};

/**
 * Store refresh token in database
 * 
 * We store refresh tokens so we can invalidate them if needed
 * (e.g., when user logs out or changes password).
 */
const storeRefreshToken = async (userId, token, userAgent, ipAddress) => {
  // Decode the token to get the token ID and expiration
  const decoded = jwt.decode(token);
  const expiresAt = new Date(decoded.exp * 1000); // Convert from Unix timestamp

  await db.query(
    `INSERT INTO refresh_tokens (id, user_id, token_hash, expires_at, user_agent, ip_address)
     VALUES ($1, $2, $3, $4, $5, $6)`,
    [decoded.tokenId, userId, hashToken(token), expiresAt, userAgent, ipAddress]
  );
};

/**
 * Hash a token for storage
 * 
 * We don't store refresh tokens directly - instead we store a hash.
 * This way, if the database is compromised, attackers can't use the tokens.
 */
const hashToken = (token) => {
  const crypto = require('crypto');
  return crypto.createHash('sha256').update(token).digest('hex');
};

// ===========================================
// ROUTES
// ===========================================

/**
 * POST /api/auth/register
 * 
 * Register a new user account. This creates the user in the database
 * and returns tokens so they're immediately logged in.
 */
router.post('/register', registerValidation, asyncHandler(async (req, res) => {
  // Check for validation errors
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      error: 'Validation Error',
      details: errors.array()
    });
  }

  const { email, password, firstName, lastName } = req.body;

  // Check if user already exists
  const existingUser = await db.query(
    'SELECT id FROM users WHERE email = $1',
    [email]
  );

  if (existingUser.rows.length > 0) {
    throw new AppError('An account with this email already exists', 409);
  }

  // Hash the password before storing
  // The higher the salt rounds (12), the more secure but slower
  const passwordHash = await bcrypt.hash(password, 12);

  // Create the user
  const result = await db.query(
    `INSERT INTO users (email, password_hash, first_name, last_name, role)
     VALUES ($1, $2, $3, $4, 'customer')
     RETURNING id, email, first_name, last_name, role, created_at`,
    [email, passwordHash, firstName, lastName]
  );

  const user = result.rows[0];

  // Generate tokens
  const { accessToken, refreshToken } = generateTokens(user.id);

  // Store refresh token
  await storeRefreshToken(
    user.id,
    refreshToken,
    req.headers['user-agent'],
    req.ip
  );

  // Return user info and tokens
  res.status(201).json({
    message: 'Account created successfully',
    user: {
      id: user.id,
      email: user.email,
      firstName: user.first_name,
      lastName: user.last_name,
      role: user.role
    },
    tokens: {
      accessToken,
      refreshToken,
      expiresIn: process.env.JWT_EXPIRES_IN || '15m'
    }
  });
}));

/**
 * POST /api/auth/login
 * 
 * Authenticate a user with email and password. Returns access and refresh tokens.
 */
router.post('/login', loginValidation, asyncHandler(async (req, res) => {
  // Check for validation errors
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      error: 'Validation Error',
      details: errors.array()
    });
  }

  const { email, password } = req.body;

  // Find the user by email
  const result = await db.query(
    `SELECT id, email, password_hash, first_name, last_name, role, is_active
     FROM users 
     WHERE email = $1`,
    [email]
  );

  // Use generic error message to prevent email enumeration attacks
  if (result.rows.length === 0) {
    throw new AppError('Invalid email or password', 401);
  }

  const user = result.rows[0];

  // Check if account is active
  if (!user.is_active) {
    throw new AppError('Your account has been deactivated. Please contact support.', 401);
  }

  // Verify password
  const isPasswordValid = await bcrypt.compare(password, user.password_hash);
  if (!isPasswordValid) {
    throw new AppError('Invalid email or password', 401);
  }

  // Update last login timestamp
  await db.query(
    'UPDATE users SET last_login = NOW() WHERE id = $1',
    [user.id]
  );

  // Generate tokens
  const { accessToken, refreshToken } = generateTokens(user.id);

  // Store refresh token
  await storeRefreshToken(
    user.id,
    refreshToken,
    req.headers['user-agent'],
    req.ip
  );

  res.json({
    message: 'Login successful',
    user: {
      id: user.id,
      email: user.email,
      firstName: user.first_name,
      lastName: user.last_name,
      role: user.role
    },
    tokens: {
      accessToken,
      refreshToken,
      expiresIn: process.env.JWT_EXPIRES_IN || '15m'
    }
  });
}));

/**
 * POST /api/auth/refresh
 * 
 * Get a new access token using a refresh token.
 * This is called when the access token expires but the user still has a valid session.
 */
router.post('/refresh', asyncHandler(async (req, res) => {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    throw new AppError('Refresh token is required', 400);
  }

  // Verify the refresh token
  let decoded;
  try {
    decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
  } catch (error) {
    throw new AppError('Invalid or expired refresh token', 401);
  }

  // Check if the token exists in the database and hasn't been revoked
  const tokenHash = hashToken(refreshToken);
  const tokenResult = await db.query(
    `SELECT id, user_id, revoked_at 
     FROM refresh_tokens 
     WHERE token_hash = $1 AND expires_at > NOW()`,
    [tokenHash]
  );

  if (tokenResult.rows.length === 0) {
    throw new AppError('Invalid refresh token', 401);
  }

  const storedToken = tokenResult.rows[0];

  if (storedToken.revoked_at) {
    // Token was revoked - this could be a token theft attempt
    // Revoke all tokens for this user as a security measure
    await db.query(
      'UPDATE refresh_tokens SET revoked_at = NOW() WHERE user_id = $1',
      [storedToken.user_id]
    );
    throw new AppError('Token has been revoked. Please log in again.', 401);
  }

  // Get user info
  const userResult = await db.query(
    `SELECT id, email, first_name, last_name, role, is_active
     FROM users 
     WHERE id = $1`,
    [storedToken.user_id]
  );

  if (userResult.rows.length === 0 || !userResult.rows[0].is_active) {
    throw new AppError('User account is no longer active', 401);
  }

  const user = userResult.rows[0];

  // Generate new tokens (token rotation for security)
  const newTokens = generateTokens(user.id);

  // Revoke the old refresh token
  await db.query(
    'UPDATE refresh_tokens SET revoked_at = NOW() WHERE id = $1',
    [storedToken.id]
  );

  // Store the new refresh token
  await storeRefreshToken(
    user.id,
    newTokens.refreshToken,
    req.headers['user-agent'],
    req.ip
  );

  res.json({
    tokens: {
      accessToken: newTokens.accessToken,
      refreshToken: newTokens.refreshToken,
      expiresIn: process.env.JWT_EXPIRES_IN || '15m'
    }
  });
}));

/**
 * POST /api/auth/logout
 * 
 * Log out by revoking the refresh token.
 * The access token will naturally expire; we just prevent getting new ones.
 */
router.post('/logout', asyncHandler(async (req, res) => {
  const { refreshToken } = req.body;

  if (refreshToken) {
    const tokenHash = hashToken(refreshToken);
    await db.query(
      'UPDATE refresh_tokens SET revoked_at = NOW() WHERE token_hash = $1',
      [tokenHash]
    );
  }

  res.json({ message: 'Logged out successfully' });
}));

/**
 * GET /api/auth/me
 * 
 * Get the currently authenticated user's information.
 * Useful for checking if a stored token is still valid.
 */
router.get('/me', authenticate, asyncHandler(async (req, res) => {
  const result = await db.query(
    `SELECT id, email, first_name, last_name, role, created_at, last_login
     FROM users 
     WHERE id = $1`,
    [req.user.id]
  );

  const user = result.rows[0];

  res.json({
    user: {
      id: user.id,
      email: user.email,
      firstName: user.first_name,
      lastName: user.last_name,
      role: user.role,
      createdAt: user.created_at,
      lastLogin: user.last_login
    }
  });
}));

/**
 * POST /api/auth/forgot-password
 * 
 * Initiate password reset by sending an email with a reset link.
 */
router.post('/forgot-password', 
  body('email').isEmail().normalizeEmail(),
  asyncHandler(async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Validation Error',
        details: errors.array()
      });
    }

    const { email } = req.body;

    // Always return success to prevent email enumeration
    // Even if the email doesn't exist, we say we sent an email
    
    const result = await db.query(
      'SELECT id, email, first_name FROM users WHERE email = $1',
      [email]
    );

    if (result.rows.length > 0) {
      const user = result.rows[0];
      
      // Generate reset token
      const resetToken = uuidv4();
      const resetTokenHash = hashToken(resetToken);
      const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

      // Store reset token
      await db.query(
        `INSERT INTO password_resets (user_id, token_hash, expires_at)
         VALUES ($1, $2, $3)`,
        [user.id, resetTokenHash, expiresAt]
      );

      // TODO: Send email with reset link
      // The reset link would be: ${CLIENT_URL}/reset-password?token=${resetToken}
      console.log(`Password reset token for ${email}: ${resetToken}`);
    }

    res.json({
      message: 'If an account with that email exists, we sent a password reset link.'
    });
  })
);

/**
 * POST /api/auth/reset-password
 * 
 * Reset password using a token from the forgot-password email.
 */
router.post('/reset-password',
  [
    body('token').notEmpty().withMessage('Reset token is required'),
    body('password')
      .isLength({ min: 8 })
      .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
      .withMessage('Password must be at least 8 characters with uppercase, lowercase, and number')
  ],
  asyncHandler(async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Validation Error',
        details: errors.array()
      });
    }

    const { token, password } = req.body;
    const tokenHash = hashToken(token);

    // Find valid reset token
    const tokenResult = await db.query(
      `SELECT user_id FROM password_resets 
       WHERE token_hash = $1 AND expires_at > NOW() AND used_at IS NULL`,
      [tokenHash]
    );

    if (tokenResult.rows.length === 0) {
      throw new AppError('Invalid or expired reset token', 400);
    }

    const userId = tokenResult.rows[0].user_id;

    // Hash new password and update
    const passwordHash = await bcrypt.hash(password, 12);
    
    await db.query(
      'UPDATE users SET password_hash = $1 WHERE id = $2',
      [passwordHash, userId]
    );

    // Mark token as used
    await db.query(
      'UPDATE password_resets SET used_at = NOW() WHERE token_hash = $1',
      [tokenHash]
    );

    // Revoke all refresh tokens for this user (force re-login everywhere)
    await db.query(
      'UPDATE refresh_tokens SET revoked_at = NOW() WHERE user_id = $1',
      [userId]
    );

    res.json({ message: 'Password reset successful. Please log in with your new password.' });
  })
);

module.exports = router;

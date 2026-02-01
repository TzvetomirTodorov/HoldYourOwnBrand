/**
 * User Routes
 * 
 * Handles user profile and account management.
 */

const express = require('express');
const db = require('../config/database');
const { AppError, asyncHandler } = require('../middleware/errorHandler');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

// GET /api/users/profile - Get current user's profile
router.get('/profile', authenticate, asyncHandler(async (req, res) => {
  const result = await db.query(`
    SELECT id, email, first_name, last_name, phone, created_at
    FROM users WHERE id = $1
  `, [req.user.id]);

  const user = result.rows[0];
  res.json({
    user: {
      id: user.id,
      email: user.email,
      firstName: user.first_name,
      lastName: user.last_name,
      phone: user.phone,
      createdAt: user.created_at
    }
  });
}));

// PATCH /api/users/profile - Update profile
router.patch('/profile', authenticate, asyncHandler(async (req, res) => {
  const { firstName, lastName, phone } = req.body;
  
  await db.query(`
    UPDATE users 
    SET first_name = COALESCE($1, first_name),
        last_name = COALESCE($2, last_name),
        phone = COALESCE($3, phone)
    WHERE id = $4
  `, [firstName, lastName, phone, req.user.id]);

  res.json({ message: 'Profile updated' });
}));

// GET /api/users/addresses - Get saved addresses
router.get('/addresses', authenticate, asyncHandler(async (req, res) => {
  const result = await db.query(
    'SELECT * FROM addresses WHERE user_id = $1 ORDER BY is_default DESC, created_at DESC',
    [req.user.id]
  );
  res.json({ addresses: result.rows });
}));

// GET /api/users/wishlist - Get user's wishlist
router.get('/wishlist', authenticate, asyncHandler(async (req, res) => {
  const result = await db.query(`
    SELECT p.id, p.name, p.slug, p.price,
           (SELECT url FROM product_images WHERE product_id = p.id ORDER BY sort_order LIMIT 1) as image_url
    FROM wishlists w
    JOIN products p ON w.product_id = p.id
    WHERE w.user_id = $1
    ORDER BY w.created_at DESC
  `, [req.user.id]);

  res.json({ products: result.rows });
}));

// POST /api/users/wishlist/:productId - Add to wishlist
router.post('/wishlist/:productId', authenticate, asyncHandler(async (req, res) => {
  const { productId } = req.params;
  
  await db.query(
    'INSERT INTO wishlists (user_id, product_id) VALUES ($1, $2) ON CONFLICT DO NOTHING',
    [req.user.id, productId]
  );

  res.status(201).json({ message: 'Added to wishlist' });
}));

// DELETE /api/users/wishlist/:productId - Remove from wishlist
router.delete('/wishlist/:productId', authenticate, asyncHandler(async (req, res) => {
  await db.query(
    'DELETE FROM wishlists WHERE user_id = $1 AND product_id = $2',
    [req.user.id, req.params.productId]
  );
  res.json({ message: 'Removed from wishlist' });
}));

module.exports = router;

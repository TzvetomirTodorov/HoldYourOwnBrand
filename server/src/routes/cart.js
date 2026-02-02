/**
 * Cart Routes - Updated for CORS Compatibility
 *
 * CHANGES:
 * 1. Accepts sessionId from request body OR query params (no custom headers)
 * 2. Works for both guests (session-based) and logged-in users (JWT auth)
 * 3. Proper error handling and response structure
 * 
 * This fixes the CORS preflight failures caused by custom X-Cart-Session-Id headers.
 */

const express = require('express');
const { v4: uuidv4 } = require('uuid');
const db = require('../config/database');
const { AppError, asyncHandler } = require('../middleware/errorHandler');
const { optionalAuth } = require('../middleware/auth');

const router = express.Router();

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Get sessionId from request (body, query, or cookies)
 * Priority: body > query > cookie
 */
function getSessionId(req) {
  return req.body?.sessionId || 
         req.query?.sessionId || 
         req.cookies?.hyow_cart_session ||
         null;
}

/**
 * Get or create a cart for the current user/session
 */
async function getOrCreateCart(userId, sessionId) {
  let result;

  if (userId) {
    // For logged-in users, look up by user ID
    result = await db.query(
      'SELECT id FROM carts WHERE user_id = $1',
      [userId]
    );
  } else if (sessionId) {
    // For guests, look up by session ID
    result = await db.query(
      'SELECT id FROM carts WHERE session_id = $1',
      [sessionId]
    );
  }

  if (result && result.rows.length > 0) {
    return result.rows[0].id;
  }

  // No cart found, create a new one
  const newCartResult = await db.query(
    `INSERT INTO carts (user_id, session_id)
     VALUES ($1, $2)
     RETURNING id`,
    [userId || null, sessionId || null]
  );

  return newCartResult.rows[0].id;
}

/**
 * Get cart items with product/variant details
 */
async function getCartItems(cartId) {
  const result = await db.query(`
    SELECT 
      ci.id,
      ci.quantity,
      ci.created_at,
      pv.id as variant_id,
      pv.size,
      pv.color,
      pv.sku,
      pv.quantity as stock_quantity,
      p.id as product_id,
      p.name as product_name,
      p.slug as product_slug,
      p.price as base_price,
      COALESCE(pv.price_adjustment, 0) as price_adjustment,
      (p.price + COALESCE(pv.price_adjustment, 0)) as price,
      (SELECT pi.url FROM product_images pi WHERE pi.product_id = p.id ORDER BY pi.sort_order LIMIT 1) as image_url
    FROM cart_items ci
    JOIN product_variants pv ON ci.variant_id = pv.id
    JOIN products p ON pv.product_id = p.id
    WHERE ci.cart_id = $1
    ORDER BY ci.created_at DESC
  `, [cartId]);

  return result.rows.map(row => ({
    id: row.id,
    quantity: row.quantity,
    price: parseFloat(row.price),
    variant: {
      id: row.variant_id,
      size: row.size,
      color: row.color,
      sku: row.sku,
      inStock: row.stock_quantity > 0,
    },
    product: {
      id: row.product_id,
      name: row.product_name,
      slug: row.product_slug,
      imageUrl: row.image_url,
    },
  }));
}

/**
 * Calculate cart totals
 */
function calculateCartTotals(items) {
  const subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);
  
  return {
    subtotal: Math.round(subtotal * 100) / 100,
    itemCount,
    // Tax and shipping calculated at checkout
  };
}

// ============================================================================
// ROUTES
// ============================================================================

/**
 * GET /api/cart
 * Get the current cart with all items
 */
router.get('/', optionalAuth, asyncHandler(async (req, res) => {
  const userId = req.user?.id || null;
  const sessionId = getSessionId(req);

  // Must have either userId or sessionId
  if (!userId && !sessionId) {
    return res.json({
      items: [],
      subtotal: 0,
      itemCount: 0,
    });
  }

  const cartId = await getOrCreateCart(userId, sessionId);
  const items = await getCartItems(cartId);
  const totals = calculateCartTotals(items);

  res.json({
    items,
    ...totals,
  });
}));

/**
 * POST /api/cart/items
 * Add an item to the cart
 */
router.post('/items', optionalAuth, asyncHandler(async (req, res) => {
  const userId = req.user?.id || null;
  const sessionId = getSessionId(req);
  const { variantId, quantity = 1 } = req.body;

  // Validation
  if (!variantId) {
    throw new AppError('Variant ID is required', 400);
  }

  if (!userId && !sessionId) {
    throw new AppError('Session ID is required for guest checkout', 400);
  }

  if (quantity < 1 || quantity > 99) {
    throw new AppError('Quantity must be between 1 and 99', 400);
  }

  // Check if variant exists and has stock
  const variantCheck = await db.query(`
    SELECT pv.id, pv.quantity as stock, p.name as product_name
    FROM product_variants pv
    JOIN products p ON pv.product_id = p.id
    WHERE pv.id = $1 AND pv.is_active = true AND p.is_active = true
  `, [variantId]);

  if (variantCheck.rows.length === 0) {
    throw new AppError('Product variant not found or unavailable', 404);
  }

  const variant = variantCheck.rows[0];
  
  if (variant.stock < quantity) {
    throw new AppError(`Only ${variant.stock} items available`, 400);
  }

  // Get or create cart
  const cartId = await getOrCreateCart(userId, sessionId);

  // Check if item already in cart
  const existingItem = await db.query(
    'SELECT id, quantity FROM cart_items WHERE cart_id = $1 AND variant_id = $2',
    [cartId, variantId]
  );

  if (existingItem.rows.length > 0) {
    // Update existing item quantity
    const newQuantity = existingItem.rows[0].quantity + quantity;
    
    if (newQuantity > variant.stock) {
      throw new AppError(`Only ${variant.stock} items available`, 400);
    }

    await db.query(
      'UPDATE cart_items SET quantity = $1, updated_at = NOW() WHERE id = $2',
      [newQuantity, existingItem.rows[0].id]
    );
  } else {
    // Add new item
    await db.query(
      'INSERT INTO cart_items (cart_id, variant_id, quantity) VALUES ($1, $2, $3)',
      [cartId, variantId, quantity]
    );
  }

  // Update cart timestamp
  await db.query('UPDATE carts SET updated_at = NOW() WHERE id = $1', [cartId]);

  // Return updated cart
  const items = await getCartItems(cartId);
  const totals = calculateCartTotals(items);

  res.status(201).json({
    message: 'Item added to cart',
    items,
    ...totals,
  });
}));

/**
 * PATCH /api/cart/items/:itemId
 * Update item quantity
 */
router.patch('/items/:itemId', optionalAuth, asyncHandler(async (req, res) => {
  const userId = req.user?.id || null;
  const sessionId = getSessionId(req);
  const { itemId } = req.params;
  const { quantity } = req.body;

  if (!userId && !sessionId) {
    throw new AppError('Session ID is required', 400);
  }

  if (quantity === undefined || quantity < 0 || quantity > 99) {
    throw new AppError('Quantity must be between 0 and 99', 400);
  }

  // Get cart
  const cartId = await getOrCreateCart(userId, sessionId);

  // Verify item belongs to this cart
  const itemCheck = await db.query(`
    SELECT ci.id, ci.variant_id, pv.quantity as stock
    FROM cart_items ci
    JOIN product_variants pv ON ci.variant_id = pv.id
    WHERE ci.id = $1 AND ci.cart_id = $2
  `, [itemId, cartId]);

  if (itemCheck.rows.length === 0) {
    throw new AppError('Cart item not found', 404);
  }

  const item = itemCheck.rows[0];

  if (quantity === 0) {
    // Remove item
    await db.query('DELETE FROM cart_items WHERE id = $1', [itemId]);
  } else {
    // Check stock
    if (quantity > item.stock) {
      throw new AppError(`Only ${item.stock} items available`, 400);
    }

    // Update quantity
    await db.query(
      'UPDATE cart_items SET quantity = $1, updated_at = NOW() WHERE id = $2',
      [quantity, itemId]
    );
  }

  // Update cart timestamp
  await db.query('UPDATE carts SET updated_at = NOW() WHERE id = $1', [cartId]);

  // Return updated cart
  const items = await getCartItems(cartId);
  const totals = calculateCartTotals(items);

  res.json({
    message: quantity === 0 ? 'Item removed from cart' : 'Quantity updated',
    items,
    ...totals,
  });
}));

/**
 * DELETE /api/cart/items/:itemId
 * Remove an item from the cart
 */
router.delete('/items/:itemId', optionalAuth, asyncHandler(async (req, res) => {
  const userId = req.user?.id || null;
  const sessionId = getSessionId(req);
  const { itemId } = req.params;

  if (!userId && !sessionId) {
    throw new AppError('Session ID is required', 400);
  }

  // Get cart
  const cartId = await getOrCreateCart(userId, sessionId);

  // Verify and delete
  const deleteResult = await db.query(
    'DELETE FROM cart_items WHERE id = $1 AND cart_id = $2 RETURNING id',
    [itemId, cartId]
  );

  if (deleteResult.rows.length === 0) {
    throw new AppError('Cart item not found', 404);
  }

  // Update cart timestamp
  await db.query('UPDATE carts SET updated_at = NOW() WHERE id = $1', [cartId]);

  // Return updated cart
  const items = await getCartItems(cartId);
  const totals = calculateCartTotals(items);

  res.json({
    message: 'Item removed from cart',
    items,
    ...totals,
  });
}));

/**
 * DELETE /api/cart
 * Clear the entire cart
 */
router.delete('/', optionalAuth, asyncHandler(async (req, res) => {
  const userId = req.user?.id || null;
  const sessionId = getSessionId(req);

  if (!userId && !sessionId) {
    return res.json({
      message: 'Cart cleared',
      items: [],
      subtotal: 0,
      itemCount: 0,
    });
  }

  // Get cart
  const cartId = await getOrCreateCart(userId, sessionId);

  // Delete all items
  await db.query('DELETE FROM cart_items WHERE cart_id = $1', [cartId]);

  // Update cart timestamp
  await db.query('UPDATE carts SET updated_at = NOW() WHERE id = $1', [cartId]);

  res.json({
    message: 'Cart cleared',
    items: [],
    subtotal: 0,
    itemCount: 0,
  });
}));

/**
 * POST /api/cart/merge
 * Merge guest cart with user cart (called after login)
 */
router.post('/merge', optionalAuth, asyncHandler(async (req, res) => {
  const userId = req.user?.id;
  const { sessionId } = req.body;

  if (!userId) {
    throw new AppError('Must be logged in to merge carts', 401);
  }

  if (!sessionId) {
    return res.json({ message: 'No guest cart to merge' });
  }

  // Get guest cart
  const guestCartResult = await db.query(
    'SELECT id FROM carts WHERE session_id = $1',
    [sessionId]
  );

  if (guestCartResult.rows.length === 0) {
    return res.json({ message: 'No guest cart to merge' });
  }

  const guestCartId = guestCartResult.rows[0].id;

  // Get or create user cart
  const userCartId = await getOrCreateCart(userId, null);

  // If same cart, nothing to do
  if (guestCartId === userCartId) {
    return res.json({ message: 'Cart already linked to user' });
  }

  // Merge items from guest cart to user cart
  const guestItems = await db.query(
    'SELECT variant_id, quantity FROM cart_items WHERE cart_id = $1',
    [guestCartId]
  );

  for (const item of guestItems.rows) {
    // Check if item exists in user cart
    const existing = await db.query(
      'SELECT id, quantity FROM cart_items WHERE cart_id = $1 AND variant_id = $2',
      [userCartId, item.variant_id]
    );

    if (existing.rows.length > 0) {
      // Add quantities
      await db.query(
        'UPDATE cart_items SET quantity = quantity + $1 WHERE id = $2',
        [item.quantity, existing.rows[0].id]
      );
    } else {
      // Move item to user cart
      await db.query(
        'INSERT INTO cart_items (cart_id, variant_id, quantity) VALUES ($1, $2, $3)',
        [userCartId, item.variant_id, item.quantity]
      );
    }
  }

  // Delete guest cart
  await db.query('DELETE FROM cart_items WHERE cart_id = $1', [guestCartId]);
  await db.query('DELETE FROM carts WHERE id = $1', [guestCartId]);

  // Return merged cart
  const items = await getCartItems(userCartId);
  const totals = calculateCartTotals(items);

  res.json({
    message: 'Carts merged successfully',
    items,
    ...totals,
  });
}));

module.exports = router;

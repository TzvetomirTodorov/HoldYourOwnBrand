/**
 * Cart Routes
 * 
 * Handles shopping cart operations including:
 * - Getting the current cart
 * - Adding items to cart
 * - Updating quantities
 * - Removing items
 * - Applying discount codes
 * 
 * The cart system works for both guests (using session ID) and logged-in users.
 * When a guest logs in, their cart is automatically merged with any existing cart.
 */

const express = require('express');
const { v4: uuidv4 } = require('uuid');
const db = require('../config/database');
const { AppError, asyncHandler } = require('../middleware/errorHandler');
const { optionalAuth, authenticate } = require('../middleware/auth');

const router = express.Router();

/**
 * Helper: Get or create a cart for the current user/session
 */
async function getOrCreateCart(userId, sessionId) {
  // First, try to find an existing cart
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
 * Helper: Get cart contents with full product details
 */
async function getCartContents(cartId) {
  const result = await db.query(`
    SELECT 
      ci.id as item_id,
      ci.quantity,
      v.id as variant_id,
      v.sku,
      v.size,
      v.color,
      v.quantity as stock_quantity,
      v.price_adjustment,
      p.id as product_id,
      p.name as product_name,
      p.slug as product_slug,
      p.price as base_price,
      (
        SELECT url FROM product_images 
        WHERE product_id = p.id 
        ORDER BY sort_order 
        LIMIT 1
      ) as image_url
    FROM cart_items ci
    JOIN product_variants v ON ci.variant_id = v.id
    JOIN products p ON v.product_id = p.id
    WHERE ci.cart_id = $1
    ORDER BY ci.created_at DESC
  `, [cartId]);

  return result.rows;
}

/**
 * GET /api/cart
 * 
 * Get the current cart contents.
 * Uses either user ID (if logged in) or session ID (from header).
 */
router.get('/', optionalAuth, asyncHandler(async (req, res) => {
  const userId = req.user?.id;
  const sessionId = req.headers['x-session-id'];

  if (!userId && !sessionId) {
    // No way to identify the cart - return empty
    return res.json({
      cart: {
        items: [],
        subtotal: 0,
        itemCount: 0
      }
    });
  }

  // Get or create cart
  const cartId = await getOrCreateCart(userId, sessionId);
  
  // Get cart contents
  const items = await getCartContents(cartId);

  // Calculate totals
  let subtotal = 0;
  let itemCount = 0;

  const cartItems = items.map(item => {
    const unitPrice = parseFloat(item.base_price) + parseFloat(item.price_adjustment || 0);
    const lineTotal = unitPrice * item.quantity;
    subtotal += lineTotal;
    itemCount += item.quantity;

    return {
      id: item.item_id,
      variantId: item.variant_id,
      product: {
        id: item.product_id,
        name: item.product_name,
        slug: item.product_slug,
        imageUrl: item.image_url
      },
      variant: {
        sku: item.sku,
        size: item.size,
        color: item.color
      },
      quantity: item.quantity,
      unitPrice,
      lineTotal,
      inStock: item.stock_quantity >= item.quantity,
      maxQuantity: item.stock_quantity
    };
  });

  // Get discount code if applied
  const cartResult = await db.query(
    `SELECT dc.code, dc.discount_type, dc.discount_value
     FROM carts c
     JOIN discount_codes dc ON c.discount_code_id = dc.id
     WHERE c.id = $1`,
    [cartId]
  );

  let discount = null;
  let discountAmount = 0;

  if (cartResult.rows.length > 0) {
    const dc = cartResult.rows[0];
    discount = {
      code: dc.code,
      type: dc.discount_type,
      value: parseFloat(dc.discount_value)
    };

    // Calculate discount amount
    if (dc.discount_type === 'percentage') {
      discountAmount = subtotal * (parseFloat(dc.discount_value) / 100);
    } else if (dc.discount_type === 'fixed_amount') {
      discountAmount = Math.min(parseFloat(dc.discount_value), subtotal);
    }
  }

  res.json({
    cart: {
      items: cartItems,
      subtotal,
      discount,
      discountAmount,
      total: subtotal - discountAmount,
      itemCount
    }
  });
}));

/**
 * POST /api/cart/items
 * 
 * Add an item to the cart.
 */
router.post('/items', optionalAuth, asyncHandler(async (req, res) => {
  const { variantId, quantity = 1 } = req.body;
  const userId = req.user?.id;
  let sessionId = req.headers['x-session-id'];

  // Generate session ID for guests if not provided
  if (!userId && !sessionId) {
    sessionId = uuidv4();
  }

  // Validate variant exists and has stock
  const variantResult = await db.query(
    `SELECT v.*, p.name as product_name 
     FROM product_variants v
     JOIN products p ON v.product_id = p.id
     WHERE v.id = $1 AND v.is_active = true AND p.status = 'active'`,
    [variantId]
  );

  if (variantResult.rows.length === 0) {
    throw new AppError('Product variant not found', 404);
  }

  const variant = variantResult.rows[0];

  if (variant.quantity < quantity) {
    throw new AppError(`Only ${variant.quantity} items available in stock`, 400);
  }

  // Get or create cart
  const cartId = await getOrCreateCart(userId, sessionId);

  // Check if item already in cart
  const existingItem = await db.query(
    'SELECT id, quantity FROM cart_items WHERE cart_id = $1 AND variant_id = $2',
    [cartId, variantId]
  );

  if (existingItem.rows.length > 0) {
    // Update quantity
    const newQuantity = existingItem.rows[0].quantity + quantity;
    
    if (newQuantity > variant.quantity) {
      throw new AppError(`Cannot add more. Only ${variant.quantity} items available.`, 400);
    }

    await db.query(
      'UPDATE cart_items SET quantity = $1 WHERE id = $2',
      [newQuantity, existingItem.rows[0].id]
    );
  } else {
    // Add new item
    await db.query(
      'INSERT INTO cart_items (cart_id, variant_id, quantity) VALUES ($1, $2, $3)',
      [cartId, variantId, quantity]
    );
  }

  // Return updated cart
  const items = await getCartContents(cartId);
  
  res.status(201).json({
    message: 'Item added to cart',
    sessionId: userId ? undefined : sessionId, // Return session ID for guests
    itemCount: items.reduce((sum, item) => sum + item.quantity, 0)
  });
}));

/**
 * PATCH /api/cart/items/:itemId
 * 
 * Update the quantity of a cart item.
 */
router.patch('/items/:itemId', optionalAuth, asyncHandler(async (req, res) => {
  const { itemId } = req.params;
  const { quantity } = req.body;
  const userId = req.user?.id;
  const sessionId = req.headers['x-session-id'];

  if (!quantity || quantity < 1) {
    throw new AppError('Quantity must be at least 1', 400);
  }

  // Verify the item belongs to this user's cart
  const itemResult = await db.query(`
    SELECT ci.*, c.user_id, c.session_id, v.quantity as stock_quantity
    FROM cart_items ci
    JOIN carts c ON ci.cart_id = c.id
    JOIN product_variants v ON ci.variant_id = v.id
    WHERE ci.id = $1
  `, [itemId]);

  if (itemResult.rows.length === 0) {
    throw new AppError('Cart item not found', 404);
  }

  const item = itemResult.rows[0];

  // Verify ownership
  if (userId && item.user_id !== userId) {
    throw new AppError('Cart item not found', 404);
  }
  if (!userId && item.session_id !== sessionId) {
    throw new AppError('Cart item not found', 404);
  }

  // Check stock
  if (quantity > item.stock_quantity) {
    throw new AppError(`Only ${item.stock_quantity} items available`, 400);
  }

  // Update quantity
  await db.query(
    'UPDATE cart_items SET quantity = $1 WHERE id = $2',
    [quantity, itemId]
  );

  res.json({ message: 'Cart updated' });
}));

/**
 * DELETE /api/cart/items/:itemId
 * 
 * Remove an item from the cart.
 */
router.delete('/items/:itemId', optionalAuth, asyncHandler(async (req, res) => {
  const { itemId } = req.params;
  const userId = req.user?.id;
  const sessionId = req.headers['x-session-id'];

  // Verify the item belongs to this user's cart
  const itemResult = await db.query(`
    SELECT ci.*, c.user_id, c.session_id
    FROM cart_items ci
    JOIN carts c ON ci.cart_id = c.id
    WHERE ci.id = $1
  `, [itemId]);

  if (itemResult.rows.length === 0) {
    throw new AppError('Cart item not found', 404);
  }

  const item = itemResult.rows[0];

  // Verify ownership
  if (userId && item.user_id !== userId) {
    throw new AppError('Cart item not found', 404);
  }
  if (!userId && item.session_id !== sessionId) {
    throw new AppError('Cart item not found', 404);
  }

  // Delete the item
  await db.query('DELETE FROM cart_items WHERE id = $1', [itemId]);

  res.json({ message: 'Item removed from cart' });
}));

/**
 * POST /api/cart/discount
 * 
 * Apply a discount code to the cart.
 */
router.post('/discount', optionalAuth, asyncHandler(async (req, res) => {
  const { code } = req.body;
  const userId = req.user?.id;
  const sessionId = req.headers['x-session-id'];

  if (!code) {
    throw new AppError('Discount code is required', 400);
  }

  // Find the discount code
  const discountResult = await db.query(`
    SELECT * FROM discount_codes 
    WHERE code = $1 
      AND is_active = true
      AND (starts_at IS NULL OR starts_at <= NOW())
      AND (expires_at IS NULL OR expires_at > NOW())
      AND (max_uses IS NULL OR current_uses < max_uses)
  `, [code.toUpperCase()]);

  if (discountResult.rows.length === 0) {
    throw new AppError('Invalid or expired discount code', 400);
  }

  const discount = discountResult.rows[0];

  // Get cart
  const cartId = await getOrCreateCart(userId, sessionId);
  
  // Get cart total to check minimum purchase
  const items = await getCartContents(cartId);
  const subtotal = items.reduce((sum, item) => {
    return sum + (parseFloat(item.base_price) + parseFloat(item.price_adjustment || 0)) * item.quantity;
  }, 0);

  if (subtotal < parseFloat(discount.minimum_purchase)) {
    throw new AppError(
      `Minimum purchase of $${discount.minimum_purchase} required for this code`,
      400
    );
  }

  // Apply the discount to the cart
  await db.query(
    'UPDATE carts SET discount_code_id = $1 WHERE id = $2',
    [discount.id, cartId]
  );

  res.json({
    message: 'Discount applied',
    discount: {
      code: discount.code,
      type: discount.discount_type,
      value: parseFloat(discount.discount_value)
    }
  });
}));

/**
 * DELETE /api/cart/discount
 * 
 * Remove the discount code from the cart.
 */
router.delete('/discount', optionalAuth, asyncHandler(async (req, res) => {
  const userId = req.user?.id;
  const sessionId = req.headers['x-session-id'];

  const cartId = await getOrCreateCart(userId, sessionId);
  
  await db.query(
    'UPDATE carts SET discount_code_id = NULL WHERE id = $1',
    [cartId]
  );

  res.json({ message: 'Discount removed' });
}));

module.exports = router;

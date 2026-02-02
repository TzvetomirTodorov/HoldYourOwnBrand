/**
 * Cart Routes - Fixed Version v2
 * 
 * FIXES:
 * 1. Removed is_active column checks (may not exist in all schemas)
 * 2. More defensive column handling
 * 3. Better error messages for debugging
 * 4. Session ID properly handled
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
  try {
    let result;

    if (userId) {
      result = await db.query(
        'SELECT id FROM carts WHERE user_id = $1',
        [userId]
      );
    } else if (sessionId) {
      result = await db.query(
        'SELECT id FROM carts WHERE session_id = $1',
        [sessionId]
      );
    }

    if (result && result.rows.length > 0) {
      return result.rows[0].id;
    }

    // Create new cart
    const newCartResult = await db.query(
      `INSERT INTO carts (user_id, session_id)
       VALUES ($1, $2)
       RETURNING id`,
      [userId || null, sessionId || null]
    );

    return newCartResult.rows[0].id;
  } catch (error) {
    console.error('Error in getOrCreateCart:', error);
    throw error;
  }
}

/**
 * Get cart items with product/variant details
 */
async function getCartItems(cartId) {
  try {
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
        COALESCE(pv.price_adjustment, 0) as price_adjustment,
        p.id as product_id,
        p.name as product_name,
        p.slug as product_slug,
        p.price as base_price,
        (p.price + COALESCE(pv.price_adjustment, 0)) as price
      FROM cart_items ci
      JOIN product_variants pv ON ci.variant_id = pv.id
      JOIN products p ON pv.product_id = p.id
      WHERE ci.cart_id = $1
      ORDER BY ci.created_at DESC
    `, [cartId]);

    // Get images separately to handle potential column name differences
    const itemsWithImages = await Promise.all(result.rows.map(async (row) => {
      // Try to get product image
      let imageUrl = null;
      try {
        const imgResult = await db.query(
          `SELECT url FROM product_images WHERE product_id = $1 ORDER BY sort_order LIMIT 1`,
          [row.product_id]
        );
        if (imgResult.rows.length > 0) {
          imageUrl = imgResult.rows[0].url;
        }
      } catch (imgError) {
        // Image table might not exist or have different schema
        console.warn('Could not fetch product image:', imgError.message);
      }

      return {
        id: row.id,
        quantity: row.quantity,
        price: parseFloat(row.price),
        variant: {
          id: row.variant_id,
          size: row.size,
          color: row.color,
          sku: row.sku,
          inStock: parseInt(row.stock_quantity) > 0,
        },
        product: {
          id: row.product_id,
          name: row.product_name,
          slug: row.product_slug,
          imageUrl: imageUrl,
        },
      };
    }));

    return itemsWithImages;
  } catch (error) {
    console.error('Error in getCartItems:', error);
    throw error;
  }
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

  console.log('GET /api/cart - userId:', userId, 'sessionId:', sessionId);

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

  console.log('POST /api/cart/items - userId:', userId, 'sessionId:', sessionId, 'variantId:', variantId, 'quantity:', quantity);

  // Validation
  if (!variantId) {
    throw new AppError('Variant ID is required', 400);
  }

  if (!userId && !sessionId) {
    throw new AppError('Session ID is required for guest checkout', 400);
  }

  const qty = parseInt(quantity);
  if (isNaN(qty) || qty < 1 || qty > 99) {
    throw new AppError('Quantity must be between 1 and 99', 400);
  }

  // Check if variant exists and has stock (without is_active check)
  const variantCheck = await db.query(`
    SELECT pv.id, pv.quantity as stock, p.name as product_name
    FROM product_variants pv
    JOIN products p ON pv.product_id = p.id
    WHERE pv.id = $1
  `, [variantId]);

  if (variantCheck.rows.length === 0) {
    throw new AppError('Product variant not found', 404);
  }

  const variant = variantCheck.rows[0];
  const stock = parseInt(variant.stock);
  
  if (stock < qty) {
    throw new AppError(`Only ${stock} items available`, 400);
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
    const newQuantity = parseInt(existingItem.rows[0].quantity) + qty;
    
    if (newQuantity > stock) {
      throw new AppError(`Only ${stock} items available (you have ${existingItem.rows[0].quantity} in cart)`, 400);
    }

    await db.query(
      'UPDATE cart_items SET quantity = $1, updated_at = NOW() WHERE id = $2',
      [newQuantity, existingItem.rows[0].id]
    );
  } else {
    // Add new item
    await db.query(
      'INSERT INTO cart_items (cart_id, variant_id, quantity) VALUES ($1, $2, $3)',
      [cartId, variantId, qty]
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

  console.log('PATCH /api/cart/items - itemId:', itemId, 'quantity:', quantity);

  if (!userId && !sessionId) {
    throw new AppError('Authentication required', 401);
  }

  const qty = parseInt(quantity);
  if (isNaN(qty) || qty < 0 || qty > 99) {
    throw new AppError('Quantity must be between 0 and 99', 400);
  }

  // Get user's cart
  let cartResult;
  if (userId) {
    cartResult = await db.query('SELECT id FROM carts WHERE user_id = $1', [userId]);
  } else {
    cartResult = await db.query('SELECT id FROM carts WHERE session_id = $1', [sessionId]);
  }

  if (cartResult.rows.length === 0) {
    throw new AppError('Cart not found', 404);
  }

  const cartId = cartResult.rows[0].id;

  // Verify item belongs to this cart
  const itemCheck = await db.query(
    'SELECT id, variant_id FROM cart_items WHERE id = $1 AND cart_id = $2',
    [itemId, cartId]
  );

  if (itemCheck.rows.length === 0) {
    throw new AppError('Item not found in cart', 404);
  }

  if (qty === 0) {
    // Remove item
    await db.query('DELETE FROM cart_items WHERE id = $1', [itemId]);
  } else {
    // Check stock
    const stockCheck = await db.query(
      'SELECT quantity FROM product_variants WHERE id = $1',
      [itemCheck.rows[0].variant_id]
    );

    if (stockCheck.rows.length > 0 && qty > stockCheck.rows[0].quantity) {
      throw new AppError(`Only ${stockCheck.rows[0].quantity} items available`, 400);
    }

    // Update quantity
    await db.query(
      'UPDATE cart_items SET quantity = $1, updated_at = NOW() WHERE id = $2',
      [qty, itemId]
    );
  }

  // Update cart timestamp
  await db.query('UPDATE carts SET updated_at = NOW() WHERE id = $1', [cartId]);

  // Return updated cart
  const items = await getCartItems(cartId);
  const totals = calculateCartTotals(items);

  res.json({
    message: qty === 0 ? 'Item removed from cart' : 'Cart updated',
    items,
    ...totals,
  });
}));

/**
 * DELETE /api/cart/items/:itemId
 * Remove an item from cart
 */
router.delete('/items/:itemId', optionalAuth, asyncHandler(async (req, res) => {
  const userId = req.user?.id || null;
  const sessionId = getSessionId(req);
  const { itemId } = req.params;

  console.log('DELETE /api/cart/items - itemId:', itemId);

  if (!userId && !sessionId) {
    throw new AppError('Authentication required', 401);
  }

  // Get user's cart
  let cartResult;
  if (userId) {
    cartResult = await db.query('SELECT id FROM carts WHERE user_id = $1', [userId]);
  } else {
    cartResult = await db.query('SELECT id FROM carts WHERE session_id = $1', [sessionId]);
  }

  if (cartResult.rows.length === 0) {
    throw new AppError('Cart not found', 404);
  }

  const cartId = cartResult.rows[0].id;

  // Delete item (only if it belongs to this cart)
  const deleteResult = await db.query(
    'DELETE FROM cart_items WHERE id = $1 AND cart_id = $2 RETURNING id',
    [itemId, cartId]
  );

  if (deleteResult.rows.length === 0) {
    throw new AppError('Item not found in cart', 404);
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

  console.log('DELETE /api/cart - clearing cart');

  if (!userId && !sessionId) {
    throw new AppError('Authentication required', 401);
  }

  // Get user's cart
  let cartResult;
  if (userId) {
    cartResult = await db.query('SELECT id FROM carts WHERE user_id = $1', [userId]);
  } else {
    cartResult = await db.query('SELECT id FROM carts WHERE session_id = $1', [sessionId]);
  }

  if (cartResult.rows.length === 0) {
    return res.json({
      message: 'Cart is already empty',
      items: [],
      subtotal: 0,
      itemCount: 0,
    });
  }

  const cartId = cartResult.rows[0].id;

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
 * Merge guest cart into user cart after login
 */
router.post('/merge', optionalAuth, asyncHandler(async (req, res) => {
  const userId = req.user?.id;
  const { sessionId } = req.body;

  console.log('POST /api/cart/merge - userId:', userId, 'sessionId:', sessionId);

  if (!userId) {
    throw new AppError('Must be logged in to merge carts', 401);
  }

  if (!sessionId) {
    throw new AppError('Session ID is required', 400);
  }

  // Get guest cart
  const guestCartResult = await db.query(
    'SELECT id FROM carts WHERE session_id = $1',
    [sessionId]
  );

  if (guestCartResult.rows.length === 0) {
    // No guest cart to merge
    const userCartId = await getOrCreateCart(userId, null);
    const items = await getCartItems(userCartId);
    const totals = calculateCartTotals(items);

    return res.json({
      message: 'No guest cart to merge',
      items,
      ...totals,
    });
  }

  const guestCartId = guestCartResult.rows[0].id;

  // Get or create user cart
  const userCartId = await getOrCreateCart(userId, null);

  // Get guest cart items
  const guestItems = await db.query(
    'SELECT variant_id, quantity FROM cart_items WHERE cart_id = $1',
    [guestCartId]
  );

  // Merge items
  for (const item of guestItems.rows) {
    // Check if user already has this variant
    const existing = await db.query(
      'SELECT id, quantity FROM cart_items WHERE cart_id = $1 AND variant_id = $2',
      [userCartId, item.variant_id]
    );

    if (existing.rows.length > 0) {
      // Add quantities
      const newQty = parseInt(existing.rows[0].quantity) + parseInt(item.quantity);
      await db.query(
        'UPDATE cart_items SET quantity = $1, updated_at = NOW() WHERE id = $2',
        [newQty, existing.rows[0].id]
      );
    } else {
      // Move item to user cart
      await db.query(
        'INSERT INTO cart_items (cart_id, variant_id, quantity) VALUES ($1, $2, $3)',
        [userCartId, item.variant_id, item.quantity]
      );
    }
  }

  // Delete guest cart items and cart
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

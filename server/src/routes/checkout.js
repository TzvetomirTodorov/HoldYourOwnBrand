/**
 * Checkout Routes - FULLY AUDITED against database schema
 * 
 * Database Schema Reference:
 * 
 * orders table:
 *   - id (uuid, PK)
 *   - user_id (uuid, nullable)
 *   - session_id (varchar, nullable) 
 *   - order_number (varchar, NOT NULL)
 *   - status (varchar, NOT NULL)
 *   - payment_status (varchar, NOT NULL)
 *   - payment_method (varchar, nullable)
 *   - stripe_payment_intent_id (varchar, nullable)
 *   - subtotal (numeric, NOT NULL)
 *   - discount_amount (numeric, NOT NULL)
 *   - shipping_amount (numeric, NOT NULL)
 *   - tax_amount (numeric, NOT NULL)
 *   - total (numeric, NOT NULL)
 *   - discount_code (varchar, nullable)
 *   - shipping_address (jsonb, NOT NULL)
 *   - billing_address (jsonb, NOT NULL)
 *   - shipping_method (varchar, nullable)
 *   - email (varchar, NOT NULL)
 *   - phone (varchar, nullable)
 *   - customer_notes (text, nullable)
 *   - admin_notes (text, nullable)
 *   - created_at, updated_at, shipped_at, delivered_at
 * 
 * order_items table:
 *   - id, order_id, product_id, variant_id, product_name, variant_name,
 *   - sku, unit_price, quantity, total_price, image_url, created_at
 */

const express = require('express');
const Stripe = require('stripe');
const db = require('../config/database');
const { AppError, asyncHandler } = require('../middleware/errorHandler');
const { optionalAuth } = require('../middleware/auth');

const router = express.Router();

// Initialize Stripe
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

/**
 * POST /api/checkout/create-payment-intent
 * 
 * Creates a Stripe PaymentIntent for the current cart.
 */
router.post('/create-payment-intent', optionalAuth, asyncHandler(async (req, res) => {
  const { shippingAddress, billingAddress, email, phone } = req.body;
  const userId = req.user?.id;
  const sessionId = req.body.sessionId || req.query.sessionId;

  console.log('POST /checkout/create-payment-intent - userId:', userId, 'sessionId:', sessionId);
  if (!userId && !sessionId) {
    throw new AppError('User ID or session ID required', 400);
  }

  // Validate required fields for order creation
  if (!email) {
    throw new AppError('Email is required', 400);
  }

  // Get cart items - joining through product_variants to products
  // Price comes from products table (p.price)
  // Get cart items - joining through product_variants to products
  // Price comes from products table (p.price)
  // FIX: Check both userId AND sessionId to handle guest carts after login
  let cartResult;
  
  // Build the WHERE clause to check both user_id and session_id
  const cartQuery = `
    SELECT
      ci.id,
      ci.quantity,
      pv.id as variant_id,
      pv.size,
      pv.color,
      pv.sku,
      pv.quantity as stock_quantity,
      p.id as product_id,
      p.name as product_name,
      p.price,
      p.slug,
      p.image_url
    FROM cart_items ci
    JOIN carts c ON ci.cart_id = c.id
    JOIN product_variants pv ON ci.variant_id = pv.id
    JOIN products p ON pv.product_id = p.id
    WHERE (c.user_id = $1 OR c.session_id = $2)
  `;
  
  cartResult = await db.query(cartQuery, [userId || null, sessionId || null]);

  if (cartResult.rows.length === 0) {
    throw new AppError('Cart is empty', 400);
  }
    // Build variant name from size/color
    const variantParts = [];
    if (item.size) variantParts.push(item.size);
    if (item.color) variantParts.push(item.color);
    const variantName = variantParts.length > 0 ? variantParts.join(' / ') : null;

    items.push({
      variantId: item.variant_id,
      productId: item.product_id,
      productName: item.product_name,
      variantName: variantName,
      sku: item.sku || null,
      imageUrl: item.image_url || null,
      quantity: item.quantity,
      unitPrice,
      totalPrice: lineTotal
    });
  }

  // Calculate shipping (free over $200, otherwise $15)
  const shippingAmount = subtotal >= 200 ? 0 : 15;
  
  // Calculate tax (approximate 8.875% for NY)
  const taxRate = 0.08875;
  const taxAmount = Math.round(subtotal * taxRate * 100) / 100;
  
  // Total in cents for Stripe
  const total = subtotal + shippingAmount + taxAmount;
  const totalCents = Math.round(total * 100);

  // Generate order number
  const orderNumber = `HYOW-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;

  // Prepare addresses (use shipping as billing if not provided)
  const finalShippingAddress = shippingAddress || {};
  const finalBillingAddress = billingAddress || shippingAddress || {};

  // Create PaymentIntent
  const paymentIntent = await stripe.paymentIntents.create({
    amount: totalCents,
    currency: 'usd',
    automatic_payment_methods: { enabled: true },
    metadata: {
      orderNumber,
      userId: userId || 'guest',
      sessionId: sessionId || '',
      email: email || ''
    }
  });

  // Create order in pending state
  // IMPORTANT: All NOT NULL columns must have values
  const orderResult = await db.query(`
    INSERT INTO orders (
      order_number,
      user_id,
      session_id,
      email,
      phone,
      status,
      payment_status,
      subtotal,
      discount_amount,
      shipping_amount,
      tax_amount,
      total,
      shipping_address,
      billing_address,
      stripe_payment_intent_id
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
    RETURNING id
  `, [
    orderNumber,
    userId || null,
    sessionId || null,
    email,
    phone || null,
    'pending',
    'pending',
    subtotal,
    0, // discount_amount
    shippingAmount,
    taxAmount,
    total,
    JSON.stringify(finalShippingAddress),
    JSON.stringify(finalBillingAddress),
    paymentIntent.id
  ]);

  const orderId = orderResult.rows[0].id;

  // Create order items
  // Using correct column names: total_price (not total), product_id, variant_name, sku, image_url
  for (const item of items) {
    await db.query(`
      INSERT INTO order_items (
        order_id,
        product_id,
        variant_id,
        product_name,
        variant_name,
        sku,
        unit_price,
        quantity,
        total_price,
        image_url
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
    `, [
      orderId,
      item.productId,
      item.variantId,
      item.productName,
      item.variantName,
      item.sku,
      item.unitPrice,
      item.quantity,
      item.totalPrice,
      item.imageUrl
    ]);
  }

  res.json({
    clientSecret: paymentIntent.client_secret,
    orderNumber,
    summary: {
      subtotal,
      shipping: shippingAmount,
      tax: taxAmount,
      total,
      itemCount: items.length
    }
  });
}));

/**
 * POST /api/checkout/confirm
 * 
 * Called after successful payment to finalize the order and clear the cart.
 */
router.post('/confirm', optionalAuth, asyncHandler(async (req, res) => {
  const { orderNumber, paymentIntentId } = req.body;
  const userId = req.user?.id;
  const sessionId = req.body.sessionId || req.query.sessionId;

  // Verify the order exists and payment succeeded
  const orderResult = await db.query(`
    SELECT id, payment_status FROM orders 
    WHERE order_number = $1 AND stripe_payment_intent_id = $2
  `, [orderNumber, paymentIntentId]);

  if (orderResult.rows.length === 0) {
    throw new AppError('Order not found', 404);
  }

  // Check payment status with Stripe
  const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

  if (paymentIntent.status === 'succeeded') {
    // Update order status
    await db.query(`
      UPDATE orders 
      SET payment_status = 'paid', status = 'paid', updated_at = NOW()
      WHERE order_number = $1
    `, [orderNumber]);

    // Clear the cart
    if (userId) {
      const cartResult = await db.query('SELECT id FROM carts WHERE user_id = $1', [userId]);
      if (cartResult.rows.length > 0) {
        await db.query('DELETE FROM cart_items WHERE cart_id = $1', [cartResult.rows[0].id]);
      }
    } else if (sessionId) {
      const cartResult = await db.query('SELECT id FROM carts WHERE session_id = $1', [sessionId]);
      if (cartResult.rows.length > 0) {
        await db.query('DELETE FROM cart_items WHERE cart_id = $1', [cartResult.rows[0].id]);
      }
    }

    // Reduce inventory
    const orderItems = await db.query('SELECT variant_id, quantity FROM order_items WHERE order_id = $1', [orderResult.rows[0].id]);
    for (const item of orderItems.rows) {
      await db.query(`
        UPDATE product_variants 
        SET quantity = GREATEST(0, quantity - $1)
        WHERE id = $2
      `, [item.quantity, item.variant_id]);
    }

    res.json({ 
      success: true, 
      orderNumber,
      message: 'Order confirmed successfully' 
    });
  } else {
    throw new AppError('Payment not completed', 400);
  }
}));

/**
 * GET /api/checkout/config
 * 
 * Returns the Stripe publishable key for the frontend
 */
router.get('/config', (req, res) => {
  res.json({
    publishableKey: process.env.STRIPE_PUBLISHABLE_KEY
  });
});

module.exports = router;

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
 * Generate a unique order number
 */
function generateOrderNumber() {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `HYOW-${timestamp}-${random}`;
}

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
  // FIX: Use OR query to find cart by userId OR sessionId
  // This handles the case where a guest adds items, then logs in
  const cartResult = await db.query(`
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
    WHERE c.user_id = $1 OR c.session_id = $2
  `, [userId || null, sessionId || null]);

  if (cartResult.rows.length === 0) {
    throw new AppError('Cart is empty', 400);
  }

  // Calculate totals and validate inventory
  let subtotal = 0;
  const items = [];

  for (const item of cartResult.rows) {
    // Check stock
    if (item.stock_quantity !== null && item.quantity > item.stock_quantity) {
      throw new AppError(`Insufficient stock for ${item.product_name}. Only ${item.stock_quantity} available.`, 400);
    }

    // Price comes from products table
    const unitPrice = parseFloat(item.price);
    const lineTotal = unitPrice * item.quantity;
    subtotal += lineTotal;

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
      sku: item.sku,
      unitPrice: unitPrice,
      quantity: item.quantity,
      totalPrice: lineTotal,
      imageUrl: item.image_url,
      slug: item.slug,
    });
  }

  // Calculate shipping (free over $100)
  const shippingAmount = subtotal >= 100 ? 0 : 9.99;

  // Calculate tax (8% example rate)
  const taxRate = 0.08;
  const taxAmount = subtotal * taxRate;

  // No discount for now (can be added later)
  const discountAmount = 0;

  // Calculate total
  const total = subtotal - discountAmount + shippingAmount + taxAmount;

  // Convert to cents for Stripe
  const amountInCents = Math.round(total * 100);

  // Create PaymentIntent
  const paymentIntent = await stripe.paymentIntents.create({
    amount: amountInCents,
    currency: 'usd',
    automatic_payment_methods: {
      enabled: true,
    },
    metadata: {
      userId: userId || 'guest',
      sessionId: sessionId || 'none',
      email: email,
      itemCount: items.length.toString(),
    },
  });

  // Return client secret and order summary
  res.json({
    clientSecret: paymentIntent.client_secret,
    paymentIntentId: paymentIntent.id,
    orderSummary: {
      items: items,
      subtotal: subtotal,
      discountAmount: discountAmount,
      shippingAmount: shippingAmount,
      taxAmount: taxAmount,
      total: total,
    },
  });
}));

/**
 * POST /api/checkout/confirm
 *
 * Called after successful Stripe payment to create the order.
 */
router.post('/confirm', optionalAuth, asyncHandler(async (req, res) => {
  const {
    paymentIntentId,
    shippingAddress,
    billingAddress,
    email,
    phone,
    sessionId,
    customerNotes,
  } = req.body;
  
  const userId = req.user?.id || null;

  console.log('POST /checkout/confirm - userId:', userId, 'paymentIntentId:', paymentIntentId);

  if (!paymentIntentId) {
    throw new AppError('Payment intent ID is required', 400);
  }

  if (!email) {
    throw new AppError('Email is required', 400);
  }

  if (!shippingAddress) {
    throw new AppError('Shipping address is required', 400);
  }

  // Verify payment with Stripe
  const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

  if (paymentIntent.status !== 'succeeded') {
    throw new AppError(`Payment not completed. Status: ${paymentIntent.status}`, 400);
  }

  // Get cart items again (using same OR query)
  const cartResult = await db.query(`
    SELECT
      ci.id,
      ci.cart_id,
      ci.quantity,
      pv.id as variant_id,
      pv.size,
      pv.color,
      pv.sku,
      pv.quantity as stock_quantity,
      p.id as product_id,
      p.name as product_name,
      p.price,
      p.image_url
    FROM cart_items ci
    JOIN carts c ON ci.cart_id = c.id
    JOIN product_variants pv ON ci.variant_id = pv.id
    JOIN products p ON pv.product_id = p.id
    WHERE c.user_id = $1 OR c.session_id = $2
  `, [userId || null, sessionId || null]);

  if (cartResult.rows.length === 0) {
    throw new AppError('Cart is empty or already processed', 400);
  }

  const cartItems = cartResult.rows;
  const cartId = cartItems[0].cart_id;

  // Calculate totals
  let subtotal = 0;
  const orderItems = [];

  for (const item of cartItems) {
    const unitPrice = parseFloat(item.price);
    const lineTotal = unitPrice * item.quantity;
    subtotal += lineTotal;

    const variantParts = [];
    if (item.size) variantParts.push(item.size);
    if (item.color) variantParts.push(item.color);
    const variantName = variantParts.length > 0 ? variantParts.join(' / ') : null;

    orderItems.push({
      productId: item.product_id,
      variantId: item.variant_id,
      productName: item.product_name,
      variantName: variantName,
      sku: item.sku,
      unitPrice: unitPrice,
      quantity: item.quantity,
      totalPrice: lineTotal,
      imageUrl: item.image_url,
    });
  }

  const shippingAmount = subtotal >= 100 ? 0 : 9.99;
  const taxAmount = subtotal * 0.08;
  const discountAmount = 0;
  const total = subtotal - discountAmount + shippingAmount + taxAmount;

  // Generate order number
  const orderNumber = generateOrderNumber();

  // Start transaction
  const client = await db.pool.connect();

  try {
    await client.query('BEGIN');

    // Create the order (matches your exact schema)
    const orderResult = await client.query(`
      INSERT INTO orders (
        user_id,
        session_id,
        order_number,
        status,
        payment_status,
        payment_method,
        stripe_payment_intent_id,
        subtotal,
        discount_amount,
        shipping_amount,
        tax_amount,
        total,
        discount_code,
        shipping_address,
        billing_address,
        shipping_method,
        email,
        phone,
        customer_notes
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19)
      RETURNING *
    `, [
      userId,
      sessionId || null,
      orderNumber,
      'pending',           // status
      'paid',              // payment_status
      'card',              // payment_method
      paymentIntentId,
      subtotal,
      discountAmount,
      shippingAmount,
      taxAmount,
      total,
      null,                // discount_code
      JSON.stringify(shippingAddress),
      JSON.stringify(billingAddress || shippingAddress),
      'standard',          // shipping_method
      email,
      phone || null,
      customerNotes || null,
    ]);

    const order = orderResult.rows[0];

    // Create order items (matches your exact schema)
    for (const item of orderItems) {
      await client.query(`
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
        order.id,
        item.productId,
        item.variantId,
        item.productName,
        item.variantName,
        item.sku,
        item.unitPrice,
        item.quantity,
        item.totalPrice,
        item.imageUrl,
      ]);

      // Update inventory
      await client.query(`
        UPDATE product_variants
        SET quantity = quantity - $1
        WHERE id = $2 AND quantity >= $1
      `, [item.quantity, item.variantId]);
    }

    // Clear the cart
    await client.query('DELETE FROM cart_items WHERE cart_id = $1', [cartId]);

    await client.query('COMMIT');

    // Return success
    res.json({
      success: true,
      order: {
        id: order.id,
        orderNumber: order.order_number,
        status: order.status,
        paymentStatus: order.payment_status,
        subtotal: parseFloat(order.subtotal),
        discountAmount: parseFloat(order.discount_amount),
        shippingAmount: parseFloat(order.shipping_amount),
        taxAmount: parseFloat(order.tax_amount),
        total: parseFloat(order.total),
        email: order.email,
        createdAt: order.created_at,
      },
      message: 'Order placed successfully!',
    });

  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Order creation error:', error);
    throw new AppError('Failed to create order. Please contact support.', 500);
  } finally {
    client.release();
  }
}));

/**
 * GET /api/checkout/order/:id
 *
 * Get order details for confirmation page.
 */
router.get('/order/:id', optionalAuth, asyncHandler(async (req, res) => {
  const { id } = req.params;
  const userId = req.user?.id;

  // Get order
  const orderResult = await db.query('SELECT * FROM orders WHERE id = $1', [id]);

  if (orderResult.rows.length === 0) {
    throw new AppError('Order not found', 404);
  }

  const order = orderResult.rows[0];

  // Check authorization (if logged in, must own the order)
  if (userId && order.user_id && order.user_id !== userId) {
    throw new AppError('Not authorized to view this order', 403);
  }

  // Get order items
  const itemsResult = await db.query(`
    SELECT * FROM order_items WHERE order_id = $1
  `, [id]);

  res.json({
    order: {
      id: order.id,
      orderNumber: order.order_number,
      status: order.status,
      paymentStatus: order.payment_status,
      subtotal: parseFloat(order.subtotal),
      discountAmount: parseFloat(order.discount_amount),
      shippingAmount: parseFloat(order.shipping_amount),
      taxAmount: parseFloat(order.tax_amount),
      total: parseFloat(order.total),
      email: order.email,
      phone: order.phone,
      shippingAddress: order.shipping_address,
      billingAddress: order.billing_address,
      shippingMethod: order.shipping_method,
      customerNotes: order.customer_notes,
      createdAt: order.created_at,
      items: itemsResult.rows.map(item => ({
        id: item.id,
        productId: item.product_id,
        variantId: item.variant_id,
        productName: item.product_name,
        variantName: item.variant_name,
        sku: item.sku,
        unitPrice: parseFloat(item.unit_price),
        quantity: item.quantity,
        totalPrice: parseFloat(item.total_price),
        imageUrl: item.image_url,
      })),
    },
  });
}));

module.exports = router;

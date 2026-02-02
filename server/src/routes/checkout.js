/**
 * Checkout Routes
 * 
 * Handles the checkout process including:
 * - Creating Stripe PaymentIntents
 * - Creating orders in pending state
 * - Validating cart and inventory
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
 * This is called when the customer reaches the checkout page.
 */
router.post('/create-payment-intent', optionalAuth, asyncHandler(async (req, res) => {
  const { shippingAddress, email } = req.body;
  const userId = req.user?.id;
  const sessionId = req.body.sessionId || req.query.sessionId;

  if (!userId && !sessionId) {
    throw new AppError('User ID or session ID required', 400);
  }

  // Get cart items - using products table directly (not product_variants)
  let cartResult;
  if (userId) {
    cartResult = await db.query(`
      SELECT 
        ci.id,
        ci.quantity,
        ci.size,
        ci.color,
        p.id as product_id,
        p.name as product_name,
        p.price,
        p.slug,
        p.stock_quantity
      FROM cart_items ci
      JOIN carts c ON ci.cart_id = c.id
      JOIN products p ON ci.product_id = p.id
      WHERE c.user_id = $1
    `, [userId]);
  } else {
    cartResult = await db.query(`
      SELECT 
        ci.id,
        ci.quantity,
        ci.size,
        ci.color,
        p.id as product_id,
        p.name as product_name,
        p.price,
        p.slug,
        p.stock_quantity
      FROM cart_items ci
      JOIN carts c ON ci.cart_id = c.id
      JOIN products p ON ci.product_id = p.id
      WHERE c.session_id = $1
    `, [sessionId]);
  }

  if (cartResult.rows.length === 0) {
    throw new AppError('Cart is empty', 400);
  }

  // Calculate totals and validate inventory
  let subtotal = 0;
  const items = [];

  for (const item of cartResult.rows) {
    // Check stock (basic check - you can enhance this per size/color later)
    if (item.stock_quantity !== null && item.quantity > item.stock_quantity) {
      throw new AppError(`Insufficient stock for ${item.product_name}. Only ${item.stock_quantity} available.`, 400);
    }

    const unitPrice = parseFloat(item.price);
    const lineTotal = unitPrice * item.quantity;
    subtotal += lineTotal;

    items.push({
      cartItemId: item.id,
      productId: item.product_id,
      productName: item.product_name,
      size: item.size,
      color: item.color,
      quantity: item.quantity,
      unitPrice,
      lineTotal
    });
  }

  // Calculate shipping (free over $200, otherwise $15)
  const shippingAmount = subtotal >= 200 ? 0 : 15;
  
  // Calculate tax (approximate 8.875% for NY - adjust as needed)
  const taxRate = 0.08875;
  const taxAmount = Math.round(subtotal * taxRate * 100) / 100;
  
  // Total in cents for Stripe
  const total = subtotal + shippingAmount + taxAmount;
  const totalCents = Math.round(total * 100);

  // Generate order number
  const orderNumber = `HYOW-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;

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
  const orderResult = await db.query(`
    INSERT INTO orders (
      order_number,
      user_id,
      session_id,
      email,
      status,
      payment_status,
      subtotal,
      discount_amount,
      shipping_amount,
      tax_amount,
      total,
      shipping_address,
      stripe_payment_intent_id
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
    RETURNING id
  `, [
    orderNumber,
    userId || null,
    sessionId || null,
    email || null,
    'pending',
    'pending',
    subtotal,
    0, // discount_amount
    shippingAmount,
    taxAmount,
    total,
    shippingAddress ? JSON.stringify(shippingAddress) : null,
    paymentIntent.id
  ]);

  const orderId = orderResult.rows[0].id;

  // Create order items
  for (const item of items) {
    await db.query(`
      INSERT INTO order_items (
        order_id,
        product_id,
        product_name,
        size,
        color,
        quantity,
        unit_price,
        total
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
    `, [
      orderId,
      item.productId,
      item.productName,
      item.size || null,
      item.color || null,
      item.quantity,
      item.unitPrice,
      item.lineTotal
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
 * Called after successful payment to finalize the order
 * and clear the cart.
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
      UPDATE orders SET payment_status = 'paid', status = 'paid'
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

    // Reduce inventory for each product
    const orderItems = await db.query('SELECT product_id, quantity FROM order_items WHERE order_id = $1', [orderResult.rows[0].id]);
    for (const item of orderItems.rows) {
      await db.query(`
        UPDATE products 
        SET stock_quantity = GREATEST(0, stock_quantity - $1)
        WHERE id = $2 AND stock_quantity IS NOT NULL
      `, [item.quantity, item.product_id]);
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

/**
 * Order Routes
 * 
 * Handles order creation (checkout) and order history.
 * The actual payment processing happens via Stripe webhooks.
 * 
 * ADDED: GET /api/orders/by-payment-intent/:paymentIntentId
 *        For order confirmation page after Stripe redirect
 */

const express = require('express');
const db = require('../config/database');
const { AppError, asyncHandler } = require('../middleware/errorHandler');
const { authenticate, optionalAuth } = require('../middleware/auth');

const router = express.Router();

// ============================================================================
// GET /api/orders - Get user's order history
// ============================================================================
router.get('/', authenticate, asyncHandler(async (req, res) => {
  // Get orders with their items
  const ordersResult = await db.query(`
    SELECT 
      o.id, 
      o.order_number, 
      o.status, 
      o.payment_status,
      o.subtotal,
      o.discount_amount,
      o.shipping_amount,
      o.tax_amount,
      o.total, 
      o.shipping_address,
      o.tracking_number,
      o.tracking_url,
      o.created_at
    FROM orders o
    WHERE o.user_id = $1
    ORDER BY o.created_at DESC
  `, [req.user.id]);

  // Get items for each order
  const ordersWithItems = await Promise.all(ordersResult.rows.map(async (order) => {
    const itemsResult = await db.query(`
      SELECT 
        id,
        product_id,
        variant_id,
        product_name,
        variant_name,
        sku,
        unit_price,
        quantity,
        total_price,
        image_url
      FROM order_items 
      WHERE order_id = $1
    `, [order.id]);

    return {
      id: order.id,
      orderNumber: order.order_number,
      status: order.status,
      paymentStatus: order.payment_status,
      subtotal: parseFloat(order.subtotal),
      discountAmount: parseFloat(order.discount_amount),
      shippingAmount: parseFloat(order.shipping_amount),
      taxAmount: parseFloat(order.tax_amount),
      total: parseFloat(order.total),
      shippingAddress: order.shipping_address,
      trackingNumber: order.tracking_number,
      trackingUrl: order.tracking_url,
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
        imageUrl: item.image_url
      }))
    };
  }));

  res.json({ orders: ordersWithItems });
}));

// ============================================================================
// GET /api/orders/by-payment-intent/:paymentIntentId
// Fetch order by Stripe payment intent ID (for order confirmation page)
// ============================================================================
router.get('/by-payment-intent/:paymentIntentId', optionalAuth, asyncHandler(async (req, res) => {
  const { paymentIntentId } = req.params;
  const userId = req.user?.id || null;

  console.log('GET /api/orders/by-payment-intent - paymentIntentId:', paymentIntentId, 'userId:', userId);

  // Build query - allow fetching by payment intent for both guests and users
  let query = `
    SELECT o.*,
      COALESCE(
        json_agg(
          json_build_object(
            'id', oi.id,
            'product_id', oi.product_id,
            'variant_id', oi.variant_id,
            'product_name', oi.product_name,
            'variant_name', oi.variant_name,
            'sku', oi.sku,
            'unit_price', oi.unit_price,
            'quantity', oi.quantity,
            'total_price', oi.total_price,
            'image_url', oi.image_url
          )
        ) FILTER (WHERE oi.id IS NOT NULL),
        '[]'
      ) as items
    FROM orders o
    LEFT JOIN order_items oi ON o.id = oi.order_id
    WHERE o.stripe_payment_intent_id = $1
  `;

  const params = [paymentIntentId];

  // If user is logged in, also verify ownership (optional security)
  if (userId) {
    query += ` AND (o.user_id = $2 OR o.user_id IS NULL)`;
    params.push(userId);
  }

  query += ` GROUP BY o.id`;

  const result = await db.query(query, params);

  if (result.rows.length === 0) {
    return res.status(404).json({
      error: 'Order not found',
      message: 'No order found for this payment'
    });
  }

  const order = result.rows[0];

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
      shippingAddress: order.shipping_address,
      billingAddress: order.billing_address,
      trackingNumber: order.tracking_number,
      trackingUrl: order.tracking_url,
      email: order.email,
      createdAt: order.created_at,
      items: order.items
    }
  });
}));

// ============================================================================
// GET /api/orders/:orderNumber - Get single order details
// ============================================================================
router.get('/:orderNumber', optionalAuth, asyncHandler(async (req, res) => {
  const { orderNumber } = req.params;
  
  const result = await db.query(
    'SELECT * FROM orders WHERE order_number = $1',
    [orderNumber]
  );

  if (result.rows.length === 0) {
    throw new AppError('Order not found', 404);
  }

  const order = result.rows[0];

  // If user is logged in, verify they own this order
  if (req.user && order.user_id !== req.user.id) {
    throw new AppError('Order not found', 404);
  }

  // Get order items
  const itemsResult = await db.query(
    'SELECT * FROM order_items WHERE order_id = $1',
    [order.id]
  );

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
      shippingAddress: order.shipping_address,
      trackingNumber: order.tracking_number,
      items: itemsResult.rows,
      createdAt: order.created_at
    }
  });
}));

module.exports = router;

/**
 * Order Routes
 * 
 * Handles order creation (checkout) and order history.
 * The actual payment processing happens via Stripe webhooks.
 */

const express = require('express');
const db = require('../config/database');
const { AppError, asyncHandler } = require('../middleware/errorHandler');
const { authenticate, optionalAuth } = require('../middleware/auth');

const router = express.Router();

// GET /api/orders - Get user's order history
router.get('/', authenticate, asyncHandler(async (req, res) => {
  const result = await db.query(`
    SELECT id, order_number, status, total, created_at
    FROM orders
    WHERE user_id = $1
    ORDER BY created_at DESC
  `, [req.user.id]);

  res.json({
    orders: result.rows.map(o => ({
      id: o.id,
      orderNumber: o.order_number,
      status: o.status,
      total: parseFloat(o.total),
      createdAt: o.created_at
    }))
  });
}));

// GET /api/orders/:orderNumber - Get single order details
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

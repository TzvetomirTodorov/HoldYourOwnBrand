/**
 * Admin Routes
 * 
 * Protected routes for admin dashboard functionality.
 * All routes require authentication and admin role.
 */

const express = require('express');
const db = require('../config/database');
const { AppError, asyncHandler } = require('../middleware/errorHandler');
const { authenticate, authorize } = require('../middleware/auth');

const router = express.Router();

// Apply auth middleware to all admin routes
router.use(authenticate);
router.use(authorize('admin', 'super_admin'));

// GET /api/admin/dashboard - Get dashboard statistics
router.get('/dashboard', asyncHandler(async (req, res) => {
  // Get today's stats
  const todayStats = await db.query(`
    SELECT 
      COUNT(*) as order_count,
      COALESCE(SUM(total), 0) as revenue
    FROM orders 
    WHERE DATE(created_at) = CURRENT_DATE AND payment_status = 'paid'
  `);

  // Get this month's stats
  const monthStats = await db.query(`
    SELECT 
      COUNT(*) as order_count,
      COALESCE(SUM(total), 0) as revenue
    FROM orders 
    WHERE DATE_TRUNC('month', created_at) = DATE_TRUNC('month', CURRENT_DATE)
      AND payment_status = 'paid'
  `);

  // Get pending orders count
  const pendingOrders = await db.query(
    "SELECT COUNT(*) FROM orders WHERE status IN ('pending', 'paid', 'processing')"
  );

  // Get low stock products
  const lowStock = await db.query(`
    SELECT COUNT(DISTINCT product_id) 
    FROM product_variants 
    WHERE quantity <= low_stock_threshold AND quantity > 0
  `);

  // Recent orders
  const recentOrders = await db.query(`
    SELECT order_number, status, total, created_at
    FROM orders
    ORDER BY created_at DESC
    LIMIT 5
  `);

  res.json({
    today: {
      orders: parseInt(todayStats.rows[0].order_count),
      revenue: parseFloat(todayStats.rows[0].revenue)
    },
    month: {
      orders: parseInt(monthStats.rows[0].order_count),
      revenue: parseFloat(monthStats.rows[0].revenue)
    },
    pendingOrders: parseInt(pendingOrders.rows[0].count),
    lowStockProducts: parseInt(lowStock.rows[0].count),
    recentOrders: recentOrders.rows
  });
}));

// GET /api/admin/orders - List all orders
router.get('/orders', asyncHandler(async (req, res) => {
  const { status, page = 1, limit = 20 } = req.query;
  const offset = (page - 1) * limit;

  let query = 'SELECT * FROM orders';
  const params = [];

  if (status) {
    query += ' WHERE status = $1';
    params.push(status);
  }

  query += ' ORDER BY created_at DESC LIMIT $' + (params.length + 1) + ' OFFSET $' + (params.length + 2);
  params.push(limit, offset);

  const result = await db.query(query, params);
  res.json({ orders: result.rows });
}));

// PATCH /api/admin/orders/:id - Update order status
router.patch('/orders/:id', asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { status, trackingNumber } = req.body;

  const updates = [];
  const params = [];
  let paramIndex = 1;

  if (status) {
    updates.push(`status = $${paramIndex}`);
    params.push(status);
    paramIndex++;
    
    if (status === 'shipped') {
      updates.push(`shipped_at = NOW()`);
    } else if (status === 'delivered') {
      updates.push(`delivered_at = NOW()`);
    }
  }

  if (trackingNumber) {
    updates.push(`tracking_number = $${paramIndex}`);
    params.push(trackingNumber);
    paramIndex++;
  }

  if (updates.length === 0) {
    throw new AppError('No updates provided', 400);
  }

  params.push(id);
  
  await db.query(
    `UPDATE orders SET ${updates.join(', ')} WHERE id = $${paramIndex}`,
    params
  );

  res.json({ message: 'Order updated' });
}));

// Product management routes will be expanded in Phase 2
// GET /api/admin/products - List products with admin details
router.get('/products', asyncHandler(async (req, res) => {
  const result = await db.query(`
    SELECT p.*, c.name as category_name,
           (SELECT SUM(quantity) FROM product_variants WHERE product_id = p.id) as total_stock
    FROM products p
    LEFT JOIN categories c ON p.category_id = c.id
    ORDER BY p.created_at DESC
  `);
  res.json({ products: result.rows });
}));

module.exports = router;

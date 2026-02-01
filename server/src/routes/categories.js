/**
 * Category Routes
 * 
 * Handles category listing for navigation and filtering.
 */

const express = require('express');
const db = require('../config/database');
const { asyncHandler } = require('../middleware/errorHandler');

const router = express.Router();

/**
 * GET /api/categories
 * 
 * List all active categories with product counts.
 */
router.get('/', asyncHandler(async (req, res) => {
  const result = await db.query(`
    SELECT 
      c.id,
      c.name,
      c.slug,
      c.description,
      c.image_url,
      c.parent_id,
      COUNT(p.id) as product_count
    FROM categories c
    LEFT JOIN products p ON p.category_id = c.id AND p.status = 'active'
    WHERE c.is_active = true
    GROUP BY c.id
    ORDER BY c.sort_order, c.name
  `);

  res.json({
    categories: result.rows.map(cat => ({
      id: cat.id,
      name: cat.name,
      slug: cat.slug,
      description: cat.description,
      imageUrl: cat.image_url,
      parentId: cat.parent_id,
      productCount: parseInt(cat.product_count)
    }))
  });
}));

/**
 * GET /api/categories/:slug
 * 
 * Get a single category by slug.
 */
router.get('/:slug', asyncHandler(async (req, res) => {
  const { slug } = req.params;

  const result = await db.query(`
    SELECT 
      c.*,
      COUNT(p.id) as product_count
    FROM categories c
    LEFT JOIN products p ON p.category_id = c.id AND p.status = 'active'
    WHERE c.slug = $1 AND c.is_active = true
    GROUP BY c.id
  `, [slug]);

  if (result.rows.length === 0) {
    return res.status(404).json({
      error: 'Not Found',
      message: 'Category not found'
    });
  }

  const cat = result.rows[0];

  res.json({
    category: {
      id: cat.id,
      name: cat.name,
      slug: cat.slug,
      description: cat.description,
      imageUrl: cat.image_url,
      productCount: parseInt(cat.product_count)
    }
  });
}));

module.exports = router;

/**
 * HYOW Backend Fix - Products Route
 * 
 * This is the corrected products.js file that reads image_url directly 
 * from the products table instead of the product_images table.
 * 
 * DEPLOYMENT INSTRUCTIONS:
 * 1. Copy this file to: server/src/routes/products.js
 * 2. Git commit and push
 * 3. Railway will auto-redeploy
 */

const express = require('express');
const db = require('../config/database');
const { asyncHandler } = require('../middleware/errorHandler');
const { optionalAuth } = require('../middleware/auth');

const router = express.Router();

/**
 * GET /api/products
 * 
 * List all products with optional filtering and pagination.
 */
router.get('/', optionalAuth, asyncHandler(async (req, res) => {
  const {
    category,
    minPrice,
    maxPrice,
    search,
    sort = 'newest',
    page = 1,
    limit = 12,
    featured
  } = req.query;

  const conditions = ["p.status = 'active'"];
  const params = [];
  let paramIndex = 1;

  if (category) {
    conditions.push(`c.slug = $${paramIndex}`);
    params.push(category);
    paramIndex++;
  }

  if (minPrice) {
    conditions.push(`p.price >= $${paramIndex}`);
    params.push(parseFloat(minPrice));
    paramIndex++;
  }
  if (maxPrice) {
    conditions.push(`p.price <= $${paramIndex}`);
    params.push(parseFloat(maxPrice));
    paramIndex++;
  }

  if (featured === 'true') {
    conditions.push('p.is_featured = true');
  }

  if (search) {
    conditions.push(`(
      p.name ILIKE $${paramIndex} OR 
      p.description ILIKE $${paramIndex}
    )`);
    params.push(`%${search}%`);
    paramIndex++;
  }

  let orderBy;
  switch (sort) {
    case 'price_asc':
      orderBy = 'p.price ASC';
      break;
    case 'price_desc':
      orderBy = 'p.price DESC';
      break;
    case 'name':
      orderBy = 'p.name ASC';
      break;
    case 'newest':
    default:
      orderBy = 'p.created_at DESC';
  }

  const offset = (parseInt(page) - 1) * parseInt(limit);
  
  // FIXED: Now uses p.image_url directly instead of subquery from product_images
  const query = `
    SELECT 
      p.id,
      p.name,
      p.slug,
      p.description,
      p.price,
      p.compare_at_price,
      p.is_featured,
      p.is_new,
      c.name as category_name,
      c.slug as category_slug,
      p.image_url,
      (
        SELECT COALESCE(SUM(quantity), 0) 
        FROM product_variants 
        WHERE product_id = p.id AND is_active = true
      ) as total_stock,
      ${req.user ? `
        EXISTS(
          SELECT 1 FROM wishlists 
          WHERE user_id = '${req.user.id}' AND product_id = p.id
        ) as is_wishlisted,
      ` : ''}
      p.created_at
    FROM products p
    LEFT JOIN categories c ON p.category_id = c.id
    WHERE ${conditions.join(' AND ')}
    ORDER BY ${orderBy}
    LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
  `;

  params.push(parseInt(limit), offset);

  const result = await db.query(query, params);

  // Get total count for pagination
  const countQuery = `
    SELECT COUNT(*) 
    FROM products p
    LEFT JOIN categories c ON p.category_id = c.id
    WHERE ${conditions.join(' AND ')}
  `;

  const countResult = await db.query(countQuery, params.slice(0, -2));
  const totalCount = parseInt(countResult.rows[0].count);

  // Format response
  const products = result.rows.map(row => ({
    id: row.id,
    name: row.name,
    slug: row.slug,
    description: row.description,
    price: parseFloat(row.price),
    compareAtPrice: row.compare_at_price ? parseFloat(row.compare_at_price) : null,
    isFeatured: row.is_featured,
    isNew: row.is_new,
    category: {
      name: row.category_name,
      slug: row.category_slug
    },
    imageUrl: row.image_url,
    inStock: parseInt(row.total_stock) > 0,
    isWishlisted: row.is_wishlisted || false
  }));

  res.json({
    products,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      totalCount,
      totalPages: Math.ceil(totalCount / parseInt(limit))
    }
  });
}));

/**
 * GET /api/products/featured
 * 
 * Get featured products for homepage.
 */
router.get('/featured', optionalAuth, asyncHandler(async (req, res) => {
  const { limit = 8 } = req.query;

  // FIXED: Now uses p.image_url directly
  const query = `
    SELECT 
      p.id,
      p.name,
      p.slug,
      p.description,
      p.price,
      p.compare_at_price,
      p.is_featured,
      p.is_new,
      c.name as category_name,
      c.slug as category_slug,
      p.image_url,
      (
        SELECT COALESCE(SUM(quantity), 0) 
        FROM product_variants 
        WHERE product_id = p.id AND is_active = true
      ) as total_stock
    FROM products p
    LEFT JOIN categories c ON p.category_id = c.id
    WHERE p.status = 'active' AND p.is_featured = true
    ORDER BY p.created_at DESC
    LIMIT $1
  `;

  const result = await db.query(query, [parseInt(limit)]);

  const products = result.rows.map(row => ({
    id: row.id,
    name: row.name,
    slug: row.slug,
    description: row.description,
    price: parseFloat(row.price),
    compareAtPrice: row.compare_at_price ? parseFloat(row.compare_at_price) : null,
    isFeatured: row.is_featured,
    isNew: row.is_new,
    category: {
      name: row.category_name,
      slug: row.category_slug
    },
    imageUrl: row.image_url,
    inStock: parseInt(row.total_stock) > 0
  }));

  res.json({ products });
}));

/**
 * GET /api/products/:idOrSlug
 * 
 * Get a single product by ID (UUID) or slug with full details.
 * FIXED: Now handles both UUID and slug lookups for flexible routing.
 */
router.get('/:idOrSlug', optionalAuth, asyncHandler(async (req, res) => {
  const { idOrSlug } = req.params;
  
  // Detect if it's a UUID or a slug
  // UUIDs have the format: xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
  const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(idOrSlug);
  
  // Build WHERE clause based on identifier type
  const whereClause = isUUID ? 'p.id = $1' : 'p.slug = $1';

  // Get product details - FIXED: uses p.image_url
  const productQuery = `
    SELECT 
      p.*,
      c.name as category_name,
      c.slug as category_slug,
      ${req.user ? `
        EXISTS(
          SELECT 1 FROM wishlists 
          WHERE user_id = '${req.user.id}' AND product_id = p.id
        ) as is_wishlisted,
      ` : ''}
      p.image_url
    FROM products p
    LEFT JOIN categories c ON p.category_id = c.id
    WHERE ${whereClause} AND p.status = 'active'
  `;

  const productResult = await db.query(productQuery, [idOrSlug]);

  if (productResult.rows.length === 0) {
    return res.status(404).json({ 
      error: 'Not Found',
      message: 'Product not found' 
    });
  }

  const product = productResult.rows[0];

  // Get all images for this product (fallback to main image_url)
  const imagesQuery = `
    SELECT id, url, alt_text, sort_order
    FROM product_images
    WHERE product_id = $1
    ORDER BY sort_order
  `;
  const imagesResult = await db.query(imagesQuery, [product.id]);
  
  // Use product_images if available, otherwise use main image_url
  let images = imagesResult.rows;
  if (images.length === 0 && product.image_url) {
    images = [{ id: 'main', url: product.image_url, alt_text: product.name, sort_order: 0 }];
  }

  // Get variants
  const variantsQuery = `
    SELECT 
      id,
      sku,
      size,
      color,
      price_adjustment,
      quantity,
      is_active
    FROM product_variants
    WHERE product_id = $1 AND is_active = true
    ORDER BY size, color
  `;
  const variantsResult = await db.query(variantsQuery, [product.id]);

  // Format response
  res.json({
    id: product.id,
    name: product.name,
    slug: product.slug,
    description: product.description,
    price: parseFloat(product.price),
    compareAtPrice: product.compare_at_price ? parseFloat(product.compare_at_price) : null,
    isFeatured: product.is_featured,
    isNew: product.is_new,
    category: {
      id: product.category_id,
      name: product.category_name,
      slug: product.category_slug
    },
    images: images.map(img => ({
      id: img.id,
      url: img.url,
      altText: img.alt_text,
      sortOrder: img.sort_order
    })),
    variants: variantsResult.rows.map(v => ({
      id: v.id,
      sku: v.sku,
      size: v.size,
      color: v.color,
      priceAdjustment: parseFloat(v.price_adjustment || 0),
      quantity: v.quantity,
      inStock: v.quantity > 0
    })),
    isWishlisted: product.is_wishlisted || false,
    metaTitle: product.meta_title,
    metaDescription: product.meta_description,
    createdAt: product.created_at
  });
}));

/**
 * GET /api/products/search
 * 
 * Search products by query string.
 */
router.get('/search', optionalAuth, asyncHandler(async (req, res) => {
  const { q, limit = 10 } = req.query;

  if (!q || q.trim().length < 2) {
    return res.json({ products: [] });
  }

  const query = `
    SELECT 
      p.id,
      p.name,
      p.slug,
      p.price,
      c.name as category_name,
      p.image_url
    FROM products p
    LEFT JOIN categories c ON p.category_id = c.id
    WHERE p.status = 'active' AND (
      p.name ILIKE $1 OR 
      p.description ILIKE $1
    )
    ORDER BY 
      CASE WHEN p.name ILIKE $2 THEN 0 ELSE 1 END,
      p.name
    LIMIT $3
  `;

  const result = await db.query(query, [`%${q}%`, `${q}%`, parseInt(limit)]);

  res.json({
    products: result.rows.map(row => ({
      id: row.id,
      name: row.name,
      slug: row.slug,
      price: parseFloat(row.price),
      category: row.category_name,
      imageUrl: row.image_url
    }))
  });
}));

module.exports = router;

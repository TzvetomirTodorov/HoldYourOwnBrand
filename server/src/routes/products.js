/**
 * Product Routes
 * 
 * This file handles all product-related endpoints for the storefront.
 * It includes listing products with filters, getting product details,
 * and search functionality.
 * 
 * Note: Admin product management (create/update/delete) is in admin routes.
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
 * This is the main product catalog endpoint used by the storefront.
 * 
 * Query Parameters:
 *   - category: Filter by category slug
 *   - minPrice / maxPrice: Filter by price range
 *   - search: Full-text search in name and description
 *   - sort: Sorting option (newest, price_asc, price_desc, name)
 *   - page / limit: Pagination
 *   - featured: Only show featured products
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

  // Build the query dynamically based on filters
  const conditions = ["p.status = 'active'"];
  const params = [];
  let paramIndex = 1;

  // Category filter
  if (category) {
    conditions.push(`c.slug = $${paramIndex}`);
    params.push(category);
    paramIndex++;
  }

  // Price range filter
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

  // Featured filter
  if (featured === 'true') {
    conditions.push('p.is_featured = true');
  }

  // Search filter (searches name and description)
  if (search) {
    conditions.push(`(
      p.name ILIKE $${paramIndex} OR 
      p.description ILIKE $${paramIndex}
    )`);
    params.push(`%${search}%`);
    paramIndex++;
  }

  // Determine sort order
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

  // Calculate pagination
  const offset = (parseInt(page) - 1) * parseInt(limit);
  
  // Main query
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
      (
        SELECT url FROM product_images 
        WHERE product_id = p.id 
        ORDER BY sort_order 
        LIMIT 1
      ) as image_url,
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
  const countResult = await db.query(countQuery, params.slice(0, -2)); // Remove limit/offset params
  const totalCount = parseInt(countResult.rows[0].count);

  res.json({
    products: result.rows.map(row => ({
      id: row.id,
      name: row.name,
      slug: row.slug,
      description: row.description,
      price: parseFloat(row.price),
      compareAtPrice: row.compare_at_price ? parseFloat(row.compare_at_price) : null,
      isFeatured: row.is_featured,
      isNew: row.is_new,
      category: row.category_name ? {
        name: row.category_name,
        slug: row.category_slug
      } : null,
      imageUrl: row.image_url,
      inStock: parseInt(row.total_stock) > 0,
      isWishlisted: row.is_wishlisted || false
    })),
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
 * Get featured products for homepage display.
 * Limited to 8 products for performance.
 */
router.get('/featured', asyncHandler(async (req, res) => {
  const result = await db.query(`
    SELECT 
      p.id,
      p.name,
      p.slug,
      p.price,
      p.compare_at_price,
      (
        SELECT url FROM product_images 
        WHERE product_id = p.id 
        ORDER BY sort_order 
        LIMIT 1
      ) as image_url
    FROM products p
    WHERE p.status = 'active' AND p.is_featured = true
    ORDER BY p.created_at DESC
    LIMIT 8
  `);

  res.json({
    products: result.rows.map(row => ({
      id: row.id,
      name: row.name,
      slug: row.slug,
      price: parseFloat(row.price),
      compareAtPrice: row.compare_at_price ? parseFloat(row.compare_at_price) : null,
      imageUrl: row.image_url
    }))
  });
}));

/**
 * GET /api/products/new-arrivals
 * 
 * Get the most recently added products.
 */
router.get('/new-arrivals', asyncHandler(async (req, res) => {
  const result = await db.query(`
    SELECT 
      p.id,
      p.name,
      p.slug,
      p.price,
      p.compare_at_price,
      (
        SELECT url FROM product_images 
        WHERE product_id = p.id 
        ORDER BY sort_order 
        LIMIT 1
      ) as image_url
    FROM products p
    WHERE p.status = 'active'
    ORDER BY p.published_at DESC NULLS LAST, p.created_at DESC
    LIMIT 8
  `);

  res.json({
    products: result.rows.map(row => ({
      id: row.id,
      name: row.name,
      slug: row.slug,
      price: parseFloat(row.price),
      compareAtPrice: row.compare_at_price ? parseFloat(row.compare_at_price) : null,
      imageUrl: row.image_url
    }))
  });
}));

/**
 * GET /api/products/:slug
 * 
 * Get a single product by its URL slug.
 * Includes all images, variants, and related products.
 */
router.get('/:slug', optionalAuth, asyncHandler(async (req, res) => {
  const { slug } = req.params;

  // Get product details
  const productResult = await db.query(`
    SELECT 
      p.*,
      c.name as category_name,
      c.slug as category_slug
    FROM products p
    LEFT JOIN categories c ON p.category_id = c.id
    WHERE p.slug = $1 AND p.status = 'active'
  `, [slug]);

  if (productResult.rows.length === 0) {
    return res.status(404).json({
      error: 'Not Found',
      message: 'Product not found'
    });
  }

  const product = productResult.rows[0];

  // Get all images
  const imagesResult = await db.query(`
    SELECT id, url, alt_text, sort_order
    FROM product_images
    WHERE product_id = $1
    ORDER BY sort_order
  `, [product.id]);

  // Get all variants
  const variantsResult = await db.query(`
    SELECT id, sku, size, color, price_adjustment, quantity, low_stock_threshold
    FROM product_variants
    WHERE product_id = $1 AND is_active = true
    ORDER BY size, color
  `, [product.id]);

  // Check if wishlisted (if user is logged in)
  let isWishlisted = false;
  if (req.user) {
    const wishlistResult = await db.query(
      'SELECT 1 FROM wishlists WHERE user_id = $1 AND product_id = $2',
      [req.user.id, product.id]
    );
    isWishlisted = wishlistResult.rows.length > 0;
  }

  // Get related products (same category, excluding this one)
  const relatedResult = await db.query(`
    SELECT 
      p.id,
      p.name,
      p.slug,
      p.price,
      (
        SELECT url FROM product_images 
        WHERE product_id = p.id 
        ORDER BY sort_order 
        LIMIT 1
      ) as image_url
    FROM products p
    WHERE p.category_id = $1 
      AND p.id != $2 
      AND p.status = 'active'
    ORDER BY RANDOM()
    LIMIT 4
  `, [product.category_id, product.id]);

  // Format the response
  res.json({
    product: {
      id: product.id,
      name: product.name,
      slug: product.slug,
      description: product.description,
      price: parseFloat(product.price),
      compareAtPrice: product.compare_at_price ? parseFloat(product.compare_at_price) : null,
      isFeatured: product.is_featured,
      isNew: product.is_new,
      metaTitle: product.meta_title,
      metaDescription: product.meta_description,
      category: product.category_name ? {
        name: product.category_name,
        slug: product.category_slug
      } : null,
      images: imagesResult.rows.map(img => ({
        id: img.id,
        url: img.url,
        altText: img.alt_text
      })),
      variants: variantsResult.rows.map(v => ({
        id: v.id,
        sku: v.sku,
        size: v.size,
        color: v.color,
        priceAdjustment: parseFloat(v.price_adjustment),
        inStock: v.quantity > 0,
        lowStock: v.quantity > 0 && v.quantity <= v.low_stock_threshold
      })),
      isWishlisted,
      relatedProducts: relatedResult.rows.map(p => ({
        id: p.id,
        name: p.name,
        slug: p.slug,
        price: parseFloat(p.price),
        imageUrl: p.image_url
      }))
    }
  });
}));

module.exports = router;

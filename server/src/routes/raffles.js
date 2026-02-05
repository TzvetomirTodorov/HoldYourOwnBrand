/**
 * Raffle Routes - Nike SNKRS Style Drop System
 * 
 * Features:
 * - Create raffles for limited drops
 * - User entry with size/preference selection
 * - Random winner selection
 * - Entry limits and duplicate prevention
 * - Loyalty tier priority
 * 
 * Routes:
 * - GET /api/raffles - List active raffles
 * - GET /api/raffles/:id - Get raffle details
 * - POST /api/raffles/:id/enter - Enter a raffle
 * - GET /api/raffles/:id/status - Check entry status
 * - POST /api/raffles/:id/draw - Draw winners (admin)
 */

const express = require('express');
const router = express.Router();
const db = require('../config/db');
const { authenticate, isAdmin } = require('../middleware/auth');

// ═══════════════════════════════════════════════════════════════════════════
// HELPERS
// ═══════════════════════════════════════════════════════════════════════════

const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

// Check if raffle is currently active
const isRaffleActive = (raffle) => {
  const now = new Date();
  const start = new Date(raffle.entry_start);
  const end = new Date(raffle.entry_end);
  return now >= start && now <= end && raffle.status === 'active';
};

// Get user's loyalty tier for priority
const getUserTier = async (userId) => {
  try {
    const result = await db.query(
      'SELECT tier FROM loyalty_accounts WHERE user_id = $1',
      [userId]
    );
    return result.rows[0]?.tier || 'STARTER';
  } catch (e) {
    return 'STARTER';
  }
};

// Calculate priority multiplier based on tier
const getTierMultiplier = (tier) => {
  const multipliers = {
    'STARTER': 1,
    'ELEVATED': 2,  // 2x chance
    'ELITE': 5,     // 5x chance
  };
  return multipliers[tier] || 1;
};

// ═══════════════════════════════════════════════════════════════════════════
// GET /api/raffles - List all active raffles
// ═══════════════════════════════════════════════════════════════════════════

router.get('/', asyncHandler(async (req, res) => {
  const { status = 'active' } = req.query;
  
  let query = `
    SELECT 
      r.*,
      p.name as product_name,
      p.slug as product_slug,
      (SELECT url FROM product_images WHERE product_id = p.id ORDER BY sort_order LIMIT 1) as product_image,
      (SELECT COUNT(*) FROM raffle_entries WHERE raffle_id = r.id) as entry_count
    FROM raffles r
    JOIN products p ON r.product_id = p.id
  `;
  
  const params = [];
  
  if (status === 'active') {
    query += ` WHERE r.status = 'active' AND r.entry_end > NOW()`;
  } else if (status === 'upcoming') {
    query += ` WHERE r.status = 'active' AND r.entry_start > NOW()`;
  } else if (status === 'ended') {
    query += ` WHERE r.status IN ('drawn', 'completed') OR r.entry_end < NOW()`;
  }
  
  query += ` ORDER BY r.entry_start ASC`;
  
  const result = await db.query(query, params);
  
  // Transform data for frontend
  const raffles = result.rows.map(raffle => ({
    id: raffle.id,
    title: raffle.title,
    description: raffle.description,
    productId: raffle.product_id,
    productName: raffle.product_name,
    productSlug: raffle.product_slug,
    productImage: raffle.product_image,
    entryStart: raffle.entry_start,
    entryEnd: raffle.entry_end,
    drawDate: raffle.draw_date,
    status: raffle.status,
    maxEntries: raffle.max_entries,
    currentEntries: parseInt(raffle.entry_count),
    winnersCount: raffle.winners_count,
    retailPrice: raffle.retail_price,
    isActive: isRaffleActive(raffle),
  }));

  res.json({ raffles });
}));

// ═══════════════════════════════════════════════════════════════════════════
// GET /api/raffles/:id - Get raffle details
// ═══════════════════════════════════════════════════════════════════════════

router.get('/:id', asyncHandler(async (req, res) => {
  const { id } = req.params;
  
  const result = await db.query(`
    SELECT 
      r.*,
      p.name as product_name,
      p.slug as product_slug,
      p.description as product_description,
      p.price as product_price,
      (SELECT url FROM product_images WHERE product_id = p.id ORDER BY sort_order LIMIT 1) as product_image,
      (SELECT COUNT(*) FROM raffle_entries WHERE raffle_id = r.id) as entry_count
    FROM raffles r
    JOIN products p ON r.product_id = p.id
    WHERE r.id = $1
  `, [id]);

  if (result.rows.length === 0) {
    return res.status(404).json({ error: 'Raffle not found' });
  }

  const raffle = result.rows[0];
  
  // Get available sizes for this raffle
  const sizesResult = await db.query(`
    SELECT DISTINCT pv.size, pv.id as variant_id, pv.quantity as stock
    FROM product_variants pv
    WHERE pv.product_id = $1 AND pv.quantity > 0
    ORDER BY 
      CASE pv.size 
        WHEN 'XS' THEN 1 
        WHEN 'S' THEN 2 
        WHEN 'M' THEN 3 
        WHEN 'L' THEN 4 
        WHEN 'XL' THEN 5 
        WHEN 'XXL' THEN 6 
        ELSE 7 
      END
  `, [raffle.product_id]);

  res.json({
    raffle: {
      id: raffle.id,
      title: raffle.title,
      description: raffle.description,
      rules: raffle.rules,
      productId: raffle.product_id,
      productName: raffle.product_name,
      productSlug: raffle.product_slug,
      productDescription: raffle.product_description,
      productImage: raffle.product_image,
      productPrice: raffle.product_price,
      entryStart: raffle.entry_start,
      entryEnd: raffle.entry_end,
      drawDate: raffle.draw_date,
      status: raffle.status,
      maxEntries: raffle.max_entries,
      currentEntries: parseInt(raffle.entry_count),
      winnersCount: raffle.winners_count,
      retailPrice: raffle.retail_price,
      isActive: isRaffleActive(raffle),
      availableSizes: sizesResult.rows,
    },
  });
}));

// ═══════════════════════════════════════════════════════════════════════════
// POST /api/raffles/:id/enter - Enter a raffle
// ═══════════════════════════════════════════════════════════════════════════

router.post('/:id/enter', authenticate, asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { sizePreference, shippingAddressId } = req.body;
  const userId = req.user.id;

  // Get raffle details
  const raffleResult = await db.query('SELECT * FROM raffles WHERE id = $1', [id]);
  
  if (raffleResult.rows.length === 0) {
    return res.status(404).json({ error: 'Raffle not found' });
  }

  const raffle = raffleResult.rows[0];

  // Check if raffle is active
  if (!isRaffleActive(raffle)) {
    return res.status(400).json({ error: 'Raffle is not currently accepting entries' });
  }

  // Check for existing entry
  const existingEntry = await db.query(
    'SELECT id FROM raffle_entries WHERE raffle_id = $1 AND user_id = $2',
    [id, userId]
  );

  if (existingEntry.rows.length > 0) {
    return res.status(400).json({ error: 'You have already entered this raffle' });
  }

  // Check max entries
  if (raffle.max_entries) {
    const entryCount = await db.query(
      'SELECT COUNT(*) FROM raffle_entries WHERE raffle_id = $1',
      [id]
    );
    if (parseInt(entryCount.rows[0].count) >= raffle.max_entries) {
      return res.status(400).json({ error: 'Raffle has reached maximum entries' });
    }
  }

  // Get user's loyalty tier for priority
  const tier = await getUserTier(userId);
  const priorityMultiplier = getTierMultiplier(tier);

  // Create entry
  const entry = await db.query(`
    INSERT INTO raffle_entries (raffle_id, user_id, size_preference, shipping_address_id, priority_multiplier, loyalty_tier)
    VALUES ($1, $2, $3, $4, $5, $6)
    RETURNING *
  `, [id, userId, sizePreference, shippingAddressId, priorityMultiplier, tier]);

  res.status(201).json({
    message: 'Successfully entered raffle',
    entry: {
      id: entry.rows[0].id,
      raffleId: id,
      sizePreference,
      tier,
      priorityMultiplier,
      enteredAt: entry.rows[0].created_at,
    },
  });
}));

// ═══════════════════════════════════════════════════════════════════════════
// GET /api/raffles/:id/status - Check user's entry status
// ═══════════════════════════════════════════════════════════════════════════

router.get('/:id/status', authenticate, asyncHandler(async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;

  // Get entry
  const entryResult = await db.query(`
    SELECT re.*, r.status as raffle_status, r.draw_date
    FROM raffle_entries re
    JOIN raffles r ON re.raffle_id = r.id
    WHERE re.raffle_id = $1 AND re.user_id = $2
  `, [id, userId]);

  if (entryResult.rows.length === 0) {
    return res.json({
      entered: false,
      status: null,
    });
  }

  const entry = entryResult.rows[0];

  res.json({
    entered: true,
    status: entry.status, // 'pending', 'won', 'lost'
    sizePreference: entry.size_preference,
    tier: entry.loyalty_tier,
    priorityMultiplier: entry.priority_multiplier,
    enteredAt: entry.created_at,
    raffleStatus: entry.raffle_status,
    drawDate: entry.draw_date,
  });
}));

// ═══════════════════════════════════════════════════════════════════════════
// POST /api/raffles/:id/draw - Draw winners (Admin only)
// ═══════════════════════════════════════════════════════════════════════════

router.post('/:id/draw', authenticate, isAdmin, asyncHandler(async (req, res) => {
  const { id } = req.params;

  // Get raffle
  const raffleResult = await db.query('SELECT * FROM raffles WHERE id = $1', [id]);
  
  if (raffleResult.rows.length === 0) {
    return res.status(404).json({ error: 'Raffle not found' });
  }

  const raffle = raffleResult.rows[0];

  if (raffle.status === 'drawn') {
    return res.status(400).json({ error: 'Raffle has already been drawn' });
  }

  // Get all entries with priority multiplier
  const entriesResult = await db.query(`
    SELECT * FROM raffle_entries 
    WHERE raffle_id = $1 AND status = 'pending'
  `, [id]);

  const entries = entriesResult.rows;

  if (entries.length === 0) {
    return res.status(400).json({ error: 'No entries to draw from' });
  }

  // Create weighted pool based on priority multiplier
  const weightedPool = [];
  entries.forEach(entry => {
    for (let i = 0; i < entry.priority_multiplier; i++) {
      weightedPool.push(entry);
    }
  });

  // Shuffle and select winners
  const shuffled = weightedPool.sort(() => Math.random() - 0.5);
  const winnersCount = Math.min(raffle.winners_count, entries.length);
  const selectedWinners = new Set();
  const winners = [];

  for (const entry of shuffled) {
    if (winners.length >= winnersCount) break;
    if (!selectedWinners.has(entry.user_id)) {
      selectedWinners.add(entry.user_id);
      winners.push(entry);
    }
  }

  // Update winner entries
  for (const winner of winners) {
    await db.query(
      `UPDATE raffle_entries SET status = 'won', won_at = NOW() WHERE id = $1`,
      [winner.id]
    );
  }

  // Update non-winner entries
  await db.query(
    `UPDATE raffle_entries SET status = 'lost' WHERE raffle_id = $1 AND status = 'pending'`,
    [id]
  );

  // Update raffle status
  await db.query(
    `UPDATE raffles SET status = 'drawn', drawn_at = NOW() WHERE id = $1`,
    [id]
  );

  res.json({
    message: `Drew ${winners.length} winners`,
    winnersCount: winners.length,
    totalEntries: entries.length,
  });
}));

// ═══════════════════════════════════════════════════════════════════════════
// GET /api/raffles/my-entries - Get user's raffle entries
// ═══════════════════════════════════════════════════════════════════════════

router.get('/user/entries', authenticate, asyncHandler(async (req, res) => {
  const userId = req.user.id;

  const result = await db.query(`
    SELECT 
      re.*,
      r.title as raffle_title,
      r.status as raffle_status,
      r.draw_date,
      r.entry_end,
      p.name as product_name,
      p.slug as product_slug,
      (SELECT url FROM product_images WHERE product_id = p.id ORDER BY sort_order LIMIT 1) as product_image
    FROM raffle_entries re
    JOIN raffles r ON re.raffle_id = r.id
    JOIN products p ON r.product_id = p.id
    WHERE re.user_id = $1
    ORDER BY re.created_at DESC
  `, [userId]);

  const entries = result.rows.map(entry => ({
    id: entry.id,
    raffleId: entry.raffle_id,
    raffleTitle: entry.raffle_title,
    status: entry.status,
    raffleStatus: entry.raffle_status,
    sizePreference: entry.size_preference,
    tier: entry.loyalty_tier,
    productName: entry.product_name,
    productSlug: entry.product_slug,
    productImage: entry.product_image,
    enteredAt: entry.created_at,
    drawDate: entry.draw_date,
    wonAt: entry.won_at,
  }));

  res.json({ entries });
}));

module.exports = router;

/* 
═══════════════════════════════════════════════════════════════════════════════
DATABASE SCHEMA (Run these migrations)
═══════════════════════════════════════════════════════════════════════════════

CREATE TABLE raffles (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  rules TEXT,
  product_id INTEGER REFERENCES products(id),
  entry_start TIMESTAMP NOT NULL,
  entry_end TIMESTAMP NOT NULL,
  draw_date TIMESTAMP NOT NULL,
  status VARCHAR(20) DEFAULT 'active', -- active, drawn, completed, cancelled
  max_entries INTEGER,
  winners_count INTEGER DEFAULT 1,
  retail_price DECIMAL(10,2),
  created_at TIMESTAMP DEFAULT NOW(),
  drawn_at TIMESTAMP
);

CREATE TABLE raffle_entries (
  id SERIAL PRIMARY KEY,
  raffle_id INTEGER REFERENCES raffles(id) ON DELETE CASCADE,
  user_id INTEGER REFERENCES users(id),
  size_preference VARCHAR(10),
  shipping_address_id INTEGER,
  status VARCHAR(20) DEFAULT 'pending', -- pending, won, lost
  priority_multiplier INTEGER DEFAULT 1,
  loyalty_tier VARCHAR(20),
  created_at TIMESTAMP DEFAULT NOW(),
  won_at TIMESTAMP,
  UNIQUE(raffle_id, user_id)
);

CREATE INDEX idx_raffle_entries_raffle ON raffle_entries(raffle_id);
CREATE INDEX idx_raffle_entries_user ON raffle_entries(user_id);
CREATE INDEX idx_raffles_status ON raffles(status);

*/

/**
 * Loyalty Program Routes for HYOW
 * 
 * Kith-inspired tier system:
 * - STARTER (0-999 points)
 * - ELEVATED (1000-4999 points)
 * - ELITE (5000+ points)
 * 
 * Earning:
 * - 2 points per $1 spent
 * - Bonus points for achievements
 * - Points for reviews, referrals, etc.
 * 
 * Rewards:
 * - Early drop access (48h for Elite, 24h for Elevated)
 * - Birthday gifts
 * - Exclusive products
 * - Free shipping thresholds
 */

const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const asyncHandler = require('express-async-handler');
const db = require('../config/db');
const AppError = require('../utils/AppError');

// ═══════════════════════════════════════════════════════════════════════════
// TIER CONFIGURATION
// ═══════════════════════════════════════════════════════════════════════════

const TIERS = {
  STARTER: {
    name: 'Starter',
    minPoints: 0,
    maxPoints: 999,
    benefits: [
      'Welcome gift on first purchase',
      'Birthday reward',
      'Member-only sales access',
    ],
    earlyAccessHours: 0,
    freeShippingThreshold: 150,
  },
  ELEVATED: {
    name: 'Elevated',
    minPoints: 1000,
    maxPoints: 4999,
    benefits: [
      'All Starter benefits',
      '24-hour early drop access',
      'Free shipping on orders over $100',
      'Exclusive colorways access',
    ],
    earlyAccessHours: 24,
    freeShippingThreshold: 100,
  },
  ELITE: {
    name: 'Elite',
    minPoints: 5000,
    maxPoints: Infinity,
    benefits: [
      'All Elevated benefits',
      '48-hour early drop access',
      'Free shipping on all orders',
      'VIP event invitations',
      'Limited edition products',
      'Personal styling sessions',
    ],
    earlyAccessHours: 48,
    freeShippingThreshold: 0,
  },
};

const POINTS_PER_DOLLAR = 2;

// Calculate tier from points
const getTierFromPoints = (points) => {
  if (points >= TIERS.ELITE.minPoints) return 'ELITE';
  if (points >= TIERS.ELEVATED.minPoints) return 'ELEVATED';
  return 'STARTER';
};

// ═══════════════════════════════════════════════════════════════════════════
// GET /api/loyalty/status - Get user's loyalty status
// ═══════════════════════════════════════════════════════════════════════════

router.get('/status', authenticate, asyncHandler(async (req, res) => {
  const userId = req.user.id;

  // Get or create loyalty account
  let accountResult = await db.query(
    `SELECT * FROM loyalty_accounts WHERE user_id = $1`,
    [userId]
  );

  if (accountResult.rows.length === 0) {
    // Create new loyalty account
    accountResult = await db.query(
      `INSERT INTO loyalty_accounts (user_id, points_balance, tier, created_at)
       VALUES ($1, 0, 'STARTER', NOW())
       RETURNING *`,
      [userId]
    );
  }

  const account = accountResult.rows[0];
  const currentTier = getTierFromPoints(account.points_balance);
  const tierConfig = TIERS[currentTier];

  // Calculate progress to next tier
  let nextTier = null;
  let pointsToNextTier = null;

  if (currentTier === 'STARTER') {
    nextTier = 'ELEVATED';
    pointsToNextTier = TIERS.ELEVATED.minPoints - account.points_balance;
  } else if (currentTier === 'ELEVATED') {
    nextTier = 'ELITE';
    pointsToNextTier = TIERS.ELITE.minPoints - account.points_balance;
  }

  // Get recent transactions
  const transactionsResult = await db.query(
    `SELECT * FROM loyalty_transactions
     WHERE user_id = $1
     ORDER BY created_at DESC
     LIMIT 10`,
    [userId]
  );

  res.json({
    account: {
      id: account.id,
      pointsBalance: account.points_balance,
      lifetimePoints: account.lifetime_points || account.points_balance,
      tier: currentTier,
      tierName: tierConfig.name,
      joinedAt: account.created_at,
    },
    tierInfo: {
      current: tierConfig,
      next: nextTier ? TIERS[nextTier] : null,
      pointsToNextTier,
      progressPercent: nextTier 
        ? Math.round((account.points_balance / TIERS[nextTier].minPoints) * 100)
        : 100,
    },
    recentTransactions: transactionsResult.rows,
  });
}));

// ═══════════════════════════════════════════════════════════════════════════
// POST /api/loyalty/earn - Earn points (called after purchase)
// ═══════════════════════════════════════════════════════════════════════════

router.post('/earn', authenticate, asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const { orderId, amount, source = 'purchase' } = req.body;

  if (!amount || amount <= 0) {
    throw new AppError('Invalid amount', 400);
  }

  // Calculate points
  let points;
  if (source === 'purchase') {
    points = Math.floor(amount * POINTS_PER_DOLLAR);
  } else {
    points = amount; // Direct points for achievements, reviews, etc.
  }

  // Start transaction
  const client = await db.pool.connect();
  
  try {
    await client.query('BEGIN');

    // Get current account
    const accountResult = await client.query(
      `SELECT * FROM loyalty_accounts WHERE user_id = $1 FOR UPDATE`,
      [userId]
    );

    if (accountResult.rows.length === 0) {
      throw new AppError('Loyalty account not found', 404);
    }

    const account = accountResult.rows[0];
    const newBalance = account.points_balance + points;
    const newLifetime = (account.lifetime_points || account.points_balance) + points;

    // Check for tier upgrade
    const oldTier = getTierFromPoints(account.points_balance);
    const newTier = getTierFromPoints(newBalance);
    const tierUpgraded = newTier !== oldTier;

    // Update account
    await client.query(
      `UPDATE loyalty_accounts
       SET points_balance = $1,
           lifetime_points = $2,
           tier = $3,
           updated_at = NOW()
       WHERE user_id = $4`,
      [newBalance, newLifetime, newTier, userId]
    );

    // Record transaction
    await client.query(
      `INSERT INTO loyalty_transactions
       (user_id, type, points, source, reference_id, description, created_at)
       VALUES ($1, 'earn', $2, $3, $4, $5, NOW())`,
      [
        userId,
        points,
        source,
        orderId || null,
        source === 'purchase' 
          ? `Earned ${points} points on order` 
          : `Bonus points: ${source}`,
      ]
    );

    await client.query('COMMIT');

    res.json({
      success: true,
      pointsEarned: points,
      newBalance,
      tier: newTier,
      tierUpgraded,
      message: tierUpgraded 
        ? `Congratulations! You've reached ${TIERS[newTier].name} status!`
        : `You earned ${points} points!`,
    });

  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}));

// ═══════════════════════════════════════════════════════════════════════════
// POST /api/loyalty/redeem - Redeem points for rewards
// ═══════════════════════════════════════════════════════════════════════════

router.post('/redeem', authenticate, asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const { rewardId, points } = req.body;

  if (!points || points <= 0) {
    throw new AppError('Invalid points amount', 400);
  }

  const client = await db.pool.connect();
  
  try {
    await client.query('BEGIN');

    // Get account with lock
    const accountResult = await client.query(
      `SELECT * FROM loyalty_accounts WHERE user_id = $1 FOR UPDATE`,
      [userId]
    );

    const account = accountResult.rows[0];

    if (account.points_balance < points) {
      throw new AppError('Insufficient points', 400);
    }

    const newBalance = account.points_balance - points;
    const newTier = getTierFromPoints(newBalance);

    // Update balance (note: tier doesn't downgrade immediately)
    await client.query(
      `UPDATE loyalty_accounts
       SET points_balance = $1,
           updated_at = NOW()
       WHERE user_id = $2`,
      [newBalance, userId]
    );

    // Record transaction
    await client.query(
      `INSERT INTO loyalty_transactions
       (user_id, type, points, source, reference_id, description, created_at)
       VALUES ($1, 'redeem', $2, 'reward', $3, $4, NOW())`,
      [userId, -points, rewardId, `Redeemed ${points} points`]
    );

    await client.query('COMMIT');

    res.json({
      success: true,
      pointsRedeemed: points,
      newBalance,
      // Generate a reward code
      rewardCode: `HYOW-${Date.now().toString(36).toUpperCase()}`,
    });

  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}));

// ═══════════════════════════════════════════════════════════════════════════
// GET /api/loyalty/rewards - Get available rewards
// ═══════════════════════════════════════════════════════════════════════════

router.get('/rewards', authenticate, asyncHandler(async (req, res) => {
  const userId = req.user.id;

  // Get user's tier
  const accountResult = await db.query(
    `SELECT tier, points_balance FROM loyalty_accounts WHERE user_id = $1`,
    [userId]
  );

  const account = accountResult.rows[0] || { tier: 'STARTER', points_balance: 0 };

  // Define available rewards
  const rewards = [
    {
      id: 'discount-10',
      name: '$10 Off',
      description: 'Get $10 off your next order',
      pointsCost: 500,
      type: 'discount',
      value: 10,
      minTier: 'STARTER',
    },
    {
      id: 'discount-25',
      name: '$25 Off',
      description: 'Get $25 off your next order',
      pointsCost: 1000,
      type: 'discount',
      value: 25,
      minTier: 'STARTER',
    },
    {
      id: 'free-shipping',
      name: 'Free Shipping',
      description: 'Free shipping on your next order',
      pointsCost: 300,
      type: 'shipping',
      value: 0,
      minTier: 'STARTER',
    },
    {
      id: 'exclusive-tee',
      name: 'Member Exclusive Tee',
      description: 'Redeem for a limited edition HYOW member tee',
      pointsCost: 2500,
      type: 'product',
      value: null,
      minTier: 'ELEVATED',
    },
    {
      id: 'styling-session',
      name: 'Personal Styling Session',
      description: '30-minute virtual styling session with HYOW team',
      pointsCost: 5000,
      type: 'experience',
      value: null,
      minTier: 'ELITE',
    },
  ];

  // Filter rewards by tier and add availability status
  const tierOrder = ['STARTER', 'ELEVATED', 'ELITE'];
  const userTierIndex = tierOrder.indexOf(account.tier);

  const availableRewards = rewards.map(reward => ({
    ...reward,
    canRedeem: 
      tierOrder.indexOf(reward.minTier) <= userTierIndex && 
      account.points_balance >= reward.pointsCost,
    tierLocked: tierOrder.indexOf(reward.minTier) > userTierIndex,
    pointsNeeded: Math.max(0, reward.pointsCost - account.points_balance),
  }));

  res.json({
    rewards: availableRewards,
    userPoints: account.points_balance,
    userTier: account.tier,
  });
}));

// ═══════════════════════════════════════════════════════════════════════════
// GET /api/loyalty/history - Get transaction history
// ═══════════════════════════════════════════════════════════════════════════

router.get('/history', authenticate, asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const { limit = 20, offset = 0 } = req.query;

  const result = await db.query(
    `SELECT * FROM loyalty_transactions
     WHERE user_id = $1
     ORDER BY created_at DESC
     LIMIT $2 OFFSET $3`,
    [userId, limit, offset]
  );

  const countResult = await db.query(
    `SELECT COUNT(*) FROM loyalty_transactions WHERE user_id = $1`,
    [userId]
  );

  res.json({
    transactions: result.rows,
    total: parseInt(countResult.rows[0].count),
    limit: parseInt(limit),
    offset: parseInt(offset),
  });
}));

// ═══════════════════════════════════════════════════════════════════════════
// GET /api/loyalty/tiers - Get tier information (public)
// ═══════════════════════════════════════════════════════════════════════════

router.get('/tiers', (req, res) => {
  res.json({
    tiers: Object.entries(TIERS).map(([key, tier]) => ({
      id: key,
      ...tier,
      maxPoints: tier.maxPoints === Infinity ? null : tier.maxPoints,
    })),
    pointsPerDollar: POINTS_PER_DOLLAR,
  });
});

module.exports = router;

// ═══════════════════════════════════════════════════════════════════════════
// DATABASE SCHEMA (for reference - add to migrations)
// ═══════════════════════════════════════════════════════════════════════════
/*
-- Loyalty Accounts
CREATE TABLE loyalty_accounts (
  id SERIAL PRIMARY KEY,
  user_id INTEGER UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  points_balance INTEGER DEFAULT 0,
  lifetime_points INTEGER DEFAULT 0,
  tier VARCHAR(20) DEFAULT 'STARTER',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Loyalty Transactions
CREATE TABLE loyalty_transactions (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  type VARCHAR(20) NOT NULL, -- 'earn', 'redeem', 'expire', 'adjust'
  points INTEGER NOT NULL,
  source VARCHAR(50), -- 'purchase', 'review', 'referral', 'reward', etc.
  reference_id VARCHAR(100), -- order_id, reward_id, etc.
  description TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_loyalty_accounts_user ON loyalty_accounts(user_id);
CREATE INDEX idx_loyalty_transactions_user ON loyalty_transactions(user_id);
CREATE INDEX idx_loyalty_transactions_created ON loyalty_transactions(created_at DESC);
*/

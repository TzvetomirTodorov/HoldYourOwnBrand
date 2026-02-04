/**
 * Test Setup for HYOW Backend (Jest + CommonJS)
 * 
 * Provides:
 * - Database mocking utilities
 * - Test user/auth helpers
 * - Common test fixtures
 * 
 * Note: Uses Jest (not Vitest!) with CommonJS syntax
 */

const jwt = require('jsonwebtoken');

// ═══════════════════════════════════════════════════════════════════════════
// TEST FIXTURES
// ═══════════════════════════════════════════════════════════════════════════

const testUser = {
  id: 1,
  email: 'test@hyow.com',
  first_name: 'Test',
  last_name: 'User',
  role: 'customer',
  created_at: new Date().toISOString(),
};

const testAdmin = {
  id: 2,
  email: 'admin@hyow.com',
  first_name: 'Admin',
  last_name: 'User',
  role: 'admin',
  created_at: new Date().toISOString(),
};

const testProduct = {
  id: 1,
  name: 'HYOW Classic Tee',
  slug: 'hyow-classic-tee',
  description: 'Premium cotton streetwear tee',
  price: '49.99',
  image_url: 'https://example.com/tee.jpg',
  category_id: 1,
  is_active: true,
  created_at: new Date().toISOString(),
};

const testVariant = {
  id: 1,
  product_id: 1,
  size: 'M',
  color: 'Black',
  sku: 'HYOW-TEE-BLK-M',
  quantity: 100,
  created_at: new Date().toISOString(),
};

const testCartItem = {
  id: 1,
  cart_id: 1,
  variant_id: 1,
  quantity: 2,
  product_name: 'HYOW Classic Tee',
  price: '49.99',
  size: 'M',
  color: 'Black',
  image_url: 'https://example.com/tee.jpg',
};

// ═══════════════════════════════════════════════════════════════════════════
// DATABASE MOCK
// ═══════════════════════════════════════════════════════════════════════════

// Create a mock database object with jest.fn()
const mockDb = {
  query: jest.fn(),
  pool: {
    connect: jest.fn().mockResolvedValue({
      query: jest.fn(),
      release: jest.fn(),
    }),
    end: jest.fn(),
  },
};

// ═══════════════════════════════════════════════════════════════════════════
// AUTH HELPERS
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Generate a valid JWT access token for testing
 */
function generateTestToken(user) {
  user = user || testUser;
  return jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    process.env.JWT_SECRET || 'test-secret-key-for-testing',
    { expiresIn: '1h' }
  );
}

/**
 * Generate a refresh token for testing
 */
function generateRefreshToken(user) {
  user = user || testUser;
  return jwt.sign(
    { id: user.id, type: 'refresh' },
    process.env.JWT_REFRESH_SECRET || 'test-refresh-secret-for-testing',
    { expiresIn: '7d' }
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// DATABASE MOCK HELPERS
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Mock a successful database query
 */
function mockDbQuery(rows, rowCount) {
  rowCount = rowCount !== undefined ? rowCount : rows.length;
  mockDb.query.mockResolvedValueOnce({
    rows: rows,
    rowCount: rowCount,
  });
}

/**
 * Mock a database error
 */
function mockDbError(message) {
  message = message || 'Database error';
  mockDb.query.mockRejectedValueOnce(new Error(message));
}

/**
 * Mock multiple sequential database queries
 */
function mockDbSequence(results) {
  results.forEach(function(result) {
    if (result.error) {
      mockDb.query.mockRejectedValueOnce(new Error(result.error));
    } else {
      mockDb.query.mockResolvedValueOnce({
        rows: result.rows || [],
        rowCount: result.rowCount !== undefined ? result.rowCount : (result.rows ? result.rows.length : 0),
      });
    }
  });
}

/**
 * Reset all database mocks
 */
function resetDbMocks() {
  mockDb.query.mockReset();
}

// ═══════════════════════════════════════════════════════════════════════════
// EXPORTS (CommonJS)
// ═══════════════════════════════════════════════════════════════════════════

module.exports = {
  // Test fixtures
  testUser: testUser,
  testAdmin: testAdmin,
  testProduct: testProduct,
  testVariant: testVariant,
  testCartItem: testCartItem,
  
  // Auth helpers
  generateTestToken: generateTestToken,
  generateRefreshToken: generateRefreshToken,
  
  // Database helpers
  mockDb: mockDb,
  mockDbQuery: mockDbQuery,
  mockDbError: mockDbError,
  mockDbSequence: mockDbSequence,
  resetDbMocks: resetDbMocks,
};

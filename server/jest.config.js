/**
 * Jest Configuration for HYOW Backend
 * 
 * Configures Jest for testing Express.js API routes with:
 * - Node environment for backend testing
 * - Coverage reporting targeting 80%+ coverage
 * - Test isolation with setup/teardown hooks
 */

module.exports = {
  // Use Node environment for backend testing
  testEnvironment: 'node',
  
  // Test file patterns
  testMatch: [
    '**/tests/**/*.test.js',
    '**/__tests__/**/*.test.js',
  ],
  
  // Ignore patterns
  testPathIgnorePatterns: [
    '/node_modules/',
  ],
  
  // Setup file for database mocking and test utilities
  setupFilesAfterEnv: ['<rootDir>/tests/setup.js'],
  
  // Coverage configuration
  collectCoverageFrom: [
    'src/**/*.js',
    '!src/index.js', // Entry point
    '!src/config/**', // Config files
  ],
  
  // Coverage thresholds - industry standard for e-commerce
  coverageThreshold: {
    global: {
      branches: 70,
      functions: 80,
      lines: 80,
      statements: 80,
    },
    // Stricter thresholds for critical paths
    './src/routes/checkout.js': {
      branches: 90,
      functions: 95,
      lines: 95,
      statements: 95,
    },
    './src/routes/auth.js': {
      branches: 85,
      functions: 90,
      lines: 90,
      statements: 90,
    },
  },
  
  // Timeout for async operations
  testTimeout: 10000,
  
  // Verbose output
  verbose: true,
  
  // Clear mocks between tests
  clearMocks: true,
  
  // Restore mocks after each test
  restoreMocks: true,
};

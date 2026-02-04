/**
 * Auth Tests (Jest + CommonJS)
 * 
 * Unit tests for authentication helpers and token generation.
 * These tests don't require the full Express app.
 */

const jwt = require('jsonwebtoken');
var setup = require('./setup');

var testUser = setup.testUser;
var testAdmin = setup.testAdmin;
var generateTestToken = setup.generateTestToken;
var generateRefreshToken = setup.generateRefreshToken;
var mockDbQuery = setup.mockDbQuery;
var mockDbError = setup.mockDbError;
var mockDb = setup.mockDb;
var resetDbMocks = setup.resetDbMocks;

describe('Auth Utilities', function() {
  beforeEach(function() {
    jest.clearAllMocks();
    resetDbMocks();
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // Token Generation Tests
  // ═══════════════════════════════════════════════════════════════════════════
  
  describe('generateTestToken', function() {
    test('should create valid JWT with user data', function() {
      var token = generateTestToken(testUser);
      expect(token).toBeTruthy();
      expect(typeof token).toBe('string');
      
      var decoded = jwt.verify(token, process.env.JWT_SECRET || 'test-secret-key-for-testing');
      expect(decoded.id).toBe(testUser.id);
      expect(decoded.email).toBe(testUser.email);
      expect(decoded.role).toBe(testUser.role);
    });

    test('should create token for admin user', function() {
      var token = generateTestToken(testAdmin);
      
      var decoded = jwt.verify(token, process.env.JWT_SECRET || 'test-secret-key-for-testing');
      expect(decoded.role).toBe('admin');
    });

    test('should create token with expiration', function() {
      var token = generateTestToken(testUser);
      var decoded = jwt.verify(token, process.env.JWT_SECRET || 'test-secret-key-for-testing');
      
      expect(decoded.exp).toBeDefined();
      expect(decoded.exp).toBeGreaterThan(Math.floor(Date.now() / 1000));
    });
  });

  describe('generateRefreshToken', function() {
    test('should create valid refresh JWT', function() {
      var token = generateRefreshToken(testUser);
      expect(token).toBeTruthy();
      
      var decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET || 'test-refresh-secret-for-testing');
      expect(decoded.id).toBe(testUser.id);
      expect(decoded.type).toBe('refresh');
    });

    test('should have longer expiration than access token', function() {
      var accessToken = generateTestToken(testUser);
      var refreshToken = generateRefreshToken(testUser);
      
      var accessDecoded = jwt.verify(accessToken, process.env.JWT_SECRET || 'test-secret-key-for-testing');
      var refreshDecoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET || 'test-refresh-secret-for-testing');
      
      expect(refreshDecoded.exp).toBeGreaterThan(accessDecoded.exp);
    });
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // Test Fixtures
  // ═══════════════════════════════════════════════════════════════════════════
  
  describe('Test Fixtures', function() {
    test('testUser should have required fields', function() {
      expect(testUser.id).toBeDefined();
      expect(testUser.email).toBeDefined();
      expect(testUser.role).toBe('customer');
    });

    test('testAdmin should have admin role', function() {
      expect(testAdmin.role).toBe('admin');
    });
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // Database Mock Tests
  // ═══════════════════════════════════════════════════════════════════════════
  
  describe('Database Mocks', function() {
    test('mockDbQuery should set up resolved value', function() {
      mockDbQuery([{ id: 1, name: 'Test' }]);
      
      return mockDb.query('SELECT * FROM test').then(function(result) {
        expect(result.rows).toEqual([{ id: 1, name: 'Test' }]);
        expect(result.rowCount).toBe(1);
      });
    });

    test('mockDbQuery should handle empty results', function() {
      mockDbQuery([]);
      
      return mockDb.query('SELECT * FROM test').then(function(result) {
        expect(result.rows).toEqual([]);
        expect(result.rowCount).toBe(0);
      });
    });

    test('mockDbQuery should handle custom rowCount', function() {
      mockDbQuery([{ id: 1 }], 5);
      
      return mockDb.query('UPDATE test SET x = 1').then(function(result) {
        expect(result.rowCount).toBe(5);
      });
    });

    test('mockDbError should set up rejected value', function() {
      mockDbError('Connection failed');
      
      return expect(mockDb.query('SELECT * FROM test')).rejects.toThrow('Connection failed');
    });

    test('resetDbMocks should clear all mocks', function() {
      mockDbQuery([{ id: 1 }]);
      resetDbMocks();
      
      expect(mockDb.query.mock.calls.length).toBe(0);
    });
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // Password Validation Tests
  // ═══════════════════════════════════════════════════════════════════════════
  
  describe('Password Validation Helpers', function() {
    function isValidPassword(password) {
      // Minimum 8 characters, at least one number, one letter
      return password.length >= 8 && 
             /[a-zA-Z]/.test(password) && 
             /[0-9]/.test(password);
    }

    test('should accept valid password', function() {
      expect(isValidPassword('SecurePass123')).toBe(true);
    });

    test('should reject short password', function() {
      expect(isValidPassword('Pass1')).toBe(false);
    });

    test('should reject password without numbers', function() {
      expect(isValidPassword('SecurePassword')).toBe(false);
    });

    test('should reject password without letters', function() {
      expect(isValidPassword('12345678')).toBe(false);
    });
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // Email Validation Tests
  // ═══════════════════════════════════════════════════════════════════════════
  
  describe('Email Validation Helpers', function() {
    function isValidEmail(email) {
      return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    }

    test('should accept valid email', function() {
      expect(isValidEmail('test@hyow.com')).toBe(true);
    });

    test('should accept email with subdomain', function() {
      expect(isValidEmail('test@mail.hyow.com')).toBe(true);
    });

    test('should reject email without @', function() {
      expect(isValidEmail('testhyow.com')).toBe(false);
    });

    test('should reject email without domain', function() {
      expect(isValidEmail('test@')).toBe(false);
    });

    test('should reject email with spaces', function() {
      expect(isValidEmail('test @hyow.com')).toBe(false);
    });
  });
});

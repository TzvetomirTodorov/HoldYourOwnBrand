/**
 * Database Configuration
 * 
 * This file sets up the PostgreSQL connection pool using the pg library.
 * We use a connection pool rather than individual connections because pools
 * efficiently manage multiple database connections, reusing them across requests
 * rather than creating new connections each time (which is slow and resource-intensive).
 */

const { Pool } = require('pg');

// Create a new pool instance using the DATABASE_URL from environment variables.
// Railway provides this URL automatically when you provision a PostgreSQL database.
// The URL format is: postgresql://username:password@host:port/database
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  // In production with Railway, we need SSL but don't want to verify the certificate
  // since Railway uses self-signed certificates
  ssl: process.env.NODE_ENV === 'production' 
    ? { rejectUnauthorized: false } 
    : false
});

// Log when we successfully connect (helpful for debugging deployment issues)
pool.on('connect', () => {
  console.log('📦 Database connected successfully');
});

// Log any errors that occur with idle clients in the pool
pool.on('error', (err) => {
  console.error('❌ Unexpected database error:', err);
  process.exit(-1);
});

/**
 * Query helper function
 * 
 * This wraps pool.query to provide a consistent interface and
 * makes it easy to add logging or error handling in one place.
 * 
 * @param {string} text - SQL query string
 * @param {Array} params - Query parameters (for parameterized queries)
 * @returns {Promise} - Query result
 */
const query = (text, params) => {
  return pool.query(text, params);
};

/**
 * Get a client from the pool for transactions
 * 
 * When you need to run multiple queries as a single transaction
 * (all succeed or all fail), you need to use the same client.
 * 
 * @returns {Promise<Client>} - A database client
 */
const getClient = () => {
  return pool.connect();
};

module.exports = {
  query,
  getClient,
  pool
};

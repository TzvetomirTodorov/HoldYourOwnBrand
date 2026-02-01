/**
 * Database Migration Runner
 * 
 * This script handles database migrations - the process of creating and updating
 * database tables in a controlled, versioned way. Migrations let us track changes
 * to the database schema over time and apply them consistently across environments.
 * 
 * Usage:
 *   npm run migrate          - Run all pending migrations
 *   npm run migrate:down     - Rollback the last migration
 */

require('dotenv').config();
const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

// Create a database connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

/**
 * Run all migrations
 */
async function migrate() {
  const client = await pool.connect();
  
  try {
    console.log('🚀 Starting database migration...\n');

    // Create migrations tracking table if it doesn't exist
    // This table keeps track of which migrations have been run
    await client.query(`
      CREATE TABLE IF NOT EXISTS migrations (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL UNIQUE,
        executed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )
    `);

    // Get list of already executed migrations
    const executedResult = await client.query('SELECT name FROM migrations ORDER BY id');
    const executedMigrations = new Set(executedResult.rows.map(row => row.name));

    // Get all migration files
    const migrationsDir = path.join(__dirname, 'migrations');
    const migrationFiles = fs.readdirSync(migrationsDir)
      .filter(f => f.endsWith('.sql'))
      .sort(); // Ensures they run in order (001_, 002_, etc.)

    // Run each pending migration
    for (const file of migrationFiles) {
      if (executedMigrations.has(file)) {
        console.log(`⏭️  Skipping ${file} (already executed)`);
        continue;
      }

      console.log(`📦 Running migration: ${file}`);
      
      const sql = fs.readFileSync(path.join(migrationsDir, file), 'utf8');
      
      // Run migration in a transaction
      await client.query('BEGIN');
      try {
        await client.query(sql);
        await client.query('INSERT INTO migrations (name) VALUES ($1)', [file]);
        await client.query('COMMIT');
        console.log(`✅ Completed: ${file}\n`);
      } catch (error) {
        await client.query('ROLLBACK');
        throw error;
      }
    }

    console.log('🎉 All migrations completed successfully!');
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    console.error(error.stack);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

/**
 * Rollback the last migration
 */
async function rollback() {
  const client = await pool.connect();
  
  try {
    console.log('🔄 Rolling back last migration...\n');

    // Get the last executed migration
    const result = await client.query(
      'SELECT name FROM migrations ORDER BY id DESC LIMIT 1'
    );

    if (result.rows.length === 0) {
      console.log('No migrations to rollback.');
      return;
    }

    const migrationName = result.rows[0].name;
    const downFile = migrationName.replace('.sql', '.down.sql');
    const downPath = path.join(__dirname, 'migrations', downFile);

    if (!fs.existsSync(downPath)) {
      console.log(`⚠️  No rollback file found for ${migrationName}`);
      console.log(`   Expected: ${downFile}`);
      return;
    }

    console.log(`📦 Rolling back: ${migrationName}`);
    
    const sql = fs.readFileSync(downPath, 'utf8');
    
    await client.query('BEGIN');
    try {
      await client.query(sql);
      await client.query('DELETE FROM migrations WHERE name = $1', [migrationName]);
      await client.query('COMMIT');
      console.log(`✅ Rolled back: ${migrationName}`);
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    }
  } catch (error) {
    console.error('❌ Rollback failed:', error.message);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

// Run the appropriate command
const command = process.argv[2];
if (command === 'down') {
  rollback();
} else {
  migrate();
}

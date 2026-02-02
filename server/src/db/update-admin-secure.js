/**
 * HYOW Admin Password Security Update Script
 * 
 * This script updates the admin user's password to a secure value.
 * Following the PawsTrack security pattern: [BRAND]#Adm1n$[YEAR]!Secure
 * 
 * New Password: HYOW#Adm1n$2025!Secure
 * 
 * Usage:
 *   cd ~/OneDrive/Documents/PersonalProjects/HoldYourOwnBrand/server
 *   DATABASE_URL="your_connection_string" node src/db/update-admin-secure.js
 * 
 * Or with Railway:
 *   railway run node src/db/update-admin-secure.js
 */

const bcrypt = require('bcryptjs');
const { Pool } = require('pg');

// ============================================================================
// SECURE PASSWORD CONFIGURATION
// ============================================================================

// Following PawsTrack pattern: [BRAND]#Adm1n$[YEAR]!Secure
const SECURE_PASSWORD = 'HYOW#Adm1n$2025!Secure';

// Admin email to update
const ADMIN_EMAIL = 'tzvtdr@gmail.com';

// bcrypt cost factor (12 is secure and performant)
const BCRYPT_ROUNDS = 12;

// ============================================================================
// DATABASE CONNECTION
// ============================================================================

// Get connection string from environment
const connectionString = process.env.DATABASE_URL || process.env.DATABASE_PUBLIC_URL;

if (!connectionString) {
  console.error('❌ Error: No DATABASE_URL provided');
  console.error('');
  console.error('Run with:');
  console.error('  railway run node src/db/update-admin-secure.js');
  console.error('');
  console.error('Or set DATABASE_URL manually:');
  console.error('  DATABASE_URL="postgresql://..." node src/db/update-admin-secure.js');
  process.exit(1);
}

const pool = new Pool({
  connectionString,
  ssl: connectionString.includes('railway') 
    ? { rejectUnauthorized: false } 
    : false,
});

// ============================================================================
// MAIN FUNCTION
// ============================================================================

async function updateAdminPassword() {
  console.log('');
  console.log('═'.repeat(60));
  console.log('  HYOW Admin Password Security Update');
  console.log('═'.repeat(60));
  console.log('');

  try {
    // Step 1: Generate bcrypt hash
    console.log('🔐 Generating secure bcrypt hash...');
    const passwordHash = await bcrypt.hash(SECURE_PASSWORD, BCRYPT_ROUNDS);
    console.log('   ✓ Hash generated');

    // Step 2: Check if admin exists
    console.log('');
    console.log('👤 Looking for admin user...');
    const userCheck = await pool.query(
      'SELECT id, email, first_name, last_name, role FROM users WHERE email = $1',
      [ADMIN_EMAIL]
    );

    if (userCheck.rows.length === 0) {
      console.log(`   ⚠ User ${ADMIN_EMAIL} not found`);
      console.log('');
      console.log('   Creating new admin user...');
      
      // Create the admin user
      const createResult = await pool.query(`
        INSERT INTO users (email, password_hash, first_name, last_name, role, email_verified)
        VALUES ($1, $2, 'Admin', 'HYOW', 'super_admin', true)
        RETURNING id, email, role
      `, [ADMIN_EMAIL, passwordHash]);
      
      console.log('   ✓ Admin user created');
      console.log(`   ID: ${createResult.rows[0].id}`);
    } else {
      const existingUser = userCheck.rows[0];
      console.log(`   ✓ Found: ${existingUser.first_name} ${existingUser.last_name}`);
      console.log(`   Role: ${existingUser.role}`);
      
      // Step 3: Update password
      console.log('');
      console.log('🔄 Updating password...');
      await pool.query(
        'UPDATE users SET password_hash = $1, updated_at = NOW() WHERE email = $2',
        [passwordHash, ADMIN_EMAIL]
      );
      console.log('   ✓ Password updated');
    }

    // Step 4: Verify the new password works
    console.log('');
    console.log('✅ Verifying new password...');
    const verifyUser = await pool.query(
      'SELECT password_hash FROM users WHERE email = $1',
      [ADMIN_EMAIL]
    );
    
    const passwordMatches = await bcrypt.compare(
      SECURE_PASSWORD, 
      verifyUser.rows[0].password_hash
    );
    
    if (passwordMatches) {
      console.log('   ✓ Password verification successful!');
    } else {
      throw new Error('Password verification failed');
    }

    // Success summary
    console.log('');
    console.log('═'.repeat(60));
    console.log('  ✅ Admin Password Updated Successfully!');
    console.log('═'.repeat(60));
    console.log('');
    console.log('  📧 Email:    ', ADMIN_EMAIL);
    console.log('  🔐 Password: ', SECURE_PASSWORD);
    console.log('  👤 Role:      super_admin');
    console.log('');
    console.log('  🌐 Test login at: https://client-phi-tawny.vercel.app/login');
    console.log('');
    console.log('═'.repeat(60));
    console.log('');

  } catch (error) {
    console.error('');
    console.error('❌ Error:', error.message);
    console.error('');
    if (error.stack) {
      console.error('Stack trace:', error.stack);
    }
    process.exit(1);
  } finally {
    await pool.end();
  }
}

// Run the update
updateAdminPassword();

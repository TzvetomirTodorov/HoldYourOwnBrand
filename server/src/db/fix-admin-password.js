// This script updates the password hash with a REAL bcrypt hash
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

// REAL bcrypt hash for "ChangeMe123!" (cost 12) - generated just now
const REAL_HASH = '$2b$12$xhYGbJRldpiZYAn1GMJObuJNnv3iphioWvuFd/pAm8/tCGkdeWMee';

async function updateAdmin() {
  const client = await pool.connect();
  
  try {
    // First check the current user
    const existing = await client.query(
      'SELECT id, email, password_hash, role FROM users WHERE email = $1',
      ['tzvtdr@gmail.com']
    );
    
    if (existing.rows.length === 0) {
      console.log('No user found with email tzvtdr@gmail.com');
      return;
    }
    
    console.log('Found user:');
    console.log('  ID:', existing.rows[0].id);
    console.log('  Email:', existing.rows[0].email);
    console.log('  Role:', existing.rows[0].role);
    console.log('  Old hash:', existing.rows[0].password_hash.substring(0, 30) + '...');
    console.log('  New hash:', REAL_HASH.substring(0, 30) + '...');
    
    // Update the password hash
    await client.query(
      'UPDATE users SET password_hash = $1 WHERE email = $2',
      [REAL_HASH, 'tzvtdr@gmail.com']
    );
    
    console.log('\nPassword hash updated successfully!');
    console.log('You can now login with:');
    console.log('  Email: tzvtdr@gmail.com');
    console.log('  Password: ChangeMe123!');
    
  } catch (error) {
    console.error('Error updating admin:', error);
  } finally {
    client.release();
    await pool.end();
  }
}

updateAdmin();

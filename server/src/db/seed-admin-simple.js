// This script uses only pg - no bcrypt required
// Password hash is pre-computed for "ChangeMe123!" with bcrypt cost 12
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

// Pre-computed bcrypt hash for "ChangeMe123!" (cost 12)
// Generated using: bcrypt.hashSync('ChangeMe123!', 12)
const PRECOMPUTED_HASH = '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/X4.aLLvCmJUiXy2Oq';

async function seedAdmin() {
  const client = await pool.connect();
  
  try {
    const existing = await client.query(
      'SELECT id FROM users WHERE email = $1',
      ['tzvtdr@gmail.com']
    );
    
    if (existing.rows.length > 0) {
      console.log('Admin user already exists');
      return;
    }
    
    await client.query(`
      INSERT INTO users (id, email, password_hash, first_name, last_name, role, email_verified)
      VALUES (gen_random_uuid(), $1, $2, $3, $4, $5, true)
    `, ['tzvtdr@gmail.com', PRECOMPUTED_HASH, 'Tzvetomir', 'Todorov', 'super_admin']);
    
    console.log('Admin user created successfully!');
    console.log('Email: tzvtdr@gmail.com');
    console.log('Password: ChangeMe123!');
    console.log('Role: super_admin');
    
  } catch (error) {
    console.error('Error seeding admin:', error);
  } finally {
    client.release();
    await pool.end();
  }
}

seedAdmin();

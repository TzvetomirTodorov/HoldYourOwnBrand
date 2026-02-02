/**
 * Fix Orders Table Schema
 * Adds missing session_id column to orders table
 */

const { Pool } = require('pg');

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  console.error('❌ DATABASE_URL environment variable is required');
  console.log('\nUsage:');
  console.log('  DATABASE_URL="postgresql://..." node fix-orders-schema.js');
  process.exit(1);
}

const pool = new Pool({
  connectionString: DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function main() {
  console.log('\n═══════════════════════════════════════════════════════════════');
  console.log('  🔧 HYOW Orders Table Schema Fix');
  console.log('═══════════════════════════════════════════════════════════════\n');

  try {
    // First, let's see what columns exist in the orders table
    console.log('📋 Current orders table schema:\n');
    
    const schemaResult = await pool.query(`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns
      WHERE table_name = 'orders'
      ORDER BY ordinal_position
    `);

    if (schemaResult.rows.length === 0) {
      console.log('❌ Orders table does not exist!');
      process.exit(1);
    }

    const existingColumns = schemaResult.rows.map(r => r.column_name);
    
    schemaResult.rows.forEach(col => {
      console.log(`  • ${col.column_name} (${col.data_type}) ${col.is_nullable === 'NO' ? 'NOT NULL' : 'nullable'}`);
    });

    console.log('\n───────────────────────────────────────────────────────────────\n');

    // Check for missing columns and add them
    const columnsToAdd = [];

    if (!existingColumns.includes('session_id')) {
      columnsToAdd.push({
        name: 'session_id',
        sql: 'ALTER TABLE orders ADD COLUMN session_id VARCHAR(255)'
      });
    }

    if (!existingColumns.includes('stripe_payment_intent_id')) {
      columnsToAdd.push({
        name: 'stripe_payment_intent_id',
        sql: 'ALTER TABLE orders ADD COLUMN stripe_payment_intent_id VARCHAR(255)'
      });
    }

    if (!existingColumns.includes('discount_amount')) {
      columnsToAdd.push({
        name: 'discount_amount',
        sql: 'ALTER TABLE orders ADD COLUMN discount_amount DECIMAL(10, 2) DEFAULT 0'
      });
    }

    if (columnsToAdd.length === 0) {
      console.log('✅ All required columns already exist!\n');
    } else {
      console.log(`🔧 Adding ${columnsToAdd.length} missing column(s):\n`);

      for (const col of columnsToAdd) {
        try {
          await pool.query(col.sql);
          console.log(`  ✅ Added: ${col.name}`);
        } catch (err) {
          if (err.code === '42701') {
            console.log(`  ⚠️  ${col.name} already exists (skipped)`);
          } else {
            console.log(`  ❌ Error adding ${col.name}: ${err.message}`);
          }
        }
      }

      console.log('\n───────────────────────────────────────────────────────────────\n');
      console.log('✅ Schema update complete!\n');
    }

    // Also check order_items table
    console.log('📋 Checking order_items table...\n');
    
    const orderItemsSchema = await pool.query(`
      SELECT column_name, data_type
      FROM information_schema.columns
      WHERE table_name = 'order_items'
      ORDER BY ordinal_position
    `);

    if (orderItemsSchema.rows.length === 0) {
      console.log('❌ order_items table does not exist!');
    } else {
      const orderItemsCols = orderItemsSchema.rows.map(r => r.column_name);
      console.log('  Columns:', orderItemsCols.join(', '));
      
      // Check if variant_id exists
      if (!orderItemsCols.includes('variant_id')) {
        console.log('\n  ⚠️  variant_id column missing - adding...');
        try {
          await pool.query('ALTER TABLE order_items ADD COLUMN variant_id INTEGER');
          console.log('  ✅ Added variant_id column');
        } catch (err) {
          if (err.code === '42701') {
            console.log('  ⚠️  variant_id already exists');
          }
        }
      }
    }

  } catch (err) {
    console.error('❌ Error:', err.message);
  } finally {
    await pool.end();
  }

  console.log('\n═══════════════════════════════════════════════════════════════');
  console.log('  🎉 Done!');
  console.log('═══════════════════════════════════════════════════════════════\n');
}

main();

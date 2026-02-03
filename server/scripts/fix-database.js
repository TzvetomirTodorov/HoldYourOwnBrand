/**
 * HYOW Database Fix Script
 * 
 * This script fixes the category issues:
 * 1. Creates all required categories (t-shirts, hoodies, hats, accessories, etc.)
 * 2. Assigns products to categories based on their names
 * 3. Shows summary of what was fixed
 * 
 * RUN VIA RAILWAY CLI:
 *   railway run node server/scripts/fix-database.js
 * 
 * OR set DATABASE_URL environment variable and run locally:
 *   DATABASE_URL="postgresql://..." node server/scripts/fix-database.js
 */

require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_URL?.includes('railway') ? { rejectUnauthorized: false } : false
});

// Categories that need to exist (matching the Header navigation)
const REQUIRED_CATEGORIES = [
  { name: 'T-Shirts', slug: 't-shirts', description: 'Premium streetwear t-shirts' },
  { name: 'Hoodies', slug: 'hoodies', description: 'Luxury hoodies and sweatshirts' },
  { name: 'Hats', slug: 'hats', description: 'Caps, beanies, and headwear' },
  { name: 'Accessories', slug: 'accessories', description: 'Bags, wallets, chains, and more' },
  { name: 'Outerwear', slug: 'outerwear', description: 'Jackets and outerwear' },
  { name: 'Bottoms', slug: 'bottoms', description: 'Pants, shorts, and bottoms' },
];

// Keywords to match products to categories
const CATEGORY_KEYWORDS = {
  't-shirts': ['tee', 't-shirt', 'shirt'],
  'hoodies': ['hoodie', 'sweatshirt', 'pullover', 'crewneck'],
  'hats': ['hat', 'cap', 'beanie', 'snapback', 'fitted'],
  'accessories': ['bag', 'wallet', 'belt', 'chain', 'backpack', 'duffle', 'duffel', 'socks', 'accessory'],
  'outerwear': ['jacket', 'bomber', 'coat', 'windbreaker', 'parka', 'vest'],
  'bottoms': ['pants', 'shorts', 'joggers', 'cargo', 'jeans', 'track pants'],
};

async function fixDatabase() {
  const client = await pool.connect();
  
  try {
    console.log('🔧 HYOW Database Fix Script\n');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    // 1. Check existing categories
    console.log('📂 Step 1: Checking existing categories...\n');
    const existingCats = await client.query('SELECT id, name, slug FROM categories');
    const catMap = {};
    
    existingCats.rows.forEach(c => {
      catMap[c.slug] = c.id;
      console.log(`  Found: ${c.name} (${c.slug})`);
    });
    
    if (existingCats.rows.length === 0) {
      console.log('  No categories found in database!');
    }

    // 2. Create missing categories
    console.log('\n📁 Step 2: Creating missing categories...\n');
    
    for (const cat of REQUIRED_CATEGORIES) {
      if (!catMap[cat.slug]) {
        const result = await client.query(
          `INSERT INTO categories (name, slug, description, sort_order, is_active)
           VALUES ($1, $2, $3, $4, true)
           ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name
           RETURNING id`,
          [cat.name, cat.slug, cat.description, REQUIRED_CATEGORIES.indexOf(cat)]
        );
        catMap[cat.slug] = result.rows[0].id;
        console.log(`  ✅ Created: ${cat.name} (${cat.slug})`);
      } else {
        console.log(`  ⏭️  Exists: ${cat.name} (${cat.slug})`);
      }
    }

    // 3. Get all products and assign categories
    console.log('\n📦 Step 3: Assigning products to categories...\n');
    
    const productsResult = await client.query(`
      SELECT p.id, p.name, p.slug, c.slug as category_slug
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      ORDER BY p.name
    `);
    
    let assignedCount = 0;
    let alreadyAssigned = 0;
    let unmatched = [];

    for (const product of productsResult.rows) {
      const productName = product.name.toLowerCase();
      let matchedCategory = null;

      // Try to match product to category based on keywords
      for (const [catSlug, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
        if (keywords.some(keyword => productName.includes(keyword))) {
          matchedCategory = catSlug;
          break;
        }
      }

      if (matchedCategory) {
        if (product.category_slug !== matchedCategory) {
          await client.query(
            'UPDATE products SET category_id = $1 WHERE id = $2',
            [catMap[matchedCategory], product.id]
          );
          console.log(`  ✅ ${product.name} → ${matchedCategory}`);
          assignedCount++;
        } else {
          alreadyAssigned++;
        }
      } else {
        unmatched.push(product.name);
      }
    }

    // 4. Summary
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    console.log('📊 Summary:\n');
    console.log(`  Categories created/verified: ${REQUIRED_CATEGORIES.length}`);
    console.log(`  Products assigned to categories: ${assignedCount}`);
    console.log(`  Products already assigned: ${alreadyAssigned}`);
    
    if (unmatched.length > 0) {
      console.log(`\n  ⚠️  ${unmatched.length} products couldn't be auto-assigned:`);
      unmatched.forEach(name => console.log(`     - ${name}`));
    }

    // 5. Final category counts
    console.log('\n📈 Final category counts:\n');
    const counts = await client.query(`
      SELECT 
        c.name, 
        c.slug,
        COUNT(p.id) as product_count
      FROM categories c
      LEFT JOIN products p ON p.category_id = c.id AND p.status = 'active'
      GROUP BY c.id, c.name, c.slug
      ORDER BY c.sort_order
    `);
    
    counts.rows.forEach(row => {
      console.log(`  ${row.name}: ${row.product_count} products`);
    });

    console.log('\n✅ Database fix complete!\n');

  } catch (error) {
    console.error('❌ Error:', error.message);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

fixDatabase().catch(console.error);

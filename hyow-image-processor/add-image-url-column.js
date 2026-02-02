/**
 * HYOW Image URL Column Fix
 * 
 * This script:
 * 1. Adds the image_url column to the products table (if missing)
 * 2. Updates all 30 products with their Cloudinary URLs
 * 
 * Usage:
 *   DATABASE_URL=$(railway run --service Postgres printenv DATABASE_PUBLIC_URL) node add-image-url-column.js
 */

require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

// Cloudinary base URL
const CLOUDINARY_BASE = 'https://res.cloudinary.com/holdyourownbrand/image/upload/hyow-products';

// All 30 products with their slugs
const productImageUrls = {
  // Tees (7)
  'red-flag-tee': `${CLOUDINARY_BASE}/red-flag-tee.jpg`,
  'five-star-general-tee': `${CLOUDINARY_BASE}/five-star-general-tee.jpg`,
  'from-the-block-tee': `${CLOUDINARY_BASE}/from-the-block-tee.jpg`,
  'money-talk-tee': `${CLOUDINARY_BASE}/money-talk-tee.jpg`,
  'street-dreams-tee': `${CLOUDINARY_BASE}/street-dreams-tee.jpg`,
  'boss-up-tee': `${CLOUDINARY_BASE}/boss-up-tee.jpg`,
  'legacy-tee': `${CLOUDINARY_BASE}/legacy-tee.jpg`,
  
  // Hoodies (5)
  'crown-heavyweight-hoodie': `${CLOUDINARY_BASE}/crown-heavyweight-hoodie.jpg`,
  'street-king-hoodie': `${CLOUDINARY_BASE}/street-king-hoodie.jpg`,
  'grind-mode-hoodie': `${CLOUDINARY_BASE}/grind-mode-hoodie.jpg`,
  'empire-zip-hoodie': `${CLOUDINARY_BASE}/empire-zip-hoodie.jpg`,
  'visionary-pullover': `${CLOUDINARY_BASE}/visionary-pullover.jpg`,
  
  // Hats (4)
  'crown-snapback': `${CLOUDINARY_BASE}/crown-snapback.jpg`,
  'street-fitted': `${CLOUDINARY_BASE}/street-fitted.jpg`,
  'boss-beanie': `${CLOUDINARY_BASE}/boss-beanie.jpg`,
  'vintage-dad-hat': `${CLOUDINARY_BASE}/vintage-dad-hat.jpg`,
  
  // Outerwear (4)
  'empire-bomber-jacket': `${CLOUDINARY_BASE}/empire-bomber-jacket.jpg`,
  'street-legend-denim': `${CLOUDINARY_BASE}/street-legend-denim.jpg`,
  'reign-coach-jacket': `${CLOUDINARY_BASE}/reign-coach-jacket.jpg`,
  'apex-leather-jacket': `${CLOUDINARY_BASE}/apex-leather-jacket.jpg`,
  
  // Bottoms (4)
  'executive-track-pants': `${CLOUDINARY_BASE}/executive-track-pants.jpg`,
  'street-cargo-pants': `${CLOUDINARY_BASE}/street-cargo-pants.jpg`,
  'boss-denim': `${CLOUDINARY_BASE}/boss-denim.jpg`,
  'legacy-shorts': `${CLOUDINARY_BASE}/legacy-shorts.jpg`,
  
  // Accessories (6)
  'crown-chain': `${CLOUDINARY_BASE}/crown-chain.jpg`,
  'street-duffle': `${CLOUDINARY_BASE}/street-duffle.jpg`,
  'boss-belt': `${CLOUDINARY_BASE}/boss-belt.jpg`,
  'money-clip-wallet': `${CLOUDINARY_BASE}/money-clip-wallet.jpg`,
  'empire-backpack': `${CLOUDINARY_BASE}/empire-backpack.jpg`,
  'street-socks-3pack': `${CLOUDINARY_BASE}/street-socks-3pack.jpg`,
};

async function fixImageUrls() {
  const client = await pool.connect();
  
  console.log('\n═══════════════════════════════════════════════════════════════');
  console.log('  🔧 HYOW Image URL Column Fix');
  console.log('═══════════════════════════════════════════════════════════════\n');
  
  try {
    // Step 1: Check if image_url column exists
    const columnCheck = await client.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'products' AND column_name = 'image_url'
    `);
    
    if (columnCheck.rows.length === 0) {
      console.log('📦 Adding image_url column to products table...');
      await client.query(`
        ALTER TABLE products 
        ADD COLUMN image_url TEXT
      `);
      console.log('✅ Column added successfully!\n');
    } else {
      console.log('✅ image_url column already exists\n');
    }
    
    // Step 2: Update all products with their Cloudinary URLs
    console.log('🖼️  Updating product images...\n');
    
    let updated = 0;
    let failed = 0;
    const failedSlugs = [];
    
    for (const [slug, imageUrl] of Object.entries(productImageUrls)) {
      try {
        const result = await client.query(
          'UPDATE products SET image_url = $1 WHERE slug = $2 RETURNING id, name',
          [imageUrl, slug]
        );
        
        if (result.rowCount > 0) {
          console.log(`  ✅ ${result.rows[0].name}`);
          updated++;
        } else {
          console.log(`  ⚠️  ${slug}: Product not found in database`);
          failedSlugs.push(slug);
          failed++;
        }
      } catch (err) {
        console.log(`  ❌ ${slug}: ${err.message}`);
        failedSlugs.push(slug);
        failed++;
      }
    }
    
    // Step 3: Results summary
    console.log('\n═══════════════════════════════════════════════════════════════');
    console.log('  📊 RESULTS');
    console.log('═══════════════════════════════════════════════════════════════\n');
    
    console.log(`✅ Updated: ${updated} products`);
    if (failed > 0) {
      console.log(`❌ Failed:  ${failed} products`);
      console.log('\nFailed slugs:');
      failedSlugs.forEach(s => console.log(`  - ${s}`));
    }
    
    // Step 4: Verify by fetching a sample
    console.log('\n📋 Sample verification:');
    const sample = await client.query(`
      SELECT name, slug, image_url 
      FROM products 
      WHERE image_url IS NOT NULL 
      LIMIT 3
    `);
    
    sample.rows.forEach(row => {
      console.log(`  • ${row.name}`);
      console.log(`    ${row.image_url}\n`);
    });
    
    console.log('═══════════════════════════════════════════════════════════════');
    console.log('  ✅ COMPLETE! Refresh your site to see the images.');
    console.log('═══════════════════════════════════════════════════════════════');
    console.log('\n🌐 Frontend: https://client-phi-tawny.vercel.app\n');
    
  } catch (err) {
    console.error('❌ Error:', err.message);
  } finally {
    client.release();
    await pool.end();
  }
}

fixImageUrls();

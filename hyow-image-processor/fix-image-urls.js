/**
 * HYOW Image URL Fix Script
 * 
 * This script updates the products table with Cloudinary URLs
 * for all 30 products that were uploaded.
 * 
 * Usage:
 *   DATABASE_URL=$(railway run --service Postgres printenv DATABASE_PUBLIC_URL) node fix-image-urls.js
 */

const { Pool } = require('pg');

// Cloudinary base URL for HYOW products
const CLOUDINARY_BASE = 'https://res.cloudinary.com/holdyourownbrand/image/upload/hyow-products';

// All product slugs and their Cloudinary image URLs
const productImages = [
  // Hats
  { slug: 'crown-snapback', url: `${CLOUDINARY_BASE}/crown-snapback` },
  { slug: 'street-fitted', url: `${CLOUDINARY_BASE}/street-fitted` },
  { slug: 'boss-beanie', url: `${CLOUDINARY_BASE}/boss-beanie` },
  { slug: 'vintage-dad-hat', url: `${CLOUDINARY_BASE}/vintage-dad-hat` },
  
  // Outerwear
  { slug: 'empire-bomber-jacket', url: `${CLOUDINARY_BASE}/empire-bomber-jacket` },
  { slug: 'street-legend-denim', url: `${CLOUDINARY_BASE}/street-legend-denim` },
  { slug: 'reign-coach-jacket', url: `${CLOUDINARY_BASE}/reign-coach-jacket` },
  { slug: 'apex-leather-jacket', url: `${CLOUDINARY_BASE}/apex-leather-jacket` },
  
  // Bottoms
  { slug: 'executive-track-pants', url: `${CLOUDINARY_BASE}/executive-track-pants` },
  { slug: 'street-cargo-pants', url: `${CLOUDINARY_BASE}/street-cargo-pants` },
  { slug: 'boss-denim', url: `${CLOUDINARY_BASE}/boss-denim` },
  { slug: 'legacy-shorts', url: `${CLOUDINARY_BASE}/legacy-shorts` },
  
  // Accessories
  { slug: 'crown-chain', url: `${CLOUDINARY_BASE}/crown-chain` },
  { slug: 'street-duffle', url: `${CLOUDINARY_BASE}/street-duffle` },
  { slug: 'money-clip-wallet', url: `${CLOUDINARY_BASE}/money-clip-wallet` },
  { slug: 'empire-backpack', url: `${CLOUDINARY_BASE}/empire-backpack` },
  { slug: 'boss-belt', url: `${CLOUDINARY_BASE}/boss-belt` },
  { slug: 'street-socks-3pack', url: `${CLOUDINARY_BASE}/street-socks-3pack` },
  
  // Tees
  { slug: 'red-flag-tee', url: `${CLOUDINARY_BASE}/red-flag-tee` },
  { slug: 'five-star-general-tee', url: `${CLOUDINARY_BASE}/five-star-general-tee` },
  { slug: 'from-the-block-tee', url: `${CLOUDINARY_BASE}/from-the-block-tee` },
  { slug: 'money-talk-tee', url: `${CLOUDINARY_BASE}/money-talk-tee` },
  { slug: 'street-dreams-tee', url: `${CLOUDINARY_BASE}/street-dreams-tee` },
  { slug: 'boss-up-tee', url: `${CLOUDINARY_BASE}/boss-up-tee` },
  { slug: 'legacy-tee', url: `${CLOUDINARY_BASE}/legacy-tee` },
  
  // Hoodies
  { slug: 'crown-heavyweight-hoodie', url: `${CLOUDINARY_BASE}/crown-heavyweight-hoodie` },
  { slug: 'street-king-hoodie', url: `${CLOUDINARY_BASE}/street-king-hoodie` },
  { slug: 'grind-mode-hoodie', url: `${CLOUDINARY_BASE}/grind-mode-hoodie` },
  { slug: 'empire-zip-hoodie', url: `${CLOUDINARY_BASE}/empire-zip-hoodie` },
  { slug: 'visionary-pullover', url: `${CLOUDINARY_BASE}/visionary-pullover` },
];

async function fixImageUrls() {
  console.log('\n═══════════════════════════════════════════════════════════════');
  console.log('  🔧 HYOW Image URL Fix Script');
  console.log('═══════════════════════════════════════════════════════════════\n');

  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });

  const client = await pool.connect();
  
  let success = 0;
  let failed = 0;
  const failures = [];

  try {
    // First, check what column exists
    const schemaCheck = await client.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'products' 
      AND column_name IN ('image_url', 'imageurl', 'image')
    `);
    
    let imageColumn = 'image_url'; // default
    if (schemaCheck.rows.length > 0) {
      imageColumn = schemaCheck.rows[0].column_name;
    }
    
    console.log(`📋 Using column: products.${imageColumn}\n`);
    console.log('Updating product images...\n');

    for (const product of productImages) {
      try {
        const result = await client.query(
          `UPDATE products SET ${imageColumn} = $1 WHERE slug = $2 RETURNING id, name`,
          [product.url, product.slug]
        );
        
        if (result.rows.length > 0) {
          console.log(`  ✅ ${result.rows[0].name}`);
          success++;
        } else {
          console.log(`  ⚠️  No product found with slug: ${product.slug}`);
          failures.push(product.slug);
          failed++;
        }
      } catch (err) {
        console.log(`  ❌ ${product.slug}: ${err.message}`);
        failures.push(product.slug);
        failed++;
      }
    }

    console.log('\n═══════════════════════════════════════════════════════════════');
    console.log('  📊 RESULTS');
    console.log('═══════════════════════════════════════════════════════════════\n');
    console.log(`✅ Updated: ${success} products`);
    console.log(`❌ Failed:  ${failed} products`);
    
    if (failures.length > 0) {
      console.log('\nFailed slugs:');
      failures.forEach(f => console.log(`  - ${f}`));
    }

    console.log('\n🎉 Done! Refresh your site to see the images.');
    console.log('   Frontend: https://client-phi-tawny.vercel.app\n');

  } finally {
    client.release();
    await pool.end();
  }
}

fixImageUrls().catch(err => {
  console.error('❌ Error:', err.message);
  process.exit(1);
});

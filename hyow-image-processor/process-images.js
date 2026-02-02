/**
 * HYOW E-Commerce - Automated Image Processor v2.0
 * 
 * This script performs three key operations:
 * 1. Crops individual product images from composite grid images
 * 2. Uploads cropped images to Cloudinary
 * 3. Updates the PostgreSQL database with the new image URLs
 * 
 * SETUP INSTRUCTIONS:
 * ==================
 * 1. Copy this file to your HoldYourOwnBrand project root
 * 2. Save the grid composite image as 'product-grid.jpg' in the same folder
 * 3. Save the tees/hoodies composite as 'tees-hoodies-composite.jpg'
 * 4. Save individual images (if you have them) with the names in INDIVIDUAL_IMAGES
 * 5. Run: npm install sharp cloudinary pg
 * 6. Run: DATABASE_URL=$(railway run --service Postgres printenv DATABASE_PUBLIC_URL) node process-images.js
 */

const sharp = require('sharp');
const cloudinary = require('cloudinary').v2;
const { Pool } = require('pg');
const path = require('path');
const fs = require('fs').promises;

// ============================================================================
// CLOUDINARY CONFIGURATION (Your credentials from Railway)
// ============================================================================

cloudinary.config({
  cloud_name: 'holdyourownbrand',
  api_key: '671616582416353',
  api_secret: '3-bvNxzdqgg5DCP3otBwjJDISYQ'
});

// ============================================================================
// DATABASE CONNECTION
// ============================================================================

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

// Output directory for cropped images (temporary storage before upload)
const OUTPUT_DIR = './cropped-products';

// ============================================================================
// CROP DEFINITIONS FOR THE GRID COMPOSITE (784x1168 pixels)
// ============================================================================
// 
// The image layout is:
// Row 1 (y: 0-220): 4 Hats
// Row 2 (y: 220-515): 4 Outerwear items
// Row 3 (y: 515-810): 4 Bottoms
// Row 4 (y: 810-1000): 5 Accessories (smaller items)

const GRID_PRODUCTS = [
  // ROW 1: HATS
  { slug: 'crown-snapback', name: 'Crown Snapback', x: 0, y: 0, w: 196, h: 218 },
  { slug: 'street-fitted', name: 'Street Fitted', x: 196, y: 0, w: 196, h: 218 },
  { slug: 'boss-beanie', name: 'Boss Beanie', x: 392, y: 0, w: 196, h: 218 },
  { slug: 'vintage-dad-hat', name: 'Vintage Dad Hat', x: 588, y: 0, w: 196, h: 218 },
  
  // ROW 2: OUTERWEAR
  { slug: 'empire-bomber-jacket', name: 'Empire Bomber Jacket', x: 0, y: 220, w: 196, h: 295 },
  { slug: 'street-legend-denim', name: 'Street Legend Denim', x: 196, y: 220, w: 196, h: 295 },
  { slug: 'reign-coach-jacket', name: 'Reign Coach Jacket', x: 392, y: 220, w: 196, h: 295 },
  { slug: 'apex-leather-jacket', name: 'Apex Leather Jacket', x: 588, y: 220, w: 196, h: 295 },
  
  // ROW 3: BOTTOMS
  { slug: 'executive-track-pants', name: 'Executive Track Pants', x: 0, y: 520, w: 196, h: 295 },
  { slug: 'street-cargo-pants', name: 'Street Cargo Pants', x: 196, y: 520, w: 196, h: 295 },
  { slug: 'boss-denim', name: 'Boss Denim', x: 392, y: 520, w: 196, h: 295 },
  { slug: 'legacy-shorts', name: 'Legacy Shorts', x: 588, y: 520, w: 196, h: 295 },
  
  // ROW 4: ACCESSORIES (smaller items, roughly 5 columns)
  { slug: 'crown-chain', name: 'Crown Chain', x: 0, y: 820, w: 156, h: 175 },
  { slug: 'street-duffle', name: 'Street Duffle', x: 156, y: 820, w: 156, h: 175 },
  { slug: 'money-clip-wallet', name: 'Money Clip Wallet', x: 390, y: 820, w: 120, h: 175 },
  { slug: 'empire-backpack', name: 'Empire Backpack', x: 510, y: 820, w: 120, h: 175 },
  { slug: 'boss-belt', name: 'Boss Belt', x: 630, y: 820, w: 154, h: 175 }
];

// ============================================================================
// CROP DEFINITIONS FOR TEES/HOODIES COMPOSITE (image__49_.jpg)
// ============================================================================

const TEE_HOODIE_PRODUCTS = [
  // Row 1: First 3 tees
  { slug: 'five-star-general-tee', name: 'Five Star General Tee', x: 15, y: 40, w: 250, h: 250 },
  { slug: 'from-the-block-tee', name: 'From The Block Tee', x: 270, y: 40, w: 250, h: 250 },
  { slug: 'money-talk-tee', name: 'Money Talk Tee', x: 525, y: 40, w: 250, h: 250 },
  
  // Row 2: Next 3 tees
  { slug: 'street-dreams-tee', name: 'Street Dreams Tee', x: 15, y: 310, w: 250, h: 270 },
  { slug: 'boss-up-tee', name: 'Boss Up Tee', x: 270, y: 310, w: 250, h: 270 },
  { slug: 'legacy-tee', name: 'Legacy Tee', x: 525, y: 310, w: 250, h: 270 },
  
  // Row 3: Hoodies
  { slug: 'street-king-hoodie', name: 'Street King Hoodie', x: 15, y: 620, w: 250, h: 290 },
  { slug: 'grind-mode-hoodie', name: 'Grind Mode Hoodie', x: 270, y: 620, w: 250, h: 290 },
  { slug: 'visionary-pullover', name: 'Visionary Pullover', x: 525, y: 620, w: 250, h: 290 }
];

// ============================================================================
// INDIVIDUAL IMAGES (clean shots you already have)
// ============================================================================

const INDIVIDUAL_IMAGES = [
  { slug: 'red-flag-tee', name: 'Red Flag Tee', file: 'redflag-individual.jpg' },
  { slug: 'crown-heavyweight-hoodie', name: 'Crown Heavyweight Hoodie', file: 'hoodie-individual.jpg' },
  { slug: 'empire-zip-hoodie', name: 'Empire Zip Hoodie', file: 'trackjacket-individual.jpg' }
];

// Products that need placeholder images
const PLACEHOLDER_PRODUCTS = [
  { slug: 'street-socks-3pack', name: 'Street Socks (3-Pack)' }
];

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Creates the output directory if it doesn't exist
 */
async function ensureOutputDir() {
  try {
    await fs.mkdir(OUTPUT_DIR, { recursive: true });
    console.log(`📁 Output directory ready: ${OUTPUT_DIR}`);
  } catch (err) {
    if (err.code !== 'EEXIST') throw err;
  }
}

/**
 * Crops a region from an image and saves it as a square product photo
 */
async function cropAndSave(sourcePath, product) {
  const outputPath = path.join(OUTPUT_DIR, `${product.slug}.jpg`);
  
  try {
    await sharp(sourcePath)
      .extract({
        left: product.x,
        top: product.y,
        width: product.w,
        height: product.h
      })
      .resize(800, 800, {
        fit: 'contain',
        background: { r: 248, g: 248, b: 248 } // Light gray background
      })
      .jpeg({ quality: 92 })
      .toFile(outputPath);
    
    console.log(`  ✓ Cropped: ${product.name}`);
    return outputPath;
  } catch (err) {
    console.error(`  ✗ Crop failed for ${product.name}: ${err.message}`);
    return null;
  }
}

/**
 * Processes an individual image file (resize to consistent dimensions)
 */
async function processIndividualImage(product) {
  const outputPath = path.join(OUTPUT_DIR, `${product.slug}.jpg`);
  
  try {
    await fs.access(product.file);
    
    await sharp(product.file)
      .resize(800, 800, {
        fit: 'contain',
        background: { r: 248, g: 248, b: 248 }
      })
      .jpeg({ quality: 92 })
      .toFile(outputPath);
    
    console.log(`  ✓ Processed: ${product.name}`);
    return outputPath;
  } catch (err) {
    console.error(`  ✗ Process failed for ${product.name}: ${err.message}`);
    return null;
  }
}

/**
 * Creates a placeholder image (solid light gray)
 */
async function createPlaceholder(product) {
  const outputPath = path.join(OUTPUT_DIR, `${product.slug}.jpg`);
  
  try {
    await sharp({
      create: {
        width: 800,
        height: 800,
        channels: 3,
        background: { r: 235, g: 235, b: 235 }
      }
    })
    .jpeg({ quality: 90 })
    .toFile(outputPath);
    
    console.log(`  ✓ Placeholder created: ${product.name}`);
    return outputPath;
  } catch (err) {
    console.error(`  ✗ Placeholder failed for ${product.name}: ${err.message}`);
    return null;
  }
}

/**
 * Uploads an image to Cloudinary
 */
async function uploadToCloudinary(localPath, slug) {
  try {
    const result = await cloudinary.uploader.upload(localPath, {
      public_id: slug,
      folder: 'hyow-products',
      overwrite: true,
      transformation: [{ quality: 'auto', fetch_format: 'auto' }]
    });
    
    console.log(`  ☁️  Uploaded to Cloudinary: ${slug}`);
    return result.secure_url;
  } catch (err) {
    console.error(`  ✗ Cloudinary upload failed for ${slug}: ${err.message}`);
    return null;
  }
}

/**
 * Updates the product's image URL in the database
 */
async function updateDatabase(slug, imageUrl) {
  const client = await pool.connect();
  
  try {
    // First, check if product_images table exists
    const tableCheck = await client.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'product_images'
      )
    `);
    
    // Get the product ID
    const productResult = await client.query(
      'SELECT id, name FROM products WHERE slug = $1',
      [slug]
    );
    
    if (productResult.rows.length === 0) {
      console.log(`  ⚠️  Product not found in database: ${slug}`);
      return false;
    }
    
    const productId = productResult.rows[0].id;
    const productName = productResult.rows[0].name;
    
    if (tableCheck.rows[0].exists) {
      // Use product_images table
      // First, delete any existing primary image for this product
      await client.query(
        'DELETE FROM product_images WHERE product_id = $1 AND is_primary = true',
        [productId]
      );
      
      // Insert the new image
      await client.query(`
        INSERT INTO product_images (id, product_id, url, alt_text, position, is_primary, created_at, updated_at)
        VALUES (gen_random_uuid(), $1, $2, $3, 0, true, NOW(), NOW())
      `, [productId, imageUrl, productName]);
      
    } else {
      // Check if products table has an image_url column
      const colCheck = await client.query(`
        SELECT EXISTS (
          SELECT FROM information_schema.columns 
          WHERE table_name = 'products' AND column_name = 'image_url'
        )
      `);
      
      if (!colCheck.rows[0].exists) {
        // Add the column if it doesn't exist
        console.log(`  📝 Adding image_url column to products table...`);
        await client.query('ALTER TABLE products ADD COLUMN IF NOT EXISTS image_url TEXT');
      }
      
      // Update the product
      await client.query(
        'UPDATE products SET image_url = $1, updated_at = NOW() WHERE slug = $2',
        [imageUrl, slug]
      );
    }
    
    console.log(`  💾 Database updated: ${slug}`);
    return true;
    
  } catch (err) {
    console.error(`  ✗ Database update failed for ${slug}: ${err.message}`);
    return false;
  } finally {
    client.release();
  }
}

/**
 * Checks if a file exists
 */
async function fileExists(filepath) {
  try {
    await fs.access(filepath);
    return true;
  } catch {
    return false;
  }
}

// ============================================================================
// MAIN PROCESSING LOGIC
// ============================================================================

async function main() {
  console.log('');
  console.log('═══════════════════════════════════════════════════════════════');
  console.log('  🖼️  HYOW E-Commerce - Automated Image Processor v2.0');
  console.log('═══════════════════════════════════════════════════════════════');
  console.log('');
  
  // Verify DATABASE_URL is set
  if (!process.env.DATABASE_URL) {
    console.error('❌ ERROR: DATABASE_URL environment variable is not set!');
    console.log('');
    console.log('Run with:');
    console.log('  DATABASE_URL=$(railway run --service Postgres printenv DATABASE_PUBLIC_URL) node process-images.js');
    console.log('');
    process.exit(1);
  }
  
  console.log('✅ Database connection configured');
  console.log('✅ Cloudinary configured (cloud: holdyourownbrand)');
  console.log('');
  
  await ensureOutputDir();
  
  const results = { success: [], failed: [] };
  
  // =========================================================================
  // STEP 1: Process the main grid composite
  // =========================================================================
  console.log('');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('STEP 1: Processing main grid (hats, outerwear, bottoms, accessories)');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('');
  
  const gridPath = 'product-grid.jpg';
  
  if (await fileExists(gridPath)) {
    console.log(`📷 Found grid composite: ${gridPath}`);
    console.log(`   Processing ${GRID_PRODUCTS.length} products...\n`);
    
    for (const product of GRID_PRODUCTS) {
      const localPath = await cropAndSave(gridPath, product);
      if (!localPath) { results.failed.push(product.slug); continue; }
      
      const cloudinaryUrl = await uploadToCloudinary(localPath, product.slug);
      if (!cloudinaryUrl) { results.failed.push(product.slug); continue; }
      
      const dbUpdated = await updateDatabase(product.slug, cloudinaryUrl);
      if (dbUpdated) {
        results.success.push({ slug: product.slug, name: product.name, url: cloudinaryUrl });
      } else {
        results.failed.push(product.slug);
      }
    }
  } else {
    console.log(`⚠️  Grid composite not found: ${gridPath}`);
    console.log('   Skipping hats, outerwear, bottoms, accessories...');
    console.log('');
    console.log('   To fix: Save image__55_.jpg as "product-grid.jpg" in this folder');
  }
  
  // =========================================================================
  // STEP 2: Process tees & hoodies composite
  // =========================================================================
  console.log('');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('STEP 2: Processing tees & hoodies composite');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('');
  
  const teePath = 'tees-hoodies-composite.jpg';
  
  if (await fileExists(teePath)) {
    console.log(`📷 Found tees/hoodies composite: ${teePath}`);
    console.log(`   Processing ${TEE_HOODIE_PRODUCTS.length} products...\n`);
    
    for (const product of TEE_HOODIE_PRODUCTS) {
      const localPath = await cropAndSave(teePath, product);
      if (!localPath) { results.failed.push(product.slug); continue; }
      
      const cloudinaryUrl = await uploadToCloudinary(localPath, product.slug);
      if (!cloudinaryUrl) { results.failed.push(product.slug); continue; }
      
      const dbUpdated = await updateDatabase(product.slug, cloudinaryUrl);
      if (dbUpdated) {
        results.success.push({ slug: product.slug, name: product.name, url: cloudinaryUrl });
      } else {
        results.failed.push(product.slug);
      }
    }
  } else {
    console.log(`⚠️  Tees/hoodies composite not found: ${teePath}`);
    console.log('   Skipping tees & hoodies from composite...');
    console.log('');
    console.log('   To fix: Save image__49_.jpg as "tees-hoodies-composite.jpg" in this folder');
  }
  
  // =========================================================================
  // STEP 3: Process individual product images
  // =========================================================================
  console.log('');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('STEP 3: Processing individual product images');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('');
  
  for (const product of INDIVIDUAL_IMAGES) {
    if (await fileExists(product.file)) {
      const localPath = await processIndividualImage(product);
      if (!localPath) { results.failed.push(product.slug); continue; }
      
      const cloudinaryUrl = await uploadToCloudinary(localPath, product.slug);
      if (!cloudinaryUrl) { results.failed.push(product.slug); continue; }
      
      const dbUpdated = await updateDatabase(product.slug, cloudinaryUrl);
      if (dbUpdated) {
        results.success.push({ slug: product.slug, name: product.name, url: cloudinaryUrl });
      } else {
        results.failed.push(product.slug);
      }
    } else {
      console.log(`  ⚠️  Individual image not found: ${product.file}`);
      results.failed.push(product.slug);
    }
  }
  
  // =========================================================================
  // STEP 4: Create placeholders for remaining products
  // =========================================================================
  console.log('');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('STEP 4: Creating placeholders for remaining products');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('');
  
  for (const product of PLACEHOLDER_PRODUCTS) {
    const localPath = await createPlaceholder(product);
    if (!localPath) { results.failed.push(product.slug); continue; }
    
    const cloudinaryUrl = await uploadToCloudinary(localPath, product.slug);
    if (!cloudinaryUrl) { results.failed.push(product.slug); continue; }
    
    const dbUpdated = await updateDatabase(product.slug, cloudinaryUrl);
    if (dbUpdated) {
      results.success.push({ slug: product.slug, name: product.name, url: cloudinaryUrl });
    } else {
      results.failed.push(product.slug);
    }
  }
  
  // =========================================================================
  // FINAL SUMMARY
  // =========================================================================
  console.log('');
  console.log('═══════════════════════════════════════════════════════════════');
  console.log('  📊 PROCESSING COMPLETE');
  console.log('═══════════════════════════════════════════════════════════════');
  console.log('');
  
  console.log(`✅ Successfully processed: ${results.success.length} products`);
  console.log(`❌ Failed: ${results.failed.length} products`);
  
  if (results.failed.length > 0) {
    console.log('\nFailed products:');
    results.failed.forEach(slug => console.log(`  - ${slug}`));
  }
  
  console.log('\n📋 Uploaded images:');
  results.success.forEach(r => {
    console.log(`  ${r.slug}`);
    console.log(`    → ${r.url}`);
  });
  
  console.log('');
  console.log('🎉 Done! Refresh your site to see the images.');
  console.log('   Frontend: https://client-phi-tawny.vercel.app');
  console.log('');
  
  await pool.end();
}

// Run the script
main().catch(err => {
  console.error('\n❌ Fatal error:', err);
  process.exit(1);
});

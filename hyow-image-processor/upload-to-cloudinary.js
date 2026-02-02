/**
 * HYOW Cloudinary Bulk Upload Script
 * Uploads all 30 product images from cropped-products/ to Cloudinary
 */

const cloudinary = require('cloudinary').v2;
const fs = require('fs');
const path = require('path');

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || 'holdyourownbrand',
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

const IMAGES_DIR = path.join(__dirname, 'cropped-products');
const CLOUDINARY_FOLDER = 'hyow-products';

async function uploadAllImages() {
  console.log('\n═══════════════════════════════════════════════════════════════');
  console.log('  �� HYOW Cloudinary Bulk Upload');
  console.log('═══════════════════════════════════════════════════════════════\n');

  if (!process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
    console.error('❌ ERROR: Cloudinary API credentials not set!');
    process.exit(1);
  }

  console.log(`☁️  Cloud Name: ${cloudinary.config().cloud_name}`);
  console.log(`�� Source Dir: ${IMAGES_DIR}`);
  console.log(`�� Cloudinary Folder: ${CLOUDINARY_FOLDER}\n`);

  const files = fs.readdirSync(IMAGES_DIR)
    .filter(file => file.endsWith('.jpg'))
    .sort();

  console.log(`�� Found ${files.length} images to upload\n`);

  let success = 0;
  let failed = 0;

  for (const file of files) {
    const filePath = path.join(IMAGES_DIR, file);
    const publicId = `${CLOUDINARY_FOLDER}/${file.replace('.jpg', '')}`;
    
    try {
      const result = await cloudinary.uploader.upload(filePath, {
        public_id: publicId,
        overwrite: true,
        transformation: [
          { quality: 'auto:good' },
          { fetch_format: 'auto' }
        ]
      });
      
      console.log(`  ✅ ${file}`);
      success++;
    } catch (error) {
      console.log(`  ❌ ${file}: ${error.message}`);
      failed++;
    }
  }

  console.log('\n═══════════════════════════════════════════════════════════════');
  console.log(`  �� RESULTS: ✅ ${success} uploaded, ❌ ${failed} failed`);
  console.log('═══════════════════════════════════════════════════════════════\n');
  console.log('Next: Run "railway run node fix-image-urls.js" to update database\n');
}

uploadAllImages().catch(err => {
  console.error('❌ Fatal error:', err.message);
  process.exit(1);
});

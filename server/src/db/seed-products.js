// HYOW Product Seeding Script
// Inspired by Stew Money's journey from the streets of Harlem to success
// Red/Black color themes honoring Blood gang heritage

const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

// Product catalog - Hold Your Own Brand
const products = [
  // ============ T-SHIRTS ============
  {
    name: 'Red Flag Tee',
    slug: 'red-flag-tee',
    description: 'Rep your set with pride. Premium cotton tee featuring the iconic red flag graphic. For those who never forgot where they came from.',
    price: 45.00,
    compareAtPrice: 55.00,
    category: 'tees',
    featured: true,
    variants: [
      { size: 'S', color: 'Black', sku: 'RFT-BLK-S', stock: 25 },
      { size: 'M', color: 'Black', sku: 'RFT-BLK-M', stock: 50 },
      { size: 'L', color: 'Black', sku: 'RFT-BLK-L', stock: 50 },
      { size: 'XL', color: 'Black', sku: 'RFT-BLK-XL', stock: 40 },
      { size: '2XL', color: 'Black', sku: 'RFT-BLK-2XL', stock: 30 },
      { size: 'S', color: 'Red', sku: 'RFT-RED-S', stock: 20 },
      { size: 'M', color: 'Red', sku: 'RFT-RED-M', stock: 45 },
      { size: 'L', color: 'Red', sku: 'RFT-RED-L', stock: 45 },
      { size: 'XL', color: 'Red', sku: 'RFT-RED-XL', stock: 35 },
      { size: '2XL', color: 'Red', sku: 'RFT-RED-2XL', stock: 25 },
    ]
  },
  {
    name: 'Five Star General Tee',
    slug: 'five-star-general-tee',
    description: 'Earned, not given. The Five Star General tee for those who put in the work and rose through the ranks. Heavyweight 6oz cotton.',
    price: 48.00,
    compareAtPrice: null,
    category: 'tees',
    featured: true,
    variants: [
      { size: 'S', color: 'Black', sku: 'FSG-BLK-S', stock: 20 },
      { size: 'M', color: 'Black', sku: 'FSG-BLK-M', stock: 40 },
      { size: 'L', color: 'Black', sku: 'FSG-BLK-L', stock: 45 },
      { size: 'XL', color: 'Black', sku: 'FSG-BLK-XL', stock: 35 },
      { size: '2XL', color: 'Black', sku: 'FSG-BLK-2XL', stock: 25 },
      { size: 'M', color: 'White', sku: 'FSG-WHT-M', stock: 30 },
      { size: 'L', color: 'White', sku: 'FSG-WHT-L', stock: 35 },
      { size: 'XL', color: 'White', sku: 'FSG-WHT-XL', stock: 25 },
    ]
  },
  {
    name: 'From Nothing Tee',
    slug: 'from-nothing-tee',
    description: 'Started from nothing, built an empire. This tee tells your story without saying a word. Premium ringspun cotton with distressed print.',
    price: 42.00,
    compareAtPrice: null,
    category: 'tees',
    featured: false,
    variants: [
      { size: 'S', color: 'Charcoal', sku: 'FNT-CHR-S', stock: 30 },
      { size: 'M', color: 'Charcoal', sku: 'FNT-CHR-M', stock: 50 },
      { size: 'L', color: 'Charcoal', sku: 'FNT-CHR-L', stock: 55 },
      { size: 'XL', color: 'Charcoal', sku: 'FNT-CHR-XL', stock: 40 },
      { size: '2XL', color: 'Charcoal', sku: 'FNT-CHR-2XL', stock: 30 },
    ]
  },
  {
    name: 'Stew Money Signature Tee',
    slug: 'stew-money-signature-tee',
    description: 'The signature piece. Anthony\'s personal design featuring his iconic tag and the motto that started it all. Limited edition run.',
    price: 55.00,
    compareAtPrice: 65.00,
    category: 'tees',
    featured: true,
    variants: [
      { size: 'S', color: 'Black/Red', sku: 'SMS-BLR-S', stock: 15 },
      { size: 'M', color: 'Black/Red', sku: 'SMS-BLR-M', stock: 30 },
      { size: 'L', color: 'Black/Red', sku: 'SMS-BLR-L', stock: 35 },
      { size: 'XL', color: 'Black/Red', sku: 'SMS-BLR-XL', stock: 25 },
      { size: '2XL', color: 'Black/Red', sku: 'SMS-BLR-2XL', stock: 20 },
    ]
  },
  {
    name: 'Set Trippin\' Tee',
    slug: 'set-trippin-tee',
    description: 'For the ones who ride for their block. Bold graphic tee with the streets in your DNA. Oversized fit, drop shoulder.',
    price: 44.00,
    compareAtPrice: null,
    category: 'tees',
    featured: false,
    variants: [
      { size: 'M', color: 'Black', sku: 'STT-BLK-M', stock: 35 },
      { size: 'L', color: 'Black', sku: 'STT-BLK-L', stock: 45 },
      { size: 'XL', color: 'Black', sku: 'STT-BLK-XL', stock: 40 },
      { size: '2XL', color: 'Black', sku: 'STT-BLK-2XL', stock: 30 },
      { size: 'M', color: 'Burgundy', sku: 'STT-BRG-M', stock: 25 },
      { size: 'L', color: 'Burgundy', sku: 'STT-BRG-L', stock: 35 },
      { size: 'XL', color: 'Burgundy', sku: 'STT-BRG-XL', stock: 30 },
    ]
  },
  {
    name: 'HYO Classic Logo Tee',
    slug: 'hyo-classic-logo-tee',
    description: 'The foundation. Clean, classic, and unmistakable. The HYO logo tee that started a movement. 100% combed cotton.',
    price: 38.00,
    compareAtPrice: null,
    category: 'tees',
    featured: false,
    variants: [
      { size: 'S', color: 'Black', sku: 'HCL-BLK-S', stock: 40 },
      { size: 'M', color: 'Black', sku: 'HCL-BLK-M', stock: 60 },
      { size: 'L', color: 'Black', sku: 'HCL-BLK-L', stock: 65 },
      { size: 'XL', color: 'Black', sku: 'HCL-BLK-XL', stock: 50 },
      { size: '2XL', color: 'Black', sku: 'HCL-BLK-2XL', stock: 35 },
      { size: 'S', color: 'White', sku: 'HCL-WHT-S', stock: 35 },
      { size: 'M', color: 'White', sku: 'HCL-WHT-M', stock: 55 },
      { size: 'L', color: 'White', sku: 'HCL-WHT-L', stock: 60 },
      { size: 'XL', color: 'White', sku: 'HCL-WHT-XL', stock: 45 },
      { size: '2XL', color: 'White', sku: 'HCL-WHT-2XL', stock: 30 },
    ]
  },
  {
    name: 'Bloodline Tee',
    slug: 'bloodline-tee',
    description: 'Family over everything. The Bloodline tee honors the ties that bind us - by blood or by bond. Vintage wash finish.',
    price: 46.00,
    compareAtPrice: null,
    category: 'tees',
    featured: false,
    variants: [
      { size: 'S', color: 'Vintage Black', sku: 'BLT-VBK-S', stock: 25 },
      { size: 'M', color: 'Vintage Black', sku: 'BLT-VBK-M', stock: 40 },
      { size: 'L', color: 'Vintage Black', sku: 'BLT-VBK-L', stock: 45 },
      { size: 'XL', color: 'Vintage Black', sku: 'BLT-VBK-XL', stock: 35 },
      { size: '2XL', color: 'Vintage Black', sku: 'BLT-VBK-2XL', stock: 25 },
    ]
  },

  // ============ HOODIES ============
  {
    name: 'Street Scriptures Hoodie',
    slug: 'street-scriptures-hoodie',
    description: 'The streets taught us lessons no school could. Heavyweight 12oz fleece hoodie with embroidered chest logo and back scripture print. Double-lined hood.',
    price: 95.00,
    compareAtPrice: 115.00,
    category: 'hoodies',
    featured: true,
    variants: [
      { size: 'S', color: 'Black', sku: 'SSH-BLK-S', stock: 15 },
      { size: 'M', color: 'Black', sku: 'SSH-BLK-M', stock: 30 },
      { size: 'L', color: 'Black', sku: 'SSH-BLK-L', stock: 35 },
      { size: 'XL', color: 'Black', sku: 'SSH-BLK-XL', stock: 30 },
      { size: '2XL', color: 'Black', sku: 'SSH-BLK-2XL', stock: 20 },
      { size: 'M', color: 'Blood Red', sku: 'SSH-RED-M', stock: 20 },
      { size: 'L', color: 'Blood Red', sku: 'SSH-RED-L', stock: 25 },
      { size: 'XL', color: 'Blood Red', sku: 'SSH-RED-XL', stock: 20 },
    ]
  },
  {
    name: 'Red Handed Hoodie',
    slug: 'red-handed-hoodie',
    description: 'Caught red handed? Own it. Premium hoodie with bold red embroidery on black. Kangaroo pocket with hidden zip compartment.',
    price: 88.00,
    compareAtPrice: null,
    category: 'hoodies',
    featured: true,
    variants: [
      { size: 'S', color: 'Black/Red', sku: 'RHH-BLR-S', stock: 20 },
      { size: 'M', color: 'Black/Red', sku: 'RHH-BLR-M', stock: 35 },
      { size: 'L', color: 'Black/Red', sku: 'RHH-BLR-L', stock: 40 },
      { size: 'XL', color: 'Black/Red', sku: 'RHH-BLR-XL', stock: 30 },
      { size: '2XL', color: 'Black/Red', sku: 'RHH-BLR-2XL', stock: 20 },
    ]
  },
  {
    name: 'Flag Bearer Hoodie',
    slug: 'flag-bearer-hoodie',
    description: 'Lead from the front. The Flag Bearer hoodie for those who carry the weight and never fold. Oversized fit with dropped shoulders.',
    price: 92.00,
    compareAtPrice: null,
    category: 'hoodies',
    featured: false,
    variants: [
      { size: 'M', color: 'Charcoal', sku: 'FBH-CHR-M', stock: 25 },
      { size: 'L', color: 'Charcoal', sku: 'FBH-CHR-L', stock: 30 },
      { size: 'XL', color: 'Charcoal', sku: 'FBH-CHR-XL', stock: 25 },
      { size: '2XL', color: 'Charcoal', sku: 'FBH-CHR-2XL', stock: 20 },
      { size: 'M', color: 'Burgundy', sku: 'FBH-BRG-M', stock: 20 },
      { size: 'L', color: 'Burgundy', sku: 'FBH-BRG-L', stock: 25 },
      { size: 'XL', color: 'Burgundy', sku: 'FBH-BRG-XL', stock: 20 },
    ]
  },
  {
    name: 'Hold Your Own Classic Hoodie',
    slug: 'hold-your-own-classic-hoodie',
    description: 'The OG. Classic fit hoodie with the full "Hold Your Own" embroidered across the chest. Ribbed cuffs and hem. Built to last.',
    price: 85.00,
    compareAtPrice: null,
    category: 'hoodies',
    featured: false,
    variants: [
      { size: 'S', color: 'Black', sku: 'HYO-BLK-S', stock: 25 },
      { size: 'M', color: 'Black', sku: 'HYO-BLK-M', stock: 40 },
      { size: 'L', color: 'Black', sku: 'HYO-BLK-L', stock: 45 },
      { size: 'XL', color: 'Black', sku: 'HYO-BLK-XL', stock: 35 },
      { size: '2XL', color: 'Black', sku: 'HYO-BLK-2XL', stock: 25 },
      { size: 'S', color: 'Heather Grey', sku: 'HYO-GRY-S', stock: 20 },
      { size: 'M', color: 'Heather Grey', sku: 'HYO-GRY-M', stock: 35 },
      { size: 'L', color: 'Heather Grey', sku: 'HYO-GRY-L', stock: 40 },
      { size: 'XL', color: 'Heather Grey', sku: 'HYO-GRY-XL', stock: 30 },
    ]
  },
  {
    name: 'Harlem Nights Hoodie',
    slug: 'harlem-nights-hoodie',
    description: 'Where legends are made. The Harlem Nights hoodie pays tribute to the blocks that shaped us. Chenille patch on back, embroidered front.',
    price: 98.00,
    compareAtPrice: 120.00,
    category: 'hoodies',
    featured: true,
    variants: [
      { size: 'S', color: 'Black', sku: 'HNH-BLK-S', stock: 15 },
      { size: 'M', color: 'Black', sku: 'HNH-BLK-M', stock: 25 },
      { size: 'L', color: 'Black', sku: 'HNH-BLK-L', stock: 30 },
      { size: 'XL', color: 'Black', sku: 'HNH-BLK-XL', stock: 25 },
      { size: '2XL', color: 'Black', sku: 'HNH-BLK-2XL', stock: 15 },
    ]
  },

  // ============ HATS ============
  {
    name: 'HYO Snapback',
    slug: 'hyo-snapback',
    description: 'Crown yourself. The signature HYO snapback with 3D embroidered logo. Structured crown, flat brim, adjustable snap closure.',
    price: 38.00,
    compareAtPrice: null,
    category: 'hats',
    featured: true,
    variants: [
      { size: 'One Size', color: 'Black/Red', sku: 'HYOS-BLR-OS', stock: 50 },
      { size: 'One Size', color: 'Black/Gold', sku: 'HYOS-BLG-OS', stock: 45 },
      { size: 'One Size', color: 'All Black', sku: 'HYOS-BLK-OS', stock: 60 },
    ]
  },
  {
    name: 'Red Flag Fitted',
    slug: 'red-flag-fitted',
    description: 'Premium fitted cap with the red flag emblem. New Era quality construction. Represent with no compromise.',
    price: 45.00,
    compareAtPrice: null,
    category: 'hats',
    featured: false,
    variants: [
      { size: '7', color: 'Black', sku: 'RFF-BLK-7', stock: 15 },
      { size: '7 1/8', color: 'Black', sku: 'RFF-BLK-718', stock: 20 },
      { size: '7 1/4', color: 'Black', sku: 'RFF-BLK-714', stock: 25 },
      { size: '7 3/8', color: 'Black', sku: 'RFF-BLK-738', stock: 25 },
      { size: '7 1/2', color: 'Black', sku: 'RFF-BLK-712', stock: 20 },
      { size: '7 5/8', color: 'Black', sku: 'RFF-BLK-758', stock: 15 },
      { size: '7 3/4', color: 'Black', sku: 'RFF-BLK-734', stock: 10 },
    ]
  },
  {
    name: 'Stew Money Dad Hat',
    slug: 'stew-money-dad-hat',
    description: 'Low-key flex. The Stew Money dad hat with vintage embroidery. Unstructured crown, curved brim, brass buckle closure.',
    price: 35.00,
    compareAtPrice: null,
    category: 'hats',
    featured: false,
    variants: [
      { size: 'One Size', color: 'Black', sku: 'SMDH-BLK-OS', stock: 40 },
      { size: 'One Size', color: 'Burgundy', sku: 'SMDH-BRG-OS', stock: 35 },
      { size: 'One Size', color: 'Khaki', sku: 'SMDH-KHK-OS', stock: 30 },
    ]
  },
  {
    name: 'Block Star Beanie',
    slug: 'block-star-beanie',
    description: 'Stay warm, stay solid. Ribbed knit beanie with embroidered star logo. Acrylic blend for comfort and durability.',
    price: 32.00,
    compareAtPrice: null,
    category: 'hats',
    featured: false,
    variants: [
      { size: 'One Size', color: 'Black', sku: 'BSB-BLK-OS', stock: 45 },
      { size: 'One Size', color: 'Red', sku: 'BSB-RED-OS', stock: 40 },
      { size: 'One Size', color: 'Charcoal', sku: 'BSB-CHR-OS', stock: 35 },
    ]
  },

  // ============ ACCESSORIES ============
  {
    name: 'Blood Ties Bandana',
    slug: 'blood-ties-bandana',
    description: 'The classic paisley with a twist. Premium cotton bandana featuring the HYO logo woven into the design. Red on black.',
    price: 22.00,
    compareAtPrice: null,
    category: 'accessories',
    featured: false,
    variants: [
      { size: 'One Size', color: 'Red/Black', sku: 'BTB-RBK-OS', stock: 75 },
      { size: 'One Size', color: 'Black/Red', sku: 'BTB-BKR-OS', stock: 75 },
    ]
  },
  {
    name: 'Set Life Socks (3-Pack)',
    slug: 'set-life-socks-3pack',
    description: 'From head to toe, we got you. Three pairs of premium crew socks with HYO branding. Cushioned sole, reinforced heel and toe.',
    price: 28.00,
    compareAtPrice: 36.00,
    category: 'accessories',
    featured: false,
    variants: [
      { size: 'M (6-9)', color: 'Black/Red/White', sku: 'SLS-MIX-M', stock: 50 },
      { size: 'L (10-13)', color: 'Black/Red/White', sku: 'SLS-MIX-L', stock: 60 },
    ]
  },
  {
    name: 'HYO Keychain',
    slug: 'hyo-keychain',
    description: 'Keep the keys to success close. Heavy duty zinc alloy keychain with the HYO emblem. Gunmetal finish.',
    price: 18.00,
    compareAtPrice: null,
    category: 'accessories',
    featured: false,
    variants: [
      { size: 'One Size', color: 'Gunmetal', sku: 'HYOK-GM-OS', stock: 100 },
      { size: 'One Size', color: 'Gold', sku: 'HYOK-GD-OS', stock: 80 },
    ]
  },
  {
    name: 'Money Clip Wallet',
    slug: 'money-clip-wallet',
    description: 'Stack your paper right. Genuine leather slim wallet with HYO embossed logo and integrated money clip. RFID blocking.',
    price: 55.00,
    compareAtPrice: null,
    category: 'accessories',
    featured: true,
    variants: [
      { size: 'One Size', color: 'Black', sku: 'MCW-BLK-OS', stock: 40 },
      { size: 'One Size', color: 'Burgundy', sku: 'MCW-BRG-OS', stock: 35 },
    ]
  },
  {
    name: 'Street Dreams Duffle',
    slug: 'street-dreams-duffle',
    description: 'Move in silence. Premium canvas duffle bag with leather accents. Multiple compartments, padded laptop sleeve, shoe pocket.',
    price: 125.00,
    compareAtPrice: 150.00,
    category: 'accessories',
    featured: true,
    variants: [
      { size: 'One Size', color: 'Black', sku: 'SDD-BLK-OS', stock: 25 },
      { size: 'One Size', color: 'Black/Red', sku: 'SDD-BLR-OS', stock: 20 },
    ]
  },
  {
    name: 'Loyalty Chain',
    slug: 'loyalty-chain',
    description: 'Loyalty over everything. Stainless steel Cuban link chain with HYO pendant. 18K gold plated, 24" length.',
    price: 85.00,
    compareAtPrice: 100.00,
    category: 'accessories',
    featured: false,
    variants: [
      { size: '24"', color: 'Gold', sku: 'LC-GLD-24', stock: 30 },
      { size: '24"', color: 'Silver', sku: 'LC-SLV-24', stock: 30 },
    ]
  },
];

async function seedProducts() {
  const client = await pool.connect();
  
  try {
    console.log('🔥 Starting HYOW product seeding...\n');
    
    // Get category IDs
    const categoriesResult = await client.query('SELECT id, slug FROM categories');
    const categories = {};
    categoriesResult.rows.forEach(cat => {
      categories[cat.slug] = cat.id;
    });
    
    console.log('📂 Found categories:', Object.keys(categories).join(', '));
    
    // Clear existing products (optional - comment out if you want to add to existing)
    console.log('\n🧹 Clearing existing products...');
    await client.query('DELETE FROM product_variants');
    await client.query('DELETE FROM product_images');
    await client.query('DELETE FROM products');
    
    let productCount = 0;
    let variantCount = 0;
    
    for (const product of products) {
      // Insert product
      const productResult = await client.query(`
        INSERT INTO products (
          id, name, slug, description, base_price, compare_at_price, 
          category_id, is_featured, is_active, created_at, updated_at
        ) VALUES (
          gen_random_uuid(), $1, $2, $3, $4, $5, $6, $7, true, NOW(), NOW()
        ) RETURNING id
      `, [
        product.name,
        product.slug,
        product.description,
        product.price,
        product.compareAtPrice,
        categories[product.category],
        product.featured
      ]);
      
      const productId = productResult.rows[0].id;
      productCount++;
      
      // Insert variants
      for (const variant of product.variants) {
        await client.query(`
          INSERT INTO product_variants (
            id, product_id, sku, size, color, price_adjustment, 
            stock_quantity, is_active, created_at, updated_at
          ) VALUES (
            gen_random_uuid(), $1, $2, $3, $4, 0, $5, true, NOW(), NOW()
          )
        `, [
          productId,
          variant.sku,
          variant.size,
          variant.color,
          variant.stock
        ]);
        variantCount++;
      }
      
      console.log(`✅ Created: ${product.name} (${product.variants.length} variants)`);
    }
    
    // Update category product counts
    await client.query(`
      UPDATE categories c 
      SET product_count = (
        SELECT COUNT(*) FROM products p WHERE p.category_id = c.id AND p.is_active = true
      )
    `);
    
    console.log('\n' + '='.repeat(50));
    console.log(`🎉 Seeding complete!`);
    console.log(`   Products created: ${productCount}`);
    console.log(`   Variants created: ${variantCount}`);
    console.log('='.repeat(50));
    
  } catch (error) {
    console.error('❌ Error seeding products:', error);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

seedProducts();

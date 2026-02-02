/**
 * HYOW Premium Product Seeder
 * 
 * Schema-aligned version for Railway PostgreSQL database
 * 
 * products table columns:
 *   - price (decimal) - base price
 *   - compare_at_price (decimal) - original/MSRP price  
 *   - status (varchar) - 'active', 'draft', 'archived'
 *   - is_featured (boolean)
 *   - is_new (boolean)
 * 
 * product_variants table columns:
 *   - price_adjustment (decimal) - delta from base price (0 for same price)
 *   - quantity (integer) - inventory count
 *   - is_active (boolean)
 *   - sku (varchar)
 *   - size (varchar)
 *   - color (varchar)
 */

require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

// HYOW Premium Product Catalog - Luxury Streetwear Pricing
const products = {
  tees: [
    {
      name: 'Red Flag Tee',
      slug: 'red-flag-tee',
      description: 'The signature HYOW statement piece. Premium Supima cotton with plastisol ink screen print. Cut and sewn in Los Angeles.',
      price: 165,
      compareAtPrice: 195,
      isFeatured: true,
      isNew: false,
      sizes: ['XS', 'S', 'M', 'L', 'XL', '2XL', '3XL']
    },
    {
      name: 'Five Star General Tee',
      slug: 'five-star-general-tee',
      description: 'Command respect. Heavy 6oz cotton, oversized fit, premium discharge print.',
      price: 175,
      compareAtPrice: 205,
      isFeatured: true,
      isNew: false,
      sizes: ['XS', 'S', 'M', 'L', 'XL', '2XL', '3XL']
    },
    {
      name: 'From The Block Tee',
      slug: 'from-the-block-tee',
      description: 'Never forget where you came from. Vintage wash with distressed graphic.',
      price: 155,
      compareAtPrice: 185,
      isFeatured: false,
      isNew: false,
      sizes: ['XS', 'S', 'M', 'L', 'XL', '2XL', '3XL']
    },
    {
      name: 'Money Talk Tee',
      slug: 'money-talk-tee',
      description: 'Let your success speak. Metallic foil print on heavyweight cotton.',
      price: 185,
      compareAtPrice: 215,
      isFeatured: false,
      isNew: true,
      sizes: ['XS', 'S', 'M', 'L', 'XL', '2XL', '3XL']
    },
    {
      name: 'Street Dreams Tee',
      slug: 'street-dreams-tee',
      description: 'Dream big, work harder. Puff print on premium ringspun cotton.',
      price: 150,
      compareAtPrice: 175,
      isFeatured: false,
      isNew: false,
      sizes: ['XS', 'S', 'M', 'L', 'XL', '2XL', '3XL']
    },
    {
      name: 'Boss Up Tee',
      slug: 'boss-up-tee',
      description: 'Elevate your mindset. Embroidered logo on luxury Pima cotton.',
      price: 195,
      compareAtPrice: 225,
      isFeatured: true,
      isNew: true,
      sizes: ['XS', 'S', 'M', 'L', 'XL', '2XL', '3XL']
    },
    {
      name: 'Legacy Tee',
      slug: 'legacy-tee',
      description: 'Build something that lasts. Vintage heavyweight with chain-stitch embroidery.',
      price: 175,
      compareAtPrice: 205,
      isFeatured: false,
      isNew: false,
      sizes: ['XS', 'S', 'M', 'L', 'XL', '2XL', '3XL']
    }
  ],
  hoodies: [
    {
      name: 'Crown Heavyweight Hoodie',
      slug: 'crown-heavyweight-hoodie',
      description: 'Rule your domain. 16oz French terry, kangaroo pocket, custom HYOW drawstrings.',
      price: 325,
      compareAtPrice: 395,
      isFeatured: true,
      isNew: false,
      sizes: ['S', 'M', 'L', 'XL', '2XL']
    },
    {
      name: 'Street King Hoodie',
      slug: 'street-king-hoodie',
      description: 'Own every block. Oversized cut, double-layered hood, chenille patch.',
      price: 345,
      compareAtPrice: 415,
      isFeatured: true,
      isNew: true,
      sizes: ['S', 'M', 'L', 'XL', '2XL']
    },
    {
      name: 'Grind Mode Hoodie',
      slug: 'grind-mode-hoodie',
      description: 'No days off. Performance fleece blend with reflective details.',
      price: 295,
      compareAtPrice: 355,
      isFeatured: false,
      isNew: false,
      sizes: ['S', 'M', 'L', 'XL', '2XL']
    },
    {
      name: 'Empire Zip Hoodie',
      slug: 'empire-zip-hoodie',
      description: 'Build your empire. Premium YKK zipper, leather pull tab, custom hardware.',
      price: 385,
      compareAtPrice: 455,
      isFeatured: false,
      isNew: false,
      sizes: ['S', 'M', 'L', 'XL', '2XL']
    },
    {
      name: 'Visionary Pullover',
      slug: 'visionary-pullover',
      description: 'See the future. Embroidered artwork on heavyweight organic cotton.',
      price: 425,
      compareAtPrice: 495,
      isFeatured: true,
      isNew: true,
      sizes: ['S', 'M', 'L', 'XL', '2XL']
    }
  ],
  hats: [
    {
      name: 'Crown Snapback',
      slug: 'crown-snapback',
      description: 'Premium wool blend with 3D embroidered crown logo. Adjustable snapback closure.',
      price: 95,
      compareAtPrice: 125,
      isFeatured: true,
      isNew: false,
      sizes: ['One Size']
    },
    {
      name: 'Street Fitted',
      slug: 'street-fitted',
      description: 'Classic fitted cap with embroidered HYOW script. New Era collaboration.',
      price: 125,
      compareAtPrice: 155,
      isFeatured: false,
      isNew: false,
      sizes: ['7', '7 1/8', '7 1/4', '7 3/8', '7 1/2', '7 5/8', '7 3/4']
    },
    {
      name: 'Boss Beanie',
      slug: 'boss-beanie',
      description: 'Cashmere blend beanie with leather HYOW patch. Made in Italy.',
      price: 145,
      compareAtPrice: 175,
      isFeatured: false,
      isNew: true,
      sizes: ['One Size']
    },
    {
      name: 'Vintage Dad Hat',
      slug: 'vintage-dad-hat',
      description: 'Distressed cotton twill with tonal embroidery. Pre-curved brim.',
      price: 85,
      compareAtPrice: 105,
      isFeatured: false,
      isNew: false,
      sizes: ['One Size']
    }
  ],
  outerwear: [
    {
      name: 'Empire Bomber Jacket',
      slug: 'empire-bomber-jacket',
      description: 'Premium satin bomber with custom quilted lining. Chenille patches and metal hardware.',
      price: 495,
      compareAtPrice: 595,
      isFeatured: true,
      isNew: true,
      sizes: ['S', 'M', 'L', 'XL', '2XL']
    },
    {
      name: 'Street Legend Denim',
      slug: 'street-legend-denim',
      description: 'Heavyweight selvedge denim jacket. Hand-distressed with custom embroidery.',
      price: 425,
      compareAtPrice: 525,
      isFeatured: true,
      isNew: false,
      sizes: ['S', 'M', 'L', 'XL', '2XL']
    },
    {
      name: 'Reign Coach Jacket',
      slug: 'reign-coach-jacket',
      description: 'Water-resistant nylon with mesh lining. Back graphic print.',
      price: 345,
      compareAtPrice: 425,
      isFeatured: false,
      isNew: false,
      sizes: ['S', 'M', 'L', 'XL', '2XL']
    },
    {
      name: 'Apex Leather Jacket',
      slug: 'apex-leather-jacket',
      description: 'Full-grain Italian leather with custom HYOW hardware. Lifetime warranty.',
      price: 695,
      compareAtPrice: 850,
      isFeatured: true,
      isNew: true,
      sizes: ['S', 'M', 'L', 'XL', '2XL']
    }
  ],
  bottoms: [
    {
      name: 'Executive Track Pants',
      slug: 'executive-track-pants',
      description: 'Premium French terry with side stripe detail. Tapered fit with zip pockets.',
      price: 195,
      compareAtPrice: 245,
      isFeatured: true,
      isNew: false,
      sizes: ['S', 'M', 'L', 'XL', '2XL']
    },
    {
      name: 'Street Cargo Pants',
      slug: 'street-cargo-pants',
      description: 'Heavyweight cotton ripstop with multiple utility pockets. Relaxed fit.',
      price: 225,
      compareAtPrice: 275,
      isFeatured: false,
      isNew: true,
      sizes: ['28', '30', '32', '34', '36', '38', '40']
    },
    {
      name: 'Boss Denim',
      slug: 'boss-denim',
      description: 'Japanese selvedge denim with custom HYOW rivets. Straight leg fit.',
      price: 275,
      compareAtPrice: 345,
      isFeatured: true,
      isNew: false,
      sizes: ['28', '30', '32', '34', '36', '38', '40']
    },
    {
      name: 'Legacy Shorts',
      slug: 'legacy-shorts',
      description: 'Premium cotton twill shorts with embroidered logo. 7-inch inseam.',
      price: 145,
      compareAtPrice: 175,
      isFeatured: false,
      isNew: false,
      sizes: ['S', 'M', 'L', 'XL', '2XL']
    }
  ],
  accessories: [
    {
      name: 'Crown Chain',
      slug: 'crown-chain',
      description: '18K gold-plated stainless steel chain with HYOW crown pendant.',
      price: 195,
      compareAtPrice: 245,
      isFeatured: true,
      isNew: false,
      sizes: ['20"', '24"', '28"']
    },
    {
      name: 'Street Duffle',
      slug: 'street-duffle',
      description: 'Premium canvas duffle with leather trim. Custom HYOW zippers.',
      price: 295,
      compareAtPrice: 365,
      isFeatured: true,
      isNew: true,
      sizes: ['One Size']
    },
    {
      name: 'Boss Belt',
      slug: 'boss-belt',
      description: 'Full-grain leather belt with custom HYOW buckle. Made in USA.',
      price: 145,
      compareAtPrice: 185,
      isFeatured: false,
      isNew: false,
      sizes: ['30', '32', '34', '36', '38', '40']
    },
    {
      name: 'Money Clip Wallet',
      slug: 'money-clip-wallet',
      description: 'Italian leather card holder with stainless steel money clip.',
      price: 125,
      compareAtPrice: 155,
      isFeatured: false,
      isNew: false,
      sizes: ['One Size']
    },
    {
      name: 'Empire Backpack',
      slug: 'empire-backpack',
      description: 'Ballistic nylon backpack with padded laptop sleeve. Custom hardware.',
      price: 395,
      compareAtPrice: 475,
      isFeatured: true,
      isNew: true,
      sizes: ['One Size']
    },
    {
      name: 'Street Socks (3-Pack)',
      slug: 'street-socks-3pack',
      description: 'Premium cotton blend crew socks with woven HYOW logo.',
      price: 45,
      compareAtPrice: 55,
      isFeatured: false,
      isNew: false,
      sizes: ['S/M', 'L/XL']
    }
  ]
};

async function seedProducts() {
  const client = await pool.connect();
  
  try {
    console.log('Starting HYOW premium product seeding...\n');
    
    // Get existing categories
    const categoriesResult = await client.query('SELECT id, slug FROM categories');
    const categories = {};
    categoriesResult.rows.forEach(row => {
      categories[row.slug] = row.id;
    });
    
    console.log('Found categories:', Object.keys(categories).join(', '));
    
    // Create outerwear and bottoms categories if they don't exist
    if (!categories['outerwear']) {
      const result = await client.query(
        `INSERT INTO categories (id, name, slug, description) 
         VALUES (gen_random_uuid(), 'Outerwear', 'outerwear', 'Premium jackets and outerwear')
         RETURNING id`
      );
      categories['outerwear'] = result.rows[0].id;
      console.log('Created Outerwear category');
    }
    
    if (!categories['bottoms']) {
      const result = await client.query(
        `INSERT INTO categories (id, name, slug, description) 
         VALUES (gen_random_uuid(), 'Bottoms', 'bottoms', 'Premium pants and shorts')
         RETURNING id`
      );
      categories['bottoms'] = result.rows[0].id;
      console.log('Created Bottoms category');
    }
    
    // Clear existing products
    console.log('\nClearing existing products...');
    await client.query('DELETE FROM product_variants');
    await client.query('DELETE FROM product_images');
    await client.query('DELETE FROM products');
    console.log('Cleared existing data\n');
    
    let totalProducts = 0;
    let totalVariants = 0;
    
    // Seed each category
    for (const [categorySlug, categoryProducts] of Object.entries(products)) {
      const categoryId = categories[categorySlug];
      
      if (!categoryId) {
        console.log(`Warning: Category '${categorySlug}' not found, skipping...`);
        continue;
      }
      
      console.log(`\n${categorySlug.toUpperCase()}`);
      console.log('-'.repeat(50));
      
      for (const product of categoryProducts) {
        // Insert product with correct column names
        const productResult = await client.query(
          `INSERT INTO products (
            id, category_id, name, slug, description,
            price, compare_at_price, status, is_featured, is_new
          ) VALUES (
            gen_random_uuid(), $1, $2, $3, $4,
            $5, $6, $7, $8, $9
          ) RETURNING id`,
          [
            categoryId,
            product.name,
            product.slug,
            product.description,
            product.price,
            product.compareAtPrice,
            'active',
            product.isFeatured,
            product.isNew
          ]
        );
        
        const productId = productResult.rows[0].id;
        totalProducts++;
        
        // Create variants for each size with correct column names
        for (const size of product.sizes) {
          const sku = `HYOW-${product.slug.toUpperCase().replace(/-/g, '')}-${size.replace(/[^a-zA-Z0-9]/g, '')}`;
          
          await client.query(
            `INSERT INTO product_variants (
              id, product_id, sku, size, color,
              price_adjustment, quantity, low_stock_threshold, is_active
            ) VALUES (
              gen_random_uuid(), $1, $2, $3, $4,
              $5, $6, $7, $8
            )`,
            [
              productId,
              sku,
              size,
              'Black',
              0,  // price_adjustment = 0 (no delta from base price)
              Math.floor(Math.random() * 50) + 10,  // quantity: 10-59
              5,  // low_stock_threshold
              true  // is_active
            ]
          );
          totalVariants++;
        }
        
        const priceDisplay = product.compareAtPrice 
          ? `$${product.price} (was $${product.compareAtPrice})`
          : `$${product.price}`;
        
        console.log(`✓ ${product.name} - ${priceDisplay} (${product.sizes.length} variants)`);
      }
    }
    
    console.log('\n' + '='.repeat(60));
    console.log('HYOW Product Seeding Complete!');
    console.log('='.repeat(60));
    console.log(`   Products created: ${totalProducts}`);
    console.log(`   Variants created: ${totalVariants}`);
    console.log('='.repeat(60) + '\n');
    
  } catch (error) {
    console.error('Error seeding products:', error);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

seedProducts();

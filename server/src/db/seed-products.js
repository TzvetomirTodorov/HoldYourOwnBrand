// HYOW Premium Product Seeder - Luxury Pricing Tier
// Schema-corrected: uses price, compare_at_price, status (NOT base_price, compare_price, is_active)

require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

const products = {
  tees: [
    {
      name: 'Red Flag Tee',
      slug: 'red-flag-tee',
      description: 'The signature HYOW statement piece. Premium Supima cotton with plastisol ink screen print. Cut and sewn in Los Angeles.',
      price: 175.00,
      compareAtPrice: 195.00,
      isFeatured: true,
      isNew: false,
      sizes: ['XS', 'S', 'M', 'L', 'XL', '2XL', '3XL'],
      stock: { XS: 8, S: 15, M: 25, L: 25, XL: 20, '2XL': 12, '3XL': 8 }
    },
    {
      name: 'Five Star General Tee',
      slug: 'five-star-general-tee',
      description: 'Hand-stitched embroidered stars on heavyweight Japanese cotton. 280 GSM brushed fleece interior.',
      price: 185.00,
      compareAtPrice: null,
      isFeatured: true,
      isNew: true,
      sizes: ['XS', 'S', 'M', 'L', 'XL', '2XL', '3XL'],
      stock: { XS: 6, S: 12, M: 20, L: 20, XL: 15, '2XL': 10, '3XL': 6 }
    },
    {
      name: 'From The Block Tee',
      slug: 'from-the-block-tee',
      description: 'Oversized drop-shoulder silhouette in Pima cotton. Embossed rubber patch detail.',
      price: 150.00,
      compareAtPrice: null,
      isFeatured: false,
      isNew: false,
      sizes: ['XS', 'S', 'M', 'L', 'XL', '2XL', '3XL'],
      stock: { XS: 10, S: 18, M: 30, L: 30, XL: 22, '2XL': 14, '3XL': 10 }
    },
    {
      name: 'Hold Your Own Script Tee',
      slug: 'hold-your-own-script-tee',
      description: 'Chain-stitch embroidery on 220 GSM combed cotton. Vintage wash finish.',
      price: 165.00,
      compareAtPrice: null,
      isFeatured: false,
      isNew: false,
      sizes: ['XS', 'S', 'M', 'L', 'XL', '2XL', '3XL'],
      stock: { XS: 8, S: 15, M: 25, L: 25, XL: 18, '2XL': 12, '3XL': 8 }
    },
    {
      name: 'Numbers Dont Lie Tee',
      slug: 'numbers-dont-lie-tee',
      description: 'Reflective ink print that reveals truth under light. Enzyme-washed for comfort.',
      price: 150.00,
      compareAtPrice: null,
      isFeatured: false,
      isNew: true,
      sizes: ['XS', 'S', 'M', 'L', 'XL', '2XL', '3XL'],
      stock: { XS: 12, S: 20, M: 35, L: 35, XL: 25, '2XL': 15, '3XL': 10 }
    },
    {
      name: 'Blood Ties Tee',
      slug: 'blood-ties-tee',
      description: 'Limited edition with foil-stamped accents on 260 GSM cotton. Only 500 pieces worldwide.',
      price: 185.00,
      compareAtPrice: 210.00,
      isFeatured: true,
      isNew: true,
      sizes: ['XS', 'S', 'M', 'L', 'XL', '2XL', '3XL'],
      stock: { XS: 5, S: 10, M: 15, L: 15, XL: 10, '2XL': 8, '3XL': 5 }
    },
    {
      name: 'Redemption Arc Tee',
      slug: 'redemption-arc-tee',
      description: 'Distressed vintage treatment with puff print details. 260 GSM ring-spun cotton.',
      price: 165.00,
      compareAtPrice: null,
      isFeatured: false,
      isNew: false,
      sizes: ['XS', 'S', 'M', 'L', 'XL', '2XL', '3XL'],
      stock: { XS: 10, S: 18, M: 28, L: 28, XL: 20, '2XL': 14, '3XL': 8 }
    }
  ],
  hoodies: [
    {
      name: 'HYOW Classic Hoodie',
      slug: 'hyow-classic-hoodie',
      description: 'The foundation piece. 16oz French terry with 3D puff embroidery. YKK hardware.',
      price: 295.00,
      compareAtPrice: null,
      isFeatured: true,
      isNew: false,
      sizes: ['XS', 'S', 'M', 'L', 'XL', '2XL', '3XL'],
      stock: { XS: 6, S: 12, M: 20, L: 20, XL: 15, '2XL': 10, '3XL': 6 }
    },
    {
      name: 'Red Flag Hoodie',
      slug: 'red-flag-hoodie',
      description: 'Full-zip with chenille patches and contrast satin lining. 14oz fleece, oversized fit.',
      price: 325.00,
      compareAtPrice: 365.00,
      isFeatured: true,
      isNew: false,
      sizes: ['XS', 'S', 'M', 'L', 'XL', '2XL', '3XL'],
      stock: { XS: 5, S: 10, M: 18, L: 18, XL: 12, '2XL': 8, '3XL': 5 }
    },
    {
      name: 'Street Scholar Hoodie',
      slug: 'street-scholar-hoodie',
      description: 'Multi-technique design: embroidery, screen print, and applique. 16oz cotton blend.',
      price: 295.00,
      compareAtPrice: null,
      isFeatured: false,
      isNew: true,
      sizes: ['XS', 'S', 'M', 'L', 'XL', '2XL', '3XL'],
      stock: { XS: 8, S: 14, M: 22, L: 22, XL: 16, '2XL': 10, '3XL': 6 }
    },
    {
      name: 'Night Shift Hoodie',
      slug: 'night-shift-hoodie',
      description: '3M reflective details on water-resistant shell. Fleece-lined with tech pockets.',
      price: 345.00,
      compareAtPrice: null,
      isFeatured: false,
      isNew: true,
      sizes: ['XS', 'S', 'M', 'L', 'XL', '2XL', '3XL'],
      stock: { XS: 5, S: 10, M: 16, L: 16, XL: 12, '2XL': 8, '3XL': 4 }
    },
    {
      name: 'Harlem Nights Hoodie',
      slug: 'harlem-nights-hoodie',
      description: 'LIMITED: Full-coverage embroidery front and back. Satin-lined hood, 18oz fleece. Only 250 pieces.',
      price: 425.00,
      compareAtPrice: 495.00,
      isFeatured: true,
      isNew: true,
      sizes: ['XS', 'S', 'M', 'L', 'XL', '2XL', '3XL'],
      stock: { XS: 3, S: 6, M: 10, L: 10, XL: 8, '2XL': 5, '3XL': 3 }
    }
  ],
  hats: [
    {
      name: 'HYOW Snapback',
      slug: 'hyow-snapback',
      description: '3D puff embroidery on wool-blend crown. Premium leather adjustable strap.',
      price: 145.00,
      compareAtPrice: null,
      isFeatured: true,
      isNew: false,
      sizes: ['One Size'],
      stock: { 'One Size': 50 }
    },
    {
      name: 'Red Flag Dad Hat',
      slug: 'red-flag-dad-hat',
      description: 'Tonal embroidery on washed cotton twill. Brass grommets, leather backstrap.',
      price: 125.00,
      compareAtPrice: null,
      isFeatured: false,
      isNew: false,
      sizes: ['One Size'],
      stock: { 'One Size': 60 }
    },
    {
      name: 'Block Beanie',
      slug: 'block-beanie',
      description: 'Scottish merino wool with leather logo patch. Ribbed knit construction.',
      price: 95.00,
      compareAtPrice: null,
      isFeatured: false,
      isNew: true,
      sizes: ['One Size'],
      stock: { 'One Size': 50 }
    },
    {
      name: 'Five Star Fitted',
      slug: 'five-star-fitted',
      description: 'Gold bullion wire embroidery on structured crown. Satin lining.',
      price: 175.00,
      compareAtPrice: 195.00,
      isFeatured: true,
      isNew: true,
      sizes: ['7', '7 1/8', '7 1/4', '7 3/8', '7 1/2', '7 5/8'],
      stock: { '7': 8, '7 1/8': 12, '7 1/4': 15, '7 3/8': 15, '7 1/2': 12, '7 5/8': 8 }
    }
  ],
  outerwear: [
    {
      name: 'HYOW Bomber Jacket',
      slug: 'hyow-bomber-jacket',
      description: 'MA-1 silhouette in water-resistant nylon. Full back chain-stitch embroidery, orange satin lining.',
      price: 495.00,
      compareAtPrice: null,
      isFeatured: true,
      isNew: true,
      sizes: ['S', 'M', 'L', 'XL', '2XL'],
      stock: { S: 8, M: 12, L: 12, XL: 10, '2XL': 6 }
    },
    {
      name: 'Red Flag Coaches Jacket',
      slug: 'red-flag-coaches-jacket',
      description: 'Heavyweight cotton twill with 3M reflective accents. Quilted lining.',
      price: 395.00,
      compareAtPrice: 445.00,
      isFeatured: false,
      isNew: false,
      sizes: ['S', 'M', 'L', 'XL', '2XL'],
      stock: { S: 10, M: 15, L: 15, XL: 12, '2XL': 8 }
    },
    {
      name: 'Street General Puffer Vest',
      slug: 'street-general-puffer-vest',
      description: 'Down-filled vest with embroidered chest patch. Stand collar, zippered pockets.',
      price: 345.00,
      compareAtPrice: null,
      isFeatured: false,
      isNew: true,
      sizes: ['S', 'M', 'L', 'XL', '2XL'],
      stock: { S: 12, M: 18, L: 18, XL: 14, '2XL': 8 }
    },
    {
      name: 'Harlem Varsity Jacket',
      slug: 'harlem-varsity-jacket',
      description: 'LIMITED: Wool body, genuine leather sleeves. Chenille patches, satin lining. Only 100 pieces.',
      price: 695.00,
      compareAtPrice: 795.00,
      isFeatured: true,
      isNew: true,
      sizes: ['S', 'M', 'L', 'XL', '2XL'],
      stock: { S: 5, M: 8, L: 8, XL: 6, '2XL': 3 }
    }
  ],
  bottoms: [
    {
      name: 'HYOW Essential Joggers',
      slug: 'hyow-essential-joggers',
      description: 'Heavyweight French terry with embroidered logo. Zippered side pocket.',
      price: 195.00,
      compareAtPrice: null,
      isFeatured: true,
      isNew: false,
      sizes: ['S', 'M', 'L', 'XL', '2XL'],
      stock: { S: 15, M: 25, L: 25, XL: 18, '2XL': 10 }
    },
    {
      name: 'Five Star Cargo Pants',
      slug: 'five-star-cargo-pants',
      description: 'Cotton ripstop with 6 utility pockets. Embroidered star details.',
      price: 275.00,
      compareAtPrice: null,
      isFeatured: false,
      isNew: true,
      sizes: ['S', 'M', 'L', 'XL', '2XL'],
      stock: { S: 12, M: 18, L: 18, XL: 14, '2XL': 8 }
    },
    {
      name: 'Block Shorts',
      slug: 'block-shorts',
      description: 'Mesh basketball shorts with embroidered branding. Moisture-wicking.',
      price: 145.00,
      compareAtPrice: null,
      isFeatured: false,
      isNew: false,
      sizes: ['S', 'M', 'L', 'XL', '2XL'],
      stock: { S: 20, M: 30, L: 30, XL: 22, '2XL': 12 }
    },
    {
      name: 'Redemption Track Pants',
      slug: 'redemption-track-pants',
      description: 'Acetate blend with contrast side stripe. Full-length side zippers.',
      price: 225.00,
      compareAtPrice: 265.00,
      isFeatured: true,
      isNew: true,
      sizes: ['S', 'M', 'L', 'XL', '2XL'],
      stock: { S: 14, M: 22, L: 22, XL: 16, '2XL': 10 }
    }
  ],
  accessories: [
    {
      name: 'HYOW Duffle Bag',
      slug: 'hyow-duffle-bag',
      description: 'Full-grain leather with brass hardware. Interior laptop sleeve. Handcrafted in NYC.',
      price: 395.00,
      compareAtPrice: null,
      isFeatured: true,
      isNew: false,
      sizes: ['One Size'],
      stock: { 'One Size': 20 }
    },
    {
      name: 'Red Flag Keychain',
      slug: 'red-flag-keychain',
      description: 'Solid brass with hard enamel fill. Split ring and lobster clasp.',
      price: 65.00,
      compareAtPrice: null,
      isFeatured: false,
      isNew: false,
      sizes: ['One Size'],
      stock: { 'One Size': 100 }
    },
    {
      name: 'Hold Your Own Wristband Set',
      slug: 'hold-your-own-wristband-set',
      description: '3-pack silicone wristbands in black, white, and red. Collectible tin.',
      price: 45.00,
      compareAtPrice: null,
      isFeatured: false,
      isNew: true,
      sizes: ['One Size'],
      stock: { 'One Size': 150 }
    },
    {
      name: 'Street Wisdom Pin Set',
      slug: 'street-wisdom-pin-set',
      description: '5 gold-plated enamel pins with HYOW mantras. Limited to 1000 numbered sets.',
      price: 125.00,
      compareAtPrice: 145.00,
      isFeatured: true,
      isNew: true,
      sizes: ['One Size'],
      stock: { 'One Size': 75 }
    },
    {
      name: 'HYOW Phone Case',
      slug: 'hyow-phone-case',
      description: 'Genuine leather case with MagSafe. Laser-etched logo.',
      price: 85.00,
      compareAtPrice: null,
      isFeatured: false,
      isNew: true,
      sizes: ['iPhone 14 Pro', 'iPhone 15 Pro', 'iPhone 15 Pro Max'],
      stock: { 'iPhone 14 Pro': 30, 'iPhone 15 Pro': 40, 'iPhone 15 Pro Max': 40 }
    },
    {
      name: 'Redemption Journal',
      slug: 'redemption-journal',
      description: 'Italian leather cover with gold-foil debossed logo. 200 pages.',
      price: 145.00,
      compareAtPrice: null,
      isFeatured: false,
      isNew: false,
      sizes: ['One Size'],
      stock: { 'One Size': 50 }
    }
  ]
};

async function seedProducts() {
  const client = await pool.connect();
  try {
    console.log('Starting HYOW premium product seeding...\n');

    const categoriesResult = await client.query('SELECT id, slug FROM categories');
    const categoryMap = {};
    categoriesResult.rows.forEach(cat => { categoryMap[cat.slug] = cat.id; });
    console.log('Found categories:', Object.keys(categoryMap).join(', '));

    if (!categoryMap['outerwear']) {
      const result = await client.query(
        "INSERT INTO categories (id, name, slug, description) VALUES (gen_random_uuid(), 'Outerwear', 'outerwear', 'Premium jackets and outerwear') RETURNING id"
      );
      categoryMap['outerwear'] = result.rows[0].id;
      console.log('Created Outerwear category');
    }

    if (!categoryMap['bottoms']) {
      const result = await client.query(
        "INSERT INTO categories (id, name, slug, description) VALUES (gen_random_uuid(), 'Bottoms', 'bottoms', 'Joggers, pants, and shorts') RETURNING id"
      );
      categoryMap['bottoms'] = result.rows[0].id;
      console.log('Created Bottoms category');
    }

    console.log('\nClearing existing products...');
    await client.query('DELETE FROM product_variants');
    await client.query('DELETE FROM products');
    console.log('Cleared existing data\n');

    let totalProducts = 0;
    let totalVariants = 0;

    for (const [categoryKey, productList] of Object.entries(products)) {
      const categoryId = categoryMap[categoryKey];
      if (!categoryId) {
        console.log('Category not found:', categoryKey);
        continue;
      }

      console.log('\n' + categoryKey.toUpperCase());
      console.log('-'.repeat(50));

      for (const product of productList) {
        // CORRECT COLUMNS: price, compare_at_price, status
        const productResult = await client.query(
          `INSERT INTO products (id, category_id, name, slug, description, price, compare_at_price, status, is_featured, is_new)
           VALUES (gen_random_uuid(), $1, $2, $3, $4, $5, $6, 'active', $7, $8)
           RETURNING id`,
          [categoryId, product.name, product.slug, product.description, product.price, product.compareAtPrice, product.isFeatured, product.isNew]
        );

        const productId = productResult.rows[0].id;
        let variantCount = 0;

        for (const size of product.sizes) {
          const stock = product.stock[size] || 10;
          await client.query(
            `INSERT INTO product_variants (id, product_id, sku, size, price, stock_quantity, is_active)
             VALUES (gen_random_uuid(), $1, $2, $3, $4, $5, true)`,
            [productId, 'HYOW-' + product.slug + '-' + size.toLowerCase().replace(/[^a-z0-9]/g, ''), size, product.price, stock]
          );
          variantCount++;
          totalVariants++;
        }

        const priceDisplay = product.compareAtPrice
          ? '$' + product.price.toFixed(2) + ' (was $' + product.compareAtPrice.toFixed(2) + ')'
          : '$' + product.price.toFixed(2);
        console.log('  ' + product.name + ' - ' + priceDisplay + ' (' + variantCount + ' variants)');
        totalProducts++;
      }
    }

    console.log('\n' + '='.repeat(60));
    console.log('HYOW Premium Product Seeding Complete!');
    console.log('='.repeat(60));
    console.log('   Products created: ' + totalProducts);
    console.log('   Variants created: ' + totalVariants);
    console.log('='.repeat(60));
    console.log('\nPRICE RANGES:');
    console.log('   T-Shirts:    $150 - $195');
    console.log('   Hoodies:     $295 - $425');
    console.log('   Hats:        $95  - $175');
    console.log('   Outerwear:   $345 - $695');
    console.log('   Bottoms:     $145 - $275');
    console.log('   Accessories: $45  - $395');

  } catch (error) {
    console.error('Error seeding products:', error);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

seedProducts();

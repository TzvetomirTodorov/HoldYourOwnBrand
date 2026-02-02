# HYOW E-Commerce - Automated Image Processor

This script automatically crops product images from your composite images, uploads them to Cloudinary, and updates your PostgreSQL database with the image URLs.

## Quick Start

### 1. Setup Files

Copy these files to your `HoldYourOwnBrand` project root:
- `process-images.js` (the main script)
- Your composite images renamed as:
  - `product-grid.jpg` (the hats/outerwear/bottoms/accessories grid - image__55_.jpg)
  - `tees-hoodies-composite.jpg` (the tees and hoodies grid - image__49_.jpg)
  - `redflag-individual.jpg` (image__39_.jpg)
  - `hoodie-individual.jpg` (image__43_.jpg)
  - `trackjacket-individual.jpg` (image__42_.jpg)

### 2. Install Dependencies

```bash
cd ~/OneDrive/Documents/PersonalProjects/HoldYourOwnBrand
npm install sharp cloudinary pg
```

### 3. Run the Script

```bash
DATABASE_URL=$(railway run --service Postgres printenv DATABASE_PUBLIC_URL) node process-images.js
```

## What It Does

1. **Crops individual products** from your composite images
2. **Uploads to Cloudinary** with consistent 800x800px dimensions
3. **Updates the database** with the Cloudinary URLs

## Products Processed

### From Grid Composite (product-grid.jpg):
- Crown Snapback, Street Fitted, Boss Beanie, Vintage Dad Hat
- Empire Bomber, Street Legend Denim, Reign Coach, Apex Leather
- Executive Track Pants, Street Cargo, Boss Denim, Legacy Shorts
- Crown Chain, Street Duffle, Money Clip Wallet, Empire Backpack, Boss Belt

### From Tees/Hoodies Composite (tees-hoodies-composite.jpg):
- Five Star General Tee, From The Block Tee, Money Talk Tee
- Street Dreams Tee, Boss Up Tee, Legacy Tee
- Street King Hoodie, Grind Mode Hoodie, Visionary Pullover

### Individual Images:
- Red Flag Tee
- Crown Heavyweight Hoodie
- Empire Zip Hoodie

### Placeholders:
- Street Socks 3-Pack

## Troubleshooting

**"DATABASE_URL not set"**
Make sure you run the script with the Railway environment variable:
```bash
DATABASE_URL=$(railway run --service Postgres printenv DATABASE_PUBLIC_URL) node process-images.js
```

**"Grid composite not found"**
Rename your image files to match the expected names (product-grid.jpg, etc.)

**"Product not found in database"**
The product slug in the database doesn't match. Check your products table slugs.

## Cloudinary Configuration

Already configured for your account:
- Cloud name: `holdyourownbrand`
- Folder: `hyow-products`
- Images stored at: `https://res.cloudinary.com/holdyourownbrand/image/upload/hyow-products/[slug]`

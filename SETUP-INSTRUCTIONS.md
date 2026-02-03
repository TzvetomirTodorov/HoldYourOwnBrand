# HYOW Fix Instructions

## Current Issues and Solutions

### Issue 1: T-Shirts Category Shows "No Products Found"

**Cause**: Categories don't exist in the database, or products aren't assigned to categories.

**Solution**: Run the database fix script on Railway:

```bash
# Option 1: Using Railway CLI
railway run node server/scripts/fix-database.js

# Option 2: Set DATABASE_URL and run locally
DATABASE_URL="your_railway_postgresql_url" node server/scripts/fix-database.js
```

This script will:
1. Create all required categories (T-Shirts, Hoodies, Hats, Accessories, Outerwear, Bottoms)
2. Automatically assign products to categories based on their names
3. Show a summary of what was fixed

---

### Issue 2: Address Autocomplete Not Working in Checkout

**Cause**: The `VITE_RADAR_PUBLISHABLE_KEY` environment variable is not set in Vercel.

**Solution**: 

1. Go to [Radar.io](https://radar.com) and create a free account
2. Get your Publishable Key from the dashboard
3. In Vercel Dashboard:
   - Go to your project → Settings → Environment Variables
   - Add: `VITE_RADAR_PUBLISHABLE_KEY` = `prj_live_pk_xxxxx` (your key)
4. Redeploy the frontend

---

### Issue 3: Profile Icon Behavior

**Expected behavior**:
- When **NOT logged in**: Click → goes to `/login`
- When **logged in**: Click → opens dropdown menu with Account, Orders, Wishlist, Sign Out

If this isn't working, clear your browser's localStorage and refresh:
1. Open DevTools (F12)
2. Go to Application → Local Storage
3. Delete the `hyow-auth` key
4. Refresh the page

---

## Environment Variables Reference

### Vercel (Frontend) - Required:
```
VITE_API_URL=https://holdyourownbrand-production.up.railway.app
VITE_STRIPE_PUBLISHABLE_KEY=pk_live_xxxxx
VITE_RADAR_PUBLISHABLE_KEY=prj_live_pk_xxxxx
```

### Railway (Backend) - Required:
```
DATABASE_URL=(auto-set by Railway)
STRIPE_SECRET_KEY=sk_live_xxxxx
STRIPE_WEBHOOK_SECRET=whsec_xxxxx
JWT_SECRET=your_secure_jwt_secret
FRONTEND_URL=https://client-phi-tawny.vercel.app
```

---

## Quick Fix Commands

```bash
# 1. Pull latest code
git pull

# 2. Deploy backend fix
./scaffold-commits.sh "fix: database categories and checkout improvements"

# 3. After deploy, run database fix on Railway
railway run node server/scripts/fix-database.js

# 4. Set Vercel environment variables via dashboard, then redeploy
```

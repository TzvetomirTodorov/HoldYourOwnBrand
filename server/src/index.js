// HYOW E-Commerce - Express Server
// This is the main entry point for the backend API

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const { Pool } = require('pg');

// Import routes
const authRoutes = require('./routes/auth');
const productsRoutes = require('./routes/products');
const categoriesRoutes = require('./routes/categories');
const cartRoutes = require('./routes/cart');
const checkoutRoutes = require('./routes/checkout');
const ordersRoutes = require('./routes/orders');
const usersRoutes = require('./routes/users');
const adminRoutes = require('./routes/admin');
const webhooksRoutes = require('./routes/webhooks');

const app = express();

// Trust first proxy (Railway runs behind a load balancer)
// This is CRITICAL for rate limiting and secure cookies to work correctly
app.set('trust proxy', 1);

// =============================================================================
// CORS CONFIGURATION - CRITICAL FOR FRONTEND CONNECTION
// =============================================================================
// 
// This configuration allows the Vercel-hosted frontend to communicate with
// the Railway-hosted backend. The CLIENT_URL environment variable must be
// set in Railway to the exact origin of the frontend (no trailing slash).
//

// This array is what matters - make sure it includes all your domains
const allowedOrigins = [
  // Production domains (after custom domain setup)
  'https://holdyourownbrand.com',
  'https://www.holdyourownbrand.com',
  
  // Current Vercel deployment (keep until DNS propagates)
  'https://client-phi-tawny.vercel.app',
  
  // Local development
  'http://localhost:5173',
  'http://localhost:3000',
];

// Your existing corsOptions function uses this array, so it's already set up correctly
const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (mobile apps, curl, Postman, etc.)
    if (!origin) {
      return callback(null, true);
    }

    // Check if origin is in allowed list
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    // Allow Vercel preview deployments (dynamic URLs)
    // Pattern: https://holdyourownbrand-*-tzvetomirtodorovs-projects.vercel.app
    // or: https://client-*-tzvetomirtodorovs-projects.vercel.app
    const vercelPreviewPattern = /^https:\/\/(holdyourownbrand|client)-[a-z0-9]+-tzvetomirtodorovs-projects\.vercel\.app$/;
    if (vercelPreviewPattern.test(origin)) {
      console.log('✅ CORS allowed Vercel preview:', origin);
      return callback(null, true);
    }

    // Log rejected origins for debugging
    console.warn('⚠️ CORS rejected origin:', origin);
    console.warn('   Allowed origins:', allowedOrigins);

    callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: [
    'Content-Type',
    'Authorization',
    'X-Requested-With',
    'Accept',
    'Origin',
  ],
  exposedHeaders: ['Set-Cookie'],
  maxAge: 86400,
};

// Apply CORS middleware BEFORE other middleware
app.use(cors(corsOptions));

// Handle preflight requests explicitly for all routes
app.options('*', cors(corsOptions));

// =============================================================================
// SECURITY & PARSING MIDDLEWARE
// =============================================================================

// Security headers (but allow CORS to override where needed)
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' },
  crossOriginOpenerPolicy: { policy: 'same-origin-allow-popups' },
}));

// Parse JSON bodies (except for webhooks which need raw body)
app.use((req, res, next) => {
  if (req.originalUrl === '/api/webhooks/stripe') {
    next();
  } else {
    express.json({ limit: '10mb' })(req, res, next);
  }
});

// Parse URL-encoded bodies
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// =============================================================================
// RATE LIMITING
// =============================================================================

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,     // 15 minutes
  max: 100,                     // limit each IP to 100 requests per window
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests', message: 'Please try again later' },
});

// Apply rate limiting to API routes only (not webhooks)
app.use('/api', (req, res, next) => {
  if (req.path.startsWith('/webhooks')) {
    return next();
  }
  limiter(req, res, next);
});

// =============================================================================
// DATABASE CONNECTION
// =============================================================================

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
});

// Make pool available to routes
app.locals.pool = pool;

// =============================================================================
// HEALTH CHECK ENDPOINT
// =============================================================================

app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    cors: {
      clientUrl: process.env.CLIENT_URL || 'NOT SET',
      allowedOrigins: allowedOrigins,
    },
  });
});

// =============================================================================
// API ROUTES
// =============================================================================

app.use('/api/auth', authRoutes);
app.use('/api/products', productsRoutes);
app.use('/api/categories', categoriesRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/checkout', checkoutRoutes);
app.use('/api/orders', ordersRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/webhooks', webhooksRoutes);

// =============================================================================
// ERROR HANDLING
// =============================================================================

// 404 handler for unknown routes
app.use((req, res) => {
  res.status(404).json({
    error: 'Not Found',
    message: `The requested resource ${req.path} does not exist`,
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('❌ Server error:', err);
  
  // Handle CORS errors specifically
  if (err.message === 'Not allowed by CORS') {
    return res.status(403).json({
      error: 'CORS Error',
      message: 'Origin not allowed',
      allowedOrigins: allowedOrigins,
    });
  }
  
  res.status(err.status || 500).json({
    error: err.name || 'Internal Server Error',
    message: process.env.NODE_ENV === 'production' 
      ? 'An unexpected error occurred' 
      : err.message,
  });
});

// =============================================================================
// START SERVER
// =============================================================================

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log('');
  console.log('══════════════════════════════════════════════════════════════');
  console.log('  🏪 HYOW E-Commerce Backend');
  console.log('══════════════════════════════════════════════════════════════');
  console.log(`  ✅ Server running on port ${PORT}`);
  console.log(`  🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`  🔗 Client URL: ${process.env.CLIENT_URL || 'NOT SET'}`);
  console.log('══════════════════════════════════════════════════════════════');
  console.log('');
});

module.exports = app;

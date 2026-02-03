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
    // Pattern matches: https://holdyourownbrand-XXXX-tzvetomirtodorovs-projects.vercel.app
    // or: https://client-XXXX-tzvetomirtodorovs-projects.vercel.app
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

// Apply CORS middleware
app.use(cors(corsOptions));

// Handle preflight requests explicitly
app.options('*', cors(corsOptions));

// Security middleware
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' },
  contentSecurityPolicy: false, // Disable CSP for API
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: { error: 'Too many requests, please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
});

// Apply rate limiter to all requests except webhooks
app.use((req, res, next) => {
  if (req.path.startsWith('/api/webhooks')) {
    return next();
  }
  limiter(req, res, next);
});

// Body parsing middleware
// IMPORTANT: Webhooks need raw body for signature verification
app.use('/api/webhooks', express.raw({ type: 'application/json' }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging in development
if (process.env.NODE_ENV !== 'production') {
  app.use((req, res, next) => {
    console.log(`${req.method} ${req.path}`);
    next();
  });
}

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

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
  });
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'HYOW E-Commerce API',
    version: '1.0.0',
    documentation: '/api/health',
  });
});

// =============================================================================
// ERROR HANDLING
// =============================================================================

// 404 handler
app.use((req, res, next) => {
  res.status(404).json({
    error: 'Not Found',
    message: `Cannot ${req.method} ${req.path}`,
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
    });
  }

  // Handle known operational errors
  if (err.isOperational) {
    return res.status(err.statusCode || 400).json({
      error: err.message,
    });
  }

  // Handle unknown errors
  res.status(500).json({
    error: 'Internal Server Error',
    message: process.env.NODE_ENV === 'production'
      ? 'Something went wrong'
      : err.message,
  });
});

// =============================================================================
// SERVER STARTUP
// =============================================================================

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log('\n══════════════════════════════════════════════════════════════');
  console.log('  🛍️ HYOW E-Commerce Backend');
  console.log('══════════════════════════════════════════════════════════════');
  console.log(`  ✅ Server running on port ${PORT}`);
  console.log(`  🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`  🔗 Client URL: ${process.env.CLIENT_URL || 'Not set'}`);
  console.log('══════════════════════════════════════════════════════════════\n');
});

module.exports = app;

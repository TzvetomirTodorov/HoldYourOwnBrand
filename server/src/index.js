/**
 * Hold Your Own Brand - API Server
 * 
 * This is the main entry point for the Express server. It sets up all the
 * middleware, routes, and starts listening for requests.
 * 
 * Security is a top priority, so we use:
 * - Helmet for HTTP security headers
 * - CORS with restricted origins
 * - Rate limiting to prevent abuse
 * - Input validation on all routes
 */

require('dotenv').config();

const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const rateLimit = require('express-rate-limit');

// Import route modules
const authRoutes = require('./routes/auth');
const productRoutes = require('./routes/products');
const categoryRoutes = require('./routes/categories');
const cartRoutes = require('./routes/cart');
const orderRoutes = require('./routes/orders');
const userRoutes = require('./routes/users');
const adminRoutes = require('./routes/admin');
const webhookRoutes = require('./routes/webhooks');

// Import middleware
const { errorHandler } = require('./middleware/errorHandler');

// Initialize Express app
const app = express();

// ===========================================
// SECURITY MIDDLEWARE
// ===========================================

// Helmet adds various HTTP headers that help protect against common attacks
// like XSS, clickjacking, and other code injection attacks
app.set('trust proxy', 1);
app.use(helmet());

// Configure CORS (Cross-Origin Resource Sharing)
// This controls which domains can make requests to our API
const corsOptions = {
  origin: process.env.NODE_ENV === 'production'
    ? [
        'https://holdyourownbrand.com',
        'https://www.holdyourownbrand.com',
        // Add other production domains as needed
      ]
    : ['http://localhost:5173', 'http://localhost:3000'], // Development origins
  credentials: true, // Allow cookies to be sent with requests
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
};
app.use(cors(corsOptions));

// Rate limiting to prevent brute force and DoS attacks
// This limits each IP to a certain number of requests per time window
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100, // 100 requests per window
  message: {
    error: 'Too many requests, please try again later.',
    retryAfter: '15 minutes'
  },
  standardHeaders: true, // Return rate limit info in headers
  legacyHeaders: false
});
app.use('/api/', limiter);

// Stricter rate limit for authentication endpoints (prevent brute force attacks)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // Only 10 login attempts per 15 minutes
  message: {
    error: 'Too many login attempts, please try again later.',
    retryAfter: '15 minutes'
  }
});

// ===========================================
// BODY PARSING MIDDLEWARE
// ===========================================

// Note: Stripe webhooks need the raw body, so we handle that route specially
app.use('/api/webhooks/stripe', express.raw({ type: 'application/json' }));

// For all other routes, parse JSON bodies
app.use(express.json({ limit: '10mb' }));

// Parse URL-encoded bodies (for form submissions)
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// ===========================================
// HEALTH CHECK
// ===========================================

// Simple health check endpoint for monitoring and Railway
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// ===========================================
// API ROUTES
// ===========================================

// Apply stricter rate limiting to auth routes
app.use('/api/auth', authLimiter, authRoutes);

// Standard API routes
app.use('/api/products', productRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/users', userRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/webhooks', webhookRoutes);

// ===========================================
// ERROR HANDLING
// ===========================================

// 404 handler for unknown routes
app.use((req, res) => {
  res.status(404).json({
    error: 'Not Found',
    message: `The requested resource ${req.originalUrl} does not exist`
  });
});

// Global error handler (must be last middleware)
app.use(errorHandler);

// ===========================================
// START SERVER
// ===========================================

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log(`
╔═══════════════════════════════════════════════════════════╗
║                                                           ║
║   🔥 HOLD YOUR OWN BRAND - API Server                     ║
║                                                           ║
║   Status:      Running                                    ║
║   Port:        ${PORT}                                        ║
║   Environment: ${process.env.NODE_ENV || 'development'}                              ║
║                                                           ║
║   Own Your Narrative. Own Your Future.                    ║
║                                                           ║
╚═══════════════════════════════════════════════════════════╝
  `);
});

module.exports = app;

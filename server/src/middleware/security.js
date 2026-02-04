/**
 * Security Middleware for HYOW E-commerce
 * 
 * Implements industry-standard e-commerce security:
 * - Helmet.js for security headers (CSP, HSTS, etc.)
 * - Rate limiting (general + aggressive for auth/checkout)
 * - Bot detection helpers
 * - Request sanitization
 * 
 * Based on PCI DSS v4.0.1 and OWASP guidelines
 */

const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const { RateLimiterMemory } = require('rate-limiter-flexible');

// ═══════════════════════════════════════════════════════════════════════════
// HELMET SECURITY HEADERS
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Configure Helmet with e-commerce optimized settings
 */
const helmetConfig = helmet({
  // Content Security Policy
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: [
        "'self'",
        "'unsafe-inline'", // Required for some React patterns
        'https://js.stripe.com', // Stripe Elements
        'https://www.googletagmanager.com',
        'https://www.google-analytics.com',
      ],
      styleSrc: [
        "'self'",
        "'unsafe-inline'", // Required for styled-components/Tailwind
        'https://fonts.googleapis.com',
      ],
      fontSrc: [
        "'self'",
        'https://fonts.gstatic.com',
      ],
      imgSrc: [
        "'self'",
        'data:',
        'blob:',
        'https://*.stripe.com',
        'https://res.cloudinary.com', // If using Cloudinary for images
        'https://images.unsplash.com', // Placeholder images
      ],
      frameSrc: [
        "'self'",
        'https://js.stripe.com', // Stripe 3D Secure iframes
        'https://hooks.stripe.com',
      ],
      connectSrc: [
        "'self'",
        'https://api.stripe.com',
        'https://www.google-analytics.com',
        process.env.API_URL || 'http://localhost:3000',
      ],
      objectSrc: ["'none'"],
      baseUri: ["'self'"],
      formAction: ["'self'"],
      frameAncestors: ["'none'"], // Prevent clickjacking
    },
  },
  
  // HTTP Strict Transport Security
  hsts: {
    maxAge: 31536000, // 1 year
    includeSubDomains: true,
    preload: true,
  },
  
  // Prevent MIME type sniffing
  noSniff: true,
  
  // XSS Protection (legacy browsers)
  xssFilter: true,
  
  // Prevent clickjacking
  frameguard: {
    action: 'deny',
  },
  
  // Hide X-Powered-By header
  hidePoweredBy: true,
  
  // Referrer Policy
  referrerPolicy: {
    policy: 'strict-origin-when-cross-origin',
  },
  
  // Don't cache sensitive pages
  // (We'll set cache headers per-route for static assets)
});

// ═══════════════════════════════════════════════════════════════════════════
// RATE LIMITING
// ═══════════════════════════════════════════════════════════════════════════

/**
 * General API rate limiter
 * 100 requests per minute per IP
 */
const generalRateLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 100, // 100 requests per minute
  message: {
    error: 'Too many requests',
    message: 'Please slow down. Try again in a minute.',
    retryAfter: 60,
  },
  standardHeaders: true, // Return rate limit info in headers
  legacyHeaders: false,
  keyGenerator: (req) => {
    // Use X-Forwarded-For for proxied requests (Vercel, Railway, etc.)
    return req.headers['x-forwarded-for']?.split(',')[0] || req.ip;
  },
});

/**
 * Strict rate limiter for authentication endpoints
 * Prevents brute force attacks
 * 5 attempts per 15 minutes per IP
 */
const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 attempts per window
  message: {
    error: 'Too many login attempts',
    message: 'Too many failed attempts. Please try again in 15 minutes.',
    retryAfter: 900,
  },
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true, // Only count failed attempts
});

/**
 * Checkout rate limiter
 * Prevents automated checkout bots during drops
 * 10 checkout attempts per minute per IP
 */
const checkoutRateLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 10, // 10 attempts per minute
  message: {
    error: 'Checkout rate limit exceeded',
    message: 'Please slow down. You can try again shortly.',
    retryAfter: 60,
  },
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * Add to cart rate limiter
 * Prevents cart-stuffing during drops
 * 30 add-to-cart per minute per IP
 */
const addToCartRateLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 30, // 30 adds per minute
  message: {
    error: 'Add to cart rate limit exceeded',
    message: 'Too many add-to-cart requests. Please slow down.',
    retryAfter: 60,
  },
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * Password reset rate limiter
 * Prevents email bombing
 * 3 requests per hour per IP
 */
const passwordResetRateLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 3,
  message: {
    error: 'Too many password reset requests',
    message: 'Please check your email. You can request another reset in 1 hour.',
    retryAfter: 3600,
  },
});

// ═══════════════════════════════════════════════════════════════════════════
// DROP-SPECIFIC RATE LIMITING (In-memory, more flexible)
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Advanced rate limiter for product drops
 * Uses rate-limiter-flexible for more control
 */
const dropRateLimiter = new RateLimiterMemory({
  points: 5, // 5 requests
  duration: 10, // Per 10 seconds during drops
  blockDuration: 30, // Block for 30 seconds if exceeded
});

/**
 * Middleware to check drop rate limit
 */
const checkDropRateLimit = async (req, res, next) => {
  // Only apply during active drops (check a flag or time-based)
  const isDropActive = req.headers['x-drop-active'] === 'true' || process.env.DROP_ACTIVE === 'true';
  
  if (!isDropActive) {
    return next();
  }

  const ip = req.headers['x-forwarded-for']?.split(',')[0] || req.ip;
  
  try {
    await dropRateLimiter.consume(ip);
    next();
  } catch (rateLimiterRes) {
    res.status(429).json({
      error: 'Too fast!',
      message: 'Slow down during the drop. Fair access for everyone.',
      retryAfter: Math.ceil(rateLimiterRes.msBeforeNext / 1000),
    });
  }
};

// ═══════════════════════════════════════════════════════════════════════════
// BOT DETECTION HELPERS
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Simple bot detection based on behavioral signals
 * For production, integrate with Cloudflare Turnstile or similar
 */
const botDetection = (req, res, next) => {
  const userAgent = req.headers['user-agent'] || '';
  const acceptLanguage = req.headers['accept-language'];
  
  // Red flags for bot behavior
  const redFlags = [];
  
  // No User-Agent
  if (!userAgent) {
    redFlags.push('missing-ua');
  }
  
  // Known bot user agents
  const botPatterns = [
    /curl/i,
    /wget/i,
    /python-requests/i,
    /java\//i,
    /perl/i,
    /php/i,
    /go-http-client/i,
    /libwww/i,
    /scrapy/i,
  ];
  
  if (botPatterns.some(pattern => pattern.test(userAgent))) {
    redFlags.push('bot-ua');
  }
  
  // No Accept-Language (browsers always send this)
  if (!acceptLanguage) {
    redFlags.push('missing-accept-language');
  }
  
  // Attach bot score to request for downstream use
  req.botScore = redFlags.length;
  req.botFlags = redFlags;
  
  // Block obvious bots on sensitive endpoints
  if (redFlags.length >= 2 && req.path.includes('/checkout')) {
    console.warn(`Blocked suspected bot: ${req.ip}, flags: ${redFlags.join(', ')}`);
    return res.status(403).json({
      error: 'Access denied',
      message: 'Automated access is not allowed.',
    });
  }
  
  next();
};

// ═══════════════════════════════════════════════════════════════════════════
// REQUEST TIMING ANALYSIS
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Track request timing for behavioral analysis
 * Bots tend to have unnaturally fast/consistent timing
 */
const requestTimingMap = new Map();

const trackRequestTiming = (req, res, next) => {
  const ip = req.headers['x-forwarded-for']?.split(',')[0] || req.ip;
  const now = Date.now();
  
  const history = requestTimingMap.get(ip) || [];
  history.push(now);
  
  // Keep last 10 requests
  if (history.length > 10) {
    history.shift();
  }
  
  requestTimingMap.set(ip, history);
  
  // Check for suspicious patterns (less than 100ms between requests)
  if (history.length >= 3) {
    const intervals = [];
    for (let i = 1; i < history.length; i++) {
      intervals.push(history[i] - history[i-1]);
    }
    
    const avgInterval = intervals.reduce((a, b) => a + b, 0) / intervals.length;
    
    // Flag if average interval is suspiciously low
    if (avgInterval < 100) {
      req.suspiciousTiming = true;
    }
  }
  
  // Clean up old entries periodically
  if (Math.random() < 0.01) { // 1% chance per request
    const cutoff = now - 60000; // 1 minute ago
    for (const [key, value] of requestTimingMap) {
      if (value[value.length - 1] < cutoff) {
        requestTimingMap.delete(key);
      }
    }
  }
  
  next();
};

// ═══════════════════════════════════════════════════════════════════════════
// EXPORT ALL MIDDLEWARE
// ═══════════════════════════════════════════════════════════════════════════

module.exports = {
  // Security headers
  helmetConfig,
  
  // Rate limiters
  generalRateLimiter,
  authRateLimiter,
  checkoutRateLimiter,
  addToCartRateLimiter,
  passwordResetRateLimiter,
  checkDropRateLimit,
  
  // Bot detection
  botDetection,
  trackRequestTiming,
  
  // Convenience function to apply all security middleware
  applySecurityMiddleware: (app) => {
    app.use(helmetConfig);
    app.use(generalRateLimiter);
    app.use(botDetection);
    app.use(trackRequestTiming);
    
    // Apply specific limiters to routes
    app.use('/api/auth/login', authRateLimiter);
    app.use('/api/auth/register', authRateLimiter);
    app.use('/api/auth/forgot-password', passwordResetRateLimiter);
    app.use('/api/checkout', checkoutRateLimiter);
    app.use('/api/cart/items', addToCartRateLimiter);
  },
};

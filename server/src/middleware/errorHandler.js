/**
 * Error Handler Middleware
 * 
 * This middleware catches all errors that occur during request processing
 * and sends appropriate responses to the client. It also logs errors for
 * debugging purposes.
 * 
 * The middleware distinguishes between operational errors (expected errors
 * like validation failures) and programming errors (bugs), handling each
 * appropriately.
 */

/**
 * Custom error class for operational errors
 * 
 * Use this when you want to throw an error that should be sent to the client,
 * like validation errors or "not found" errors.
 */
class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;

    // Capture the stack trace, excluding this constructor
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Global error handler middleware
 * 
 * Express recognizes this as an error handler because it has 4 parameters.
 * When next(error) is called anywhere in the app, this middleware handles it.
 */
const errorHandler = (err, req, res, next) => {
  // Default to 500 Internal Server Error if no status code is set
  err.statusCode = err.statusCode || 500;

  // Log the error for debugging (in development, log everything)
  if (process.env.NODE_ENV === 'development') {
    console.error('❌ Error:', {
      message: err.message,
      stack: err.stack,
      statusCode: err.statusCode
    });
  } else {
    // In production, only log non-operational errors (bugs)
    if (!err.isOperational) {
      console.error('❌ CRITICAL ERROR:', err);
    }
  }

  // Handle specific error types
  
  // PostgreSQL unique constraint violation
  if (err.code === '23505') {
    return res.status(409).json({
      error: 'Conflict',
      message: 'A record with this information already exists'
    });
  }

  // PostgreSQL foreign key violation
  if (err.code === '23503') {
    return res.status(400).json({
      error: 'Bad Request',
      message: 'The referenced record does not exist'
    });
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({
      error: 'Unauthorized',
      message: 'Invalid token. Please log in again.'
    });
  }

  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({
      error: 'Unauthorized',
      message: 'Your session has expired. Please log in again.'
    });
  }

  // Validation errors from express-validator
  if (err.array && typeof err.array === 'function') {
    return res.status(400).json({
      error: 'Validation Error',
      details: err.array()
    });
  }

  // Stripe errors
  if (err.type === 'StripeCardError') {
    return res.status(400).json({
      error: 'Payment Failed',
      message: err.message
    });
  }

  if (err.type === 'StripeInvalidRequestError') {
    return res.status(400).json({
      error: 'Payment Error',
      message: 'There was an issue processing your payment'
    });
  }

  // For operational errors, send the error message
  if (err.isOperational) {
    return res.status(err.statusCode).json({
      error: getErrorName(err.statusCode),
      message: err.message
    });
  }

  // For programming errors in production, don't leak error details
  if (process.env.NODE_ENV === 'production') {
    return res.status(500).json({
      error: 'Internal Server Error',
      message: 'Something went wrong. Please try again later.'
    });
  }

  // In development, send full error details
  return res.status(err.statusCode).json({
    error: getErrorName(err.statusCode),
    message: err.message,
    stack: err.stack
  });
};

/**
 * Helper function to get error name from status code
 */
const getErrorName = (statusCode) => {
  const errorNames = {
    400: 'Bad Request',
    401: 'Unauthorized',
    403: 'Forbidden',
    404: 'Not Found',
    409: 'Conflict',
    422: 'Unprocessable Entity',
    429: 'Too Many Requests',
    500: 'Internal Server Error'
  };
  return errorNames[statusCode] || 'Error';
};

/**
 * Async handler wrapper
 * 
 * This wraps async route handlers so we don't need try/catch in every route.
 * Any errors thrown in async functions will be automatically passed to the
 * error handler middleware.
 * 
 * Usage:
 *   router.get('/products', asyncHandler(async (req, res) => {
 *     const products = await Product.findAll();
 *     res.json(products);
 *   }));
 */
const asyncHandler = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

module.exports = {
  AppError,
  errorHandler,
  asyncHandler
};

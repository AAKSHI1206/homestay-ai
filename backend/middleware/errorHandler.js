/**
 * Centralized Error-Handling Middleware
 * ─────────────────────────────────────
 * Keeps error responses consistent across the entire API.
 *
 * Usage:
 *   In any controller/middleware, create an Error with a statusCode:
 *     const err = new Error('Not found');
 *     err.statusCode = 404;
 *     next(err);
 *
 * Response shape (always JSON):
 *   { success: false, message: '...' }
 *   + stack trace in development mode only.
 */

// ── 404 handler — catches any unmatched route ────────────────
export const notFound = (req, _res, next) => {
  const error = new Error(`Route not found: ${req.method} ${req.originalUrl}`);
  error.statusCode = 404;
  next(error);
};

// ── Global error handler — must be the LAST app.use() ────────
// Express requires exactly 4 parameters to recognise this as an
// error-handling middleware — do NOT remove _next.
export const errorHandler = (err, _req, res, _next) => {
  const statusCode = err.statusCode || 500;

  res.status(statusCode).json({
    success: false,
    message: err.message || 'Internal Server Error',
    // Expose stack trace only in development
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
};
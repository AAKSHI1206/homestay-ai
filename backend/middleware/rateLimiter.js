import rateLimit from 'express-rate-limit';

/**
 * Auth Rate Limiter
 * ─────────────────
 * Prevents brute-force attacks on authentication endpoints.
 *
 * Config: max 5 requests per 15-minute window per IP.
 * Applied only to /api/auth/register and /api/auth/login.
 */

export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5,
  standardHeaders: true, // Return rate limit info in `RateLimit-*` headers
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many requests. Please try again after 15 minutes.',
  },
});

/**
 * AI Rate Limiter
 * ───────────────
 * Prevents excessive AI API usage and controls Gemini API costs.
 *
 * Config: max 10 requests per 15-minute window per IP.
 * Applied to /api/reviews/analyze.
 */
export const aiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many AI analysis requests. Please try again after 15 minutes.',
  },
});

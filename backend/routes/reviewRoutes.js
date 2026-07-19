import { Router } from 'express';
import { analyze } from '../controllers/reviewController.js';
import { validateReviewText } from '../validators/reviewValidator.js';
import { protect } from '../middleware/auth.js';
import { aiLimiter } from '../middleware/rateLimiter.js';

/**
 * Review Routes
 * ─────────────
 * All review-related endpoints are mounted at /api/reviews
 * in server.js.
 *
 * Every route requires authentication (protect middleware)
 * and AI calls are rate-limited to control API costs.
 */

const router = Router();

// ── POST /api/reviews/analyze ─────────────────────────────────
// Auth → Rate Limit → Validate → Controller
router.post('/analyze', protect, aiLimiter, validateReviewText, analyze);

export default router;

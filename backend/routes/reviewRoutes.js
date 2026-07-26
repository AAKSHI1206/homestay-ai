import { Router } from 'express';
import {
  analyze,
  getReviewHistory,
  getAnalytics,
  getReviewById,
  deleteReview,
  toggleBookmark,
} from '../controllers/reviewController.js';
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

// ── Static paths BEFORE dynamic /:id ──────────────────────────
router.get('/analytics', protect, getAnalytics);

// ── POST /api/reviews/analyze ─────────────────────────────────
// Auth → Rate Limit → Validate → Controller
router.post('/analyze', protect, aiLimiter, validateReviewText, analyze);

// ── GET /api/reviews (history) ────────────────────────────────
router.get('/', protect, getReviewHistory);

// ── GET /api/reviews/:id ──────────────────────────────────────
router.get('/:id', protect, getReviewById);

// ── DELETE /api/reviews/:id ───────────────────────────────────
router.delete('/:id', protect, deleteReview);

// ── PATCH /api/reviews/:id/bookmark ───────────────────────────
router.patch('/:id/bookmark', protect, toggleBookmark);

export default router;

import { analyzeReview } from '../services/aiService.js';

/**
 * Review Controller
 * ─────────────────
 * Handles review analysis requests.
 * Delegates AI processing to the aiService module.
 *
 * Future weeks can add:
 *  - Persisting results to a Review model
 *  - Batch analysis
 *  - Historical review retrieval
 */

// ─────────────────────────────────────────────────────────────
// POST /api/reviews/analyze
// Sends a guest review to AI for sentiment analysis.
// Requires: protect middleware (authenticated users only).
// Status: 200 | 400 | 401 | 429 | 502 | 503
// ─────────────────────────────────────────────────────────────
export const analyze = async (req, res, next) => {
  try {
    const { reviewText } = req.body;

    const analysis = await analyzeReview(reviewText);

    res.status(200).json({
      success: true,
      data: {
        reviewText,
        analysis,
        analyzedAt: new Date().toISOString(),
      },
    });
  } catch (err) {
    next(err);
  }
};

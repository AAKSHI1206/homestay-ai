import { body } from 'express-validator';
import { handleValidationErrors } from './authValidator.js';

/**
 * Review Validators
 * ─────────────────
 * express-validator chains for review analysis endpoints.
 * Reuses the shared handleValidationErrors helper from authValidator.
 */

// ─── POST /api/reviews/analyze ───────────────────────────────
export const validateReviewText = [
  body('reviewText')
    .trim()
    .notEmpty()
    .withMessage('reviewText is required')
    .isLength({ min: 10 })
    .withMessage('reviewText must be at least 10 characters')
    .isLength({ max: 5000 })
    .withMessage('reviewText must not exceed 5000 characters'),
  handleValidationErrors,
];

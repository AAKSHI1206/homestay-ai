import { body, validationResult } from 'express-validator';

/**
 * Auth Validators
 * ───────────────
 * express-validator chains for registration and login endpoints.
 * Each exports an array of middleware that can be spread into a
 * route definition.
 *
 * handleValidationErrors sits at the end of each chain and sends
 * a 400 response with all accumulated errors if validation failed.
 */

// ─── Shared: send 400 with validation error details ──────────
export const handleValidationErrors = (req, _res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const err = new Error(
      errors
        .array()
        .map((e) => e.msg)
        .join(', ')
    );
    err.statusCode = 400;
    return next(err);
  }
  next();
};

// ─── POST /api/auth/register ─────────────────────────────────
export const validateRegister = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('name is required'),
  body('email')
    .trim()
    .notEmpty()
    .withMessage('email is required')
    .isEmail()
    .withMessage('enter a valid email address')
    .normalizeEmail(),
  body('password')
    .notEmpty()
    .withMessage('password is required')
    .isLength({ min: 6 })
    .withMessage('password must be at least 6 characters'),
  handleValidationErrors,
];

// ─── POST /api/auth/login ────────────────────────────────────
export const validateLogin = [
  body('email')
    .trim()
    .notEmpty()
    .withMessage('email is required')
    .isEmail()
    .withMessage('enter a valid email address')
    .normalizeEmail(),
  body('password')
    .notEmpty()
    .withMessage('password is required'),
  handleValidationErrors,
];

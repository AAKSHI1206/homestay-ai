import { Router } from 'express';
import passport from 'passport';
import { register, login, getMe, googleCallback } from '../controllers/authController.js';
import { validateRegister, validateLogin } from '../validators/authValidator.js';
import { protect } from '../middleware/auth.js';
import { authLimiter } from '../middleware/rateLimiter.js';

const router = Router();

// ── Local Auth ────────────────────────────────────────────────
router.post('/register', authLimiter, validateRegister, register);
router.post('/login', authLimiter, validateLogin, login);

// ── Protected ─────────────────────────────────────────────────
router.get('/me', protect, getMe);

// ── Google OAuth ──────────────────────────────────────────────
router.get(
  '/google',
  passport.authenticate('google', { scope: ['profile', 'email'] })
);

router.get(
  '/google/callback',
  passport.authenticate('google', {
    session: false,
    failureRedirect: '/login',
  }),
  googleCallback
);

export default router;

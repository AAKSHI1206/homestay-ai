import { Router } from 'express';
import passport from 'passport';
import {
  register,
  login,
  getMe,
  googleCallback,
  updateProfile,
  changePassword,
} from '../controllers/authController.js';
import { validateRegister, validateLogin } from '../validators/authValidator.js';
import { protect } from '../middleware/auth.js';
import { authLimiter } from '../middleware/rateLimiter.js';

const router = Router();

// ── Local Auth ────────────────────────────────────────────────
router.post('/register', authLimiter, validateRegister, register);
router.post('/login', authLimiter, validateLogin, login);

// ── Protected ─────────────────────────────────────────────────
router.get('/me', protect, getMe);
router.put('/profile', protect, updateProfile);
router.put('/password', protect, changePassword);

// ── Google OAuth ──────────────────────────────────────────────
router.get(
  '/google',
  passport.authenticate('google', { scope: ['profile', 'email'] })
);

router.get(
  '/google/callback',
  (req, res, next) => {
    passport.authenticate('google', { session: false }, (err, user) => {
      if (err || !user) {
        const clientURL = process.env.CLIENT_URL || 'http://localhost:5173';
        return res.redirect(`${clientURL}/login?error=oauth_failed`);
      }
      req.user = user;
      next();
    })(req, res, next);
  },
  googleCallback
);

export default router;

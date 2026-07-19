import jwt from 'jsonwebtoken';
import User from '../models/User.js';

/**
 * protect
 * ───────
 * JWT authentication middleware.
 *
 * Reads the token from the Authorization header:
 *   Authorization: Bearer <token>
 *
 * On success: attaches the authenticated user to req.user and
 *             calls next().
 * On failure: passes a 401 error to the centralized error handler.
 */
export const protect = async (req, _res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      const err = new Error('Not authorized — no token provided');
      err.statusCode = 401;
      return next(err);
    }

    const token = authHeader.split(' ')[1];

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Fetch user from DB (exclude password)
    const user = await User.findById(decoded.id).select('-password');

    if (!user) {
      const err = new Error('Not authorized — user no longer exists');
      err.statusCode = 401;
      return next(err);
    }

    req.user = user;
    next();
  } catch (error) {
    const err = new Error('Not authorized — invalid or expired token');
    err.statusCode = 401;
    next(err);
  }
};

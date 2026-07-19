import jwt from 'jsonwebtoken';
import User from '../models/User.js';

/**
 * generateToken
 * ─────────────
 * Creates a signed JWT with the user's _id as payload.
 * Expires in 7 days.
 */
function generateToken(userId) {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: '7d',
  });
}

/**
 * sanitizeUser
 * ────────────
 * Returns a plain object with only the fields the client needs.
 * Never includes password.
 */
function sanitizeUser(user) {
  return {
    id: user._id,
    name: user.name,
    email: user.email,
    createdAt: user.createdAt,
  };
}

// ─────────────────────────────────────────────────────────────
// POST /api/auth/register
// Creates a new user account.
// Status: 201 | 400
// ─────────────────────────────────────────────────────────────
export const register = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    // Check for duplicate email
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      const err = new Error('An account with this email already exists');
      err.statusCode = 400;
      return next(err);
    }

    // Create user (password is hashed via pre-save hook)
    const user = await User.create({ name, email, password });

    // Generate JWT
    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      token,
      data: sanitizeUser(user),
    });
  } catch (err) {
    next(err);
  }
};

// ─────────────────────────────────────────────────────────────
// POST /api/auth/login
// Authenticates an existing user and returns a JWT.
// Status: 200 | 401
// ─────────────────────────────────────────────────────────────
export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Find user by email (include password for comparison)
    const user = await User.findOne({ email: email.toLowerCase() }).select(
      '+password'
    );

    if (!user) {
      const err = new Error('Invalid email or password');
      err.statusCode = 401;
      return next(err);
    }

    // Google-only accounts don't have a password
    if (!user.password) {
      const err = new Error(
        'This account uses Google sign-in. Please use "Continue with Google".'
      );
      err.statusCode = 401;
      return next(err);
    }

    // Compare password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      const err = new Error('Invalid email or password');
      err.statusCode = 401;
      return next(err);
    }

    // Generate JWT
    const token = generateToken(user._id);

    res.status(200).json({
      success: true,
      token,
      data: sanitizeUser(user),
    });
  } catch (err) {
    next(err);
  }
};

// ─────────────────────────────────────────────────────────────
// GET /api/auth/me
// Returns the currently authenticated user.
// Requires: protect middleware.
// Status: 200
// ─────────────────────────────────────────────────────────────
export const getMe = async (req, res, _next) => {
  res.status(200).json({
    success: true,
    data: sanitizeUser(req.user),
  });
};

// ─────────────────────────────────────────────────────────────
// GET /api/auth/google/callback
// Called by Passport after Google consent screen.
// Generates JWT and redirects to the frontend with the token.
// ─────────────────────────────────────────────────────────────
export const googleCallback = (req, res) => {
  const token = generateToken(req.user._id);
  const clientURL = process.env.CLIENT_URL || 'http://localhost:5173';
  res.redirect(`${clientURL}/auth/callback?token=${token}`);
};

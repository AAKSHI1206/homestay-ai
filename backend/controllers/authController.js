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
    avatar: user.avatar || '',
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

// ─────────────────────────────────────────────────────────────
// PUT /api/auth/profile
// Updates the authenticated user's profile (name, email, avatar).
// Requires: protect middleware.
// Status: 200 | 400
// ─────────────────────────────────────────────────────────────
export const updateProfile = async (req, res, next) => {
  try {
    const { name, email, avatar } = req.body;
    const user = await User.findById(req.user._id);

    if (name !== undefined) {
      if (!name.trim()) {
        const err = new Error('Name cannot be empty');
        err.statusCode = 400;
        return next(err);
      }
      user.name = name.trim();
    }

    if (email !== undefined) {
      const normalizedEmail = email.toLowerCase().trim();
      if (normalizedEmail !== user.email) {
        const existing = await User.findOne({ email: normalizedEmail });
        if (existing) {
          const err = new Error('An account with this email already exists');
          err.statusCode = 400;
          return next(err);
        }
        user.email = normalizedEmail;
      }
    }

    if (avatar !== undefined) {
      user.avatar = avatar.trim();
    }

    await user.save();

    res.status(200).json({
      success: true,
      data: sanitizeUser(user),
    });
  } catch (err) {
    next(err);
  }
};

// ─────────────────────────────────────────────────────────────
// PUT /api/auth/password
// Changes the authenticated user's password.
// Requires: protect middleware + current password verification.
// Status: 200 | 400 | 401
// ─────────────────────────────────────────────────────────────
export const changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      const err = new Error('Both current and new password are required');
      err.statusCode = 400;
      return next(err);
    }

    if (newPassword.length < 6) {
      const err = new Error('New password must be at least 6 characters');
      err.statusCode = 400;
      return next(err);
    }

    const user = await User.findById(req.user._id).select('+password');

    if (!user.password) {
      const err = new Error(
        'This account uses Google sign-in. Password cannot be changed here.'
      );
      err.statusCode = 400;
      return next(err);
    }

    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      const err = new Error('Current password is incorrect');
      err.statusCode = 401;
      return next(err);
    }

    user.password = newPassword;
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Password updated successfully',
    });
  } catch (err) {
    next(err);
  }
};

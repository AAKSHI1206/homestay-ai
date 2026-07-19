import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import User from '../models/User.js';

/**
 * Passport — Google OAuth 2.0
 * ────────────────────────────
 * Configures the Google strategy for social login.
 *
 * Flow:
 *  1. User clicks "Continue with Google" → GET /api/auth/google
 *  2. Passport redirects to Google consent screen
 *  3. Google redirects back to /api/auth/google/callback
 *  4. Strategy callback: find or create user by googleId
 *  5. authController.googleCallback generates JWT and redirects
 *     to the frontend with the token.
 *
 * Google Cloud Console credentials must be set in .env:
 *   GOOGLE_CLIENT_ID
 *   GOOGLE_CLIENT_SECRET
 */

export default function configurePassport() {
  // Only configure if Google credentials are provided
  if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
    console.log('  ⚠ Google OAuth not configured (missing GOOGLE_CLIENT_ID or GOOGLE_CLIENT_SECRET)');
    return;
  }

  passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: '/api/auth/google/callback',
      },
      async (_accessToken, _refreshToken, profile, done) => {
        try {
          // Check if user already exists with this Google ID
          let user = await User.findOne({ googleId: profile.id });

          if (user) {
            return done(null, user);
          }

          // Check if a user exists with the same email (registered locally)
          const email = profile.emails?.[0]?.value;
          if (email) {
            user = await User.findOne({ email });
            if (user) {
              // Link Google account to existing local user
              user.googleId = profile.id;
              if (!user.name || user.name === 'New User') {
                user.name = profile.displayName;
              }
              await user.save();
              return done(null, user);
            }
          }

          // Create new user from Google profile
          user = await User.create({
            name: profile.displayName,
            email,
            googleId: profile.id,
          });

          done(null, user);
        } catch (err) {
          done(err, null);
        }
      }
    )
  );

  // Serialize/deserialize for session support (we use JWT, so these
  // are minimal — Passport still expects them to be defined)
  passport.serializeUser((user, done) => done(null, user._id));
  passport.deserializeUser(async (id, done) => {
    try {
      const user = await User.findById(id).select('-password');
      done(null, user);
    } catch (err) {
      done(err, null);
    }
  });
}

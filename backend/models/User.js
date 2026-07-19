import mongoose from 'mongoose';
import bcrypt from 'bcrypt';

/**
 * User Schema
 * ───────────
 * Stores registered users for authentication.
 *
 * Supports two auth strategies:
 *  1. Local (email + hashed password)
 *  2. Google OAuth (googleId — no password required)
 *
 * Passwords are hashed automatically via a pre-save hook
 * and are never returned in JSON responses.
 */

const SALT_ROUNDS = 12;

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'name is required'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'email is required'],
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      minlength: [6, 'password must be at least 6 characters'],
      // Not required — Google OAuth users won't have one
    },
    googleId: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// ─── Indexes ──────────────────────────────────────────────────
userSchema.index({ email: 1 }, { unique: true });
userSchema.index({ googleId: 1 }, { sparse: true });

// ─── Pre-save: hash password ─────────────────────────────────
userSchema.pre('save', async function () {
  // Only hash if the password field was modified (or is new)
  if (!this.isModified('password')) return;
  if (!this.password) return;

  this.password = await bcrypt.hash(this.password, SALT_ROUNDS);
});

// ─── Instance method: compare password ───────────────────────
userSchema.methods.comparePassword = async function (candidate) {
  if (!this.password) return false;
  return bcrypt.compare(candidate, this.password);
};

// ─── Never return password in JSON ───────────────────────────
userSchema.set('toJSON', {
  virtuals: true,
  transform(_doc, ret) {
    delete ret.password;
    delete ret.__v;
    return ret;
  },
});

const User = mongoose.model('User', userSchema);

export default User;

import mongoose from 'mongoose';

/**
 * Review Schema
 * ─────────────
 * Persists AI-powered sentiment analysis results.
 *
 * Each review stores the original guest review text,
 * the AI analysis output, and metadata like bookmarks
 * and optional listing association.
 */

const reviewSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'user is required'],
    },
    listing: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Listing',
      default: null,
    },
    reviewText: {
      type: String,
      required: [true, 'reviewText is required'],
      trim: true,
      minlength: [10, 'reviewText must be at least 10 characters'],
      maxlength: [5000, 'reviewText must not exceed 5000 characters'],
    },
    sentiment: {
      type: String,
      enum: ['positive', 'negative', 'neutral', 'mixed'],
      required: true,
    },
    confidence: {
      type: Number,
      required: true,
      min: 0,
      max: 1,
    },
    themes: {
      type: [String],
      default: [],
    },
    summary: {
      type: String,
      default: '',
      trim: true,
    },
    suggestedResponse: {
      type: String,
      default: '',
      trim: true,
    },
    bookmarked: {
      type: Boolean,
      default: false,
    },
    analyzedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// ─── Indexes ──────────────────────────────────────────────────
reviewSchema.index({ user: 1, analyzedAt: -1 });
reviewSchema.index({ user: 1, sentiment: 1 });
reviewSchema.index({ user: 1, bookmarked: 1 });
reviewSchema.index({ listing: 1 });

const Review = mongoose.model('Review', reviewSchema);

export default Review;

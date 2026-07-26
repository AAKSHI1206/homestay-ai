import mongoose from 'mongoose';

/**
 * Listing Schema
 * ──────────────
 * Mirrors the data shape used by the React frontend and the
 * Week 4 in-memory store (data/listings.js).
 *
 * Mongoose automatically provides an `id` virtual that maps
 * _id → id (string), so the frontend's `l.id` references
 * continue to work without modification.
 */

const listingSchema = new mongoose.Schema(
  {
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'owner is required'],
    },
    title: {
      type: String,
      required: [true, 'title is required'],
      trim: true,
    },
    description: {
      type: String,
      default: '',
      trim: true,
    },
    location: {
      type: String,
      required: [true, 'location is required'],
      trim: true,
    },
    pricePerNight: {
      type: Number,
      required: [true, 'pricePerNight is required'],
      min: [1, 'pricePerNight must be a positive number'],
    },
    guests: {
      type: Number,
      default: 1,
      min: 1,
    },
    bedrooms: {
      type: Number,
      default: 1,
      min: 0,
    },
    bathrooms: {
      type: Number,
      default: 1,
      min: 0,
    },
    amenities: {
      type: [String],
      default: [],
    },
    images: {
      type: [String],
      default: [],
    },
    host: {
      name: {
        type: String,
        default: 'New Host',
        trim: true,
      },
      rating: {
        type: Number,
        default: 0,
        min: 0,
        max: 5,
      },
    },
    rating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },
    reviewCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    featured: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// ─── Indexes ──────────────────────────────────────────────────
listingSchema.index({ owner: 1 });
listingSchema.index({ featured: 1 });
listingSchema.index({ location: 'text', title: 'text', description: 'text' });

const Listing = mongoose.model('Listing', listingSchema);

export default Listing;

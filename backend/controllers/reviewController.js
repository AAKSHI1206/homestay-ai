import { analyzeReview } from '../services/aiService.js';
import Review from '../models/Review.js';

/**
 * Review Controller
 * ─────────────────
 * Handles review analysis requests and review history management.
 * Delegates AI processing to the aiService module.
 * Persists analysis results to the Review model.
 */

// ─────────────────────────────────────────────────────────────
// POST /api/reviews/analyze
// Sends a guest review to AI for sentiment analysis and saves.
// Requires: protect middleware (authenticated users only).
// Status: 200 | 400 | 401 | 429 | 502 | 503
// ─────────────────────────────────────────────────────────────
export const analyze = async (req, res, next) => {
  try {
    const { reviewText, listingId } = req.body;

    const analysis = await analyzeReview(reviewText);

    // Persist the result
    const review = await Review.create({
      user: req.user._id,
      listing: listingId || null,
      reviewText,
      sentiment: analysis.sentiment,
      confidence: analysis.confidence,
      themes: analysis.themes,
      summary: analysis.summary,
      suggestedResponse: analysis.suggestedResponse,
      analyzedAt: new Date(),
    });

    res.status(200).json({
      success: true,
      data: {
        id: review.id,
        reviewText,
        analysis,
        analyzedAt: review.analyzedAt.toISOString(),
      },
    });
  } catch (err) {
    next(err);
  }
};

// ─────────────────────────────────────────────────────────────
// GET /api/reviews
// Returns paginated review history for the authenticated user.
// Query params: page, limit, sentiment, bookmarked, search, sort
// Status: 200
// ─────────────────────────────────────────────────────────────
export const getReviewHistory = async (req, res, next) => {
  try {
    const {
      page = 1,
      limit = 10,
      sentiment,
      bookmarked,
      search,
      sort = '-analyzedAt',
    } = req.query;

    const filter = { user: req.user._id };

    if (sentiment && ['positive', 'negative', 'neutral', 'mixed'].includes(sentiment)) {
      filter.sentiment = sentiment;
    }

    if (bookmarked === 'true') {
      filter.bookmarked = true;
    }

    if (search) {
      filter.$or = [
        { reviewText: { $regex: search, $options: 'i' } },
        { summary: { $regex: search, $options: 'i' } },
        { themes: { $regex: search, $options: 'i' } },
      ];
    }

    const skip = (Number(page) - 1) * Number(limit);
    const total = await Review.countDocuments(filter);

    const reviews = await Review.find(filter)
      .populate('listing', 'title location')
      .sort(sort)
      .skip(skip)
      .limit(Number(limit));

    res.status(200).json({
      success: true,
      count: reviews.length,
      total,
      page: Number(page),
      totalPages: Math.ceil(total / Number(limit)),
      data: reviews,
    });
  } catch (err) {
    next(err);
  }
};

// ─────────────────────────────────────────────────────────────
// GET /api/reviews/analytics
// Returns aggregated analytics for the authenticated user.
// Query params: listingId (optional — filter by property)
// Status: 200
// ─────────────────────────────────────────────────────────────
export const getAnalytics = async (req, res, next) => {
  try {
    const { listingId } = req.query;
    const match = { user: req.user._id };
    if (listingId) {
      match.listing = listingId;
    }

    // Sentiment distribution
    const sentimentCounts = await Review.aggregate([
      { $match: match },
      { $group: { _id: '$sentiment', count: { $sum: 1 } } },
    ]);

    // Average confidence
    const avgResult = await Review.aggregate([
      { $match: match },
      {
        $group: {
          _id: null,
          avgConfidence: { $avg: '$confidence' },
          totalReviews: { $sum: 1 },
        },
      },
    ]);

    // Review trend (last 30 days, grouped by date)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const trend = await Review.aggregate([
      { $match: { ...match, analyzedAt: { $gte: thirtyDaysAgo } } },
      {
        $group: {
          _id: {
            date: { $dateToString: { format: '%Y-%m-%d', date: '$analyzedAt' } },
            sentiment: '$sentiment',
          },
          count: { $sum: 1 },
        },
      },
      { $sort: { '_id.date': 1 } },
    ]);

    // Top themes
    const topThemes = await Review.aggregate([
      { $match: match },
      { $unwind: '$themes' },
      { $group: { _id: '$themes', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 },
    ]);

    // Recent reviews
    const recentReviews = await Review.find(match)
      .populate('listing', 'title location')
      .sort({ analyzedAt: -1 })
      .limit(5);

    const distribution = { positive: 0, negative: 0, neutral: 0, mixed: 0 };
    sentimentCounts.forEach((s) => {
      if (distribution.hasOwnProperty(s._id)) {
        distribution[s._id] = s.count;
      }
    });

    res.status(200).json({
      success: true,
      data: {
        totalReviews: avgResult[0]?.totalReviews || 0,
        avgConfidence: Math.round((avgResult[0]?.avgConfidence || 0) * 100) / 100,
        distribution,
        trend,
        topThemes: topThemes.map((t) => ({ theme: t._id, count: t.count })),
        recentReviews,
      },
    });
  } catch (err) {
    next(err);
  }
};

// ─────────────────────────────────────────────────────────────
// GET /api/reviews/:id
// Returns a single review by its MongoDB _id.
// Status: 200 | 404
// ─────────────────────────────────────────────────────────────
export const getReviewById = async (req, res, next) => {
  try {
    const review = await Review.findOne({
      _id: req.params.id,
      user: req.user._id,
    }).populate('listing', 'title location');

    if (!review) {
      const err = new Error('Review not found');
      err.statusCode = 404;
      return next(err);
    }

    res.status(200).json({ success: true, data: review });
  } catch (err) {
    if (err.kind === 'ObjectId') {
      const error = new Error('Review not found');
      error.statusCode = 404;
      return next(error);
    }
    next(err);
  }
};

// ─────────────────────────────────────────────────────────────
// DELETE /api/reviews/:id
// Deletes a review. Only the owner can delete.
// Status: 204 | 404
// ─────────────────────────────────────────────────────────────
export const deleteReview = async (req, res, next) => {
  try {
    const review = await Review.findOneAndDelete({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!review) {
      const err = new Error('Review not found');
      err.statusCode = 404;
      return next(err);
    }

    res.status(204).send();
  } catch (err) {
    if (err.kind === 'ObjectId') {
      const error = new Error('Review not found');
      error.statusCode = 404;
      return next(error);
    }
    next(err);
  }
};

// ─────────────────────────────────────────────────────────────
// PATCH /api/reviews/:id/bookmark
// Toggles the bookmarked status of a review.
// Status: 200 | 404
// ─────────────────────────────────────────────────────────────
export const toggleBookmark = async (req, res, next) => {
  try {
    const review = await Review.findOne({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!review) {
      const err = new Error('Review not found');
      err.statusCode = 404;
      return next(err);
    }

    review.bookmarked = !review.bookmarked;
    await review.save();

    res.status(200).json({
      success: true,
      data: review,
    });
  } catch (err) {
    if (err.kind === 'ObjectId') {
      const error = new Error('Review not found');
      error.statusCode = 404;
      return next(error);
    }
    next(err);
  }
};

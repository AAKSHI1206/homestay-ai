import Listing from '../models/Listing.js';

// ─────────────────────────────────────────────────────────────
// GET /api/listings
// Returns every listing.
// Status: 200
// ─────────────────────────────────────────────────────────────
export const getAllListings = async (_req, res, next) => {
  try {
    const listings = await Listing.find();
    res.status(200).json({
      success: true,
      count: listings.length,
      data: listings,
    });
  } catch (err) {
    next(err);
  }
};

// ─────────────────────────────────────────────────────────────
// GET /api/listings/featured
// Returns only listings where featured === true.
// Status: 200
// ─────────────────────────────────────────────────────────────
export const getFeaturedListings = async (_req, res, next) => {
  try {
    const featured = await Listing.find({ featured: true });
    res.status(200).json({
      success: true,
      count: featured.length,
      data: featured,
    });
  } catch (err) {
    next(err);
  }
};

// ─────────────────────────────────────────────────────────────
// GET /api/listings/search?q=&location=&minPrice=&maxPrice=&guests=
// Multi-field search / filter.
// Status: 200 | 400
// ─────────────────────────────────────────────────────────────
export const searchListings = async (req, res, next) => {
  try {
    const { q, location, minPrice, maxPrice, guests } = req.query;
    const filter = {};

    if (q) {
      const keyword = q.toLowerCase();
      filter.$or = [
        { title: { $regex: keyword, $options: 'i' } },
        { description: { $regex: keyword, $options: 'i' } },
        { location: { $regex: keyword, $options: 'i' } },
        { amenities: { $regex: keyword, $options: 'i' } },
      ];
    }

    if (location) {
      filter.location = { $regex: location, $options: 'i' };
    }

    if (minPrice !== undefined) {
      const min = Number(minPrice);
      if (isNaN(min)) {
        const err = new Error('minPrice must be a number');
        err.statusCode = 400;
        return next(err);
      }
      filter.pricePerNight = { ...filter.pricePerNight, $gte: min };
    }

    if (maxPrice !== undefined) {
      const max = Number(maxPrice);
      if (isNaN(max)) {
        const err = new Error('maxPrice must be a number');
        err.statusCode = 400;
        return next(err);
      }
      filter.pricePerNight = { ...filter.pricePerNight, $lte: max };
    }

    if (guests !== undefined) {
      const g = Number(guests);
      if (isNaN(g)) {
        const err = new Error('guests must be a number');
        err.statusCode = 400;
        return next(err);
      }
      filter.guests = { $gte: g };
    }

    const results = await Listing.find(filter);

    res.status(200).json({
      success: true,
      count: results.length,
      data: results,
    });
  } catch (err) {
    next(err);
  }
};

// ─────────────────────────────────────────────────────────────
// GET /api/listings/:id
// Returns a single listing by its MongoDB _id.
// Status: 200 | 404
// ─────────────────────────────────────────────────────────────
export const getListingById = async (req, res, next) => {
  try {
    const listing = await Listing.findById(req.params.id);

    if (!listing) {
      const err = new Error(`Listing with id "${req.params.id}" not found`);
      err.statusCode = 404;
      return next(err);
    }

    res.status(200).json({ success: true, data: listing });
  } catch (err) {
    // Handle invalid ObjectId format gracefully
    if (err.kind === 'ObjectId') {
      const error = new Error(`Listing with id "${req.params.id}" not found`);
      error.statusCode = 404;
      return next(error);
    }
    next(err);
  }
};

// ─────────────────────────────────────────────────────────────
// POST /api/listings
// Creates a new listing. Requires title, location, pricePerNight.
// Status: 201 | 400
// ─────────────────────────────────────────────────────────────
export const createListing = async (req, res, next) => {
  try {
    const {
      title,
      description,
      location,
      pricePerNight,
      guests,
      bedrooms,
      bathrooms,
      amenities,
    } = req.body;

    // Validation
    const errors = [];
    if (!title || !title.trim()) errors.push('title is required');
    if (!location || !location.trim()) errors.push('location is required');
    if (pricePerNight === undefined || pricePerNight === null)
      errors.push('pricePerNight is required');
    else if (typeof pricePerNight !== 'number' || pricePerNight <= 0)
      errors.push('pricePerNight must be a positive number');

    if (errors.length > 0) {
      const err = new Error(errors.join(', '));
      err.statusCode = 400;
      return next(err);
    }

    const newListing = await Listing.create({
      title: title.trim(),
      description: description?.trim() || '',
      location: location.trim(),
      pricePerNight,
      guests: guests || 1,
      bedrooms: bedrooms || 1,
      bathrooms: bathrooms || 1,
      amenities: Array.isArray(amenities) ? amenities : [],
    });

    res.status(201).json({ success: true, data: newListing });
  } catch (err) {
    next(err);
  }
};

// ─────────────────────────────────────────────────────────────
// PUT /api/listings/:id
// Updates an existing listing (partial update supported).
// Status: 200 | 400 | 404
// ─────────────────────────────────────────────────────────────
export const updateListing = async (req, res, next) => {
  try {
    const {
      title,
      description,
      location,
      pricePerNight,
      guests,
      bedrooms,
      bathrooms,
      amenities,
      featured,
    } = req.body;

    // Validate pricePerNight if provided
    if (pricePerNight !== undefined) {
      if (typeof pricePerNight !== 'number' || pricePerNight <= 0) {
        const err = new Error('pricePerNight must be a positive number');
        err.statusCode = 400;
        return next(err);
      }
    }

    // Build update object — only fields that were actually sent
    const update = {};
    if (title !== undefined) update.title = title.trim();
    if (description !== undefined) update.description = description.trim();
    if (location !== undefined) update.location = location.trim();
    if (pricePerNight !== undefined) update.pricePerNight = pricePerNight;
    if (guests !== undefined) update.guests = guests;
    if (bedrooms !== undefined) update.bedrooms = bedrooms;
    if (bathrooms !== undefined) update.bathrooms = bathrooms;
    if (amenities !== undefined) update.amenities = amenities;
    if (featured !== undefined) update.featured = featured;

    const updatedListing = await Listing.findByIdAndUpdate(
      req.params.id,
      update,
      { new: true, runValidators: true }
    );

    if (!updatedListing) {
      const err = new Error(`Listing with id "${req.params.id}" not found`);
      err.statusCode = 404;
      return next(err);
    }

    res.status(200).json({ success: true, data: updatedListing });
  } catch (err) {
    // Handle invalid ObjectId format gracefully
    if (err.kind === 'ObjectId') {
      const error = new Error(`Listing with id "${req.params.id}" not found`);
      error.statusCode = 404;
      return next(error);
    }
    next(err);
  }
};

// ─────────────────────────────────────────────────────────────
// DELETE /api/listings/:id
// Deletes a listing.
// Status: 204 | 404
// ─────────────────────────────────────────────────────────────
export const deleteListing = async (req, res, next) => {
  try {
    const listing = await Listing.findByIdAndDelete(req.params.id);

    if (!listing) {
      const err = new Error(`Listing with id "${req.params.id}" not found`);
      err.statusCode = 404;
      return next(err);
    }

    // 204 No Content — no body sent
    res.status(204).send();
  } catch (err) {
    // Handle invalid ObjectId format gracefully
    if (err.kind === 'ObjectId') {
      const error = new Error(`Listing with id "${req.params.id}" not found`);
      error.statusCode = 404;
      return next(error);
    }
    next(err);
  }
};

import { listings } from '../data/listings.js';
import crypto from 'crypto';

// ─────────────────────────────────────────────────────────────
// GET /api/listings
// Returns every listing.
// Status: 200
// ─────────────────────────────────────────────────────────────
export const getAllListings = (_req, res) => {
  res.status(200).json({
    success: true,
    count: listings.length,
    data: listings,
  });
};

// ─────────────────────────────────────────────────────────────
// GET /api/listings/featured
// Returns only listings where featured === true.
// Status: 200
// ─────────────────────────────────────────────────────────────
export const getFeaturedListings = (_req, res) => {
  const featured = listings.filter((l) => l.featured);
  res.status(200).json({
    success: true,
    count: featured.length,
    data: featured,
  });
};

// ─────────────────────────────────────────────────────────────
// GET /api/listings/search?q=&location=&minPrice=&maxPrice=&guests=
// Multi-field search / filter.
// Status: 200 | 400
// ─────────────────────────────────────────────────────────────
export const searchListings = (req, res, next) => {
  try {
    const { q, location, minPrice, maxPrice, guests } = req.query;
    let results = [...listings];

    if (q) {
      const keyword = q.toLowerCase();
      results = results.filter(
        (l) =>
          l.title.toLowerCase().includes(keyword) ||
          l.description.toLowerCase().includes(keyword) ||
          l.location.toLowerCase().includes(keyword) ||
          l.amenities.some((a) => a.toLowerCase().includes(keyword))
      );
    }

    if (location) {
      results = results.filter((l) =>
        l.location.toLowerCase().includes(location.toLowerCase())
      );
    }

    if (minPrice !== undefined) {
      const min = Number(minPrice);
      if (isNaN(min)) {
        const err = new Error('minPrice must be a number');
        err.statusCode = 400;
        return next(err);
      }
      results = results.filter((l) => l.pricePerNight >= min);
    }

    if (maxPrice !== undefined) {
      const max = Number(maxPrice);
      if (isNaN(max)) {
        const err = new Error('maxPrice must be a number');
        err.statusCode = 400;
        return next(err);
      }
      results = results.filter((l) => l.pricePerNight <= max);
    }

    if (guests !== undefined) {
      const g = Number(guests);
      if (isNaN(g)) {
        const err = new Error('guests must be a number');
        err.statusCode = 400;
        return next(err);
      }
      results = results.filter((l) => l.guests >= g);
    }

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
// Returns a single listing by its UUID.
// Status: 200 | 404
// ─────────────────────────────────────────────────────────────
export const getListingById = (req, res, next) => {
  const listing = listings.find((l) => l.id === req.params.id);

  if (!listing) {
    const err = new Error(`Listing with id "${req.params.id}" not found`);
    err.statusCode = 404;
    return next(err);
  }

  res.status(200).json({ success: true, data: listing });
};

// ─────────────────────────────────────────────────────────────
// POST /api/listings
// Creates a new listing. Requires title, location, pricePerNight.
// Status: 201 | 400
// ─────────────────────────────────────────────────────────────
export const createListing = (req, res, next) => {
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

    const newListing = {
      id: crypto.randomUUID(),
      title: title.trim(),
      description: description?.trim() || '',
      location: location.trim(),
      pricePerNight,
      guests: guests || 1,
      bedrooms: bedrooms || 1,
      bathrooms: bathrooms || 1,
      amenities: Array.isArray(amenities) ? amenities : [],
      images: [],
      host: { name: 'New Host', rating: 0 },
      rating: 0,
      reviewCount: 0,
      featured: false,
      createdAt: new Date().toISOString(),
    };

    listings.push(newListing);

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
export const updateListing = (req, res, next) => {
  try {
    const index = listings.findIndex((l) => l.id === req.params.id);

    if (index === -1) {
      const err = new Error(`Listing with id "${req.params.id}" not found`);
      err.statusCode = 404;
      return next(err);
    }

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

    // Merge only fields that were actually sent
    const updatedListing = {
      ...listings[index],
      ...(title !== undefined && { title: title.trim() }),
      ...(description !== undefined && { description: description.trim() }),
      ...(location !== undefined && { location: location.trim() }),
      ...(pricePerNight !== undefined && { pricePerNight }),
      ...(guests !== undefined && { guests }),
      ...(bedrooms !== undefined && { bedrooms }),
      ...(bathrooms !== undefined && { bathrooms }),
      ...(amenities !== undefined && { amenities }),
      ...(featured !== undefined && { featured }),
      updatedAt: new Date().toISOString(),
    };

    listings[index] = updatedListing;

    res.status(200).json({ success: true, data: updatedListing });
  } catch (err) {
    next(err);
  }
};

// ─────────────────────────────────────────────────────────────
// DELETE /api/listings/:id
// Deletes a listing.
// Status: 204 | 404
// ─────────────────────────────────────────────────────────────
export const deleteListing = (req, res, next) => {
  const index = listings.findIndex((l) => l.id === req.params.id);

  if (index === -1) {
    const err = new Error(`Listing with id "${req.params.id}" not found`);
    err.statusCode = 404;
    return next(err);
  }

  listings.splice(index, 1);

  // 204 No Content — no body sent
  res.status(204).send();
};

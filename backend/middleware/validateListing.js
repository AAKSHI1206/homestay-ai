/**
 * validateListing
 * ───────────────
 * Express middleware that validates the request body for listing
 * creation (POST) and update (PUT) operations.
 *
 * On validation failure it passes a 400 error to the centralized
 * error handler rather than sending a response directly.
 */
export const validateCreateListing = (req, _res, next) => {
  const { title, location, pricePerNight } = req.body;
  const errors = [];

  if (!title || (typeof title === 'string' && !title.trim())) {
    errors.push('title is required');
  }
  if (!location || (typeof location === 'string' && !location.trim())) {
    errors.push('location is required');
  }
  if (pricePerNight === undefined || pricePerNight === null) {
    errors.push('pricePerNight is required');
  } else if (typeof pricePerNight !== 'number' || pricePerNight <= 0) {
    errors.push('pricePerNight must be a positive number');
  }

  if (errors.length > 0) {
    const err = new Error(errors.join(', '));
    err.statusCode = 400;
    return next(err);
  }

  next();
};

export const validateUpdateListing = (req, _res, next) => {
  const { pricePerNight } = req.body;

  if (pricePerNight !== undefined) {
    if (typeof pricePerNight !== 'number' || pricePerNight <= 0) {
      const err = new Error('pricePerNight must be a positive number');
      err.statusCode = 400;
      return next(err);
    }
  }

  next();
};

import { Router } from 'express';
import {
  getAllListings,
  getFeaturedListings,
  searchListings,
  getListingById,
  createListing,
  updateListing,
  deleteListing,
} from '../controllers/listingController.js';
import { protect } from '../middleware/auth.js';

const router = Router();

// ── Static paths BEFORE dynamic /:id ──────────────────────────
router.get('/featured', getFeaturedListings);
router.get('/search', searchListings);

// ── CRUD ──────────────────────────────────────────────────────
router.get('/', getAllListings);
router.get('/:id', getListingById);
router.post('/', protect, createListing);
router.put('/:id', protect, updateListing);
router.delete('/:id', protect, deleteListing);

export default router;

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

const router = Router();

// ── Static paths BEFORE dynamic /:id ──────────────────────────
router.get('/featured', getFeaturedListings);
router.get('/search', searchListings);

// ── CRUD ──────────────────────────────────────────────────────
router.get('/', getAllListings);
router.get('/:id', getListingById);
router.post('/', createListing);
router.put('/:id', updateListing);
router.delete('/:id', deleteListing);

export default router;

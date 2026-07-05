/**
 * Listings API client
 * ───────────────────
 * Centralised fetch() wrapper for all backend listing endpoints.
 * Every function returns the parsed JSON (on success) or throws
 * an error with the server's message (on failure).
 */

const API_BASE = 'http://localhost:5000/api';

/**
 * Internal helper — sends a request, parses JSON, and throws on
 * non-ok responses so callers can rely on a single catch path.
 */
async function request(url, options = {}) {
  const res = await fetch(url, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });

  // 204 No Content — nothing to parse
  if (res.status === 204) return null;

  const data = await res.json();

  if (!res.ok) {
    const msg = data?.message || `Request failed with status ${res.status}`;
    throw new Error(msg);
  }

  return data;
}

// ── GET /api/listings ─────────────────────────────────────────
export async function fetchListings() {
  return request(`${API_BASE}/listings`);
}

// ── GET /api/listings/featured ────────────────────────────────
export async function fetchFeaturedListings() {
  return request(`${API_BASE}/listings/featured`);
}

// ── GET /api/listings/search?q=&location=&minPrice=&maxPrice=&guests=
export async function searchListings(params = {}) {
  const query = new URLSearchParams();
  Object.entries(params).forEach(([key, val]) => {
    if (val !== undefined && val !== null && val !== '') {
      query.append(key, val);
    }
  });
  return request(`${API_BASE}/listings/search?${query.toString()}`);
}

// ── GET /api/listings/:id ─────────────────────────────────────
export async function fetchListingById(id) {
  return request(`${API_BASE}/listings/${id}`);
}

// ── POST /api/listings ────────────────────────────────────────
export async function createListing(listingData) {
  return request(`${API_BASE}/listings`, {
    method: 'POST',
    body: JSON.stringify(listingData),
  });
}

// ── PUT /api/listings/:id ─────────────────────────────────────
export async function updateListing(id, listingData) {
  return request(`${API_BASE}/listings/${id}`, {
    method: 'PUT',
    body: JSON.stringify(listingData),
  });
}

// ── DELETE /api/listings/:id ──────────────────────────────────
export async function deleteListing(id) {
  return request(`${API_BASE}/listings/${id}`, {
    method: 'DELETE',
  });
}

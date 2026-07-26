/**
 * Review API client
 * ─────────────────
 * Centralised fetch() wrapper for review analysis endpoints.
 * Follows the same pattern as authApi.js and listingsApi.js.
 */

const API_BASE = 'http://localhost:5000/api';

function getAuthHeaders() {
  const token = localStorage.getItem('homestay-ai-token');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

/**
 * Internal helper — sends a request, parses JSON, and throws on
 * non-ok responses so callers can rely on a single catch path.
 */
async function request(url, options = {}) {
  const headers = {
    'Content-Type': 'application/json',
    ...getAuthHeaders(),
    ...(options.headers || {}),
  };

  const res = await fetch(url, {
    ...options,
    headers,
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

// ── POST /api/reviews/analyze ────────────────────────────────
export async function analyzeReview(reviewText, token, listingId) {
  return request(`${API_BASE}/reviews/analyze`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ reviewText, listingId: listingId || undefined }),
  });
}

// ── GET /api/reviews (history) ───────────────────────────────
export async function fetchReviewHistory(params = {}) {
  const query = new URLSearchParams();
  Object.entries(params).forEach(([key, val]) => {
    if (val !== undefined && val !== null && val !== '') {
      query.append(key, val);
    }
  });
  return request(`${API_BASE}/reviews?${query.toString()}`, {
    headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
  });
}

// ── GET /api/reviews/analytics ───────────────────────────────
export async function fetchAnalytics(listingId) {
  const query = listingId ? `?listingId=${listingId}` : '';
  return request(`${API_BASE}/reviews/analytics${query}`, {
    headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
  });
}

// ── GET /api/reviews/:id ─────────────────────────────────────
export async function fetchReviewById(id) {
  return request(`${API_BASE}/reviews/${id}`, {
    headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
  });
}

// ── DELETE /api/reviews/:id ──────────────────────────────────
export async function deleteReview(id) {
  return request(`${API_BASE}/reviews/${id}`, {
    method: 'DELETE',
    headers: { ...getAuthHeaders() },
  });
}

// ── PATCH /api/reviews/:id/bookmark ──────────────────────────
export async function toggleBookmark(id) {
  return request(`${API_BASE}/reviews/${id}/bookmark`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
  });
}

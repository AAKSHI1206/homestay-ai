/**
 * Review API client
 * ─────────────────
 * Centralised fetch() wrapper for review analysis endpoints.
 * Follows the same pattern as authApi.js and listingsApi.js.
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

  const data = await res.json();

  if (!res.ok) {
    const msg = data?.message || `Request failed with status ${res.status}`;
    throw new Error(msg);
  }

  return data;
}

// ── POST /api/reviews/analyze ────────────────────────────────
export async function analyzeReview(reviewText, token) {
  return request(`${API_BASE}/reviews/analyze`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ reviewText }),
  });
}

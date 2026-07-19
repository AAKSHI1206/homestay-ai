/**
 * Auth API client
 * ───────────────
 * Centralised fetch() wrapper for all backend auth endpoints.
 * Follows the same pattern as listingsApi.js.
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

// ── POST /api/auth/register ──────────────────────────────────
export async function registerUser({ name, email, password }) {
  return request(`${API_BASE}/auth/register`, {
    method: 'POST',
    body: JSON.stringify({ name, email, password }),
  });
}

// ── POST /api/auth/login ─────────────────────────────────────
export async function loginUser({ email, password }) {
  return request(`${API_BASE}/auth/login`, {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
}

// ── GET /api/auth/me ─────────────────────────────────────────
export async function fetchCurrentUser(token) {
  return request(`${API_BASE}/auth/me`, {
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
  });
}

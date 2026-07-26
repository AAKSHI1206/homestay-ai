import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { registerUser, loginUser, fetchCurrentUser } from '../api/authApi';

/**
 * AuthContext
 * ──────────
 * Provides app-wide authentication state, following the same
 * Provider + hook pattern as ThemeContext.
 *
 * Context value:
 *  - user: object | null       currently authenticated user
 *  - token: string | null      JWT stored in localStorage
 *  - loading: boolean          true while verifying token on mount
 *  - login(email, pw)          authenticates and stores token
 *  - register(name, email, pw) creates account and stores token
 *  - logout()                  clears auth state
 *  - setAuthFromToken(token)   used by OAuth callback to set state
 *
 * Persistence: token is saved to localStorage under the key
 * "homestay-ai-token" and verified against GET /api/auth/me on
 * page load so the user stays logged in after refresh.
 */

const STORAGE_KEY = 'homestay-ai-token';
const AuthContext = createContext(undefined);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem(STORAGE_KEY));
  const [loading, setLoading] = useState(true);

  // ── Persist token to localStorage ──────────────────────────
  const saveToken = useCallback((newToken) => {
    setToken(newToken);
    if (newToken) {
      localStorage.setItem(STORAGE_KEY, newToken);
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
  }, []);

  // ── Verify token on mount (keeps login across refresh) ─────
  useEffect(() => {
    async function verify() {
      if (!token) {
        setLoading(false);
        return;
      }
      try {
        const res = await fetchCurrentUser(token);
        setUser(res.data);
      } catch {
        // Token invalid or expired — clear it
        saveToken(null);
        setUser(null);
      } finally {
        setLoading(false);
      }
    }
    verify();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Login ──────────────────────────────────────────────────
  const login = useCallback(
    async (email, password) => {
      const res = await loginUser({ email, password });
      saveToken(res.token);
      setUser(res.data);
      return res;
    },
    [saveToken]
  );

  // ── Register ───────────────────────────────────────────────
  const register = useCallback(
    async (name, email, password) => {
      const res = await registerUser({ name, email, password });
      saveToken(res.token);
      setUser(res.data);
      return res;
    },
    [saveToken]
  );

  // ── Set auth from token (for OAuth callback) ──────────────
  const setAuthFromToken = useCallback(
    async (newToken) => {
      saveToken(newToken);
      try {
        const res = await fetchCurrentUser(newToken);
        setUser(res.data);
      } catch {
        saveToken(null);
        setUser(null);
      }
    },
    [saveToken]
  );

  // ── Logout ─────────────────────────────────────────────────
  const logout = useCallback(() => {
    saveToken(null);
    setUser(null);
  }, [saveToken]);

  // ── Update local user state (for Profile updates) ─────────
  const updateUser = useCallback((updatedUserData) => {
    setUser((prev) => (prev ? { ...prev, ...updatedUserData } : updatedUserData));
  }, []);

  return (
    <AuthContext.Provider
      value={{ user, token, loading, login, register, logout, setAuthFromToken, updateUser }}
    >
      {children}
    </AuthContext.Provider>
  );
}

/** useAuth() — read auth state from any component. */
// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
}

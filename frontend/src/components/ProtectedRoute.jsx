import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Loader } from './ui';

/**
 * ProtectedRoute
 * ──────────────
 * Wraps pages that require authentication.
 *
 * - While the auth state is loading (verifying token on refresh),
 *   shows the existing Loader component.
 * - If no user is authenticated, redirects to /login.
 * - Otherwise, renders children.
 */
export default function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <Loader size="lg" label="Checking authentication" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Loader } from '../components/ui';

/**
 * AuthCallback
 * ────────────
 * Landing page for Google OAuth redirect.
 *
 * Flow:
 *  1. Backend redirects to /auth/callback?token=<jwt>
 *  2. This component extracts the token from the URL
 *  3. Calls setAuthFromToken() to store it and fetch user
 *  4. Redirects to /dashboard
 */
export default function AuthCallback() {
  const [searchParams] = useSearchParams();
  const { setAuthFromToken } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const token = searchParams.get('token');
    if (token) {
      setAuthFromToken(token).then((success) => {
        navigate(success ? '/dashboard' : '/login', { replace: true });
      });
    } else {
      navigate('/login', { replace: true });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="flex items-center justify-center py-32">
      <Loader size="lg" label="Completing sign-in" />
    </div>
  );
}

import { useAuth } from '../contexts/AuthContext';
import { Navigate } from 'react-router-dom';
import LoadingSpinner from './LoadingSpinner';

/**
 * ProtectedRoute - Wrapper for routes that require authentication
 * Redirects unauthenticated users to the onboarding/auth page
 */
export default function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!user) {
    return <Navigate to="/onboarding" replace />;
  }

  return children;
}

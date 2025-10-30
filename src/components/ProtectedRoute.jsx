import { useAuth } from '../contexts/AuthContext';
import { Navigate } from 'react-router-dom';
import LoadingSpinner from './LoadingSpinner';

/**
 * ProtectedRoute - Wrapper for routes that require authentication
 * Redirects unauthenticated users to the onboarding/auth page
 * Allows access for both Firebase users and guest accounts
 */
export default function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) {
    return <LoadingSpinner />;
  }

  // Check if user has Firebase authentication OR guest account
  const hasGuestAccount = localStorage.getItem('lifesync_guest') !== null;

  if (!user && !hasGuestAccount) {
    return <Navigate to="/onboarding" replace />;
  }

  return children;
}

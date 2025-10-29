/**
 * Authentication Guards & Route Protection
 * ========================================
 * 
 * Components and utilities for protecting routes
 * Email verification guards
 * Session validation
 * 
 * Phase 3 Day 2 - Supporting module
 * Production-ready, TypeScript strict mode
 */

import React, { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { User } from 'firebase/auth';
import { useAuth } from '../contexts/AuthContextEnhanced';

/**
 * Protected Route Component
 * Redirects to login if user is not authenticated
 */
interface ProtectedRouteProps {
  children: React.ReactNode;
  redirectTo?: string;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  redirectTo = '/auth/login',
}) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to={redirectTo} state={{ from: location }} replace />;
  }

  return <>{children}</>;
};

/**
 * Email Verification Required Guard
 * Ensures user has verified their email before accessing content
 */
interface EmailVerificationGuardProps {
  children: React.ReactNode;
  redirectTo?: string;
  allowUnverified?: boolean;
}

export const EmailVerificationGuard: React.FC<EmailVerificationGuardProps> = ({
  children,
  redirectTo = '/auth/verify-email',
  allowUnverified = false,
}) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth/login" state={{ from: location }} replace />;
  }

  if (!allowUnverified && !user.emailVerified) {
    return <Navigate to={redirectTo} state={{ from: location }} replace />;
  }

  return <>{children}</>;
};

/**
 * Public Route Component
 * Redirects to dashboard if user is already authenticated
 */
interface PublicRouteProps {
  children: React.ReactNode;
  redirectTo?: string;
}

export const PublicRoute: React.FC<PublicRouteProps> = ({
  children,
  redirectTo = '/',
}) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (user) {
    return <Navigate to={redirectTo} replace />;
  }

  return <>{children}</>;
};

/**
 * Authentication Guard Hook
 * Useful for programmatic auth checks
 */
export const useAuthGuard = (
  options: {
    requireAuth?: boolean;
    requireEmailVerified?: boolean;
    allowUnverified?: boolean;
  } = {}
) => {
  const {
    requireAuth = true,
    requireEmailVerified = false,
    allowUnverified = !requireEmailVerified,
  } = options;

  const { user, loading } = useAuth();
  const [hasAccess, setHasAccess] = useState(false);

  useEffect(() => {
    if (loading) {
      setHasAccess(false);
      return;
    }

    // Check authentication requirement
    if (requireAuth && !user) {
      setHasAccess(false);
      return;
    }

    // Check email verification requirement
    if (requireEmailVerified && user && !user.emailVerified && !allowUnverified) {
      setHasAccess(false);
      return;
    }

    setHasAccess(true);
  }, [user, loading, requireAuth, requireEmailVerified, allowUnverified]);

  return {
    hasAccess,
    loading,
    user,
  };
};

/**
 * Session Validator Hook
 * Validates and refreshes user session
 */
export const useSessionValidator = (
  options: {
    validateInterval?: number; // milliseconds
    autoRefresh?: boolean;
  } = {}
) => {
  const { validateInterval = 5 * 60 * 1000, autoRefresh = true } = options;
  const { user } = useAuth();
  const [isValid, setIsValid] = useState(true);
  const [lastValidated, setLastValidated] = useState<Date | null>(null);

  useEffect(() => {
    if (!user || !autoRefresh) {
      return;
    }

    const validateSession = async () => {
      try {
        // Refresh ID token to check session validity
        const token = await user.getIdToken(true);
        setIsValid(!!token);
        setLastValidated(new Date());
      } catch (error) {
        console.error('Session validation failed:', error);
        setIsValid(false);
      }
    };

    // Validate immediately
    validateSession();

    // Set up interval validation
    const interval = setInterval(validateSession, validateInterval);

    return () => clearInterval(interval);
  }, [user, validateInterval, autoRefresh]);

  return {
    isValid,
    lastValidated,
  };
};

/**
 * User Presence Hook
 * Tracks user online/offline status
 */
export const useUserPresence = () => {
  const { user } = useAuth();
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return {
    isOnline,
    isUserActive: !!user && isOnline,
  };
};

/**
 * Authentication State Loader
 * Useful for loading screens
 */
interface LoadingScreenProps {
  message?: string;
}

export const AuthLoadingScreen: React.FC<LoadingScreenProps> = ({
  message = 'Loading...',
}) => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="text-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500 mx-auto mb-4"></div>
        <p className="text-lg text-gray-600">{message}</p>
      </div>
    </div>
  );
};

/**
 * Not Authenticated Screen
 * Shows when user needs to authenticate
 */
interface NotAuthenticatedScreenProps {
  message?: string;
  actionText?: string;
  onAction?: () => void;
}

export const NotAuthenticatedScreen: React.FC<NotAuthenticatedScreenProps> = ({
  message = 'Please sign in to continue',
  actionText = 'Go to Login',
  onAction,
}) => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="text-center">
        <div className="mb-6">
          <svg
            className="mx-auto h-16 w-16 text-gray-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
            />
          </svg>
        </div>
        <p className="text-xl text-gray-700 mb-6">{message}</p>
        {onAction && (
          <button
            onClick={onAction}
            className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition"
          >
            {actionText}
          </button>
        )}
      </div>
    </div>
  );
};

/**
 * Email Verification Prompt
 * Shows when email needs verification
 */
interface EmailVerificationPromptProps {
  userEmail?: string;
  onResendEmail?: () => Promise<void>;
  onLogout?: () => Promise<void>;
}

export const EmailVerificationPrompt: React.FC<EmailVerificationPromptProps> = ({
  userEmail = 'your email',
  onResendEmail,
  onLogout,
}) => {
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleResend = async () => {
    if (!onResendEmail) return;

    setLoading(true);
    try {
      await onResendEmail();
      setSent(true);
      setTimeout(() => setSent(false), 5000);
    } catch (error) {
      console.error('Failed to resend email:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full">
        <div className="mb-6">
          <svg
            className="mx-auto h-16 w-16 text-blue-500"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
            />
          </svg>
        </div>

        <h2 className="text-2xl font-bold text-center text-gray-800 mb-2">
          Verify Your Email
        </h2>

        <p className="text-center text-gray-600 mb-6">
          We sent a verification link to <span className="font-semibold">{userEmail}</span>
        </p>

        <p className="text-center text-gray-500 text-sm mb-6">
          Please check your email and click the verification link to continue.
        </p>

        <div className="space-y-3">
          {onResendEmail && (
            <button
              onClick={handleResend}
              disabled={loading}
              className="w-full px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-400 transition"
            >
              {loading ? 'Sending...' : sent ? 'Email Sent!' : 'Resend Email'}
            </button>
          )}

          {onLogout && (
            <button
              onClick={onLogout}
              className="w-full px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
            >
              Logout
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

/**
 * Auth Required Message Component
 * Flexible component for showing auth requirement messages
 */
interface AuthRequiredMessageProps {
  type?: 'login' | 'verification' | 'session-expired';
  onRetry?: () => void;
  onLogin?: () => void;
}

export const AuthRequiredMessage: React.FC<AuthRequiredMessageProps> = ({
  type = 'login',
  onRetry,
  onLogin,
}) => {
  const messages = {
    login: {
      title: 'Authentication Required',
      description: 'Please sign in to access this feature',
    },
    verification: {
      title: 'Email Verification Required',
      description: 'Please verify your email to access this feature',
    },
    'session-expired': {
      title: 'Session Expired',
      description: 'Your session has expired. Please sign in again',
    },
  };

  const message = messages[type];

  return (
    <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
      <h3 className="font-semibold text-amber-900">{message.title}</h3>
      <p className="text-amber-700 text-sm mt-1">{message.description}</p>

      <div className="flex gap-2 mt-4">
        {onLogin && (
          <button
            onClick={onLogin}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 text-sm transition"
          >
            Sign In
          </button>
        )}
        {onRetry && (
          <button
            onClick={onRetry}
            className="px-4 py-2 border border-amber-300 text-amber-700 rounded hover:bg-amber-100 text-sm transition"
          >
            Retry
          </button>
        )}
      </div>
    </div>
  );
};

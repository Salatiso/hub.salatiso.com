/**
 * Enhanced Firebase Authentication Context
 * =========================================
 * 
 * Updated auth context that integrates with FirebaseAuthService
 * Provides comprehensive auth state management and user session info
 * 
 * Phase 3 Day 2 - Enhanced version
 * Production-ready, fully typed, ESLint compliant
 */

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { User } from 'firebase/auth';
import { auth } from '../config/firebase';
import { firebaseAuthService, UserAccountInfo } from '../services/FirebaseAuthService';

/**
 * Auth Context State
 */
export interface AuthContextState {
  // User state
  user: User | null;
  userInfo: UserAccountInfo | null;
  loading: boolean;
  error: string | null;

  // Auth methods
  logout: () => Promise<void>;
  clearError: () => void;

  // Computed flags
  isAuthenticated: boolean;
  isEmailVerified: boolean;
}

/**
 * Create auth context with undefined initial value
 */
const AuthContext = createContext<AuthContextState | undefined>(undefined);

/**
 * AuthProvider Props
 */
interface AuthProviderProps {
  children: React.ReactNode;
}

/**
 * AuthProvider Component
 * Wraps application with Firebase authentication context
 */
export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [userInfo, setUserInfo] = useState<UserAccountInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  /**
   * Handle logout
   */
  const logout = useCallback(async () => {
    try {
      const response = await firebaseAuthService.logout();
      if (!response.success) {
        throw new Error(response.error?.displayMessage || 'Logout failed');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Logout failed';
      setError(errorMessage);
      throw err;
    }
  }, []);

  /**
   * Clear error messages
   */
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  /**
   * Fetch user account info
   */
  const fetchUserInfo = useCallback(async (currentUser: User) => {
    try {
      const info = await firebaseAuthService.getUserAccountInfo();
      setUserInfo(info);
    } catch (err) {
      console.error('Failed to fetch user info:', err);
    }
  }, []);

  /**
   * Set up auth state listener
   */
  useEffect(() => {
    setLoading(true);

    const unsubscribe = auth.onAuthStateChanged(async (currentUser) => {
      try {
        setUser(currentUser);

        if (currentUser) {
          await fetchUserInfo(currentUser);
        } else {
          setUserInfo(null);
        }

        setError(null);
      } catch (err) {
        console.error('Auth state change error:', err);
      } finally {
        setLoading(false);
      }
    });

    return unsubscribe;
  }, [fetchUserInfo]);

  /**
   * Context value
   */
  const value: AuthContextState = {
    user,
    userInfo,
    loading,
    error,
    logout,
    clearError,
    isAuthenticated: !!user,
    isEmailVerified: user?.emailVerified || false,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

/**
 * useAuth Hook
 * Get auth context from any component
 * 
 * Usage:
 * ```tsx
 * const { user, loading, logout } = useAuth();
 * ```
 */
export const useAuth = (): AuthContextState => {
  const context = useContext(AuthContext);

  if (context === undefined) {
    throw new Error('useAuth must be used within AuthProvider');
  }

  return context;
};

/**
 * useUser Hook
 * Convenient hook to get just the current user
 */
export const useUser = (): User | null => {
  const { user } = useAuth();
  return user;
};

/**
 * useAuthLoading Hook
 * Convenient hook to get just loading state
 */
export const useAuthLoading = (): boolean => {
  const { loading } = useAuth();
  return loading;
};

/**
 * useAuthError Hook
 * Convenient hook for error handling
 */
export const useAuthError = (): { error: string | null; clearError: () => void } => {
  const { error, clearError } = useAuth();
  return { error, clearError };
};

export default AuthContext;

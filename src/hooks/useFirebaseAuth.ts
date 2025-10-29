/**
 * Firebase Authentication Hooks
 * ==============================
 * 
 * React hooks for Firebase authentication integration
 * Simplifies authentication in components
 * 
 * Phase 3 Day 2 - Supporting module
 * Production-ready, TypeScript strict mode
 */

import { useCallback, useState, useEffect } from 'react';
import { firebaseAuthService, AuthResponse, SessionConfig, UserAccountInfo } from '../services/FirebaseAuthService';

/**
 * Hook: useEmailAuth
 * Handles email/password registration and login
 */
export const useEmailAuth = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const register = useCallback(
    async (email: string, password: string, displayName?: string) => {
      setLoading(true);
      setError(null);

      const response = await firebaseAuthService.registerWithEmail(
        email,
        password,
        displayName
      );

      if (!response.success) {
        setError(response.error?.displayMessage || 'Registration failed');
      }

      setLoading(false);
      return response;
    },
    []
  );

  const login = useCallback(async (email: string, password: string) => {
    setLoading(true);
    setError(null);

    const response = await firebaseAuthService.loginWithEmail(email, password);

    if (!response.success) {
      setError(response.error?.displayMessage || 'Login failed');
    }

    setLoading(false);
    return response;
  }, []);

  return { register, login, loading, error, setError };
};

/**
 * Hook: useSocialAuth
 * Handles social authentication (Google, GitHub, Facebook)
 */
export const useSocialAuth = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const signInWithGoogle = useCallback(async () => {
    setLoading(true);
    setError(null);

    const response = await firebaseAuthService.signInWithGoogle();

    if (!response.success) {
      setError(response.error?.displayMessage || 'Google sign-in failed');
    }

    setLoading(false);
    return response;
  }, []);

  const signInWithGithub = useCallback(async () => {
    setLoading(true);
    setError(null);

    const response = await firebaseAuthService.signInWithGithub();

    if (!response.success) {
      setError(response.error?.displayMessage || 'GitHub sign-in failed');
    }

    setLoading(false);
    return response;
  }, []);

  const signInWithFacebook = useCallback(async () => {
    setLoading(true);
    setError(null);

    const response = await firebaseAuthService.signInWithFacebook();

    if (!response.success) {
      setError(response.error?.displayMessage || 'Facebook sign-in failed');
    }

    setLoading(false);
    return response;
  }, []);

  return {
    signInWithGoogle,
    signInWithGithub,
    signInWithFacebook,
    loading,
    error,
    setError,
  };
};

/**
 * Hook: usePasswordRecovery
 * Handles password reset flow
 */
export const usePasswordRecovery = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const sendResetEmail = useCallback(async (email: string) => {
    setLoading(true);
    setError(null);
    setSuccess(false);

    const response = await firebaseAuthService.sendPasswordResetEmail(email);

    if (response.success) {
      setSuccess(true);
    } else {
      setError(response.error?.displayMessage || 'Failed to send reset email');
    }

    setLoading(false);
    return response;
  }, []);

  const verifyResetCode = useCallback(async (code: string) => {
    setLoading(true);
    setError(null);

    const response = await firebaseAuthService.verifyPasswordResetCode(code);

    if (!response.success) {
      setError(response.error?.displayMessage || 'Invalid reset code');
    }

    setLoading(false);
    return response;
  }, []);

  const confirmReset = useCallback(async (code: string, newPassword: string) => {
    setLoading(true);
    setError(null);
    setSuccess(false);

    const response = await firebaseAuthService.confirmPasswordReset(code, newPassword);

    if (response.success) {
      setSuccess(true);
    } else {
      setError(response.error?.displayMessage || 'Failed to reset password');
    }

    setLoading(false);
    return response;
  }, []);

  return {
    sendResetEmail,
    verifyResetCode,
    confirmReset,
    loading,
    error,
    success,
    setError,
  };
};

/**
 * Hook: useAccountManagement
 * Handles user profile and account operations
 */
export const useAccountManagement = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [userInfo, setUserInfo] = useState<UserAccountInfo | null>(null);

  const updateProfile = useCallback(
    async (displayName?: string, photoURL?: string) => {
      setLoading(true);
      setError(null);

      const response = await firebaseAuthService.updateUserProfile({
        displayName,
        photoURL,
      });

      if (response.success) {
        const info = await firebaseAuthService.getUserAccountInfo();
        setUserInfo(info);
      } else {
        setError(response.error?.displayMessage || 'Failed to update profile');
      }

      setLoading(false);
      return response;
    },
    []
  );

  const updateEmail = useCallback(async (currentPassword: string, newEmail: string) => {
    setLoading(true);
    setError(null);

    const response = await firebaseAuthService.updateUserEmail(
      currentPassword,
      newEmail
    );

    if (response.success) {
      const info = await firebaseAuthService.getUserAccountInfo();
      setUserInfo(info);
    } else {
      setError(response.error?.displayMessage || 'Failed to update email');
    }

    setLoading(false);
    return response;
  }, []);

  const updatePassword = useCallback(
    async (email: string, currentPassword: string, newPassword: string) => {
      setLoading(true);
      setError(null);

      const response = await firebaseAuthService.updateUserPassword(
        email,
        currentPassword,
        newPassword
      );

      if (!response.success) {
        setError(response.error?.displayMessage || 'Failed to update password');
      }

      setLoading(false);
      return response;
    },
    []
  );

  const fetchUserInfo = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const info = await firebaseAuthService.getUserAccountInfo();
      setUserInfo(info);
    } catch (err) {
      setError('Failed to fetch user information');
    }

    setLoading(false);
  }, []);

  return {
    updateProfile,
    updateEmail,
    updatePassword,
    fetchUserInfo,
    userInfo,
    loading,
    error,
    setError,
  };
};

/**
 * Hook: useAccountLinking
 * Handles linking/unlinking social providers
 */
export const useAccountLinking = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const linkGoogle = useCallback(async () => {
    setLoading(true);
    setError(null);

    const response = await firebaseAuthService.linkGoogleAccount();

    if (!response.success) {
      setError(response.error?.displayMessage || 'Failed to link Google account');
    }

    setLoading(false);
    return response;
  }, []);

  const linkGithub = useCallback(async () => {
    setLoading(true);
    setError(null);

    const response = await firebaseAuthService.linkGithubAccount();

    if (!response.success) {
      setError(response.error?.displayMessage || 'Failed to link GitHub account');
    }

    setLoading(false);
    return response;
  }, []);

  const unlinkProvider = useCallback(async (providerId: string) => {
    setLoading(true);
    setError(null);

    const response = await firebaseAuthService.unlinkProvider(providerId);

    if (!response.success) {
      setError(response.error?.displayMessage || 'Failed to unlink account');
    }

    setLoading(false);
    return response;
  }, []);

  return {
    linkGoogle,
    linkGithub,
    unlinkProvider,
    loading,
    error,
    setError,
  };
};

/**
 * Hook: useSession
 * Manages session configuration and authentication state
 */
export const useSession = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState(firebaseAuthService.getCurrentUser());

  useEffect(() => {
    // TODO: Add auth state listener
    const unsubscribe = firebaseAuthService['authInstance'].onAuthStateChanged(
      (user) => {
        setCurrentUser(user);
        setIsAuthenticated(!!user);
      }
    );

    return unsubscribe;
  }, []);

  const logout = useCallback(async () => {
    const response = await firebaseAuthService.logout();
    return response;
  }, []);

  const setSessionConfig = useCallback((config: Partial<SessionConfig>) => {
    firebaseAuthService.setSessionConfig(config);
  }, []);

  const getIdToken = useCallback(async (forceRefresh?: boolean) => {
    return firebaseAuthService.getUserIdToken(forceRefresh);
  }, []);

  return {
    isAuthenticated,
    currentUser,
    logout,
    setSessionConfig,
    getIdToken,
  };
};

/**
 * Hook: useAuth
 * Comprehensive auth hook combining all functionality
 */
export const useAuth = () => {
  const emailAuth = useEmailAuth();
  const socialAuth = useSocialAuth();
  const passwordRecovery = usePasswordRecovery();
  const accountManagement = useAccountManagement();
  const accountLinking = useAccountLinking();
  const session = useSession();

  return {
    emailAuth,
    socialAuth,
    passwordRecovery,
    accountManagement,
    accountLinking,
    session,
  };
};

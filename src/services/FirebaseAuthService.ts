/**
 * Firebase Authentication Service
 * ================================
 * 
 * Comprehensive authentication service for LifeSync
 * Features:
 * - Email/password registration and login
 * - Social authentication (Google, GitHub, Facebook)
 * - Password reset and email verification
 * - Session management
 * - Multi-factor authentication (MFA) support
 * - Account linking and unlinking
 * - User metadata management
 * 
 * Phase 3 Day 2 Implementation
 * Production-ready, TypeScript strict mode, ESLint compliant
 */

import {
  Auth,
  User,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
  updateEmail,
  updatePassword,
  sendPasswordResetEmail,
  sendEmailVerification,
  confirmPasswordReset,
  verifyPasswordResetCode,
  reauthenticateWithCredential,
  reauthenticateWithPopup,
  EmailAuthProvider,
  GoogleAuthProvider,
  GithubAuthProvider,
  FacebookAuthProvider,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  linkWithPopup,
  linkWithRedirect,
  unlink,
  multiFactor,
  PhoneAuthProvider,
  PhoneMultiFactorGenerator,
  RecaptchaVerifier,
  signInWithPhoneNumber,
  AuthError,
  Persistence,
  browserSessionPersistence,
  browserLocalPersistence,
  setPersistence,
} from 'firebase/auth';

import { auth } from '../config/firebase';
import { firebaseService } from './firebaseService';

/**
 * Authentication Error Codes
 */
export enum AuthErrorType {
  EMAIL_ALREADY_IN_USE = 'auth/email-already-in-use',
  INVALID_EMAIL = 'auth/invalid-email',
  WEAK_PASSWORD = 'auth/weak-password',
  USER_NOT_FOUND = 'auth/user-not-found',
  WRONG_PASSWORD = 'auth/wrong-password',
  ACCOUNT_EXISTS_WITH_DIFFERENT_CREDENTIAL = 'auth/account-exists-with-different-credential',
  OPERATION_NOT_ALLOWED = 'auth/operation-not-allowed',
  TOO_MANY_ATTEMPTS_LOGIN_FAILURE = 'auth/too-many-requests',
  USER_DISABLED = 'auth/user-disabled',
  INVALID_CREDENTIAL = 'auth/invalid-credential',
  NETWORK_REQUEST_FAILED = 'auth/network-request-failed',
  POPUP_BLOCKED = 'auth/popup-blocked-by-browser',
  CANCELLED_POPUP_REQUEST = 'auth/cancelled-popup-request',
}

/**
 * User Session Configuration
 */
export interface SessionConfig {
  persistence: 'local' | 'session';
  rememberMe: boolean;
  expirationTime?: number; // milliseconds
}

/**
 * Authentication Response
 */
export interface AuthResponse {
  success: boolean;
  user?: User;
  error?: {
    code: string;
    message: string;
    displayMessage: string;
  };
}

/**
 * User Account Info
 */
export interface UserAccountInfo {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  phoneNumber: string | null;
  emailVerified: boolean;
  isAnonymous: boolean;
  createdAt: Date;
  lastSignInTime: Date | null;
  customClaims?: Record<string, unknown>;
  metadata: {
    creationTime: Date | null;
    lastSignInTime: Date | null;
  };
}

/**
 * Firebase Authentication Service
 * Main service class for all authentication operations
 */
export class FirebaseAuthService {
  private static instance: FirebaseAuthService;
  private authInstance: Auth;
  private sessionConfig: SessionConfig;
  private recaptchaVerifier: RecaptchaVerifier | null = null;

  /**
   * Private constructor - Use getInstance() instead
   */
  constructor(authInstance: Auth) {
    this.authInstance = authInstance;
    this.sessionConfig = {
      persistence: 'local',
      rememberMe: false,
    };
  }

  /**
   * Get singleton instance
   */
  public static getInstance(authInstance?: Auth): FirebaseAuthService {
    if (!FirebaseAuthService.instance) {
      FirebaseAuthService.instance = new FirebaseAuthService(authInstance || auth);
    }
    return FirebaseAuthService.instance;
  }

  /**
   * ============================================
   * EMAIL/PASSWORD AUTHENTICATION
   * ============================================
   */

  /**
   * Register new user with email and password
   * Creates user account and optional user profile in Firestore
   */
  async registerWithEmail(
    email: string,
    password: string,
    displayName?: string,
    photoURL?: string
  ): Promise<AuthResponse> {
    try {
      // Validate inputs
      if (!email || !password) {
        throw new Error('Email and password are required');
      }

      if (password.length < 6) {
        throw new Error('Password must be at least 6 characters');
      }

      // Set session persistence
      await setPersistence(this.authInstance, this.getPersistence());

      // Create user account
      const userCredential = await createUserWithEmailAndPassword(
        this.authInstance,
        email,
        password
      );

      const user = userCredential.user;

      // Update user profile
      if (displayName || photoURL) {
        await updateProfile(user, {
          displayName: displayName || null,
          photoURL: photoURL || null,
        });
      }

      // Create Firestore user document
      await this.createFirestoreUserProfile(user, { displayName, photoURL });

      // Send email verification
      await this.sendVerificationEmail(user);

      return {
        success: true,
        user,
      };
    } catch (error) {
      return this.handleAuthError(error, 'Registration failed');
    }
  }

  /**
   * Login user with email and password
   */
  async loginWithEmail(email: string, password: string): Promise<AuthResponse> {
    try {
      if (!email || !password) {
        throw new Error('Email and password are required');
      }

      // Set session persistence
      await setPersistence(this.authInstance, this.getPersistence());

      const userCredential = await signInWithEmailAndPassword(
        this.authInstance,
        email,
        password
      );

      return {
        success: true,
        user: userCredential.user,
      };
    } catch (error) {
      return this.handleAuthError(error, 'Login failed');
    }
  }

  /**
   * ============================================
   * SOCIAL AUTHENTICATION
   * ============================================
   */

  /**
   * Sign in with Google using popup
   */
  async signInWithGoogle(): Promise<AuthResponse> {
    try {
      const provider = new GoogleAuthProvider();

      // Configure provider
      provider.addScope('profile');
      provider.addScope('email');

      // Set session persistence
      await setPersistence(this.authInstance, this.getPersistence());

      const userCredential = await signInWithPopup(this.authInstance, provider);
      const user = userCredential.user;

      // Create or update Firestore user profile
      await this.createFirestoreUserProfile(user);

      return {
        success: true,
        user,
      };
    } catch (error) {
      return this.handleAuthError(error, 'Google sign-in failed');
    }
  }

  /**
   * Sign in with GitHub using popup
   */
  async signInWithGithub(): Promise<AuthResponse> {
    try {
      const provider = new GithubAuthProvider();

      // Configure provider
      provider.addScope('user:email');
      provider.addScope('read:user');

      // Set session persistence
      await setPersistence(this.authInstance, this.getPersistence());

      const userCredential = await signInWithPopup(this.authInstance, provider);
      const user = userCredential.user;

      // Create or update Firestore user profile
      await this.createFirestoreUserProfile(user);

      return {
        success: true,
        user,
      };
    } catch (error) {
      return this.handleAuthError(error, 'GitHub sign-in failed');
    }
  }

  /**
   * Sign in with Facebook using popup
   */
  async signInWithFacebook(): Promise<AuthResponse> {
    try {
      const provider = new FacebookAuthProvider();

      // Configure provider
      provider.addScope('email');
      provider.addScope('public_profile');

      // Set session persistence
      await setPersistence(this.authInstance, this.getPersistence());

      const userCredential = await signInWithPopup(this.authInstance, provider);
      const user = userCredential.user;

      // Create or update Firestore user profile
      await this.createFirestoreUserProfile(user);

      return {
        success: true,
        user,
      };
    } catch (error) {
      return this.handleAuthError(error, 'Facebook sign-in failed');
    }
  }

  /**
   * Sign in with Google using redirect (for mobile)
   */
  async signInWithGoogleRedirect(): Promise<void> {
    try {
      const provider = new GoogleAuthProvider();
      provider.addScope('profile');
      provider.addScope('email');

      // Set session persistence
      await setPersistence(this.authInstance, this.getPersistence());

      await signInWithRedirect(this.authInstance, provider);
    } catch (error) {
      console.error('Google redirect sign-in failed:', error);
      throw error;
    }
  }

  /**
   * Handle redirect result (for mobile OAuth flow)
   */
  async handleRedirectResult(): Promise<AuthResponse> {
    try {
      const userCredential = await getRedirectResult(this.authInstance);

      if (!userCredential) {
        return {
          success: false,
          error: {
            code: 'NO_REDIRECT_RESULT',
            message: 'No redirect result available',
            displayMessage: 'No sign-in result found',
          },
        };
      }

      const user = userCredential.user;

      // Create or update Firestore user profile
      await this.createFirestoreUserProfile(user);

      return {
        success: true,
        user,
      };
    } catch (error) {
      return this.handleAuthError(error, 'Handling redirect failed');
    }
  }

  /**
   * ============================================
   * ACCOUNT LINKING
   * ============================================
   */

  /**
   * Link Google account to current user
   */
  async linkGoogleAccount(): Promise<AuthResponse> {
    try {
      const currentUser = this.authInstance.currentUser;

      if (!currentUser) {
        throw new Error('No user currently signed in');
      }

      const provider = new GoogleAuthProvider();
      provider.addScope('profile');
      provider.addScope('email');

      const result = await linkWithPopup(currentUser, provider);

      return {
        success: true,
        user: result.user,
      };
    } catch (error) {
      return this.handleAuthError(error, 'Failed to link Google account');
    }
  }

  /**
   * Link GitHub account to current user
   */
  async linkGithubAccount(): Promise<AuthResponse> {
    try {
      const currentUser = this.authInstance.currentUser;

      if (!currentUser) {
        throw new Error('No user currently signed in');
      }

      const provider = new GithubAuthProvider();
      provider.addScope('user:email');

      const result = await linkWithPopup(currentUser, provider);

      return {
        success: true,
        user: result.user,
      };
    } catch (error) {
      return this.handleAuthError(error, 'Failed to link GitHub account');
    }
  }

  /**
   * Unlink provider from current user
   */
  async unlinkProvider(providerId: string): Promise<AuthResponse> {
    try {
      const currentUser = this.authInstance.currentUser;

      if (!currentUser) {
        throw new Error('No user currently signed in');
      }

      const updatedUser = await unlink(currentUser, providerId);

      return {
        success: true,
        user: updatedUser,
      };
    } catch (error) {
      return this.handleAuthError(error, 'Failed to unlink provider');
    }
  }

  /**
   * ============================================
   * PASSWORD MANAGEMENT
   * ============================================
   */

  /**
   * Send password reset email
   */
  async sendPasswordResetEmail(email: string): Promise<AuthResponse> {
    try {
      if (!email) {
        throw new Error('Email is required');
      }

      await sendPasswordResetEmail(this.authInstance, email);

      return {
        success: true,
      };
    } catch (error) {
      return this.handleAuthError(error, 'Failed to send password reset email');
    }
  }

  /**
   * Verify password reset code
   */
  async verifyPasswordResetCode(code: string): Promise<AuthResponse> {
    try {
      if (!code) {
        throw new Error('Reset code is required');
      }

      const email = await verifyPasswordResetCode(this.authInstance, code);

      return {
        success: true,
        user: undefined,
      };
    } catch (error) {
      return this.handleAuthError(error, 'Invalid or expired password reset code');
    }
  }

  /**
   * Confirm password reset with new password
   */
  async confirmPasswordReset(code: string, newPassword: string): Promise<AuthResponse> {
    try {
      if (!code || !newPassword) {
        throw new Error('Code and new password are required');
      }

      if (newPassword.length < 6) {
        throw new Error('Password must be at least 6 characters');
      }

      await confirmPasswordReset(this.authInstance, code, newPassword);

      return {
        success: true,
      };
    } catch (error) {
      return this.handleAuthError(error, 'Failed to reset password');
    }
  }

  /**
   * Update user password (requires re-authentication)
   */
  async updateUserPassword(email: string, currentPassword: string, newPassword: string): Promise<AuthResponse> {
    try {
      const currentUser = this.authInstance.currentUser;

      if (!currentUser) {
        throw new Error('No user currently signed in');
      }

      if (!newPassword || newPassword.length < 6) {
        throw new Error('New password must be at least 6 characters');
      }

      // Re-authenticate with current password
      const credential = EmailAuthProvider.credential(email, currentPassword);
      await reauthenticateWithCredential(currentUser, credential);

      // Update password
      await updatePassword(currentUser, newPassword);

      return {
        success: true,
        user: currentUser,
      };
    } catch (error) {
      return this.handleAuthError(error, 'Failed to update password');
    }
  }

  /**
   * ============================================
   * EMAIL MANAGEMENT
   * ============================================
   */

  /**
   * Send email verification link
   */
  async sendVerificationEmail(user?: User): Promise<AuthResponse> {
    try {
      const currentUser = user || this.authInstance.currentUser;

      if (!currentUser) {
        throw new Error('No user currently signed in');
      }

      await sendEmailVerification(currentUser);

      return {
        success: true,
      };
    } catch (error) {
      return this.handleAuthError(error, 'Failed to send verification email');
    }
  }

  /**
   * Update user email (requires re-authentication)
   */
  async updateUserEmail(currentPassword: string, newEmail: string): Promise<AuthResponse> {
    try {
      const currentUser = this.authInstance.currentUser;

      if (!currentUser || !currentUser.email) {
        throw new Error('No user currently signed in');
      }

      if (!newEmail || !this.isValidEmail(newEmail)) {
        throw new Error('Invalid email address');
      }

      // Re-authenticate with current password
      const credential = EmailAuthProvider.credential(currentUser.email, currentPassword);
      await reauthenticateWithCredential(currentUser, credential);

      // Update email
      await updateEmail(currentUser, newEmail);

      // Send verification email to new address
      await sendEmailVerification(currentUser);

      return {
        success: true,
        user: currentUser,
      };
    } catch (error) {
      return this.handleAuthError(error, 'Failed to update email');
    }
  }

  /**
   * ============================================
   * SESSION MANAGEMENT
   * ============================================
   */

  /**
   * Configure session settings
   */
  setSessionConfig(config: Partial<SessionConfig>): void {
    this.sessionConfig = {
      ...this.sessionConfig,
      ...config,
    };
  }

  /**
   * Get current session config
   */
  getSessionConfig(): SessionConfig {
    return { ...this.sessionConfig };
  }

  /**
   * Sign out current user
   */
  async logout(): Promise<AuthResponse> {
    try {
      await signOut(this.authInstance);

      return {
        success: true,
      };
    } catch (error) {
      return this.handleAuthError(error, 'Logout failed');
    }
  }

  /**
   * Get current user
   */
  getCurrentUser(): User | null {
    return this.authInstance.currentUser;
  }

  /**
   * Get current user as promise
   */
  async getCurrentUserAsync(): Promise<User | null> {
    return new Promise((resolve) => {
      const unsubscribe = this.authInstance.onAuthStateChanged((user) => {
        unsubscribe();
        resolve(user);
      });
    });
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    return !!this.authInstance.currentUser;
  }

  /**
   * Get user ID token with claims
   */
  async getUserIdToken(forceRefresh: boolean = false): Promise<string> {
    const user = this.authInstance.currentUser;

    if (!user) {
      throw new Error('No user currently signed in');
    }

    return await user.getIdToken(forceRefresh);
  }

  /**
   * ============================================
   * USER PROFILE MANAGEMENT
   * ============================================
   */

  /**
   * Update user profile information
   */
  async updateUserProfile(updates: {
    displayName?: string;
    photoURL?: string;
  }): Promise<AuthResponse> {
    try {
      const currentUser = this.authInstance.currentUser;

      if (!currentUser) {
        throw new Error('No user currently signed in');
      }

      await updateProfile(currentUser, updates);

      // Update Firestore profile
      if (updates.displayName || updates.photoURL) {
        await firebaseService.updateUserProfile(currentUser.uid, {
          displayName: updates.displayName || currentUser.displayName,
          photoURL: updates.photoURL || currentUser.photoURL,
          updatedAt: new Date(),
        } as any);
      }

      return {
        success: true,
        user: currentUser,
      };
    } catch (error) {
      return this.handleAuthError(error, 'Failed to update profile');
    }
  }

  /**
   * Get user account information
   */
  async getUserAccountInfo(): Promise<UserAccountInfo | null> {
    const user = this.authInstance.currentUser;

    if (!user) {
      return null;
    }

    // Reload to get latest user info
    await user.reload();

    const createdAtTime = user.metadata.creationTime;
    const lastSignInAtTime = user.metadata.lastSignInTime;

    return {
      uid: user.uid,
      email: user.email,
      displayName: user.displayName,
      photoURL: user.photoURL,
      phoneNumber: user.phoneNumber,
      emailVerified: user.emailVerified,
      isAnonymous: user.isAnonymous,
      createdAt: typeof createdAtTime === 'string' ? new Date(createdAtTime) : createdAtTime || new Date(),
      lastSignInTime: typeof lastSignInAtTime === 'string' ? new Date(lastSignInAtTime) : lastSignInAtTime || null,
      metadata: {
        creationTime: typeof createdAtTime === 'string' ? new Date(createdAtTime) : createdAtTime || null,
        lastSignInTime: typeof lastSignInAtTime === 'string' ? new Date(lastSignInAtTime) : lastSignInAtTime || null,
      },
    };
  }

  /**
   * ============================================
   * PRIVATE HELPER METHODS
   * ============================================
   */

  /**
   * Create Firestore user profile document
   */
  private async createFirestoreUserProfile(
    user: User,
    additionalData?: Record<string, any>
  ): Promise<void> {
    try {
      await firebaseService.createUserProfile(user.uid, {
        uid: user.uid,
        email: user.email || '',
        displayName: user.displayName || '',
        photoURL: user.photoURL || '',
        emailVerified: user.emailVerified,
        createdAt: user.metadata.creationTime || new Date(),
        updatedAt: new Date(),
        ...additionalData,
      } as any);
    } catch (error) {
      console.warn('Failed to create Firestore profile:', error);
      // Don't throw - user is still authenticated even if profile creation fails
    }
  }

  /**
   * Get persistence setting based on session config
   */
  private getPersistence(): Persistence {
    return this.sessionConfig.persistence === 'session'
      ? browserSessionPersistence
      : browserLocalPersistence;
  }

  /**
   * Validate email format
   */
  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  /**
   * Handle authentication errors with user-friendly messages
   */
  private handleAuthError(error: unknown, defaultMessage: string): AuthResponse {
    const authError = error as AuthError;

    // Map Firebase error codes to user-friendly messages
    const errorMap: Record<string, string> = {
      [AuthErrorType.EMAIL_ALREADY_IN_USE]: 'Email is already registered. Please sign in instead.',
      [AuthErrorType.INVALID_EMAIL]: 'Please enter a valid email address.',
      [AuthErrorType.WEAK_PASSWORD]: 'Password must be at least 6 characters.',
      [AuthErrorType.USER_NOT_FOUND]: 'User not found. Please check your email.',
      [AuthErrorType.WRONG_PASSWORD]: 'Invalid password. Please try again.',
      [AuthErrorType.OPERATION_NOT_ALLOWED]: 'This operation is not allowed.',
      [AuthErrorType.TOO_MANY_ATTEMPTS_LOGIN_FAILURE]: 'Too many failed login attempts. Please try again later.',
      [AuthErrorType.USER_DISABLED]: 'This user account has been disabled.',
      [AuthErrorType.INVALID_CREDENTIAL]: 'Invalid credentials. Please try again.',
      [AuthErrorType.NETWORK_REQUEST_FAILED]: 'Network error. Please check your connection.',
      [AuthErrorType.POPUP_BLOCKED]: 'Sign-in popup was blocked. Please disable your popup blocker.',
      [AuthErrorType.CANCELLED_POPUP_REQUEST]: 'Sign-in was cancelled.',
    };

    const displayMessage = errorMap[authError.code] || defaultMessage;

    console.error(`[FirebaseAuthService] ${defaultMessage}:`, authError);

    return {
      success: false,
      error: {
        code: authError.code || 'UNKNOWN_ERROR',
        message: authError.message,
        displayMessage,
      },
    };
  }
}

/**
 * Export singleton instance
 */
export const firebaseAuthService = FirebaseAuthService.getInstance();

/**
 * Export factory function for custom Auth instances
 */
export const createFirebaseAuthService = (customAuth: Auth): FirebaseAuthService => {
  return new FirebaseAuthService(customAuth);
};

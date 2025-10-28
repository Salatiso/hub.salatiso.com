# Complete Firebase Authentication Implementation Guide
## Production-Ready Authentication for Salatiso Ecosystem Apps
**For Implementation Across All Applications (LifeSync, Sazi Life Academy, & All Ecosystem Apps)**

**Document Status**: Production Implementation Standard  
**Version**: 1.0  
**Date**: October 28, 2025  
**Applicable To**: All Salatiso ecosystem applications  
**Firebase Project**: Shared across all apps  

---

## ⚠️ CRITICAL PREREQUISITES

Before implementing any code below, ensure these prerequisites are met:

### 1. Firebase Project Setup (Do This First)
```
✓ Firebase Project Created: salatiso-main-project (or your main project)
✓ Firebase Authentication ENABLED:
  - Email/Password provider enabled
  - Google OAuth provider enabled
  - Configure OAuth consent screen
✓ Firestore Database: Created and security rules configured
✓ Environment Variables: Set up in your app's .env.local and .env.production
```

### 2. Environment Variables Configuration
**Create `.env.local` file in your app's root directory:**

```env
# Firebase Configuration (Get these from Firebase Console → Settings → Project Settings)
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key_here
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your-messaging-sender-id
NEXT_PUBLIC_FIREBASE_APP_ID=your-app-id

# Authentication Debug (Set to 'true' for development, 'false' for production)
NEXT_PUBLIC_AUTH_DEBUG=true

# Authorized Emails (Comma-separated list of emails allowed to access)
NEXT_PUBLIC_AUTHORIZED_FAMILY_EMAILS=spiceinc@gmail.com,zenzxru@gmail.com,kwakhomdeni@gmail.com,tina@salatiso.com
```

**IMPORTANT**: Never commit `.env.local` to version control. Add to `.gitignore`:
```
.env.local
.env.production.local
.env.*.local
```

### 3. Required NPM Packages

Install these exact versions:
```bash
npm install firebase@^10.5.0
npm install react-hot-toast@^2.4.1
npm install framer-motion@^10.16.0
npm install lucide-react@^0.263.0
npm install next@^14.0.0
npm install react@^18.2.0
```

---

## 🔐 IMPLEMENTATION STEP-BY-STEP

### STEP 1: Create Firebase Configuration File
**File Path**: `src/config/firebase.ts`

**Paste this code EXACTLY as shown:**

```typescript
import { initializeApp, getApps, FirebaseApp } from 'firebase/app';
import { getAuth, Auth } from 'firebase/auth';
import { getFirestore, Firestore } from 'firebase/firestore';
import { getStorage, FirebaseStorage } from 'firebase/storage';
import { getFunctions, Functions } from 'firebase/functions';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Debug: Log config in development
if (process.env.NODE_ENV === 'development') {
  console.log('🔧 Firebase Config Status:', {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY ? '✓ Configured' : '✗ MISSING',
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN ? '✓ Configured' : '✗ MISSING',
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ? '✓ Configured' : '✗ MISSING',
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET ? '✓ Configured' : '✗ MISSING',
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID ? '✓ Configured' : '✗ MISSING',
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID ? '✓ Configured' : '✗ MISSING',
  });

  if (
    !process.env.NEXT_PUBLIC_FIREBASE_API_KEY ||
    !process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN ||
    !process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID
  ) {
    console.error('❌ CRITICAL: Firebase environment variables are not configured!');
    console.error('   Add NEXT_PUBLIC_FIREBASE_* variables to your .env.local file');
  }
}

// Initialize Firebase - prevent multiple initializations
let app: FirebaseApp;
if (getApps().length === 0) {
  app = initializeApp(firebaseConfig);
  console.log('✓ Firebase App initialized');
} else {
  app = getApps()[0];
  console.log('✓ Firebase App already initialized, reusing instance');
}

// Initialize Firebase services
export const auth: Auth = getAuth(app);
export const db: Firestore = getFirestore(app);
export const storage: FirebaseStorage = getStorage(app);
export const functions: Functions = getFunctions(app);

// Export app instance for advanced use cases
export default app;
```

---

### STEP 2: Create Authentication Context
**File Path**: `src/contexts/AuthContext.tsx`

**Paste this code EXACTLY as shown:**

```typescript
import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import {
  User as FirebaseUser,
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
  onAuthStateChanged,
  createUserWithEmailAndPassword,
  setPersistence,
  browserLocalPersistence,
} from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '@/config/firebase';
import { User, UserRole } from '@/types';

interface AuthContextType {
  user: User | null;
  firebaseUser: FirebaseUser | null;
  loading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  register: (email: string, password: string, displayName: string) => Promise<void>;
  logout: () => Promise<void>;
  updateUserProfile: (updates: Partial<User>) => Promise<void>;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Initialize Google OAuth Provider
const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({
  prompt: 'select_account',
  display: 'popup',
});

// Get authorized emails from environment
const AUTHORIZED_EMAILS = process.env.NEXT_PUBLIC_AUTHORIZED_FAMILY_EMAILS
  ? process.env.NEXT_PUBLIC_AUTHORIZED_FAMILY_EMAILS.split(',').map(email => email.trim().toLowerCase())
  : [];

// Enable debug logging
const AUTH_DEBUG_ENABLED = process.env.NEXT_PUBLIC_AUTH_DEBUG === 'true' || process.env.NODE_ENV === 'development';

const debugLog = (...args: unknown[]) => {
  if (AUTH_DEBUG_ENABLED) {
    console.log('[AUTH DEBUG]', ...args);
  }
};

const errorLog = (...args: unknown[]) => {
  console.error('[AUTH ERROR]', ...args);
};

// Determine user role based on email
const determineUserRole = (email: string): UserRole => {
  const emailLower = email.toLowerCase();

  if (emailLower.includes('salatiso')) return 'founder';
  if (emailLower.includes('visasande')) return 'parent_company_lead';
  if (emailLower.includes('solo')) return 'youth_member';
  if (emailLower.includes('tina') || emailLower.includes('kwakho')) return 'general_family_member';

  return 'guest';
};

// Check if email is authorized
const isAuthorizedEmail = (email: string): boolean => {
  const normalizedEmail = email.toLowerCase().trim();
  const isAuthorized = AUTHORIZED_EMAILS.some(authEmail => authEmail === normalizedEmail);

  debugLog('📧 Email Authorization Check:', {
    email: normalizedEmail,
    isAuthorized,
    authorizedCount: AUTHORIZED_EMAILS.length,
  });

  return isAuthorized;
};

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Initialize user profile in Firestore
  const initializeUserProfile = async (firebaseUser: FirebaseUser): Promise<User> => {
    const userDocRef = doc(db, 'users', firebaseUser.uid);

    try {
      const userDoc = await getDoc(userDocRef);

      if (userDoc.exists()) {
        // User profile already exists - update last login
        debugLog('👤 Existing user profile found, updating...');
        const userData = userDoc.data();

        return {
          ...userData,
          id: firebaseUser.uid,
          createdAt: userData.createdAt?.toDate?.() || new Date(),
          lastLogin: userData.lastLogin?.toDate?.() || new Date(),
          role: userData.role || determineUserRole(firebaseUser.email!),
          preferences: userData.preferences || {
            theme: 'light',
            language: 'en',
            notifications: {
              email: true,
              push: true,
              projectUpdates: true,
              careerMilestones: true,
              familyAnnouncements: true,
            },
            dashboardLayout: [],
            gamificationEnabled: true,
          },
        } as User;
      } else {
        // Create new user profile
        debugLog('✨ Creating new user profile...');
        const newUser: Omit<User, 'id'> = {
          email: firebaseUser.email!,
          displayName: firebaseUser.displayName || '',
          photoURL: firebaseUser.photoURL || undefined,
          role: determineUserRole(firebaseUser.email!),
          createdAt: new Date(),
          lastLogin: new Date(),
          preferences: {
            theme: 'light',
            language: 'en',
            notifications: {
              email: true,
              push: true,
              projectUpdates: true,
              careerMilestones: true,
              familyAnnouncements: true,
            },
            dashboardLayout: [],
            gamificationEnabled: true,
          },
        };

        // Save to Firestore
        await setDoc(userDocRef, {
          ...newUser,
          createdAt: serverTimestamp(),
          lastLogin: serverTimestamp(),
        });

        return {
          ...newUser,
          id: firebaseUser.uid,
        };
      }
    } catch (error) {
      errorLog('Failed to initialize user profile:', error);
      throw error;
    }
  };

  // Update last login timestamp
  const updateLastLogin = async (userId: string) => {
    try {
      const userDocRef = doc(db, 'users', userId);
      await setDoc(userDocRef, { lastLogin: serverTimestamp() }, { merge: true });
    } catch (error) {
      errorLog('Failed to update last login:', error);
      // Don't throw - this is non-critical
    }
  };

  // Email/Password Login
  const login = async (email: string, password: string) => {
    setError(null);
    setLoading(true);

    try {
      // Validate email
      if (!email || !password) {
        throw new Error('Email and password are required');
      }

      // Check if email is authorized
      if (!isAuthorizedEmail(email)) {
        throw new Error(`Email ${email} is not authorized. Please use an authorized email address.`);
      }

      debugLog('🔐 Attempting email/password login for:', email);

      // Set persistence to LOCAL (survives browser restart)
      await setPersistence(auth, browserLocalPersistence);

      // Sign in with email and password
      const result = await signInWithEmailAndPassword(auth, email, password);

      debugLog('✅ Firebase authentication successful for:', email);

      // Initialize user profile
      const userProfile = await initializeUserProfile(result.user);
      await updateLastLogin(result.user.uid);

      setFirebaseUser(result.user);
      setUser(userProfile);
      setLoading(false);

      return userProfile;
    } catch (error: any) {
      const errorMessage = error?.message || 'Login failed';
      errorLog('Login failed:', errorMessage);
      setError(errorMessage);
      setLoading(false);
      throw error;
    }
  };

  // Google OAuth Login
  const loginWithGoogle = async () => {
    setError(null);
    setLoading(true);

    try {
      debugLog('🔐 Starting Google Sign-In...');

      // Set persistence to LOCAL
      await setPersistence(auth, browserLocalPersistence);

      // Sign in with Google popup
      const result = await signInWithPopup(auth, googleProvider);

      debugLog('✅ Google authentication successful for:', result.user.email);

      // Check if email is authorized
      if (!isAuthorizedEmail(result.user.email || '')) {
        // Sign out if not authorized
        await signOut(auth);
        throw new Error(`Email ${result.user.email} is not authorized to access this application.`);
      }

      // Initialize user profile
      const userProfile = await initializeUserProfile(result.user);
      await updateLastLogin(result.user.uid);

      setFirebaseUser(result.user);
      setUser(userProfile);
      setLoading(false);

      return userProfile;
    } catch (error: any) {
      // Don't log user-cancelled actions as errors
      if (error?.code === 'auth/popup-closed-by-user') {
        debugLog('ℹ️ Google sign-in popup was closed by user');
        setLoading(false);
        return;
      }

      const errorMessage = error?.message || 'Google sign-in failed';
      errorLog('Google sign-in failed:', errorMessage);
      setError(errorMessage);
      setLoading(false);
      throw error;
    }
  };

  // Register new user
  const register = async (email: string, password: string, displayName: string) => {
    setError(null);
    setLoading(true);

    try {
      if (!email || !password) {
        throw new Error('Email and password are required');
      }

      // Check if email is authorized
      if (!isAuthorizedEmail(email)) {
        throw new Error(`Email ${email} is not authorized. Access is restricted to authorized family members.`);
      }

      debugLog('📝 Registering new user:', email);

      // Set persistence
      await setPersistence(auth, browserLocalPersistence);

      // Create user account
      const result = await createUserWithEmailAndPassword(auth, email, password);

      debugLog('✅ User account created for:', email);

      // Initialize user profile
      const userProfile = await initializeUserProfile(result.user);
      await updateLastLogin(result.user.uid);

      setFirebaseUser(result.user);
      setUser(userProfile);
      setLoading(false);

      return userProfile;
    } catch (error: any) {
      const errorMessage = error?.message || 'Registration failed';
      errorLog('Registration failed:', errorMessage);
      setError(errorMessage);
      setLoading(false);
      throw error;
    }
  };

  // Logout
  const logout = async () => {
    setError(null);
    setLoading(true);

    try {
      debugLog('👋 Logging out user...');
      await signOut(auth);
      setFirebaseUser(null);
      setUser(null);
      setLoading(false);
    } catch (error: any) {
      const errorMessage = error?.message || 'Logout failed';
      errorLog('Logout failed:', errorMessage);
      setError(errorMessage);
      setLoading(false);
      throw error;
    }
  };

  // Update user profile
  const updateUserProfile = async (updates: Partial<User>) => {
    if (!user) {
      throw new Error('No authenticated user');
    }

    try {
      const userDocRef = doc(db, 'users', user.id);
      await setDoc(userDocRef, updates, { merge: true });
      setUser(prev => (prev ? { ...prev, ...updates } : null));
    } catch (error: any) {
      const errorMessage = error?.message || 'Failed to update profile';
      errorLog('Profile update failed:', errorMessage);
      setError(errorMessage);
      throw error;
    }
  };

  // Setup auth state listener
  useEffect(() => {
    debugLog('🔍 Setting up auth state listener...');

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      try {
        if (firebaseUser) {
          debugLog('✅ Auth state changed - user detected:', firebaseUser.email);

          // Check if email is authorized
          if (!isAuthorizedEmail(firebaseUser.email || '')) {
            errorLog('❌ Unauthorized email detected:', firebaseUser.email);
            await signOut(auth);
            setFirebaseUser(null);
            setUser(null);
            setError(`Email ${firebaseUser.email} is not authorized`);
            setLoading(false);
            return;
          }

          // Initialize/restore user profile
          const userProfile = await initializeUserProfile(firebaseUser);
          setFirebaseUser(firebaseUser);
          setUser(userProfile);
          setError(null);
        } else {
          debugLog('👋 Auth state changed - no user');
          setFirebaseUser(null);
          setUser(null);
        }
      } catch (error: any) {
        errorLog('Error in auth state listener:', error);
        setError(error?.message || 'Authentication error');
      } finally {
        setLoading(false);
      }
    });

    return unsubscribe;
  }, []);

  const value: AuthContextType = {
    user,
    firebaseUser,
    loading,
    error,
    login,
    loginWithGoogle,
    register,
    logout,
    updateUserProfile,
    isAuthenticated: !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Hook to use auth context
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
```

---

### STEP 3: Wrap App with Auth Provider
**File Path**: `src/pages/_app.tsx` (or equivalent entry point)

**Add this to your app initialization (wrap entire app):**

```typescript
import { AuthProvider } from '@/contexts/AuthContext';
import type { AppProps } from 'next/app';
import { Toaster } from 'react-hot-toast';

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <AuthProvider>
      <Component {...pageProps} />
      <Toaster position="top-right" />
    </AuthProvider>
  );
}

export default MyApp;
```

---

### STEP 4: Create Login Page
**File Path**: `src/pages/login.tsx` (or your login route)

**Paste this code EXACTLY as shown:**

```typescript
import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Eye, EyeOff, ArrowLeft, AlertCircle } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import toast from 'react-hot-toast';

const LoginPage: React.FC = () => {
  const router = useRouter();
  const { login, loginWithGoogle, user, loading, error } = useAuth();
  const redirectExecutedRef = useRef(false);

  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Auto-redirect if already authenticated
  useEffect(() => {
    if (user && !loading && !redirectExecutedRef.current) {
      redirectExecutedRef.current = true;
      const redirectUrl = (router.query.redirect as string) || '/dashboard';
      router.push(redirectUrl);
    }
  }, [user, loading, router]);

  // Show error notifications
  useEffect(() => {
    if (error) {
      toast.error(error);
    }
  }, [error]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.email || !formData.password) {
      toast.error('Please enter both email and password');
      return;
    }

    setIsLoading(true);

    try {
      await login(formData.email, formData.password);
      toast.success('Login successful!');
      // Redirect is handled by useEffect above
    } catch (error: any) {
      const errorMessage = error?.message || 'Login failed. Please try again.';
      toast.error(errorMessage);
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setIsLoading(true);

    try {
      await loginWithGoogle();
      toast.success('Google login successful!');
      // Redirect is handled by useEffect above
    } catch (error: any) {
      const errorMessage = error?.message || 'Google login failed. Please try again.';
      toast.error(errorMessage);
      setIsLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-white border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white text-lg">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>Login - Salatiso Ecosystem</title>
        <meta name="description" content="Secure login for Salatiso ecosystem applications" />
        <meta name="robots" content="noindex, nofollow" />
      </Head>

      <div className="min-h-screen bg-gradient-to-br from-blue-600 to-purple-600 flex flex-col">
        {/* Back Button */}
        <div className="p-6">
          <Link
            href="/"
            className="inline-flex items-center text-white hover:text-blue-100 transition-colors"
          >
            <ArrowLeft className="h-5 w-5 mr-2" />
            Back to Home
          </Link>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex items-center justify-center px-6 py-12">
          <div className="max-w-md w-full">
            {/* Header */}
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-center mb-8"
            >
              <h1 className="text-3xl font-bold text-white mb-2">Welcome Back</h1>
              <p className="text-blue-100">Sign in to your account</p>
            </motion.div>

            {/* Login Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="bg-white rounded-lg shadow-xl p-8 space-y-6"
            >
              {/* Error Display */}
              {error && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex items-start space-x-3">
                  <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium text-red-900">Authentication Error</p>
                    <p className="text-sm text-red-700 mt-1">{error}</p>
                  </div>
                </div>
              )}

              {/* Google Login Button */}
              <button
                onClick={handleGoogleLogin}
                disabled={isLoading}
                className="w-full flex items-center justify-center px-4 py-3 border border-gray-300 rounded-lg shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24">
                  <path
                    fill="currentColor"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="currentColor"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
                {isLoading ? 'Signing in...' : 'Continue with Google'}
              </button>

              {/* Divider */}
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-gray-500">Or sign in with email</span>
                </div>
              </div>

              {/* Email/Password Form */}
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                    Email Address
                  </label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    value={formData.email}
                    onChange={handleInputChange}
                    disabled={isLoading}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50 disabled:cursor-not-allowed transition-colors"
                    placeholder="your@email.com"
                  />
                </div>

                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                    Password
                  </label>
                  <div className="relative">
                    <input
                      id="password"
                      name="password"
                      type={showPassword ? 'text' : 'password'}
                      autoComplete="current-password"
                      required
                      value={formData.password}
                      onChange={handleInputChange}
                      disabled={isLoading}
                      className="w-full px-4 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50 disabled:cursor-not-allowed transition-colors"
                      placeholder="••••••••"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    >
                      {showPassword ? (
                        <EyeOff className="h-5 w-5 text-gray-400" />
                      ) : (
                        <Eye className="h-5 w-5 text-gray-400" />
                      )}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {isLoading ? 'Signing In...' : 'Sign In'}
                </button>
              </form>

              {/* Info Box */}
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm text-blue-800">
                  Access is restricted to authorized users. If you need access, please contact the administrator.
                </p>
              </div>
            </motion.div>

            {/* Footer */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="text-center mt-8 text-blue-100 text-sm"
            >
              <p>© 2025 Salatiso Ecosystem. All rights reserved.</p>
            </motion.div>
          </div>
        </div>
      </div>
    </>
  );
};

export default LoginPage;
```

---

### STEP 5: Create Protected Route Wrapper
**File Path**: `src/components/ProtectedRoute.tsx`

**Paste this code EXACTLY as shown:**

```typescript
import React from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '@/contexts/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: string;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, requiredRole }) => {
  const router = useRouter();
  const { user, loading } = useAuth();

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-gray-300 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!user) {
    router.push(`/login?redirect=${encodeURIComponent(router.asPath)}`);
    return null;
  }

  // Check role if required
  if (requiredRole && user.role !== requiredRole) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h1>
          <p className="text-gray-600">You do not have permission to access this page.</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};
```

---

### STEP 6: Use Protected Routes in Your App
**Example Usage in any page file:**

```typescript
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { useAuth } from '@/contexts/AuthContext';

export default function DashboardPage() {
  const { user } = useAuth();

  return (
    <ProtectedRoute>
      <div>
        <h1>Welcome, {user?.displayName}</h1>
        {/* Your protected content here */}
      </div>
    </ProtectedRoute>
  );
}
```

---

## 🧪 TESTING AUTHENTICATION

### Test Checklist

**1. Environment Variables**
```bash
# Run this command to verify variables are loaded
node -e "console.log(process.env.NEXT_PUBLIC_FIREBASE_API_KEY)"
```

**2. Firebase Configuration Test**
```bash
# Check if Firebase initializes without errors
npm run dev
# Watch browser console for: "✓ Firebase App initialized" message
```

**3. Google OAuth Test**
```
1. Open http://localhost:3000/login
2. Click "Continue with Google"
3. Complete Google sign-in flow
4. Should redirect to /dashboard
5. Check browser console for success messages
```

**4. Email/Password Test**
```
1. Create test user in Firebase Console → Authentication → Email/Password
2. Open http://localhost:3000/login
3. Enter test email and password
4. Should redirect to /dashboard
5. Check Firestore for user document in "users" collection
```

**5. Authorization Test**
```
1. Update NEXT_PUBLIC_AUTHORIZED_FAMILY_EMAILS in .env.local
2. Remove your test email from the list
3. Try to login - should be rejected
4. Add it back and try again - should work
```

---

## 🐛 TROUBLESHOOTING GUIDE

### Issue: "Firebase environment variables are missing"

**Solution:**
1. Check `.env.local` file exists in project root
2. Verify all NEXT_PUBLIC_FIREBASE_* variables are present
3. Restart dev server: `npm run dev`
4. Check browser console for config status

```bash
# Verify variables are set
echo $NEXT_PUBLIC_FIREBASE_API_KEY  # Should output API key, not empty
```

### Issue: "Email not authorized"

**Solution:**
1. Add your email to `NEXT_PUBLIC_AUTHORIZED_FAMILY_EMAILS` in `.env.local`
2. Format: comma-separated list, no spaces
   ```env
   NEXT_PUBLIC_AUTHORIZED_FAMILY_EMAILS=user1@gmail.com,user2@gmail.com
   ```
3. Restart dev server
4. Verify in browser console with `[AUTH DEBUG]` logs

### Issue: "Google sign-in popup not appearing"

**Solution:**
1. Verify Google OAuth provider is enabled in Firebase Console
2. Check if popup blockers are active in browser
3. Ensure redirect URI is configured in Firebase OAuth settings
4. Check browser console for popup errors

### Issue: "User profile not initializing"

**Solution:**
1. Check Firestore database exists and is in read/write mode
2. Verify security rules allow writing to `users` collection
3. Check Firebase Console → Firestore → Data for errors
4. Look for error messages in browser console under `[AUTH ERROR]`

### Issue: "Redirect loop after login"

**Solution:**
1. Clear browser cookies and local storage
2. Check the redirect URL is valid: `router.push(redirectUrl)`
3. Verify ProtectedRoute component is used correctly
4. Ensure loading state is properly handled

### Issue: "Session persists after logout"

**Solution:**
This is expected behavior with `browserLocalPersistence`. To clear:
```javascript
// On logout (already in code)
await signOut(auth);

// If needed, manually clear storage
localStorage.clear();
sessionStorage.clear();
```

---

## 📋 REQUIRED FIRESTORE SETUP

### Create Security Rules

**Go to Firebase Console → Firestore → Rules**

Paste these rules:

```firestore
rules_version = '2';

service cloud.firestore {
  match /databases/{database}/documents {
    // User profiles
    match /users/{userId} {
      allow read: if request.auth != null && request.auth.uid == userId;
      allow write: if request.auth != null && request.auth.uid == userId;
      allow create: if request.auth != null;
    }

    // Public data (optional)
    match /public/{document=**} {
      allow read: if true;
      allow write: if request.auth != null && request.auth.token.admin == true;
    }

    // Deny all other access by default
    match /{document=**} {
      allow read, write: if false;
    }
  }
}
```

---

## ✅ DEPLOYMENT CHECKLIST

Before deploying to production:

- [ ] All environment variables set in production environment
- [ ] Google OAuth redirect URIs configured in Firebase
- [ ] Firestore security rules updated for production
- [ ] Authorized emails list updated
- [ ] `NEXT_PUBLIC_AUTH_DEBUG` set to `false` in production
- [ ] Error handling tested
- [ ] Session persistence tested
- [ ] Mobile login tested
- [ ] SSL certificate valid
- [ ] CORS configured if using API

---

## 📞 COMMON ERROR CODES

| Error Code | Meaning | Solution |
|-----------|---------|----------|
| `auth/invalid-email` | Email format incorrect | Check email format |
| `auth/weak-password` | Password too short | Use at least 6 characters |
| `auth/email-already-in-use` | Email already registered | Use different email |
| `auth/wrong-password` | Password incorrect | Check password |
| `auth/user-not-found` | Email not registered | Create account first |
| `auth/user-disabled` | User account disabled | Contact admin |
| `auth/popup-closed-by-user` | User closed OAuth popup | Not an error, expected |
| `auth/operation-not-allowed` | Auth method disabled | Enable in Firebase |
| `auth/too-many-requests` | Too many login attempts | Wait before trying again |

---

## 🎯 IMPLEMENTATION SUMMARY

You have implemented:
1. ✅ Firebase initialization with proper config
2. ✅ Authentication context with email/password and Google OAuth
3. ✅ User profile creation and Firestore integration
4. ✅ Authorization checking based on email list
5. ✅ Session persistence
6. ✅ Login page with error handling
7. ✅ Protected route wrapper
8. ✅ Debug logging for troubleshooting

**The developer should now be able to implement this verbatim across all ecosystem apps.**

---

**Document Version**: 1.0  
**Last Updated**: October 28, 2025  
**Applicable To**: All Salatiso Ecosystem Applications  
**Firebase Project**: Shared across all apps with same configuration  

/**
 * Unified Auth Entry Page
 * Single entry point for all authentication methods:
 * - Google OAuth
 * - Email/Password Firebase
 * - Local account with PIN
 * 
 * @module pages/GuestLogin
 */

import React, { useState, useContext, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { GoogleAuthProvider, signInWithRedirect, getRedirectResult, createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../config/firebase';
import { getLifeCVProfile } from '../utils/firebaseProfile';
import { fromLifeCV } from '../utils/lifecvAdapter';
import GuestContext from '../contexts/GuestContext';
import { guestAccountService } from '../services/guestAccountService';
import { googleDriveService } from '../services/googleDriveService';
import { importPortableProfile } from '../utils/portableProfile';
import { GuestAccount } from '../services/guestAccountService';
import { ArrowLeft, Mail, Lock, User, CheckCircle, Users } from 'lucide-react';

interface GuestLoginPageProps {
  onGuestCreated?: (displayName: string) => void;
  className?: string;
}

type PageStep = 'options' | 'localSignup' | 'localSignin' | 'localProfileSelect' | 'emailAuth' | 'loading';

export const GuestLoginPage: React.FC<GuestLoginPageProps> = ({
  onGuestCreated,
  className = '',
}) => {
  const { guestData, setGuestData } = useContext(GuestContext);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [step, setStep] = useState<PageStep>('options');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [pin, setPin] = useState('');
  const [usePassword, setUsePassword] = useState(false);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [authMode, setAuthMode] = useState<'signin' | 'register'>(searchParams.get('mode') === 'signup' ? 'register' : 'signin');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [hasExistingGuestAccount, setHasExistingGuestAccount] = useState(false);
  const [availableProfiles, setAvailableProfiles] = useState<GuestAccount[]>([]);
  const [googleDriveSignedIn, setGoogleDriveSignedIn] = useState(false);
  const [googleDriveFiles, setGoogleDriveFiles] = useState<any[]>([]);
  const [showGoogleDriveAuth, setShowGoogleDriveAuth] = useState(false);
  const [selectedDriveFile, setSelectedDriveFile] = useState<any>(null);
  const [driveImportPassword, setDriveImportPassword] = useState('');

  // Check for existing guest account and load available profiles on component mount
   useEffect(() => {
     console.log('🔍 DEBUG: GuestLogin component mounted, initializing...');

     const checkExistingAccounts = async () => {
       try {
         console.log('🔍 DEBUG: Checking for existing accounts...');
         const profiles = await guestAccountService.listLocalProfiles();
         console.log('🔍 DEBUG: Found profiles:', profiles.length);
         setAvailableProfiles(profiles);
         setHasExistingGuestAccount(profiles.length > 0);
       } catch (error) {
         console.error('🔍 DEBUG: Failed to load profiles:', error);
         // Fallback to localStorage check
         const existingGuest = localStorage.getItem('lifesync_guest');
         console.log('🔍 DEBUG: Fallback check - existing guest:', existingGuest !== null);
         setHasExistingGuestAccount(existingGuest !== null);
       }
     };

     const initializeGoogleDrive = async () => {
       try {
         console.log('🔍 DEBUG: Initializing Google Drive...');
         await googleDriveService.initialize();
         setGoogleDriveSignedIn(googleDriveService.isUserSignedIn());
         console.log('🔍 DEBUG: Google Drive initialized');
       } catch (error) {
         console.error('🔍 DEBUG: Google Drive initialization failed:', error);
       }
     };

     checkExistingAccounts();
     initializeGoogleDrive();
   }, []);

  // Check for redirect result on component mount
  useEffect(() => {
    const checkRedirectResult = async () => {
      try {
        const result = await getRedirectResult(auth);
        if (result?.user) {
          setIsLoading(true);
          const user = result.user;

          // Try to load existing LifeCV profile
          try {
            const remote = await getLifeCVProfile(user.uid);
            if (remote) {
              const mapped = fromLifeCV(remote);
              setGuestData((prev: any) => ({
                ...prev,
                profile: {
                  ...prev.profile,
                  ...mapped,
                  deviceType: prev.profile?.deviceType || 'mobile'
                },
                owner: { uid: user.uid, source: 'lifesync' },
                role: mapped.role || prev.role,
                servicesRegistered: mapped.servicesRegistered?.length ? mapped.servicesRegistered : prev.servicesRegistered,
              }));
            } else {
              // New user, initialize with basic profile
              setGuestData((prev: any) => ({
                ...prev,
                profile: {
                  ...prev.profile,
                  firstName: user.displayName ? user.displayName.split(' ')[0] : '',
                  lastName: user.displayName ? user.displayName.split(' ').slice(1).join(' ') : '',
                  emails: [{ id: 1, address: user.email, label: 'Personal' }],
                  deviceType: prev.profile?.deviceType || 'mobile'
                },
                owner: { uid: user.uid, source: 'lifesync' }
              }));
            }
          } catch (profileError) {
            console.warn('Failed to load LifeCV profile, using basic profile', profileError);
            // Still proceed with basic profile even if Firestore read fails
            setGuestData((prev: any) => ({
              ...prev,
              profile: {
                ...prev.profile,
                firstName: user.displayName ? user.displayName.split(' ')[0] : '',
                lastName: user.displayName ? user.displayName.split(' ').slice(1).join(' ') : '',
                emails: [{ id: 1, address: user.email, label: 'Personal' }],
                deviceType: prev.profile?.deviceType || 'mobile'
              },
              owner: { uid: user.uid, source: 'lifesync' }
            }));
          }

          navigate('/dashboard');
        }
      } catch (err) {
        console.error('Redirect sign-in error:', err);
        if ((err as any).code !== 'auth/popup-closed-by-user') {
          setError((err as any).message || 'Failed to complete sign-in. Please try again.');
        }
      } finally {
        setIsLoading(false);
      }
    };

    checkRedirectResult();
  }, [navigate, setGuestData]);

  // Handle Google OAuth Sign-in
  const handleGoogleSignIn = async () => {
    try {
      setIsLoading(true);
      const provider = new GoogleAuthProvider();
      provider.addScope('profile');
      provider.addScope('email');
      await signInWithRedirect(auth, provider);
    } catch (err) {
      setError('Failed to sign in with Google. Please try again.');
      console.error('Google signin error:', err);
      setIsLoading(false);
    }
  };

  // Handle Computer/Device Import
  const handleComputerImport = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json,.lifesync';
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;

      try {
        setIsLoading(true);
        setError('');

        const text = await file.text();
        let profileData;

        try {
          profileData = JSON.parse(text);
        } catch (parseError) {
          setError('Invalid file format. Please select a valid LifeSync profile file.');
          setIsLoading(false);
          return;
        }

        // Import the profile using the portable profile utility
        const success = await importPortableProfile(profileData, setGuestData);

        console.log('🔍 DEBUG: Import result:', success);

        // Always navigate on import (the function handles success/failure internally)
        console.log('🔍 DEBUG: Navigating to dashboard after import attempt');
        navigate('/dashboard');

      } catch (err) {
        console.error('Import error:', err);
        setError('Failed to import profile. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };
    input.click();
  };

  // Handle Email/Password Authentication
  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please fill in all fields');
      return;
    }

    if (authMode === 'register' && password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    // CRITICAL: Terms of Reciprocity must be accepted for signup
    if (authMode === 'register' && !termsAccepted) {
      setError('You must accept the Terms of Reciprocity to create an account');
      return;
    }

    try {
      setIsLoading(true);
      setError('');

      if (authMode === 'register') {
        await createUserWithEmailAndPassword(auth, email, password);
      } else {
        await signInWithEmailAndPassword(auth, email, password);
      }

      // User will be handled by the auth state change listener in App.jsx
      navigate('/dashboard');
    } catch (err) {
      console.error('Email auth failed', err);
      const error = err as any;
      if (error.code === 'auth/weak-password') {
        setError('Password should be at least 6 characters');
      } else if (error.code === 'auth/email-already-in-use') {
        setError('An account with this email already exists');
      } else if (error.code === 'auth/user-not-found') {
        setError('No account found with this email');
      } else if (error.code === 'auth/wrong-password') {
        setError('Incorrect password');
      } else {
        setError('Authentication failed. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Handle Local Account Sign-up/Sign-in
  const handleLocalSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    console.log('🔍 DEBUG: Starting guest account creation process');

    if (!firstName.trim() || !lastName.trim()) {
      setError('Please enter your first and last name');
      return;
    }

    if (!usePassword && pin.length < 4) {
      setError('Please enter a 4-digit PIN');
      return;
    }

    if (usePassword && password.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }

    setIsLoading(true);

    try {
      const fullName = `${firstName.trim()} ${lastName.trim()}`;
      const localSecurityValue = usePassword ? password : pin;

      console.log('🔍 DEBUG: Form validation passed, creating account for:', fullName);

      // Check if profile already exists
      const existingProfile = availableProfiles.find(p => p.displayName === fullName);

      if (existingProfile) {
        console.log('🔍 DEBUG: Existing profile found, authenticating:', existingProfile.id);
        // Existing profile - authenticate
        const success = await guestAccountService.authenticateLocalProfile(fullName, {
          pin: localSecurityValue,
          usePassword: usePassword,
        });

        if (!success) {
          setError('Incorrect PIN or password for existing account');
          return;
        }

        console.log('🔍 DEBUG: Authentication successful, loading profile data');
        // Load existing profile data
        const profileData = await guestAccountService.getLocalProfileData(existingProfile.id);
        setGuestData({
          ...profileData,
          profile: {
            firstName: existingProfile.firstName,
            lastName: existingProfile.lastName,
            emails: existingProfile.email ? [{ id: 1, address: existingProfile.email, label: 'Personal' }] : [],
            deviceType: 'mobile' // Default
          },
          owner: existingProfile.owner || { source: 'local' }
        });
      } else {
        console.log('🔍 DEBUG: Creating new profile');
        // New profile - create
        const profile = await guestAccountService.createLocalProfile(fullName, email.trim() || undefined, {
          pin: localSecurityValue,
          usePassword: usePassword,
          firstName: firstName.trim(),
          lastName: lastName.trim(),
        });

        console.log('🔍 DEBUG: Profile created:', profile.id);

        // Initialize with registration data
        const initialProfileData = {
          profile: {
            firstName: firstName.trim(),
            lastName: lastName.trim(),
            emails: email.trim() ? [{ id: 1, address: email.trim(), label: 'Personal' }] : [],
            deviceType: 'mobile',
            phone: email.trim() ? undefined : undefined,
            location: undefined
          },
          owner: { source: 'local' },
          createdAt: Date.now(),
          profileProgress: 0,
          lastUpdated: Date.now()
        };

        console.log('🔍 DEBUG: Saving initial profile data to IndexedDB');
        // Save to IndexedDB
        await guestAccountService.updateLocalProfileData(profile.id, initialProfileData);

        setGuestData({
          ...initialProfileData,
          profileId: profile.id
        });
      }

      console.log('🔍 DEBUG: Guest data set, calling onGuestCreated callback');
      onGuestCreated?.(fullName);

      console.log('🔍 DEBUG: Navigating to dashboard in 500ms');
      // Redirect to dashboard immediately (NOT onboarding)
      setTimeout(() => {
        console.log('🔍 DEBUG: Navigation timeout triggered, navigating to /dashboard');
        navigate('/dashboard');
      }, 500);
    } catch (err) {
      console.error('🔍 DEBUG: Local account error:', err);
      setError('Failed to process account. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Google Drive Functions
  const handleGoogleDriveSignIn = async () => {
    try {
      await googleDriveService.signIn();
      setGoogleDriveSignedIn(true);
      setShowGoogleDriveAuth(false);
      // Load available files
      await loadGoogleDriveFiles();
    } catch (error: any) {
      setError('Google Drive sign-in failed: ' + error.message);
    }
  };

  const loadGoogleDriveFiles = async () => {
    try {
      const files = await googleDriveService.listProfileFiles();
      setGoogleDriveFiles(files);
    } catch (error) {
      console.error('Failed to load Google Drive files:', error);
    }
  };

  const handleGoogleDriveFileSelect = async (file: any) => {
    setSelectedDriveFile(file);
  };

  const handleGoogleDriveImport = async () => {
    if (!selectedDriveFile || !driveImportPassword) {
      setError('Please select a file and enter the password');
      return;
    }

    setIsLoading(true);
    try {
      const encryptedData = await googleDriveService.downloadFile(selectedDriveFile.id);
      await importPortableProfile(encryptedData, driveImportPassword);

      // Navigate to dashboard
      navigate('/dashboard');
    } catch (error: any) {
      setError('Import failed: ' + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle Local Account Sign-in
  const handleLocalSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!firstName.trim() || !lastName.trim()) {
      setError('Please enter your first and last name');
      return;
    }

    if (!usePassword && pin.length < 4) {
      setError('Please enter your 4-digit PIN');
      return;
    }

    if (usePassword && !password) {
      setError('Please enter your password');
      return;
    }

    setIsLoading(true);

    try {
      const fullName = `${firstName.trim()} ${lastName.trim()}`;
      const localSecurityValue = usePassword ? password : pin;

      // Try to authenticate the profile
      const success = await guestAccountService.authenticateLocalProfile(fullName, {
        pin: localSecurityValue,
        usePassword: usePassword,
      });

      if (!success) {
        setError('Account not found or incorrect credentials');
        return;
      }

      // Load the profile data
      const profiles = await guestAccountService.listLocalProfiles();
      const profile = profiles.find(p => p.displayName === fullName);
      
      if (profile) {
        const profileData = await guestAccountService.getLocalProfileData(profile.id);
        setGuestData({
          ...profileData,
          profile: {
            firstName: profile.firstName,
            lastName: profile.lastName,
            emails: profile.email ? [{ id: 1, address: profile.email, label: 'Personal' }] : [],
            deviceType: 'mobile' // Default
          },
          owner: profile.owner || { source: 'local' }
        });
        navigate('/dashboard');
      } else {
        setError('Failed to load account data');
      }
    } catch (err) {
      setError('Failed to sign in. Please try again.');
      console.error('Local signin error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      className={`min-h-screen bg-gradient-to-br from-blue-50 via-white to-cyan-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800 flex items-center justify-center p-4 ${className}`}
    >
      {/* === OPTIONS SCREEN (All 3 Auth Methods) === */}
      {step === 'options' && (
        <div className="max-w-4xl w-full">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-full mb-4">
              <span className="text-3xl">🚀</span>
            </div>
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-3">
              Get Started with LifeSync
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-400">
              Choose how you'd like to begin
            </p>
          </div>

          {/* Option Cards - Unified 2 Options */}
          <div className="grid gap-6 md:grid-cols-3 max-w-6xl mx-auto">
            
            {/* Option 1: Google OAuth */}
            <div
              onClick={handleGoogleSignIn}
              role="button"
              tabIndex={0}
              className="group relative overflow-hidden bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 border-2 border-transparent hover:border-blue-500 h-full cursor-pointer"
              onKeyPress={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  handleGoogleSignIn();
                }
              }}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-transparent dark:from-blue-900/20 opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="relative z-10">
                <div className="text-5xl mb-4">☁️</div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                  Continue with Google
                </h2>
                <p className="text-gray-600 dark:text-gray-400 mb-6 text-sm">
                  Fastest option. Cloud backup & multi-device access.
                </p>
                <ul className="space-y-2 mb-6 text-left text-xs">
                  <li className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                    <span>⚡</span> One-click signin
                  </li>
                  <li className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                    <span>☁️</span> Synced across devices
                  </li>
                  <li className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                    <span>🔒</span> Secure authentication
                  </li>
                </ul>
                <div className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors text-sm group-hover:shadow-lg text-center">
                  Continue with Google →
                </div>
              </div>
            </div>

            {/* Option 2: Local Account */}
            <div
              onClick={() => setStep('localSignup')}
              className="group relative overflow-hidden bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 border-2 border-transparent hover:border-green-500 h-full cursor-pointer disabled:opacity-50"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-green-50 to-transparent dark:from-green-900/20 opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="relative z-10">
                <div className="text-5xl mb-4">�</div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                  Continue with Local Account
                </h2>
                <p className="text-gray-600 dark:text-gray-400 mb-6 text-sm">
                  Works offline. PIN-protected. Sync later if you want.
                </p>
                <ul className="space-y-2 mb-6 text-left text-xs">
                  <li className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                    <span>📴</span> Works without internet
                  </li>
                  <li className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                    <span>🔑</span> PIN or password protection
                  </li>
                  <li className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                    <span>⬆️</span> Optional cloud sync
                  </li>
                </ul>
                <div className="w-full px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg transition-colors text-sm group-hover:shadow-lg text-center">
                  Continue with Local →
                </div>
              </div>
            </div>

            {/* Option 3: Import from Computer/Device */}
            <div
              onClick={handleComputerImport}
              className="group relative overflow-hidden bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 border-2 border-transparent hover:border-purple-500 h-full cursor-pointer"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-purple-50 to-transparent dark:from-purple-900/20 opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="relative z-10">
                <div className="text-5xl mb-4">💻</div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                  Import from Computer/Device
                </h2>
                <p className="text-gray-600 dark:text-gray-400 mb-6 text-sm">
                  Load a profile file from your computer or device storage.
                </p>
                <ul className="space-y-2 mb-6 text-left text-xs">
                  <li className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                    <span>📂</span> Select file from device
                  </li>
                  <li className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                    <span>🔐</span> Password protected
                  </li>
                  <li className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                    <span>📄</span> JSON or LifeSync files
                  </li>
                </ul>
                <div className="w-full px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-lg transition-colors text-sm group-hover:shadow-lg text-center">
                  Import from Device →
                </div>
              </div>
            </div>

            {/* Option 4: Google Drive Import */}
            <div
              onClick={() => setShowGoogleDriveAuth(true)}
              className="group relative overflow-hidden bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 border-2 border-transparent hover:border-red-500 h-full cursor-pointer"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-red-50 to-transparent dark:from-red-900/20 opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="relative z-10">
                <div className="text-5xl mb-4">📁</div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                  Import from Google Drive
                </h2>
                <p className="text-gray-600 dark:text-gray-400 mb-6 text-sm">
                  Load a previously exported profile from Google Drive.
                </p>
                <ul className="space-y-2 mb-6 text-left text-xs">
                  <li className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                    <span>📤</span> Import encrypted profiles
                  </li>
                  <li className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                    <span>🔐</span> Password protected
                  </li>
                  <li className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                    <span>📱</span> Cross-device mobility
                  </li>
                </ul>
                <div className="w-full px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg transition-colors text-sm group-hover:shadow-lg text-center">
                  Import from Drive →
                </div>
              </div>
            </div>

          </div>


        </div>
      )}

      {/* === EMAIL AUTH SCREEN === */}
      {step === 'emailAuth' && (
        <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-xl shadow-xl p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <User className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              {authMode === 'signin' ? 'Sign In' : 'Create Account'}
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              {authMode === 'signin' ? 'Welcome back!' : 'Join the LifeSync community'}
            </p>
          </div>

          {/* Google Sign In */}
          <button
            onClick={handleGoogleSignIn}
            disabled={isLoading}
            className="w-full mb-6 flex items-center justify-center gap-3 px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors disabled:opacity-50"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Continue with Google
          </button>

          {/* Divider */}
          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300 dark:border-gray-600"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white dark:bg-gray-800 text-gray-500">Or</span>
            </div>
          </div>

          {/* Email Form */}
          <form onSubmit={handleEmailAuth} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Email
              </label>
              <div className="relative">
                <Mail className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-3 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter your email"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-3 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter your password"
                  required
                />
              </div>
            </div>

            {authMode === 'register' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Confirm Password
                </label>
                <div className="relative">
                  <Lock className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full pl-10 pr-3 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Confirm your password"
                    required
                  />
                </div>
              </div>
            )}

            {/* CRITICAL: Terms of Reciprocity Acceptance - Required for signup */}
            {authMode === 'register' && (
              <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <input
                    type="checkbox"
                    id="terms-checkbox"
                    checked={termsAccepted}
                    onChange={(e) => setTermsAccepted(e.target.checked)}
                    className="mt-1 h-4 w-4 rounded border-gray-300 text-amber-600 focus:ring-amber-500 cursor-pointer"
                    required
                  />
                  <label htmlFor="terms-checkbox" className="text-sm text-amber-800 dark:text-amber-200 cursor-pointer flex-1">
                    <span className="font-medium">I accept the Terms of Reciprocity</span>
                    <p className="text-xs text-amber-700 dark:text-amber-300 mt-1">
                      By creating an account, you agree to the principles of mutual respect, fair exchange, and community responsibility.{' '}
                      <a href="/terms/reciprocity" target="_blank" rel="noopener noreferrer" className="underline hover:text-amber-900 dark:hover:text-amber-100">
                        Read full terms
                      </a>
                    </p>
                  </label>
                </div>
              </div>
            )}

            {error && (
              <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading || (authMode === 'register' && !termsAccepted)}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-medium py-3 px-4 rounded-lg transition-colors disabled:cursor-not-allowed"
            >
              {isLoading ? 'Please wait...' : (authMode === 'signin' ? 'Sign In' : 'Create Account')}
            </button>
          </form>

          {/* Mode Toggle */}
          <div className="mt-6 text-center space-y-3">
            <button
              onClick={() => {
                setAuthMode(authMode === 'signin' ? 'register' : 'signin');
                setError('');
              }}
              className="w-full text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 text-sm"
            >
              {authMode === 'signin' ? "Don't have an account? Sign up" : 'Already have an account? Sign in'}
            </button>

            {/* Divider */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300 dark:border-gray-600"></div>
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="px-2 bg-white dark:bg-gray-800 text-gray-500">Or</span>
              </div>
            </div>

            {/* Local Account Button */}
            <button
              onClick={() => setStep('localSignup')}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600 text-white rounded-lg transition-all font-medium"
            >
              <Users className="w-5 h-5" />
              Create a Local Account
            </button>
          </div>

          {/* Back Button */}
          <button
            onClick={() => setStep('options')}
            className="w-full mt-4 flex items-center justify-center gap-2 px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Options
          </button>
        </div>
      )}

      {/* === LOCAL ACCOUNT SIGNIN SCREEN === */}
      {step === 'localSignin' && (
        <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-xl shadow-xl p-8">
          <button
            onClick={() => setStep('options')}
            className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 mb-6"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </button>

          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              Sign In to Local Account
            </h2>
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              Enter your name and PIN or password to access your account.
            </p>
          </div>

          {isLoading ? (
            <div className="text-center py-12">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-green-600 rounded-full mb-4 animate-spin">
                <div className="w-8 h-8 border-4 border-green-200 border-t-green-600 rounded-full" />
              </div>
              <p className="text-gray-600 dark:text-gray-400">Signing you in...</p>
            </div>
          ) : (
            <form onSubmit={handleLocalSignIn} className="space-y-4">
              {/* First Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  First Name *
                </label>
                <input
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder="John"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  required
                />
              </div>

              {/* Last Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Last Name *
                </label>
                <input
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  placeholder="Doe"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  required
                />
              </div>

              {/* PIN / Password Toggle */}
              {!usePassword && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    4-Digit PIN *
                  </label>
                  <input
                    type="password"
                    value={pin}
                    onChange={(e) => setPin(e.target.value.slice(0, 4))}
                    placeholder="••••"
                    maxLength={4}
                    pattern="[0-9]{4}"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-center text-2xl focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    required
                  />
                  <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                    Enter the PIN you used when creating your account
                  </p>
                </div>
              )}

              {usePassword && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Password *
                  </label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    required
                  />
                  <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                    Enter the password you used when creating your account
                  </p>
                </div>
              )}

              {/* Security Option Toggle */}
              <div>
                <label className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                  <input
                    type="checkbox"
                    checked={usePassword}
                    onChange={(e) => {
                      setUsePassword(e.target.checked);
                      setPin('');
                      setPassword('');
                    }}
                    className="w-4 h-4 rounded border-gray-300"
                  />
                  Use password instead of PIN
                </label>
              </div>

              {/* Error */}
              {error && (
                <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                  <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
                </div>
              )}

              {/* Info Box */}
              <div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                <p className="text-xs text-green-900 dark:text-green-100">
                  🔐 <strong>Secure Access</strong> Your local account data is stored securely on this device only.
                </p>
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={
                  isLoading ||
                  !firstName.trim() ||
                  !lastName.trim() ||
                  (!usePassword && pin.length < 4) ||
                  (usePassword && !password)
                }
                className="w-full px-4 py-3 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition-colors"
              >
                {isLoading ? 'Signing In...' : 'Sign In'}
              </button>

              {/* Forgot PIN/Password Link */}
              <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
                Forgot your PIN or password? You'll need to create a new local account.
              </p>
            </form>
          )}
        </div>
      )}

      {/* === LOCAL ACCOUNT SIGNUP SCREEN === */}
      {step === 'localSignup' && (
        <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-xl shadow-xl p-8">
          <button
            onClick={() => setStep('options')}
            className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 mb-6"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </button>
          
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              Local Account
            </h2>
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              Enter your name and create or access your local account.
            </p>
          </div>

          {isLoading ? (
            <div className="text-center py-12">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-purple-600 rounded-full mb-4 animate-spin">
                <div className="w-8 h-8 border-4 border-purple-200 border-t-purple-600 rounded-full" />
              </div>
              <p className="text-gray-600 dark:text-gray-400">Setting up your account...</p>
            </div>
          ) : (
            <form onSubmit={handleLocalSignUp} className="space-y-4">
              {/* First Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  First Name *
                </label>
                <input
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder="John"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  required
                />
              </div>

              {/* Last Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Last Name *
                </label>
                <input
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  placeholder="Doe"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  required
                />
              </div>

              {/* Email (Optional) */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Email (optional)
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="john@example.com"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>

              {/* PIN / Password Toggle */}
              {!usePassword && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    4-Digit PIN *
                  </label>
                  <input
                    type="password"
                    value={pin}
                    onChange={(e) => setPin(e.target.value.slice(0, 4))}
                    placeholder="••••"
                    maxLength={4}
                    pattern="[0-9]{4}"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-center text-2xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    required
                  />
                  <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                    You'll use this to secure your local account
                  </p>
                </div>
              )}

              {usePassword && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Password (min 8 characters) *
                  </label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter password"
                    minLength={8}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    required
                  />
                </div>
              )}

              {/* Security Option Toggle */}
              <div>
                <label className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                  <input
                    type="checkbox"
                    checked={usePassword}
                    onChange={(e) => {
                      setUsePassword(e.target.checked);
                      setPin('');
                      setPassword('');
                    }}
                    className="w-4 h-4 rounded border-gray-300"
                  />
                  Use password instead of PIN
                </label>
              </div>

              {/* Error */}
              {error && (
                <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                  <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
                </div>
              )}

              {/* Info Box */}
              <div className="p-4 bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-lg">
                <p className="text-xs text-purple-900 dark:text-purple-100">
                  🔐 <strong>Secure Local Access</strong> Your account data is stored securely on this device. If you already have an account with this name, you'll sign in. Otherwise, a new account will be created.
                </p>
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={
                  isLoading || 
                  !firstName.trim() || 
                  !lastName.trim() || 
                  (!usePassword && pin.length < 4) || 
                  (usePassword && password.length < 8)
                }
                className="w-full px-4 py-3 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition-colors"
              >
                {isLoading ? 'Processing...' : 'Continue'}
              </button>

              {/* Terms */}
              <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
                By continuing, you agree to our Terms of Service and Privacy Policy
              </p>
            </form>
          )}
        </div>
      )}

      {/* === GOOGLE DRIVE AUTH DIALOG === */}
      {showGoogleDriveAuth && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 max-w-md w-full mx-4">
            <div className="text-center mb-6">
              <div className="text-6xl mb-4">📁</div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                Connect Google Drive
              </h2>
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                Sign in to Google Drive to import your LifeSync profile
              </p>
            </div>

            <div className="space-y-4">
              <button
                onClick={handleGoogleDriveSignIn}
                disabled={isLoading}
                className="w-full flex items-center justify-center gap-3 px-4 py-3 bg-red-600 hover:bg-red-700 disabled:bg-gray-400 text-white font-semibold rounded-lg transition-colors"
              >
                <span>📁</span>
                {isLoading ? 'Connecting...' : 'Continue with Google Drive'}
              </button>

              <button
                onClick={() => setShowGoogleDriveAuth(false)}
                className="w-full px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 text-sm"
              >
                Cancel
              </button>
            </div>

            {/* Error */}
            {error && (
              <div className="mt-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* === GOOGLE DRIVE FILE SELECTION DIALOG === */}
      {googleDriveSignedIn && googleDriveFiles.length > 0 && !selectedDriveFile && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 max-w-lg w-full mx-4 max-h-[80vh] overflow-y-auto">
            <div className="text-center mb-6">
              <div className="text-6xl mb-4">📄</div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                Select Profile File
              </h2>
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                Choose a LifeSync profile file from your Google Drive
              </p>
            </div>

            <div className="space-y-3 mb-6">
              {googleDriveFiles.map((file) => (
                <button
                  key={file.id}
                  onClick={() => handleGoogleDriveFileSelect(file)}
                  className="w-full p-4 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-left"
                >
                  <div className="font-medium text-gray-900 dark:text-white">{file.name}</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    Modified: {new Date(file.modifiedTime).toLocaleString()}
                  </div>
                  <div className="text-sm text-gray-500">
                    Size: {file.size ? `${Math.round(parseInt(file.size) / 1024)} KB` : 'Unknown'}
                  </div>
                </button>
              ))}
            </div>

            <button
              onClick={() => {
                setGoogleDriveSignedIn(false);
                setGoogleDriveFiles([]);
                setShowGoogleDriveAuth(false);
              }}
              className="w-full px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 text-sm"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* === GOOGLE DRIVE PASSWORD DIALOG === */}
      {selectedDriveFile && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 max-w-md w-full mx-4">
            <div className="text-center mb-6">
              <div className="text-6xl mb-4">🔐</div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                Enter Password
              </h2>
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                Enter the password used to encrypt this profile
              </p>
            </div>

            <form onSubmit={(e) => { e.preventDefault(); handleGoogleDriveImport(); }} className="space-y-4">
              <div>
                <input
                  type="password"
                  value={driveImportPassword}
                  onChange={(e) => setDriveImportPassword(e.target.value)}
                  placeholder="Enter decryption password"
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  required
                />
              </div>

              <div className="flex gap-3">
                <button
                  type="submit"
                  disabled={isLoading || !driveImportPassword}
                  className="flex-1 px-4 py-3 bg-red-600 hover:bg-red-700 disabled:bg-gray-400 text-white font-semibold rounded-lg transition-colors"
                >
                  {isLoading ? 'Importing...' : 'Import Profile'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedDriveFile(null);
                    setDriveImportPassword('');
                  }}
                  className="px-4 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  Back
                </button>
              </div>
            </form>

            {/* Error */}
            {error && (
              <div className="mt-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default GuestLoginPage;

/**
 * Unified Auth Entry Page
 * Single entry point for all authentication methods:
 * - Google OAuth
 * - Email/Password Firebase
 * - Local account with PIN
 * 
 * @module pages/GuestLogin
 */

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { GoogleAuthProvider, signInWithRedirect } from 'firebase/auth';
import { auth } from '../config/firebase';
import { guestAccountService } from '../services/guestAccountService';
import { ArrowLeft } from 'lucide-react';

interface GuestLoginPageProps {
  onGuestCreated?: (displayName: string) => void;
  className?: string;
}

type PageStep = 'options' | 'localSignup' | 'emailSignup' | 'loading';

export const GuestLoginPage: React.FC<GuestLoginPageProps> = ({
  onGuestCreated,
  className = '',
}) => {
  const navigate = useNavigate();
  const [step, setStep] = useState<PageStep>('options');
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [pin, setPin] = useState('');
  const [usePassword, setUsePassword] = useState(false);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

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

  // Handle Local Account Sign-up
  const handleLocalSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!displayName.trim()) {
      setError('Please enter your name');
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
      const localSecurityValue = usePassword ? password : pin;

      // Create local account with PIN/password
      guestAccountService.createGuestAccount(displayName.trim(), email.trim() || undefined, {
        pin: localSecurityValue,
        usePassword: usePassword,
      });

      onGuestCreated?.(displayName.trim());

      // Redirect to dashboard immediately (NOT onboarding)
      setTimeout(() => {
        navigate('/dashboard');
      }, 500);
    } catch (err) {
      setError('Failed to create account. Please try again.');
      console.error('Local signup error:', err);
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

          {/* Three Equal Option Cards */}
          <div className="grid md:grid-cols-3 gap-6 mb-8">
            
            {/* Option 1: Google OAuth */}
            <button
              onClick={handleGoogleSignIn}
              disabled={isLoading}
              className="group relative overflow-hidden bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 border-2 border-transparent hover:border-blue-500 h-full disabled:opacity-50"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-transparent dark:from-blue-900/20 opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="relative z-10">
                <div className="text-5xl mb-4">�</div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                  Continue with Google
                </h2>
                <p className="text-gray-600 dark:text-gray-400 mb-6 text-sm">
                  Cloud backup & multi-device access. Fastest option.
                </p>
                <ul className="space-y-2 mb-6 text-left text-xs">
                  <li className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                    <span>☁️</span> Synced across devices
                  </li>
                  <li className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                    <span>⚡</span> One-click signin
                  </li>
                  <li className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                    <span>🔒</span> Secure authentication
                  </li>
                </ul>
                <button 
                  className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors text-sm group-hover:shadow-lg"
                  type="button"
                >
                  Continue →
                </button>
              </div>
            </button>

            {/* Option 2: Email/Password */}
            <button
              onClick={() => setStep('emailSignup')}
              disabled={isLoading}
              className="group relative overflow-hidden bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 border-2 border-transparent hover:border-green-500 h-full disabled:opacity-50"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-green-50 to-transparent dark:from-green-900/20 opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="relative z-10">
                <div className="text-5xl mb-4">�</div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                  Sign Up with Email
                </h2>
                <p className="text-gray-600 dark:text-gray-400 mb-6 text-sm">
                  Standard account. Cloud-backed security.
                </p>
                <ul className="space-y-2 mb-6 text-left text-xs">
                  <li className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                    <span>✉️</span> Email & password login
                  </li>
                  <li className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                    <span>☁️</span> Cloud backup
                  </li>
                  <li className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                    <span>🔐</span> Encrypted storage
                  </li>
                </ul>
                <button 
                  className="w-full px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg transition-colors text-sm group-hover:shadow-lg"
                  type="button"
                >
                  Sign Up →
                </button>
              </div>
            </button>

            {/* Option 3: Local Account */}
            <button
              onClick={() => setStep('localSignup')}
              disabled={isLoading}
              className="group relative overflow-hidden bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 border-2 border-transparent hover:border-purple-500 h-full disabled:opacity-50"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-purple-50 to-transparent dark:from-purple-900/20 opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="relative z-10">
                <div className="text-5xl mb-4">📱</div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                  Create a Local Account
                </h2>
                <p className="text-gray-600 dark:text-gray-400 mb-6 text-sm">
                  Works offline. 4-digit PIN. Upgrade anytime.
                </p>
                <ul className="space-y-2 mb-6 text-left text-xs">
                  <li className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                    <span>📴</span> Works without internet
                  </li>
                  <li className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                    <span>🔑</span> PIN-protected
                  </li>
                  <li className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                    <span>⬆️</span> Upgrade to cloud later
                  </li>
                </ul>
                <button 
                  className="w-full px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-lg transition-colors text-sm group-hover:shadow-lg"
                  type="button"
                >
                  Create →
                </button>
              </div>
            </button>

          </div>

          {/* Divider */}
          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300 dark:border-gray-600"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white dark:bg-gray-900 text-gray-500">
                Already have an account?
              </span>
            </div>
          </div>

          {/* Sign In Link */}
          <button
            onClick={() => navigate('/auth?mode=signin')}
            disabled={isLoading}
            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-gray-900 dark:text-white font-medium disabled:opacity-50"
          >
            Sign In
          </button>
        </div>
      )}

      {/* === EMAIL SIGNUP SCREEN === */}
      {step === 'emailSignup' && (
        <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-xl shadow-xl p-8">
          <button
            onClick={() => setStep('options')}
            className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 mb-6"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </button>
          
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Create Account
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6 text-sm">
            Sign up with email & password
          </p>
          
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
            Email signup with full features is available at:{' '}
            <button 
              onClick={() => navigate('/auth?mode=signup')}
              className="text-blue-600 hover:underline font-medium"
              type="button"
            >
              Sign up here →
            </button>
          </p>

          <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
            <p className="text-xs text-blue-900 dark:text-blue-100">
              You'll have full cloud backup, device sync, and premium features.
            </p>
          </div>
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
              Create Local Account
            </h2>
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              Fast setup. Works offline. Upgrade anytime.
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
              {/* Display Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Display Name *
                </label>
                <input
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="John Doe"
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
                  ✨ <strong>Your account starts now!</strong> Full access to all features, stored locally on this device.
                </p>
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={
                  isLoading || 
                  !displayName.trim() || 
                  (!usePassword && pin.length < 4) || 
                  (usePassword && password.length < 8)
                }
                className="w-full px-4 py-3 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition-colors"
              >
                {isLoading ? 'Creating Account...' : 'Create Account'}
              </button>

              {/* Terms */}
              <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
                By continuing, you agree to our Terms of Service and Privacy Policy
              </p>
            </form>
          )}
        </div>
      )}
    </div>
  );
};

export default GuestLoginPage;
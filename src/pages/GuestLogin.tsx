/**
 * Guest Login Page
 * Allows users to quickly create a guest account and start using the app
 * 
 * @module pages/GuestLogin
 */

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { guestAccountService } from '../services/guestAccountService';

interface GuestLoginPageProps {
  onGuestCreated?: (displayName: string) => void;
  onSignInClick?: () => void;
  onSignUpClick?: () => void;
  className?: string;
}

type PageStep = 'options' | 'guestSignup' | 'loading';

export const GuestLoginPage: React.FC<GuestLoginPageProps> = ({
  onGuestCreated,
  onSignInClick,
  onSignUpClick,
  className = '',
}) => {
  const navigate = useNavigate();
  const [step, setStep] = useState<PageStep>('options');
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleGuestSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!displayName.trim()) {
      setError('Please enter your name');
      return;
    }

    setIsLoading(true);

    try {
      // Create guest account
      guestAccountService.createGuestAccount(displayName.trim(), email.trim() || undefined);

      // Call callback if provided
      onGuestCreated?.(displayName.trim());

      // Navigate to dashboard
      setTimeout(() => {
        navigate('/dashboard');
      }, 500);
    } catch (err) {
      setError('Failed to create guest account. Please try again.');
      console.error('Guest signup error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignIn = () => {
    if (onSignInClick) {
      onSignInClick();
    } else {
      navigate('/login');
    }
  };

  const handleSignUp = () => {
    if (onSignUpClick) {
      onSignUpClick();
    } else {
      navigate('/auth/signup');
    }
  };

  return (
    <div
      className={`min-h-screen bg-gradient-to-br from-blue-50 via-white to-cyan-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800 flex items-center justify-center p-4 ${className}`}
    >
      {step === 'options' && (
        <div className="max-w-2xl w-full">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-full mb-4">
              <span className="text-3xl">🌟</span>
            </div>
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-3">
              Welcome to LifeSync
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-400">
              Choose how you'd like to get started
            </p>
          </div>

          {/* Options Grid */}
          <div className="grid md:grid-cols-2 gap-6 mb-8">
            {/* Guest Option */}
            <button
              onClick={() => setStep('guestSignup')}
              className="group relative overflow-hidden bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 border-2 border-transparent hover:border-blue-500"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-transparent dark:from-blue-900/20 opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="relative z-10">
                <div className="text-5xl mb-4">👤</div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                  Try as Guest
                </h2>
                <p className="text-gray-600 dark:text-gray-400 mb-6 text-left">
                  No signup required. Get 7 days of full access, then renew anytime.
                </p>

                {/* Features */}
                <ul className="space-y-2 mb-6 text-left text-sm">
                  <li className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                    <span>✅</span> Full dashboard access
                  </li>
                  <li className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                    <span>✅</span> All learning modules
                  </li>
                  <li className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                    <span>✅</span> Local data storage (7 days)
                  </li>
                  <li className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                    <span>✅</span> Renew forever (free)
                  </li>
                </ul>

                <button className="w-full px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg transition-colors group-hover:shadow-lg">
                  Continue as Guest →
                </button>
              </div>
            </button>

            {/* Full Account Option */}
            <div className="space-y-4">
              <button
                onClick={handleSignIn}
                className="group relative overflow-hidden bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 border-2 border-transparent hover:border-green-500 w-full"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-green-50 to-transparent dark:from-green-900/20 opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="relative z-10">
                  <div className="text-5xl mb-4">🔑</div>
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                    Sign In
                  </h2>
                  <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">
                    Already have an account?
                  </p>
                  <button className="w-full px-6 py-2 bg-green-600 hover:bg-green-700 text-white font-bold rounded-lg transition-colors">
                    Sign In →
                  </button>
                </div>
              </button>

              <button
                onClick={handleSignUp}
                className="group relative overflow-hidden bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 border-2 border-transparent hover:border-purple-500 w-full"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-purple-50 to-transparent dark:from-purple-900/20 opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="relative z-10">
                  <div className="text-5xl mb-4">✍️</div>
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                    Create Account
                  </h2>
                  <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">
                    Full features from day one
                  </p>
                  <button className="w-full px-6 py-2 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-lg transition-colors">
                    Sign Up →
                  </button>
                </div>
              </button>
            </div>
          </div>

          {/* Why Guest? */}
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-6 mb-8">
            <h3 className="font-bold text-blue-900 dark:text-blue-100 mb-3">
              💡 Why Choose Guest?
            </h3>
            <ul className="space-y-2 text-sm text-blue-800 dark:text-blue-200">
              <li>
                <strong>No commitment:</strong> Try everything for free with no signup
              </li>
              <li>
                <strong>Privacy first:</strong> Your data stays on your device
              </li>
              <li>
                <strong>Flexible:</strong> Renew locally forever or upgrade anytime
              </li>
              <li>
                <strong>Zero friction:</strong> Just enter your name and go
              </li>
            </ul>
          </div>

          {/* Footer */}
          <p className="text-center text-sm text-gray-600 dark:text-gray-400">
            All options require location sharing consent as per our terms.
          </p>
        </div>
      )}

      {(step === 'guestSignup' || step === 'loading') && (
        <div className="max-w-md w-full">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8">
            {/* Header */}
            <div className="text-center mb-8">
              <button
                onClick={() => setStep('options')}
                className="mb-4 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white text-sm font-medium"
              >
                ← Back
              </button>
              <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-600 rounded-full mb-3">
                <span className="text-2xl">👤</span>
              </div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                Create Guest Account
              </h1>
            </div>

            {isLoading ? (
              <div className="text-center py-12">
                <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-600 rounded-full mb-4 animate-spin">
                  <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full" />
                </div>
                <p className="text-gray-600 dark:text-gray-400">Setting up your guest account...</p>
              </div>
            ) : (
              <form onSubmit={handleGuestSignUp} className="space-y-4">
                {/* Display Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
                    Your Name
                  </label>
                  <input
                    type="text"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    placeholder="Enter your name"
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    disabled={isLoading}
                    autoFocus
                  />
                </div>

                {/* Email (Optional) */}
                <div>
                  <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
                    Email <span className="text-gray-500 dark:text-gray-400">(optional)</span>
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="your@email.com"
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    disabled={isLoading}
                  />
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    We'll use this to help you migrate to a full account later
                  </p>
                </div>

                {/* Error Message */}
                {error && (
                  <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                    <p className="text-sm text-red-800 dark:text-red-200">{error}</p>
                  </div>
                )}

                {/* Info Box */}
                <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                  <p className="text-sm text-blue-900 dark:text-blue-100">
                    ✨ <strong>Your 7-day free trial starts now!</strong> Full access to all features,
                    data stored locally. Renew anytime.
                  </p>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isLoading || !displayName.trim()}
                  className="w-full px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-bold rounded-lg transition-colors duration-200"
                >
                  {isLoading ? '🔄 Creating...' : '✨ Create Guest Account'}
                </button>

                {/* Terms */}
                <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
                  By continuing, you agree to our Terms of Service and Privacy Policy
                </p>
              </form>
            )}
          </div>

          {/* Features List */}
          <div className="mt-8 grid grid-cols-2 gap-4">
            {[
              { icon: '✅', title: 'Full Features', desc: 'All dashboard items' },
              { icon: '💾', title: 'Local Storage', desc: '7-day validity' },
              { icon: '🔄', title: 'Renew Free', desc: 'Forever renewable' },
              { icon: '⬆️', title: 'Upgrade Easy', desc: 'Any time, data transfers' },
            ].map((feature, idx) => (
              <div
                key={idx}
                className="bg-white dark:bg-gray-800 rounded-lg p-4 text-center shadow-sm"
              >
                <div className="text-2xl mb-2">{feature.icon}</div>
                <h4 className="font-semibold text-sm text-gray-900 dark:text-white">
                  {feature.title}
                </h4>
                <p className="text-xs text-gray-600 dark:text-gray-400">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default GuestLoginPage;

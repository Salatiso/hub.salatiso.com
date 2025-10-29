import { useState, useCallback } from 'react';
import { AlertCircle, CheckCircle, Lock, Key, Shield, ArrowRight } from 'lucide-react';
import { validatePassword, hashPin } from '../security/pinEncryption';
import { profileService } from '../services/ProfileService';
import type { ILocalProfile } from '../db/profileTypes';

/**
 * PasswordAuthComponent - Phase 2 Day 4
 * 
 * Optional password authentication setup and verification.
 * Features:
 * - Password strength assessment
 * - Optional password backup for PIN
 * - Password reset flow
 * - Fallback recovery
 */
interface PasswordAuthComponentProps {
  profile: ILocalProfile;
  onComplete: (profile: ILocalProfile) => void;
  onSkip?: () => void;
}

const PasswordAuthComponent: React.FC<PasswordAuthComponentProps> = ({
  profile,
  onComplete,
  onSkip,
}) => {
  // State
  const [step, setStep] = useState<'choice' | 'setup' | 'confirm' | 'complete'>('choice');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  // Password validation
  const passwordValidation = validatePassword(password);
  const passwordStrength = password.length === 0
    ? 'none'
    : passwordValidation.errors.length === 0
    ? 'strong'
    : password.length >= 6
    ? 'medium'
    : 'weak';

  const strengthColor =
    passwordStrength === 'strong'
      ? 'bg-green-500'
      : passwordStrength === 'medium'
      ? 'bg-yellow-500'
      : 'bg-red-500';

  // Password setup
  const handleSetupPassword = useCallback(async () => {
    const newErrors: string[] = [];

    // Validate
    if (!password) {
      newErrors.push('Password is required');
    } else if (passwordValidation.errors.length > 0) {
      newErrors.push(...passwordValidation.errors);
    }

    if (password !== confirmPassword) {
      newErrors.push('Passwords do not match');
    }

    if (newErrors.length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      setLoading(true);
      setErrors([]);

      // Hash password using same PBKDF2 method
      const { hash, salt } = hashPin(password);

      // Update profile with password hash
      const updatedProfile = {
        ...profile,
        account: {
          ...profile.account,
          hasPasswordAuth: true,
          passwordHash: hash,
          passwordSalt: salt,
        },
      };

      // Save to database
      await profileService.updateProfile(updatedProfile);

      setStep('complete');
      setTimeout(() => {
        onComplete(updatedProfile);
      }, 1500);
    } catch (err) {
      setErrors([
        `Setup failed: ${err instanceof Error ? err.message : 'Unknown error'}`,
      ]);
    } finally {
      setLoading(false);
    }
  }, [password, confirmPassword, passwordValidation, profile, onComplete]);

  // Skip password setup
  const handleSkip = useCallback(async () => {
    try {
      setLoading(true);
      // Update profile to mark password setup as skipped
      const updatedProfile = {
        ...profile,
        account: {
          ...profile.account,
          hasPasswordAuth: false,
        },
      };
      await profileService.updateProfile(updatedProfile);
      onSkip?.();
    } catch (err) {
      setErrors([`Skip failed: ${err instanceof Error ? err.message : 'Unknown error'}`]);
    } finally {
      setLoading(false);
    }
  }, [profile, onSkip]);

  // Choice step - Set up password or skip
  if (step === 'choice') {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
          <div className="flex justify-center mb-4">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <Key className="w-6 h-6 text-blue-600" />
            </div>
          </div>

          <h2 className="text-2xl font-bold text-gray-900 mb-2">Add Password</h2>
          <p className="text-gray-600 mb-4">
            You can optionally add a password as a backup recovery method.
          </p>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <h3 className="font-semibold text-blue-900 mb-2 flex items-center gap-2">
              <Shield className="w-4 h-4" />
              Why add a password?
            </h3>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>✓ Backup if you forget your PIN</li>
              <li>✓ Additional security layer</li>
              <li>✓ Recovery option</li>
              <li>✓ Completely optional - PIN alone works fine</li>
            </ul>
          </div>

          <div className="space-y-3">
            <button
              onClick={() => setStep('setup')}
              disabled={loading}
              className="w-full py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-semibold disabled:opacity-50"
            >
              Set Up Password
            </button>

            <button
              onClick={handleSkip}
              disabled={loading}
              className="w-full py-3 border-2 border-gray-300 text-gray-700 rounded-lg hover:border-gray-400 transition font-semibold disabled:opacity-50"
            >
              Skip for Now
            </button>

            <p className="text-xs text-center text-gray-500 mt-4">
              You can add a password later from your settings
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Setup step - Create password
  if (step === 'setup') {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6 max-h-96 overflow-y-auto">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Create Password</h2>
          <p className="text-gray-600 mb-4">
            Create a strong password for account recovery
          </p>

          {/* Error messages */}
          {errors.length > 0 && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              {errors.map((error, idx) => (
                <div key={idx} className="text-sm text-red-700 flex gap-2">
                  <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                  <span>{error}</span>
                </div>
              ))}
            </div>
          )}

          {/* Password input */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setErrors([]);
                }}
                placeholder="At least 8 characters"
                className="w-full px-4 py-3 pr-10 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 transition"
              />
              <button
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
              >
                {showPassword ? '👁️' : '👁️‍🗨️'}
              </button>
            </div>
          </div>

          {/* Password strength indicator */}
          {password && (
            <div className="mb-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">Strength</span>
                <span
                  className={`text-sm font-semibold ${
                    passwordStrength === 'strong'
                      ? 'text-green-600'
                      : passwordStrength === 'medium'
                      ? 'text-yellow-600'
                      : 'text-red-600'
                  }`}
                >
                  {passwordStrength.charAt(0).toUpperCase() + passwordStrength.slice(1)}
                </span>
              </div>
              <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className={`h-full ${strengthColor} transition-all`}
                  style={{
                    width: `${
                      passwordStrength === 'strong'
                        ? 100
                        : passwordStrength === 'medium'
                        ? 66
                        : 33
                    }%`,
                  }}
                />
              </div>
              {passwordValidation.errors.length > 0 && (
                <ul className="mt-2 text-xs text-gray-600 space-y-1">
                  {passwordValidation.errors.map((err, idx) => (
                    <li key={idx}>• {err}</li>
                  ))}
                </ul>
              )}
            </div>
          )}

          {/* Confirm password */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Confirm Password
            </label>
            <div className="relative">
              <input
                type={showConfirm ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => {
                  setConfirmPassword(e.target.value);
                  setErrors([]);
                }}
                placeholder="Re-enter password"
                className="w-full px-4 py-3 pr-10 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 transition"
              />
              <button
                onClick={() => setShowConfirm(!showConfirm)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
              >
                {showConfirm ? '👁️' : '👁️‍🗨️'}
              </button>
            </div>
          </div>

          {/* Match indicator */}
          {password && confirmPassword && (
            <div className="mb-4 p-3 bg-gray-50 rounded-lg flex gap-2">
              {password === confirmPassword ? (
                <>
                  <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                  <span className="text-sm text-green-700">Passwords match</span>
                </>
              ) : (
                <>
                  <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
                  <span className="text-sm text-red-700">Passwords do not match</span>
                </>
              )}
            </div>
          )}

          {/* Action buttons */}
          <div className="space-y-2">
            <button
              onClick={handleSetupPassword}
              disabled={
                !password ||
                password !== confirmPassword ||
                passwordValidation.errors.length > 0 ||
                loading
              }
              className={`w-full py-3 rounded-lg font-semibold transition flex items-center justify-center gap-2 ${
                !password ||
                password !== confirmPassword ||
                passwordValidation.errors.length > 0 ||
                loading
                  ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                  : 'bg-blue-600 text-white hover:bg-blue-700'
              }`}
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Setting up...
                </>
              ) : (
                <>
                  Set Up Password
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>

            <button
              onClick={() => setStep('choice')}
              className="w-full py-3 text-gray-700 hover:bg-gray-100 rounded-lg transition font-semibold"
              disabled={loading}
            >
              Back
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Complete step - Success
  if (step === 'complete') {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6 text-center">
          <div className="mb-4 flex justify-center">
            <div className="relative w-16 h-16">
              <div className="absolute inset-0 bg-green-100 rounded-full animate-pulse"></div>
              <CheckCircle className="w-16 h-16 text-green-600 relative z-10" />
            </div>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Password Set!</h2>
          <p className="text-gray-600">
            Your password has been securely stored. You can now use PIN or password to login.
          </p>
        </div>
      </div>
    );
  }

  return null;
};

export default PasswordAuthComponent;
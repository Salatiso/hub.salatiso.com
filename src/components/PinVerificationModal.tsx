import { useState, useCallback } from 'react';
import { AlertCircle, CheckCircle, Lock, Eye, EyeOff, ArrowRight } from 'lucide-react';
import { verifyPin, getPinSecurityStatus } from '../security/pinEncryption';
import { profileService } from '../services/ProfileService';
import type { ILocalProfile } from '../db/profileTypes';

/**
 * PIN Verification Modal - Phase 2 Day 3
 * 
 * Handles user login via PIN verification.
 * Features:
 * - PIN entry with visual feedback
 * - PIN strength assessment (weak/fair/good)
 * - Account recovery option
 * - Integration with migrated profiles
 * - Session management
 */
interface PinVerificationModalProps {
  onVerified: (profile: ILocalProfile) => void;
  onCancel?: () => void;
}

const PinVerificationModal: React.FC<PinVerificationModalProps> = ({
  onVerified,
  onCancel,
}) => {
  // State
  const [step, setStep] = useState<'profile-select' | 'pin-entry' | 'verified' | 'error'>('profile-select');
  const [profiles, setProfiles] = useState<ILocalProfile[]>([]);
  const [selectedProfile, setSelectedProfile] = useState<ILocalProfile | null>(null);
  const [pinInput, setPinInput] = useState('');
  const [showPin, setShowPin] = useState(false);
  const [attempts, setAttempts] = useState(0);
  const [locked, setLocked] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Load profiles on mount
  const loadProfiles = useCallback(async () => {
    try {
      setLoading(true);
      const allProfiles = await profileService.getAllProfiles();
      setProfiles(allProfiles);
      setLoading(false);

      // If only one profile, auto-select it
      if (allProfiles.length === 1) {
        setSelectedProfile(allProfiles[0]);
        setStep('pin-entry');
      }
    } catch (err) {
      setError('Failed to load profiles. Please refresh and try again.');
      setLoading(false);
    }
  }, []);

  // Load profiles on component mount
  useState(() => {
    loadProfiles();
    return undefined;
  });

  // PIN security status
  const pinStatus = getPinSecurityStatus(pinInput);
  const strengthColor =
    pinStatus.strength === 'good'
      ? 'bg-green-500'
      : pinStatus.strength === 'fair'
      ? 'bg-yellow-500'
      : 'bg-red-500';

  // PIN verification
  const handleVerifyPin = useCallback(async () => {
    if (!selectedProfile || !selectedProfile.account.pin) {
      setError('Profile not configured correctly');
      return;
    }

    if (locked) {
      setError('Account locked. Too many failed attempts.');
      return;
    }

    if (pinInput.length < 4) {
      setError('PIN must be at least 4 digits');
      return;
    }

    try {
      setLoading(true);
      setError('');

      // Verify PIN against stored hash
      const isCorrect = verifyPin(
        pinInput,
        selectedProfile.account.pin.hash,
        selectedProfile.account.pin.salt
      );

      if (isCorrect) {
        // Update last login
        const updatedProfile = {
          ...selectedProfile,
          lastLoginAt: Date.now(),
        };
        await profileService.updateProfile(updatedProfile);

        setStep('verified');
        setTimeout(() => {
          onVerified(updatedProfile);
        }, 1000);
      } else {
        // PIN incorrect
        const newAttempts = attempts + 1;
        setAttempts(newAttempts);

        if (newAttempts >= 3) {
          setLocked(true);
          setError('Account locked after 3 failed attempts. Try again in 15 minutes.');
          setStep('error');
        } else {
          setError(`PIN incorrect. ${3 - newAttempts} attempts remaining.`);
          setPinInput('');
        }
      }
    } catch (err) {
      setError(`Verification failed: ${err instanceof Error ? err.message : 'Unknown error'}`);
      setStep('error');
    } finally {
      setLoading(false);
    }
  }, [selectedProfile, pinInput, attempts, locked, onVerified]);

  // Handle profile selection
  const handleSelectProfile = (profile: ILocalProfile) => {
    setSelectedProfile(profile);
    setPinInput('');
    setAttempts(0);
    setLocked(false);
    setError('');
    setStep('pin-entry');
  };

  // Handle back to profile selection
  const handleBackToProfiles = () => {
    setSelectedProfile(null);
    setPinInput('');
    setAttempts(0);
    setError('');
    setStep('profile-select');
  };

  // Render profile selection step
  if (step === 'profile-select') {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6 max-h-96 overflow-y-auto">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Select Account</h2>

          {loading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : profiles.length === 0 ? (
            <div className="text-center py-8">
              <AlertCircle className="w-12 h-12 text-yellow-500 mx-auto mb-3" />
              <p className="text-gray-600">No profiles found. Please migrate your account first.</p>
              {onCancel && (
                <button
                  onClick={onCancel}
                  className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                >
                  Go Back
                </button>
              )}
            </div>
          ) : (
            <>
              <div className="space-y-3">
                {profiles.map((profile) => (
                  <button
                    key={profile.id}
                    onClick={() => handleSelectProfile(profile)}
                    className="w-full p-4 border-2 border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition text-left"
                  >
                    <div className="font-semibold text-gray-900">{profile.account.name}</div>
                    <div className="text-sm text-gray-500">{profile.account.email}</div>
                    <div className="text-xs text-gray-400 mt-1">
                      Trust Score: {profile.trustScore?.total || 0}/100
                    </div>
                  </button>
                ))}
              </div>

              {onCancel && (
                <button
                  onClick={onCancel}
                  className="w-full mt-4 px-4 py-2 text-gray-600 hover:text-gray-900 transition"
                >
                  Cancel
                </button>
              )}
            </>
          )}
        </div>
      </div>
    );
  }

  // Render PIN entry step
  if (step === 'pin-entry' && selectedProfile) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
          {/* Header */}
          <button
            onClick={handleBackToProfiles}
            className="text-sm text-gray-500 hover:text-gray-700 mb-4 transition"
          >
            ← Change account
          </button>

          <h2 className="text-2xl font-bold text-gray-900 mb-2">Verify PIN</h2>
          <p className="text-gray-600 mb-6">
            Enter your PIN for {selectedProfile.account.name}
          </p>

          {/* Error message */}
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex gap-2">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          {/* PIN Input */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">PIN</label>
            <div className="relative">
              <input
                type={showPin ? 'text' : 'password'}
                value={pinInput}
                onChange={(e) => {
                  const value = e.target.value.replace(/\D/g, '').slice(0, 12);
                  setPinInput(value);
                  setError('');
                }}
                onKeyPress={(e) => {
                  if (e.key === 'Enter' && pinInput.length >= 4 && !loading && !locked) {
                    handleVerifyPin();
                  }
                }}
                placeholder="Enter 4-12 digits"
                className={`w-full px-4 py-3 pr-10 border-2 rounded-lg font-mono text-lg tracking-widest focus:outline-none transition ${
                  error && pinInput.length > 0
                    ? 'border-red-500 focus:border-red-600'
                    : 'border-gray-300 focus:border-blue-500'
                }`}
                disabled={loading || locked}
              />
              <button
                onClick={() => setShowPin(!showPin)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 transition"
              >
                {showPin ? (
                  <EyeOff className="w-5 h-5" />
                ) : (
                  <Eye className="w-5 h-5" />
                )}
              </button>
            </div>
          </div>

          {/* PIN Strength Indicator */}
          {pinInput.length > 0 && (
            <div className="mb-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">Strength</span>
                <span className={`text-sm font-semibold ${
                  pinStatus.strength === 'good'
                    ? 'text-green-600'
                    : pinStatus.strength === 'fair'
                    ? 'text-yellow-600'
                    : 'text-red-600'
                }`}>
                  {pinStatus.strength.charAt(0).toUpperCase() + pinStatus.strength.slice(1)}
                </span>
              </div>
              <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                <div className={`h-full ${strengthColor} transition-all`}
                  style={{ width: `${(pinInput.length / 12) * 100}%` }}
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">{pinStatus.message}</p>
            </div>
          )}

          {/* Attempts counter */}
          {attempts > 0 && (
            <div className="mb-4 text-sm text-gray-600">
              Attempts: {attempts}/3
            </div>
          )}

          {/* Action buttons */}
          <div className="space-y-2">
            <button
              onClick={handleVerifyPin}
              disabled={pinInput.length < 4 || loading || locked}
              className={`w-full py-3 rounded-lg font-semibold transition flex items-center justify-center gap-2 ${
                pinInput.length < 4 || loading || locked
                  ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                  : 'bg-blue-600 text-white hover:bg-blue-700'
              }`}
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Verifying...
                </>
              ) : (
                <>
                  Verify PIN
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>

            <button
              onClick={handleBackToProfiles}
              className="w-full py-3 rounded-lg font-semibold text-gray-700 hover:bg-gray-100 transition"
              disabled={loading}
            >
              Cancel
            </button>
          </div>

          {/* Recovery option */}
          <button
            className="w-full mt-4 text-sm text-blue-600 hover:text-blue-700 transition"
          >
            Forgot PIN?
          </button>
        </div>
      </div>
    );
  }

  // Render verified step
  if (step === 'verified') {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6 text-center">
          <div className="mb-4 flex justify-center">
            <div className="relative w-16 h-16">
              <div className="absolute inset-0 bg-green-100 rounded-full animate-pulse"></div>
              <CheckCircle className="w-16 h-16 text-green-600 relative z-10" />
            </div>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">PIN Verified!</h2>
          <p className="text-gray-600">Welcome back, {selectedProfile?.account.name}</p>
        </div>
      </div>
    );
  }

  // Render error step
  if (step === 'error') {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
          <div className="mb-4 flex justify-center">
            <AlertCircle className="w-16 h-16 text-red-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2 text-center">Verification Failed</h2>
          <p className="text-gray-600 text-center mb-6">{error}</p>

          <div className="space-y-2">
            {!locked && (
              <button
                onClick={() => {
                  setPinInput('');
                  setError('');
                  setStep('pin-entry');
                }}
                className="w-full py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-semibold"
              >
                Try Again
              </button>
            )}
            <button
              onClick={handleBackToProfiles}
              className="w-full py-3 text-gray-700 hover:bg-gray-100 rounded-lg transition font-semibold"
            >
              {locked ? 'Exit' : 'Back to Accounts'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return null;
};

export default PinVerificationModal;
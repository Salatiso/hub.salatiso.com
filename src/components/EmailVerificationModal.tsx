import React, { useState, useEffect, useMemo } from 'react';
import {
  X,
  AlertCircle,
  CheckCircle2,
  Mail,
  Clock,
  Loader,
  RotateCw,
} from 'lucide-react';
import { useLocalProfile } from '../hooks/useLocalProfile';
import './EmailVerificationModal.css';

/**
 * Email Verification Modal Component
 *
 * Purpose: Verify user's email address with OTP code
 * Features:
 * - Generate OTP (one-time password)
 * - Display OTP code
 * - OTP entry form with auto-focus
 * - Resend OTP after timeout
 * - Time remaining display
 * - Verification status tracking
 *
 * Integration:
 * - useLocalProfile hook for profile data
 * - Updates profile with email verification status
 *
 * State Machine: 'entry' → 'send-otp' → 'verify' → 'loading' → 'success'/'error'
 */

interface EmailVerificationFormData {
  email: string;
  otp: string;
  verified: boolean;
}

interface EmailVerificationModalProps {
  profile?: any;
  isTest?: boolean;
  onComplete?: (data: EmailVerificationFormData) => void;
  onSkip?: () => void;
}

const OTP_LENGTH = 6;
const OTP_TIMEOUT = 300; // 5 minutes

/**
 * Generate OTP code
 */
function generateOTP(length: number = 6): string {
  let code = '';
  for (let i = 0; i < length; i++) {
    code += Math.floor(Math.random() * 10);
  }
  return code;
}

/**
 * Format time remaining
 */
function formatTimeRemaining(seconds: number): string {
  const minutes = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${minutes}:${secs.toString().padStart(2, '0')}`;
}

export default function EmailVerificationModal({
  profile,
  isTest = false,
  onComplete,
  onSkip,
}: EmailVerificationModalProps) {
  const { updateProfile } = useLocalProfile();

  // Form state
  const [formData, setFormData] = useState<EmailVerificationFormData>({
    email: profile?.email || '',
    otp: '',
    verified: profile?.emailVerified || false,
  });

  const [displayedOTP, setDisplayedOTP] = useState('');
  const [otpEnteredCorrectly, setOtpEnteredCorrectly] = useState(false);
  const [step, setStep] = useState<'entry' | 'send-otp' | 'verify' | 'loading' | 'success' | 'error'>(
    'entry'
  );
  const [timeRemaining, setTimeRemaining] = useState(OTP_TIMEOUT);
  const [canResend, setCanResend] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [showOTP, setShowOTP] = useState(false);

  /**
   * Timer effect for OTP expiration
   */
  useEffect(() => {
    if (!otpSent || step !== 'verify' || timeRemaining <= 0) return;

    const timer = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          setCanResend(true);
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [otpSent, step, timeRemaining]);

  /**
   * Handle send OTP
   */
  const handleSendOTP = async () => {
    if (!formData.email) {
      setErrorMessage('Email address is required');
      return;
    }

    try {
      // Generate OTP
      const otp = generateOTP(OTP_LENGTH);
      setDisplayedOTP(otp);
      setOtpEnteredCorrectly(false);
      setFormData({ ...formData, otp });
      setOtpSent(true);
      setTimeRemaining(OTP_TIMEOUT);
      setCanResend(false);
      setStep('verify');
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : 'Failed to send OTP'
      );
    }
  };

  /**
   * Handle OTP input change
   */
  const handleOTPChange = (value: string) => {
    // Only allow digits
    const cleaned = value.replace(/\D/g, '').substring(0, OTP_LENGTH);
    setFormData({ ...formData, otp: cleaned });

    // Check if matches generated OTP
    if (cleaned.length === OTP_LENGTH) {
      if (cleaned === displayedOTP) {
        setOtpEnteredCorrectly(true);
      } else {
        setOtpEnteredCorrectly(false);
      }
    }
  };

  /**
   * Handle resend OTP
   */
  const handleResendOTP = () => {
    handleSendOTP();
  };

  /**
   * Verify OTP
   */
  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!otpEnteredCorrectly) {
      setErrorMessage('Invalid OTP. Please check and try again.');
      return;
    }

    try {
      setStep('loading');

      // Update profile via hook
      if (profile) {
        await updateProfile({
          ...profile,
          email: formData.email.trim(),
          emailVerified: true,
          emailVerificationDate: new Date().toISOString(),
        });
      }

      // Simulate API delay
      await new Promise((resolve) => setTimeout(resolve, 1000));

      setFormData({ ...formData, verified: true });
      setStep('success');

      if (onComplete) {
        onComplete(formData);
      }
    } catch (error) {
      setStep('error');
      setErrorMessage(
        error instanceof Error
          ? error.message
          : 'Failed to verify email'
      );
    }
  };

  /**
   * Check if OTP is valid
   */
  const isOTPValid = useMemo(() => {
    return otpEnteredCorrectly;
  }, [otpEnteredCorrectly]);

  return (
    <div className="email-verification-modal-overlay">
      <div className="email-verification-modal">
        {/* Header */}
        <div className="email-verification-modal-header">
          <h2>📧 Email Verification</h2>
          <button
            className="modal-close-btn"
            onClick={onSkip}
            title="Skip"
          >
            <X size={24} />
          </button>
        </div>

        {/* Step: Entry */}
        {step === 'entry' && (
          <div className="modal-step-content">
            <p className="step-intro">
              Verify your email address to confirm you have access to it. We'll
              send a verification code to your inbox.
            </p>

            <div className="benefits-list">
              <div className="benefit-item">
                <Mail size={20} />
                <span>Secure account recovery</span>
              </div>
              <div className="benefit-item">
                <CheckCircle2 size={20} />
                <span>Email confirmation notifications</span>
              </div>
              <div className="benefit-item">
                <AlertCircle size={20} />
                <span>Security alerts</span>
              </div>
            </div>

            <div className="email-display">
              <p className="email-label">Email Address:</p>
              <p className="email-value">{formData.email || 'Not provided'}</p>
            </div>

            <div className="step-actions">
              <button className="btn-primary" onClick={handleSendOTP}>
                Send Verification Code
              </button>
              <button className="btn-secondary" onClick={onSkip}>
                Skip for Now
              </button>
            </div>
          </div>
        )}

        {/* Step: Verify */}
        {step === 'verify' && otpSent && (
          <div className="modal-step-content">
            <h3>Enter Verification Code</h3>
            <p className="form-intro">
              We've sent a 6-digit code to <strong>{formData.email}</strong>
            </p>

            {/* OTP Display for Testing */}
            {isTest && (
              <div className="test-otp-display">
                <button
                  className="toggle-otp-btn"
                  onClick={() => setShowOTP(!showOTP)}
                >
                  {showOTP ? 'Hide' : 'Show'} test code
                </button>
                {showOTP && (
                  <div className="otp-code-display">
                    <span className="code">{displayedOTP}</span>
                  </div>
                )}
              </div>
            )}

            <form onSubmit={handleVerifyOTP} className="verification-form">
              {/* OTP Input */}
              <div className="form-group">
                <label htmlFor="otp">Verification Code</label>
                <input
                  id="otp"
                  type="text"
                  inputMode="numeric"
                  placeholder="000000"
                  maxLength={OTP_LENGTH}
                  value={formData.otp}
                  onChange={(e) => handleOTPChange(e.target.value)}
                  className={`form-input otp-input ${
                    formData.otp.length === OTP_LENGTH
                      ? otpEnteredCorrectly
                        ? 'valid'
                        : 'invalid'
                      : ''
                  }`}
                />
                {formData.otp.length === OTP_LENGTH && !otpEnteredCorrectly && (
                  <span className="error-message">
                    <AlertCircle size={14} />
                    Incorrect code. Please try again.
                  </span>
                )}
                {otpEnteredCorrectly && (
                  <span className="success-message">
                    <CheckCircle2 size={14} />
                    Code verified!
                  </span>
                )}
              </div>

              {/* Timer and Resend */}
              <div className="timer-section">
                <div className="timer-display">
                  <Clock size={18} />
                  <span>
                    {timeRemaining > 0
                      ? `Code expires in ${formatTimeRemaining(timeRemaining)}`
                      : 'Code expired'}
                  </span>
                </div>
                {canResend && (
                  <button
                    type="button"
                    className="btn-resend"
                    onClick={handleResendOTP}
                  >
                    <RotateCw size={14} /> Resend Code
                  </button>
                )}
              </div>

              {/* Actions */}
              <div className="form-actions">
                <button
                  type="submit"
                  className="btn-primary"
                  disabled={!isOTPValid}
                >
                  Verify Email
                </button>
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => {
                    setStep('entry');
                    setOtpSent(false);
                  }}
                >
                  Back
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Step: Loading */}
        {step === 'loading' && (
          <div className="modal-step-content center">
            <Loader size={40} className="loading-spinner" />
            <p>Verifying your email...</p>
          </div>
        )}

        {/* Step: Success */}
        {step === 'success' && (
          <div className="modal-step-content center">
            <CheckCircle2 size={48} className="success-icon" />
            <h3>Email Verified</h3>
            <p>Your email address has been successfully verified.</p>
            <button className="btn-primary" onClick={onSkip}>
              Continue
            </button>
          </div>
        )}

        {/* Step: Error */}
        {step === 'error' && (
          <div className="modal-step-content center">
            <AlertCircle size={48} className="error-icon" />
            <h3>Verification Failed</h3>
            <p>{errorMessage}</p>
            <button
              className="btn-primary"
              onClick={() => setStep('verify')}
            >
              Try Again
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

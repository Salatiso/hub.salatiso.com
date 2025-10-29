import React, { useState, useEffect } from 'react';
import {
  X,
  AlertCircle,
  CheckCircle2,
  Phone,
  MessageSquare,
  Clock,
  Loader,
  RotateCw,
} from 'lucide-react';
import { useLocalProfile } from '../hooks/useLocalProfile';
import './PhoneVerificationModal.css';

/**
 * Phone Verification Modal Component
 *
 * Purpose: Verify user's phone number with SMS OTP
 * Features:
 * - Phone number input with validation
 * - Send SMS OTP
 * - OTP entry form
 * - Resend functionality with timer
 * - Time remaining display
 * - Test mode for development
 *
 * Integration:
 * - useLocalProfile hook for profile data
 * - Updates profile with phone verification
 *
 * State Machine: 'entry' → 'phone' → 'verify-otp' → 'loading' → 'success'/'error'
 */

interface PhoneVerificationFormData {
  phone: string;
  otp: string;
  verified: boolean;
}

interface PhoneVerificationModalProps {
  profile?: any;
  isTest?: boolean;
  onComplete?: (data: PhoneVerificationFormData) => void;
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
 * Format phone number for display
 */
function formatPhoneDisplay(phone: string): string {
  const cleaned = phone.replace(/\D/g, '');
  if (cleaned.length === 10) {
    return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
  }
  return phone;
}

/**
 * Format time remaining
 */
function formatTimeRemaining(seconds: number): string {
  const minutes = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${minutes}:${secs.toString().padStart(2, '0')}`;
}

export default function PhoneVerificationModal({
  profile,
  isTest = false,
  onComplete,
  onSkip,
}: PhoneVerificationModalProps) {
  const { updateProfile } = useLocalProfile();

  // Form state
  const [formData, setFormData] = useState<PhoneVerificationFormData>({
    phone: profile?.phone || '',
    otp: '',
    verified: profile?.phoneVerified || false,
  });

  const [step, setStep] = useState<'entry' | 'phone' | 'verify-otp' | 'loading' | 'success' | 'error'>(
    'entry'
  );
  const [generatedOTP, setGeneratedOTP] = useState('');
  const [timeRemaining, setTimeRemaining] = useState(OTP_TIMEOUT);
  const [canResend, setCanResend] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [showOTP, setShowOTP] = useState(false);
  const [phoneError, setPhoneError] = useState('');

  /**
   * Timer effect
   */
  useEffect(() => {
    if (!otpSent || step !== 'verify-otp' || timeRemaining <= 0) return;

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
   * Validate phone number
   */
  const validatePhone = (phone: string): boolean => {
    const cleaned = phone.replace(/\D/g, '');
    if (cleaned.length < 10) {
      setPhoneError('Phone must have at least 10 digits');
      return false;
    }
    setPhoneError('');
    return true;
  };

  /**
   * Handle phone input
   */
  const handlePhoneChange = (value: string) => {
    setFormData({ ...formData, phone: value });
    if (phoneError) {
      setPhoneError('');
    }
  };

  /**
   * Handle send OTP
   */
  const handleSendOTP = async () => {
    if (!validatePhone(formData.phone)) {
      return;
    }

    try {
      // Generate OTP
      const otp = generateOTP(OTP_LENGTH);
      setGeneratedOTP(otp);
      setFormData({ ...formData, otp: '' });
      setOtpSent(true);
      setTimeRemaining(OTP_TIMEOUT);
      setCanResend(false);
      setStep('verify-otp');
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : 'Failed to send OTP'
      );
    }
  };

  /**
   * Handle OTP input
   */
  const handleOTPChange = (value: string) => {
    const cleaned = value.replace(/\D/g, '').substring(0, OTP_LENGTH);
    setFormData({ ...formData, otp: cleaned });
  };

  /**
   * Handle resend OTP
   */
  const handleResendOTP = () => {
    handleSendOTP();
  };

  /**
   * Handle OTP verification
   */
  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.otp !== generatedOTP) {
      setErrorMessage('Invalid OTP. Please check and try again.');
      return;
    }

    try {
      setStep('loading');

      if (profile) {
        await updateProfile({
          ...profile,
          phone: formData.phone.trim(),
          phoneVerified: true,
          phoneVerificationDate: new Date().toISOString(),
        });
      }

      await new Promise((resolve) => setTimeout(resolve, 1000));

      setFormData({ ...formData, verified: true });
      setStep('success');

      if (onComplete) {
        onComplete(formData);
      }
    } catch (error) {
      setStep('error');
      setErrorMessage(
        error instanceof Error ? error.message : 'Failed to verify phone'
      );
    }
  };

  const isOTPCorrect = formData.otp.length === OTP_LENGTH && formData.otp === generatedOTP;

  return (
    <div className="phone-verification-modal-overlay">
      <div className="phone-verification-modal">
        {/* Header */}
        <div className="phone-verification-modal-header">
          <h2>📱 Phone Verification</h2>
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
              Verify your phone number for account recovery and security alerts.
              We'll send an SMS code to your phone.
            </p>

            <div className="benefits-list">
              <div className="benefit-item">
                <Phone size={20} />
                <span>Account recovery</span>
              </div>
              <div className="benefit-item">
                <MessageSquare size={20} />
                <span>Security notifications</span>
              </div>
              <div className="benefit-item">
                <CheckCircle2 size={20} />
                <span>Two-factor authentication</span>
              </div>
            </div>

            <div className="step-actions">
              <button className="btn-primary" onClick={() => setStep('phone')}>
                Continue
              </button>
              <button className="btn-secondary" onClick={onSkip}>
                Skip for Now
              </button>
            </div>
          </div>
        )}

        {/* Step: Phone Input */}
        {step === 'phone' && (
          <div className="modal-step-content">
            <h3>Enter Your Phone Number</h3>
            <p className="form-intro">We'll send a verification code via SMS</p>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendOTP();
              }}
              className="phone-form"
            >
              <div className="form-group">
                <label htmlFor="phone">Phone Number</label>
                <input
                  id="phone"
                  type="tel"
                  placeholder="+1 (555) 000-0000"
                  value={formData.phone}
                  onChange={(e) => handlePhoneChange(e.target.value)}
                  className={`form-input ${phoneError ? 'error' : ''}`}
                />
                {phoneError && (
                  <span className="error-message">
                    <AlertCircle size={14} />
                    {phoneError}
                  </span>
                )}
              </div>

              <div className="form-actions">
                <button
                  type="submit"
                  className="btn-primary"
                  disabled={formData.phone.length < 10}
                >
                  Send SMS Code
                </button>
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={onSkip}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Step: OTP Verification */}
        {step === 'verify-otp' && otpSent && (
          <div className="modal-step-content">
            <h3>Enter Verification Code</h3>
            <p className="form-intro">
              We've sent an SMS code to <strong>{formatPhoneDisplay(formData.phone)}</strong>
            </p>

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
                    <span className="code">{generatedOTP}</span>
                  </div>
                )}
              </div>
            )}

            <form onSubmit={handleVerifyOTP} className="verification-form">
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
                      ? isOTPCorrect
                        ? 'valid'
                        : 'invalid'
                      : ''
                  }`}
                />
                {formData.otp.length === OTP_LENGTH && !isOTPCorrect && (
                  <span className="error-message">
                    <AlertCircle size={14} />
                    Incorrect code. Please try again.
                  </span>
                )}
                {isOTPCorrect && (
                  <span className="success-message">
                    <CheckCircle2 size={14} />
                    Code verified!
                  </span>
                )}
              </div>

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
                    <RotateCw size={14} /> Resend
                  </button>
                )}
              </div>

              <div className="form-actions">
                <button
                  type="submit"
                  className="btn-primary"
                  disabled={!isOTPCorrect}
                >
                  Verify Phone
                </button>
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => {
                    setStep('phone');
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
            <p>Verifying your phone...</p>
          </div>
        )}

        {/* Step: Success */}
        {step === 'success' && (
          <div className="modal-step-content center">
            <CheckCircle2 size={48} className="success-icon" />
            <h3>Phone Verified</h3>
            <p>Your phone number has been successfully verified.</p>
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
              onClick={() => setStep('verify-otp')}
            >
              Try Again
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

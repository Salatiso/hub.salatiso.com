import React, { useState, useMemo } from 'react';
import {
  X,
  AlertCircle,
  CheckCircle2,
  User,
  Mail,
  Phone,
  Loader,
} from 'lucide-react';
import { useLocalProfile } from '../hooks/useLocalProfile';
import './ContactInfoModal.css';

/**
 * Contact Information Modal Component
 *
 * Purpose: Collect and validate user contact information during profile setup
 * Features:
 * - Form validation (required fields, format validation)
 * - Real-time validation feedback
 * - Error state management
 * - Success confirmation
 * - Profile persistence via ProfileService
 *
 * Integration:
 * - useLocalProfile hook for profile data
 * - profileService.updateProfile() for persistence
 * - Emits onComplete callback with form data
 *
 * State Machine: 'entry' → 'form' → 'loading' → 'success'/'error'
 */

interface ContactInfoFormData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
}

interface ValidationErrors {
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
}

interface ContactInfoModalProps {
  profile?: any;
  isTest?: boolean;
  onComplete?: (data: ContactInfoFormData) => void;
  onSkip?: () => void;
}

const FORM_CONFIG = {
  firstName: {
    label: 'First Name',
    placeholder: 'Enter your first name',
    minLength: 2,
    maxLength: 50,
  },
  lastName: {
    label: 'Last Name',
    placeholder: 'Enter your last name',
    minLength: 2,
    maxLength: 50,
  },
  email: {
    label: 'Email Address',
    placeholder: 'your.email@example.com',
    pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  },
  phone: {
    label: 'Phone Number',
    placeholder: '+1 (555) 000-0000',
    pattern: /^[\d\s\-\+\(\)]+$/,
    minLength: 10,
  },
};

/**
 * Validate form data
 */
function validateFormData(data: ContactInfoFormData): ValidationErrors {
  const errors: ValidationErrors = {};

  // Validate First Name
  if (!data.firstName.trim()) {
    errors.firstName = 'First name is required';
  } else if (data.firstName.length < FORM_CONFIG.firstName.minLength) {
    errors.firstName = `First name must be at least ${FORM_CONFIG.firstName.minLength} characters`;
  } else if (data.firstName.length > FORM_CONFIG.firstName.maxLength) {
    errors.firstName = `First name must not exceed ${FORM_CONFIG.firstName.maxLength} characters`;
  }

  // Validate Last Name
  if (!data.lastName.trim()) {
    errors.lastName = 'Last name is required';
  } else if (data.lastName.length < FORM_CONFIG.lastName.minLength) {
    errors.lastName = `Last name must be at least ${FORM_CONFIG.lastName.minLength} characters`;
  } else if (data.lastName.length > FORM_CONFIG.lastName.maxLength) {
    errors.lastName = `Last name must not exceed ${FORM_CONFIG.lastName.maxLength} characters`;
  }

  // Validate Email
  if (!data.email.trim()) {
    errors.email = 'Email address is required';
  } else if (!FORM_CONFIG.email.pattern.test(data.email)) {
    errors.email = 'Please enter a valid email address';
  }

  // Validate Phone
  if (!data.phone.trim()) {
    errors.phone = 'Phone number is required';
  } else if (!FORM_CONFIG.phone.pattern.test(data.phone)) {
    errors.phone = 'Phone number must contain only digits, spaces, and formatting characters';
  } else if (data.phone.replace(/\D/g, '').length < 10) {
    errors.phone = 'Phone number must contain at least 10 digits';
  }

  return errors;
}

/**
 * Format phone number for display
 */
function formatPhoneNumber(phone: string): string {
  const cleaned = phone.replace(/\D/g, '');
  if (cleaned.length !== 10 && cleaned.length !== 11) return phone;

  if (cleaned.length === 11) {
    return `+${cleaned.slice(0, 1)} (${cleaned.slice(1, 4)}) ${cleaned.slice(4, 7)}-${cleaned.slice(7)}`;
  }

  return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
}

export default function ContactInfoModal({
  profile,
  isTest = false,
  onComplete,
  onSkip,
}: ContactInfoModalProps) {
  const { updateProfile } = useLocalProfile();

  // Form state
  const [formData, setFormData] = useState<ContactInfoFormData>({
    firstName: profile?.firstName || '',
    lastName: profile?.lastName || '',
    email: profile?.email || '',
    phone: profile?.phone || '',
  });

  const [validationErrors, setValidationErrors] = useState<ValidationErrors>({});
  const [step, setStep] = useState<'entry' | 'form' | 'loading' | 'success' | 'error'>(
    'entry'
  );
  const [errorMessage, setErrorMessage] = useState('');

  /**
   * Handle input change with real-time validation
   */
  const handleInputChange = (field: keyof ContactInfoFormData, value: string) => {
    const updatedData = { ...formData, [field]: value };
    setFormData(updatedData);

    // Clear error for this field when user starts typing
    if (validationErrors[field]) {
      setValidationErrors((prev) => {
        const updated = { ...prev };
        delete updated[field];
        return updated;
      });
    }

    // Real-time validation
    const fieldErrors = validateFormData(updatedData);
    if (fieldErrors[field]) {
      setValidationErrors((prev) => ({
        ...prev,
        [field]: fieldErrors[field],
      }));
    }
  };

  /**
   * Start form submission
   */
  const handleStartForm = () => {
    setStep('form');
  };

  /**
   * Submit form
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate
    const errors = validateFormData(formData);
    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      return;
    }

    try {
      setStep('loading');

      // Update profile via hook
      if (profile) {
        await updateProfile({
          ...profile,
          firstName: formData.firstName.trim(),
          lastName: formData.lastName.trim(),
          email: formData.email.trim(),
          phone: formData.phone.trim(),
        });
      }

      // Simulate API delay for better UX
      await new Promise((resolve) => setTimeout(resolve, 1000));

      setStep('success');

      // Call callback
      if (onComplete) {
        onComplete(formData);
      }
    } catch (error) {
      setStep('error');
      setErrorMessage(
        error instanceof Error
          ? error.message
          : 'Failed to save contact information'
      );
    }
  };

  /**
   * Check if form is valid
   */
  const isFormValid = useMemo(() => {
    const errors = validateFormData(formData);
    return Object.keys(errors).length === 0;
  }, [formData]);

  /**
   * Count completed fields
   */
  const completedFields = useMemo(() => {
    let count = 0;
    if (formData.firstName.trim()) count++;
    if (formData.lastName.trim()) count++;
    if (formData.email.trim()) count++;
    if (formData.phone.trim()) count++;
    return count;
  }, [formData]);

  return (
    <div className="contact-info-modal-overlay">
      <div className="contact-info-modal">
        {/* Header */}
        <div className="contact-modal-header">
          <h2>📋 Contact Information</h2>
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
              Help us keep your contact information up to date. We'll use this
              to verify your identity and send important updates.
            </p>

            <div className="benefits-list">
              <div className="benefit-item">
                <User size={20} />
                <span>Verify your identity</span>
              </div>
              <div className="benefit-item">
                <Mail size={20} />
                <span>Send security updates</span>
              </div>
              <div className="benefit-item">
                <Phone size={20} />
                <span>Emergency contact</span>
              </div>
            </div>

            <div className="step-actions">
              <button className="btn-primary" onClick={handleStartForm}>
                Continue
              </button>
              <button className="btn-secondary" onClick={onSkip}>
                Skip for Now
              </button>
            </div>
          </div>
        )}

        {/* Step: Form */}
        {step === 'form' && (
          <div className="modal-step-content">
            <form onSubmit={handleSubmit} className="contact-form">
              {/* First Name */}
              <div className="form-group">
                <label htmlFor="firstName">
                  {FORM_CONFIG.firstName.label}
                  <span className="required">*</span>
                </label>
                <input
                  id="firstName"
                  type="text"
                  placeholder={FORM_CONFIG.firstName.placeholder}
                  value={formData.firstName}
                  onChange={(e) => handleInputChange('firstName', e.target.value)}
                  className={`form-input ${validationErrors.firstName ? 'error' : ''}`}
                  maxLength={FORM_CONFIG.firstName.maxLength}
                />
                {validationErrors.firstName && (
                  <span className="error-message">
                    <AlertCircle size={14} />
                    {validationErrors.firstName}
                  </span>
                )}
              </div>

              {/* Last Name */}
              <div className="form-group">
                <label htmlFor="lastName">
                  {FORM_CONFIG.lastName.label}
                  <span className="required">*</span>
                </label>
                <input
                  id="lastName"
                  type="text"
                  placeholder={FORM_CONFIG.lastName.placeholder}
                  value={formData.lastName}
                  onChange={(e) => handleInputChange('lastName', e.target.value)}
                  className={`form-input ${validationErrors.lastName ? 'error' : ''}`}
                  maxLength={FORM_CONFIG.lastName.maxLength}
                />
                {validationErrors.lastName && (
                  <span className="error-message">
                    <AlertCircle size={14} />
                    {validationErrors.lastName}
                  </span>
                )}
              </div>

              {/* Email */}
              <div className="form-group">
                <label htmlFor="email">
                  {FORM_CONFIG.email.label}
                  <span className="required">*</span>
                </label>
                <input
                  id="email"
                  type="email"
                  placeholder={FORM_CONFIG.email.placeholder}
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  className={`form-input ${validationErrors.email ? 'error' : ''}`}
                />
                {validationErrors.email && (
                  <span className="error-message">
                    <AlertCircle size={14} />
                    {validationErrors.email}
                  </span>
                )}
              </div>

              {/* Phone */}
              <div className="form-group">
                <label htmlFor="phone">
                  {FORM_CONFIG.phone.label}
                  <span className="required">*</span>
                </label>
                <input
                  id="phone"
                  type="tel"
                  placeholder={FORM_CONFIG.phone.placeholder}
                  value={formData.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  className={`form-input ${validationErrors.phone ? 'error' : ''}`}
                />
                {validationErrors.phone && (
                  <span className="error-message">
                    <AlertCircle size={14} />
                    {validationErrors.phone}
                  </span>
                )}
              </div>

              {/* Progress indicator */}
              <div className="form-progress">
                <span className="progress-label">
                  {completedFields} of 4 fields completed
                </span>
                <div className="progress-bar">
                  <div
                    className="progress-fill"
                    style={{ width: `${(completedFields / 4) * 100}%` }}
                  />
                </div>
              </div>

              {/* Actions */}
              <div className="form-actions">
                <button
                  type="submit"
                  className="btn-primary"
                  disabled={!isFormValid}
                >
                  Save Contact Info
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

        {/* Step: Loading */}
        {step === 'loading' && (
          <div className="modal-step-content center">
            <Loader size={40} className="loading-spinner" />
            <p>Saving your contact information...</p>
          </div>
        )}

        {/* Step: Success */}
        {step === 'success' && (
          <div className="modal-step-content center">
            <CheckCircle2 size={48} className="success-icon" />
            <h3>Contact Information Saved</h3>
            <p>Your contact information has been securely stored and verified.</p>
            <button className="btn-primary" onClick={onSkip}>
              Continue
            </button>
          </div>
        )}

        {/* Step: Error */}
        {step === 'error' && (
          <div className="modal-step-content center">
            <AlertCircle size={48} className="error-icon" />
            <h3>Failed to Save</h3>
            <p>{errorMessage}</p>
            <button
              className="btn-primary"
              onClick={() => setStep('form')}
            >
              Try Again
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

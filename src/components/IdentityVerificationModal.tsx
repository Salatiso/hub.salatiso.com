import React, { useState, useMemo } from 'react';
import {
  X,
  AlertCircle,
  CheckCircle2,
  FileCheck,
  Calendar,
  Hash,
  Loader,
  Upload,
} from 'lucide-react';
import { useLocalProfile } from '../hooks/useLocalProfile';
import './IdentityVerificationModal.css';

/**
 * Identity Verification Modal Component
 *
 * Purpose: Collect and validate government-issued ID information
 * Features:
 * - Document type selection
 * - ID number validation
 * - Expiration date validation
 * - Document upload placeholder
 * - Real-time validation feedback
 * - Error state management
 *
 * Integration:
 * - useLocalProfile hook for profile data
 * - Emits onComplete callback with form data
 *
 * State Machine: 'entry' → 'form' → 'upload' → 'loading' → 'success'/'error'
 */

interface IdentityVerificationFormData {
  documentType: string;
  idNumber: string;
  expirationDate: string;
  documentFile?: File;
}

interface ValidationErrors {
  documentType?: string;
  idNumber?: string;
  expirationDate?: string;
  documentFile?: string;
}

interface IdentityVerificationModalProps {
  profile?: any;
  isTest?: boolean;
  onComplete?: (data: IdentityVerificationFormData) => void;
  onSkip?: () => void;
}

const DOCUMENT_TYPES = [
  { value: 'passport', label: 'Passport' },
  { value: 'drivers-license', label: "Driver's License" },
  { value: 'national-id', label: 'National ID' },
  { value: 'state-id', label: 'State ID' },
  { value: 'military-id', label: 'Military ID' },
];

/**
 * Validate form data
 */
function validateFormData(data: IdentityVerificationFormData): ValidationErrors {
  const errors: ValidationErrors = {};

  // Validate document type
  if (!data.documentType) {
    errors.documentType = 'Please select a document type';
  }

  // Validate ID number
  if (!data.idNumber.trim()) {
    errors.idNumber = 'ID number is required';
  } else if (data.idNumber.trim().length < 5) {
    errors.idNumber = 'ID number must be at least 5 characters';
  } else if (data.idNumber.trim().length > 50) {
    errors.idNumber = 'ID number must not exceed 50 characters';
  }

  // Validate expiration date
  if (!data.expirationDate) {
    errors.expirationDate = 'Expiration date is required';
  } else {
    const expDate = new Date(data.expirationDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (expDate < today) {
      errors.expirationDate = 'Document has expired';
    }
  }

  return errors;
}

/**
 * Format date for display
 */
function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

export default function IdentityVerificationModal({
  profile,
  isTest = false,
  onComplete,
  onSkip,
}: IdentityVerificationModalProps) {
  const { updateProfile } = useLocalProfile();

  // Form state
  const [formData, setFormData] = useState<IdentityVerificationFormData>({
    documentType: profile?.documentType || '',
    idNumber: profile?.idNumber || '',
    expirationDate: profile?.expirationDate || '',
    documentFile: undefined,
  });

  const [validationErrors, setValidationErrors] = useState<ValidationErrors>({});
  const [step, setStep] = useState<'entry' | 'form' | 'upload' | 'loading' | 'success' | 'error'>(
    'entry'
  );
  const [errorMessage, setErrorMessage] = useState('');
  const [documentFileName, setDocumentFileName] = useState('');

  /**
   * Handle document type change
   */
  const handleDocumentTypeChange = (value: string) => {
    setFormData({ ...formData, documentType: value });
    if (validationErrors.documentType) {
      setValidationErrors((prev) => {
        const updated = { ...prev };
        delete updated.documentType;
        return updated;
      });
    }
  };

  /**
   * Handle ID number change
   */
  const handleIdNumberChange = (value: string) => {
    setFormData({ ...formData, idNumber: value });
    if (validationErrors.idNumber) {
      setValidationErrors((prev) => {
        const updated = { ...prev };
        delete updated.idNumber;
        return updated;
      });
    }
  };

  /**
   * Handle expiration date change
   */
  const handleExpirationDateChange = (value: string) => {
    setFormData({ ...formData, expirationDate: value });
    if (validationErrors.expirationDate) {
      setValidationErrors((prev) => {
        const updated = { ...prev };
        delete updated.expirationDate;
        return updated;
      });
    }
  };

  /**
   * Handle file upload
   */
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setFormData({ ...formData, documentFile: file });
      setDocumentFileName(file.name);
      if (validationErrors.documentFile) {
        setValidationErrors((prev) => {
          const updated = { ...prev };
          delete updated.documentFile;
          return updated;
        });
      }
    }
  };

  /**
   * Start form
   */
  const handleStartForm = () => {
    setStep('form');
  };

  /**
   * Move to upload step
   */
  const handleMoveToUpload = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate form
    const errors = validateFormData(formData);
    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      return;
    }

    setStep('upload');
  };

  /**
   * Submit form
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setStep('loading');

      // Update profile via hook
      if (profile) {
        await updateProfile({
          ...profile,
          documentType: formData.documentType,
          idNumber: formData.idNumber.trim(),
          expirationDate: formData.expirationDate,
          identityVerified: true,
        });
      }

      // Simulate API delay for document processing
      await new Promise((resolve) => setTimeout(resolve, 1500));

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
          : 'Failed to save identity information'
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
   * Get selected document label
   */
  const selectedDocumentLabel = useMemo(() => {
    return DOCUMENT_TYPES.find((dt) => dt.value === formData.documentType)?.label || '';
  }, [formData.documentType]);

  return (
    <div className="identity-modal-overlay">
      <div className="identity-modal">
        {/* Header */}
        <div className="identity-modal-header">
          <h2>🪪 Identity Verification</h2>
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
              Verify your identity with a government-issued document. This helps us
              confirm your identity and prevent fraud.
            </p>

            <div className="benefits-list">
              <div className="benefit-item">
                <FileCheck size={20} />
                <span>Official document verification</span>
              </div>
              <div className="benefit-item">
                <AlertCircle size={20} />
                <span>Enhanced account security</span>
              </div>
              <div className="benefit-item">
                <CheckCircle2 size={20} />
                <span>Fraud prevention</span>
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
            <form onSubmit={handleMoveToUpload} className="identity-form">
              {/* Document Type */}
              <div className="form-group">
                <label htmlFor="documentType">
                  Document Type
                  <span className="required">*</span>
                </label>
                <select
                  id="documentType"
                  value={formData.documentType}
                  onChange={(e) => handleDocumentTypeChange(e.target.value)}
                  className={`form-select ${validationErrors.documentType ? 'error' : ''}`}
                >
                  <option value="">Select a document type</option>
                  {DOCUMENT_TYPES.map((type) => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
                {validationErrors.documentType && (
                  <span className="error-message">
                    <AlertCircle size={14} />
                    {validationErrors.documentType}
                  </span>
                )}
              </div>

              {/* ID Number */}
              <div className="form-group">
                <label htmlFor="idNumber">
                  <Hash size={16} /> Document Number
                  <span className="required">*</span>
                </label>
                <input
                  id="idNumber"
                  type="text"
                  placeholder="ABC1234567"
                  value={formData.idNumber}
                  onChange={(e) => handleIdNumberChange(e.target.value)}
                  className={`form-input ${validationErrors.idNumber ? 'error' : ''}`}
                  maxLength={50}
                />
                {validationErrors.idNumber && (
                  <span className="error-message">
                    <AlertCircle size={14} />
                    {validationErrors.idNumber}
                  </span>
                )}
              </div>

              {/* Expiration Date */}
              <div className="form-group">
                <label htmlFor="expirationDate">
                  <Calendar size={16} /> Expiration Date
                  <span className="required">*</span>
                </label>
                <input
                  id="expirationDate"
                  type="date"
                  value={formData.expirationDate}
                  onChange={(e) => handleExpirationDateChange(e.target.value)}
                  className={`form-input ${validationErrors.expirationDate ? 'error' : ''}`}
                />
                {validationErrors.expirationDate && (
                  <span className="error-message">
                    <AlertCircle size={14} />
                    {validationErrors.expirationDate}
                  </span>
                )}
                {formData.expirationDate && !validationErrors.expirationDate && (
                  <span className="success-hint">
                    <CheckCircle2 size={14} />
                    Expires: {formatDate(formData.expirationDate)}
                  </span>
                )}
              </div>

              {/* Actions */}
              <div className="form-actions">
                <button
                  type="submit"
                  className="btn-primary"
                  disabled={!isFormValid}
                >
                  Next: Upload Document
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

        {/* Step: Upload */}
        {step === 'upload' && (
          <div className="modal-step-content">
            <h3>Upload Document</h3>
            <p className="upload-intro">
              {selectedDocumentLabel}: {formData.idNumber}
            </p>

            <form onSubmit={handleSubmit} className="upload-form">
              <div className="file-upload-area">
                <input
                  id="documentFile"
                  type="file"
                  accept="image/*,.pdf"
                  onChange={handleFileUpload}
                  className="file-input"
                  aria-label="Upload document"
                />
                <label htmlFor="documentFile" className="file-upload-label">
                  <div className="upload-icon">
                    <Upload size={32} />
                  </div>
                  <div className="upload-text">
                    {documentFileName ? (
                      <>
                        <p className="file-name">{documentFileName}</p>
                        <p className="file-hint">Click to change</p>
                      </>
                    ) : (
                      <>
                        <p className="upload-hint">Drag and drop or click to upload</p>
                        <p className="upload-formats">PNG, JPG, or PDF • Max 10MB</p>
                      </>
                    )}
                  </div>
                </label>
              </div>

              <div className="info-box">
                <AlertCircle size={20} />
                <div>
                  <p className="info-title">Privacy & Security</p>
                  <p className="info-text">
                    Your document is encrypted and never shared with third parties.
                    We only use it for identity verification.
                  </p>
                </div>
              </div>

              {/* Actions */}
              <div className="form-actions">
                <button
                  type="submit"
                  className="btn-primary"
                >
                  {documentFileName ? 'Verify with Document' : 'Skip Upload & Verify'}
                </button>
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => setStep('form')}
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
            <p>Verifying your identity...</p>
          </div>
        )}

        {/* Step: Success */}
        {step === 'success' && (
          <div className="modal-step-content center">
            <CheckCircle2 size={48} className="success-icon" />
            <h3>Identity Verified</h3>
            <p>Your identity information has been securely verified and stored.</p>
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

import React, { useState, useMemo } from 'react';
import {
  X,
  AlertCircle,
  CheckCircle2,
  Heart,
  FileText,
  Plus,
  Loader,
  Trash2,
} from 'lucide-react';
import { useLocalProfile } from '../hooks/useLocalProfile';
import './ServicesRegistrationModal.css';

/**
 * Services Registration Modal Component
 *
 * Purpose: Collect emergency contact and health/insurance service information
 * Features:
 * - Emergency contact preferences
 * - Health provider registration
 * - Insurance details
 * - Service list management (add/remove)
 * - Real-time validation
 * - Error state management
 *
 * Integration:
 * - useLocalProfile hook for profile data
 * - Emits onComplete callback with form data
 *
 * State Machine: 'entry' → 'form' → 'loading' → 'success'/'error'
 */

interface EmergencyContact {
  name: string;
  phone: string;
  relationship: string;
}

interface HealthService {
  name: string;
  type: string;
  accountNumber?: string;
}

interface ServicesRegistrationFormData {
  emergencyContact: EmergencyContact;
  healthProvider?: HealthService;
  insurance?: HealthService;
}

interface ValidationErrors {
  contactName?: string;
  contactPhone?: string;
  contactRelationship?: string;
  healthProviderName?: string;
  healthProviderType?: string;
  insuranceName?: string;
  insuranceType?: string;
}

interface ServicesRegistrationModalProps {
  profile?: any;
  isTest?: boolean;
  onComplete?: (data: ServicesRegistrationFormData) => void;
  onSkip?: () => void;
}

const SERVICE_TYPES = [
  { value: 'hospital', label: 'Hospital' },
  { value: 'clinic', label: 'Clinic' },
  { value: 'doctor', label: 'Doctor/Physician' },
  { value: 'pharmacy', label: 'Pharmacy' },
  { value: 'mental-health', label: 'Mental Health' },
  { value: 'dental', label: 'Dental' },
];

const RELATIONSHIPS = [
  { value: 'spouse', label: 'Spouse' },
  { value: 'parent', label: 'Parent' },
  { value: 'child', label: 'Child' },
  { value: 'sibling', label: 'Sibling' },
  { value: 'friend', label: 'Friend' },
  { value: 'other', label: 'Other' },
];

/**
 * Validate emergency contact
 */
function validateEmergencyContact(contact: EmergencyContact): ValidationErrors {
  const errors: ValidationErrors = {};

  if (!contact.name.trim()) {
    errors.contactName = 'Name is required';
  } else if (contact.name.length < 2) {
    errors.contactName = 'Name must be at least 2 characters';
  }

  if (!contact.phone.trim()) {
    errors.contactPhone = 'Phone number is required';
  } else if (contact.phone.replace(/\D/g, '').length < 10) {
    errors.contactPhone = 'Phone number must have at least 10 digits';
  }

  if (!contact.relationship) {
    errors.contactRelationship = 'Relationship is required';
  }

  return errors;
}

/**
 * Validate health service
 */
function validateHealthService(service: HealthService | undefined): ValidationErrors {
  const errors: ValidationErrors = {};

  if (service) {
    if (!service.name.trim()) {
      errors.healthProviderName = 'Provider name is required';
    }

    if (!service.type) {
      errors.healthProviderType = 'Provider type is required';
    }
  }

  return errors;
}

/**
 * Validate insurance
 */
function validateInsurance(insurance: HealthService | undefined): ValidationErrors {
  const errors: ValidationErrors = {};

  if (insurance) {
    if (!insurance.name.trim()) {
      errors.insuranceName = 'Insurance provider name is required';
    }

    if (!insurance.type) {
      errors.insuranceType = 'Insurance type is required';
    }
  }

  return errors;
}

export default function ServicesRegistrationModal({
  profile,
  isTest = false,
  onComplete,
  onSkip,
}: ServicesRegistrationModalProps) {
  const { updateProfile } = useLocalProfile();

  // Form state
  const [formData, setFormData] = useState<ServicesRegistrationFormData>({
    emergencyContact: {
      name: profile?.emergencyContactName || '',
      phone: profile?.emergencyContactPhone || '',
      relationship: profile?.emergencyContactRelationship || '',
    },
    healthProvider: profile?.healthProvider || undefined,
    insurance: profile?.insurance || undefined,
  });

  const [validationErrors, setValidationErrors] = useState<ValidationErrors>({});
  const [step, setStep] = useState<'entry' | 'emergency' | 'services' | 'loading' | 'success' | 'error'>(
    'entry'
  );
  const [errorMessage, setErrorMessage] = useState('');
  const [healthProviderAdded, setHealthProviderAdded] = useState(!!profile?.healthProvider);
  const [insuranceAdded, setInsuranceAdded] = useState(!!profile?.insurance);

  /**
   * Start emergency contact form
   */
  const handleStartEmergency = () => {
    setStep('emergency');
  };

  /**
   * Handle emergency contact change
   */
  const handleEmergencyContactChange = (field: keyof EmergencyContact, value: string) => {
    setFormData((prev) => ({
      ...prev,
      emergencyContact: {
        ...prev.emergencyContact,
        [field]: value,
      },
    }));

    // Clear error for this field
    const errorKey = `contact${field.charAt(0).toUpperCase() + field.slice(1)}`;
    if (validationErrors[errorKey as keyof ValidationErrors]) {
      setValidationErrors((prev) => {
        const updated = { ...prev };
        delete updated[errorKey as keyof ValidationErrors];
        return updated;
      });
    }
  };

  /**
   * Move to services step
   */
  const handleMoveToServices = async (e: React.FormEvent) => {
    e.preventDefault();

    const errors = validateEmergencyContact(formData.emergencyContact);
    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      return;
    }

    setStep('services');
  };

  /**
   * Add/update health provider
   */
  const handleAddHealthProvider = (e: React.FormEvent) => {
    e.preventDefault();

    const formElement = e.currentTarget as HTMLFormElement;
    const name = (formElement.elements.namedItem('healthProviderName') as HTMLInputElement)?.value || '';
    const type = (formElement.elements.namedItem('healthProviderType') as HTMLSelectElement)?.value || '';

    if (!name || !type) {
      setValidationErrors({
        healthProviderName: !name ? 'Name is required' : undefined,
        healthProviderType: !type ? 'Type is required' : undefined,
      });
      return;
    }

    setFormData((prev) => ({
      ...prev,
      healthProvider: { name, type },
    }));

    setHealthProviderAdded(true);
    setValidationErrors({});
    (e.currentTarget as HTMLFormElement).reset();
  };

  /**
   * Add/update insurance
   */
  const handleAddInsurance = (e: React.FormEvent) => {
    e.preventDefault();

    const formElement = e.currentTarget as HTMLFormElement;
    const name = (formElement.elements.namedItem('insuranceName') as HTMLInputElement)?.value || '';
    const type = (formElement.elements.namedItem('insuranceType') as HTMLSelectElement)?.value || '';

    if (!name || !type) {
      setValidationErrors({
        insuranceName: !name ? 'Name is required' : undefined,
        insuranceType: !type ? 'Type is required' : undefined,
      });
      return;
    }

    setFormData((prev) => ({
      ...prev,
      insurance: { name, type },
    }));

    setInsuranceAdded(true);
    setValidationErrors({});
    (e.currentTarget as HTMLFormElement).reset();
  };

  /**
   * Remove health provider
   */
  const handleRemoveHealthProvider = () => {
    setFormData((prev) => ({
      ...prev,
      healthProvider: undefined,
    }));
    setHealthProviderAdded(false);
  };

  /**
   * Remove insurance
   */
  const handleRemoveInsurance = () => {
    setFormData((prev) => ({
      ...prev,
      insurance: undefined,
    }));
    setInsuranceAdded(false);
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
          emergencyContactName: formData.emergencyContact.name.trim(),
          emergencyContactPhone: formData.emergencyContact.phone.trim(),
          emergencyContactRelationship: formData.emergencyContact.relationship,
          healthProvider: formData.healthProvider,
          insurance: formData.insurance,
          servicesRegistered: true,
        });
      }

      // Simulate API delay
      await new Promise((resolve) => setTimeout(resolve, 1000));

      setStep('success');

      if (onComplete) {
        onComplete(formData);
      }
    } catch (error) {
      setStep('error');
      setErrorMessage(
        error instanceof Error
          ? error.message
          : 'Failed to save services information'
      );
    }
  };

  /**
   * Check if emergency form is valid
   */
  const isEmergencyValid = useMemo(() => {
    const errors = validateEmergencyContact(formData.emergencyContact);
    return Object.keys(errors).length === 0;
  }, [formData.emergencyContact]);

  /**
   * Check if services form is valid
   */
  const isServicesValid = useMemo(() => {
    return true; // Services are optional
  }, []);

  return (
    <div className="services-modal-overlay">
      <div className="services-modal">
        {/* Header */}
        <div className="services-modal-header">
          <h2>🏥 Services Registration</h2>
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
              Register your emergency contact and health services. This helps us
              reach you in emergencies and provide better support.
            </p>

            <div className="benefits-list">
              <div className="benefit-item">
                <Heart size={20} />
                <span>Emergency contact notification</span>
              </div>
              <div className="benefit-item">
                <FileText size={20} />
                <span>Health provider coordination</span>
              </div>
              <div className="benefit-item">
                <CheckCircle2 size={20} />
                <span>Insurance management</span>
              </div>
            </div>

            <div className="step-actions">
              <button className="btn-primary" onClick={handleStartEmergency}>
                Continue
              </button>
              <button className="btn-secondary" onClick={onSkip}>
                Skip for Now
              </button>
            </div>
          </div>
        )}

        {/* Step: Emergency Contact */}
        {step === 'emergency' && (
          <div className="modal-step-content">
            <h3>Emergency Contact</h3>
            <p className="form-intro">Who should we contact in an emergency?</p>

            <form onSubmit={handleMoveToServices} className="services-form">
              {/* Name */}
              <div className="form-group">
                <label htmlFor="emergencyName">
                  Name
                  <span className="required">*</span>
                </label>
                <input
                  id="emergencyName"
                  type="text"
                  placeholder="Full name"
                  value={formData.emergencyContact.name}
                  onChange={(e) => handleEmergencyContactChange('name', e.target.value)}
                  className={`form-input ${validationErrors.contactName ? 'error' : ''}`}
                />
                {validationErrors.contactName && (
                  <span className="error-message">
                    <AlertCircle size={14} />
                    {validationErrors.contactName}
                  </span>
                )}
              </div>

              {/* Phone */}
              <div className="form-group">
                <label htmlFor="emergencyPhone">
                  Phone Number
                  <span className="required">*</span>
                </label>
                <input
                  id="emergencyPhone"
                  type="tel"
                  placeholder="+1 (555) 000-0000"
                  value={formData.emergencyContact.phone}
                  onChange={(e) => handleEmergencyContactChange('phone', e.target.value)}
                  className={`form-input ${validationErrors.contactPhone ? 'error' : ''}`}
                />
                {validationErrors.contactPhone && (
                  <span className="error-message">
                    <AlertCircle size={14} />
                    {validationErrors.contactPhone}
                  </span>
                )}
              </div>

              {/* Relationship */}
              <div className="form-group">
                <label htmlFor="relationship">
                  Relationship
                  <span className="required">*</span>
                </label>
                <select
                  id="relationship"
                  value={formData.emergencyContact.relationship}
                  onChange={(e) => handleEmergencyContactChange('relationship', e.target.value)}
                  className={`form-select ${validationErrors.contactRelationship ? 'error' : ''}`}
                >
                  <option value="">Select relationship</option>
                  {RELATIONSHIPS.map((rel) => (
                    <option key={rel.value} value={rel.value}>
                      {rel.label}
                    </option>
                  ))}
                </select>
                {validationErrors.contactRelationship && (
                  <span className="error-message">
                    <AlertCircle size={14} />
                    {validationErrors.contactRelationship}
                  </span>
                )}
              </div>

              {/* Actions */}
              <div className="form-actions">
                <button
                  type="submit"
                  className="btn-primary"
                  disabled={!isEmergencyValid}
                >
                  Next: Health Services
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

        {/* Step: Services */}
        {step === 'services' && (
          <div className="modal-step-content">
            <h3>Health Services & Insurance</h3>
            <p className="form-intro">Add your health provider and insurance information (optional)</p>

            <form onSubmit={handleSubmit} className="services-list-form">
              {/* Health Provider Section */}
              <div className="service-section">
                <h4>Health Provider</h4>
                {!healthProviderAdded ? (
                  <form onSubmit={handleAddHealthProvider} className="add-service-form">
                    <input
                      type="text"
                      name="healthProviderName"
                      placeholder="Provider name (e.g., City Hospital)"
                      className="form-input"
                    />
                    <select
                      name="healthProviderType"
                      className="form-select"
                    >
                      <option value="">Select provider type</option>
                      {SERVICE_TYPES.map((type) => (
                        <option key={type.value} value={type.value}>
                          {type.label}
                        </option>
                      ))}
                    </select>
                    <button type="submit" className="btn-add">
                      <Plus size={16} /> Add Provider
                    </button>
                  </form>
                ) : (
                  <div className="service-item">
                    <div className="service-info">
                      <p className="service-name">{formData.healthProvider?.name}</p>
                      <p className="service-type">
                        {SERVICE_TYPES.find((t) => t.value === formData.healthProvider?.type)?.label}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={handleRemoveHealthProvider}
                      className="btn-remove"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                )}
              </div>

              {/* Insurance Section */}
              <div className="service-section">
                <h4>Insurance Provider</h4>
                {!insuranceAdded ? (
                  <form onSubmit={handleAddInsurance} className="add-service-form">
                    <input
                      type="text"
                      name="insuranceName"
                      placeholder="Insurance provider name"
                      className="form-input"
                    />
                    <select
                      name="insuranceType"
                      className="form-select"
                    >
                      <option value="">Select insurance type</option>
                      <option value="health">Health Insurance</option>
                      <option value="dental">Dental Insurance</option>
                      <option value="vision">Vision Insurance</option>
                      <option value="other">Other</option>
                    </select>
                    <button type="submit" className="btn-add">
                      <Plus size={16} /> Add Insurance
                    </button>
                  </form>
                ) : (
                  <div className="service-item">
                    <div className="service-info">
                      <p className="service-name">{formData.insurance?.name}</p>
                      <p className="service-type">{formData.insurance?.type}</p>
                    </div>
                    <button
                      type="button"
                      onClick={handleRemoveInsurance}
                      className="btn-remove"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="form-actions">
                <button type="submit" className="btn-primary">
                  Save Services
                </button>
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => setStep('emergency')}
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
            <p>Saving your information...</p>
          </div>
        )}

        {/* Step: Success */}
        {step === 'success' && (
          <div className="modal-step-content center">
            <CheckCircle2 size={48} className="success-icon" />
            <h3>Services Registered</h3>
            <p>Your emergency contact and services have been saved.</p>
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
              onClick={() => setStep('services')}
            >
              Try Again
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

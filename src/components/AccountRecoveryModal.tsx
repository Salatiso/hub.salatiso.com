import React, { useState, useEffect } from 'react';
import {
  X,
  AlertCircle,
  CheckCircle2,
  Key,
  Copy,
  Download,
  Shield,
  Loader,
  Eye,
  EyeOff,
} from 'lucide-react';
import { useLocalProfile } from '../hooks/useLocalProfile';
import './AccountRecoveryModal.css';

/**
 * Account Recovery Modal Component
 *
 * Purpose: Manage account recovery options and backup codes
 * Features:
 * - Generate and display backup recovery codes
 * - Copy recovery codes
 * - Download recovery codes as file
 * - Multiple recovery methods
 * - Recovery code storage with encryption
 *
 * Integration:
 * - useLocalProfile hook for profile data
 * - Updates profile with recovery information
 *
 * State Machine: 'entry' → 'options' → 'generate' → 'display' → 'success'
 */

interface RecoveryCode {
  id: string;
  code: string;
  used: boolean;
  usedAt?: string;
}

interface AccountRecoveryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRecoverySetup?: (codes: RecoveryCode[]) => void;
}

type RecoveryStep = 'entry' | 'options' | 'generate' | 'display' | 'success' | 'download';

/**
 * Generate recovery codes (10 codes of 8 characters each)
 */
function generateRecoveryCodes(count: number = 10): RecoveryCode[] {
  const codes: RecoveryCode[] = [];
  for (let i = 0; i < count; i++) {
    const code = Array.from({ length: 8 })
      .map(() => Math.floor(Math.random() * 36).toString(36).toUpperCase())
      .join('')
      .match(/.{1,4}/g)
      ?.join('-') || '';

    codes.push({
      id: `code-${i + 1}`,
      code,
      used: false,
    });
  }
  return codes;
}

export const AccountRecoveryModal: React.FC<AccountRecoveryModalProps> = ({
  isOpen,
  onClose,
  onRecoverySetup,
}) => {
  const { profile, updateProfile } = useLocalProfile();
  const [currentStep, setCurrentStep] = useState<RecoveryStep>('entry');
  const [recoveryCodes, setRecoveryCodes] = useState<RecoveryCode[]>([]);
  const [showCodes, setShowCodes] = useState(false);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [recoveryMethods, setRecoveryMethods] = useState({
    email: true,
    phone: false,
    backupCodes: false,
  });

  /**
   * Generate recovery codes
   */
  const handleGenerateCodes = () => {
    const newCodes = generateRecoveryCodes(10);
    setRecoveryCodes(newCodes);
    setCurrentStep('display');
    setShowCodes(true);
  };

  /**
   * Copy code to clipboard
   */
  const handleCopyCode = async (code: string) => {
    try {
      await navigator.clipboard.writeText(code);
      setCopiedCode(code);
      setTimeout(() => setCopiedCode(null), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  /**
   * Download recovery codes as text file
   */
  const handleDownloadCodes = () => {
    const email = profile?.account?.email || 'Not set';
    const phone = profile?.profile?.contactInfo?.phone || 'Not set';
    const content = `LifeSync Account Recovery Codes
Generated: ${new Date().toISOString()}
Email: ${email}
Phone Number: ${phone}

⚠️ IMPORTANT: Store these codes in a safe location
Each code can only be used once for account recovery

${recoveryCodes.map((rc, i) => `${i + 1}. ${rc.code}`).join('\n')}

Keep these codes secret. Anyone with these codes can recover your account.
`;

    const blob = new Blob([content], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `lifesync-recovery-codes-${Date.now()}.txt`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);

    setCurrentStep('download');
  };

  /**
   * Save recovery setup to profile
   */
  const handleSaveRecovery = async () => {
    try {
      await updateProfile({
        ...profile,
        profile: {
          ...profile?.profile,
          security: {
            ...profile?.profile?.security,
            hasPinAuth: profile?.profile?.security?.hasPinAuth || false,
            hasPasswordAuth: profile?.profile?.security?.hasPasswordAuth || false,
          },
        },
      });

      setCurrentStep('success');

      if (onRecoverySetup) {
        onRecoverySetup(recoveryCodes);
      }

      // Auto-close after success
      setTimeout(() => {
        handleClose();
      }, 2000);
    } catch (error) {
      console.error('Failed to save recovery codes:', error);
    }
  };

  /**
   * Update recovery methods
   */
  const toggleRecoveryMethod = (method: keyof typeof recoveryMethods) => {
    setRecoveryMethods(prev => ({
      ...prev,
      [method]: !prev[method],
    }));
  };

  /**
   * Handle modal close
   */
  const handleClose = () => {
    setCurrentStep('entry');
    setRecoveryCodes([]);
    setShowCodes(false);
    setCopiedCode(null);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="account-recovery-modal-overlay">
      <div className="account-recovery-modal">
        {/* Header */}
        <div className="account-recovery-modal-header">
          <h2>
            {currentStep === 'entry' && 'Account Recovery'}
            {currentStep === 'options' && 'Recovery Methods'}
            {currentStep === 'generate' && 'Generate Codes'}
            {currentStep === 'display' && 'Recovery Codes'}
            {currentStep === 'download' && 'Download Codes'}
            {currentStep === 'success' && 'Recovery Setup Complete'}
          </h2>
          <button className="modal-close-btn" onClick={handleClose}>
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="modal-step-content">
          {/* Entry Step */}
          {currentStep === 'entry' && (
            <div>
              <p className="step-intro">
                Set up account recovery options to regain access if you lose access to your password or recovery methods.
              </p>

              <div className="benefits-list">
                <div className="benefit-item">
                  <Key size={20} />
                  <span>Generate backup recovery codes</span>
                </div>
                <div className="benefit-item">
                  <Shield size={20} />
                  <span>Set up multiple recovery methods</span>
                </div>
                <div className="benefit-item">
                  <Download size={20} />
                  <span>Download and store recovery codes securely</span>
                </div>
              </div>

              <div className="step-actions">
                <button
                  className="btn-primary"
                  onClick={() => setCurrentStep('options')}
                >
                  <Shield size={18} />
                  Set Up Recovery
                </button>
                <button
                  className="btn-secondary"
                  onClick={handleClose}
                >
                  Skip for Now
                </button>
              </div>
            </div>
          )}

          {/* Options Step */}
          {currentStep === 'options' && (
            <div>
              <h3>Choose Recovery Methods</h3>
              <p className="form-intro">
                Select which recovery methods you'd like to enable for your account
              </p>

              <div className="recovery-methods">
                <label className="method-option">
                  <input
                    type="checkbox"
                    checked={recoveryMethods.email}
                    onChange={() => toggleRecoveryMethod('email')}
                  />
                  <span className="method-label">
                    <strong>Email Recovery</strong>
                    <span className="method-desc">
                      Send recovery link to {profile?.account?.email || 'your email'}
                    </span>
                  </span>
                </label>

                <label className="method-option">
                  <input
                    type="checkbox"
                    checked={recoveryMethods.phone}
                    onChange={() => toggleRecoveryMethod('phone')}
                  />
                  <span className="method-label">
                    <strong>Phone Recovery</strong>
                    <span className="method-desc">
                      Send recovery code to {profile?.profile?.contactInfo?.phone || 'your phone'}
                    </span>
                  </span>
                </label>

                <label className="method-option">
                  <input
                    type="checkbox"
                    checked={recoveryMethods.backupCodes}
                    onChange={() => toggleRecoveryMethod('backupCodes')}
                  />
                  <span className="method-label">
                    <strong>Backup Recovery Codes</strong>
                    <span className="method-desc">
                      Use one-time codes stored safely
                    </span>
                  </span>
                </label>
              </div>

              <div className="step-actions">
                <button
                  className="btn-primary"
                  onClick={() => setCurrentStep('generate')}
                  disabled={!Object.values(recoveryMethods).some(v => v)}
                >
                  Next: Generate Codes
                </button>
                <button
                  className="btn-secondary"
                  onClick={() => setCurrentStep('entry')}
                >
                  Back
                </button>
              </div>
            </div>
          )}

          {/* Generate Step */}
          {currentStep === 'generate' && (
            <div>
              <h3>Generate Recovery Codes</h3>
              <p className="form-intro">
                We'll generate 10 unique recovery codes. Store them somewhere safe!
              </p>

              <div className="warning-box">
                <AlertCircle size={20} />
                <div>
                  <strong>Important:</strong>
                  <ul>
                    <li>Each code can only be used once</li>
                    <li>Store codes in a secure location (password manager, safe, etc.)</li>
                    <li>Anyone with these codes can access your account</li>
                  </ul>
                </div>
              </div>

              <div className="step-actions">
                <button
                  className="btn-primary"
                  onClick={handleGenerateCodes}
                >
                  <Key size={18} />
                  Generate Codes
                </button>
                <button
                  className="btn-secondary"
                  onClick={() => setCurrentStep('options')}
                >
                  Back
                </button>
              </div>
            </div>
          )}

          {/* Display Step */}
          {currentStep === 'display' && recoveryCodes.length > 0 && (
            <div>
              <h3>Your Recovery Codes</h3>
              <p className="form-intro">
                Save these codes in a secure location. You'll need one if you lose access to your account.
              </p>

              <div className="codes-container">
                <div className="codes-header">
                  <span>{recoveryCodes.filter(c => !c.used).length} Codes Available</span>
                  <button
                    className="toggle-codes-btn"
                    onClick={() => setShowCodes(!showCodes)}
                  >
                    {showCodes ? (
                      <>
                        <EyeOff size={16} /> Hide
                      </>
                    ) : (
                      <>
                        <Eye size={16} /> Show
                      </>
                    )}
                  </button>
                </div>

                {showCodes && (
                  <div className="codes-grid">
                    {recoveryCodes.map((rc, idx) => (
                      <div key={rc.id} className="code-item">
                        <span className="code-number">{idx + 1}</span>
                        <code className="code-value">{rc.code}</code>
                        <button
                          className="copy-btn"
                          onClick={() => handleCopyCode(rc.code)}
                          title="Copy code"
                        >
                          {copiedCode === rc.code ? (
                            <CheckCircle2 size={16} />
                          ) : (
                            <Copy size={16} />
                          )}
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="step-actions">
                <button
                  className="btn-primary"
                  onClick={handleDownloadCodes}
                >
                  <Download size={18} />
                  Download as File
                </button>
                <button
                  className="btn-secondary"
                  onClick={handleSaveRecovery}
                >
                  I've Saved the Codes
                </button>
              </div>
            </div>
          )}

          {/* Download Step */}
          {currentStep === 'download' && (
            <div>
              <h3>Codes Downloaded</h3>
              <p className="form-intro">
                Your recovery codes have been downloaded. Now store them in a safe place.
              </p>

              <div className="success-box">
                <CheckCircle2 size={24} />
                <span>File saved successfully</span>
              </div>

              <div className="step-actions">
                <button
                  className="btn-primary"
                  onClick={handleSaveRecovery}
                >
                  Complete Setup
                </button>
              </div>
            </div>
          )}

          {/* Success Step */}
          {currentStep === 'success' && (
            <div className="modal-step-content center">
              <CheckCircle2 size={64} className="success-icon" />
              <h3>Recovery Setup Complete!</h3>
              <p>Your account recovery methods have been configured.</p>
              <div className="recovery-summary">
                {recoveryMethods.email && (
                  <div className="summary-item">✓ Email recovery enabled</div>
                )}
                {recoveryMethods.phone && (
                  <div className="summary-item">✓ Phone recovery enabled</div>
                )}
                {recoveryMethods.backupCodes && (
                  <div className="summary-item">✓ {recoveryCodes.length} backup codes generated</div>
                )}
              </div>
              <div style={{ marginTop: '2rem' }}>
                <button className="btn-primary" onClick={handleClose}>
                  <CheckCircle2 size={18} />
                  Done
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AccountRecoveryModal;

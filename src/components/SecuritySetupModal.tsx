import React, { useState, useMemo } from 'react';
import {
  X,
  AlertCircle,
  CheckCircle2,
  Lock,
  Copy,
  RefreshCw,
  Eye,
  EyeOff,
  Loader,
  Download,
} from 'lucide-react';
import { useLocalProfile } from '../hooks/useLocalProfile';
import './SecuritySetupModal.css';

/**
 * Security Setup Modal Component
 *
 * Purpose: Configure two-factor authentication and backup codes
 * Features:
 * - 2FA toggle with on/off states
 * - Generate backup codes (10 codes)
 * - Display, copy, and download codes
 * - Recovery phrase display
 * - Security warnings and best practices
 *
 * Integration:
 * - useLocalProfile hook for profile data
 * - Stores security settings in profile
 *
 * State Machine: 'entry' → 'setup' → 'codes' → 'confirm' → 'success'/'error'
 */

interface SecuritySettings {
  twoFactorEnabled: boolean;
  backupCodes: string[];
  recoveryPhrase?: string;
}

interface SecuritySetupModalProps {
  profile?: any;
  isTest?: boolean;
  onComplete?: (data: SecuritySettings) => void;
  onSkip?: () => void;
}

/**
 * Generate random backup codes
 */
function generateBackupCodes(count: number = 10): string[] {
  const codes: string[] = [];
  for (let i = 0; i < count; i++) {
    const code = Math.random()
      .toString(36)
      .substring(2, 10)
      .toUpperCase()
      .replace(/[^A-Z0-9]/g, '');
    codes.push(`${code.substring(0, 4)}-${code.substring(4, 8)}`);
  }
  return codes;
}

/**
 * Generate recovery phrase (12 random words)
 */
function generateRecoveryPhrase(): string {
  const words = [
    'alpha', 'bravo', 'charlie', 'delta', 'echo', 'foxtrot',
    'galaxy', 'hotel', 'india', 'july', 'key', 'lima',
    'mountain', 'nova', 'ocean', 'phoenix', 'quantum', 'river',
    'silver', 'thunder', 'unity', 'victory', 'whisper', 'xray',
    'yankee', 'zenith', 'anchor', 'beacon', 'crystal', 'diamond',
  ];

  const selected: string[] = [];
  for (let i = 0; i < 12; i++) {
    selected.push(words[Math.floor(Math.random() * words.length)]);
  }
  return selected.join(' ');
}

export default function SecuritySetupModal({
  profile,
  isTest = false,
  onComplete,
  onSkip,
}: SecuritySetupModalProps) {
  const { updateProfile } = useLocalProfile();

  // Security state
  const [securitySettings, setSecuritySettings] = useState<SecuritySettings>({
    twoFactorEnabled: profile?.twoFactorEnabled || false,
    backupCodes: profile?.backupCodes || [],
    recoveryPhrase: profile?.recoveryPhrase,
  });

  const [step, setStep] = useState<'entry' | 'setup' | 'codes' | 'confirm' | 'loading' | 'success' | 'error'>(
    'entry'
  );
  const [showCodes, setShowCodes] = useState(false);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [codesAcknowledged, setCodesAcknowledged] = useState(false);

  /**
   * Handle 2FA toggle
   */
  const handleToggle2FA = (enabled: boolean) => {
    if (enabled && securitySettings.backupCodes.length === 0) {
      // Generate codes when enabling 2FA
      const codes = generateBackupCodes();
      const phrase = generateRecoveryPhrase();
      setSecuritySettings({
        ...securitySettings,
        twoFactorEnabled: true,
        backupCodes: codes,
        recoveryPhrase: phrase,
      });
    } else {
      setSecuritySettings({
        ...securitySettings,
        twoFactorEnabled: enabled,
      });
    }
  };

  /**
   * Copy code to clipboard
   */
  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  /**
   * Copy all codes
   */
  const handleCopyAllCodes = () => {
    const allCodes = securitySettings.backupCodes.join('\n');
    navigator.clipboard.writeText(allCodes);
    setCopiedCode('all');
    setTimeout(() => setCopiedCode(null), 2000);
  };

  /**
   * Download codes as text file
   */
  const handleDownloadCodes = () => {
    const content = `LifeSync Backup Codes\n${'='.repeat(50)}\n\nGenerated: ${new Date().toLocaleString()}\n\n${securitySettings.backupCodes.join('\n')}\n\n${'='.repeat(50)}\nKeep these codes safe. Each code can be used once for recovery.\n`;
    const blob = new Blob([content], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `lifesync-backup-codes-${Date.now()}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  /**
   * Move to codes step
   */
  const handleEnableSecurityFeatures = () => {
    if (securitySettings.twoFactorEnabled) {
      setStep('codes');
    } else {
      setStep('confirm');
    }
  };

  /**
   * Acknowledge codes and move to confirm
   */
  const handleAcknowledgeCodes = () => {
    if (codesAcknowledged) {
      setStep('confirm');
    }
  };

  /**
   * Submit security settings
   */
  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    try {
      setStep('loading');

      // Update profile via hook
      if (profile) {
        await updateProfile({
          ...profile,
          twoFactorEnabled: securitySettings.twoFactorEnabled,
          backupCodes: securitySettings.backupCodes,
          recoveryPhrase: securitySettings.recoveryPhrase,
          securityConfigured: true,
        });
      }

      // Simulate API delay
      await new Promise((resolve) => setTimeout(resolve, 1000));

      setStep('success');

      if (onComplete) {
        onComplete(securitySettings);
      }
    } catch (error) {
      setStep('error');
      setErrorMessage(
        error instanceof Error
          ? error.message
          : 'Failed to save security settings'
      );
    }
  };

  /**
   * Check if 2FA has codes
   */
  const has2FAWithCodes = useMemo(() => {
    return securitySettings.twoFactorEnabled && securitySettings.backupCodes.length > 0;
  }, [securitySettings]);

  return (
    <div className="security-modal-overlay">
      <div className="security-modal">
        {/* Header */}
        <div className="security-modal-header">
          <h2>🔒 Security Setup</h2>
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
              Secure your account with advanced security features. Enable
              two-factor authentication for maximum protection.
            </p>

            <div className="benefits-list">
              <div className="benefit-item">
                <Lock size={20} />
                <span>Two-factor authentication</span>
              </div>
              <div className="benefit-item">
                <Copy size={20} />
                <span>Backup recovery codes</span>
              </div>
              <div className="benefit-item">
                <CheckCircle2 size={20} />
                <span>Account recovery phrase</span>
              </div>
            </div>

            <div className="warning-box">
              <AlertCircle size={20} />
              <div>
                <p className="warning-title">Keep codes safe</p>
                <p className="warning-text">
                  Save your backup codes and recovery phrase in a secure location.
                  You'll need them if you lose access to your account.
                </p>
              </div>
            </div>

            <div className="step-actions">
              <button className="btn-primary" onClick={() => setStep('setup')}>
                Continue to Setup
              </button>
              <button className="btn-secondary" onClick={onSkip}>
                Skip for Now
              </button>
            </div>
          </div>
        )}

        {/* Step: Setup */}
        {step === 'setup' && (
          <div className="modal-step-content">
            <h3>Security Features</h3>
            <p className="form-intro">Choose which security features to enable</p>

            <form onSubmit={(e) => { e.preventDefault(); handleEnableSecurityFeatures(); }} className="security-form">
              {/* 2FA Toggle */}
              <div className="feature-card">
                <div className="feature-header">
                  <h4>Two-Factor Authentication</h4>
                  <label className="toggle-switch">
                    <input
                      type="checkbox"
                      checked={securitySettings.twoFactorEnabled}
                      onChange={(e) => handleToggle2FA(e.target.checked)}
                    />
                    <span className="toggle-slider"></span>
                  </label>
                </div>
                <p className="feature-description">
                  Adds an extra layer of security to your account. You'll need a code
                  from your authenticator app to log in.
                </p>
                {securitySettings.twoFactorEnabled && (
                  <div className="feature-status enabled">
                    <CheckCircle2 size={16} />
                    <span>Enabled - Backup codes will be generated</span>
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="form-actions">
                <button
                  type="submit"
                  className="btn-primary"
                  disabled={!securitySettings.twoFactorEnabled}
                >
                  Generate Codes
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

        {/* Step: Codes */}
        {step === 'codes' && has2FAWithCodes && (
          <div className="modal-step-content">
            <h3>Backup Codes</h3>
            <p className="form-intro">Save these codes in a safe place. Each code can be used once.</p>

            <div className="codes-container">
              <div className="codes-header">
                <button
                  className={`btn-icon ${showCodes ? 'active' : ''}`}
                  onClick={() => setShowCodes(!showCodes)}
                  title={showCodes ? 'Hide codes' : 'Show codes'}
                >
                  {showCodes ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
                <button
                  className={`btn-icon ${copiedCode === 'all' ? 'copied' : ''}`}
                  onClick={handleCopyAllCodes}
                  title="Copy all codes"
                >
                  <Copy size={18} />
                </button>
                <button
                  className="btn-icon"
                  onClick={handleDownloadCodes}
                  title="Download codes"
                >
                  <Download size={18} />
                </button>
              </div>

              <div className={`codes-list ${showCodes ? 'visible' : 'hidden'}`}>
                {securitySettings.backupCodes.map((code, idx) => (
                  <div key={idx} className="code-item">
                    <span className="code-number">{idx + 1}.</span>
                    <span className="code-text">{code}</span>
                    <button
                      className={`btn-copy ${copiedCode === code ? 'copied' : ''}`}
                      onClick={() => handleCopyCode(code)}
                      title="Copy code"
                    >
                      {copiedCode === code ? '✓ Copied' : 'Copy'}
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Recovery Phrase */}
            {securitySettings.recoveryPhrase && (
              <div className="recovery-section">
                <h4>Recovery Phrase</h4>
                <p className="recovery-hint">Write this down or save it securely</p>
                <div className="recovery-phrase">
                  <p className="phrase-text">{securitySettings.recoveryPhrase}</p>
                </div>
              </div>
            )}

            {/* Acknowledgment */}
            <div className="acknowledgment">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={codesAcknowledged}
                  onChange={(e) => setCodesAcknowledged(e.target.checked)}
                />
                <span>I have saved my backup codes and recovery phrase in a safe place</span>
              </label>
            </div>

            {/* Actions */}
            <div className="form-actions">
              <button
                className="btn-primary"
                onClick={handleAcknowledgeCodes}
                disabled={!codesAcknowledged}
              >
                I've Saved the Codes
              </button>
              <button
                className="btn-secondary"
                onClick={() => setStep('setup')}
              >
                Back
              </button>
            </div>
          </div>
        )}

        {/* Step: Confirm */}
        {step === 'confirm' && (
          <div className="modal-step-content">
            <h3>Confirm Settings</h3>

            <div className="settings-summary">
              <div className="summary-item">
                <span className="label">Two-Factor Authentication:</span>
                <span className={`status ${securitySettings.twoFactorEnabled ? 'enabled' : 'disabled'}`}>
                  {securitySettings.twoFactorEnabled ? '✓ Enabled' : '✗ Disabled'}
                </span>
              </div>
              {securitySettings.twoFactorEnabled && (
                <div className="summary-item">
                  <span className="label">Backup Codes:</span>
                  <span className="status enabled">
                    ✓ {securitySettings.backupCodes.length} codes generated
                  </span>
                </div>
              )}
            </div>

            <div className="form-actions">
              <button className="btn-primary" onClick={handleSubmit}>
                Save Security Settings
              </button>
              <button
                className="btn-secondary"
                onClick={() => setStep(securitySettings.twoFactorEnabled ? 'codes' : 'setup')}
              >
                Back
              </button>
            </div>
          </div>
        )}

        {/* Step: Loading */}
        {step === 'loading' && (
          <div className="modal-step-content center">
            <Loader size={40} className="loading-spinner" />
            <p>Saving security settings...</p>
          </div>
        )}

        {/* Step: Success */}
        {step === 'success' && (
          <div className="modal-step-content center">
            <CheckCircle2 size={48} className="success-icon" />
            <h3>Security Settings Saved</h3>
            <p>Your account is now more secure with advanced protection features.</p>
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
              onClick={() => setStep('confirm')}
            >
              Try Again
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

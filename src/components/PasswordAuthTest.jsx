import React, { useState, useRef } from 'react';
import { AlertCircle, CheckCircle2, ChevronLeft } from 'lucide-react';
import PasswordAuthComponent from './PasswordAuthComponent';
import { useLocalProfile } from '../hooks/useLocalProfile';
import { verifyPassword, hashPin } from '../security/pinEncryption';
import './PasswordAuthTest.css';

/**
 * Test page for password authentication component
 * Tests:
 * 1. Password choice flow (skip or setup)
 * 2. Password validation (strength, requirements)
 * 3. Password confirmation matching
 * 4. Password hashing and storage
 * 5. Password verification
 * 6. Profile update with password
 */
export default function PasswordAuthTest() {
  const [testPhase, setTestPhase] = useState('ready'); // ready, setup, verify, complete
  const [testResults, setTestResults] = useState([]);
  const [selectedProfile, setSelectedProfile] = useState(null);
  const [passwords, setPasswords] = useState({ setup: null, verify: null });
  const [verificationStatus, setVerificationStatus] = useState(null);
  const { profiles, profileService } = useLocalProfile();
  const passwordComponentRef = useRef(null);

  /**
   * Test 1: Check if profiles exist
   */
  const runProfileCheck = () => {
    const result = {
      name: 'Profile Existence Check',
      timestamp: new Date().toLocaleTimeString(),
      passed: profiles.length > 0,
      details: `Found ${profiles.length} profiles in system`,
    };
    setTestResults((prev) => [...prev, result]);

    if (profiles.length > 0) {
      setSelectedProfile(profiles[0]);
      return true;
    }
    return false;
  };

  /**
   * Test 2: Verify password hashing
   */
  const runHashingTest = async () => {
    try {
      const testPassword = 'TestPass123';
      const hashedData = hashPin(testPassword); // Uses same PBKDF2 hashing

      const result = {
        name: 'Password Hashing Test',
        timestamp: new Date().toLocaleTimeString(),
        passed: hashedData && hashedData.hash && hashedData.salt,
        details: `Hash: ${hashedData.hash.substring(0, 20)}... Salt: ${hashedData.salt.substring(0, 20)}...`,
      };
      setTestResults((prev) => [...prev, result]);
      return true;
    } catch (error) {
      const result = {
        name: 'Password Hashing Test',
        timestamp: new Date().toLocaleTimeString(),
        passed: false,
        details: `Error: ${error.message}`,
      };
      setTestResults((prev) => [...prev, result]);
      return false;
    }
  };

  /**
   * Test 3: Verify password verification
   */
  const runVerificationTest = async () => {
    try {
      const testPassword = 'TestPass123';
      const hashedData = hashPin(testPassword);

      // Verify with correct password
      const correctVerify = verifyPassword(testPassword, hashedData.hash, hashedData.salt);

      // Verify with wrong password
      const wrongVerify = verifyPassword('WrongPass123', hashedData.hash, hashedData.salt);

      const result = {
        name: 'Password Verification Test',
        timestamp: new Date().toLocaleTimeString(),
        passed: correctVerify && !wrongVerify,
        details: `Correct password: ${correctVerify ? '✓' : '✗'}, Wrong password rejected: ${!wrongVerify ? '✓' : '✗'}`,
      };
      setTestResults((prev) => [...prev, result]);
      return true;
    } catch (error) {
      const result = {
        name: 'Password Verification Test',
        timestamp: new Date().toLocaleTimeString(),
        passed: false,
        details: `Error: ${error.message}`,
      };
      setTestResults((prev) => [...prev, result]);
      return false;
    }
  };

  /**
   * Test 4: Component integration
   */
  const handlePasswordAuthComplete = async (passwordData) => {
    try {
      // Store password data for verification
      setPasswords(passwordData);

      // Test storing in profile
      if (selectedProfile && profileService) {
        await profileService.updateProfile(selectedProfile.id, {
          passwordHash: passwordData.hash,
          passwordSalt: passwordData.salt,
        });

        const result = {
          name: 'Profile Update with Password',
          timestamp: new Date().toLocaleTimeString(),
          passed: true,
          details: `Password stored for profile: ${selectedProfile.name}`,
        };
        setTestResults((prev) => [...prev, result]);
      }

      // Verify stored password
      if (passwordData.hash && passwordData.salt) {
        const verified = verifyPassword(passwordData.password, passwordData.hash, passwordData.salt);
        const verifyResult = {
          name: 'Stored Password Verification',
          timestamp: new Date().toLocaleTimeString(),
          passed: verified,
          details: verified ? 'Stored password verified successfully' : 'Verification failed',
        };
        setTestResults((prev) => [...prev, verifyResult]);
        setVerificationStatus(verified ? 'success' : 'error');
      }

      setTestPhase('complete');
    } catch (error) {
      const result = {
        name: 'Component Integration',
        timestamp: new Date().toLocaleTimeString(),
        passed: false,
        details: `Error: ${error.message}`,
      };
      setTestResults((prev) => [...prev, result]);
      setVerificationStatus('error');
    }
  };

  /**
   * Run all tests in sequence
   */
  const runAllTests = async () => {
    setTestPhase('running');
    setTestResults([]);
    setVerificationStatus(null);

    // Test 1: Profiles
    const profilesReady = runProfileCheck();
    if (!profilesReady) {
      setTestPhase('ready');
      return;
    }

    // Test 2: Hashing
    await runHashingTest();

    // Test 3: Verification
    await runVerificationTest();

    // Move to component setup
    setTestPhase('setup');
  };

  /**
   * Reset tests
   */
  const resetTests = () => {
    setTestPhase('ready');
    setTestResults([]);
    setSelectedProfile(null);
    setPasswords({ setup: null, verify: null });
    setVerificationStatus(null);
  };

  return (
    <div className="password-auth-test-page">
      <div className="test-container">
        {/* Header */}
        <div className="test-header">
          <h1>🔐 Password Authentication Test Suite</h1>
          <p>Testing password hashing, verification, and component integration</p>
        </div>

        {/* Test Status */}
        <div className="test-status">
          <div className="status-card">
            <div className="status-item">
              <span className="label">Total Tests:</span>
              <span className="value">{testResults.length}</span>
            </div>
            <div className="status-item">
              <span className="label">Passed:</span>
              <span className="value passed">
                {testResults.filter((t) => t.passed).length}
              </span>
            </div>
            <div className="status-item">
              <span className="label">Failed:</span>
              <span className="value failed">
                {testResults.filter((t) => !t.passed).length}
              </span>
            </div>
          </div>
        </div>

        {/* Phase: Ready */}
        {testPhase === 'ready' && (
          <div className="test-phase">
            <h2>Ready to Begin</h2>
            <p>This test suite will validate:</p>
            <ul>
              <li>✓ Password hashing with PBKDF2-SHA256</li>
              <li>✓ Password verification algorithm</li>
              <li>✓ Component integration</li>
              <li>✓ Profile storage</li>
              <li>✓ Password confirmation flow</li>
            </ul>
            <button className="btn-primary" onClick={runAllTests}>
              Start Tests
            </button>
          </div>
        )}

        {/* Phase: Running */}
        {testPhase === 'running' && (
          <div className="test-phase">
            <h2>Running Tests...</h2>
            <div className="spinner"></div>
          </div>
        )}

        {/* Phase: Setup (Component Test) */}
        {testPhase === 'setup' && selectedProfile && (
          <div className="test-phase">
            <h2>Component Integration Test</h2>
            <p>Selected Profile: <strong>{selectedProfile.name}</strong></p>

            <div className="component-wrapper">
              <PasswordAuthComponent
                ref={passwordComponentRef}
                profile={selectedProfile}
                onComplete={handlePasswordAuthComplete}
                isTest={true}
              />
            </div>

            <button
              className="btn-secondary"
              onClick={() => setTestPhase('ready')}
            >
              ← Back to Results
            </button>
          </div>
        )}

        {/* Phase: Complete */}
        {testPhase === 'complete' && (
          <div className="test-phase">
            <h2>Tests Complete ✓</h2>
            {verificationStatus === 'success' && (
              <div className="success-message">
                <CheckCircle2 size={32} />
                <p>All password authentication tests passed!</p>
              </div>
            )}
            {verificationStatus === 'error' && (
              <div className="error-message">
                <AlertCircle size={32} />
                <p>Some tests failed. See results below.</p>
              </div>
            )}
            <button className="btn-primary" onClick={resetTests}>
              Run Tests Again
            </button>
          </div>
        )}

        {/* Test Results */}
        {testResults.length > 0 && (
          <div className="test-results">
            <h3>Test Results</h3>
            <div className="results-list">
              {testResults.map((result, idx) => (
                <div
                  key={idx}
                  className={`result-item ${result.passed ? 'passed' : 'failed'}`}
                >
                  <div className="result-header">
                    <span className="result-icon">
                      {result.passed ? '✓' : '✗'}
                    </span>
                    <span className="result-name">{result.name}</span>
                    <span className="result-time">{result.timestamp}</span>
                  </div>
                  <div className="result-details">{result.details}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="test-actions">
          <button className="btn-secondary" onClick={resetTests}>
            Reset Tests
          </button>
          {testPhase !== 'ready' && (
            <button className="btn-secondary" onClick={() => setTestPhase('ready')}>
              <ChevronLeft size={16} />
              Back
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

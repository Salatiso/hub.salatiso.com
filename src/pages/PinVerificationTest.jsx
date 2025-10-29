import { useState } from 'react';
import PinVerificationModal from '../components/PinVerificationModal';

/**
 * PIN Verification Test Page - Phase 2 Day 3
 * 
 * This page demonstrates the PIN verification flow:
 * 1. Load migrated profiles
 * 2. Show profile selection
 * 3. Enter PIN to verify
 * 4. Success or error handling
 */
const PinVerificationTest = () => {
  const [showModal, setShowModal] = useState(true);
  const [verifiedProfile, setVerifiedProfile] = useState(null);

  const handleVerified = (profile) => {
    setVerifiedProfile(profile);
    setShowModal(false);

    // Simulate app access
    console.log('✅ PIN Verified! Profile:', profile);
  };

  const handleCancel = () => {
    setShowModal(false);
  };

  if (verifiedProfile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="max-w-md bg-white rounded-lg shadow-lg p-8 text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Welcome!</h1>
          <p className="text-gray-600 mb-6">
            You have successfully logged in as <strong>{verifiedProfile.account.name}</strong>
          </p>

          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-4 mb-6">
            <p className="text-sm text-gray-600">
              <strong>Email:</strong> {verifiedProfile.account.email}
            </p>
            <p className="text-sm text-gray-600 mt-2">
              <strong>Trust Score:</strong> {verifiedProfile.trustScore?.total || 0}/100
            </p>
            <p className="text-sm text-gray-600 mt-2">
              <strong>Tasks Completed:</strong> {verifiedProfile.trustScore?.completedTasks || 0}/8
            </p>
          </div>

          <button
            onClick={() => {
              setVerifiedProfile(null);
              setShowModal(true);
            }}
            className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-semibold"
          >
            Logout & Try Another PIN
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      {showModal ? (
        <>
          <PinVerificationModal
            onVerified={handleVerified}
            onCancel={handleCancel}
          />
          <div className="absolute inset-0 flex items-end justify-center p-4 pointer-events-none">
            <div className="pointer-events-auto bg-white rounded-lg p-4 max-w-md text-sm text-gray-600 shadow-lg">
              <p className="font-semibold text-gray-900 mb-2">📝 Test Instructions:</p>
              <ul className="space-y-1 text-xs">
                <li>1. Navigate to /test-migration-data to add test profiles</li>
                <li>2. Migrated profiles will appear in this modal</li>
                <li>3. Test PINs: 1234 (John) or 5678 (Jane)</li>
                <li>4. Invalid PIN shows attempts counter (locked after 3)</li>
              </ul>
            </div>
          </div>
        </>
      ) : (
        <div className="bg-white rounded-lg shadow-lg p-8 text-center max-w-md">
          <p className="text-gray-600 mb-4">Modal closed - verify with another PIN to see the verified state</p>
          <button
            onClick={() => setShowModal(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            Open Modal Again
          </button>
        </div>
      )}
    </div>
  );
};

export default PinVerificationTest;
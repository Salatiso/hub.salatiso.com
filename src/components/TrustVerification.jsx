import React, { useState, useContext } from 'react';
import { Shield, CheckCircle, AlertTriangle, Camera, Upload, Mail } from 'lucide-react';
import GuestContext from '../contexts/GuestContext';

const TrustVerification = ({ onVerificationComplete }) => {
  const { guestData, setGuestData } = useContext(GuestContext);
  const [currentTier, setCurrentTier] = useState(guestData.verificationTier || 'basic');
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationStep, setVerificationStep] = useState(1);

  const tiers = {
    basic: {
      name: 'Basic Profile',
      icon: Mail,
      color: 'text-gray-600',
      bgColor: 'bg-gray-100 dark:bg-gray-800',
      benefits: ['View listings', 'Basic sync access', 'Community forums'],
      requirements: ['Valid email address']
    },
    confirmed: {
      name: 'Identity Confirmed',
      icon: CheckCircle,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100 dark:bg-blue-900/20',
      benefits: ['Full sync features', 'Compatibility reports', 'Verified badge'],
      requirements: ['Government ID verification', 'Address confirmation']
    },
    enhanced: {
      name: 'Enhanced Screening',
      icon: Shield,
      color: 'text-green-600',
      bgColor: 'bg-green-100 dark:bg-green-900/20',
      benefits: ['Priority matching', 'Advanced insights', 'Cross-platform trust'],
      requirements: ['Background check', 'Biometric verification']
    }
  };

  const handleVerification = async (targetTier) => {
    setIsVerifying(true);

    // Simulate verification process
    setTimeout(() => {
      const updatedGuestData = {
        ...guestData,
        verificationTier: targetTier,
        verifiedAt: Date.now(),
        trustScore: targetTier === 'enhanced' ? 85 : targetTier === 'confirmed' ? 65 : 35
      };

      setGuestData(updatedGuestData);
      setCurrentTier(targetTier);
      setIsVerifying(false);
      onVerificationComplete?.(targetTier);
    }, 2000);
  };

  const renderVerificationForm = (tier) => {
    if (tier === 'basic') {
      return (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Email Address
            </label>
            <input
              type="email"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              placeholder="your@email.com"
            />
          </div>
          <button
            onClick={() => handleVerification('confirmed')}
            disabled={isVerifying}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            {isVerifying ? 'Verifying...' : 'Verify Email & Upgrade'}
          </button>
        </div>
      );
    }

    if (tier === 'confirmed') {
      return (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Government ID Upload
            </label>
            <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-4 text-center">
              <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Upload a clear photo of your ID
              </p>
              <input type="file" accept="image/*" className="hidden" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Live Selfie
            </label>
            <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-4 text-center">
              <Camera className="h-8 w-8 text-gray-400 mx-auto mb-2" />
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Take a live selfie for verification
              </p>
            </div>
          </div>
          <button
            onClick={() => handleVerification('enhanced')}
            disabled={isVerifying}
            className="w-full bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 disabled:opacity-50"
          >
            {isVerifying ? 'Verifying...' : 'Complete Enhanced Verification'}
          </button>
        </div>
      );
    }

    return null;
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
      <div className="text-center mb-6">
        <Shield className="h-12 w-12 text-blue-600 dark:text-blue-400 mx-auto mb-2" />
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Trust Verification
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Build trust and unlock premium features
        </p>
      </div>

      <div className="space-y-4">
        {/* Current Tier Display */}
        <div className={`p-4 rounded-lg ${tiers[currentTier].bgColor}`}>
          <div className="flex items-center space-x-3">
            {React.createElement(tiers[currentTier].icon, {
              className: `h-6 w-6 ${tiers[currentTier].color}`
            })}
            <div>
              <h4 className="font-semibold text-gray-900 dark:text-white">
                Current: {tiers[currentTier].name}
              </h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Trust Score: {guestData.trustScore || 35}/100
              </p>
            </div>
          </div>
        </div>

        {/* Tier Progression */}
        <div className="space-y-3">
          {Object.entries(tiers).map(([tierKey, tier]) => (
            <div
              key={tierKey}
              className={`p-4 rounded-lg border-2 transition-colors ${
                currentTier === tierKey
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                  : tierKey === 'basic' || currentTier === 'confirmed' || (currentTier === 'enhanced' && tierKey === 'enhanced')
                  ? 'border-gray-200 dark:border-gray-700'
                  : 'border-gray-200 dark:border-gray-700 opacity-50'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-2">
                  {React.createElement(tier.icon, {
                    className: `h-5 w-5 ${tier.color}`
                  })}
                  <span className="font-medium text-gray-900 dark:text-white">
                    {tier.name}
                  </span>
                </div>
                {currentTier === tierKey && (
                  <CheckCircle className="h-5 w-5 text-green-600" />
                )}
              </div>

              <div className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                <div>
                  <strong>Benefits:</strong> {tier.benefits.join(', ')}
                </div>
                <div>
                  <strong>Requirements:</strong> {tier.requirements.join(', ')}
                </div>
              </div>

              {currentTier !== tierKey && tierKey !== 'basic' && (
                <button
                  onClick={() => setVerificationStep(tierKey === 'confirmed' ? 1 : 2)}
                  className="mt-3 w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 text-sm"
                >
                  Upgrade to {tier.name}
                </button>
              )}
            </div>
          ))}
        </div>

        {/* Verification Form */}
        {verificationStep > 1 && (
          <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
            <h4 className="font-semibold text-gray-900 dark:text-white mb-4">
              {verificationStep === 2 ? 'Identity Confirmation' : 'Enhanced Verification'}
            </h4>
            {renderVerificationForm(verificationStep === 2 ? 'confirmed' : 'enhanced')}
          </div>
        )}

        {/* Security Notice */}
        <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-4">
          <div className="flex items-start space-x-2">
            <AlertTriangle className="h-5 w-5 text-yellow-600 dark:text-yellow-400 mt-0.5" />
            <div className="text-sm text-yellow-800 dark:text-yellow-200">
              <p className="font-medium mb-1">Privacy & Security</p>
              <p>All verification data is encrypted and securely stored. We never share your personal information without consent.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TrustVerification;

import { useState } from 'react';
import TripFacialLog from './TripFacialLog';
import { Shield, Users, CheckCircle, AlertTriangle } from 'lucide-react';

const SafetyInteractionFlow = ({
  interactionType = 'follow_me_home',
  participants = [],
  onComplete,
  onCancel,
  className = ''
}) => {
  // i18n hook intentionally omitted to avoid unused variable until translations are wired
  const [currentStep, setCurrentStep] = useState('consent');
  const [facialLogData, setFacialLogData] = useState(null);
  const [isCompleted, setIsCompleted] = useState(false);

  const steps = {
    consent: { title: 'Safety Enhancement Consent', icon: Shield },
    facial_setup: { title: 'Facial Verification Setup', icon: Users },
    verification: { title: 'Participant Verification', icon: CheckCircle },
    complete: { title: 'Safety Enhanced', icon: Shield }
  };

  const handleConsentAccept = () => {
    setCurrentStep('facial_setup');
  };

  const handleFacialLogComplete = (logData) => {
    setFacialLogData(logData);
    setCurrentStep('complete');
    setIsCompleted(true);

    // Call the onComplete callback with enhanced safety data
    if (onComplete) {
      onComplete({
        interactionType,
        facialVerification: logData,
        safetyEnhanced: true,
        timestamp: new Date().toISOString(),
        participants: logData.participants
      });
    }
  };

  const handleFacialLogSkip = (skipData) => {
    setFacialLogData(skipData);
    setCurrentStep('complete');
    setIsCompleted(true);

    // Call onComplete with basic safety data
    if (onComplete) {
      onComplete({
        interactionType,
        facialVerification: null,
        safetyEnhanced: false,
        skipped: true,
        timestamp: new Date().toISOString(),
        participants: participants
      });
    }
  };

  const getInteractionTitle = () => {
    switch (interactionType) {
      case 'follow_me_home':
        return 'Follow Me Home Safety Enhancement';
      case 'emergency_sync':
        return 'Emergency Response Coordination';
      case 'community_meeting':
        return 'Community Safety Meeting';
      case 'transport_sync':
        return 'Transport Safety Coordination';
      default:
        return 'Safety Interaction Enhancement';
    }
  };

  if (isCompleted) {
    return (
      <div className={`safety-flow-completed bg-white rounded-lg shadow-lg p-6 max-w-2xl mx-auto ${className}`}>
        <div className="text-center">
          <div className="mb-6">
            {facialLogData?.facialVerification ? (
              <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
            ) : (
              <AlertTriangle className="w-16 h-16 text-orange-500 mx-auto mb-4" />
            )}
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              {facialLogData?.facialVerification ? 'Safety Enhanced' : 'Basic Safety Active'}
            </h2>
            <p className="text-gray-600">
              {facialLogData?.facialVerification
                ? 'Facial verification has been completed. Your interaction is now secured with enhanced safety features.'
                : 'Basic safety features are active. Facial verification was skipped.'
              }
            </p>
          </div>

          {facialLogData?.facialVerification && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
              <h3 className="font-medium text-green-800 mb-2">Verification Summary:</h3>
              <div className="text-sm text-green-700 space-y-1">
                <p>• {facialLogData.verifiedParticipants} of {facialLogData.totalParticipants} participants verified</p>
                <p>• Facial recognition data encrypted and stored securely</p>
                <p>• Auto-deletion scheduled for 48 hours</p>
                <p>• Enhanced dispute resolution capabilities activated</p>
              </div>
            </div>
          )}

          <div className="flex justify-center gap-4">
            <button
              onClick={() => window.location.reload()}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Continue to {getInteractionTitle()}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`safety-interaction-flow bg-white rounded-lg shadow-lg ${className}`}>

      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {getInteractionTitle()}
            </h1>
            <p className="text-gray-600 mt-1">
              Enhance safety with optional facial verification
            </p>
          </div>
          <button
            onClick={onCancel}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Progress */}
        <div className="mt-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">Setup Progress</span>
            <span className="text-sm text-gray-500">
              {Object.keys(steps).indexOf(currentStep) + 1} of {Object.keys(steps).length}
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{
                width: `${((Object.keys(steps).indexOf(currentStep) + 1) / Object.keys(steps).length) * 100}%`
              }}
            ></div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">

        {/* Step 1: Consent */}
        {currentStep === 'consent' && (
          <div className="max-w-2xl mx-auto">
            <div className="text-center mb-8">
              <Shield className="w-16 h-16 text-blue-600 mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                Enhance Your Safety
              </h2>
              <p className="text-gray-600">
                Add facial verification for additional security and trust in your interactions.
              </p>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
              <h3 className="font-medium text-blue-900 mb-3">What Facial Verification Provides:</h3>
              <ul className="text-blue-800 space-y-2">
                <li className="flex items-start">
                  <CheckCircle className="w-5 h-5 text-blue-600 mr-2 mt-0.5 flex-shrink-0" />
                  <span>Additional evidence for dispute resolution</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="w-5 h-5 text-blue-600 mr-2 mt-0.5 flex-shrink-0" />
                  <span>Enhanced participant verification</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="w-5 h-5 text-blue-600 mr-2 mt-0.5 flex-shrink-0" />
                  <span>Stronger trust and accountability</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="w-5 h-5 text-blue-600 mr-2 mt-0.5 flex-shrink-0" />
                  <span>Complements existing safety features</span>
                </li>
              </ul>
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
              <div className="flex items-start">
                <AlertTriangle className="w-5 h-5 text-yellow-600 mr-2 mt-0.5 flex-shrink-0" />
                <div>
                  <h4 className="font-medium text-yellow-900 mb-1">Privacy & Security:</h4>
                  <ul className="text-yellow-800 text-sm space-y-1">
                    <li>• Photos are encrypted and stored securely</li>
                    <li>• Auto-deletion after 48 hours</li>
                    <li>• Only used for verification purposes</li>
                    <li>• POPIA compliant data handling</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="text-center">
              <p className="text-gray-600 mb-6">
                Facial verification is <strong>optional</strong> but recommended for enhanced safety.
              </p>
            </div>
          </div>
        )}

        {/* Step 2: Facial Setup */}
        {currentStep === 'facial_setup' && (
          <div className="max-w-2xl mx-auto">
            <div className="text-center mb-8">
              <Users className="w-16 h-16 text-green-600 mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                Participant Verification
              </h2>
              <p className="text-gray-600">
                Verify all participants for enhanced safety and trust.
              </p>
            </div>

            <TripFacialLog
              interactionId={`safety_${Date.now()}`}
              participants={participants}
              onComplete={handleFacialLogComplete}
              onSkip={handleFacialLogSkip}
              context={interactionType}
            />
          </div>
        )}

      </div>

      {/* Footer */}
      {currentStep === 'consent' && (
        <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 rounded-b-lg">
          <div className="flex justify-end gap-3">
            <button
              onClick={onCancel}
              className="px-6 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Skip Enhancement
            </button>
            <button
              onClick={handleConsentAccept}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Enhance Safety
            </button>
          </div>
        </div>
      )}

    </div>
  );
};

export default SafetyInteractionFlow;

import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import FacialRecognition from './FacialRecognition.jsx';
import { CheckCircle, AlertTriangle, Users, Clock, Shield } from 'lucide-react';

const TripFacialLog = ({
  interactionId,
  participants = [],
  onComplete,
  onSkip,
  context = 'safety_sync'
}) => {
  const { t } = useTranslation();
  const [currentStep, setCurrentStep] = useState(0);
  const [facialLogs, setFacialLogs] = useState({});
  const [isCompleted, setIsCompleted] = useState(false);
  const [skipped, setSkipped] = useState(false);

  const steps = [
    { id: 'instructions', title: 'Instructions & Consent' },
    { id: 'participants', title: 'Participant Verification' },
    { id: 'capture', title: 'Facial Capture' },
    { id: 'review', title: 'Review & Confirm' }
  ];

  const handleFacialCapture = (participantId, captureData) => {
    setFacialLogs(prev => ({
      ...prev,
      [participantId]: {
        ...captureData,
        capturedAt: new Date().toISOString()
      }
    }));
  };

  const handleComplete = () => {
    const logData = {
      interactionId,
      context,
      participants: participants.map(p => ({
        id: p.id,
        name: p.name,
        role: p.role,
        facialLog: facialLogs[p.id] || null
      })),
      completedAt: new Date().toISOString(),
      totalParticipants: participants.length,
      verifiedParticipants: Object.keys(facialLogs).length
    };

    setIsCompleted(true);
    onComplete(logData);
  };

  const handleSkip = () => {
    setSkipped(true);
    onSkip({
      interactionId,
      context,
      reason: 'user_skipped',
      skippedAt: new Date().toISOString()
    });
  };

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const currentParticipant = participants[currentStep - 1];

  if (skipped) {
    return (
      <div className="facial-log-container bg-white rounded-lg shadow-lg p-6 max-w-2xl mx-auto">
        <div className="text-center">
          <AlertTriangle className="w-16 h-16 text-orange-500 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            Facial Verification Skipped
          </h3>
          <p className="text-gray-600 mb-6">
            You have chosen to skip facial verification. Some safety features may be limited.
          </p>
          <button
            onClick={() => setSkipped(false)}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  if (isCompleted) {
    return (
      <div className="facial-log-container bg-white rounded-lg shadow-lg p-6 max-w-2xl mx-auto">
        <div className="text-center">
          <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            Facial Verification Complete
          </h3>
          <p className="text-gray-600 mb-6">
            All participants have been verified. Your interaction is now secured with facial recognition.
          </p>
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
            <div className="flex items-center justify-center mb-2">
              <Shield className="w-5 h-5 text-green-600 mr-2" />
              <span className="font-medium text-green-800">Enhanced Security Active</span>
            </div>
            <p className="text-sm text-green-700 text-center">
              Facial verification provides additional safety layer for dispute resolution
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="facial-log-container bg-white rounded-lg shadow-lg p-6 max-w-2xl mx-auto">

      {/* Progress Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-gray-900">
            Facial Verification Process
          </h2>
          <span className="text-sm text-gray-500">
            Step {currentStep + 1} of {steps.length}
          </span>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
          <div
            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
          ></div>
        </div>

        {/* Step Indicators */}
        <div className="flex justify-between">
          {steps.map((step, index) => (
            <div
              key={step.id}
              className={`flex flex-col items-center ${
                index <= currentStep ? 'text-blue-600' : 'text-gray-400'
              }`}
            >
              <div className={`w-8 h-8 rounded-full flex items-center justify-center mb-1 ${
                index < currentStep
                  ? 'bg-blue-600 text-white'
                  : index === currentStep
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 text-gray-400'
              }`}>
                {index < currentStep ? <CheckCircle className="w-4 h-4" /> : index + 1}
              </div>
              <span className="text-xs text-center max-w-20">{step.title}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Step Content */}
      <div className="min-h-96">

        {/* Step 0: Instructions */}
        {currentStep === 0 && (
          <div className="text-center">
            <Shield className="w-16 h-16 text-blue-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-4">
              Facial Verification for Enhanced Safety
            </h3>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <p className="text-blue-800 mb-3">
                Facial recognition adds an extra layer of security to your interaction:
              </p>
              <ul className="text-left text-blue-700 text-sm space-y-2">
                <li>• Provides evidence for dispute resolution</li>
                <li>• Verifies participant identities</li>
                <li>• Enhances trust and accountability</li>
                <li>• Works alongside existing safety features</li>
              </ul>
            </div>
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
              <div className="flex items-start">
                <AlertTriangle className="w-5 h-5 text-yellow-600 mr-2 mt-0.5 flex-shrink-0" />
                <div className="text-left">
                  <p className="text-yellow-800 font-medium mb-1">Important Notes:</p>
                  <ul className="text-yellow-700 text-sm space-y-1">
                    <li>• Photos are encrypted and auto-deleted after 48 hours</li>
                    <li>• Facial recognition is optional but recommended</li>
                    <li>• You can skip this step if preferred</li>
                    <li>• Ensure good lighting for best results</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Step 1: Participants List */}
        {currentStep === 1 && (
          <div>
            <h3 className="text-xl font-semibold text-gray-900 mb-4 text-center">
              Participants to Verify
            </h3>
            <div className="space-y-3">
              {participants.map((participant, index) => (
                <div
                  key={participant.id}
                  className={`flex items-center justify-between p-4 rounded-lg border ${
                    facialLogs[participant.id]
                      ? 'bg-green-50 border-green-200'
                      : 'bg-gray-50 border-gray-200'
                  }`}
                >
                  <div className="flex items-center">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center mr-3 ${
                      facialLogs[participant.id] ? 'bg-green-500' : 'bg-gray-400'
                    }`}>
                      {facialLogs[participant.id] ? (
                        <CheckCircle className="w-6 h-6 text-white" />
                      ) : (
                        <Users className="w-6 h-6 text-white" />
                      )}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{participant.name}</p>
                      <p className="text-sm text-gray-600">{participant.role}</p>
                    </div>
                  </div>
                  {facialLogs[participant.id] && (
                    <div className="text-right">
                      <p className="text-sm text-green-600 font-medium">Verified</p>
                      <p className="text-xs text-gray-500">
                        {new Date(facialLogs[participant.id].capturedAt).toLocaleTimeString()}
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>
            <div className="mt-6 text-center text-sm text-gray-600">
              <p>{Object.keys(facialLogs).length} of {participants.length} participants verified</p>
            </div>
          </div>
        )}

        {/* Step 2: Facial Capture */}
        {currentStep === 2 && currentParticipant && (
          <div>
            <div className="text-center mb-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Verify {currentParticipant.name}
              </h3>
              <p className="text-gray-600">{currentParticipant.role}</p>
            </div>

            <FacialRecognition
              onCapture={(data) => handleFacialCapture(currentParticipant.id, data)}
              userType={currentParticipant.role.toLowerCase().replace(' ', '_')}
              context={context}
            />
          </div>
        )}

        {/* Step 3: Review */}
        {currentStep === 3 && (
          <div>
            <h3 className="text-xl font-semibold text-gray-900 mb-6 text-center">
              Review Verification
            </h3>

            <div className="space-y-4 mb-6">
              {participants.map((participant) => {
                const log = facialLogs[participant.id];
                return (
                  <div key={participant.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center mr-3 ${
                        log ? 'bg-green-500' : 'bg-red-500'
                      }`}>
                        {log ? <CheckCircle className="w-4 h-4 text-white" /> : <AlertTriangle className="w-4 h-4 text-white" />}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{participant.name}</p>
                        <p className="text-sm text-gray-600">{participant.role}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      {log ? (
                        <div>
                          <p className="text-sm text-green-600 font-medium">Verified</p>
                          <p className="text-xs text-gray-500">
                            {new Date(log.capturedAt).toLocaleTimeString()}
                          </p>
                        </div>
                      ) : (
                        <p className="text-sm text-red-600 font-medium">Not Verified</p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start">
                <Shield className="w-5 h-5 text-blue-600 mr-2 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-blue-800 font-medium mb-1">Security Benefits:</p>
                  <ul className="text-blue-700 text-sm space-y-1">
                    <li>• Encrypted photo storage with auto-deletion</li>
                    <li>• Enhanced dispute resolution capabilities</li>
                    <li>• Additional trust layer for interactions</li>
                    <li>• Community validation support</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}

      </div>

      {/* Navigation */}
      <div className="flex justify-between mt-8 pt-6 border-t border-gray-200">
        <button
          onClick={prevStep}
          disabled={currentStep === 0}
          className="px-6 py-2 text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Previous
        </button>

        <div className="flex gap-3">
          {currentStep < steps.length - 1 ? (
            <button
              onClick={nextStep}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Next
            </button>
          ) : (
            <button
              onClick={handleComplete}
              disabled={Object.keys(facialLogs).length === 0}
              className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Complete Verification
            </button>
          )}

          <button
            onClick={handleSkip}
            className="px-6 py-2 text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Skip
          </button>
        </div>
      </div>

    </div>
  );
};

export default TripFacialLog;

import { useState, useContext } from 'react';
import { Shield, CheckCircle, Camera, Award, Star } from 'lucide-react';
import GuestContext from '../contexts/GuestContext';
import FacialRecognition from './FacialRecognition';
import IDVerification from './IDVerification';

const ProfileVerification = ({
  onVerificationComplete,
  className = ''
}) => {
  const { guestData, updateGuestData } = useContext(GuestContext);
  const [activeVerification, setActiveVerification] = useState(null);
  const [completedVerifications, setCompletedVerifications] = useState(
    guestData.verifications?.map(v => v.type) || []
  );

  const verifications = [
    {
      id: 'facial',
      title: 'Facial Verification',
      description: 'Verify your identity with facial recognition',
      icon: Camera,
      trustBonus: 35,
      component: FacialRecognition,
      completed: completedVerifications.includes('facial')
    },
    {
      id: 'id',
      title: 'ID Verification',
      description: 'Verify your identity with government ID',
      icon: Shield,
      trustBonus: 40,
      component: IDVerification,
      completed: completedVerifications.includes('id')
    }
  ];

  const currentTrustScore = guestData.trustScore || 0;
  const maxTrustScore = 100;
  const potentialTrustScore = Math.min(
    maxTrustScore,
    currentTrustScore + verifications
      .filter(v => !v.completed)
      .reduce((sum, v) => sum + v.trustBonus, 0)
  );

  const handleVerificationComplete = (verificationId, result) => {
    const verification = verifications.find(v => v.id === verificationId);
    if (!verification) return;

    // Update completed verifications
    const newCompleted = [...completedVerifications, verificationId];
    setCompletedVerifications(newCompleted);

    // Update guest data with verification record
    const verificationRecord = {
      type: verificationId,
      completedAt: Date.now(),
      trustBonus: verification.trustBonus,
      ...result
    };

    updateGuestData(prev => ({
      ...prev,
      verifications: [...(prev.verifications || []), verificationRecord],
      trustScore: Math.min(maxTrustScore, (prev.trustScore || 0) + verification.trustBonus)
    }));

    setActiveVerification(null);

    if (onVerificationComplete) {
      onVerificationComplete(verificationRecord);
    }
  };

  const VerificationCard = ({ verification }) => {
    const Icon = verification.icon;

    return (
      <div className={`border rounded-lg p-6 transition-all ${
        verification.completed
          ? 'border-green-200 bg-green-50 dark:bg-green-900/20'
          : 'border-gray-200 dark:border-gray-600 hover:border-blue-300 hover:shadow-md'
      }`}>
        <div className="flex items-start gap-4">
          <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
            verification.completed
              ? 'bg-green-100 dark:bg-green-900/40'
              : 'bg-blue-100 dark:bg-blue-900/40'
          }`}>
            {verification.completed ? (
              <CheckCircle className="w-6 h-6 text-green-600" />
            ) : (
              <Icon className="w-6 h-6 text-blue-600" />
            )}
          </div>

          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <h3 className="font-semibold text-gray-900 dark:text-white">
                {verification.title}
              </h3>
              {verification.completed && (
                <Award className="w-4 h-4 text-green-600" />
              )}
            </div>

            <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
              {verification.description}
            </p>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1 text-sm">
                <Star className="w-4 h-4 text-yellow-500" />
                <span className="font-medium">+{verification.trustBonus} Trust Score</span>
              </div>

              {verification.completed ? (
                <div className="text-sm text-green-600 font-medium">
                  ✓ Completed
                </div>
              ) : (
                <button
                  onClick={() => setActiveVerification(verification.id)}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-lg transition-colors"
                >
                  Start Verification
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  if (activeVerification) {
    const verification = verifications.find(v => v.id === activeVerification);
    if (!verification) return null;

    const VerificationComponent = verification.component;

    return (
      <div className={`max-w-2xl mx-auto ${className}`}>
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
          <div className="flex items-center gap-3 mb-6">
            <button
              onClick={() => setActiveVerification(null)}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              ←
            </button>
            <div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                {verification.title}
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Complete this verification to boost your Trust Score
              </p>
            </div>
          </div>

          <VerificationComponent
            onVerificationComplete={(result) => handleVerificationComplete(activeVerification, result)}
            context="profile"
            requireFacial={activeVerification === 'facial'}
            requireNationality={false}
          />
        </div>
      </div>
    );
  }

  return (
    <div className={`max-w-4xl mx-auto ${className}`}>
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <Shield className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Boost Your Trust Score
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Complete verifications to increase your trustworthiness and unlock more features
          </p>
        </div>

        {/* Trust Score Display */}
        <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-6 mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white">Current Trust Score</h3>
              <div className="flex items-center gap-2 mt-1">
                <Star className="w-5 h-5 text-yellow-500" />
                <span className="text-2xl font-bold text-blue-600">{currentTrustScore}</span>
                <span className="text-gray-600 dark:text-gray-400">/ {maxTrustScore}</span>
              </div>
            </div>
            <div className="text-right">
              <div className="text-sm text-gray-600 dark:text-gray-400">Potential</div>
              <div className="text-lg font-semibold text-green-600">{potentialTrustScore}</div>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-3">
            <div
              className="bg-gradient-to-r from-blue-500 to-green-500 h-3 rounded-full transition-all duration-500"
              style={{ width: `${(currentTrustScore / maxTrustScore) * 100}%` }}
            />
          </div>

          <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-2">
            <span>0</span>
            <span>25</span>
            <span>50</span>
            <span>75</span>
            <span>100</span>
          </div>
        </div>

        {/* Trust Levels */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
          {[
            { level: 'Individual', score: 0, color: 'bg-gray-100 dark:bg-gray-700' },
            { level: 'Household', score: 25, color: 'bg-blue-100 dark:bg-blue-900/40' },
            { level: 'Street', score: 50, color: 'bg-green-100 dark:bg-green-900/40' },
            { level: 'Community', score: 75, color: 'bg-yellow-100 dark:bg-yellow-900/40' },
            { level: 'Verified', score: 100, color: 'bg-purple-100 dark:bg-purple-900/40' }
          ].map((level, index) => (
            <div key={level.level} className="text-center">
              <div className={`w-full h-2 rounded-full mb-2 ${level.color} ${
                currentTrustScore >= level.score ? 'opacity-100' : 'opacity-30'
              }`} />
              <div className="text-xs font-medium text-gray-600 dark:text-gray-400">
                {level.level}
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-500">
                {level.score}
              </div>
            </div>
          ))}
        </div>

        {/* Verification Options */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Available Verifications
          </h3>

          {verifications.map((verification) => (
            <VerificationCard key={verification.id} verification={verification} />
          ))}
        </div>

        {/* Benefits */}
        <div className="mt-8 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
          <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">
            Why verify your profile?
          </h4>
          <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
            <li>• Higher trust score unlocks premium features</li>
            <li>• Better matching with service providers</li>
            <li>• Enhanced safety features and priority support</li>
            <li>• Access to exclusive community opportunities</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default ProfileVerification;
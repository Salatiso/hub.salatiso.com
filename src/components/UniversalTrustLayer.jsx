import { useState, useContext, useEffect, useCallback } from 'react';
import { Shield, CheckCircle, AlertTriangle, QrCode } from 'lucide-react';
import GuestContext from '../contexts/GuestContext';

const UniversalTrustLayer = ({ userId, context = 'general' }) => {
  const { guestData } = useContext(GuestContext);
  const [trustScore, setTrustScore] = useState(0);
  const [trustLevel, setTrustLevel] = useState('basic');
  const [isVerified, setIsVerified] = useState(false);
  const [showQR, setShowQR] = useState(false);

  const calculateTrustScore = useCallback(() => {
    let score = 0;
    let level = 'basic';

    // Base score from verification tier
    if (guestData.verificationTier === 'enhanced') {
      score += 40;
      level = 'enhanced';
    } else if (guestData.verificationTier === 'confirmed') {
      score += 25;
      level = 'confirmed';
    } else {
      score += 10;
    }

    // Score from completed syncs
    const completedSyncs = guestData.syncs?.filter(s => s.completed) || [];
    score += Math.min(completedSyncs.length * 5, 30);

    // Score from positive feedback
    const positiveFeedback = guestData.feedback?.filter(f => f.rating >= 4) || [];
    score += Math.min(positiveFeedback.length * 3, 20);

    // Context-specific adjustments
    if (context !== 'general') {
      const contextSyncs = guestData.syncs?.filter(s => s.context === context) || [];
      score += Math.min(contextSyncs.length * 2, 10);
    }

    // Temporal decay (recent activity worth more)
    const recentActivity = guestData.syncs?.filter(s =>
      Date.now() - s.createdAt < 30 * 24 * 60 * 60 * 1000 // Last 30 days
    ) || [];
    score += Math.min(recentActivity.length * 2, 15);

    score = Math.min(Math.max(score, 0), 100);
    setTrustScore(score);
    setTrustLevel(level);
    setIsVerified(guestData.verificationTier !== 'basic');
  }, [context, guestData]);

  useEffect(() => {
    // Calculate trust score based on user activity and verification
    calculateTrustScore();
  }, [calculateTrustScore]);

  const getTrustColor = () => {
    if (trustScore >= 80) return 'text-green-600';
    if (trustScore >= 60) return 'text-blue-600';
    if (trustScore >= 40) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getTrustBadge = () => {
    if (trustLevel === 'enhanced') return '🏆 Elite Verified';
    if (trustLevel === 'confirmed') return '✓ Verified';
    return '🔒 Basic';
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <Shield className={`h-6 w-6 ${getTrustColor()}`} />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Trust Profile
          </h3>
        </div>
        <div className="flex items-center space-x-2">
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${
            trustLevel === 'enhanced' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
            trustLevel === 'confirmed' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' :
            'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
          }`}>
            {getTrustBadge()}
          </span>
        </div>
      </div>

      <div className="space-y-4">
        {/* Trust Score */}
        <div>
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Universal Trust Score
            </span>
            <span className={`text-lg font-bold ${getTrustColor()}`}>
              {trustScore}/100
            </span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
            <div
              className={`h-2 rounded-full transition-all duration-300 ${
                trustScore >= 80 ? 'bg-green-600' :
                trustScore >= 60 ? 'bg-blue-600' :
                trustScore >= 40 ? 'bg-yellow-600' :
                'bg-red-600'
              }`}
              style={{ width: `${trustScore}%` }}
            />
          </div>
        </div>

        {/* Trust Factors */}
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900 dark:text-white">
              {guestData.syncs?.length || 0}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Syncs Completed
            </div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900 dark:text-white">
              {guestData.feedback?.length || 0}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Reviews
            </div>
          </div>
        </div>

        {/* QR Code Verification */}
        <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
          <button
            onClick={() => setShowQR(!showQR)}
            className="flex items-center space-x-2 text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300"
          >
            <QrCode className="h-4 w-4" />
            <span>Show Trust QR Code</span>
          </button>

          {showQR && (
            <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
              <div className="text-center">
                <div className="w-32 h-32 bg-white border-2 border-gray-300 mx-auto mb-2 flex items-center justify-center">
                  <QrCode className="h-16 w-16 text-gray-400" />
                </div>
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  Scan to verify trust profile
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  Trust ID: {userId || 'LS-' + Math.random().toString(36).substring(2, 8).toUpperCase()}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Trust Level Benefits */}
        <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
          <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">
            Trust Level Benefits
          </h4>
          <div className="space-y-1 text-xs text-gray-600 dark:text-gray-400">
            {trustLevel === 'enhanced' && (
              <>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-3 w-3 text-green-600" />
                  <span>Priority matching in all contexts</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-3 w-3 text-green-600" />
                  <span>Advanced compatibility insights</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-3 w-3 text-green-600" />
                  <span>Cross-platform reputation boost</span>
                </div>
              </>
            )}
            {trustLevel === 'confirmed' && (
              <>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-3 w-3 text-blue-600" />
                  <span>Standard compatibility reports</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-3 w-3 text-blue-600" />
                  <span>Verified profile badge</span>
                </div>
              </>
            )}
            {trustLevel === 'basic' && (
              <div className="flex items-center space-x-2">
                <AlertTriangle className="h-3 w-3 text-yellow-600" />
                <span>Upgrade to unlock full features</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default UniversalTrustLayer;

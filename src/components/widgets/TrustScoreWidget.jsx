/**
 * TrustScoreWidget Component - Real Data Integration (Phase 3)
 * Displays trust score and verification status from Firestore
 */

import { Link } from 'react-router-dom';
import { Award, ArrowRight, Shield, Check, Loader, AlertCircle } from 'lucide-react';
import WidgetCard from './WidgetCard';
import { useUserId } from '../../context/UserContext';
import { useTrustScore, useVerifications } from '../../hooks/useFirebaseData';

const TrustScoreWidget = () => {
  const userId = useUserId();
  const { data: trustScoreData, loading: trustLoading, error: trustError } = useTrustScore(userId);
  const { data: verifications, loading: verifLoading, error: verifError } = useVerifications(userId);

  const trustScore = trustScoreData?.score || 0;
  const error = trustError || verifError;
  const loading = trustLoading || verifLoading;

  const getScoreColor = (score) => {
    if (score >= 80) return 'text-green-600 dark:text-green-400';
    if (score >= 60) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-red-600 dark:text-red-400';
  };

  const getScoreBgColor = (score) => {
    if (score >= 80) return 'bg-green-100 dark:bg-green-900/30';
    if (score >= 60) return 'bg-yellow-100 dark:bg-yellow-900/30';
    return 'bg-red-100 dark:bg-red-900/30';
  };

  if (error) {
    return (
      <WidgetCard icon={AlertCircle} title="Trust Score">
        <div className="flex items-center justify-center h-40 text-red-600">
          <AlertCircle className="w-8 h-8 mr-2" />
          <p>{error}</p>
        </div>
      </WidgetCard>
    );
  }

  return (
    <WidgetCard
      icon={Award}
      title="Trust Score"
      actions={[
        {
          label: 'Verify Profile',
          icon: Shield,
          onClick: () => window.location.href = '/profile/verify',
        },
      ]}
    >
      {loading ? (
        <div className="flex items-center justify-center h-40">
          <Loader className="w-6 h-6 animate-spin text-blue-500" />
        </div>
      ) : (
        <div className="space-y-4">
          {/* Score Display */}
          <div className={`text-center py-4 rounded-lg ${getScoreBgColor(trustScore)}`}>
            <p className="text-gray-600 dark:text-gray-400 text-sm mb-2">Your Trust Score</p>
            <div className={`text-4xl font-bold ${getScoreColor(trustScore)}`}>
              {trustScore}
              <span className="text-xl text-gray-500 dark:text-gray-400">/100</span>
            </div>
          </div>

          {/* Verification Status */}
          <div className="space-y-2">
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Verifications</p>
            {verifications && verifications.length > 0 ? (
              verifications.slice(0, 3).map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-700/50 rounded-lg"
                >
                  <span className="text-sm text-gray-700 dark:text-gray-300">{item.type}</span>
                  {item.status === 'verified' ? (
                    <Check className="h-4 w-4 text-green-600 dark:text-green-400" />
                  ) : (
                    <div className="h-4 w-4 rounded-full bg-gray-300 dark:bg-gray-600" />
                  )}
                </div>
              ))
            ) : (
              <p className="text-xs text-gray-500">No verifications yet</p>
            )}
          </div>

          {/* View Profile Button */}
          <Link
            to="/profile"
            className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-medium"
          >
            <span>View Profile</span>
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      )}
    </WidgetCard>
  );
};

export default TrustScoreWidget;

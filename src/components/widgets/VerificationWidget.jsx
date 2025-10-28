/**
 * VerificationWidget Component - Real Data Integration (Phase 3)
 * Displays verification status and badges from Firestore
 */

import { Link } from 'react-router-dom';
import { CheckCircle, ArrowRight, Clock, BadgeCheck, Zap, Loader, AlertCircle } from 'lucide-react';
import WidgetCard from './WidgetCard';
import { useUserId } from '../../context/UserContext';
import { useVerifications } from '../../hooks/useFirebaseData';

const VerificationWidget = () => {
  const userId = useUserId();
  const { data: verifications, loading, error } = useVerifications(userId);

  const getVerificationIcon = (status) => {
    return status === 'verified' ? CheckCircle : Clock;
  };

  const getVerificationColor = (status) => {
    if (status === 'verified') {
      return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400';
    }
    return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400';
  };

  const getBadgeColor = (status) => {
    if (status === 'verified') {
      return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300';
    }
    return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300';
  };

  if (error) {
    return (
      <WidgetCard icon={AlertCircle} title="Verifications">
        <div className="flex items-center justify-center h-40 text-red-600">
          <AlertCircle className="w-8 h-8 mr-2" />
          <p>{error}</p>
        </div>
      </WidgetCard>
    );
  }

  const completedCount = verifications?.filter((v) => v.status === 'verified').length || 0;
  const totalCount = verifications?.length || 0;
  const completionPercent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  return (
    <WidgetCard
      icon={BadgeCheck}
      title="Verifications"
      actions={[
        {
          label: 'Complete Verification',
          icon: Zap,
          onClick: () => window.location.href = '/settings/verification',
        },
      ]}
    >
      {loading ? (
        <div className="flex items-center justify-center h-40">
          <Loader className="w-6 h-6 animate-spin text-blue-500" />
        </div>
      ) : (
        <div className="space-y-4">
          {/* Progress Bar */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Verification Progress
              </p>
              <span className="text-sm font-bold text-blue-600 dark:text-blue-400">
                {completedCount}/{totalCount}
              </span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 overflow-hidden">
              <div
                className="bg-gradient-to-r from-blue-500 to-blue-600 h-full rounded-full transition-all duration-300"
                style={{ width: `${completionPercent}%` }}
              />
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              {completionPercent}% complete
            </p>
          </div>

          {/* Verification Items */}
          <div className="space-y-2">
            {verifications && verifications.length > 0 ? (
              verifications.slice(0, 4).map((verification) => {
                const IconComponent = getVerificationIcon(verification.status);
                return (
                  <div
                    key={verification.id}
                    className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                  >
                    <div className="flex items-center space-x-3">
                      <div className={`p-2 rounded-lg ${getVerificationColor(verification.status)}`}>
                        <IconComponent className="h-4 w-4" />
                      </div>
                      <span className="font-medium text-gray-900 dark:text-white text-sm">
                        {verification.type}
                      </span>
                    </div>
                    <span
                      className={`text-xs px-2 py-1 rounded-full font-medium ${getBadgeColor(verification.status)}`}
                    >
                      {verification.status === 'verified' ? 'Verified' : 'Pending'}
                    </span>
                  </div>
                );
              })
            ) : (
              <p className="text-xs text-gray-500">No verifications yet</p>
            )}
          </div>

          {/* CTA */}
          <Link
            to="/settings/verification"
            className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-medium mt-2"
          >
            <span>Complete All Verifications</span>
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      )}
    </WidgetCard>
  );
};

export default VerificationWidget;

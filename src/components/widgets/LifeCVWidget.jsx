/**
 * LifeCVWidget Component - Real Data Integration (Phase 3)
 * Displays LifeCV summary from Firestore
 */

import { Link } from 'react-router-dom';
import { FileText, ArrowRight, Plus, Loader, AlertCircle } from 'lucide-react';
import WidgetCard from './WidgetCard';
import { useUserId } from '../../context/UserContext';
import { useUserProfile } from '../../hooks/useFirebaseData';

const LifeCVWidget = () => {
  const userId = useUserId();
  const { data: profile, loading, error } = useUserProfile(userId);

  if (error) {
    return (
      <WidgetCard icon={AlertCircle} title="LifeCV">
        <div className="flex items-center justify-center h-40 text-red-600">
          <AlertCircle className="w-8 h-8 mr-2" />
          <p>{error}</p>
        </div>
      </WidgetCard>
    );
  }

  const completionPercent = profile?.completionPercent || 0;
  const sections = profile?.sections || 0;
  const views = profile?.views || 0;

  return (
    <WidgetCard
      icon={FileText}
      title="LifeCV"
      actions={[
        {
          label: 'Download PDF',
          icon: FileText,
          onClick: () => alert('Download feature coming soon'),
        },
        {
          label: 'Share Profile',
          icon: Plus,
          onClick: () => alert('Share feature coming soon'),
        },
      ]}
    >
      {loading ? (
        <div className="flex items-center justify-center h-40">
          <Loader className="w-6 h-6 animate-spin text-blue-500" />
        </div>
      ) : (
        <div className="space-y-4">
          {/* CV Status */}
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
            <div className="flex items-start justify-between">
              <div>
                <h4 className="font-semibold text-gray-900 dark:text-white mb-1">Your Life Profile</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Build your comprehensive life profile with skills, experiences, and achievements.
                </p>
              </div>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{sections}</div>
              <div className="text-xs text-gray-600 dark:text-gray-400">Sections</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600 dark:text-green-400">{completionPercent}%</div>
              <div className="text-xs text-gray-600 dark:text-gray-400">Complete</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">{views}</div>
              <div className="text-xs text-gray-600 dark:text-gray-400">Views</div>
            </div>
          </div>

          {/* Action */}
          <Link
            to="/lifecv"
            className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-medium"
          >
            <span>Edit LifeCV</span>
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      )}
    </WidgetCard>
  );
};

export default LifeCVWidget;

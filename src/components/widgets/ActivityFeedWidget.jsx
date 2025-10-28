/**
 * ActivityFeedWidget - Real Data Integration (Phase 3)
 * Displays recent user activity with real-time data from Firestore
 */

import { Link } from 'react-router-dom';
import { Activity, ArrowRight, Loader, AlertCircle } from 'lucide-react';
import WidgetCard from './WidgetCard';
import { useUserId } from '../../context/UserContext';
import { useActivities } from '../../hooks/useFirebaseData';

const ActivityFeedWidget = () => {
  const userId = useUserId();
  const { data: activities, loading, error } = useActivities(userId, 10);

  if (error) {
    return (
      <WidgetCard icon={AlertCircle} title="Activity Feed">
        <div className="flex items-center justify-center h-40 text-red-600">
          <AlertCircle className="w-8 h-8 mr-2" />
          <p>{error}</p>
        </div>
      </WidgetCard>
    );
  }

  return (
    <WidgetCard icon={Activity} title="Activity Feed">
      {loading ? (
        <div className="flex items-center justify-center h-40">
          <Loader className="w-6 h-6 animate-spin text-blue-500" />
        </div>
      ) : activities && activities.length > 0 ? (
        <div className="space-y-0 divide-y divide-gray-200 dark:divide-gray-700">
          {activities.map((activity) => (
            <div
              key={activity.id}
              className="py-3 first:pt-0 last:pb-0 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors px-2 -mx-2 rounded"
            >
              <div className="flex items-start space-x-3">
                {/* Activity Icon */}
                <div className="flex-shrink-0 p-2 rounded-lg bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400 mt-0.5">
                  <Activity className="h-4 w-4" />
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-900 dark:text-white text-sm">
                    {activity.title}
                  </p>
                  <p className="text-gray-600 dark:text-gray-400 text-xs truncate">
                    {activity.description}
                  </p>
                  <p className="text-gray-500 dark:text-gray-500 text-xs mt-1">
                    {activity.timestamp instanceof Date 
                      ? activity.timestamp.toLocaleDateString() 
                      : 'Recently'}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-center text-gray-500 py-8">No activities yet</p>
      )}

      {/* View All Link */}
      {activities && activities.length > 0 && (
        <Link
          to="/activity"
          className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-medium mt-4"
        >
          <span>View Activity History</span>
          <ArrowRight className="h-4 w-4" />
        </Link>
      )}
    </WidgetCard>
  );
};

export default ActivityFeedWidget;

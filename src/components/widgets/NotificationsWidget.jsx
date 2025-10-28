/**
 * NotificationsWidget - Real Data Integration (Phase 3)
 * Displays notifications with real-time data from Firestore
 */

import { Link } from 'react-router-dom';
import { Bell, ArrowRight, Loader, AlertCircle } from 'lucide-react';
import WidgetCard from './WidgetCard';
import { useUserId } from '../../context/UserContext';
import { useUnreadNotifications } from '../../hooks/useFirebaseData';

const NotificationsWidget = () => {
  const userId = useUserId();
  const { data: notifications, loading, error } = useUnreadNotifications(userId);

  if (error) {
    return (
      <WidgetCard icon={AlertCircle} title="Notifications">
        <div className="flex items-center justify-center h-40 text-red-600">
          <AlertCircle className="w-8 h-8 mr-2" />
          <p>{error}</p>
        </div>
      </WidgetCard>
    );
  }

  return (
    <WidgetCard icon={Bell} title="Notifications" badge={notifications?.filter(n => !n.read).length || 0}>
      {loading ? (
        <div className="flex items-center justify-center h-40">
          <Loader className="w-6 h-6 animate-spin text-blue-500" />
        </div>
      ) : notifications && notifications.length > 0 ? (
        <>
          <div className="space-y-0 divide-y divide-gray-200 dark:divide-gray-700">
            {notifications.slice(0, 4).map((notification) => (
              <div
                key={notification.id}
                className={`py-3 first:pt-0 last:pb-0 px-2 -mx-2 rounded transition-colors ${
                  !notification.read
                    ? 'bg-blue-50/50 dark:bg-blue-900/10'
                    : 'hover:bg-gray-50 dark:hover:bg-gray-700/50'
                }`}
              >
                <div className="flex items-start space-x-3">
                  {/* Unread Indicator */}
                  {!notification.read && (
                    <div className="flex-shrink-0 w-2 h-2 rounded-full bg-blue-500 dark:bg-blue-400 mt-2" />
                  )}

                  {/* Icon */}
                  <div className="flex-shrink-0 p-2 rounded-lg bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400 mt-0.5">
                    <Bell className="h-4 w-4" />
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <p className={`font-medium text-sm truncate ${
                      !notification.read
                        ? 'text-gray-900 dark:text-white'
                        : 'text-gray-700 dark:text-gray-300'
                    }`}>
                      {notification.title}
                    </p>
                    <p className="text-gray-600 dark:text-gray-400 text-xs truncate">
                      {notification.message}
                    </p>
                    <p className="text-gray-500 dark:text-gray-500 text-xs mt-1">
                      {notification.createdAt instanceof Date 
                        ? notification.createdAt.toLocaleDateString() 
                        : 'Recently'}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between pt-3 mt-3 border-t border-gray-200 dark:border-gray-700">
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {notifications.filter(n => !n.read).length} unread
            </p>
            <Link
              to="/notifications"
              className="inline-flex items-center space-x-1 text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium text-xs transition-colors"
            >
              <span>View All</span>
              <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
        </>
      ) : (
        <p className="text-center text-gray-500 py-8">No notifications</p>
      )}
    </WidgetCard>
  );
};

export default NotificationsWidget;

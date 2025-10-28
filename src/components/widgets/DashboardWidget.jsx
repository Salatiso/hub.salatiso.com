/**
 * DashboardWidget Component - Real Data Integration (Phase 3)
 * Displays dashboard overview with real-time data from Firestore
 */

import { TrendingUp, Clock, CheckCircle, Loader, AlertCircle } from 'lucide-react';
import WidgetCard from './WidgetCard';
import { useUserId } from '../../context/UserContext';
import { useActivities } from '../../hooks/useFirebaseData';

const DashboardWidget = () => {
  const userId = useUserId();
  const { data: activities, loading, error } = useActivities(userId);

  const activeConnections = activities?.filter(a => a.type === 'connection').length || 0;
  const pendingTasks = activities?.filter(a => a.status === 'pending').length || 0;
  const completedToday = activities?.filter(a => {
    const today = new Date().toDateString();
    const actDate = a.createdAt instanceof Date 
      ? a.createdAt.toDateString() 
      : new Date(a.createdAt).toDateString();
    return actDate === today && a.status === 'completed';
  }).length || 0;

  const stats = [
    {
      id: 1,
      label: 'Active Connections',
      value: activeConnections.toString(),
      icon: TrendingUp,
      color: 'text-green-600 dark:text-green-400',
      bgColor: 'bg-green-100 dark:bg-green-900/30',
    },
    {
      id: 2,
      label: 'Pending Tasks',
      value: pendingTasks.toString(),
      icon: Clock,
      color: 'text-yellow-600 dark:text-yellow-400',
      bgColor: 'bg-yellow-100 dark:bg-yellow-900/30',
    },
    {
      id: 3,
      label: 'Completed Today',
      value: completedToday.toString(),
      icon: CheckCircle,
      color: 'text-blue-600 dark:text-blue-400',
      bgColor: 'bg-blue-100 dark:bg-blue-900/30',
    },
  ];

  if (error) {
    return (
      <WidgetCard icon={AlertCircle} title="Overview">
        <div className="flex items-center justify-center h-40 text-red-600">
          <AlertCircle className="w-8 h-8 mr-2" />
          <p>{error}</p>
        </div>
      </WidgetCard>
    );
  }

  return (
    <WidgetCard
      icon={TrendingUp}
      title="Overview"
    >
      {loading ? (
        <div className="flex items-center justify-center h-40">
          <Loader className="w-6 h-6 animate-spin text-blue-500" />
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {stats.map((stat) => {
              const IconComponent = stat.icon;
              return (
                <div
                  key={stat.id}
                  className={`p-4 rounded-lg ${stat.bgColor}`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                        {stat.label}
                      </p>
                      <p className={`text-2xl font-bold ${stat.color}`}>
                        {stat.value}
                      </p>
                    </div>
                    <IconComponent className={`h-6 w-6 ${stat.color} opacity-50`} />
                  </div>
                </div>
              );
            })}
          </div>

          {/* Additional info */}
          <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
            <p className="text-sm text-gray-700 dark:text-gray-300">
              <span className="font-medium">Welcome to LifeSync!</span> {' '}
              Your personalized dashboard is ready. Explore features to enhance your life experience.
            </p>
          </div>
        </>
      )}
    </WidgetCard>
  );
};

export default DashboardWidget;

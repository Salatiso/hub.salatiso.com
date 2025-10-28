/**
 * HealthWidget Component - Real Data Integration (Phase 3)
 * Displays health and wellness information from Firestore
 */

import { Link } from 'react-router-dom';
import { Heart, Activity, Zap, ArrowRight, Loader, AlertCircle } from 'lucide-react';
import WidgetCard from './WidgetCard';
import { useUserId } from '../../context/UserContext';
import { useHealthData } from '../../hooks/useFirebaseData';

const HealthWidget = () => {
  const userId = useUserId();
  const { data: healthData, loading, error } = useHealthData(userId);

  const getStatusColor = (status) => {
    const colors = {
      normal: 'text-gray-600 dark:text-gray-400',
      good: 'text-green-600 dark:text-green-400',
      high: 'text-blue-600 dark:text-blue-400',
    };
    return colors[status] || colors.normal;
  };

  if (error) {
    return (
      <WidgetCard icon={AlertCircle} title="Health">
        <div className="flex items-center justify-center h-40 text-red-600">
          <AlertCircle className="w-8 h-8 mr-2" />
          <p>{error}</p>
        </div>
      </WidgetCard>
    );
  }

  const healthMetrics = [
    {
      id: 1,
      label: 'Heart Rate',
      value: healthData?.heartRate || '--',
      unit: 'bpm',
      icon: Heart,
      status: 'normal',
    },
    {
      id: 2,
      label: 'Steps',
      value: healthData?.steps || '--',
      unit: 'steps',
      icon: Activity,
      status: 'good',
    },
    {
      id: 3,
      label: 'Energy',
      value: healthData?.energyLevel || '--',
      unit: '%',
      icon: Zap,
      status: 'high',
    },
  ];

  return (
    <WidgetCard
      icon={Heart}
      title="Health"
      actions={[
        {
          label: 'Full Report',
          icon: Activity,
          onClick: () => window.location.href = '/health',
        },
      ]}
    >
      {loading ? (
        <div className="flex items-center justify-center h-40">
          <Loader className="w-6 h-6 animate-spin text-blue-500" />
        </div>
      ) : (
        <div className="space-y-3">
          {/* Health Metrics */}
          {healthMetrics.map((metric) => {
            const IconComponent = metric.icon;
            return (
              <div
                key={metric.id}
                className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg"
              >
                <div className="flex items-center space-x-3">
                  <IconComponent className={`h-4 w-4 ${getStatusColor(metric.status)}`} />
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{metric.label}</p>
                    <p className="font-semibold text-gray-900 dark:text-white">
                      {metric.value} <span className="text-xs text-gray-500">{metric.unit}</span>
                    </p>
                  </div>
                </div>
                <div className={`h-2 w-8 rounded-full ${getStatusColor(metric.status).replace('text-', 'bg-')}`} />
              </div>
            );
          })}

          {/* View Details Button */}
          <Link
            to="/health"
            className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-medium mt-2"
          >
            <span>Health Details</span>
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      )}
    </WidgetCard>
  );
};

export default HealthWidget;

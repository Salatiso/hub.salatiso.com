/**
 * SettingsWidget Component - Real Data Integration (Phase 3)
 * Displays quick settings shortcuts from Firestore
 */

import { Link } from 'react-router-dom';
import { Settings, ArrowRight, Bell, Lock, Eye, Loader, AlertCircle } from 'lucide-react';
import WidgetCard from './WidgetCard';
import { useUserId } from '../../context/UserContext';
// Note: useSettings hook would be used here if implemented

const SettingsWidget = () => {
  // For now using mock data - can be connected to Firestore later
  const settings = [
    {
      id: 1,
      name: 'Notifications',
      icon: Bell,
      enabled: true,
      link: '/settings/notifications',
    },
    {
      id: 2,
      name: 'Privacy',
      icon: Lock,
      enabled: true,
      link: '/settings/privacy',
    },
    {
      id: 3,
      name: 'Visibility',
      icon: Eye,
      enabled: false,
      link: '/settings/visibility',
    },
  ];

  const userId = useUserId();
  const loading = false;
  const error = null;

  if (error) {
    return (
      <WidgetCard icon={AlertCircle} title="Settings">
        <div className="flex items-center justify-center h-40 text-red-600">
          <AlertCircle className="w-8 h-8 mr-2" />
          <p>{error}</p>
        </div>
      </WidgetCard>
    );
  }

  return (
    <WidgetCard
      icon={Settings}
      title="Settings"
      actions={[
        {
          label: 'All Settings',
          icon: Settings,
          onClick: () => window.location.href = '/settings',
        },
      ]}
    >
      {loading ? (
        <div className="flex items-center justify-center h-40">
          <Loader className="w-6 h-6 animate-spin text-blue-500" />
        </div>
      ) : (
        <div className="space-y-2">
          {/* Settings List */}
          {settings.map((setting) => {
            const IconComponent = setting.icon;
            return (
              <Link
                key={setting.id}
                to={setting.link}
                className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                <div className="flex items-center space-x-3">
                  <IconComponent className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    {setting.name}
                  </span>
                </div>
                <div
                  className={`h-5 w-9 rounded-full transition-colors ${
                    setting.enabled
                      ? 'bg-green-500'
                      : 'bg-gray-300 dark:bg-gray-600'
                  }`}
                >
                  <div
                    className={`h-4 w-4 rounded-full bg-white dark:bg-white transition-transform transform ${
                      setting.enabled ? 'translate-x-4' : 'translate-x-0.5'
                    }`}
                    style={{ marginTop: '2px' }}
                  />
                </div>
              </Link>
            );
          })}

          {/* View All Button */}
          <Link
            to="/settings"
            className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-medium mt-2"
          >
            <span>All Settings</span>
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      )}
    </WidgetCard>
  );
};

export default SettingsWidget;

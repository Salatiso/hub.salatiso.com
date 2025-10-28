/**
 * Offline Status Component
 * Shows current online/offline status and sync information
 *
 * Features:
 * - Online/offline indicator
 * - Sync status display
 * - Pending operations count
 * - Last sync time
 * - Manual sync trigger
 *
 * @component
 */

import React, { useState, useEffect } from 'react';
import { guestAccountService } from '../services/guestAccountService';
import { Wifi, WifiOff, RefreshCw, Cloud, CloudOff } from 'lucide-react';

interface OfflineStatusProps {
  compact?: boolean;
  showSyncButton?: boolean;
  className?: string;
}

export const OfflineStatus: React.FC<OfflineStatusProps> = ({
  compact = false,
  showSyncButton = true,
  className = '',
}) => {
  const [offlineStatus, setOfflineStatus] = useState(guestAccountService.getOfflineStatus());
  const [isSyncing, setIsSyncing] = useState(false);

  useEffect(() => {
    // Subscribe to offline status changes
    const unsubscribe = guestAccountService.onOfflineStatusChange((status) => {
      setOfflineStatus(status);
    });

    return unsubscribe;
  }, []);

  const handleManualSync = async () => {
    if (!offlineStatus.isOnline || isSyncing) return;

    setIsSyncing(true);
    try {
      // The service handles sync automatically, but we can trigger it manually
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate sync
      // In real implementation, this would call a Firebase sync method
    } catch (error) {
      console.error('Manual sync failed:', error);
    } finally {
      setIsSyncing(false);
    }
  };

  const formatLastSync = (timestamp: number | null) => {
    if (!timestamp) return 'Never';

    const now = Date.now();
    const diff = now - timestamp;
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  };

  if (compact) {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        {offlineStatus.isOnline ? (
          <Wifi className="w-4 h-4 text-green-500" />
        ) : (
          <WifiOff className="w-4 h-4 text-red-500" />
        )}

        {offlineStatus.isOfflineMode && (
          <Cloud className="w-4 h-4 text-blue-500" />
        )}

        {offlineStatus.hasPendingSync && (
          <div className="w-2 h-2 bg-orange-500 rounded-full animate-pulse" />
        )}
      </div>
    );
  }

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-lg border p-4 ${className}`}>
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          {offlineStatus.isOnline ? (
            <>
              <Wifi className="w-5 h-5 text-green-500" />
              Online
            </>
          ) : (
            <>
              <WifiOff className="w-5 h-5 text-red-500" />
              Offline
            </>
          )}
        </h3>

        {offlineStatus.isOfflineMode && (
          <div className="flex items-center gap-1 text-sm text-blue-600 dark:text-blue-400">
            <Cloud className="w-4 h-4" />
            Offline Mode
          </div>
        )}
      </div>

      <div className="space-y-2 text-sm">
        {offlineStatus.isAuthenticated && (
          <div className="flex justify-between">
            <span className="text-gray-600 dark:text-gray-400">Account:</span>
            <span className="font-medium">
              {offlineStatus.isOfflineMode ? 'Offline Mode' : 'Online'}
            </span>
          </div>
        )}

        {offlineStatus.hasPendingSync && (
          <div className="flex justify-between">
            <span className="text-gray-600 dark:text-gray-400">Pending Sync:</span>
            <span className="font-medium text-orange-600 dark:text-orange-400">
              {offlineStatus.syncQueueLength} operations
            </span>
          </div>
        )}

        {offlineStatus.lastSyncAttempt && (
          <div className="flex justify-between">
            <span className="text-gray-600 dark:text-gray-400">Last Sync:</span>
            <span className="font-medium">
              {formatLastSync(offlineStatus.lastSyncAttempt)}
            </span>
          </div>
        )}

        {!offlineStatus.isOnline && offlineStatus.isAuthenticated && (
          <div className="mt-3 p-2 bg-yellow-50 dark:bg-yellow-900/20 rounded border border-yellow-200 dark:border-yellow-800">
            <p className="text-yellow-800 dark:text-yellow-200 text-xs">
              ⚠️ You're offline. Changes will sync when connection is restored.
            </p>
          </div>
        )}

        {offlineStatus.isOnline && offlineStatus.hasPendingSync && showSyncButton && (
          <div className="mt-3 flex justify-end">
            <button
              onClick={handleManualSync}
              disabled={isSyncing}
              className="flex items-center gap-2 px-3 py-1 text-sm bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded transition-colors"
            >
              {isSyncing ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <RefreshCw className="w-4 h-4" />
              )}
              {isSyncing ? 'Syncing...' : 'Sync Now'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

// Compact version for headers/navigation
export const OfflineStatusBadge: React.FC<{ className?: string }> = ({ className = '' }) => {
  return <OfflineStatus compact className={className} />;
};

// Full status card for dashboard/settings
export const OfflineStatusCard: React.FC<{ className?: string }> = ({ className = '' }) => {
  return <OfflineStatus compact={false} showSyncButton={true} className={className} />;
};

export default OfflineStatus;
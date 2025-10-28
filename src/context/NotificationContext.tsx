/**
 * Notification Context
 * Global notification system for alerts and messages
 */

import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';

export interface AppNotification {
  id: string;
  type: 'success' | 'error' | 'info' | 'warning';
  message: string;
  duration?: number; // ms, 0 = persistent
}

interface NotificationContextType {
  notifications: AppNotification[];
  addNotification: (message: string, type: AppNotification['type'], duration?: number) => string;
  removeNotification: (id: string) => void;
  clearNotifications: () => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

interface NotificationProviderProps {
  children: ReactNode;
}

export function NotificationProvider({ children }: NotificationProviderProps) {
  const [notifications, setNotifications] = useState<AppNotification[]>([]);

  const addNotification = useCallback(
    (message: string, type: AppNotification['type'] = 'info', duration: number = 5000) => {
      const id = `notification-${Date.now()}-${Math.random()}`;
      const notification: AppNotification = {
        id,
        type,
        message,
        duration: duration || 0,
      };

      setNotifications((prev) => [...prev, notification]);

      // Auto-remove if duration is set
      if (duration > 0) {
        setTimeout(() => {
          removeNotification(id);
        }, duration);
      }

      return id;
    },
    []
  );

  const removeNotification = useCallback((id: string) => {
    setNotifications((prev) => prev.filter((notif) => notif.id !== id));
  }, []);

  const clearNotifications = useCallback(() => {
    setNotifications([]);
  }, []);

  const value: NotificationContextType = {
    notifications,
    addNotification,
    removeNotification,
    clearNotifications,
  };

  return (
    <NotificationContext.Provider value={value}>{children}</NotificationContext.Provider>
  );
}

/**
 * Hook to use Notification Context
 */
export function useNotification() {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotification must be used within NotificationProvider');
  }
  return context;
}

/**
 * Convenience hooks for specific notification types
 */
export function useNotificationActions() {
  const { addNotification } = useNotification();

  return {
    success: (message: string, duration?: number) => addNotification(message, 'success', duration),
    error: (message: string, duration?: number) => addNotification(message, 'error', duration),
    info: (message: string, duration?: number) => addNotification(message, 'info', duration),
    warning: (message: string, duration?: number) => addNotification(message, 'warning', duration),
  };
}

/**
 * Custom Hooks for Data Fetching
 * Real-time data hooks with loading and error states
 */

import { useState, useEffect, useCallback } from 'react';
import { firebaseService } from '../services/firebaseService';
import {
  UserProfile,
  LifeCV,
  Contact,
  CalendarEvent,
  Asset,
  TrustScore,
  Activity,
  Verification,
  Notification,
  Goal,
  HealthData,
} from '../types/models';

// Generic Hook Template
function useFirebaseData<T>(
  fetcher: () => Promise<T | null>,
  listener?: (callback: (data: T | null) => void) => () => void
) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let unsubscribe: (() => void) | null = null;

    const loadData = async () => {
      try {
        setLoading(true);
        const result = await fetcher();
        setData(result);
        setError(null);

        // Set up real-time listener if provided
        if (listener) {
          unsubscribe = listener((newData) => {
            setData(newData);
          });
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
        setData(null);
      } finally {
        setLoading(false);
      }
    };

    loadData();

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, []);

  return { data, loading, error };
}

// Generic Array Hook
function useFirebaseList<T>(
  fetcher: () => Promise<T[]>,
  listener?: (callback: (data: T[]) => void) => () => void
) {
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let unsubscribe: (() => void) | null = null;

    const loadData = async () => {
      try {
        setLoading(true);
        const result = await fetcher();
        setData(result);
        setError(null);

        // Set up real-time listener if provided
        if (listener) {
          unsubscribe = listener((newData) => {
            setData(newData);
          });
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
        setData([]);
      } finally {
        setLoading(false);
      }
    };

    loadData();

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, []);

  return { data, loading, error };
}

// ============= SPECIFIC HOOKS =============

export function useUserProfile(userId: string) {
  return useFirebaseData(
    () => firebaseService.getUserProfile(userId),
    (callback) => firebaseService.onUserProfileChange(userId, callback)
  );
}

export function useLifeCV(userId: string) {
  return useFirebaseData(() => firebaseService.getLifeCV(userId));
}

export function useContacts(userId: string) {
  return useFirebaseList(
    () => firebaseService.getContacts(userId),
  );
}

export function useCalendarEvents(userId: string, startDate?: Date, endDate?: Date) {
  const start = startDate || new Date();
  const end = endDate || new Date(start.getTime() + 30 * 24 * 60 * 60 * 1000); // 30 days

  return useFirebaseList(() => firebaseService.getCalendarEvents(userId, start, end));
}

export function useAssets(userId: string) {
  return useFirebaseList(() => firebaseService.getAssets(userId));
}

export function useTrustScore(userId: string) {
  return useFirebaseData(() => firebaseService.getTrustScore(userId));
}

export function useActivities(userId: string, limit: number = 20) {
  return useFirebaseList(
    () => firebaseService.getActivities(userId, limit),
    (callback) => firebaseService.onActivitiesChange(userId, callback)
  );
}

export function useVerifications(userId: string) {
  return useFirebaseList(() => firebaseService.getVerifications(userId));
}

export function useNotifications(userId: string) {
  return useFirebaseList(
    () => firebaseService.getNotifications(userId, false),
    (callback) => firebaseService.onNotificationsChange(userId, callback)
  );
}

export function useUnreadNotifications(userId: string) {
  return useFirebaseList(() => firebaseService.getNotifications(userId, true));
}

export function useGoals(userId: string, status?: string) {
  return useFirebaseList(() => firebaseService.getGoals(userId, status));
}

export function useHealthData(userId: string) {
  return useFirebaseData(() => firebaseService.getHealthData(userId));
}

// ============= COMPOSITE HOOKS =============

/**
 * Hook to load all user data at once
 * Useful for dashboard initialization
 */
export function useDashboardData(userId: string) {
  const profile = useUserProfile(userId);
  const activities = useActivities(userId, 10);
  const notifications = useUnreadNotifications(userId);
  const trustScore = useTrustScore(userId);
  const goals = useGoals(userId, 'active');

  const loading = profile.loading || activities.loading || notifications.loading;
  const error = profile.error || activities.error || notifications.error;

  return {
    profile: profile.data,
    activities: activities.data,
    notifications: notifications.data,
    trustScore: trustScore.data,
    goals: goals.data,
    loading,
    error,
  };
}

/**
 * Hook to load all contact-related data
 */
export function useContactsData(userId: string) {
  const contacts = useContacts(userId);

  return {
    contacts: contacts.data,
    loading: contacts.loading,
    error: contacts.error,
    total: contacts.data.length,
  };
}

/**
 * Hook to load all calendar data
 */
export function useCalendarData(userId: string, startDate?: Date, endDate?: Date) {
  const events = useCalendarEvents(userId, startDate, endDate);

  return {
    events: events.data,
    loading: events.loading,
    error: events.error,
    total: events.data.length,
  };
}

/**
 * Hook to load calendar data (alias for useCalendarData)
 */
export function useCalendar(userId: string, startDate?: Date, endDate?: Date) {
  return useCalendarData(userId, startDate, endDate);
}

/**
 * Hook to load all asset data
 */
export function useAssetsData(userId: string) {
  const assets = useAssets(userId);

  return {
    assets: assets.data,
    loading: assets.loading,
    error: assets.error,
    total: assets.data.length,
    totalValue: assets.data.reduce((sum, asset) => sum + (asset.value || 0), 0),
  };
}

/**
 * Hook to load all goal-related data
 */
export function useGoalsData(userId: string) {
  const activeGoals = useGoals(userId, 'active');
  const completedGoals = useGoals(userId, 'completed');

  return {
    activeGoals: activeGoals.data,
    completedGoals: completedGoals.data,
    loading: activeGoals.loading || completedGoals.loading,
    error: activeGoals.error || completedGoals.error,
    totalActive: activeGoals.data.length,
    totalCompleted: completedGoals.data.length,
  };
}

/**
 * Hook to load user profile and settings
 */
export function useUserData(userId: string) {
  const profile = useUserProfile(userId);

  return {
    profile: profile.data,
    loading: profile.loading,
    error: profile.error,
  };
}

/**
 * useLocalProfile Hook - React Hook for Local Profile Management
 * 
 * Provides a React hook for managing local profile state, with:
 * - Loading and saving profiles from/to Dexie
 * - Creating new profiles
 * - Updating profile fields
 * - Managing task statuses
 * - Calculating trust scores
 * 
 * Phase 2 Day 1: Profile State Management
 */

import { useState, useCallback, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import type {
  ILocalProfile,
  ILocalAccount,
  ITaskStatus,
  ITrustScore,
  ITask,
} from '../db/profileTypes';
import { db } from '../db/profiles.db';
import { hashPin, verifyPin } from '../security/pinEncryption';

/**
 * Hook state and methods
 */
interface UseLocalProfileReturn {
  // State
  profile: ILocalProfile | null;
  isLoading: boolean;
  error: string | null;

  // Profile operations
  createProfile: (name: string, email?: string, pin?: string) => Promise<ILocalProfile>;
  loadProfile: (profileId: string) => Promise<ILocalProfile | null>;
  updateProfile: (updates: Partial<ILocalProfile>) => Promise<void>;
  saveProfile: () => Promise<void>;
  deleteProfile: (profileId: string) => Promise<void>;

  // Account operations
  updateAccount: (updates: Partial<ILocalAccount>) => Promise<void>;
  verifyPin: (pin: string) => boolean;

  // Task operations
  completeTask: (taskId: string, data?: Record<string, any>) => Promise<void>;
  unCompleteTask: (taskId: string) => Promise<void>;
  verifyTask: (taskId: string) => Promise<void>;
  getTaskStatus: (taskId: string) => ITaskStatus | undefined;

  // Utility operations
  calculateTrustScore: () => ITrustScore;
  exportProfile: () => string; // JSON string
}

/**
 * Calculate trust score based on completed tasks
 */
function calculateTrustScore(tasks: ITaskStatus[]): ITrustScore {
  const completedTasks = tasks.filter((t) => t.isCompleted);
  const verifiedTasks = tasks.filter((t) => t.isVerified);

  // Each task is worth up to 12.5 points (8 tasks = 100 points)
  const taskPoints = completedTasks.length * 12.5;
  const verificationBonus = verifiedTasks.length * 1.25;

  const total = Math.min(
    100,
    Math.round((taskPoints + verificationBonus) * 2) / 2
  );

  return {
    total,
    breakdown: {
      tasks: Math.round(taskPoints),
      verification: Math.round(verificationBonus),
      security: 0, // Will be calculated in Phase 2.5
    },
    level:
      total >= 80
        ? 'trusted'
        : total >= 60
          ? 'verified'
          : total >= 30
            ? 'basic'
            : 'minimal',
    completedTasks: completedTasks.length,
    lastUpdated: Date.now(),
  };
}

/**
 * Initialize default tasks for a profile
 */
async function initializeProfileTasks(
  profileId: string
): Promise<ITaskStatus[]> {
  const taskDefs = await db.taskDefinitions.toArray();

  const taskStatuses: ITaskStatus[] = taskDefs.map((task) => ({
    taskId: task.id,
    profileId,
    isCompleted: false,
    isVerified: false,
  }));

  return taskStatuses;
}

/**
 * useLocalProfile Hook
 * 
 * @returns Hook interface with all profile management methods
 */
export function useLocalProfile(): UseLocalProfileReturn {
  const [profile, setProfile] = useState<ILocalProfile | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Create a new profile
   */
  const createProfile = useCallback(
    async (name: string, email?: string, pin?: string): Promise<ILocalProfile> => {
      setIsLoading(true);
      setError(null);

      try {
        // Create new profile
        const profileId = uuidv4();
        const accountId = uuidv4();

        // Initialize tasks
        const tasks = await initializeProfileTasks(profileId);
        const trustScore = calculateTrustScore(tasks);

        // Create local account
        const account: ILocalAccount = {
          id: accountId,
          type: 'local',
          name,
          email: email || undefined,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        };

        // Add PIN if provided
        if (pin) {
          const { hash, salt } = hashPin(pin);
          account.pin = {
            salt,
            hash,
            iterations: 1000,
            algorithm: 'PBKDF2-SHA256',
            createdAt: Date.now(),
            updatedAt: Date.now(),
          };
        }

        // Create full profile
        const newProfile: ILocalProfile = {
          id: profileId,
          account,
          profile: {},
          tasks,
          trustScore,
          createdAt: Date.now(),
          updatedAt: Date.now(),
          lastAccessedAt: Date.now(),
        };

        // Save to Dexie
        await db.profiles.add(newProfile);
        await db.accounts.add(account);
        await db.tasks.bulkAdd(tasks);

        setProfile(newProfile);
        console.log('✅ Profile created:', profileId);

        return newProfile;
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to create profile';
        setError(message);
        console.error('❌ Error creating profile:', err);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  /**
   * Load a profile by ID
   */
  const loadProfile = useCallback(
    async (profileId: string): Promise<ILocalProfile | null> => {
      setIsLoading(true);
      setError(null);

      try {
        const loadedProfile = await db.profiles.get(profileId);

        if (!loadedProfile) {
          setError('Profile not found');
          return null;
        }

        // Load associated tasks
        const tasks = await db.tasks
          .where('profileId')
          .equals(profileId)
          .toArray();

        loadedProfile.tasks = tasks;
        loadedProfile.lastAccessedAt = Date.now();

        // Update lastAccessedAt in database
        await db.profiles.update(profileId, {
          lastAccessedAt: Date.now(),
        });

        setProfile(loadedProfile);
        console.log('✅ Profile loaded:', profileId);

        return loadedProfile;
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to load profile';
        setError(message);
        console.error('❌ Error loading profile:', err);
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  /**
   * Update profile in memory
   */
  const updateProfile = useCallback(
    async (updates: Partial<ILocalProfile>): Promise<void> => {
      if (!profile) {
        setError('No profile loaded');
        return;
      }

      try {
        const updated = {
          ...profile,
          ...updates,
          updatedAt: Date.now(),
        };

        setProfile(updated);
        console.log('✅ Profile updated in memory');
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to update profile';
        setError(message);
        console.error('❌ Error updating profile:', err);
      }
    },
    [profile]
  );

  /**
   * Save current profile to Dexie
   */
  const saveProfile = useCallback(async (): Promise<void> => {
    if (!profile) {
      setError('No profile to save');
      return;
    }

    setIsLoading(true);

    try {
      // Update profile
      await db.profiles.update(profile.id, {
        ...profile,
        updatedAt: Date.now(),
      });

      // Update tasks
      for (const task of profile.tasks) {
        await db.tasks.update(task.id, task);
      }

      console.log('✅ Profile saved to database');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to save profile';
      setError(message);
      console.error('❌ Error saving profile:', err);
    } finally {
      setIsLoading(false);
    }
  }, [profile]);

  /**
   * Delete a profile
   */
  const deleteProfile = useCallback(
    async (profileId: string): Promise<void> => {
      setIsLoading(true);

      try {
        // Delete associated data
        await db.tasks.where('profileId').equals(profileId).delete();
        await db.profiles.delete(profileId);

        if (profile?.id === profileId) {
          setProfile(null);
        }

        console.log('✅ Profile deleted:', profileId);
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to delete profile';
        setError(message);
        console.error('❌ Error deleting profile:', err);
      } finally {
        setIsLoading(false);
      }
    },
    [profile]
  );

  /**
   * Update account information
   */
  const updateAccount = useCallback(
    async (updates: Partial<ILocalAccount>): Promise<void> => {
      if (!profile) {
        setError('No profile loaded');
        return;
      }

      try {
        const updatedProfile = {
          ...profile,
          account: { ...profile.account, ...updates },
          updatedAt: Date.now(),
        };

        setProfile(updatedProfile);
        await db.profiles.update(profile.id, updatedProfile);
        console.log('✅ Account updated');
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to update account';
        setError(message);
        console.error('❌ Error updating account:', err);
      }
    },
    [profile]
  );

  /**
   * Verify PIN
   */
  const verifyPinFn = useCallback(
    (pin: string): boolean => {
      if (!profile?.account.pin) {
        setError('No PIN set for this account');
        return false;
      }

      try {
        return verifyPin(pin, profile.account.pin.hash, profile.account.pin.salt);
      } catch (err) {
        const message = err instanceof Error ? err.message : 'PIN verification failed';
        setError(message);
        return false;
      }
    },
    [profile]
  );

  /**
   * Mark task as completed
   */
  const completeTask = useCallback(
    async (taskId: string, data?: Record<string, any>): Promise<void> => {
      if (!profile) {
        setError('No profile loaded');
        return;
      }

      try {
        const taskIndex = profile.tasks.findIndex((t) => t.taskId === taskId);

        if (taskIndex === -1) {
          throw new Error(`Task ${taskId} not found`);
        }

        const updatedTasks = [...profile.tasks];
        updatedTasks[taskIndex] = {
          ...updatedTasks[taskIndex],
          isCompleted: true,
          completedAt: Date.now(),
          data,
        };

        const updatedProfile = {
          ...profile,
          tasks: updatedTasks,
          trustScore: calculateTrustScore(updatedTasks),
          updatedAt: Date.now(),
        };

        setProfile(updatedProfile);
        await db.tasks.update(updatedTasks[taskIndex].id, updatedTasks[taskIndex]);

        console.log('✅ Task completed:', taskId);
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to complete task';
        setError(message);
        console.error('❌ Error completing task:', err);
      }
    },
    [profile]
  );

  /**
   * Mark task as incomplete
   */
  const unCompleteTask = useCallback(
    async (taskId: string): Promise<void> => {
      if (!profile) {
        setError('No profile loaded');
        return;
      }

      try {
        const taskIndex = profile.tasks.findIndex((t) => t.taskId === taskId);

        if (taskIndex === -1) {
          throw new Error(`Task ${taskId} not found`);
        }

        const updatedTasks = [...profile.tasks];
        updatedTasks[taskIndex] = {
          ...updatedTasks[taskIndex],
          isCompleted: false,
          completedAt: undefined,
        };

        const updatedProfile = {
          ...profile,
          tasks: updatedTasks,
          trustScore: calculateTrustScore(updatedTasks),
          updatedAt: Date.now(),
        };

        setProfile(updatedProfile);
        await db.tasks.update(updatedTasks[taskIndex].id, updatedTasks[taskIndex]);

        console.log('✅ Task uncompleted:', taskId);
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to uncomplete task';
        setError(message);
        console.error('❌ Error uncompleting task:', err);
      }
    },
    [profile]
  );

  /**
   * Mark task as verified
   */
  const verifyTask = useCallback(
    async (taskId: string): Promise<void> => {
      if (!profile) {
        setError('No profile loaded');
        return;
      }

      try {
        const taskIndex = profile.tasks.findIndex((t) => t.taskId === taskId);

        if (taskIndex === -1) {
          throw new Error(`Task ${taskId} not found`);
        }

        const updatedTasks = [...profile.tasks];
        updatedTasks[taskIndex] = {
          ...updatedTasks[taskIndex],
          isVerified: true,
          verifiedAt: Date.now(),
        };

        const updatedProfile = {
          ...profile,
          tasks: updatedTasks,
          trustScore: calculateTrustScore(updatedTasks),
          updatedAt: Date.now(),
        };

        setProfile(updatedProfile);
        await db.tasks.update(updatedTasks[taskIndex].id, updatedTasks[taskIndex]);

        console.log('✅ Task verified:', taskId);
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to verify task';
        setError(message);
        console.error('❌ Error verifying task:', err);
      }
    },
    [profile]
  );

  /**
   * Get task status by ID
   */
  const getTaskStatus = useCallback(
    (taskId: string): ITaskStatus | undefined => {
      return profile?.tasks.find((t) => t.taskId === taskId);
    },
    [profile]
  );

  /**
   * Calculate current trust score
   */
  const getTrustScore = useCallback((): ITrustScore => {
    if (!profile) {
      return {
        total: 0,
        breakdown: { tasks: 0, verification: 0, security: 0 },
        level: 'minimal',
        completedTasks: 0,
        lastUpdated: Date.now(),
      };
    }

    return calculateTrustScore(profile.tasks);
  }, [profile]);

  /**
   * Export profile as JSON
   */
  const exportProfile = useCallback((): string => {
    if (!profile) {
      return '';
    }

    return JSON.stringify(
      {
        version: '1.0',
        exportedAt: Date.now(),
        profile,
      },
      null,
      2
    );
  }, [profile]);

  return {
    profile,
    isLoading,
    error,
    createProfile,
    loadProfile,
    updateProfile,
    saveProfile,
    deleteProfile,
    updateAccount,
    verifyPin: verifyPinFn,
    completeTask,
    unCompleteTask,
    verifyTask,
    getTaskStatus,
    calculateTrustScore: getTrustScore,
    exportProfile,
  };
}

export default useLocalProfile;

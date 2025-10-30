/**
 * Sync Manager for LifeSync
 * Handles automatic and manual synchronization between local IndexedDB and Firebase
 */

import { guestAccountService } from './guestAccountService';
import { auth, db } from '../config/firebase';
import { doc, getDoc, setDoc, updateDoc, serverTimestamp } from 'firebase/firestore';

export interface SyncPreferences {
  autoSync: boolean;
  manualOnly: boolean;
  selectedCategories: string[];
  lastSync: number | null;
  syncStatus: 'idle' | 'syncing' | 'error' | 'success';
  pendingChanges: number;
}

export interface SyncConflict {
  field: string;
  localValue: any;
  remoteValue: any;
  resolved: boolean;
  resolution?: 'local' | 'remote' | 'merge';
}

export interface SyncResult {
  success: boolean;
  conflicts: SyncConflict[];
  syncedCategories: string[];
  error?: string;
}

class SyncManager {
  private static instance: SyncManager;
  private syncInProgress = false;
  private syncInterval: NodeJS.Timeout | null = null;
  private onlineStatus = navigator.onLine;

  private constructor() {
    this.startNetworkMonitoring();
    this.startAutoSync();
  }

  static getInstance(): SyncManager {
    if (!SyncManager.instance) {
      SyncManager.instance = new SyncManager();
    }
    return SyncManager.instance;
  }

  /**
   * Start monitoring network status
   */
  private startNetworkMonitoring() {
    window.addEventListener('online', () => {
      this.onlineStatus = true;
      this.triggerAutoSync();
    });

    window.addEventListener('offline', () => {
      this.onlineStatus = false;
    });
  }

  /**
   * Start automatic sync interval
   */
  private startAutoSync() {
    // Check every 5 minutes for auto-sync
    this.syncInterval = setInterval(() => {
      this.triggerAutoSync();
    }, 5 * 60 * 1000);
  }

  /**
   * Trigger automatic sync if conditions are met
   */
  private async triggerAutoSync() {
    if (!this.onlineStatus || this.syncInProgress) return;

    try {
      const profiles = await guestAccountService.listLocalProfiles();
      for (const profile of profiles) {
        if (profile.owner?.source === 'firebase' || profile.owner?.uid) {
          const preferences = await this.getSyncPreferences(profile.id);
          if (preferences.autoSync && !preferences.manualOnly) {
            await this.syncProfile(profile.id);
          }
        }
      }
    } catch (error) {
      console.error('Auto-sync failed:', error);
    }
  }

  /**
   * Get sync preferences for a profile
   */
  async getSyncPreferences(profileId: string): Promise<SyncPreferences> {
    const profileData = await guestAccountService.getLocalProfileData(profileId);
    return profileData.syncPreferences || {
      autoSync: true,
      manualOnly: false,
      selectedCategories: ['profile', 'services', 'trustVerification'],
      lastSync: null,
      syncStatus: 'idle',
      pendingChanges: 0
    };
  }

  /**
   * Update sync preferences for a profile
   */
  async updateSyncPreferences(profileId: string, preferences: Partial<SyncPreferences>): Promise<void> {
    const profileData = await guestAccountService.getLocalProfileData(profileId);
    const updatedData = {
      ...profileData,
      syncPreferences: {
        ...profileData.syncPreferences,
        ...preferences
      }
    };
    await guestAccountService.updateLocalProfileData(profileId, updatedData);
  }

  /**
   * Manual sync trigger
   */
  async manualSync(profileId: string): Promise<SyncResult> {
    if (this.syncInProgress) {
      return {
        success: false,
        conflicts: [],
        syncedCategories: [],
        error: 'Sync already in progress'
      };
    }

    return await this.syncProfile(profileId);
  }

  /**
   * Sync a specific profile
   */
  private async syncProfile(profileId: string): Promise<SyncResult> {
    if (!auth.currentUser) {
      return {
        success: false,
        conflicts: [],
        syncedCategories: [],
        error: 'Not authenticated with Firebase'
      };
    }

    this.syncInProgress = true;
    const result: SyncResult = {
      success: false,
      conflicts: [],
      syncedCategories: []
    };

    try {
      await this.updateSyncPreferences(profileId, { syncStatus: 'syncing' });

      const preferences = await this.getSyncPreferences(profileId);
      const localData = await guestAccountService.getLocalProfileData(profileId);

      // Get remote data from Firebase
      const userDocRef = doc(db, 'users', auth.currentUser.uid);
      const userDoc = await getDoc(userDocRef);

      if (!userDoc.exists()) {
        // Create initial remote document
        await setDoc(userDocRef, {
          profile: localData.profile || {},
          services: localData.services || [],
          trustVerification: localData.trustVerification || {},
          lastSync: serverTimestamp(),
          syncedCategories: preferences.selectedCategories
        });
        result.success = true;
        result.syncedCategories = preferences.selectedCategories;
      } else {
        const remoteData = userDoc.data();
        const conflicts: SyncConflict[] = [];

        // Sync selected categories
        for (const category of preferences.selectedCategories) {
          const localValue = localData[category];
          const remoteValue = remoteData[category];

          if (this.hasConflict(localValue, remoteValue)) {
            conflicts.push({
              field: category,
              localValue,
              remoteValue,
              resolved: false
            });
          } else {
            // No conflict, sync the newer data
            await this.syncCategory(userDocRef, category, localValue, remoteValue, localData, remoteData);
            result.syncedCategories.push(category);
          }
        }

        result.conflicts = conflicts;
        result.success = conflicts.length === 0;
      }

      await this.updateSyncPreferences(profileId, {
        lastSync: Date.now(),
        syncStatus: result.success ? 'success' : 'error',
        pendingChanges: result.success ? 0 : preferences.pendingChanges
      });

    } catch (error) {
      console.error('Sync failed:', error);
      result.error = error instanceof Error ? error.message : 'Unknown sync error';
      await this.updateSyncPreferences(profileId, { syncStatus: 'error' });
    } finally {
      this.syncInProgress = false;
    }

    return result;
  }

  /**
   * Check if there's a conflict between local and remote values
   */
  private hasConflict(localValue: any, remoteValue: any): boolean {
    if (!localValue && !remoteValue) return false;
    if (!localValue || !remoteValue) return true;

    // For simple values, compare directly
    if (typeof localValue !== 'object' || typeof remoteValue !== 'object') {
      return localValue !== remoteValue;
    }

    // For objects, check if they're different (simplified conflict detection)
    return JSON.stringify(localValue) !== JSON.stringify(remoteValue);
  }

  /**
   * Sync a specific category
   */
  private async syncCategory(
    userDocRef: any,
    category: string,
    localValue: any,
    remoteValue: any,
    localData: any,
    remoteData: any
  ): Promise<void> {
    // Simple last-write-wins strategy
    const localLastModified = localData.lastModified?.[category] || 0;
    const remoteLastModified = remoteData.lastModified?.[category] || 0;

    if (localLastModified > remoteLastModified) {
      // Local is newer, push to remote
      await updateDoc(userDocRef, {
        [category]: localValue,
        [`lastModified.${category}`]: Date.now(),
        lastSync: serverTimestamp()
      });
    } else {
      // Remote is newer or equal, pull from remote
      const updatedLocalData = {
        ...localData,
        [category]: remoteValue,
        lastModified: {
          ...localData.lastModified,
          [category]: Date.now()
        }
      };
      await guestAccountService.updateLocalProfileData(localData.profileId, updatedLocalData);
    }
  }

  /**
   * Resolve conflicts manually
   */
  async resolveConflicts(profileId: string, resolutions: { [field: string]: 'local' | 'remote' | 'merge' }): Promise<void> {
    const localData = await guestAccountService.getLocalProfileData(profileId);
    const preferences = await this.getSyncPreferences(profileId);

    if (!auth.currentUser) return;

    const userDocRef = doc(db, 'users', auth.currentUser.uid);
    const userDoc = await getDoc(userDocRef);

    if (!userDoc.exists()) return;

    const remoteData = userDoc.data();
    const updates: any = { lastSync: serverTimestamp() };

    for (const [field, resolution] of Object.entries(resolutions)) {
      switch (resolution) {
        case 'local':
          updates[field] = localData[field];
          break;
        case 'remote':
          const updatedLocalData = {
            ...localData,
            [field]: remoteData[field],
            lastModified: {
              ...localData.lastModified,
              [field]: Date.now()
            }
          };
          await guestAccountService.updateLocalProfileData(profileId, updatedLocalData);
          break;
        case 'merge':
          // Implement merge logic based on field type
          const mergedValue = this.mergeValues(localData[field], remoteData[field]);
          updates[field] = mergedValue;
          const updatedMergedData = {
            ...localData,
            [field]: mergedValue,
            lastModified: {
              ...localData.lastModified,
              [field]: Date.now()
            }
          };
          await guestAccountService.updateLocalProfileData(profileId, updatedMergedData);
          break;
      }
      updates[`lastModified.${field}`] = Date.now();
    }

    await updateDoc(userDocRef, updates);
  }

  /**
   * Merge conflicting values (simplified implementation)
   */
  private mergeValues(localValue: any, remoteValue: any): any {
    if (Array.isArray(localValue) && Array.isArray(remoteValue)) {
      // Merge arrays by combining unique items
      return [...new Set([...localValue, ...remoteValue])];
    }

    if (typeof localValue === 'object' && typeof remoteValue === 'object') {
      // Merge objects by taking the union of properties
      return { ...remoteValue, ...localValue };
    }

    // Default to local value
    return localValue;
  }

  /**
   * Increment pending changes counter
   */
  async incrementPendingChanges(profileId: string): Promise<void> {
    const preferences = await this.getSyncPreferences(profileId);
    await this.updateSyncPreferences(profileId, {
      pendingChanges: preferences.pendingChanges + 1
    });
  }

  /**
   * Reset pending changes counter after successful sync
   */
  async resetPendingChanges(profileId: string): Promise<void> {
    await this.updateSyncPreferences(profileId, {
      pendingChanges: 0
    });
  }

  /**
   * Get pending changes count for a profile
   */
  async getPendingChanges(profileId: string): Promise<number> {
    const preferences = await this.getSyncPreferences(profileId);
    return preferences.pendingChanges;
  }
}

export const syncManager = SyncManager.getInstance();
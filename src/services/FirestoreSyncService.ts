// src/services/FirestoreSyncService.ts
// Phase 3 Day 1: Cloud Sync Architecture
// Status: STUB - Ready for Implementation

import { 
  getFirestore, 
  doc, 
  setDoc, 
  updateDoc, 
  deleteDoc,
  collection,
  query,
  where,
  getDocs,
  onSnapshot,
  writeBatch,
  Timestamp,
  QueryConstraint
} from 'firebase/firestore';
import { ILocalProfile } from '../db/profileTypes';
import { db as dexieDb } from '../db/profiles.db';

/**
 * Sync Queue Item - represents a pending operation to sync to cloud
 */
export interface SyncQueueItem {
  id: string;
  action: 'create' | 'update' | 'delete';
  collection: string;
  documentId: string;
  data: any;
  timestamp: number;
  retries: number;
  lastError?: string;
}

/**
 * Sync Configuration Options
 */
export interface SyncConfig {
  maxRetries: number;              // Maximum retry attempts
  retryDelay: number;              // Delay between retries (ms)
  batchSize: number;               // Number of items per batch
  conflictStrategy: 'local' | 'remote' | 'merge'; // How to resolve conflicts
  autoSync: boolean;               // Auto-sync when online
  syncInterval: number;            // Interval to check for sync (ms)
}

/**
 * Conflict Resolution Data
 */
export interface ConflictData {
  documentId: string;
  local: any;
  remote: any;
  localTimestamp: number;
  remoteTimestamp: number;
  resolution: 'local' | 'remote' | 'merged';
}

/**
 * Sync Status
 */
export interface SyncStatus {
  isOnline: boolean;
  isSyncing: boolean;
  pendingItems: number;
  lastSyncTime?: number;
  lastError?: string;
}

/**
 * FirestoreSyncService
 * 
 * Manages bidirectional sync between local Dexie database and Firestore.
 * Features:
 * - Offline queue system for operations when offline
 * - Conflict detection and resolution
 * - Real-time listeners for remote updates
 * - Batch operations for performance
 * - Automatic retry with exponential backoff
 */
export class FirestoreSyncService {
  private firestore = getFirestore();
  private syncQueue: Map<string, SyncQueueItem> = new Map();
  private realtimeListeners: Map<string, () => void> = new Map();
  private config: SyncConfig;
  private syncStatus: SyncStatus;
  private syncTimers: Map<string, number> = new Map();
  
  constructor(config?: Partial<SyncConfig>) {
    this.config = {
      maxRetries: 5,
      retryDelay: 1000,
      batchSize: 25,
      conflictStrategy: 'merge',
      autoSync: true,
      syncInterval: 10000,
      ...config
    };

    this.syncStatus = {
      isOnline: navigator.onLine,
      isSyncing: false,
      pendingItems: 0
    };

    this.setupOnlineOfflineListeners();
  }

  /**
   * Setup online/offline listeners
   */
  private setupOnlineOfflineListeners(): void {
    window.addEventListener('online', () => {
      this.syncStatus.isOnline = true;
      if (this.config.autoSync) {
        this.processSyncQueue();
      }
    });

    window.addEventListener('offline', () => {
      this.syncStatus.isOnline = false;
    });
  }

  /**
   * Get current sync status
   */
  public getStatus(): SyncStatus {
    return { ...this.syncStatus };
  }

  /**
   * Enqueue a sync operation when offline or for batch processing
   */
  public async enqueuSync(
    action: 'create' | 'update' | 'delete',
    collection: string,
    documentId: string,
    data?: any
  ): Promise<void> {
    const queueItem: SyncQueueItem = {
      id: `${collection}/${documentId}/${Date.now()}`,
      action,
      collection,
      documentId,
      data: data || {},
      timestamp: Date.now(),
      retries: 0
    };

    this.syncQueue.set(queueItem.id, queueItem);
    this.syncStatus.pendingItems = this.syncQueue.size;

    // Persist queue to Dexie for recovery
    await this.persistQueueToDb();

    if (this.syncStatus.isOnline && this.config.autoSync) {
      this.processSyncQueue();
    }
  }

  /**
   * Process sync queue items
   */
  public async processSyncQueue(): Promise<void> {
    if (this.syncStatus.isSyncing || this.syncQueue.size === 0) {
      return;
    }

    this.syncStatus.isSyncing = true;

    try {
      const items = Array.from(this.syncQueue.values());
      const batches = this.chunkArray(items, this.config.batchSize);

      for (const batch of batches) {
        await this.processBatch(batch);
      }

      this.syncStatus.lastSyncTime = Date.now();
      this.syncStatus.lastError = undefined;
    } catch (error) {
      this.syncStatus.lastError = String(error);
      console.error('Sync error:', error);
    } finally {
      this.syncStatus.isSyncing = false;
      this.syncStatus.pendingItems = this.syncQueue.size;
    }
  }

  /**
   * Process a batch of sync queue items
   */
  private async processBatch(items: SyncQueueItem[]): Promise<void> {
    const batch = writeBatch(this.firestore);
    const successfulIds: string[] = [];

    for (const item of items) {
      try {
        const docRef = doc(this.firestore, item.collection, item.documentId);

        switch (item.action) {
          case 'create':
          case 'update':
            batch.set(docRef, item.data, { merge: true });
            break;
          case 'delete':
            batch.delete(docRef);
            break;
        }

        successfulIds.push(item.id);
      } catch (error) {
        console.error(`Error processing item ${item.id}:`, error);
        // Increment retry counter
        item.retries++;
        
        if (item.retries >= this.config.maxRetries) {
          this.syncQueue.delete(item.id);
        }
      }
    }

    try {
      await batch.commit();
      // Remove successfully synced items
      successfulIds.forEach(id => this.syncQueue.delete(id));
    } catch (error) {
      console.error('Batch commit error:', error);
      throw error;
    }
  }

  /**
   * Setup real-time listeners for a Firestore collection
   */
  public async setupRealtimeListener(
    collection: string,
    userId: string,
    constraints?: QueryConstraint[]
  ): Promise<() => void> {
    const collectionRef = collection as any;
    const baseConstraints = [where('userId', '==', userId)];
    const allConstraints = [...baseConstraints, ...(constraints || [])];

    const q = query(collectionRef, ...allConstraints);

    const unsubscribe = onSnapshot(q, async (snapshot) => {
      for (const docChange of snapshot.docChanges()) {
        const { type, doc: firestoreDoc } = docChange;

        try {
          await this.handleRemoteUpdate(
            collection,
            firestoreDoc.id,
            firestoreDoc.data(),
            type
          );
        } catch (error) {
          console.error(`Error handling remote update:`, error);
        }
      }
    });

    const listenerId = `${collection}/${userId}`;
    this.realtimeListeners.set(listenerId, unsubscribe);

    return unsubscribe;
  }

  /**
   * Handle updates from Firestore (remote updates)
   */
  private async handleRemoteUpdate(
    collection: string,
    documentId: string,
    data: any,
    changeType: 'added' | 'modified' | 'removed'
  ): Promise<void> {
    try {
      switch (changeType) {
        case 'added':
        case 'modified':
          // Check for conflicts with local changes
          const conflict = await this.checkForConflict(
            collection,
            documentId,
            data
          );

          if (conflict) {
            const resolved = await this.resolveConflict(conflict);
            await this.applyResolution(resolved);
          } else {
            // No conflict, update locally
            await this.updateLocalDocument(collection, documentId, data);
          }
          break;

        case 'removed':
          // Delete locally
          await this.deleteLocalDocument(collection, documentId);
          break;
      }
    } catch (error) {
      console.error('Error handling remote update:', error);
      throw error;
    }
  }

  /**
   * Check if there's a conflict between local and remote data
   */
  private async checkForConflict(
    collection: string,
    documentId: string,
    remoteData: any
  ): Promise<ConflictData | null> {
    try {
      const localData = await this.getLocalDocument(collection, documentId);

      if (!localData) {
        return null; // No local document, no conflict
      }

      // If timestamps are different, potential conflict
      if (localData.version !== remoteData.version) {
        return {
          documentId,
          local: localData,
          remote: remoteData,
          localTimestamp: localData.updatedAt || Date.now(),
          remoteTimestamp: remoteData.updatedAt || Date.now(),
          resolution: 'merged'
        };
      }

      return null;
    } catch (error) {
      console.error('Error checking conflict:', error);
      return null;
    }
  }

  /**
   * Resolve conflict based on configured strategy
   */
  private async resolveConflict(conflict: ConflictData): Promise<ConflictData> {
    switch (this.config.conflictStrategy) {
      case 'local':
        // Keep local version
        conflict.resolution = 'local';
        break;

      case 'remote':
        // Use remote version
        conflict.resolution = 'remote';
        break;

      case 'merge':
        // Merge local and remote
        conflict.resolution = 'merged';
        conflict.local = await this.mergeData(
          conflict.local,
          conflict.remote
        );
        break;
    }

    return conflict;
  }

  /**
   * Merge local and remote data
   */
  private async mergeData(local: any, remote: any): Promise<any> {
    // Deep merge strategy - remote changes override local for most fields
    // but preserve local changes for user-edited fields
    const merged = {
      ...remote,
      ...local,
      version: Math.max(local.version || 0, remote.version || 0) + 1,
      mergedAt: Date.now()
    };

    return merged;
  }

  /**
   * Apply conflict resolution
   */
  private async applyResolution(conflict: ConflictData): Promise<void> {
    switch (conflict.resolution) {
      case 'local':
        // Re-enqueue local version for sync
        await this.enqueuSync('update', 'profiles', conflict.documentId, conflict.local);
        break;

      case 'remote':
        // Update local with remote
        await this.updateLocalDocument('profiles', conflict.documentId, conflict.remote);
        break;

      case 'merged':
        // Update both local and remote
        await this.updateLocalDocument('profiles', conflict.documentId, conflict.local);
        await this.enqueuSync('update', 'profiles', conflict.documentId, conflict.local);
        break;
    }
  }

  /**
   * Sync a user's complete profile
   */
  public async syncProfile(userId: string): Promise<void> {
    try {
      const localProfile = await this.getLocalProfile(userId);

      if (!localProfile) {
        console.warn('No local profile found for sync');
        return;
      }

      // Enqueue profile update
      await this.enqueuSync('update', 'profiles', userId, {
        ...localProfile,
        updatedAt: Timestamp.now()
      });

      // Process immediately if online
      if (this.syncStatus.isOnline) {
        await this.processSyncQueue();
      }
    } catch (error) {
      console.error('Error syncing profile:', error);
      throw error;
    }
  }

  /**
   * Sync verifications for a user
   */
  public async syncVerifications(userId: string): Promise<void> {
    try {
      const profile = await this.getLocalProfile(userId);

      if (!profile || !profile.profile) {
        return;
      }

      // Enqueue verification records
      const verifications = [
        {
          type: 'email',
          value: profile.account?.email,
          status: profile.profile?.verifications?.emailVerified ? 'verified' : 'pending'
        },
        {
          type: 'phone',
          value: profile.profile?.contactInfo?.phone,
          status: profile.profile?.verifications?.phoneVerified ? 'verified' : 'pending'
        }
      ];

      for (const verification of verifications) {
        if (verification.value) {
          await this.enqueuSync(
            'update',
            'verifications',
            `${userId}_${verification.type}`,
            {
              userId,
              ...verification,
              updatedAt: Timestamp.now()
            }
          );
        }
      }

      if (this.syncStatus.isOnline) {
        await this.processSyncQueue();
      }
    } catch (error) {
      console.error('Error syncing verifications:', error);
      throw error;
    }
  }

  /**
   * Sync trust scores
   */
  public async syncTrustScores(userId: string): Promise<void> {
    try {
      const profile = await this.getLocalProfile(userId);

      if (!profile) {
        return;
      }

      const trustScore = await this.calculateTrustScore(profile);

      await this.enqueuSync(
        'update',
        'trust_scores',
        userId,
        {
          userId,
          ...trustScore,
          calculatedAt: Timestamp.now()
        }
      );

      if (this.syncStatus.isOnline) {
        await this.processSyncQueue();
      }
    } catch (error) {
      console.error('Error syncing trust scores:', error);
      throw error;
    }
  }

  /**
   * Helper: Update local document
   */
  private async updateLocalDocument(
    collection: string,
    documentId: string,
    data: any
  ): Promise<void> {
    // TODO: Update Dexie database
    console.log(`Update local ${collection}/${documentId}`, data);
  }

  /**
   * Helper: Delete local document
   */
  private async deleteLocalDocument(
    collection: string,
    documentId: string
  ): Promise<void> {
    // TODO: Delete from Dexie database
    console.log(`Delete local ${collection}/${documentId}`);
  }

  /**
   * Helper: Get local document
   */
  private async getLocalDocument(
    collection: string,
    documentId: string
  ): Promise<any> {
    // TODO: Read from Dexie database
    return null;
  }

  /**
   * Helper: Get local profile
   */
  private async getLocalProfile(userId: string): Promise<ILocalProfile | null> {
    try {
      const profile = await dexieDb.profiles.get(userId);
      return profile || null;
    } catch (error) {
      console.error('Error getting local profile:', error);
      return null;
    }
  }

  /**
   * Helper: Calculate trust score
   */
  private async calculateTrustScore(profile: ILocalProfile): Promise<any> {
    // TODO: Implement trust score calculation
    return {
      totalScore: 50,
      level: 'basic',
      categories: {
        contact: 10,
        verification: 15,
        identity: 10,
        security: 15,
        services: 0
      }
    };
  }

  /**
   * Helper: Chunk array into batches
   */
  private chunkArray<T>(array: T[], size: number): T[][] {
    const chunks: T[][] = [];
    for (let i = 0; i < array.length; i += size) {
      chunks.push(array.slice(i, i + size));
    }
    return chunks;
  }

  /**
   * Helper: Persist queue to Dexie for recovery
   */
  private async persistQueueToDb(): Promise<void> {
    // TODO: Persist to Dexie for recovery after restart
    console.log('Persisting sync queue...');
  }

  /**
   * Cleanup - unsubscribe from all listeners
   */
  public cleanup(): void {
    this.realtimeListeners.forEach(unsubscribe => unsubscribe());
    this.realtimeListeners.clear();

    this.syncTimers.forEach(timerId => clearInterval(timerId));
    this.syncTimers.clear();
  }

  /**
   * Destroy service
   */
  public destroy(): void {
    this.cleanup();
  }
}

// Export singleton instance
export const firestoreSyncService = new FirestoreSyncService({
  maxRetries: 5,
  retryDelay: 1000,
  batchSize: 25,
  conflictStrategy: 'merge',
  autoSync: true,
  syncInterval: 10000
});

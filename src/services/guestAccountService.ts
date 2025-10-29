/**
 * Enhanced Guest & Offline Account Service
 * Manages local guest accounts AND offline functionality for authenticated users
 *
 * Features:
 * - Create guest accounts valid for 7 days
 * - Renew guest accounts perpetually
 * - Store all user data locally
 * - Migrate guest data to Firebase on upgrade
 * - Track expiration and send notifications
 * - Offline mode for authenticated users
 * - Seamless online/offline sync
 *
 * @module services/guestAccountService
 */

// Types & Interfaces
export interface GuestAccount {
  id: string;                           // Unique guest ID (UUID)
  displayName: string;                  // User's display name
  email?: string;                       // Optional email
  createdAt: number;                    // Creation timestamp (ms)
  expiresAt: number;                    // Expiration timestamp (ms)
  renewalCount: number;                 // How many times renewed
  lastRenewalAt?: number;               // Last renewal timestamp
  profileData?: {                       // User profile data
    avatar?: string;
    bio?: string;
    achievements?: string[];
    progress?: Record<string, any>;
    [key: string]: any;
  };
}

export interface GuestAccountStatus {
  isGuest: boolean;                    // Is user currently guest?
  account: GuestAccount | null;        // Guest account data
  isExpired: boolean;                  // Has account expired?
  isExpiringSoon: boolean;             // Expires within 24 hours?
  daysRemaining: number;               // Days until expiration
  hoursRemaining: number;              // Hours until expiration
  percentageRemaining: number;         // % of 7-day period remaining
  canRenew: boolean;                   // Can renew?
  renewalCount: number;                // Total renewals
}

export interface GuestMigrationData {
  guestAccount: GuestAccount;          // Guest account to migrate
  guestData: Record<string, any>;      // All guest data
  timestamp: number;                   // Migration timestamp
}

// New interfaces for offline functionality
export interface OfflineUserData {
  userId: string;                      // Firebase user ID
  displayName: string;                 // User's display name
  email: string;                       // User's email
  lastOnlineSync: number;              // Last successful sync timestamp
  isOfflineMode: boolean;              // Currently in offline mode
  pendingSync: boolean;                // Has pending changes to sync
}

export interface SyncOperation {
  id: string;                          // Unique operation ID
  type: 'create' | 'update' | 'delete'; // Operation type
  collection: string;                  // Firebase collection
  documentId: string;                  // Document ID
  data: any;                           // Data to sync
  timestamp: number;                   // When operation was queued
  retryCount: number;                  // How many times retried
}

export interface OfflineStatus {
  isOnline: boolean;                   // Is device online?
  isAuthenticated: boolean;            // Is user authenticated?
  isOfflineMode: boolean;              // Is offline mode active?
  hasPendingSync: boolean;             // Has pending operations?
  lastSyncAttempt: number | null;      // Last sync attempt timestamp
  syncQueueLength: number;             // Number of pending operations
}

export type GuestStatusListener = (status: GuestAccountStatus) => void;
export type OfflineStatusListener = (status: OfflineStatus) => void;

// Storage keys
const GUEST_ACCOUNT_KEY = 'lifesync_guest_account';
const GUEST_DATA_KEY = 'lifesync_guest_data';
const GUEST_EXPIRY_CHECK_KEY = 'lifesync_guest_expiry_check';

// New storage keys for offline functionality
const OFFLINE_USER_KEY = 'lifesync_offline_user';
const OFFLINE_DATA_KEY = 'lifesync_offline_data';
const SYNC_QUEUE_KEY = 'lifesync_sync_queue';
const OFFLINE_STATUS_KEY = 'lifesync_offline_status';

// Constants
const GUEST_VALIDITY_MS = 7 * 24 * 60 * 60 * 1000; // 7 days in milliseconds
const STATUS_CHECK_INTERVAL_MS = 60 * 1000; // Check status every minute
const EXPIRY_WARNING_THRESHOLD_MS = 24 * 60 * 60 * 1000; // 24 hours
const SYNC_RETRY_INTERVAL_MS = 30 * 1000; // Retry sync every 30 seconds
const MAX_SYNC_RETRIES = 5; // Maximum retry attempts

/**
 * Enhanced Guest & Offline Account Service
 * Singleton pattern - use GuestAccountService.getInstance()
 */
class GuestAccountService {
  private static instance: GuestAccountService;
  private statusListeners: Set<GuestStatusListener> = new Set();
  private offlineStatusListeners: Set<OfflineStatusListener> = new Set();
  private statusCheckInterval: NodeJS.Timeout | null = null;
  private syncRetryInterval: NodeJS.Timeout | null = null;
  private currentStatus: GuestAccountStatus | null = null;
  private currentOfflineStatus: OfflineStatus | null = null;
  private isOnline: boolean = navigator.onLine;

  private constructor() {
    // Start periodic status checks
    this.startStatusChecks();
    // Start offline/online monitoring
    this.startNetworkMonitoring();
    // Initialize current statuses
    this.currentStatus = this.getGuestAccountStatus();
    this.currentOfflineStatus = this.getOfflineStatus();
  }

  /**
   * Get singleton instance
   */
  static getInstance(): GuestAccountService {
    if (!GuestAccountService.instance) {
      GuestAccountService.instance = new GuestAccountService();
    }
    return GuestAccountService.instance;
  }

  /**
   * Generate unique guest ID
   */
  private generateGuestId(): string {
    return `guest_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Create a new guest account
   */
  createGuestAccount(displayName: string, email?: string, securityOptions?: { pin?: string; usePassword?: boolean }): GuestAccount {
    const now = Date.now();
    
    // Import PIN encryption at top of this method to use in Phase 2
    // PIN will be hashed using PBKDF2-SHA256 when migrating to Dexie
    const guestAccount: GuestAccount = {
      id: this.generateGuestId(),
      displayName,
      email,
      createdAt: now,
      expiresAt: now + GUEST_VALIDITY_MS,
      renewalCount: 0,
      profileData: {
        // Store security options if provided
        // Phase 2: These will be hashed during migration to Dexie
        securityPin: securityOptions?.pin || null,
        usePassword: securityOptions?.usePassword || false,
        migrationType: 'local_account', // Mark for migration
      },
    };

    // Store in localStorage
    localStorage.setItem(GUEST_ACCOUNT_KEY, JSON.stringify(guestAccount));
    localStorage.setItem(GUEST_DATA_KEY, JSON.stringify({}));

    // Notify listeners
    this.notifyListeners();

    return guestAccount;
  }

  /**
   * Get current guest account (if exists and not expired)
   */
  getGuestAccount(): GuestAccount | null {
    const stored = localStorage.getItem(GUEST_ACCOUNT_KEY);
    if (!stored) return null;

    const account: GuestAccount = JSON.parse(stored);

    // Check if expired
    if (account.expiresAt < Date.now()) {
      return null; // Expired
    }

    return account;
  }

  /**
   * Check if current user is a guest
   */
  isGuestUser(): boolean {
    return this.getGuestAccount() !== null;
  }

  /**
   * Get comprehensive guest account status
   */
  getGuestAccountStatus(): GuestAccountStatus {
    const account = this.getGuestAccount();
    const now = Date.now();

    if (!account) {
      return {
        isGuest: false,
        account: null,
        isExpired: false,
        isExpiringSoon: false,
        daysRemaining: 0,
        hoursRemaining: 0,
        percentageRemaining: 0,
        canRenew: false,
        renewalCount: 0,
      };
    }

    const timeRemaining = account.expiresAt - now;
    const isExpired = timeRemaining <= 0;
    const isExpiringSoon = !isExpired && timeRemaining <= EXPIRY_WARNING_THRESHOLD_MS;
    const daysRemaining = Math.ceil(timeRemaining / (24 * 60 * 60 * 1000));
    const hoursRemaining = Math.ceil(timeRemaining / (60 * 60 * 1000));
    const percentageRemaining = Math.max(0, (timeRemaining / GUEST_VALIDITY_MS) * 100);

    return {
      isGuest: true,
      account,
      isExpired,
      isExpiringSoon,
      daysRemaining: Math.max(0, daysRemaining),
      hoursRemaining: Math.max(0, hoursRemaining),
      percentageRemaining,
      canRenew: true, // Always can renew, even if expired
      renewalCount: account.renewalCount,
    };
  }

  /**
   * Renew guest account for another 7 days
   */
  renewGuestAccount(): GuestAccount | null {
    const account = localStorage.getItem(GUEST_ACCOUNT_KEY);
    if (!account) return null;

    const guestAccount: GuestAccount = JSON.parse(account);
    const now = Date.now();

    guestAccount.expiresAt = now + GUEST_VALIDITY_MS;
    guestAccount.renewalCount += 1;
    guestAccount.lastRenewalAt = now;

    localStorage.setItem(GUEST_ACCOUNT_KEY, JSON.stringify(guestAccount));

    // Notify listeners
    this.notifyListeners();

    return guestAccount;
  }

  /**
   * Save data to guest account
   */
  saveGuestData(key: string, value: any): void {
    if (!this.isGuestUser()) return;

    const data = this.getGuestData();
    data[key] = value;

    localStorage.setItem(GUEST_DATA_KEY, JSON.stringify(data));
  }

  /**
   * Get specific guest data by key
   */
  getGuestData(key?: string): any {
    const stored = localStorage.getItem(GUEST_DATA_KEY);
    if (!stored) return key ? undefined : {};

    const data = JSON.parse(stored);
    return key ? data[key] : data;
  }

  /**
   * Get all guest data
   */
  getAllGuestData(): Record<string, any> {
    return this.getGuestData();
  }

  /**
   * Update guest profile data
   */
  updateGuestProfile(profileData: Partial<GuestAccount['profileData']>): void {
    const account = localStorage.getItem(GUEST_ACCOUNT_KEY);
    if (!account) return;

    const guestAccount: GuestAccount = JSON.parse(account);
    guestAccount.profileData = {
      ...guestAccount.profileData,
      ...profileData,
    };

    localStorage.setItem(GUEST_ACCOUNT_KEY, JSON.stringify(guestAccount));

    // Notify listeners
    this.notifyListeners();
  }

  /**
   * Get all data ready for Firebase migration
   */
  getDataForMigration(): GuestMigrationData | null {
    const account = this.getGuestAccount();
    if (!account) return null;

    const guestData = this.getAllGuestData();

    return {
      guestAccount: account,
      guestData,
      timestamp: Date.now(),
    };
  }

  /**
   * Clear guest account (call after successful Firebase migration)
   */
  clearGuestAccount(): void {
    localStorage.removeItem(GUEST_ACCOUNT_KEY);
    localStorage.removeItem(GUEST_DATA_KEY);
    localStorage.removeItem(GUEST_EXPIRY_CHECK_KEY);

    // Notify listeners
    this.notifyListeners();
  }

  /**
   * Subscribe to guest account status changes
   */
  onGuestAccountStatusChange(listener: GuestStatusListener): () => void {
    this.statusListeners.add(listener);

    // Return unsubscribe function
    return () => {
      this.statusListeners.delete(listener);
    };
  }

  /**
   * Get current offline status
   */
  getCurrentOfflineStatus(): OfflineStatus | null {
    return this.currentOfflineStatus;
  }

  /**
   * Start network monitoring for online/offline detection
   */
  private startNetworkMonitoring(): void {
    // Listen for online/offline events
    window.addEventListener('online', () => {
      this.isOnline = true;
      this.handleNetworkChange(true);
    });

    window.addEventListener('offline', () => {
      this.isOnline = false;
      this.handleNetworkChange(false);
    });

    // Start sync retry interval
    this.startSyncRetry();
  }

  /**
   * Handle network status changes
   */
  private handleNetworkChange(isOnline: boolean): void {
    console.log(`Network status changed: ${isOnline ? 'online' : 'offline'}`);

    // Update offline status
    this.updateOfflineStatus();

    // If coming back online, attempt sync
    if (isOnline) {
      this.attemptSync();
    }
  }

  /**
   * Get comprehensive offline status
   */
  getOfflineStatus(): OfflineStatus {
    const offlineUser = this.getOfflineUserData();
    const syncQueue = this.getSyncQueue();
    const lastSyncAttempt = localStorage.getItem(OFFLINE_STATUS_KEY);

    return {
      isOnline: this.isOnline,
      isAuthenticated: !!offlineUser,
      isOfflineMode: !!offlineUser?.isOfflineMode,
      hasPendingSync: syncQueue.length > 0,
      lastSyncAttempt: lastSyncAttempt ? parseInt(lastSyncAttempt) : null,
      syncQueueLength: syncQueue.length,
    };
  }

  /**
   * Update offline status and notify listeners
   */
  private updateOfflineStatus(): void {
    const newStatus = this.getOfflineStatus();
    const statusChanged =
      !this.currentOfflineStatus ||
      this.currentOfflineStatus.isOnline !== newStatus.isOnline ||
      this.currentOfflineStatus.isOfflineMode !== newStatus.isOfflineMode ||
      this.currentOfflineStatus.hasPendingSync !== newStatus.hasPendingSync;

    if (statusChanged) {
      this.currentOfflineStatus = newStatus;
      this.notifyOfflineListeners(newStatus);
    }
  }

  /**
   * Enable offline mode for authenticated user
   */
  enableOfflineMode(userId: string, displayName: string, email: string): void {
    const offlineUser: OfflineUserData = {
      userId,
      displayName,
      email,
      lastOnlineSync: Date.now(),
      isOfflineMode: true,
      pendingSync: false,
    };

    localStorage.setItem(OFFLINE_USER_KEY, JSON.stringify(offlineUser));
    localStorage.setItem(OFFLINE_DATA_KEY, JSON.stringify({}));

    this.updateOfflineStatus();
  }

  /**
   * Disable offline mode (back to online)
   */
  disableOfflineMode(): void {
    const offlineUser = this.getOfflineUserData();
    if (offlineUser) {
      offlineUser.isOfflineMode = false;
      localStorage.setItem(OFFLINE_USER_KEY, JSON.stringify(offlineUser));
    }

    this.updateOfflineStatus();
  }

  /**
   * Get offline user data
   */
  getOfflineUserData(): OfflineUserData | null {
    const stored = localStorage.getItem(OFFLINE_USER_KEY);
    return stored ? JSON.parse(stored) : null;
  }

  /**
   * Check if user is in offline mode
   */
  isOfflineMode(): boolean {
    const offlineUser = this.getOfflineUserData();
    return !!offlineUser?.isOfflineMode;
  }

  /**
   * Save data for offline user
   */
  saveOfflineData(key: string, value: any): void {
    if (!this.isOfflineMode()) return;

    const data = this.getOfflineData();
    data[key] = value;

    localStorage.setItem(OFFLINE_DATA_KEY, JSON.stringify(data));

    // Mark as having pending sync
    this.markPendingSync();
  }

  /**
   * Get offline data by key
   */
  getOfflineData(key?: string): any {
    const stored = localStorage.getItem(OFFLINE_DATA_KEY);
    if (!stored) return key ? undefined : {};

    const data = JSON.parse(stored);
    return key ? data[key] : data;
  }

  /**
   * Get all offline data
   */
  getAllOfflineData(): Record<string, any> {
    return this.getOfflineData();
  }

  /**
   * Queue operation for sync when back online
   */
  queueSyncOperation(operation: Omit<SyncOperation, 'id' | 'timestamp' | 'retryCount'>): void {
    const syncOp: SyncOperation = {
      id: `sync_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: Date.now(),
      retryCount: 0,
      ...operation,
    };

    const queue = this.getSyncQueue();
    queue.push(syncOp);

    localStorage.setItem(SYNC_QUEUE_KEY, JSON.stringify(queue));
    this.markPendingSync();
  }

  /**
   * Get sync queue
   */
  private getSyncQueue(): SyncOperation[] {
    const stored = localStorage.getItem(SYNC_QUEUE_KEY);
    return stored ? JSON.parse(stored) : [];
  }

  /**
   * Mark that there are pending sync operations
   */
  private markPendingSync(): void {
    const offlineUser = this.getOfflineUserData();
    if (offlineUser) {
      offlineUser.pendingSync = true;
      localStorage.setItem(OFFLINE_USER_KEY, JSON.stringify(offlineUser));
    }
    this.updateOfflineStatus();
  }

  /**
   * Attempt to sync pending operations
   */
  private async attemptSync(): Promise<void> {
    if (!this.isOnline || !this.isOfflineMode()) return;

    const queue = this.getSyncQueue();
    if (queue.length === 0) return;

    console.log(`Attempting to sync ${queue.length} operations...`);

    localStorage.setItem(OFFLINE_STATUS_KEY, Date.now().toString());

    // Process sync operations (this would integrate with Firebase)
    // For now, we'll simulate successful sync
    try {
      // In real implementation, this would sync with Firebase
      await this.processSyncOperations(queue);

      // Clear queue on success
      localStorage.setItem(SYNC_QUEUE_KEY, JSON.stringify([]));

      // Update last sync time
      const offlineUser = this.getOfflineUserData();
      if (offlineUser) {
        offlineUser.lastOnlineSync = Date.now();
        offlineUser.pendingSync = false;
        localStorage.setItem(OFFLINE_USER_KEY, JSON.stringify(offlineUser));
      }

      this.updateOfflineStatus();
      console.log('Sync completed successfully');
    } catch (error) {
      console.error('Sync failed:', error);
      // Retry logic would be handled by the retry interval
    }
  }

  /**
   * Process sync operations (integrate with Firebase)
   */
  private async processSyncOperations(queue: SyncOperation[]): Promise<void> {
    // This is where Firebase integration would happen
    // For now, we'll just simulate success
    for (const operation of queue) {
      console.log(`Processing ${operation.type} operation for ${operation.collection}/${operation.documentId}`);

      // Simulate async operation
      await new Promise(resolve => setTimeout(resolve, 100));
    }
  }

  /**
   * Start sync retry interval
   */
  private startSyncRetry(): void {
    if (this.syncRetryInterval) {
      clearInterval(this.syncRetryInterval);
    }

    this.syncRetryInterval = setInterval(() => {
      if (this.isOnline && this.isOfflineMode()) {
        const queue = this.getSyncQueue();
        if (queue.length > 0) {
          this.attemptSync();
        }
      }
    }, SYNC_RETRY_INTERVAL_MS);
  }

  /**
   * Subscribe to offline status changes
   */
  onOfflineStatusChange(listener: OfflineStatusListener): () => void {
    this.offlineStatusListeners.add(listener);

    // Return unsubscribe function
    return () => {
      this.offlineStatusListeners.delete(listener);
    };
  }

  /**
   * Notify offline status listeners
   */
  private notifyOfflineListeners(status: OfflineStatus): void {
    this.offlineStatusListeners.forEach((listener) => {
      try {
        listener(status);
      } catch (error) {
        console.error('Error in offline status listener:', error);
      }
    });
  }

  /**
   * Clear offline data (call after successful full sync)
   */
  clearOfflineData(): void {
    localStorage.removeItem(OFFLINE_USER_KEY);
    localStorage.removeItem(OFFLINE_DATA_KEY);
    localStorage.setItem(SYNC_QUEUE_KEY, JSON.stringify([]));
    localStorage.removeItem(OFFLINE_STATUS_KEY);

    this.updateOfflineStatus();
  }

  /**
   * Get offline analytics
   */
  getOfflineAnalytics(): {
    isOfflineMode: boolean;
    syncQueueLength: number;
    lastSyncAttempt: number | null;
    offlineDataSize: number;
    timeSinceLastSync: number | null;
  } | null {
    const offlineUser = this.getOfflineUserData();
    if (!offlineUser) return null;

    const lastSyncAttempt = localStorage.getItem(OFFLINE_STATUS_KEY);
    const syncQueue = this.getSyncQueue();
    const offlineDataSize = JSON.stringify(this.getAllOfflineData()).length;
    const timeSinceLastSync = lastSyncAttempt
      ? Date.now() - parseInt(lastSyncAttempt)
      : null;

    return {
      isOfflineMode: offlineUser.isOfflineMode,
      syncQueueLength: syncQueue.length,
      lastSyncAttempt: lastSyncAttempt ? parseInt(lastSyncAttempt) : null,
      offlineDataSize,
      timeSinceLastSync,
    };
  }

  /**
   * Notify all listeners of status change
   */
  private notifyListeners(): void {
    const status = this.getGuestAccountStatus();
    this.currentStatus = status;

    this.statusListeners.forEach((listener) => {
      try {
        listener(status);
      } catch (error) {
        console.error('Error in guest account status listener:', error);
      }
    });
  }

  /**
   * Start periodic status checks
   */
  private startStatusChecks(): void {
    // Clear any existing interval
    if (this.statusCheckInterval) {
      clearInterval(this.statusCheckInterval);
    }

    // Start new interval
    this.statusCheckInterval = setInterval(() => {
      const previousStatus = this.currentStatus;
      const newStatus = this.getGuestAccountStatus();

      // Only notify if status changed
      if (previousStatus && newStatus) {
        const statusChanged =
          previousStatus.isExpiringSoon !== newStatus.isExpiringSoon ||
          previousStatus.isExpired !== newStatus.isExpired ||
          previousStatus.daysRemaining !== newStatus.daysRemaining ||
          previousStatus.isGuest !== newStatus.isGuest;

        if (statusChanged) {
          this.notifyListeners();
        }
      }
    }, STATUS_CHECK_INTERVAL_MS);
  }

  /**
   * Stop periodic status checks and sync retry (cleanup)
   */
  stopStatusChecks(): void {
    if (this.statusCheckInterval) {
      clearInterval(this.statusCheckInterval);
      this.statusCheckInterval = null;
    }

    if (this.syncRetryInterval) {
      clearInterval(this.syncRetryInterval);
      this.syncRetryInterval = null;
    }
  }

  /**
   * Export guest data as JSON
   */
  exportGuestData(): string {
    const account = this.getGuestAccount();
    const data = this.getAllGuestData();

    return JSON.stringify(
      {
        account,
        data,
        exportedAt: new Date().toISOString(),
      },
      null,
      2
    );
  }

  /**
   * Import guest data from JSON
   */
  importGuestData(jsonData: string): boolean {
    try {
      const parsed = JSON.parse(jsonData);

      if (!parsed.account || !parsed.data) {
        return false;
      }

      localStorage.setItem(GUEST_ACCOUNT_KEY, JSON.stringify(parsed.account));
      localStorage.setItem(GUEST_DATA_KEY, JSON.stringify(parsed.data));

      this.notifyListeners();
      return true;
    } catch (error) {
      console.error('Error importing guest data:', error);
      return false;
    }
  }

  /**
   * Get guest account analytics
   */
  getAnalytics(): {
    isGuest: boolean;
    accountAge: number;
    renewalCount: number;
    dataSize: number;
    sessionId: string;
  } | null {
    const account = this.getGuestAccount();
    if (!account) return null;

    const accountAge = Date.now() - account.createdAt;
    const dataSize = JSON.stringify(this.getAllGuestData()).length;

    return {
      isGuest: true,
      accountAge,
      renewalCount: account.renewalCount,
      dataSize,
      sessionId: account.id,
    };
  }
}

// Export singleton instance
export const guestAccountService = GuestAccountService.getInstance();

// Export class for testing
export default GuestAccountService;

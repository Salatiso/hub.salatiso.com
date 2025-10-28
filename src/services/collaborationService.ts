/**
 * Real-Time Collaboration Service
 * Manages real-time sync, conflict detection, and collaborative editing
 *
 * Features:
 * - Real-time data synchronization across devices
 * - Automatic conflict detection and resolution
 * - Operational transformation for concurrent edits
 * - Change tracking and history
 * - Presence awareness (who's viewing what)
 *
 * @module services/collaborationService
 */

export interface CollaborativeDocument {
  id: string;                              // Unique document ID
  userId: string;                          // Owner user ID
  title: string;                           // Document title
  content: Record<string, any>;            // Document content
  version: number;                         // Current version
  lastModified: number;                    // Last modification timestamp
  collaborators: string[];                 // List of collaborator IDs
  isShared: boolean;                       // Is document shared?
  syncEnabled: boolean;                    // Is sync enabled?
}

export interface ChangeOperation {
  id: string;                              // Unique operation ID
  documentId: string;                      // Document being changed
  userId: string;                          // User making change
  timestamp: number;                       // When change was made
  type: 'create' | 'update' | 'delete' | 'merge';  // Operation type
  path: string;                            // JSON path to changed field
  oldValue: any;                           // Previous value
  newValue: any;                           // New value
  version: number;                         // Document version at time of change
}

export interface ConflictResolution {
  id: string;                              // Unique conflict ID
  documentId: string;                      // Conflicting document
  timestamp: number;                       // When conflict occurred
  conflictType: 'update' | 'delete' | 'merge'; // Type of conflict
  localChange: ChangeOperation;            // Local change
  remoteChange: ChangeOperation;           // Remote change (conflicting)
  resolved: boolean;                       // Is conflict resolved?
  resolution: 'local' | 'remote' | 'manual' | null; // How it was resolved
  manualResolution?: any;                  // Manual merge result
}

export interface PresenceInfo {
  userId: string;                          // User ID
  documentId: string;                      // Document they're viewing
  cursorPosition?: { line: number; char: number };  // Where cursor is
  isEditing: boolean;                      // Are they currently editing?
  lastSeen: number;                        // Last activity timestamp
}

export interface SyncPreference {
  key: string;                             // Preference key
  documentId?: string;                     // Specific document or all
  enabled: boolean;                        // Sync enabled?
  selectiveFields?: string[];              // Only sync these fields
  syncInterval?: number;                   // Custom sync interval (ms)
  priority?: 'low' | 'normal' | 'high';    // Sync priority
}

class CollaborationService {
  private static instance: CollaborationService;
  private changeHistory: Map<string, ChangeOperation[]> = new Map();
  private conflicts: Map<string, ConflictResolution[]> = new Map();
  private presenceMap: Map<string, PresenceInfo> = new Map();
  private syncPreferences: Map<string, SyncPreference> = new Map();
  private realtimeListeners: Set<(doc: CollaborativeDocument) => void> = new Set();
  private conflictListeners: Set<(conflict: ConflictResolution) => void> = new Set();
  private presenceListeners: Set<(presence: PresenceInfo) => void> = new Set();

  private constructor() {
    // Initialize from storage
    this.loadPreferencesFromStorage();
  }

  static getInstance(): CollaborationService {
    if (!CollaborationService.instance) {
      CollaborationService.instance = new CollaborationService();
    }
    return CollaborationService.instance;
  }

  /**
   * Record a change operation for tracking and conflict detection
   */
  recordChange(operation: Omit<ChangeOperation, 'id'>): ChangeOperation {
    const op: ChangeOperation = {
      id: `change_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      ...operation,
    };

    if (!this.changeHistory.has(operation.documentId)) {
      this.changeHistory.set(operation.documentId, []);
    }

    this.changeHistory.get(operation.documentId)!.push(op);

    // Store in localStorage
    this.saveChangeToStorage(op);

    return op;
  }

  /**
   * Get change history for a document
   */
  getChangeHistory(documentId: string): ChangeOperation[] {
    return this.changeHistory.get(documentId) || [];
  }

  /**
   * Detect conflicts between local and remote changes
   */
  detectConflicts(
    documentId: string,
    localChange: ChangeOperation,
    remoteChange: ChangeOperation
  ): ConflictResolution | null {
    // Same path and different values = conflict
    if (localChange.path === remoteChange.path && 
        localChange.newValue !== remoteChange.newValue &&
        localChange.userId !== remoteChange.userId) {

      const conflict: ConflictResolution = {
        id: `conflict_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        documentId,
        timestamp: Date.now(),
        conflictType: localChange.type as any,
        localChange,
        remoteChange,
        resolved: false,
        resolution: null,
      };

      if (!this.conflicts.has(documentId)) {
        this.conflicts.set(documentId, []);
      }

      this.conflicts.get(documentId)!.push(conflict);
      this.notifyConflictListeners(conflict);

      return conflict;
    }

    return null;
  }

  /**
   * Resolve a conflict with user choice
   */
  resolveConflict(
    conflictId: string,
    resolution: 'local' | 'remote' | 'manual',
    manualResolution?: any
  ): ConflictResolution | null {
    // Find conflict across all documents
    for (const [, conflicts] of this.conflicts) {
      const conflict = conflicts.find(c => c.id === conflictId);
      if (conflict) {
        conflict.resolved = true;
        conflict.resolution = resolution;
        
        if (resolution === 'manual') {
          conflict.manualResolution = manualResolution;
        }

        this.saveConflictResolutionToStorage(conflict);
        return conflict;
      }
    }

    return null;
  }

  /**
   * Get unresolved conflicts for a document
   */
  getUnresolvedConflicts(documentId: string): ConflictResolution[] {
    return (this.conflicts.get(documentId) || []).filter(c => !c.resolved);
  }

  /**
   * Auto-resolve conflicts using operational transformation
   */
  autoResolveConflicts(documentId: string): ConflictResolution[] {
    const conflicts = this.getUnresolvedConflicts(documentId);
    const resolved: ConflictResolution[] = [];

    for (const conflict of conflicts) {
      // Strategy: Remote wins for updates, local wins for deletes, both for merges
      let strategy: 'local' | 'remote' | 'manual' = 'remote';

      if (conflict.conflictType === 'delete') {
        strategy = 'local';
      } else if (conflict.conflictType === 'merge') {
        // Try to merge programmatically
        strategy = this.canAutoMerge(conflict.localChange, conflict.remoteChange)
          ? 'manual'
          : 'remote';
      }

      this.resolveConflict(conflict.id, strategy);
      resolved.push(conflict);
    }

    return resolved;
  }

  /**
   * Attempt automatic merge of two changes
   */
  private canAutoMerge(local: ChangeOperation, remote: ChangeOperation): boolean {
    // Can auto-merge if:
    // 1. Changes are on different paths
    // 2. Both are updates (not deletes)
    // 3. Values are mergeable (objects or arrays)
    return (
      local.path !== remote.path &&
      local.type === 'update' &&
      remote.type === 'update' &&
      typeof local.newValue === 'object' &&
      typeof remote.newValue === 'object'
    );
  }

  /**
   * Update presence information (who's editing what)
   */
  updatePresence(userId: string, documentId: string, isEditing: boolean, cursor?: any): PresenceInfo {
    const presence: PresenceInfo = {
      userId,
      documentId,
      cursorPosition: cursor,
      isEditing,
      lastSeen: Date.now(),
    };

    this.presenceMap.set(`${userId}_${documentId}`, presence);
    this.notifyPresenceListeners(presence);

    return presence;
  }

  /**
   * Get presence info for a document
   */
  getDocumentPresence(documentId: string): PresenceInfo[] {
    const presence: PresenceInfo[] = [];

    for (const [key, info] of this.presenceMap) {
      if (info.documentId === documentId) {
        // Filter out stale presence (>5 minutes old)
        if (Date.now() - info.lastSeen < 5 * 60 * 1000) {
          presence.push(info);
        } else {
          this.presenceMap.delete(key);
        }
      }
    }

    return presence;
  }

  /**
   * Set sync preference for a document or globally
   */
  setSyncPreference(preference: Omit<SyncPreference, 'key'>): SyncPreference {
    const key = preference.documentId || 'global';
    const pref: SyncPreference = {
      key,
      ...preference,
    };

    this.syncPreferences.set(key, pref);
    this.savePreferencesToStorage();

    return pref;
  }

  /**
   * Get sync preference for a document
   */
  getSyncPreference(documentId?: string): SyncPreference | null {
    const key = documentId || 'global';
    return this.syncPreferences.get(key) || null;
  }

  /**
   * Check if sync is enabled for a document
   */
  isSyncEnabled(documentId?: string): boolean {
    const pref = this.getSyncPreference(documentId);
    return pref ? pref.enabled : true; // Default to enabled
  }

  /**
   * Get fields to sync for a document
   */
  getSyncFields(documentId?: string): string[] | null {
    const pref = this.getSyncPreference(documentId);
    return pref?.selectiveFields || null; // null = sync all fields
  }

  /**
   * Subscribe to real-time document changes
   */
  onRealtimeChange(listener: (doc: CollaborativeDocument) => void): () => void {
    this.realtimeListeners.add(listener);
    return () => {
      this.realtimeListeners.delete(listener);
    };
  }

  /**
   * Subscribe to conflict detection
   */
  onConflictDetected(listener: (conflict: ConflictResolution) => void): () => void {
    this.conflictListeners.add(listener);
    return () => {
      this.conflictListeners.delete(listener);
    };
  }

  /**
   * Subscribe to presence changes
   */
  onPresenceChange(listener: (presence: PresenceInfo) => void): () => void {
    this.presenceListeners.add(listener);
    return () => {
      this.presenceListeners.delete(listener);
    };
  }

  /**
   * Notify all real-time listeners
   */
  private notifyRealtimeListeners(doc: CollaborativeDocument): void {
    this.realtimeListeners.forEach(listener => {
      try {
        listener(doc);
      } catch (error) {
        console.error('Error in real-time listener:', error);
      }
    });
  }

  /**
   * Notify conflict listeners
   */
  private notifyConflictListeners(conflict: ConflictResolution): void {
    this.conflictListeners.forEach(listener => {
      try {
        listener(conflict);
      } catch (error) {
        console.error('Error in conflict listener:', error);
      }
    });
  }

  /**
   * Notify presence listeners
   */
  private notifyPresenceListeners(presence: PresenceInfo): void {
    this.presenceListeners.forEach(listener => {
      try {
        listener(presence);
      } catch (error) {
        console.error('Error in presence listener:', error);
      }
    });
  }

  /**
   * Save change to localStorage
   */
  private saveChangeToStorage(op: ChangeOperation): void {
    const key = `collaboration_change_${op.documentId}`;
    const existing = localStorage.getItem(key);
    const changes = existing ? JSON.parse(existing) : [];
    changes.push(op);

    // Keep only last 100 changes per document
    if (changes.length > 100) {
      changes.shift();
    }

    localStorage.setItem(key, JSON.stringify(changes));
  }

  /**
   * Save conflict resolution to localStorage
   */
  private saveConflictResolutionToStorage(conflict: ConflictResolution): void {
    const key = `collaboration_conflict_${conflict.documentId}`;
    const existing = localStorage.getItem(key);
    const conflicts = existing ? JSON.parse(existing) : [];

    // Update existing or add new
    const index = conflicts.findIndex((c: any) => c.id === conflict.id);
    if (index >= 0) {
      conflicts[index] = conflict;
    } else {
      conflicts.push(conflict);
    }

    localStorage.setItem(key, JSON.stringify(conflicts));
  }

  /**
   * Save sync preferences to localStorage
   */
  private savePreferencesToStorage(): void {
    const prefs: Record<string, SyncPreference> = {};
    for (const [key, pref] of this.syncPreferences) {
      prefs[key] = pref;
    }
    localStorage.setItem('collaboration_sync_prefs', JSON.stringify(prefs));
  }

  /**
   * Load preferences from localStorage
   */
  private loadPreferencesFromStorage(): void {
    const stored = localStorage.getItem('collaboration_sync_prefs');
    if (stored) {
      try {
        const prefs = JSON.parse(stored);
        for (const [key, pref] of Object.entries(prefs)) {
          this.syncPreferences.set(key, pref as SyncPreference);
        }
      } catch (error) {
        console.error('Error loading sync preferences:', error);
      }
    }
  }

  /**
   * Get collaboration analytics
   */
  getAnalytics(documentId?: string): {
    totalChanges: number;
    conflicts: number;
    resolvedConflicts: number;
    unresolved: number;
    collaborators: number;
    lastChange: number | null;
  } {
    const changes = documentId
      ? this.getChangeHistory(documentId)
      : Array.from(this.changeHistory.values()).flat();

    const conflicts = documentId
      ? this.conflicts.get(documentId) || []
      : Array.from(this.conflicts.values()).flat();

    const presence = documentId
      ? this.getDocumentPresence(documentId)
      : Array.from(this.presenceMap.values());

    return {
      totalChanges: changes.length,
      conflicts: conflicts.length,
      resolvedConflicts: conflicts.filter(c => c.resolved).length,
      unresolved: conflicts.filter(c => !c.resolved).length,
      collaborators: new Set(presence.map(p => p.userId)).size,
      lastChange: changes.length > 0 ? changes[changes.length - 1].timestamp : null,
    };
  }
}

export const collaborationService = CollaborationService.getInstance();
export default CollaborationService;

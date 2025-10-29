/**
 * Migration Service - localStorage to Dexie Migration Utility
 * 
 * Handles migration of existing localStorage profiles to Dexie database.
 * Supports:
 * - Detection of existing localStorage data
 * - Validation of legacy data format
 * - Transformation to new format with PIN hashing
 * - Batch migration with progress tracking
 * - Rollback on error
 * 
 * Phase 2 Day 2: Migration Infrastructure
 */

import { v4 as uuidv4 } from 'uuid';
import { db } from '../db/profiles.db';
import { hashPin } from '../security/pinEncryption';
import type {
  ILocalProfile,
  ILocalAccount,
  ITaskStatus,
} from '../db/profileTypes';

/**
 * Legacy localStorage profile format (Phase 1)
 */
interface ILegacyProfile {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  pin?: string; // Plaintext PIN (Phase 1)
  password?: string;
  createdAt?: number;
  accountType: string;
}

/**
 * Migration result for a single profile
 */
export interface IMigrationResult {
  success: boolean;
  profileId: string;
  error?: string;
  migratedAt: number;
}

/**
 * Migration statistics
 */
export interface IMigrationStats {
  total: number;
  succeeded: number;
  failed: number;
  startedAt: number;
  completedAt?: number;
  duration?: number;
}

/**
 * Detect if localStorage profiles exist
 * 
 * @returns Object with guestProfile and other profile keys found
 */
export function detectLocalStorageProfiles(): {
  hasLegacyData: boolean;
  profiles: ILegacyProfile[];
  rawKeys: string[];
} {
  try {
    const allKeys = Object.keys(localStorage);
    const profileKeys = allKeys.filter(
      (key) =>
        key.startsWith('guest_') ||
        key === 'guestProfile' ||
        key === 'currentProfile'
    );

    const profiles: ILegacyProfile[] = [];

    // Check for main guest profile
    const guestProfileStr = localStorage.getItem('guestProfile');
    if (guestProfileStr) {
      try {
        const parsed = JSON.parse(guestProfileStr);
        profiles.push(parsed);
      } catch (err) {
        console.error('Failed to parse guestProfile:', err);
      }
    }

    // Check for other profiles
    for (const key of profileKeys) {
      if (key !== 'guestProfile') {
        try {
          const data = localStorage.getItem(key);
          if (data) {
            const parsed = JSON.parse(data);
            profiles.push(parsed);
          }
        } catch (err) {
          console.error(`Failed to parse ${key}:`, err);
        }
      }
    }

    return {
      hasLegacyData: profiles.length > 0,
      profiles,
      rawKeys: profileKeys,
    };
  } catch (error) {
    console.error('Error detecting localStorage profiles:', error);
    return {
      hasLegacyData: false,
      profiles: [],
      rawKeys: [],
    };
  }
}

/**
 * Validate legacy profile format
 * 
 * @param profile - Profile to validate
 * @returns Validation result
 */
export function validateLegacyProfile(
  profile: unknown
): {
  isValid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  if (!profile || typeof profile !== 'object') {
    errors.push('Profile must be an object');
    return { isValid: false, errors };
  }

  const p = profile as Record<string, any>;

  if (!p.name || typeof p.name !== 'string') {
    errors.push('Profile must have a name');
  }

  if (!p.id && !p.email) {
    errors.push('Profile must have either id or email');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Transform legacy profile to new format with PIN hashing
 * 
 * @param legacy - Legacy profile from localStorage
 * @returns New profile in ILocalProfile format
 */
export function transformLegacyProfile(
  legacy: ILegacyProfile
): ILocalProfile {
  const profileId = uuidv4();
  const accountId = uuidv4();
  const now = Date.now();

  // Create account with PIN hashing if PIN exists
  const account: ILocalAccount = {
    id: accountId,
    type: 'local',
    name: legacy.name,
    email: legacy.email,
    phone: legacy.phone,
    createdAt: legacy.createdAt || now,
    updatedAt: now,
  };

  // Hash PIN if it exists (from Phase 1 plaintext)
  if (legacy.pin) {
    const { hash, salt } = hashPin(legacy.pin);
    account.pin = {
      salt,
      hash,
      iterations: 1000,
      algorithm: 'PBKDF2-SHA256',
      createdAt: now,
      updatedAt: now,
    };
  }

  // Create profile
  const profile: ILocalProfile = {
    id: profileId,
    account,
    profile: {},
    tasks: [], // Will be populated with default tasks
    trustScore: {
      total: 0,
      breakdown: {
        tasks: 0,
        verification: 0,
        security: 0,
      },
      level: 'minimal',
      completedTasks: 0,
      lastUpdated: now,
    },
    createdAt: legacy.createdAt || now,
    updatedAt: now,
    lastAccessedAt: now,
  };

  return profile;
}

/**
 * Migrate a single profile from localStorage to Dexie
 * 
 * @param legacy - Legacy profile to migrate
 * @returns Migration result
 */
export async function migrateProfile(
  legacy: ILegacyProfile
): Promise<IMigrationResult> {
  const migratedAt = Date.now();

  try {
    // Validate
    const validation = validateLegacyProfile(legacy);
    if (!validation.isValid) {
      throw new Error(`Validation failed: ${validation.errors.join(', ')}`);
    }

    // Transform
    const newProfile = transformLegacyProfile(legacy);

    // Get default tasks from Dexie
    const defaultTasks = await db.taskDefinitions.toArray();

    // Create task statuses for profile
    const taskStatuses: ITaskStatus[] = defaultTasks.map((task) => ({
      taskId: task.id,
      profileId: newProfile.id,
      isCompleted: false,
      isVerified: false,
    }));

    newProfile.tasks = taskStatuses;

    // Save to Dexie (transaction)
    await db.transaction('rw', db.profiles, db.accounts, db.tasks, async () => {
      await db.profiles.add(newProfile);
      await db.accounts.add(newProfile.account);
      await db.tasks.bulkAdd(taskStatuses);
    });

    console.log('✅ Migrated profile:', newProfile.id);

    return {
      success: true,
      profileId: newProfile.id,
      migratedAt,
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('❌ Migration failed:', message);

    return {
      success: false,
      profileId: legacy.id || 'unknown',
      error: message,
      migratedAt,
    };
  }
}

/**
 * Migrate all legacy profiles at once
 * 
 * @returns Migration statistics
 */
export async function migrateAllProfiles(): Promise<IMigrationStats> {
  const startedAt = Date.now();
  const stats: IMigrationStats = {
    total: 0,
    succeeded: 0,
    failed: 0,
    startedAt,
  };

  try {
    // Detect
    const detected = detectLocalStorageProfiles();

    if (!detected.hasLegacyData) {
      console.log('ℹ️ No legacy profiles found');
      stats.completedAt = Date.now();
      stats.duration = stats.completedAt - startedAt;
      return stats;
    }

    stats.total = detected.profiles.length;
    console.log(`🔄 Migrating ${stats.total} profile(s)...`);

    // Migrate each profile
    for (const legacy of detected.profiles) {
      const result = await migrateProfile(legacy);

      if (result.success) {
        stats.succeeded++;
        console.log(`✅ [${stats.succeeded}/${stats.total}] Migrated successfully`);
      } else {
        stats.failed++;
        console.error(`❌ [${stats.failed}] Migration failed:`, result.error);
      }
    }

    stats.completedAt = Date.now();
    stats.duration = stats.completedAt - startedAt;

    console.log(
      `\n📊 Migration Complete: ${stats.succeeded}/${stats.total} successful in ${stats.duration}ms`
    );

    return stats;
  } catch (error) {
    console.error('Fatal migration error:', error);
    stats.completedAt = Date.now();
    stats.duration = stats.completedAt - startedAt;
    throw error;
  }
}

/**
 * Backup localStorage before migration
 * 
 * @returns Backup JSON string
 */
export function backupLocalStorage(): string {
  try {
    const detected = detectLocalStorageProfiles();
    const backup = {
      timestamp: Date.now(),
      profiles: detected.profiles,
      rawKeys: detected.rawKeys,
    };

    return JSON.stringify(backup, null, 2);
  } catch (error) {
    console.error('Backup error:', error);
    throw error;
  }
}

/**
 * Clear localStorage profiles after successful migration
 * 
 * @param confirmed - Must be explicitly confirmed to prevent accidental deletion
 */
export function clearMigratedProfiles(confirmed: boolean = false): void {
  if (!confirmed) {
    throw new Error('clearMigratedProfiles requires explicit confirmation');
  }

  try {
    const detected = detectLocalStorageProfiles();

    for (const key of detected.rawKeys) {
      localStorage.removeItem(key);
      console.log(`🗑️ Removed: ${key}`);
    }

    console.log(`✅ Cleared ${detected.rawKeys.length} localStorage entries`);
  } catch (error) {
    console.error('Error clearing localStorage:', error);
    throw error;
  }
}

/**
 * Get migration statistics
 */
export async function getMigrationStats(): Promise<{
  localStorage: number;
  dexie: number;
  needsMigration: boolean;
}> {
  try {
    const detected = detectLocalStorageProfiles();
    const dexieCount = await db.profiles.count();

    return {
      localStorage: detected.profiles.length,
      dexie: dexieCount,
      needsMigration: detected.hasLegacyData && dexieCount === 0,
    };
  } catch (error) {
    console.error('Error getting migration stats:', error);
    return {
      localStorage: 0,
      dexie: 0,
      needsMigration: false,
    };
  }
}

/**
 * Export migration utilities
 */
export const MigrationService = {
  detectLocalStorageProfiles,
  validateLegacyProfile,
  transformLegacyProfile,
  migrateProfile,
  migrateAllProfiles,
  backupLocalStorage,
  clearMigratedProfiles,
  getMigrationStats,
};

export default MigrationService;

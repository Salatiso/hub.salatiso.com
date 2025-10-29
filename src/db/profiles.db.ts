/**
 * Dexie Database Schema for LifeSync Local-First Profile Management
 * 
 * This module initializes the Dexie database with all necessary tables,
 * indices, and relationships. Dexie provides a type-safe wrapper around
 * IndexedDB for easy local data persistence.
 * 
 * Phase 2 Day 1: Database Initialization
 */

import Dexie, { Table } from 'dexie';
import type {
  ILocalProfile,
  ILocalAccount,
  ITaskStatus,
  ITask,
  IMigrationRecord,
} from './profileTypes';

/**
 * LifeSyncDB - Main Dexie database instance
 * 
 * Tables:
 * - profiles: Main profile documents with all user data
 * - accounts: Local account information (denormalized for quick lookup)
 * - tasks: Task status tracking for each profile
 * - taskDefinitions: Reference data for available tasks
 * - migrations: Track database migrations for version control
 */
export class LifeSyncDB extends Dexie {
  profiles!: Table<ILocalProfile>;
  accounts!: Table<ILocalAccount>;
  tasks!: Table<ITaskStatus>;
  taskDefinitions!: Table<ITask>;
  migrations!: Table<IMigrationRecord>;

  constructor() {
    super('LifeSyncDB');

    this.version(1).stores({
      // Primary key and indices for each table
      profiles: '++id, account.id, createdAt, updatedAt',
      accounts: '++id, email, phone, name',
      tasks: '++id, profileId, taskId, isCompleted, completedAt',
      taskDefinitions: '++id, category, isRequired',
      migrations: '++id, version, status',
    });

    // Set up hooks for data integrity
    this.setupHooks();
  }

  /**
   * Setup database hooks for automatic timestamp updates
   */
  private setupHooks(): void {
    // Before creating a profile, set timestamps
    this.profiles.hook('creating', (primKey, obj) => {
      obj.createdAt = Date.now();
      obj.updatedAt = Date.now();
      obj.lastAccessedAt = Date.now();
    });

    // Before updating a profile, update the updatedAt timestamp
    this.profiles.hook('updating', (changes) => {
      (changes as Partial<ILocalProfile>).updatedAt = Date.now();
    });

    // Before creating a task, set timestamps
    this.tasks.hook('creating', (primKey, obj) => {
      if (!obj.completedAt) {
        obj.completedAt = undefined;
      }
    });
  }

  /**
   * Initialize database with default tasks and perform migrations
   * Call this once on app startup
   */
  async initializeDatabase(): Promise<void> {
    try {
      // Check if this is a fresh database
      const profileCount = await this.profiles.count();
      
      if (profileCount === 0) {
        // Fresh database - seed default tasks
        await this.seedDefaultTasks();
        console.log('✅ Database initialized with default tasks');
      }

      // Run any pending migrations
      await this.runMigrations();
    } catch (error) {
      console.error('❌ Database initialization error:', error);
      throw error;
    }
  }

  /**
   * Seed default task definitions into database
   */
  private async seedDefaultTasks(): Promise<void> {
    const defaultTasks: ITask[] = [
      {
        id: 'contact-info',
        title: 'Contact Information',
        description: 'Add your phone number and address',
        category: 'contact',
        trustPoints: 12,
        isRequired: false,
        isVerified: false,
        icon: 'MapPin',
      },
      {
        id: 'email-verification',
        title: 'Verify Email',
        description: 'Confirm your email address',
        category: 'verification',
        trustPoints: 15,
        isRequired: true,
        isVerified: true,
        icon: 'Mail',
      },
      {
        id: 'phone-verification',
        title: 'Verify Phone',
        description: 'Confirm your phone number via SMS',
        category: 'verification',
        trustPoints: 15,
        isRequired: false,
        isVerified: true,
        icon: 'Phone',
      },
      {
        id: 'id-upload',
        title: 'Upload ID',
        description: 'Upload a government-issued ID for verification',
        category: 'identity',
        trustPoints: 20,
        isRequired: false,
        isVerified: true,
        icon: 'FileCheck',
      },
      {
        id: 'address-confirmation',
        title: 'Confirm Address',
        description: 'Verify your residential address',
        category: 'identity',
        trustPoints: 12,
        isRequired: false,
        isVerified: true,
        icon: 'Home',
      },
      {
        id: 'services-registration',
        title: 'Register Services',
        description: 'Register for additional LifeSync services',
        category: 'services',
        trustPoints: 10,
        isRequired: false,
        isVerified: false,
        icon: 'Zap',
      },
      {
        id: 'security-upgrade',
        title: 'Enable 2FA',
        description: 'Set up two-factor authentication',
        category: 'security',
        trustPoints: 14,
        isRequired: false,
        isVerified: false,
        icon: 'Lock',
      },
      {
        id: 'life-cv',
        title: 'Complete Life CV',
        description: 'Build your professional profile and CV',
        category: 'security',
        trustPoints: 12,
        isRequired: false,
        isVerified: false,
        icon: 'FileText',
      },
    ];

    await this.taskDefinitions.bulkAdd(defaultTasks);
    console.log('✅ Seeded 8 default tasks');
  }

  /**
   * Run any pending database migrations
   * This allows for schema evolution as the app grows
   */
  private async runMigrations(): Promise<void> {
    try {
      const dbVersion = this.verno || 1;
      
      // Record migration check
      const lastMigration = await this.migrations
        .orderBy('createdAt')
        .last();

      if (!lastMigration || lastMigration.version !== `${dbVersion}`) {
        // Would add version-specific migrations here in the future
        const migration: IMigrationRecord = {
          id: `migration-${Date.now()}`,
          version: `${dbVersion}`,
          migrationType: 'schema',
          status: 'completed',
          startedAt: Date.now(),
          completedAt: Date.now(),
        };

        await this.migrations.add(migration);
        console.log(`✅ Migration to v${dbVersion} completed`);
      }
    } catch (error) {
      console.error('❌ Migration error:', error);
      // Don't throw - migrations are not critical
    }
  }

  /**
   * Clear all data from the database (for testing/reset)
   * WARNING: This is destructive and cannot be undone
   */
  async clear(): Promise<void> {
    try {
      await this.profiles.clear();
      await this.accounts.clear();
      await this.tasks.clear();
      // Don't clear taskDefinitions or migrations
      console.log('✅ All profiles and task data cleared');
    } catch (error) {
      console.error('❌ Error clearing database:', error);
      throw error;
    }
  }

  /**
   * Get database statistics for debugging
   */
  async getStatistics(): Promise<{
    profiles: number;
    accounts: number;
    tasks: number;
    tasks_completed: number;
    task_definitions: number;
  }> {
    return {
      profiles: await this.profiles.count(),
      accounts: await this.accounts.count(),
      tasks: await this.tasks.count(),
      tasks_completed: await this.tasks.where('isCompleted').equals(true as unknown as number).count(),
      task_definitions: await this.taskDefinitions.count(),
    };
  }
}

/**
 * Singleton instance of LifeSyncDB
 * Use this throughout the app instead of creating multiple instances
 */
export const db = new LifeSyncDB();

/**
 * Initialize the database on app startup
 * Call this in your main App.tsx or index.tsx
 */
export async function initializeLifeSyncDB(): Promise<void> {
  try {
    await db.initializeDatabase();
    const stats = await db.getStatistics();
    console.log('📊 Database Statistics:', stats);
  } catch (error) {
    console.error('Fatal database error:', error);
    throw error;
  }
}

export default db;

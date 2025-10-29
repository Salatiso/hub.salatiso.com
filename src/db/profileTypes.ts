/**
 * Profile Type Definitions for LifeSync Local-First Architecture
 * 
 * Defines all TypeScript interfaces for profile management, task tracking,
 * and trust score calculation in the Dexie local database.
 * 
 * Phase 2 Day 1: Database Schema Foundation
 */

/**
 * Task Definition - Maps to one of 8 profile completion tasks
 */
export interface ITask {
  id: string;                    // Unique task ID (e.g., "contact-info")
  title: string;                 // Display title (e.g., "Contact Information")
  description: string;           // Short description of what to do
  category: TaskCategory;        // Category for grouping
  trustPoints: number;           // Points awarded on completion (0-100)
  isRequired: boolean;           // Must complete for full profile
  isVerified: boolean;           // Needs verification (not just data)
  icon: string;                  // Icon name for display
}

/**
 * Task Category - Organizes tasks by purpose
 */
export type TaskCategory = 
  | 'contact'       // Contact Info, Email, Phone
  | 'identity'      // ID Upload, Address
  | 'services'      // Services Registration
  | 'security'      // Security Upgrade, Life CV
  | 'verification'; // Email/Phone Verification

/**
 * Task Status - Current state of a task for a user
 */
export interface ITaskStatus {
  id?: string;                   // Database primary key (auto-generated)
  taskId: string;                // Reference to task definition
  profileId: string;             // Reference to user's profile
  isCompleted: boolean;          // Task marked done
  isVerified: boolean;           // Task verified by system/user
  completedAt?: number;          // Timestamp of completion
  verifiedAt?: number;           // Timestamp of verification
  data?: Record<string, any>;    // Task-specific data (contact, ID, etc)
}

/**
 * PIN Configuration - Security settings for local account
 */
export interface IPinConfig {
  salt: string;                  // Random salt for PBKDF2
  hash: string;                  // PBKDF2 hash of PIN
  iterations: number;            // PBKDF2 iterations (1000)
  algorithm: string;             // Algorithm used ("PBKDF2-SHA256")
  createdAt: number;             // When PIN was created
  updatedAt: number;             // When PIN was last updated
}

/**
 * Local Account - User's local account without cloud auth
 */
export interface ILocalAccount {
  id: string;                    // Unique account ID (UUID v4)
  type: 'local' | 'oauth';       // Account type
  name: string;                  // User's display name
  email?: string;                // User's email (optional for local)
  phone?: string;                // User's phone (optional)
  pin?: IPinConfig;              // PIN configuration (local auth only)
  hasPasswordAuth?: boolean;     // Whether password auth is enabled
  passwordHash?: string;         // Optional password hash (PBKDF2-SHA256)
  passwordSalt?: string;         // Optional password salt
  createdAt: number;             // Account creation timestamp
  updatedAt: number;             // Last update timestamp
}

/**
 * Trust Score Calculation - Breakdown of trust points earned
 */
export interface ITrustScore {
  total: number;                 // Total score (0-100)
  breakdown: {
    tasks: number;               // Points from completed tasks
    verification: number;        // Points from verified data
    security: number;            // Points from security measures (PIN, etc)
  };
  level: 'minimal' | 'basic' | 'verified' | 'trusted'; // Trust level
  completedTasks: number;        // How many tasks completed (0-8)
  lastUpdated: number;           // Last calculation timestamp
}

/**
 * Local Profile - Complete user profile stored in Dexie
 */
export interface ILocalProfile {
  // Primary identifier
  id: string;                    // Unique profile ID (UUID v4)
  
  // Account info
  account: ILocalAccount;        // Local account details
  
  // Profile data (progressively populated)
  profile: {
    contactInfo?: {
      phone?: string;
      address?: string;
      city?: string;
      state?: string;
      zipCode?: string;
      country?: string;
    };
    identity?: {
      idType?: string;           // passport, driver-license, etc
      idNumber?: string;
      firstName?: string;
      lastName?: string;
      dateOfBirth?: string;
      gender?: string;
      idImageUrl?: string;
    };
    services?: {
      registeredServices: string[]; // List of service registrations
    };
    security?: {
      hasPinAuth: boolean;
      hasPasswordAuth: boolean;
      lastPasswordChange?: number;
      twoFactorEnabled?: boolean;
    };
    cv?: {
      summary?: string;
      skills?: string[];
      experience?: Array<{
        title: string;
        company: string;
        duration: string;
      }>;
    };
  };

  // Task tracking
  tasks: ITaskStatus[];          // Array of task statuses
  
  // Trust & verification
  trustScore: ITrustScore;       // Calculated trust score
  
  // Timestamps & metadata
  createdAt: number;             // Profile creation timestamp
  updatedAt: number;             // Last update timestamp
  lastAccessedAt: number;        // Last access timestamp
  
  // Sync metadata (for Phase 2.5)
  syncStatus?: 'pending' | 'synced' | 'conflict'; // Sync state
  lastSyncedAt?: number;         // Last cloud sync timestamp
  cloudProfileId?: string;       // Reference to cloud profile (if synced)
}

/**
 * Profile Export - JSON format for backup/export
 */
export interface IProfileExport {
  version: string;               // Export format version (1.0)
  exportedAt: number;            // Export timestamp
  profile: ILocalProfile;        // Complete profile data
}

/**
 * Database Statistics - For debugging and optimization
 */
export interface IDbStats {
  profileCount: number;          // Total profiles in database
  taskCount: number;             // Total task statuses
  lastBackup?: number;           // Last backup timestamp
  databaseSize?: number;         // Approximate size in bytes
}

/**
 * Migration Record - Track database migrations
 */
export interface IMigrationRecord {
  id: string;                    // Unique migration ID
  version: string;               // Target version (1.0, 1.1, etc)
  migrationType: 'schema' | 'data' | 'index'; // Type of migration
  status: 'pending' | 'running' | 'completed' | 'failed'; // Status
  startedAt: number;             // When migration started
  completedAt?: number;          // When migration completed
  error?: string;                // Error message if failed
}

/**
 * Auth State - Current authentication state
 */
export interface IAuthState {
  isAuthenticated: boolean;      // Currently logged in
  accountId?: string;            // Current account ID
  profileId?: string;            // Current profile ID
  authMethod?: 'local' | 'oauth'; // How user authenticated
  lastAuthAt?: number;           // Last authentication timestamp
}

/**
 * Dashboard Widget Data - For dashboard display
 */
export interface IDashboardWidget {
  profileName: string;           // User's name
  trustScore: ITrustScore;       // Current trust score
  completedTasks: number;        // Tasks completed
  pendingTasks: number;          // Tasks remaining
  lastUpdated: number;           // Last profile update
  nextRecommendedTask?: string;  // Suggested next task
}

// All types are already exported above

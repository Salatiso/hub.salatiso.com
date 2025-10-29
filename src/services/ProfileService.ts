/**
 * ProfileService - Database CRUD Wrapper
 * 
 * Provides a service layer for profile operations with:
 * - Error handling and logging
 * - Consistent interface across app
 * - Batch operations support
 * - Query builders
 * - Statistics and reporting
 * 
 * Phase 2 Day 2: Service Layer
 */

import { db } from '../db/profiles.db';
import type {
  ILocalProfile,
  ILocalAccount,
  ITaskStatus,
  ITrustScore,
} from '../db/profileTypes';

/**
 * ProfileService - Main service for profile operations
 */
class ProfileService {
  /**
   * Create a new profile
   */
  async createProfile(profile: ILocalProfile): Promise<string> {
    try {
      const id = await db.profiles.add(profile);
      await db.accounts.add(profile.account);

      // Add default tasks
      const taskStatuses: ITaskStatus[] = [];
      const defaultTasks = await db.taskDefinitions.toArray();

      for (const task of defaultTasks) {
        taskStatuses.push({
          taskId: task.id,
          profileId: profile.id,
          isCompleted: false,
          isVerified: false,
        });
      }

      await db.tasks.bulkAdd(taskStatuses);

      console.log('✅ Profile created:', id);
      return id as string;
    } catch (error) {
      console.error('❌ Error creating profile:', error);
      throw error;
    }
  }

  /**
   * Get profile by ID
   */
  async getProfile(profileId: string): Promise<ILocalProfile | undefined> {
    try {
      const profile = await db.profiles.get(profileId);

      if (profile) {
        // Load associated tasks
        const tasks = await db.tasks
          .where('profileId')
          .equals(profileId)
          .toArray();

        profile.tasks = tasks;
      }

      return profile;
    } catch (error) {
      console.error('❌ Error getting profile:', error);
      throw error;
    }
  }

  /**
   * Get all profiles
   */
  async getAllProfiles(): Promise<ILocalProfile[]> {
    try {
      const profiles = await db.profiles.toArray();

      // Load tasks for each profile
      for (const profile of profiles) {
        const tasks = await db.tasks
          .where('profileId')
          .equals(profile.id)
          .toArray();

        profile.tasks = tasks;
      }

      return profiles;
    } catch (error) {
      console.error('❌ Error getting all profiles:', error);
      throw error;
    }
  }

  /**
   * Get profile by email
   */
  async getProfileByEmail(email: string): Promise<ILocalProfile | undefined> {
    try {
      const account = await db.accounts.where('email').equals(email).first();

      if (!account) {
        return undefined;
      }

      return this.getProfile(account.id);
    } catch (error) {
      console.error('❌ Error getting profile by email:', error);
      throw error;
    }
  }

  /**
   * Update profile
   */
  async updateProfile(profile: ILocalProfile): Promise<void> {
    try {
      profile.updatedAt = Date.now();

      await db.transaction('rw', db.profiles, db.accounts, db.tasks, async () => {
        // Use put() instead of update() for full replacement
        await db.profiles.put(profile);
        await db.accounts.put(profile.account);

        // Update tasks
        for (const task of profile.tasks) {
          if (task.id) {
            await db.tasks.put(task);
          }
        }
      });

      console.log('✅ Profile updated:', profile.id);
    } catch (error) {
      console.error('❌ Error updating profile:', error);
      throw error;
    }
  }

  /**
   * Delete profile
   */
  async deleteProfile(profileId: string): Promise<void> {
    try {
      await db.transaction('rw', db.profiles, db.accounts, db.tasks, async () => {
        // Get profile first to access account
        const profile = await db.profiles.get(profileId);

        if (profile) {
          // Delete account
          await db.accounts.delete(profile.account.id);
        }

        // Delete tasks
        await db.tasks.where('profileId').equals(profileId).delete();

        // Delete profile
        await db.profiles.delete(profileId);
      });

      console.log('✅ Profile deleted:', profileId);
    } catch (error) {
      console.error('❌ Error deleting profile:', error);
      throw error;
    }
  }

  /**
   * Update task status
   */
  async updateTaskStatus(taskStatus: ITaskStatus): Promise<void> {
    try {
      if (taskStatus.id) {
        await db.tasks.put(taskStatus);
      }

      // Recalculate trust score
      const profile = await this.getProfile(taskStatus.profileId);
      if (profile) {
        await this.updateProfile(profile);
      }

      console.log('✅ Task updated:', taskStatus.taskId);
    } catch (error) {
      console.error('❌ Error updating task:', error);
      throw error;
    }
  }

  /**
   * Complete task
   */
  async completeTask(profileId: string, taskId: string, data?: Record<string, any>): Promise<void> {
    try {
      const profile = await this.getProfile(profileId);

      if (!profile) {
        throw new Error('Profile not found');
      }

      const taskStatus = profile.tasks.find((t) => t.taskId === taskId);

      if (!taskStatus) {
        throw new Error('Task not found');
      }

      taskStatus.isCompleted = true;
      taskStatus.completedAt = Date.now();
      if (data) {
        taskStatus.data = data;
      }

      if (taskStatus.id) {
        await db.tasks.put(taskStatus);
      }

      // Recalculate trust score
      profile.tasks = profile.tasks.map((t) =>
        t.taskId === taskId ? taskStatus : t
      );

      // Update trust score
      profile.trustScore = this.calculateTrustScore(profile.tasks);
      profile.updatedAt = Date.now();

      await db.profiles.put(profile);

      console.log('✅ Task completed:', taskId);
    } catch (error) {
      console.error('❌ Error completing task:', error);
      throw error;
    }
  }

  /**
   * Calculate trust score from tasks
   */
  private calculateTrustScore(tasks: ITaskStatus[]): ITrustScore {
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
        security: 0,
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
   * Get profile statistics
   */
  async getProfileStats(): Promise<{
    total: number;
    recent: number;
    withTasks: number;
    highTrust: number;
  }> {
    try {
      const all = await db.profiles.toArray();
      const now = Date.now();
      const dayMs = 24 * 60 * 60 * 1000;

      const recent = all.filter((p) => now - p.lastAccessedAt < dayMs).length;
      const withTasks = all.filter((p) => p.tasks && p.tasks.length > 0).length;
      const highTrust = all.filter((p) => p.trustScore.total >= 60).length;

      return {
        total: all.length,
        recent,
        withTasks,
        highTrust,
      };
    } catch (error) {
      console.error('❌ Error getting stats:', error);
      throw error;
    }
  }

  /**
   * Search profiles
   */
  async searchProfiles(query: string): Promise<ILocalProfile[]> {
    try {
      const all = await this.getAllProfiles();

      const lowerQuery = query.toLowerCase();

      return all.filter(
        (p) =>
          p.account.name.toLowerCase().includes(lowerQuery) ||
          (p.account.email && p.account.email.toLowerCase().includes(lowerQuery)) ||
          (p.account.phone && p.account.phone.includes(query))
      );
    } catch (error) {
      console.error('❌ Error searching profiles:', error);
      throw error;
    }
  }

  /**
   * Export profiles as JSON
   */
  async exportProfiles(): Promise<string> {
    try {
      const profiles = await this.getAllProfiles();

      const export_data = {
        version: '1.0',
        exportedAt: Date.now(),
        profileCount: profiles.length,
        profiles,
      };

      return JSON.stringify(export_data, null, 2);
    } catch (error) {
      console.error('❌ Error exporting profiles:', error);
      throw error;
    }
  }

  /**
   * Clear all profiles (for testing/reset)
   */
  async clearAllProfiles(): Promise<void> {
    try {
      await db.clear();
      console.log('✅ All profiles cleared');
    } catch (error) {
      console.error('❌ Error clearing profiles:', error);
      throw error;
    }
  }
}

// Export singleton instance
export const profileService = new ProfileService();

export default profileService;
